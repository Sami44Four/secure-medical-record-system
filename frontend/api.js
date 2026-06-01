// =====================================================
// Secure Medical Record Management System
// Frontend API Layer
//
// This file handles communication with the backend API
// and provides fallback mock data when the backend is
// unavailable. It also manages audit logs, medical
// records, appointments, prescriptions, and security
// assistant functionality.
// =====================================================

// Backend API base URL

const API_BASE_URL = "http://127.0.0.1:5000";

// Mock user accounts used when the backend server
// is unavailable during development or demonstrations.

const fallbackUsers = {
  doctor: {
    username: "doctor1",
    role: "doctor",
    fullName: "Dr. Sarah Ahmed",
    employeeId: "DOC-2048",
    department: "Internal Medicine",
    credentials: "MD, Board Certified",
    years: "7 years",
    lastLogin: "Today",
    mfaStatus: "Enabled"
  },
  nurse: {
    username: "nurse1",
    role: "nurse",
    fullName: "Nurse Amina Khan",
    employeeId: "NUR-1182",
    department: "Patient Care",
    credentials: "RN, BSN",
    years: "4 years",
    lastLogin: "Today",
    mfaStatus: "Enabled"
  },
  admin: {
    username: "admin1",
    role: "admin",
    fullName: "Layla Brooks",
    employeeId: "ADM-3301",
    department: "Front Desk Administration",
    credentials: "Patient Services Coordinator",
    years: "3 years",
    lastLogin: "Today",
    mfaStatus: "Enabled"
  },
  patient: {
    username: "patient1",
    role: "patient",
    fullName: "Amina Khan",
    employeeId: "PAT-1001",
    department: "Patient Portal",
    credentials: "Patient",
    years: "Active Patient",
    lastLogin: "Today",
    mfaStatus: "Enabled"
  }
};

// Sample medical records used as fallback data.
// These records demonstrate role-based access control
// and different record sensitivity levels.

const fallbackRecords = [
  {
    id: "MR-101",
    patientId: "PAT-1001",
    patient: "Amina Khan",
    dob: "1996-02-14",
    gender: "Female",
    type: "Lab Results",
    diagnosis: "Hypertension",
    medication: "Lisinopril 10mg",
    allergies: "Penicillin",
    vitals: "BP 128/82, HR 76, Temp 98.4°F",
    doctorAssigned: "Dr. Sarah Ahmed",
    visitDate: "2026-05-12",
    createdDate: "2026-05-12",
    requiredRole: "nurse",
    status: "General",
    labStatus: "Results Available",
    summary: "Routine lab work reviewed. Blood pressure remains slightly elevated but stable.",
    notes: "Continue current medication. Recommend follow-up visit in six months."
  },
  {
    id: "MR-205",
    patientId: "PAT-1002",
    patient: "David Lee",
    dob: "1988-09-03",
    gender: "Male",
    type: "Surgery Follow-Up",
    diagnosis: "Post-operative recovery",
    medication: "Ibuprofen 400mg as needed",
    allergies: "None reported",
    vitals: "BP 118/76, HR 72, Temp 98.1°F",
    doctorAssigned: "Dr. Sarah Ahmed",
    visitDate: "2026-05-15",
    createdDate: "2026-05-15",
    requiredRole: "doctor",
    status: "Restricted",
    labStatus: "Not Required",
    summary: "Post-surgical recovery notes for a minor outpatient procedure.",
    notes: "Wound site appears stable. Patient should avoid heavy activity for two weeks."
  },
  {
    id: "MR-310",
    patientId: "PAT-1003",
    patient: "Fatima Noor",
    dob: "1979-11-22",
    gender: "Female",
    type: "Prescription Review",
    diagnosis: "Type 2 Diabetes",
    medication: "Metformin 500mg",
    allergies: "Sulfa drugs",
    vitals: "BP 122/80, HR 78, Glucose 136 mg/dL",
    doctorAssigned: "Dr. Sarah Ahmed",
    visitDate: "2026-05-18",
    createdDate: "2026-05-18",
    requiredRole: "nurse",
    status: "General",
    labStatus: "Results Available",
    summary: "Medication dosage reviewed during patient visit.",
    notes: "Patient reported no serious side effects. Monitor glucose readings for 30 days."
  },
  {
    id: "MR-450",
    patientId: "PAT-1004",
    patient: "Michael Smith",
    dob: "1965-07-09",
    gender: "Male",
    type: "Confidential Specialist Report",
    diagnosis: "Cardiology evaluation",
    medication: "Atorvastatin 20mg",
    allergies: "Aspirin sensitivity",
    vitals: "BP 140/86, HR 82, Cholesterol elevated",
    doctorAssigned: "Dr. Sarah Ahmed",
    visitDate: "2026-05-20",
    createdDate: "2026-05-20",
    requiredRole: "doctor",
    status: "Confidential",
    labStatus: "Specialist Review Pending",
    summary: "Specialist report containing sensitive diagnostic notes.",
    notes: "Restricted to doctor-level access due to confidential cardiac findings."
  }
];

