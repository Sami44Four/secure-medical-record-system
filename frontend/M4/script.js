let currentUser = null;
let pendingUser = null;

let failedLoginAttempts = 0;
let deniedAccessAttempts = 0;
let uploadedFiles = 0;
let siemAlerts = 0;

let sessionSeconds = 900;
let sessionInterval;

function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginResult = document.getElementById("loginResult");

  if (username === "" || password === "") {
    showMessage(loginResult, "Login failed: username and password are required.", "denied");
    return;
  }

  const user = mockLogin(username, password);

  if (!user) {
    failedLoginAttempts++;

    addAuditLog(username || "unknown", "Failed login attempt", "Denied");

    showMessage(
      loginResult,
      "Login failed: invalid username or password.",
      "denied"
    );

    if (failedLoginAttempts >= 3) {
      siemAlerts++;
      document.getElementById("siemStatus").textContent =
        "Suspicious login activity detected";
    }

    renderAuditLog();
    updateAdminStats();
    return;
  }

  pendingUser = user;

  document.getElementById("mfaModal").classList.remove("hidden");
}

function verifyMFA() {
  const code = document.getElementById("mfaCode").value.trim();
  const mfaResult = document.getElementById("mfaResult");

  if (code !== "123456") {
    showMessage(
      mfaResult,
      "Invalid MFA code.",
      "denied"
    );
    return;
  }

  currentUser = pendingUser;

  document.getElementById("mfaModal").classList.add("hidden");

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("protectedContent").classList.remove("hidden");
  document.getElementById("navMenu").classList.remove("hidden");
  document.getElementById("notificationBell").classList.remove("hidden");

  document.getElementById("currentUser").textContent =
    `Logged in as ${currentUser.username} (${currentUser.role})`;

  addAuditLog(
    currentUser.username,
    `${currentUser.role} logged in with MFA`,
    "Success"
  );

  renderProfile();
  renderRecords();
  renderAuditLog();
  updateAdminStats();

  if (currentUser.role === "admin") {
    document.getElementById("adminStatsButton").classList.remove("hidden");
  } else {
    document.getElementById("adminStatsButton").classList.add("hidden");
  }

  showPage("dashboardPage");

  startSessionTimer();
}

function cancelMFA() {
  document.getElementById("mfaModal").classList.add("hidden");
}

function renderProfile() {
  document.getElementById("profileName").textContent =
    currentUser.fullName;

  document.getElementById("profileRole").textContent =
    currentUser.role.toUpperCase();

  document.getElementById("employeeId").textContent =
    currentUser.employeeId;

  document.getElementById("department").textContent =
    currentUser.department;

  document.getElementById("credentials").textContent =
    currentUser.credentials;

  document.getElementById("years").textContent =
    currentUser.years;

  document.getElementById("lastLogin").textContent =
    currentUser.lastLogin;

  document.getElementById("mfaStatus").textContent =
    currentUser.mfaStatus;

  document.getElementById("totalRecords").textContent =
    getMedicalRecords().length;

  document.getElementById("profileInitials").textContent =
    currentUser.fullName
      .split(" ")
      .map(word => word[0])
      .join("")
      .slice(0, 2);

  if (currentUser.role === "admin") {
    document.getElementById("accessLevel").textContent =
      "Full system access";
  } else if (currentUser.role === "doctor") {
    document.getElementById("accessLevel").textContent =
      "Doctor-level records";
  } else {
    document.getElementById("accessLevel").textContent =
      "Nurse-level records";
  }
}

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");

  pages.forEach(page => {
    page.classList.add("hidden");
  });

  document.getElementById(pageId).classList.remove("hidden");
}

