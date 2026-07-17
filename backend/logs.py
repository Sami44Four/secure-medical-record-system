from flask import jsonify, request

from backend.db import get_db_connection
from backend.permissions import has_permission, normalize_role


# Add an entry to the audit log
def add_log(username, action, status):
    conn = get_db_connection()

    conn.execute("""
        INSERT INTO audit_logs (timestamp, username, action, status)
        VALUES (CURRENT_TIMESTAMP, ?, ?, ?)
    """, (username, action, status))

    conn.commit()
    conn.close()


# Retrieve all audit log entries
def get_logs():
    role = request.headers.get("Role")
    username = request.headers.get("Username", "unknown")
    normalized_role = normalize_role(role)

    # Only users with audit log permission should view logs
    if not has_permission(normalized_role, "view_audit_logs"):
        add_log(
            username,
            f"{normalized_role or 'unknown role'} attempted to access audit logs without permission",
            "Denied"
        )

        return jsonify({
            "message": "Access denied. Audit logs require security review permission."
        }), 403

    conn = get_db_connection()

    logs = conn.execute("""
        SELECT * FROM audit_logs
        ORDER BY timestamp DESC
    """).fetchall()

    conn.close()

    add_log(
        username,
        f"{normalized_role} viewed audit logs",
        "Success"
    )

    return jsonify([dict(log) for log in logs])
