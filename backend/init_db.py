from db import get_db_connection
from werkzeug.security import generate_password_hash

conn = get_db_connection()
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS users")
cursor.execute("DROP TABLE IF EXISTS medical_records")
cursor.execute("DROP TABLE IF EXISTS audit_logs")

# USERS TABLE
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

# MEDICAL RECORDS TABLE
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

# AUDIT LOGS TABLE
cursor.execute("""
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username TEXT,
    action TEXT,
    status TEXT
)
""")

# DEFAULT USERS
users = [
    (
        "doctor1",
        generate_password_hash("Doctor123!"),
        "doctor",
        "Dr. Sarah Ahmed",
        "Internal Medicine",
        "DOC-2048",
        "MD, Board Certified",
        "7 years",
        "Today"
    ),
    (
        "nurse1",
        generate_password_hash("Nurse123!"),
        "nurse",
        "Nurse Amina Khan",
        "Patient Care",
        "NUR-1182",
        "RN, BSN",
        "4 years",
        "Today"
    ),
    (
        "admin1",
        generate_password_hash("Admin123!"),
        "admin",
        "Layla Brooks",
        "Front Desk Administration",
        "ADM-3301",
        "Patient Services Coordinator",
        "3 years",
        "Today"
    ),
    (
        "patient1",
        generate_password_hash("Patient123!"),
        "patient",
        "Amina Khan",
        "Patient Portal",
        "PAT-1001",
        "Patient",
        "Active Patient",
        "Today"
    )
]

cursor.executemany("""
INSERT INTO users
(username, password_hash, role, full_name, department, employee_id, credentials, years, last_login)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", users)

# SAMPLE MEDICAL RECORDS
records = [
    (
        "MR-101",
        "PAT-1001",
        "Amina Khan",
        "1996-02-14",
        "Female",
        "Hypertension",
        "Lisinopril 10mg",
        "Penicillin",
        "BP 128/82, HR 76, Temp 98.4°F",
        "Lab Results",
        "Continue current medication. Recommend follow-up visit in six months.",
        "Dr. Sarah Ahmed",
        "2026-05-12",
        "nurse",
        "Results Available",
        "Routine lab work reviewed. Blood pressure remains slightly elevated but stable.",
        "amina-lab-results.pdf",
        "2026-05-12"
    ),
    (
        "MR-205",
        "PAT-1002",
        "David Lee",
        "1988-09-03",
        "Male",
        "Post-operative recovery",
        "Ibuprofen 400mg as needed",
        "None reported",
        "BP 118/76, HR 72, Temp 98.1°F",
        "Surgery Follow-Up",
        "Wound site appears stable. Patient should avoid heavy activity for two weeks.",
        "Dr. Sarah Ahmed",
        "2026-05-15",
        "doctor",
        "Not Required",
        "Post-surgical recovery notes for a minor outpatient procedure.",
        "surgery-followup.pdf",
        "2026-05-15"
    ),
    (
        "MR-310",
        "PAT-1003",
        "Fatima Noor",
        "1979-11-22",
        "Female",
        "Type 2 Diabetes",
        "Metformin 500mg",
        "Sulfa drugs",
        "BP 122/80, HR 78, Glucose 136 mg/dL",
        "Prescription Review",
        "Patient reported no serious side effects. Monitor glucose readings for 30 days.",
        "Dr. Sarah Ahmed",
        "2026-05-18",
        "nurse",
        "Results Available",
        "Medication dosage reviewed during patient visit.",
        "prescription-review.pdf",
        "2026-05-18"
    ),
    (
        "MR-450",
        "PAT-1004",
        "Michael Smith",
        "1965-07-09",
        "Male",
        "Cardiology evaluation",
        "Atorvastatin 20mg",
        "Aspirin sensitivity",
        "BP 140/86, HR 82, Cholesterol elevated",
        "Confidential Specialist Report",
        "Restricted to doctor-level access due to confidential cardiac findings.",
        "Dr. Sarah Ahmed",
        "2026-05-20",
        "doctor",
        "Specialist Review Pending",
        "Specialist report containing sensitive diagnostic notes.",
        "cardiology-report.pdf",
        "2026-05-20"
    )
]

cursor.executemany("""
INSERT INTO medical_records
(id, patient_id, patient_name, dob, gender, diagnosis, medication, allergies, vitals,
 record_type, doctor_notes, doctor_assigned, visit_date, access_level, lab_status,
 summary, filename, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", records)

conn.commit()
conn.close()

print("Database initialized successfully.")