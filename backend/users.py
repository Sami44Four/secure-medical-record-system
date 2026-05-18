from werkzeug.security import generate_password_hash

users = {
    "doctor1": {
        "password": generate_password_hash("Doctor123!"),
        "role": "doctor",
        "fullName": "Dr. Sarah Ahmed",
        "employeeId": "DOC-2048",
        "department": "Internal Medicine",
        "credentials": "MD, Board Certified",
        "years": "7 years",
        "lastLogin": "Today",
        "mfaStatus": "Enabled"
    },
    "nurse1": {
        "password": generate_password_hash("Nurse123!"),
        "role": "nurse",
        "fullName": "Nurse Amina Khan",
        "employeeId": "NUR-1182",
        "department": "Patient Care",
        "credentials": "RN, BSN",
        "years": "4 years",
        "lastLogin": "Today",
        "mfaStatus": "Enabled"
    },
    "admin1": {
        "password": generate_password_hash("Admin123!"),
        "role": "admin",
        "fullName": "Maryam Ashraf",
        "employeeId": "ADM-3301",
        "department": "Health Information Systems",
        "credentials": "System Administrator",
        "years": "2 years",
        "lastLogin": "Today",
        "mfaStatus": "Enabled"
    }
}