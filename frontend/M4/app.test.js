const mockUsers = [
  { username: "doctor1", password: "Doctor123!", role: "doctor" },
  { username: "nurse1", password: "Nurse123!", role: "nurse" },
  { username: "admin1", password: "Admin123!", role: "admin" }
];

const medicalRecords = [
  { id: "MR-101", type: "General Checkup", requiredRole: "nurse" },
  { id: "MR-205", type: "Surgery Notes", requiredRole: "doctor" },
  { id: "MR-450", type: "Confidential Specialist Report", requiredRole: "doctor" }
];

function mockLogin(username, password) {
  return mockUsers.find(user => user.username === username && user.password === password);
}

function canAccessRecord(user, record) {
  if (!user) return false;
  return user.role === "admin" || user.role === record.requiredRole;
}

function isValidUpload(fileName, patientName, recordType, fileSize) {
  if (!fileName || !patientName || !recordType || !fileSize) {
    return false;
  }

  return fileName.endsWith(".pdf") || fileName.endsWith(".txt");
}

function shouldTriggerSiemAlert(failedAttempts) {
  return failedAttempts >= 3;
}

describe("Authentication Tests", () => {
  test("valid doctor login should return doctor user", () => {
    const user = mockLogin("doctor1", "Doctor123!");
    expect(user.role).toBe("doctor");
  });

  test("invalid password should fail login", () => {
    const user = mockLogin("doctor1", "wrongpassword");
    expect(user).toBeUndefined();
  });
});

describe("RBAC Tests", () => {
  test("doctor can access doctor-level record", () => {
    const doctor = mockLogin("doctor1", "Doctor123!");
    const doctorRecord = medicalRecords.find(record => record.requiredRole === "doctor");
    expect(canAccessRecord(doctor, doctorRecord)).toBe(true);
  });

  test("nurse cannot access doctor-level record", () => {
    const nurse = mockLogin("nurse1", "Nurse123!");
    const doctorRecord = medicalRecords.find(record => record.requiredRole === "doctor");
    expect(canAccessRecord(nurse, doctorRecord)).toBe(false);
  });

  test("admin can access all records", () => {
    const admin = mockLogin("admin1", "Admin123!");
    const results = medicalRecords.map(record => canAccessRecord(admin, record));
    expect(results.every(result => result === true)).toBe(true);
  });
});

describe("Upload Validation Tests", () => {
  test("valid PDF upload should pass validation", () => {
    expect(isValidUpload("record.pdf", "Amina Khan", "Lab Results", "2.4 MB")).toBe(true);
  });

  test("invalid EXE upload should fail validation", () => {
    expect(isValidUpload("malware.exe", "Amina Khan", "Lab Results", "2.4 MB")).toBe(false);
  });

  test("missing upload fields should fail validation", () => {
    expect(isValidUpload("", "Amina Khan", "Lab Results", "2.4 MB")).toBe(false);
  });
});

describe("Security Monitoring Tests", () => {
  test("three failed logins should trigger SIEM alert", () => {
    expect(shouldTriggerSiemAlert(3)).toBe(true);
  });

  test("less than three failed logins should not trigger SIEM alert", () => {
    expect(shouldTriggerSiemAlert(2)).toBe(false);
  });
});