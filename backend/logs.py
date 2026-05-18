from flask import jsonify
from datetime import datetime

audit_logs = []

def add_log(user, action, status):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    audit_logs.insert(0, {
        "time": timestamp,
        "user": user,
        "action": action,
        "status": status
    })

def get_logs():
    return jsonify(audit_logs)