from werkzeug.security import generate_password_hash

users = {
    "doctor1": {
        "password": generate_password_hash("doctor123"),
        "role": "doctor"
    },
    "nurse1": {
        "password": generate_password_hash("nurse123"),
        "role": "nurse"
    }
}