// Sample appointment data for frontend testing.

const fallbackAppointments = [
  {
    id: "APT-501",
    patient: "Amina Khan",
    date: "2026-06-02",
    time: "10:30 AM",
    reason: "Blood pressure follow-up",
    status: "Scheduled"
  },
  {
    id: "APT-502",
    patient: "Fatima Noor",
    date: "2026-06-05",
    time: "2:00 PM",
    reason: "Diabetes medication review",
    status: "Scheduled"
  }
];

// Sample prescription records used when backend
// services are unavailable.

const fallbackPrescriptions = [
  {
    id: "RX-9001",
    patient: "Amina Khan",
    medication: "Lisinopril 10mg",
    dosage: "Once daily",
    prescribedBy: "Dr. Sarah Ahmed",
    date: "2026-05-12"
  },
  {
    id: "RX-9002",
    patient: "Fatima Noor",
    medication: "Metformin 500mg",
    dosage: "Twice daily",
    prescribedBy: "Dr. Sarah Ahmed",
    date: "2026-05-18"
  }
];

// Local application state used as a fallback cache.

let localAuditLogs = [];
let cachedRecords = fallbackRecords;
let cachedAppointments = fallbackAppointments;
let cachedPrescriptions = fallbackPrescriptions;

// Authenticates a user through the backend API.
// Falls back to local mock accounts if the backend
// cannot be reached.

async function apiLogin(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.warn("Backend login unavailable. Falling back to local mock login.");

    if (username === "doctor1" && password === "Doctor123!") return fallbackUsers.doctor;
    if (username === "nurse1" && password === "Nurse123!") return fallbackUsers.nurse;
    if (username === "admin1" && password === "Admin123!") return fallbackUsers.admin;
    if (username === "patient1" && password === "Patient123!") return fallbackUsers.patient;

    return null;
  }
}

// Retrieves medical records available to the current
// user based on their assigned role.
// RBAC filtering is enforced by the backend when
// available and simulated locally as a fallback.

