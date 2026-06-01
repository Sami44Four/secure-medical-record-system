# 🏥 Secure Medical Record System

## 📖 Overview

### Project Description

The Secure Medical Record System is a healthcare web application developed for CISS 346 Secure Software Engineering. The project demonstrates how secure software engineering principles can be integrated throughout the software development lifecycle while managing sensitive healthcare information.

The system provides role-based access to medical records, audit logging, security monitoring, automated testing, and an AI-assisted Security Assistant for reviewing system activity and identifying potential security concerns.

### Project Objectives

* Protect sensitive healthcare information
* Implement secure authentication and authorization
* Enforce Role-Based Access Control (RBAC)
* Maintain accountability through audit logging
* Demonstrate threat-model-driven security design
* Implement automated testing and CI/CD practices

---

## ✨ System Features

### 👨‍⚕️ Doctor Portal

* View patient medical records
* Review patient information
* Access provider-specific functionality
* Review prescriptions and treatment information

### 👩‍⚕️ Nurse Portal

* View assigned patient information
* Update authorized patient data
* Access nursing-specific functionality

### 🧑‍💼 Administrator Portal

* Manage appointments
* Review audit logs
* Access Security Review dashboard
* Use the Security Assistant

### 👤 Patient Portal

* View personal medical records
* Review prescriptions
* View appointments
* Access personal healthcare information

---

## 🔐 Security Features

### Authentication

* Username and password authentication
* Secure password hashing using Werkzeug Security

### Authorization

* Role-Based Access Control (RBAC)
* Principle of least privilege
* Role-specific dashboards and functionality

### Audit Logging

* Login activity tracking
* Medical record access logging
* Upload activity tracking
* Administrative activity monitoring

### Upload Validation

* Unsupported file types are rejected
* Protection against potentially malicious uploads

### Security Monitoring

* Failed login tracking
* Risk-level analysis
* Security Review dashboard

### Security Assistant

* Audit log analysis
* Risk summaries
* Administrative recommendations

---

## 🏗️ System Architecture

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Python
* Flask
* REST APIs

### Database

* SQLite

### Security Components

* Audit Logs
* Security Review
* Security Assistant

---

## 💻 Technology Stack

| Component       | Technology            |
| --------------- | --------------------- |
| Frontend        | HTML, CSS, JavaScript |
| Backend         | Python, Flask         |
| Database        | SQLite                |
| Authentication  | Werkzeug Security     |
| Testing         | Jest, Pytest          |
| Static Analysis | ESLint                |
| CI/CD           | GitHub Actions        |
| Version Control | GitHub                |

---

# 🚀 Deployment Guide

## Prerequisites

### Required Software

* Python 3.x
* Node.js
* npm
* Git

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/Sami44Four/secure-medical-record-system.git
cd secure-medical-record-system
```

---

## Step 2: Create a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Step 3: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

## Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## Step 5: Run the Backend

```bash
python3 backend/app.py
```

### Backend URL

```text
http://127.0.0.1:5000
```

---

## Step 6: Run the Frontend

```bash
cd frontend
python3 -m http.server 8000
```

### Frontend URL

```text
http://localhost:8000
```

---

# ⚙️ Configuration

## User Roles

The system supports four primary roles:

### Doctor

Access to authorized patient records and provider functionality.

### Nurse

Access to nursing-specific patient information and functionality.

### Administrator

Access to appointments, audit logs, Security Review, and Security Assistant.

### Patient

Access to personal healthcare information only.

---

# 🧪 Testing

## Backend Testing

Run:

```bash
pytest
```

Expected Result:

```text
5 passed
```

---

## Frontend Testing

Run:

```bash
cd frontend
npm test
```

Expected Result:

```text
10 passed
```

---

## Static Analysis

Run:

```bash
cd frontend
npm run lint
```

---

# 🔄 Continuous Integration

## GitHub Actions

GitHub Actions automatically performs:

* Frontend testing
* Backend testing
* ESLint validation
* Workflow verification

### Benefits

* Early bug detection
* Automated validation
* Consistent builds
* Improved software reliability

---

# 📊 Monitoring

## Audit Logs

The system records:

* Successful logins
* Failed logins
* Medical record access
* Upload activity
* Administrative actions

### Reviewing Audit Logs

1. Log in as Administrator
2. Navigate to Audit Logs
3. Review recorded events

---

## Security Review

The Security Review analyzes:

* Failed login activity
* Suspicious behavior
* Risk levels

### Reviewing Security Risk Levels

1. Log in as Administrator
2. Open Security Review
3. Analyze current system activity
4. Review generated risk classifications

---

## Security Assistant

The Security Assistant uses audit log information to generate:

* Security summaries
* Risk assessments
* Administrative recommendations

---

# 📁 Project Documentation

## Included Documentation

* Final Engineering Report
* Threat Modeling Documentation
* Level 0 DFD
* Level 1 DFD
* STRIDE Analysis
* Testing Results
* CI/CD Evidence
* Retrospective Document

---

# 🚧 Known Limitations and Future Enhancements

The following items are documented in the GitHub Project Board and Issue Tracker:

### Security Enhancements

* AES-256 Encryption
* Multi-Factor Authentication (MFA)
* JWT Session Management

### Monitoring Enhancements

* SIEM Integration
* Log Rotation Policies
* Advanced Alerting

### Infrastructure Enhancements

* PostgreSQL Migration
* MySQL Migration
* Production Deployment Support

---

# 👥 Team

## Sami Mahmoud

### Responsibilities

* Backend Development
* API Development
* Database Integration
* Authentication Implementation

---

## Maryam Ashraf

### Responsibilities

* Frontend Development
* Healthcare Portal Design
* Security Assistant Interface
* Testing and Documentation

---

## Shared Responsibilities

* Threat Modeling
* STRIDE Analysis
* Security Design
* System Testing
* Integration
* Final Report

---

# 📚 Course Information

## Course

CISS 346 – Secure Software Engineering

## Instructor

Professor Mubarak Mohammed

## Project

Secure Medical Record System

---

# 📄 License

MIT License
