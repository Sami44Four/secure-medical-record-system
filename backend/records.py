from flask import request, jsonify
from backend.logs import add_log

medical_records = [
    {
        "id": "MR-101",
        "patient": "Amina Khan",
        "type": "General Checkup",
        "requiredRole": "nurse",
        "status": "General",
        "summary": "Patient came in for a routine wellness check. Vital signs were normal.",
        "notes": "Continue normal care plan. Follow up recommended in 6 months."
    },
    {
        "id": "MR-205",
        "patient": "David Lee",
        "type": "Surgery Notes",
        "requiredRole": "doctor",
        "status": "Restricted",
        "summary": "Post-surgical recovery notes for a minor outpatient procedure.",
        "notes": "Wound site appears stable. Patient should avoid heavy activity for 2 weeks."
    },
    {
        "id": "MR-310",
        "patient": "Fatima Noor",
        "type": "Prescription Update",
        "requiredRole": "nurse",
        "status": "General",
        "summary": "Medication dosage update reviewed during patient visit.",
        "notes": "Patient reported no serious side effects. Monitor symptoms for 30 days."
    },
    {
        "id": "MR-450",
        "patient": "Michael Smith",
        "type": "Confidential Specialist Report",
        "requiredRole": "doctor",
        "status": "Confidential",
        "summary": "Specialist report containing sensitive diagnostic notes.",
        "notes": "Restricted to doctor-level access due to confidential medical findings."
    }
]

def get_records():
    role = request.headers.get("Role")
    username = request.headers.get("Username", "unknown")

    visible_records = []

    for record in medical_records:
        if role == "admin" or role == record["requiredRole"]:
            visible_records.append(record)

    add_log(username, f"Fetched records for role: {role}", "Success")

    return jsonify(visible_records)