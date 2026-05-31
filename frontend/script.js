let currentUser = null;
let pendingUser = null;
let selectedRecord = null;

let failedLoginAttempts = 0;
let deniedAccessAttempts = 0;
let uploadedFiles = 0;
let siemAlerts = 0;

let sessionSeconds = 900;
let sessionInterval;

async function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginResult = document.getElementById("loginResult");

  if (username === "" || password === "") {
    showMessage(loginResult, "Login failed: username and password are required.", "denied");
    return;
  }

  const user = await apiLogin(username, password);

  if (!user) {
    failedLoginAttempts++;
    addAuditLog(username || "unknown", "Failed login attempt", "Denied");

    showMessage(loginResult, "Login failed: invalid username or password.", "denied");

    if (failedLoginAttempts >= 3) {
      siemAlerts++;
      const siemStatus = document.getElementById("siemStatus");
      if (siemStatus) {
        siemStatus.textContent = "Suspicious login activity detected";
      }
    }

    renderAuditLog();
    updateAdminStats();
    return;
  }

  pendingUser = user;
  document.getElementById("mfaModal").classList.remove("hidden");
}

async function verifyMFA() {
  const code = document.getElementById("mfaCode").value.trim();
  const mfaResult = document.getElementById("mfaResult");

  if (code !== "123456") {
    showMessage(mfaResult, "Invalid MFA code.", "denied");
    return;
  }

  currentUser = pendingUser;

  document.getElementById("mfaModal").classList.add("hidden");
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("protectedContent").classList.remove("hidden");
  document.getElementById("navMenu").classList.remove("hidden");
  
  if (currentUser.role === "patient") {
  document.getElementById("notificationBell").classList.add("hidden");
  } else {
  document.getElementById("notificationBell").classList.remove("hidden");
  }

  document.getElementById("currentUser").classList.remove("hidden");

  document.getElementById("currentUser").textContent =
  currentUser.role === "patient"
    ? `Welcome, ${currentUser.fullName}`
    : `${currentUser.fullName} (${currentUser.role})`;

  addAuditLog(currentUser.username, `${currentUser.role} logged in with MFA`, "Success");

  configureRoleNavigation();
  renderProfile();
  renderDashboardSummary();
  await renderRecords();
  renderAuditLog();
  updateAdminStats();

  showPage("dashboardPage");
  startSessionTimer();
}

function cancelMFA() {
  document.getElementById("mfaModal").classList.add("hidden");
}

function renderProfile() {
  document.getElementById("profileName").textContent = currentUser.fullName;
  document.getElementById("profileRole").textContent = currentUser.role.toUpperCase();

  if (currentUser.role === "patient") {
    document.getElementById("employeeId").parentElement.querySelector("span").textContent = "Patient ID";
    document.getElementById("department").parentElement.querySelector("span").textContent = "Clinic";
    document.getElementById("credentials").parentElement.querySelector("span").textContent = "Date of Birth";
    document.getElementById("years").parentElement.querySelector("span").textContent = "Account Status";

    document.getElementById("employeeId").textContent = currentUser.employeeId;
    document.getElementById("department").textContent = "WWU Family Medicine";
    document.getElementById("credentials").textContent = "1996-02-14";
    document.getElementById("years").textContent = "Active";
  } else {
    document.getElementById("employeeId").parentElement.querySelector("span").textContent = "Employee ID";
    document.getElementById("department").parentElement.querySelector("span").textContent = "Department";
    document.getElementById("credentials").parentElement.querySelector("span").textContent = "Credentials";
    document.getElementById("years").parentElement.querySelector("span").textContent = "Years at Hospital";

    document.getElementById("employeeId").textContent = currentUser.employeeId;
    document.getElementById("department").textContent = currentUser.department;
    document.getElementById("credentials").textContent = currentUser.credentials;
    document.getElementById("years").textContent = currentUser.years;
  }

  document.getElementById("lastLogin").textContent = currentUser.lastLogin;
  document.getElementById("mfaStatus").textContent = currentUser.mfaStatus;

  document.getElementById("profileInitials").textContent =
    currentUser.fullName
      .split(" ")
      .map(word => word[0])
      .join("")
      .slice(0, 2);
}

