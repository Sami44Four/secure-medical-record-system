# Secure Medical Record System

## Overview

The **Secure Medical Record System** is a healthcare-focused web application developed for **CISS 346 – Secure Software Engineering**. The project demonstrates how secure software engineering principles can be applied to a medical record portal that manages sensitive healthcare information.

The system includes authentication, role-based access control, audit logging, security monitoring, automated testing, CI/CD workflows, and an AI-assisted Security Assistant for reviewing system activity.

This repository is being improved beyond the original course submission based on final presentation feedback. The current focus is strengthening the project scope, authorization model, account provisioning, upload validation, audit logging, and security monitoring.

---

## Project Scope

This project is a **Secure Medical Record System**, not a general-purpose file-sharing platform.

File uploads are included only as part of medical record management. The purpose of the system is to protect sensitive healthcare information through secure access control, auditability, monitoring, and administrative review.

This project is an **educational prototype** and is not intended for production healthcare use without additional security, compliance, infrastructure, and operational improvements.

---

## Core Features

* Role-specific healthcare portals
* Authentication and password hashing
* Role-Based Access Control
* Medical record access
* Appointment management
* Audit logging
* Security Review dashboard
* Security Assistant
* Automated testing
* GitHub Actions CI/CD

---

## User Portals

### Doctor Portal

* View authorized patient records
* Review patient information
* Review prescriptions and treatment information

### Nurse Portal

* View authorized patient information
* Update approved patient-related data
* Access nursing-specific functionality

### Administrator Portal

* Manage appointments
* Review audit logs
* Access Security Review
* Use the Security Assistant

### Patient Portal

* View personal medical records
* Review prescriptions
* View appointments
* Access personal healthcare information only

---

## Security Features

### Authentication

* Username and password authentication
* Secure password hashing using Werkzeug Security
* Protected routes requiring authentication

### Authorization

The original course version used four broad roles: **Doctor**, **Nurse**, **Administrator**, and **Patient**.

Based on final presentation feedback, the authorization model is being redesigned to better reflect real healthcare systems. The improved design separates:

* **Users**
* **Roles**
* **Permissions**
* **Patient relationships**
* **Resource types**
* **Audit logs**

More details are documented in `docs/security-model.md`.

### Audit Logging

The system records security-relevant activity, including:

* Successful login attempts
* Failed login attempts
* Medical record access
* Upload activity
* Administrative actions
* Security monitoring events

### Upload Validation

The current prototype rejects unsupported file types, but upload validation is being strengthened. File extension checks alone are not enough because malicious files can be renamed to appear safe.

Planned improvements include:

* MIME type validation
* File signature validation
* File size limits
* Detection of renamed executable files
* Logging rejected uploads

---

## Technology Stack

| Component           | Technology            |
| ------------------- | --------------------- |
| **Frontend**        | HTML, CSS, JavaScript |
| **Backend**         | Python, Flask         |
| **Database**        | SQLite                |
| **Authentication**  | Werkzeug Security     |
| **Testing**         | Jest, pytest          |
| **Static Analysis** | ESLint                |
| **CI/CD**           | GitHub Actions        |
| **Version Control** | GitHub                |

---

## Setup Instructions

### Prerequisites

Install:

* Python 3.x
* Node.js
* npm
* Git

### Clone the Repository

```bash
git clone https://github.com/Sami44Four/secure-medical-record-system.git
cd secure-medical-record-system
```

### Create a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Run the Backend

```bash
python3 backend/app.py
```

Backend URL:

```text
http://127.0.0.1:5000
```

### Run the Frontend

```bash
cd frontend
python3 -m http.server 8000
```

Frontend URL:

```text
http://localhost:8000
```

---

## Testing

### Backend Tests

```bash
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Static Analysis

```bash
cd frontend
npm run lint
```

---

## CI/CD

GitHub Actions automatically performs:

* Frontend testing
* Backend testing
* ESLint validation
* Workflow verification

---

## Improvements Based on Final Presentation Feedback

After the final presentation, several areas were identified for improvement. The main feedback focused on project scope, account provisioning, authorization design, upload validation, and overall security maturity.

Current improvement areas include:

* Clarifying the system scope as a medical record system
* Redesigning authorization beyond broad job-title roles
* Adding account approval and provisioning
* Strengthening upload validation
* Expanding audit logging
* Improving security monitoring
* Adding tests for security controls

More details are documented in `docs/improvement-plan.md`.

---

## Known Limitations

The current version is an educational prototype and has several known limitations:

* Authorization is not yet fully permission-based
* User accounts are predefined instead of approved through a full provisioning workflow
* Upload validation should be strengthened
* SQLite is used instead of a production database
* Encryption at rest is planned but not fully implemented
* MFA is not yet implemented
* Emergency access is documented as a future enhancement
* The system is not production-ready for real healthcare use

---

## Project Documentation

Repository documentation includes:

* `README.md` — project overview and setup
* `docs/security-model.md` — improved healthcare authorization model
* `docs/improvement-plan.md` — feedback-based improvement roadmap
* Threat modeling artifacts
* STRIDE analysis
* Testing evidence
* CI/CD workflows
* GitHub Issues and Project Board

Course deliverables such as the final report and presentation were submitted through Canvas.

---

## Team

### Sami Mahmoud

Primary responsibilities included:

* Backend development
* API development
* Database integration
* Authentication implementation
* Server-side functionality

### Maryam Ashraf

Primary responsibilities included:

* User-facing healthcare portal design
* Frontend development
* Role-specific interfaces
* Security Assistant interface
* Testing support
* Documentation and presentation materials

### Shared Responsibilities

Shared responsibilities included:

* Threat modeling
* STRIDE analysis
* Security design
* System testing
* Integration
* Final report
* Presentation preparation

---

## Course Information

**Course:** CISS 346 – Secure Software Engineering
**Instructor:** Professor Mubarak Mohammed
**Project:** Secure Medical Record System

---

## License

MIT License
