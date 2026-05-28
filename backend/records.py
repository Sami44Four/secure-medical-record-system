from flask import request, jsonify
from backend.logs import add_log
from backend.db import get_db_connection

def get_records():
    role = request.headers.get("Role")
    username = request.headers.get("Username", "unknown")

    conn = get_db_connection()

    # RBAC query
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
            "Admin accessed all medical records (monitored access)",
            "Warning"
        )

        conn.close()
        return jsonify([dict(r) for r in records])

    else:
        conn.close()
        add_log(username, "Unauthorized role attempted record access", "Denied")
        return jsonify({"message": "Unauthorized role"}), 403

    conn.close()

    add_log(username, f"Fetched records for role: {role}", "Success")

    return jsonify([dict(r) for r in records])