from db import get_db_connection
from werkzeug.security import generate_password_hash

conn = get_db_connection()
cursor = conn.cursor()

# USERS TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    full_name TEXT,
    department TEXT
)
""")

# MEDICAL RECORDS TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    diagnosis TEXT,
    record_type TEXT,
    doctor_notes TEXT,
    access_level TEXT,
    filename TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# AUDIT LOGS TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username TEXT,
    action TEXT,
    status TEXT
)
""")

# INSERT DEFAULT USERS
users = [
    (
        "doctor1",
        generate_password_hash("Doctor123!"),
        "doctor",
        "Dr. Sarah Ahmed",
        "Internal Medicine"
    ),
    (
        "nurse1",
        generate_password_hash("Nurse123!"),
        "nurse",
        "Nurse Amina Khan",
        "Patient Care"
    ),
    (
        "admin1",
        generate_password_hash("Admin123!"),
        "admin",
        "Maryam Ashraf",
        "Health Information Systems"
    )
]

for user in users:
    cursor.execute("""
    INSERT OR IGNORE INTO users
    (username, password_hash, role, full_name, department)
    VALUES (?, ?, ?, ?, ?)
    """, user)

# INSERT SAMPLE RECORDS
records = [
    (
        "Amina Khan",
        "Routine wellness examination",
        "General Checkup",
        "Patient stable and healthy.",
        "nurse",
        "checkup.pdf"
    ),
    (
        "David Lee",
        "Post-surgical recovery",
        "Surgery Notes",
        "Monitor healing for 2 weeks.",
        "doctor",
        "surgery.pdf"
    )
]

for record in records:
    cursor.execute("""
    INSERT INTO medical_records
    (patient_name, diagnosis, record_type, doctor_notes, access_level, filename)
    VALUES (?, ?, ?, ?, ?, ?)
    """, record)

conn.commit()
conn.close()

print("Database initialized successfully.")