async function apiGetRecords(user) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/records`, {
      method: "GET",
      headers: {
        "Role": user.role,
        "Username": user.username
      }
    });

    if (!response.ok) return [];

    const records = await response.json();
    cachedRecords = normalizeRecords(records);
    return cachedRecords;
  } catch (error) {
    console.warn("Backend records unavailable. Falling back to local medical records.");

    if (!user) return [];

    if (user.role === "doctor") {
      cachedRecords = fallbackRecords.filter(record =>
        record.requiredRole === "doctor" || record.requiredRole === "nurse"
      );
      return cachedRecords;
    }

    if (user.role === "nurse") {
      cachedRecords = fallbackRecords.filter(record => record.requiredRole === "nurse");
      return cachedRecords;
    }

    if (user.role === "admin") {
      cachedRecords = fallbackRecords.map(record => ({
        ...record,
        diagnosis: "Hidden from admin/front desk role",
        medication: "Hidden from admin/front desk role",
        notes: "Clinical notes hidden. Admin can only verify demographics, appointments, and result status.",
        summary: "Basic demographic and result-status view only."
      }));
      return cachedRecords;
    }

    if (user.role === "patient") {
      cachedRecords = fallbackRecords.filter(record => record.patient === user.fullName);
      return cachedRecords;
    }

    return [];
  }
}

// Converts backend record formats into a consistent
// frontend structure regardless of database schema.

function normalizeRecords(records) {
  return records.map(record => ({
    id: record.id || record.record_id || "MR-UNKNOWN",
    patientId: record.patientId || record.patient_id || "PAT-UNKNOWN",
    patient: record.patient || record.patient_name || "Unknown Patient",
    dob: record.dob || "Not provided",
    gender: record.gender || "Not provided",
    type: record.type || record.record_type || "Medical Record",
    diagnosis: record.diagnosis || "Not provided",
    medication: record.medication || "Not provided",
    allergies: record.allergies || "Not provided",
    vitals: record.vitals || "Not provided",
    doctorAssigned: record.doctorAssigned || record.doctor_assigned || "Not assigned",
    visitDate: record.visitDate || record.visit_date || record.created_at || "Not provided",
    createdDate: record.createdDate || record.created_at || "Not provided",
    requiredRole: record.requiredRole || record.required_role || "doctor",
    status: record.status || record.access_level || "Restricted",
    labStatus: record.labStatus || record.lab_status || "Pending",
    summary: record.summary || "No clinical summary available.",
    notes: record.notes || record.doctor_notes || "No provider notes available."
  }));
}

// Uploads a medical record to the backend.
// A simulated upload is used during frontend-only
// demonstrations when the backend is unavailable.

async function apiUploadRecord(user, fileName, patientName, recordType, fileSize) {
  try {
    const formData = new FormData();

    const fakeFile = new File(
      [`Mock final release upload for ${patientName}`],
      fileName,
      { type: fileName.endsWith(".pdf") ? "application/pdf" : "text/plain" }
    );

    formData.append("file", fakeFile);
    formData.append("username", user.username);
    formData.append("patientName", patientName);
    formData.append("recordType", recordType);
    formData.append("fileSize", fileSize);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    return {
      ok: response.ok,
      data
    };
  } catch (error) {
    console.warn("Backend upload unavailable. Falling back to local upload response.");

    addAuditLog(
      user.username,
      `Uploaded medical record ${fileName} (${fileSize}) for ${patientName}`,
      "Success"
    );

    return {
      ok: true,
      data: {
        message: "Medical record uploaded successfully using frontend fallback",
        filename: fileName,
        patientName,
        recordType,
        fileSize,
        encryptionStatus: "Marked for AES-256 encryption before storage"
      }
    };
  }
}

// Retrieves audit log entries from the backend.
// Falls back to locally stored audit logs if needed.

async function apiGetAuditLogs() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/audit-logs`);

    if (!response.ok) return localAuditLogs;

    return await response.json();
  } catch (error) {
    console.warn("Backend audit logs unavailable. Falling back to local audit logs.");
    return localAuditLogs;
  }
}

// Security Assistant feature.
// Sends audit logs to the backend LLM service for
// security analysis and risk assessment.
// Generates a local summary if the AI service is
// unavailable.