function renderDashboardSummary() {
  const title = document.getElementById("dashboardSummaryTitle");

  if (currentUser.role === "patient") {
    title.textContent = "Patient Summary";

    document.getElementById("summaryLabel1").textContent = "Next Appointment";
    document.getElementById("summaryValue1").textContent = "June 2, 2026 at 10:30 AM";

    document.getElementById("summaryLabel2").textContent = "Lab Results";
    document.getElementById("summaryValue2").textContent = "Results Available";

    document.getElementById("summaryLabel3").textContent = "Prescription Status";
    document.getElementById("summaryValue3").textContent = "Refill Active";

    document.getElementById("summaryLabel4").textContent = "Account Status";
    document.getElementById("summaryValue4").textContent = "Active";

    return;
  }

  title.textContent = "Work Summary";

  document.getElementById("summaryLabel1").textContent = "Patient Records";
  document.getElementById("summaryValue1").textContent = getMedicalRecords().length;

  document.getElementById("summaryLabel2").textContent = "Lab Results Pending";
  document.getElementById("summaryValue2").textContent = "1";

  document.getElementById("summaryLabel3").textContent = "Appointments Today";
  document.getElementById("summaryValue3").textContent = "2";

  document.getElementById("summaryLabel4").textContent = "Critical Alerts";
  document.getElementById("summaryValue4").textContent = "0";
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });

  document.getElementById(pageId).classList.remove("hidden");
}

async function renderRecords() {
  const recordsList = document.getElementById("recordsList");
  const searchInput = document.getElementById("recordSearch");
  const searchText = searchInput ? searchInput.value.toLowerCase() : "";

  if (searchInput && currentUser.role === "patient") {
  searchInput.classList.add("hidden");
  } else if (searchInput) {
  searchInput.classList.remove("hidden");
  }

  recordsList.innerHTML = "";

  const records = await apiGetRecords(currentUser);
  const totalRecords = document.getElementById("totalRecords");
  if (totalRecords) {
    totalRecords.textContent = records.length;
  }

  const filteredRecords = records.filter(record => {
    return (
      record.id.toLowerCase().includes(searchText) ||
      record.patient.toLowerCase().includes(searchText) ||
      record.type.toLowerCase().includes(searchText) ||
      record.diagnosis.toLowerCase().includes(searchText)
    );
  });

  filteredRecords.forEach(record => {
    const isAuthorized = canAccessRecord(record);

    const recordDiv = document.createElement("div");
    recordDiv.className = "record";

    recordDiv.innerHTML = `
      <div>
        <h3>${record.id}: ${record.patient}</h3>
        <p>${record.type}</p>
        <p><strong>DOB:</strong> ${record.dob} | <strong>Lab Status:</strong> ${record.labStatus}</p>

        ${
          currentUser.role === "patient"
            ? ""
            : `<p>
              Required Role:
              <span class="role-pill">${record.requiredRole}</span>
              <span class="status-pill ${record.status.toLowerCase()}">${record.status}</span>
            </p>`
       }
      </div>

      <button
      class="${isAuthorized ? "" : "denied-button"}"
      onclick="handleRecordAccess('${record.id}')"
      >
      ${isAuthorized ? "Open Patient Chart" : "Request Access"}
      </button>
    `;

    recordsList.appendChild(recordDiv);
  });

  if (filteredRecords.length === 0) {
    recordsList.innerHTML = "<p class=\"muted\">No records match your search or your role permissions.</p>";
  }
}

