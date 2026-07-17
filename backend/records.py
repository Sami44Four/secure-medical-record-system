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


def get_current_user(conn, username):
    """
    Retrieve the current user from the database.
    """
    return conn.execute("""
        SELECT * FROM users WHERE username = ?
    """, (username,)).fetchone()


def patient_owns_record(user, record):
    """
    Check whether a patient user owns the requested medical record.

    In this prototype, patient ownership is matched by full name because the
    original database does not yet include a separate patient-user mapping table.
    A production system should use stable patient IDs instead of names.
    """
    if not user:
        return False

    return user["full_name"] == record["patient_name"]


def clinical_user_can_access_record(user, record, normalized_role):
    """
    Check whether a clinical user has a valid relationship to a patient record.

    This is a first-stage patient relationship check for the educational prototype.

    Current relationship logic:
    - Physicians and nurse practitioners can access records where they are listed
      as the assigned provider.
    - Registered nurses can access nurse-level records as a temporary care-team
      relationship model.
    - Future versions should replace this with a patient_assignments table.
    """
    if not user:
        return False

    provider_name = user["full_name"]
    assigned_provider = record["doctor_assigned"] if "doctor_assigned" in record.keys() else ""

    # Physicians and nurse practitioners must be assigned to the patient record.
    if normalized_role in ["physician", "nurse_practitioner"]:
        return assigned_provider == provider_name

    # Registered nurses can access nurse-level records only.
    # This is a simplified prototype version of care-team access.
    if normalized_role == "registered_nurse":
        return record["access_level"] == "nurse"

    return False


def filter_records_by_relationship(records, user, normalized_role, username):
    """
    Filter medical records so users only receive records they are allowed to access.
    """
    authorized_records = []
    denied_count = 0

    for record in records:
        if clinical_user_can_access_record(user, record, normalized_role):
            authorized_records.append(record)
        else:
            denied_count += 1

    if denied_count > 0:
        add_log(
            username,
            f"{normalized_role} was denied access to {denied_count} unassigned medical record(s)",
            "Denied"
        )

    return authorized_records


# Retrieve records based on the user's permissions and patient relationship
def get_records():
    role = request.headers.get("Role")
    username = request.headers.get("Username", "unknown")
    normalized_role = normalize_role(role)

    if not normalized_role:
        return deny_record_access(username, "Missing role attempted record access")

    conn = get_db_connection()

    try:
        user = get_current_user(conn, username)

        if not user:
            add_log(username, "Record access failed: user not found", "Denied")
            return jsonify({"message": "User not found"}), 404

        # Patients can only view their own records
        if has_permission(normalized_role, "view_own_records"):
            records = conn.execute("""
                SELECT * FROM medical_records
            """).fetchall()

            authorized_records = [
                record for record in records
                if patient_owns_record(user, record)
            ]

            denied_count = len(records) - len(authorized_records)

            if denied_count > 0:
                add_log(
                    username,
                    f"Patient denied access to {denied_count} record(s) belonging to other patients",
                    "Denied"
                )

            formatted_records = [format_record(record) for record in authorized_records]

            add_log(
                username,
                "Patient accessed own medical records",
                "Success"
            )

            return jsonify(formatted_records)

        # Clinical users can only view records where they have a valid patient relationship.
        if has_permission(normalized_role, "view_assigned_records"):
            records = conn.execute("""
                SELECT * FROM medical_records
            """).fetchall()

            authorized_records = filter_records_by_relationship(
                records,
                user,
                normalized_role,
                username
            )

            formatted_records = [format_record(record) for record in authorized_records]

            add_log(
                username,
                f"{normalized_role} accessed {len(authorized_records)} assigned medical record(s)",
                "Success"
            )

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
