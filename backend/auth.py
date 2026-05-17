from flask import request, jsonify
from werkzeug.security import check_password_hash
from users import users

def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user = users.get(username)

    if user and check_password_hash(user["password"], password):
        return jsonify({
            "message": "Login successful",
            "role": user["role"]
        })

    return jsonify({
        "message": "Invalid credentials"
    }), 401