function canAccessRecord(record) {
  if (!currentUser) {
    return false;
  }

  if (currentUser.role === "doctor") {
    return true;
  }

  if (currentUser.role === "nurse") {
    return record.requiredRole === "nurse";
  }

  if (currentUser.role === "admin") {
    return true;
  }

  if (currentUser.role === "patient") {
    return record.patient === currentUser.fullName;
  }

  return false;
}

function handleRecordAccess(recordId) {
  const accessResult = document.getElementById("accessResult");
  const record = getMedicalRecords().find(item => item.id === recordId);

  if (!record) {
    showMessage(accessResult, "Record not found or unavailable for this role.", "denied");
    return;
  }

  if (!canAccessRecord(record)) {
    deniedAccessAttempts++;

    addAuditLog(
      currentUser.username,
      `Requested/denied access to ${record.id}`,
      "Denied"
    );

    showMessage(
      accessResult,
      `Access Denied: ${currentUser.role} is not authorized to open ${record.type}. Access request was logged.`,
      "denied"
    );

    renderAuditLog();
    updateAdminStats();
    return;
  }

  addAuditLog(
    currentUser.username,
    `Accessed patient chart ${record.id}`,
    "Granted"
  );

  showMessage(
    accessResult,
    `Access Granted: ${record.patient}'s ${record.type} patient chart opened.`,
    "success"
  );

  openPatientChart(record);
  renderAuditLog();
  updateLastActivity(`Opened patient chart ${record.id}`);
}

function openPatientChart(record) {
  selectedRecord = record;

  document.getElementById("chartPatientName").textContent =
    `${record.id}: ${record.patient}`;

  document.getElementById("chartSubtitle").textContent =
    currentUser.role === "patient"
      ? `${record.type} | Last Updated: ${record.createdDate}`
      : `${record.type} | Access Level: ${record.status} | Created: ${record.createdDate}`;

  document.getElementById("chartDOB").textContent = record.dob;
  document.getElementById("chartGender").textContent = record.gender;
  document.getElementById("chartDiagnosis").textContent = record.diagnosis;
  document.getElementById("chartMedication").textContent = record.medication;
  document.getElementById("chartAllergies").textContent = record.allergies;
  document.getElementById("chartVitals").textContent = record.vitals;
  document.getElementById("chartDoctor").textContent = record.doctorAssigned;
  document.getElementById("chartLabStatus").textContent = record.labStatus;
  document.getElementById("chartSections").innerHTML = renderChartSections(record);
  renderChartAppointments(record.patient);

  showPage("patientChartPage");
}

