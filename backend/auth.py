from flask import request, jsonify
from werkzeug.security import check_password_hash
from backend.db import get_db_connection
from backend.logs import add_log

def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()

    user = conn.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    ).fetchone()

    conn.close()

    if user and check_password_hash(user["password_hash"], password):

        add_log(username, f"{user['role']} logged in successfully", "Success")

        return jsonify({
            "message": "Login successful",
            "user": {
            "username": user["username"],
            "role": user["role"],
            "fullName": user["full_name"],
            "department": user["department"],
            "employeeId": user["employee_id"],
            "credentials": user["credentials"],
            "years": user["years"],
            "lastLogin": user["last_login"],
            "mfaStatus": "Enabled"
            }

        })

    add_log(username or "unknown", "Failed login attempt", "Denied")

    return jsonify({
        "message": "Invalid credentials"
    }), 401