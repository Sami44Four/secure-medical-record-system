from backend.app import app
import io

def test_upload_file():
    client = app.test_client()

    data = {
        "file": (io.BytesIO(b"test file"), "test.txt")
    }

    response = client.post(
        "/api/upload",
        data=data,
        content_type="multipart/form-data"
    )

    assert response.status_code == 200