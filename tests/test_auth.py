from backend.app import app

def test_successful_login():
    client = app.test_client()

    response = client.post(
        "/api/login",
        json={
            "username": "doctor1",
            "password": "doctor123"
        }
    )

    assert response.status_code == 200

def test_failed_login():
    client = app.test_client()

    response = client.post(
        "/api/login",
        json={
            "username": "doctor1",
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401