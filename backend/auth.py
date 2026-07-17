from flask import request, jsonify
from werkzeug.security import check_password_hash

# Database connection and audit logging helpers
from backend.db import get_db_connection
from backend.logs import add_log

# Permission helpers
from backend.permissions import get_permissions_for_role, normalize_role


def get_account_status(user):
    """
    Return the user's account status.

    Older versions of the database may not have account_status yet,
    so this safely defaults existing demo users to approved.
    """
    if "account_status" in user.keys():
        return user["account_status"] or "approved"

    return "approved"


# Handle user login requests
def login():
    # Get login data from the request body
    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    # Connect to the database
    conn = get_db_connection()

    # Find user by username
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    ).fetchone()

    conn.close()

    # Verify password and return user information
    if user and check_password_hash(user["password_hash"], password):

        account_status = get_account_status(user)

        if account_status != "approved":
            add_log(
                username,
                f"Login blocked for account with status: {account_status}",
                "Denied"
            )

            return jsonify({
                "message": f"Account access denied. Account status is {account_status}."
            }), 403

        role = user["role"]
        normalized_role = normalize_role(role)
        permissions = get_permissions_for_role(role)

        # Log successful login
        add_log(username, f"{normalized_role} logged in successfully", "Success")

        return jsonify({
            "message": "Login successful",
            "user": {
                "username": user["username"],
                "role": role,
                "normalizedRole": normalized_role,
                "permissions": permissions,
                "accountStatus": account_status,
                "fullName": user["full_name"],
                "department": user["department"],
                "employeeId": user["employee_id"],
                "credentials": user["credentials"],
                "years": user["years"],
                "lastLogin": user["last_login"],
                "mfaStatus": "Enabled"
            }
        })

    # Log failed login attempt
    add_log(username or "unknown", "Failed login attempt", "Denied")

    return jsonify({
        "message": "Invalid credentials"
    }), 401
