let currentUser = null;

const users = {
  doctor: {
    username: "doctor1",
    role: "doctor"
  },
  nurse: {
    username: "nurse1",
    role: "nurse"
  }
};

const record = {
  name: "patient_record_1.pdf",
  requiredRole: "doctor"
};

function login(userType) {
  currentUser = users[userType];

  document.getElementById("currentUser").textContent =
    `Logged in as ${currentUser.username} (${currentUser.role})`;

  document.getElementById("accessResult").textContent = "";

  addLog(`${currentUser.username} logged in as ${currentUser.role}`);
}

function accessRecord() {
  const result = document.getElementById("accessResult");

  if (!currentUser) {
    result.textContent = "Please log in before accessing records.";
    result.className = "denied";
    addLog("Access attempt blocked: no user logged in");
    return;
  }

  if (currentUser.role === record.requiredRole) {
    result.textContent = `Access granted: ${currentUser.username} can view ${record.name}`;
    result.className = "success";
    addLog(`Access granted: ${currentUser.username} viewed ${record.name}`);
  } else {
    result.textContent = `Access denied: ${currentUser.username} does not have permission to view ${record.name}`;
    result.className = "denied";
    addLog(`Access denied: ${currentUser.username} attempted to view ${record.name}`);
  }
}

function addLog(message) {
  const log = document.getElementById("auditLog");
  const item = document.createElement("li");
  const time = new Date().toLocaleString();

  item.textContent = `[${time}] ${message}`;
  log.prepend(item);
}