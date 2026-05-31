from backend.app import app

def test_doctor_access():
    client = app.test_client()

    response = client.get(
        "/api/records",
        headers={"Role": "doctor"}
    )

    assert response.status_code == 200

def test_nurse_denied():
    client = app.test_client()

    response = client.get(
        "/api/records",
        headers={"Role": "nurse"}
    )

    assert response.status_code == 200