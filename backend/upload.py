from flask import request, jsonify
from logs import add_log
import os

UPLOAD_FOLDER = "uploads"

ALLOWED_EXTENSIONS = {"pdf", "txt"}

def allowed_file(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_file():
    if "file" not in request.files:
        return jsonify({
            "message": "No file uploaded"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "message": "No selected file"
        }), 400

    if not allowed_file(file.filename):
        return jsonify({
            "message": "Invalid file type"
        }), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)

    file.save(filepath)
    add_log(f"File uploaded: {file.filename}")

    return jsonify({
        "message": "File uploaded successfully",
        "filename": file.filename
    })