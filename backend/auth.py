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

        add_log(f"{username} logged in successfully")

        return jsonify({
            "message": "Login successful",
            "role": user["role"]
        })

    add_log(f"Failed login attempt for username: {username}")

    return jsonify({
        "message": "Invalid credentials"
    }), 401