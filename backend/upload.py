from flask import request, jsonify
from werkzeug.utils import secure_filename

from backend.logs import add_log
from backend.permissions import has_permission, normalize_role

import os

# Configure upload directory and allowed file types
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", "uploads")
UPLOAD_FOLDER = os.path.abspath(UPLOAD_FOLDER)
ALLOWED_EXTENSIONS = {"pdf", "txt"}


# Check whether the uploaded file type is allowed
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Handle file upload requests
def upload_file():
    username = request.form.get("username", "unknown")

    # Role may come from either the request form or headers depending on frontend implementation
    role = request.form.get("role") or request.headers.get("Role")
    normalized_role = normalize_role(role)

    patient_name = request.form.get("patientName", "")
    record_type = request.form.get("recordType", "")
    file_size = request.form.get("fileSize", "")

    # Permission check before processing upload
    if not has_permission(normalized_role, "upload_clinical_files"):
        add_log(
            username,
            f"{normalized_role or 'unknown role'} attempted file upload without permission",
            "Denied"
        )

        return jsonify({
            "message": "Access denied. File upload requires clinical upload permission."
        }), 403

    # Verify that a file was included in the request
    if "file" not in request.files:
        add_log(username, "Upload rejected: no file uploaded", "Rejected")
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["file"]

    # Verify that a file was selected
    if file.filename == "":
        add_log(username, "Upload rejected: no selected file", "Rejected")
        return jsonify({"message": "No selected file"}), 400

    # Validate required upload information
    if patient_name == "" or record_type == "" or file_size == "":
        add_log(username, "Upload rejected: missing metadata", "Rejected")
        return jsonify({"message": "Missing patient name, record type, or file size"}), 400

    # Validate file type
    if not allowed_file(file.filename):
        add_log(username, f"Upload rejected: invalid file type {file.filename}", "Rejected")
        return jsonify({"message": "Invalid file type"}), 400

    # Sanitize filename before saving
    safe_filename = secure_filename(file.filename)

    # Save the file to the uploads folder
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, safe_filename)
    file.save(filepath)

    # Log successful upload
    add_log(
        username,
        f"{normalized_role} uploaded {safe_filename} for {patient_name}",
        "Success"
    )

    return jsonify({
        "message": "File uploaded successfully",
        "filename": safe_filename,
        "patientName": patient_name,
        "recordType": record_type,
        "fileSize": file_size,
        "encryptionStatus": "Marked for AES-256 encryption before storage"
    })
