from flask import request, jsonify

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
        return jsonify({
            "message": "Access denied"
        }), 403

    return jsonify(medical_records)