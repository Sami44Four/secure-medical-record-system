const API_BASE_URL = "http://127.0.0.1:5000";

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
    fullName: "Maryam Ashraf",
    employeeId: "ADM-3301",
    department: "Health Information Systems",
    credentials: "System Administrator",
    years: "2 years",
    lastLogin: "Today",
    mfaStatus: "Enabled"
  }
};

const fallbackRecords = [
  {
    id: "MR-101",
    patient: "Amina Khan",
    type: "General Checkup",
    requiredRole: "nurse",
    status: "General",
    summary: "Patient came in for a routine wellness check. Vital signs were normal.",
    notes: "Continue normal care plan. Follow up recommended in 6 months."
  },
  {
    id: "MR-205",
    patient: "David Lee",
    type: "Surgery Notes",
    requiredRole: "doctor",
    status: "Restricted",
    summary: "Post-surgical recovery notes for a minor outpatient procedure.",
    notes: "Wound site appears stable. Patient should avoid heavy activity for 2 weeks."
  },
  {
    id: "MR-310",
    patient: "Fatima Noor",
    type: "Prescription Update",
    requiredRole: "nurse",
    status: "General",
    summary: "Medication dosage update reviewed during patient visit.",
    notes: "Patient reported no serious side effects. Monitor symptoms for 30 days."
  },
  {
    id: "MR-450",
    patient: "Michael Smith",
    type: "Confidential Specialist Report",
    requiredRole: "doctor",
    status: "Confidential",
    summary: "Specialist report containing sensitive diagnostic notes.",
    notes: "Restricted to doctor-level access due to confidential medical findings."
  }
];

let localAuditLogs = [];
let cachedRecords = fallbackRecords;

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

    if (username === "doctor1" && password === "Doctor123!") {
      return fallbackUsers.doctor;
    }

    if (username === "nurse1" && password === "Nurse123!") {
      return fallbackUsers.nurse;
    }

    if (username === "admin1" && password === "Admin123!") {
      return fallbackUsers.admin;
    }

    return null;
  }
}

async function apiGetRecords(user) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/records`, {
      method: "GET",
      headers: {
        "Role": user.role,
        "Username": user.username
      }
    });

    if (!response.ok) {
      return [];
    }

    const records = await response.json();
    cachedRecords = records;
    return records;
  } catch (error) {
    console.warn("Backend records unavailable. Falling back to local records.");

    if (!user) {
      return [];
    }

    if (user.role === "admin") {
      cachedRecords = fallbackRecords;
      return fallbackRecords;
    }

    cachedRecords = fallbackRecords.filter(record => record.requiredRole === user.role);
    return cachedRecords;
  }
}

async function apiUploadRecord(user, fileName, patientName, recordType, fileSize) {
  try {
    const formData = new FormData();

    const fakeFile = new File(
      [`Mock beta upload for ${patientName}`],
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
      `Uploaded ${fileName} (${fileSize}) for ${patientName}`,
      "Success"
    );

    return {
      ok: true,
      data: {
        message: "File uploaded successfully using frontend fallback",
        filename: fileName,
        patientName,
        recordType,
        fileSize,
        encryptionStatus: "Marked for AES-256 encryption before storage"
      }
    };
  }
}

async function apiGetAuditLogs() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/audit-logs`);

    if (!response.ok) {
      return localAuditLogs;
    }

    return await response.json();
  } catch (error) {
    console.warn("Backend audit logs unavailable. Falling back to local audit logs.");
    return localAuditLogs;
  }
}

function getMedicalRecords() {
  return cachedRecords;
}

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