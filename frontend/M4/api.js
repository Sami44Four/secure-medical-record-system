const mockUsers = [
  {
    username: "doctor1",
    password: "Doctor123!",
    role: "doctor",
    fullName: "Dr. Sarah Ahmed",
    employeeId: "DOC-2048",
    department: "Internal Medicine",
    credentials: "MD, Board Certified",
    years: "7 years",
    lastLogin: "Today, 8:12 PM",
    mfaStatus: "Enabled"
  },
  {
    username: "nurse1",
    password: "Nurse123!",
    role: "nurse",
    fullName: "Nurse Amina Khan",
    employeeId: "NUR-1182",
    department: "Patient Care",
    credentials: "RN, BSN",
    years: "4 years",
    lastLogin: "Today, 7:45 PM",
    mfaStatus: "Enabled"
  },
  {
    username: "admin1",
    password: "Admin123!",
    role: "admin",
    fullName: "Maryam Ashraf",
    employeeId: "ADM-3301",
    department: "Health Information Systems",
    credentials: "System Administrator",
    years: "2 years",
    lastLogin: "Today, 8:30 PM",
    mfaStatus: "Enabled"
  }
];

const medicalRecords = [
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

let auditLogs = [];

function mockLogin(username, password) {
  return mockUsers.find(user =>
    user.username === username &&
    user.password === password
  );
}

function getMedicalRecords() {
  return medicalRecords;
}

function addAuditLog(user, action, status) {
  auditLogs.unshift({
    time: new Date().toLocaleTimeString(),
    user,
    action,
    status
  });
}

function getAuditLogs() {
  return auditLogs;
}