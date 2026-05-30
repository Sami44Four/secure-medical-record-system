from flask import request, jsonify
from backend.logs import add_log
from backend.db import get_db_connection

def format_record(record):
    return {
        "id": record["id"],
        "patientId": record["patient_id"] if "patient_id" in record.keys() else "PAT-UNKNOWN",
        "patient": record["patient_name"],
        "dob": record["dob"] if "dob" in record.keys() else "Not provided",
        "gender": record["gender"] if "gender" in record.keys() else "Not provided",
        "type": record["record_type"],
        "diagnosis": record["diagnosis"] if "diagnosis" in record.keys() else "Not provided",
        "medication": record["medication"] if "medication" in record.keys() else "Not provided",
        "allergies": record["allergies"] if "allergies" in record.keys() else "Not provided",
        "vitals": record["vitals"] if "vitals" in record.keys() else "Not provided",
        "doctorAssigned": record["doctor_assigned"] if "doctor_assigned" in record.keys() else "Not assigned",
        "visitDate": record["visit_date"] if "visit_date" in record.keys() else record["created_at"],
        "createdDate": record["created_at"],
        "requiredRole": record["access_level"],
        "status": record["access_level"].capitalize(),
        "labStatus": record["lab_status"] if "lab_status" in record.keys() else "Pending",
        "summary": record["summary"] if "summary" in record.keys() else "No clinical summary available.",
        "notes": record["doctor_notes"] if "doctor_notes" in record.keys() else "No provider notes available."
    }

def get_records():
    role = request.headers.get("Role")
    username = request.headers.get("Username", "unknown")

    conn = get_db_connection()

    if role == "doctor":
        records = conn.execute("""
            SELECT * FROM medical_records
        """).fetchall()

    elif role == "nurse":
        records = conn.execute("""
            SELECT * FROM medical_records
            WHERE access_level = 'nurse'
        """).fetchall()

    elif role == "admin":
        records = conn.execute("""
            SELECT * FROM medical_records
        """).fetchall()

        add_log(
            username,
            "Admin accessed patient demographic/result status view",
            "Warning"
        )

        formatted = []
        for record in records:
            item = format_record(record)
            item["diagnosis"] = "Hidden from admin/front desk role"
            item["medication"] = "Hidden from admin/front desk role"
            item["notes"] = "Clinical notes hidden. Admin can only verify demographics, appointments, and result status."
            item["summary"] = "Basic demographic and result-status view only."
            formatted.append(item)

        conn.close()
        return jsonify(formatted)

    elif role == "patient":
        user = conn.execute("""
            SELECT full_name FROM users WHERE username = ?
        """, (username,)).fetchone()

        if not user:
            conn.close()
            add_log(username, "Patient record lookup failed", "Denied")
            return jsonify({"message": "Patient not found"}), 404

        records = conn.execute("""
            SELECT * FROM medical_records
            WHERE patient_name = ?
        """, (user["full_name"],)).fetchall()

    else:
        conn.close()
        add_log(username, "Unauthorized role attempted record access", "Denied")
        return jsonify({"message": "Unauthorized role"}), 403

    formatted_records = [format_record(record) for record in records]

    conn.close()

    add_log(username, f"Fetched records for role: {role}", "Success")

    return jsonify(formatted_records)