function renderChartSections(record) {
  if (currentUser.role === "doctor") {
    return `
      <div class="grid">
        <div class="card">
          <h2>Visit History</h2>
          <ul class="audit">
            <li>${record.visitDate || "2026-05-12"} - ${record.type}</li>
            <li>2026-03-08 - Annual wellness visit</li>
            <li>2025-12-19 - Urgent care visit</li>
          </ul>
        </div>

        <div class="card">
          <h2>Lab Results / Clinical Summary</h2>
          <p>${record.summary}</p>
          <p><strong>Lab Status:</strong> ${record.labStatus}</p>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <h2>Prescriptions</h2>
          <ul class="audit">
            <li>${record.medication} - active prescription</li>
            <li>Pharmacy refill status: Active</li>
          </ul>
        </div>

        <div class="card">
          <h2>Provider Notes</h2>
          <p>${record.notes}</p>
        </div>
      </div>

      <div class="card">
        <h2>Doctor Actions</h2>
        ${renderRoleActions(record)}
      </div>
    `;
  }

  if (currentUser.role === "nurse") {
    return `
      <div class="grid">
        <div class="card">
          <h2>Visit History</h2>
          <ul class="audit">
            <li>${record.visitDate || "2026-05-12"} - ${record.type}</li>
            <li>2026-03-08 - Annual wellness visit</li>
            <li>2025-12-19 - Urgent care visit</li>
          </ul>
        </div>

        <div class="card">
          <h2>Vitals History</h2>
          <ul class="audit">
            <li>Current: ${record.vitals}</li>
            <li>Previous: BP 126/80, HR 74, Temp 98.3°F</li>
          </ul>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <h2>Care Notes</h2>
          <p>${record.summary}</p>
        </div>

        <div class="card">
          <h2>Lab Status</h2>
          <p><strong>${record.labStatus}</strong></p>
          <p class="footer-note">Nurses can review routine lab status and update vitals.</p>
        </div>
      </div>

      <div class="card">
        <h2>Nurse Actions</h2>
        ${renderRoleActions(record)}
      </div>
    `;
  }

 if (currentUser.role === "admin") {
  return `
    <div class="grid">
      <div class="card">
        <h2>Appointments</h2>
        <ul id="chartAppointments" class="audit"></ul>
      </div>

      <div class="card">
        <h2>Result Status</h2>
        <p><strong>${record.labStatus}</strong></p>
        <p class="footer-note">Clinical details are hidden from front desk users.</p>
      </div>
    </div>

    <div class="card">
      <h2>Front Desk Actions</h2>
      ${renderRoleActions(record)}
    </div>
  `;
}

  return `
    <div class="grid">
      <div class="card">
        <h2>Visit History</h2>
        <ul class="audit">
          <li>${record.visitDate || "2026-05-12"} - ${record.type}</li>
          <li>2026-03-08 - Annual wellness visit</li>
          <li>2025-12-19 - Urgent care visit for fever and cough</li>
        </ul>
      </div>

      <div class="card">
        <h2>Appointments</h2>
        <p class="footer-note">You may be due for your annual wellness visit.</p>
        <ul id="chartAppointments" class="audit"></ul>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Prescriptions</h2>
        <ul class="audit">
          <li>${record.medication} - active prescription</li>
          <li>Pharmacy refill status: Active</li>
        </ul>
      </div>

      <div class="card">
        <h2>Annual Wellness Visit Reminder</h2>
        <p>You are due for your yearly wellness appointment.</p>
        <p class="footer-note">Contact your care team to schedule your annual check-up.</p>
      </div>
    </div>

    <div class="card">
      <h2>Patient Services</h2>
      ${renderRoleActions(record)}
    </div>
  `;
}

function renderChartAppointments(patientName) {
  const appointmentList = document.getElementById("chartAppointments");

  if (!appointmentList) return;

  const appointments = getAppointments().filter(item => item.patient === patientName);

  appointmentList.innerHTML = "";

  if (appointments.length === 0) {
    appointmentList.innerHTML = "<li>No appointments scheduled yet.</li>";
    return;
  }

  appointments.forEach(appointment => {
    const li = document.createElement("li");

    li.textContent =
      `${appointment.date} | ${appointment.time} | ${appointment.reason} | ${appointment.status}`;

    appointmentList.appendChild(li);
  });
}

