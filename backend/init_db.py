from db import get_db_connection
from werkzeug.security import generate_password_hash

# Connect to the database
conn = get_db_connection()
cursor = conn.cursor()

# Reset existing tables
cursor.execute("DROP TABLE IF EXISTS users")
cursor.execute("DROP TABLE IF EXISTS medical_records")
cursor.execute("DROP TABLE IF EXISTS audit_logs")

# Create users table
cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    full_name TEXT,
    department TEXT,
    employee_id TEXT,
    credentials TEXT,
    years TEXT,
    last_login TEXT
)
""")

# Create medical records table
cursor.execute("""
CREATE TABLE medical_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    patient_name TEXT NOT NULL,
    dob TEXT,
    gender TEXT,
    diagnosis TEXT,
    medication TEXT,
    allergies TEXT,
    vitals TEXT,
    record_type TEXT,
    doctor_notes TEXT,
    doctor_assigned TEXT,
    visit_date TEXT,
    access_level TEXT,
    lab_status TEXT,
    summary TEXT,
    filename TEXT,
    created_at TEXT
)
""")

# Create audit logs table
cursor.execute("""
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username TEXT,
    action TEXT,
    status TEXT
)
""")

# Insert default user accounts
users = [
    ...
]

cursor.executemany("""
INSERT INTO users
(username, password_hash, role, full_name, department, employee_id, credentials, years, last_login)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", users)

# Insert sample medical records
records = [
    ...
]

cursor.executemany("""
INSERT INTO medical_records
(id, patient_id, patient_name, dob, gender, diagnosis, medication, allergies, vitals,
 record_type, doctor_notes, doctor_assigned, visit_date, access_level, lab_status,
 summary, filename, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", records)

# Save changes and close the database connection
conn.commit()
conn.close()

print("Database initialized successfully.")