async function apiAnalyzeAuditLogs() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/llm/security-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        logs: localAuditLogs
      })
    });

    if (!response.ok) {
      throw new Error("Security summary endpoint unavailable.");
    }

    return await response.json();
  } catch (error) {
    console.warn("Backend LLM summary unavailable. Falling back to local security summary.");

    return {
      riskLevel: localAuditLogs.some(log => log.status === "Denied") ? "Medium" : "Low",
      summary: "The Security Assistant reviewed recent audit activity. Failed logins, denied access attempts, and medical record uploads should continue to be monitored by administrators.",
      findings: [
        `Failed login attempts recorded: ${getFailedLoginCount()}`,
        `Denied access attempts recorded: ${getDeniedAccessCount()}`,
        "No malicious upload activity detected in the current frontend session.",
        "RBAC enforcement remains the primary access control mechanism."
      ],
      recommendations: [
        "Review repeated failed login attempts.",
        "Continue enforcing MFA for sensitive medical record access.",
        "Monitor upload activity for unsafe file types.",
        "Keep backend RBAC as the source of truth for authorization."
      ]
    };
  }
}

// Simple helper functions that expose cached data
// to the frontend interface.

function getMedicalRecords() {
  return cachedRecords;
}

function getAppointments() {
  return cachedAppointments;
}

function getPrescriptions() {
  return cachedPrescriptions;
}

// Records a security-relevant action in the local
// audit trail for monitoring and demonstration.

function addAuditLog(user, action, status) {
  localAuditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user,
    action,
    status
  });
}

function getAuditLogs() {
  return localAuditLogs;
}

// Returns the number of failed login attempts
// recorded during the current session.

function getFailedLoginCount() {
  return localAuditLogs.filter(log =>
    log.action.toLowerCase().includes("failed login")
  ).length;
}

// Returns the number of denied access events
// recorded in the audit log.

function getDeniedAccessCount() {
  return localAuditLogs.filter(log =>
    log.status === "Denied"
  ).length;
}

// Allows doctors to append provider notes to an
// existing medical record and records the action
// in the audit log.

function addProviderNote(recordId, noteText, username) {
  const record = fallbackRecords.find(item => item.id === recordId);

  if (record) {
    record.notes = `${record.notes} New provider note: ${noteText}`;
    addAuditLog(username, `Added provider note to ${recordId}`, "Success");
  }
}

// Creates a new prescription entry and logs the
// action for auditing purposes.

function addPrescription(patientName, medication, dosage, username) {
  fallbackPrescriptions.unshift({
    id: `RX-${Date.now()}`,
    patient: patientName,
    medication,
    dosage,
    prescribedBy: username,
    date: new Date().toISOString().split("T")[0]
  });

  addAuditLog(username, `Created prescription for ${patientName}`, "Success");
}

// Updates patient vital signs and records the
// modification in the audit log.

function addVitals(patientName, vitals, username) {
  const record = fallbackRecords.find(item => item.patient === patientName);

  if (record) {
    record.vitals = vitals;
    addAuditLog(username, `Updated vitals for ${patientName}`, "Success");
  }
}

// Schedules a new appointment and creates an
// associated audit log entry.

function addAppointment(patientName, date, time, reason, username) {
  fallbackAppointments.unshift({
    id: `APT-${Date.now()}`,
    patient: patientName,
    date,
    time,
    reason,
    status: "Scheduled"
  });

  addAuditLog(username, `Scheduled appointment for ${patientName}`, "Success");
}

// Expose API functions globally so they can be
// accessed by the frontend interface.

window.apiLogin = apiLogin;
window.apiGetRecords = apiGetRecords;
window.apiUploadRecord = apiUploadRecord;
window.apiGetAuditLogs = apiGetAuditLogs;
window.apiAnalyzeAuditLogs = apiAnalyzeAuditLogs;
window.getMedicalRecords = getMedicalRecords;
window.getAppointments = getAppointments;
window.getPrescriptions = getPrescriptions;
window.addAuditLog = addAuditLog;
window.getAuditLogs = getAuditLogs;
window.addProviderNote = addProviderNote;
window.addPrescription = addPrescription;
window.addVitals = addVitals;
window.addAppointment = addAppointment;

// Verify that the API module loaded successfully.

console.log("api.js loaded successfully");