function renderRoleActions(record) {
  if (!currentUser) {
    return "";
  }

  if (currentUser.role === "doctor") {
    return `
      <div class="action-box">
        <h3>Doctor Actions</h3>
        <p class="muted">Doctors can add provider notes, create prescriptions, upload records, and review labs.</p>

        <label>Provider Note</label>
        <textarea id="providerNoteInput" placeholder="Add provider note..."></textarea>
        <button onclick="submitProviderNote()">Add Provider Note</button>

        <label>Medication</label>
        <input type="text" id="prescriptionMedication" placeholder="Medication name" />

        <label>Dosage Instructions</label>
        <input type="text" id="prescriptionDosage" placeholder="Dosage instructions" />

        <button onclick="submitPrescription()">Create Prescription</button>
      </div>
    `;
  }

  if (currentUser.role === "nurse") {
    return `
      <div class="action-box">
        <h3>Nurse Actions</h3>
        <p class="muted">Nurses can update vitals and upload routine medical records, but cannot prescribe medication or open confidential doctor-only records.</p>

        <label>Updated Vitals</label>
        <input type="text" id="vitalsInput" placeholder="Example: BP 120/80, HR 74, Temp 98.6°F" />

        <button onclick="submitVitals()">Update Vitals</button>
      </div>
    `;
  }

  if (currentUser.role === "admin") {
  return `
    <div class="action-box">
      <h3>Front Desk Actions</h3>
      <p class="muted">
        Admin/front desk can schedule appointments and check result status, but cannot
        view or edit clinical notes, diagnoses, or prescriptions.
      </p>

      <label>Appointment Date</label>
      <input type="date" id="appointmentDate" />

      <label>Appointment Time Window</label>
      <select id="appointmentTime">
        <option value="">Select a time window</option>
        <option value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</option>
        <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
        <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
        <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
        <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
      </select>

      <label>Provider</label>
      <select id="appointmentDoctor">
        <option value="Dr. Sarah Ahmed">Dr. Sarah Ahmed</option>
        <option value="Dr. James Carter">Dr. James Carter</option>
        <option value="Dr. Lina Patel">Dr. Lina Patel</option>
      </select>

      <label>Reason for Visit</label>
      <input type="text" id="appointmentReason" placeholder="Annual check-up, follow-up, lab review..." />

      <button onclick="submitAppointment()">Schedule Appointment</button>
    </div>
  `;
  }

  if (currentUser.role === "patient") {
  return `
    <div class="action-box">
      <h3>Patient Services</h3>
      <p class="muted">View your records, prescriptions, lab result status, and visit history.</p>
      <button onclick="downloadPatientSummary()">Download Health Summary</button>
    </div>
  `;
  }

  return "";
}

function submitProviderNote() {
  const noteText = document.getElementById("providerNoteInput").value.trim();

  if (noteText === "") {
    alert("Please enter a provider note.");
    return;
  }

  addProviderNote(selectedRecord.id, noteText, currentUser.username);

  selectedRecord.notes = `${selectedRecord.notes} New provider note: ${noteText}`;
  document.getElementById("chartNotes").textContent = selectedRecord.notes;

  alert("Provider note added successfully.");

  renderAuditLog();
  renderRecords();
  updateLastActivity(`Added provider note to ${selectedRecord.id}`);
}

function submitPrescription() {
  const medication = document.getElementById("prescriptionMedication").value.trim();
  const dosage = document.getElementById("prescriptionDosage").value.trim();

  if (medication === "" || dosage === "") {
    alert("Please enter medication and dosage.");
    return;
  }

  addPrescription(selectedRecord.patient, medication, dosage, currentUser.username);

  document.getElementById("chartPrescription").textContent =
    `${medication} - ${dosage}`;

  alert("Prescription created successfully.");

  renderAuditLog();
  updateLastActivity(`Created prescription for ${selectedRecord.patient}`);
}

function submitVitals() {
  const vitals = document.getElementById("vitalsInput").value.trim();

  if (vitals === "") {
    alert("Please enter vitals.");
    return;
  }

  addVitals(selectedRecord.patient, vitals, currentUser.username);

  selectedRecord.vitals = vitals;
  document.getElementById("chartVitals").textContent = vitals;

  alert("Vitals updated successfully.");

  renderAuditLog();
  renderRecords();
  updateLastActivity(`Updated vitals for ${selectedRecord.patient}`);
}

function submitAppointment() {
  const date = document.getElementById("appointmentDate").value;
  const time = document.getElementById("appointmentTime").value;
  const doctor = document.getElementById("appointmentDoctor").value;
  const reason = document.getElementById("appointmentReason").value.trim();

  if (date === "" || time === "" || reason === "") {
    alert("Please complete all appointment fields.");
    return;
  }

  const fullReason = `${reason} with ${doctor}`;

  addAppointment(selectedRecord.patient, date, time, fullReason, currentUser.username);

  alert("Appointment scheduled successfully.");

  renderChartAppointments(selectedRecord.patient);
  renderAuditLog();
  updateLastActivity(`Scheduled appointment for ${selectedRecord.patient}`);
}

