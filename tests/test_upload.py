from backend.app import app
import io

def test_upload_file():
    client = app.test_client()

    data = {
    "file": (io.BytesIO(b"test file"), "test.txt"),
    "username": "doctor1",
    "patientName": "Amina Khan",
    "recordType": "Lab Results",
    "fileSize": "1 KB"
    }

    response = client.post(
        "/api/upload",
        data=data,
        content_type="multipart/form-data"
    )

    assert response.status_code == 200