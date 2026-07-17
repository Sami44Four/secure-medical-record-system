from flask import request, jsonify

from backend.logs import add_log
from backend.db import get_db_connection
from backend.permissions import has_permission, normalize_role


# Convert a database record into API response format
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


def mask_clinical_information(record):
    """
    Return a limited version of a medical record for administrative users.

    Administrative users may need demographic, appointment, or result-status information,
    but they should not automatically receive access to detailed clinical notes,
    diagnoses, or medication information.
    """
    item = format_record(record)

    item["diagnosis"] = "Hidden from administrative role"
    item["medication"] = "Hidden from administrative role"
    item["notes"] = "Clinical notes hidden. Administrative users can only verify demographics, appointments, and result status."
    item["summary"] = "Basic demographic and result-status view only."

    return item


def deny_record_access(username, reason):
    """
    Log and return a denied access response.
    """
    add_log(username, reason, "Denied")
    return jsonify({"message": "Access denied"}), 403


# Retrieve records based on the user's permissions
def get_records():
    role = request.headers.get("Role")
    username = request.headers.get("Username", "unknown")
    normalized_role = normalize_role(role)

    if not normalized_role:
        return deny_record_access(username, "Missing role attempted record access")

    conn = get_db_connection()

    try:
        # Patients can only view their own records
        if has_permission(normalized_role, "view_own_records"):
            user = conn.execute("""
                SELECT full_name FROM users WHERE username = ?
            """, (username,)).fetchone()

            if not user:
                add_log(username, "Patient record lookup failed", "Denied")
                return jsonify({"message": "Patient not found"}), 404

            records = conn.execute("""
                SELECT * FROM medical_records
                WHERE patient_name = ?
            """, (user["full_name"],)).fetchall()

            formatted_records = [format_record(record) for record in records]

            add_log(
                username,
                "Patient accessed own medical records",
                "Success"
            )

            return jsonify(formatted_records)

        # Clinical users can view authorized records.
        # NOTE: Patient assignment checks will be added in a later issue.
        if has_permission(normalized_role, "view_assigned_records"):
            if normalized_role == "registered_nurse":
                records = conn.execute("""
                    SELECT * FROM medical_records
                    WHERE access_level = 'nurse'
                """).fetchall()

                add_log(
                    username,
                    "Registered nurse accessed nurse-level medical records",
                    "Success"
                )

            else:
                records = conn.execute("""
                    SELECT * FROM medical_records
                """).fetchall()

                add_log(
                    username,
                    f"{normalized_role} accessed clinical medical records",
                    "Success"
                )

            formatted_records = [format_record(record) for record in records]
            return jsonify(formatted_records)

        # Administrative users can view limited demographic/result-status information.
        # They should not automatically receive full clinical record access.
        if has_permission(normalized_role, "view_limited_patient_info"):
            records = conn.execute("""
                SELECT * FROM medical_records
            """).fetchall()

            formatted_records = [mask_clinical_information(record) for record in records]

            add_log(
                username,
                f"{normalized_role} accessed limited administrative patient view",
                "Warning"
            )

            return jsonify(formatted_records)

        # If the user does not have a valid permission, deny by default.
        return deny_record_access(
            username,
            f"{normalized_role} attempted record access without required permission"
        )

    finally:
        conn.close()