function downloadPatientSummary() {
  alert("Patient record summary downloaded successfully.\n\n(patient_summary_mock.pdf)");
}

async function handleUpload() {
  const fileName = document.getElementById("fileName").value.trim();
  const patientName = document.getElementById("patientName").value.trim();
  const recordType = document.getElementById("recordType").value.trim();
  const fileSize = document.getElementById("fileSize").value.trim();
  const uploadResult = document.getElementById("uploadResult");

  if (
    fileName === "" ||
    patientName === "" ||
    recordType === "" ||
    fileSize === ""
  ) {
    showMessage(
      uploadResult,
      "Upload rejected: all fields are required.",
      "denied"
    );

    return;
  }

  if (
    !fileName.endsWith(".pdf") &&
    !fileName.endsWith(".txt")
  ) {
    showMessage(
      uploadResult,
      "Upload rejected: only .pdf and .txt files are allowed.",
      "denied"
    );

    return;
  }

  const uploadResponse = await apiUploadRecord(
    currentUser,
    fileName,
    patientName,
    recordType,
    fileSize
  );

  if (!uploadResponse.ok) {
    showMessage(
      uploadResult,
      `Upload failed: ${uploadResponse.data.message}`,
      "denied"
    );

    return;
  }

  uploadedFiles++;

  showMessage(
    uploadResult,
    `Upload successful: ${uploadResponse.data.filename} added for ${patientName}. File marked for AES-256 encryption before storage.`,
    "success"
  );

  renderAuditLog();
  updateAdminStats();
  updateLastActivity(`Uploaded ${fileName}`);

  document.getElementById("fileName").value = "";
  document.getElementById("patientName").value = "";
  document.getElementById("recordType").value = "";
  document.getElementById("fileSize").value = "";
}

function renderAuditLog() {
  const auditLog = document.getElementById("auditLog");
  auditLog.innerHTML = "";

  getAuditLogs().forEach(log => {
    const li = document.createElement("li");

    li.textContent =
      `[${log.time}] ${log.user} - ${log.action} (${log.status})`;

    auditLog.appendChild(li);
  });
}

function updateAdminStats() {
  const failed = document.getElementById("failedLoginCount");
  const denied = document.getElementById("deniedAccessCount");
  const uploaded = document.getElementById("uploadedFileCount");
  const alerts = document.getElementById("siemAlertCount");

  if (failed) failed.textContent = failedLoginAttempts;
  if (denied) denied.textContent = deniedAccessAttempts;
  if (uploaded) uploaded.textContent = uploadedFiles;
  if (alerts) alerts.textContent = siemAlerts;
}

function showNotifications() {
  alert(
    "Notifications:\n\n• MFA verified\n• Audit logging active\n• TLS 1.3 secure connection\n• No critical system failures"
  );
}

function downloadAuditReport() {
  alert(
    "Audit report downloaded successfully.\n\n(report_download_mock.pdf)"
  );
}

function updateLastActivity(activity) {
  const lastActivity = document.getElementById("lastActivity");
  if (lastActivity) {
    lastActivity.textContent = activity;
  }
}

