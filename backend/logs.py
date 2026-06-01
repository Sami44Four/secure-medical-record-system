from flask import jsonify
from backend.db import get_db_connection

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
    conn = get_db_connection()

    logs = conn.execute("""
        SELECT * FROM audit_logs
        ORDER BY timestamp DESC
    """).fetchall()

    conn.close()

    return jsonify([dict(log) for log in logs])