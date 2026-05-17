from flask import jsonify
from datetime import datetime

audit_logs = []

def add_log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    audit_logs.insert(0, {
        "timestamp": timestamp,
        "message": message
    })

def get_logs():
    return jsonify(audit_logs)