function startSessionTimer() {
  clearInterval(sessionInterval);

  sessionSeconds = 900;

  sessionInterval = setInterval(() => {
    sessionSeconds--;

    const minutes = Math.floor(sessionSeconds / 60);
    const seconds = sessionSeconds % 60;

    const sessionTimer = document.getElementById("sessionTimer");
    if (sessionTimer) {
      sessionTimer.textContent =
        `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;
}

    if (sessionSeconds <= 0) {
      clearInterval(sessionInterval);
      alert("Session expired.");
      logout();
    }
  }, 1000);
}

function logout() {

  document.getElementById("currentUser").classList.add("hidden");
  currentUser = null;
  pendingUser = null;
  selectedRecord = null;

  clearInterval(sessionInterval);

  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("protectedContent").classList.add("hidden");
  document.getElementById("navMenu").classList.add("hidden");
  document.getElementById("notificationBell").classList.add("hidden");
  document.getElementById("currentUser").textContent = "No user logged in";

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("mfaCode").value = "";
}

function showCreateAccountMessage() {
  const loginResult = document.getElementById("loginResult");

  showMessage(
    loginResult,
    "Account creation is disabled in this beta release. New accounts must be approved by a system administrator.",
    "warning"
  );
}

function showForgotPasswordMessage() {
  const loginResult = document.getElementById("loginResult");

  showMessage(
    loginResult,
    "Password reset would send a secure email verification link in the full release.",
    "warning"
  );
}

async function analyzeAuditLogs() {
  const summaryBox = document.getElementById("llmSummary");

  const riskLevel =
    failedLoginAttempts >= 5 || siemAlerts >= 3 || deniedAccessAttempts > 0
      ? "High"
      : failedLoginAttempts >= 2 || siemAlerts > 0
      ? "Medium"
      : "Low";

  const finding =
    riskLevel === "Low"
      ? "No unusual access activity was detected in this session."
      : "Some access activity needs administrator review.";

  summaryBox.innerHTML = `
    <div class="security-report">
      <div class="security-report-header">
        <div>
          <h2>Security Review Summary</h2>
          <p>Audit activity reviewed for login attempts, denied access, medical uploads, and system alerts.</p>
        </div>
        <span class="risk-badge ${riskLevel.toLowerCase()}">${riskLevel} Risk</span>
      </div>

      <div class="security-summary-grid">
        <div class="security-card"><span>Failed Logins</span><strong>${failedLoginAttempts}</strong></div>
        <div class="security-card"><span>Denied Access</span><strong>${deniedAccessAttempts}</strong></div>
        <div class="security-card"><span>Medical Uploads</span><strong>${uploadedFiles}</strong></div>
        <div class="security-card"><span>Alerts</span><strong>${siemAlerts}</strong></div>
      </div>

      <div class="security-section">
        <h3>AI Findings</h3>
        <p>${finding}</p>
        <p>MFA login, role-based access, and audit logging are active.</p>
      </div>

      <div class="security-section">
        <h3>Recommended Actions</h3>
        <p>• Continue monitoring login and access logs.</p>
        <p>• Review failed login or denied access events when they occur.</p>
        <p>• Keep backend RBAC as the final authorization control.</p>
      </div>
    </div>
  `;

  summaryBox.className = "result warning";
  summaryBox.classList.remove("hidden");

  if (currentUser) {
    addAuditLog(currentUser.username, "Requested security audit review", "Success");
  }

  renderAuditLog();
}

function showMessage(element, message, className) {
  element.textContent = message;
  element.className = `result ${className}`;
  element.classList.remove("hidden");
}

function configureRoleNavigation() {
  const uploadButton = document.getElementById("uploadNavButton");
  const auditButton = document.getElementById("auditNavButton");
  const securityButton = document.getElementById("securityNavButton");
  const adminButton = document.getElementById("adminStatsButton");

  uploadButton.classList.add("hidden");
  auditButton.classList.add("hidden");
  securityButton.classList.add("hidden");
  adminButton.classList.add("hidden");

  if (currentUser.role === "doctor" || currentUser.role === "nurse") {
    uploadButton.classList.remove("hidden");
    auditButton.classList.remove("hidden");
    securityButton.classList.remove("hidden");
  }

  if (currentUser.role === "admin") {
    auditButton.classList.remove("hidden");
    securityButton.classList.remove("hidden");
    adminButton.classList.remove("hidden");
  }

  if (currentUser.role === "patient") {
    uploadButton.classList.add("hidden");
    auditButton.classList.add("hidden");
    securityButton.classList.add("hidden");
    adminButton.classList.add("hidden");
  }
}