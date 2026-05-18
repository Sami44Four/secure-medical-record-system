from flask import request, jsonify
from werkzeug.security import check_password_hash
from backend.users import users
from backend.logs import add_log

def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user = users.get(username)

    if user and check_password_hash(user["password"], password):
        add_log(username, f"{user['role']} logged in successfully", "Success")

        return jsonify({
            "message": "Login successful",
            "user": {
                "username": username,
                "role": user["role"],
                "fullName": user["fullName"],
                "employeeId": user["employeeId"],
                "department": user["department"],
                "credentials": user["credentials"],
                "years": user["years"],
                "lastLogin": user["lastLogin"],
                "mfaStatus": user["mfaStatus"]
            }
        })

    add_log(username or "unknown", "Failed login attempt", "Denied")

    return jsonify({
        "message": "Invalid credentials"
    }), 401