function renderRecords() {
  const recordsList =
    document.getElementById("recordsList");

  const searchInput =
    document.getElementById("recordSearch");

  const searchText =
    searchInput.value.toLowerCase();

  recordsList.innerHTML = "";

  const filteredRecords = getMedicalRecords().filter(record => {
    return (
      record.id.toLowerCase().includes(searchText) ||
      record.patient.toLowerCase().includes(searchText) ||
      record.type.toLowerCase().includes(searchText)
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

        <p>
          Required Role:
          <span class="role-pill">${record.requiredRole}</span>

          <span class="status-pill ${record.status.toLowerCase()}">
            ${record.status}
          </span>
        </p>
      </div>

      <button
        class="${isAuthorized ? "" : "denied-button"}"
        onclick="handleRecordAccess('${record.id}')"
      >
        ${isAuthorized ? "View Record" : "Request Access"}
      </button>
    `;

    recordsList.appendChild(recordDiv);
  });
}

function canAccessRecord(record) {
  if (!currentUser) {
    return false;
  }

  return (
    currentUser.role === "admin" ||
    currentUser.role === record.requiredRole
  );
}

function handleRecordAccess(recordId) {
  const accessResult =
    document.getElementById("accessResult");

  const record =
    getMedicalRecords().find(item => item.id === recordId);

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
    `Accessed record ${record.id}`,
    "Granted"
  );

  showMessage(
    accessResult,
    `Access Granted: ${record.patient}'s ${record.type} record opened.`,
    "success"
  );

  openRecordModal(record);

  renderAuditLog();

  updateLastActivity(
    `Opened record ${record.id}`
  );
}

function openRecordModal(record) {
  document.getElementById("modalTitle").textContent =
    `${record.id}: ${record.patient}`;

  document.getElementById("modalSubtitle").textContent =
    `${record.type} | Classification: ${record.status}`;

  document.getElementById("modalSummary").textContent =
    record.summary;

  document.getElementById("modalNotes").textContent =
    record.notes;

  document.getElementById("recordModal")
    .classList.remove("hidden");
}

function closeRecordModal() {
  document.getElementById("recordModal")
    .classList.add("hidden");
}

function handleUpload() {
  const fileName =
    document.getElementById("fileName").value.trim();

  const patientName =
    document.getElementById("patientName").value.trim();

  const recordType =
    document.getElementById("recordType").value.trim();

  const fileSize =
    document.getElementById("fileSize").value.trim();

  const uploadResult =
    document.getElementById("uploadResult");

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

  uploadedFiles++;

  addAuditLog(
    currentUser.username,
    `Uploaded ${fileName} (${fileSize}) for ${patientName}`,
    "Success"
  );

  showMessage(
    uploadResult,
    `Upload successful: ${fileName} added for ${patientName}. File marked for AES-256 encryption before storage.`,
    "success"
  );

  renderAuditLog();

  updateAdminStats();

  updateLastActivity(
    `Uploaded ${fileName}`
  );
}

function renderAuditLog() {
  const auditLog =
    document.getElementById("auditLog");

  auditLog.innerHTML = "";

  getAuditLogs().forEach(log => {
    const li = document.createElement("li");

    li.textContent =
      `[${log.time}] ${log.user} - ${log.action} (${log.status})`;

    auditLog.appendChild(li);
  });
}

function updateAdminStats() {
  const failed =
    document.getElementById("failedLoginCount");

  const denied =
    document.getElementById("deniedAccessCount");

  const uploaded =
    document.getElementById("uploadedFileCount");

  const alerts =
    document.getElementById("siemAlertCount");

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
  document.getElementById("lastActivity").textContent =
    activity;
}

function startSessionTimer() {
  clearInterval(sessionInterval);

  sessionSeconds = 900;

  sessionInterval = setInterval(() => {
    sessionSeconds--;

    const minutes =
      Math.floor(sessionSeconds / 60);

    const seconds =
      sessionSeconds % 60;

    document.getElementById("sessionTimer").textContent =
      `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;

    if (sessionSeconds <= 0) {
      clearInterval(sessionInterval);

      alert("Session expired.");

      logout();
    }
  }, 1000);
}

function logout() {
  currentUser = null;

  document.getElementById("loginPage")
    .classList.remove("hidden");

  document.getElementById("protectedContent")
    .classList.add("hidden");

  document.getElementById("navMenu")
    .classList.add("hidden");

  document.getElementById("notificationBell")
    .classList.add("hidden");

  document.getElementById("currentUser").textContent =
    "No user logged in";
}

function showCreateAccountMessage() {
  const loginResult =
    document.getElementById("loginResult");

  showMessage(
    loginResult,
    "Account creation is disabled in this beta release. New accounts must be approved by a system administrator.",
    "warning"
  );
}

function showForgotPasswordMessage() {
  const loginResult =
    document.getElementById("loginResult");

  showMessage(
    loginResult,
    "Password reset would send a secure email verification link in the full release.",
    "warning"
  );
}

function showMessage(element, message, className) {
  element.textContent = message;
  element.className = `result ${className}`;
  element.classList.remove("hidden");
}