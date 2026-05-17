from flask import request, jsonify
from logs import add_log

medical_records = [
    {
        "id": 1,
        "filename": "patient_record_1.pdf",
        "required_role": "doctor"
    }
]

def get_records():
    role = request.headers.get("Role")

    if role != "doctor":

        add_log(f"Access denied for role: {role}")

        return jsonify({
            "message": "Access denied"
        }), 403

    add_log(f"Access granted for role: {role}")

    return jsonify(medical_records)