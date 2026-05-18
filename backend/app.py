from flask import Flask
from flask_cors import CORS
from backend.auth import login
from backend.upload import upload_file
from backend.records import get_records
from backend.logs import get_logs

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"message": "Secure Medical Backend Running"}

app.add_url_rule("/api/login", "login", login, methods=["POST"])
app.add_url_rule("/api/upload", "upload_file", upload_file, methods=["POST"])
app.add_url_rule("/api/records", "get_records", get_records, methods=["GET"])
app.add_url_rule("/api/audit-logs", "get_logs", get_logs, methods=["GET"])

if __name__ == "__main__":
    app.run(debug=True)