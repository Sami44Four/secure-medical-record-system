# Secure Medical Record System

## Overview

The **Secure Medical Record System** is a healthcare-focused web application developed for **CISS 346 – Secure Software Engineering**. The project demonstrates how secure software engineering principles can be applied to a medical record portal that manages sensitive healthcare information.

The system provides role-based access to medical records for clinical, administrative, security, and patient users. It includes authentication, authorization, audit logging, security monitoring, automated testing, CI/CD workflows, and an AI-assisted Security Assistant for reviewing system activity.

This repository is being improved beyond the original course submission based on final presentation feedback. The main focus of the improved version is to make the system closer to a realistic healthcare application by strengthening scope clarity, account provisioning, authorization design, upload validation, audit logging, and security monitoring.

---

## Project Scope

This project is a **Secure Medical Record System**, not a general-purpose file-sharing platform.

File upload functionality exists only as part of medical record management. The purpose of the system is to protect sensitive healthcare information through secure access control, auditability, monitoring, and administrative review.

The current project is an **educational prototype**. It is not intended for production healthcare use without additional security, compliance, deployment, infrastructure, and operational improvements.

---

## Project Objectives

The main objectives of this project are to:

* Protect sensitive healthcare information
* Implement secure authentication and authorization
* Enforce least privilege access control
* Maintain accountability through audit logging
* Demonstrate threat-model-driven security design
* Support role-specific healthcare workflows
* Implement automated testing and CI/CD practices
* Identify realistic improvements needed for production-level healthcare systems

---

## Current System Features

### Doctor Portal

The doctor portal supports provider-focused workflows, including:

* Viewing authorized patient medical records
* Reviewing patient information
* Reviewing prescriptions and treatment information
* Accessing provider-specific functionality

### Nurse Portal

The nurse portal supports nursing-related workflows, including:

* Viewing authorized patient information
* Updating approved patient data
* Accessing nursing-specific functionality

### Administrator Portal

The administrator portal supports operational and review workflows, including:

* Managing appointments
* Reviewing audit logs
* Accessing the Security Review dashboard
* Using the Security Assistant
* Reviewing system activity and security-related events

### Patient Portal

The patient portal supports patient self-service access, including:

* Viewing personal medical records
* Reviewing prescriptions
* Viewing appointments
* Accessing personal healthcare information only

---

## Security Features

### Authentication

The system includes:

* Username and password authentication
* Secure password hashing using Werkzeug Security
* Authentication required before accessing protected resources

### Authorization

The original course version used broad role-based access control with four primary roles:

* Doctor
* Nurse
* Administrator
* Patient

This provided a basic access control structure, but final review feedback identified that the model was too simplified for a realistic healthcare environment.

The improved design moves toward a stronger model that separates:

* **Users**
* **Roles**
* **Permissions**
* **Patient relationships**
* **Resource types**
* **Context**
* **Audit logs**

This allows the system to make access decisions based on responsibility and need rather than job title alone.

### Audit Logging

The system records security-relevant activity, including:

* Successful login attempts
* Failed login attempts
* Medical record access
* Upload activity
* Administrative actions
* Security monitoring events

Audit logging supports accountability by recording who performed an action, what action occurred, when it happened, and whether the action was successful.

### Upload Validation

The current prototype rejects unsupported file types to reduce the risk of unsafe uploads. However, upload validation should be strengthened before the system could be considered realistic.

File extension checks alone are not enough because a malicious file can be renamed to appear safe.

Planned upload validation improvements include:

* MIME type validation
* File signature validation
* File size limits
* Detection of renamed executable files
* Logging rejected uploads
* Future malware scanning or deeper content inspection

### Security Monitoring

The Security Review dashboard provides visibility into system activity, including:

* Failed login activity
* Suspicious behavior indicators
* Risk-level review
* Security-relevant events

Planned improvements include alerts for repeated failed login attempts, rejected upload attempts, access-denied events, and unusual administrative actions.

### Security Assistant

The Security Assistant analyzes audit log information and provides:

* Security summaries
* Risk assessments
* Administrative recommendations

The Security Assistant is advisory only. It does not make authorization decisions, modify permissions, or replace administrator review.

---

## Improved Healthcare Access Control Model

### Why the Original RBAC Model Needed Improvement

The original version of the project used four broad roles: **Doctor**, **Nurse**, **Administrator**, and **Patient**.

During the final review, it became clear that this model was too simplified for a realistic healthcare environment. In real healthcare systems, access is not usually based only on a broad job title. A user’s access should depend on their role, assigned responsibilities, patient relationship, requested action, and the type of medical data being accessed.

For example, not every nurse has the same level of access. A registered nurse may be able to update vitals and review medication information for assigned patients, while a nurse practitioner may have additional clinical privileges such as writing notes, ordering labs, or prescribing medication depending on organizational policy.

Similarly, an administrator may need to manage appointments or patient demographics, but that does not mean they should be able to view detailed clinical notes. A system administrator may need to manage accounts and permissions, but should not automatically have access to medical record content.

The improved model is designed around this question:

**Does this approved user have the correct permission to perform this action on this type of patient data, and do they have a valid relationship to this patient?**

---

## Authorization Concepts

| Concept                  | Meaning                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **User**                 | The individual person using the system                                                                            |
| **Role**                 | The user’s job function or system function                                                                        |
| **Permission**           | The specific action the user is allowed to perform                                                                |
| **Patient Relationship** | Whether the user is assigned to or involved in the patient’s care                                                 |
| **Resource Type**        | The type of information being accessed, such as vitals, prescriptions, notes, labs, appointments, or demographics |
| **Context**              | Additional conditions such as emergency access, account status, department, or time of access                     |
| **Audit Log**            | A record of who accessed what, when, and why                                                                      |

This model improves the original design because it supports:

* Least privilege
* Separation of duties
* Better accountability
* More realistic healthcare workflows
* More flexible permission management
* Stronger backend authorization checks

---

## Proposed Role and Permission Model

| Role                         | Realistic Purpose                                                               | Example Permissions                                                                                                             | Restrictions                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Physician**                | Provides diagnosis and treatment for assigned patients                          | View assigned patient records, edit diagnoses, write clinical notes, write prescriptions, order labs, upload clinical documents | Should only access patients under their care unless emergency access is used                   |
| **Registered Nurse**         | Supports patient care and updates nursing information                           | View assigned patient records, update vitals, view medications, add nursing notes                                               | Should not edit diagnoses or write prescriptions                                               |
| **Nurse Practitioner**       | Provides advanced clinical care with broader privileges than a registered nurse | View assigned patient records, write clinical notes, order labs, write prescriptions, update treatment information              | Should still be limited to assigned patients and approved clinical permissions                 |
| **Medical Assistant**        | Supports basic clinical intake and patient preparation                          | View assigned appointments, update vitals, update intake forms                                                                  | Should not access full clinical notes, diagnoses, or prescriptions unless specifically allowed |
| **Front Desk Administrator** | Handles scheduling and basic patient information                                | Manage appointments, update contact information, verify demographics                                                            | Should not view detailed medical notes, diagnoses, prescriptions, or lab results               |
| **Billing Staff**            | Handles billing and insurance-related workflows                                 | View billing information, insurance details, appointment codes, payment status                                                  | Should not access full clinical notes unless required for billing review                       |
| **Lab Technician**           | Handles lab-related workflows                                                   | View lab orders, upload lab results, update lab status                                                                          | Should not access unrelated clinical notes or billing information                              |
| **Pharmacist**               | Reviews medication-related information                                          | View prescriptions, medication history, allergy information                                                                     | Should not access full unrelated medical records unless needed for medication safety           |
| **Security Reviewer**        | Reviews system activity and security events                                     | View audit logs, view failed login attempts, view access-denied events, review security alerts                                  | Should not edit patient records or clinical information                                        |
| **System Administrator**     | Manages system accounts and technical configuration                             | Approve users, assign roles, deactivate accounts, reset access, manage system settings                                          | Should not automatically view patient medical content unless explicitly granted                |
| **Patient**                  | Views their own healthcare information                                          | View own records, view own prescriptions, view own appointments, download own documents                                         | Cannot access other patients’ records or administrative dashboards                             |

---

## Access Decision Logic

In the improved design, access should be evaluated using multiple checks instead of only checking the user’s role.

A request should be approved only if all required conditions are met:

1. The user is authenticated.
2. The user account is active and approved.
3. The user has the required permission.
4. The user is allowed to access the requested patient or resource.
5. The requested action matches the user’s responsibility.
6. Sensitive access is logged for accountability.

### Example Access Decisions

A **registered nurse** may have permission to view assigned patient records and update vitals. However, that does not mean the nurse can view every patient in the system. The system should also check whether the patient is assigned to that nurse or belongs to the nurse’s unit.

A **front desk administrator** may be allowed to update appointment information and demographics, but should not be able to view clinical notes, prescriptions, diagnoses, or lab results.

A **system administrator** may be allowed to approve accounts and assign roles, but should not automatically receive access to sensitive medical records.

A **security reviewer** may be allowed to view audit logs and security alerts, but should not be able to edit patient records.

A **patient** should only be able to view their own records and should never be able to access another patient’s information.

---

## Planned Authorization Improvement

The improved authorization model will follow this structure:

```text
User
 ↓
Account Status: pending / approved / rejected / disabled
 ↓
Role: physician / registered nurse / nurse practitioner / front desk administrator / security reviewer / patient
 ↓
Permission: view_records / update_vitals / write_prescriptions / approve_users / view_audit_logs
 ↓
Patient Relationship: assigned patient / own record / same department / emergency access
 ↓
Audit Log: record every sensitive action
```

This approach is closer to real healthcare security because it does not assume that a job title alone is enough to approve access.

---

## Emergency Access Future Enhancement

A future version could include **break-glass emergency access**.

Break-glass access would allow temporary access to restricted patient information during emergencies. The user would be required to provide a reason, and the action would be logged as a high-risk audit event for administrator review.

This access should not replace normal permissions. It should only be used for urgent situations and should always be reviewed afterward.

Planned break-glass controls include:

* Required emergency reason
* Temporary access only
* High-risk audit log entry
* Administrator review
* Security alert generation

---

## System Architecture

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

* Authentication
* Authorization
* RBAC
* Audit Logs
* Security Review dashboard
* Security Assistant

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

## Deployment Guide

### Prerequisites

Install the following before running the project:

* Python 3.x
* Node.js
* npm
* Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/Sami44Four/secure-medical-record-system.git
cd secure-medical-record-system
```

### Step 2: Create a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 5: Run the Backend

```bash
python3 backend/app.py
```

Backend URL:

```text
http://127.0.0.1:5000
```

### Step 6: Run the Frontend

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

### Backend Testing

Run:

```bash
pytest
```

Expected result:

```text
5 passed
```

### Frontend Testing

Run:

```bash
cd frontend
npm test
```

Expected result:

```text
10 passed
```

### Static Analysis

Run:

```bash
cd frontend
npm run lint
```

---

## Continuous Integration

GitHub Actions automatically performs:

* Frontend testing
* Backend testing
* ESLint validation
* Workflow verification

CI/CD was included to improve software reliability, reduce regressions, and validate changes whenever code is pushed to the repository.

---

## Monitoring and Audit Review

### Audit Logs

The system records:

* Successful logins
* Failed logins
* Medical record access
* Upload activity
* Administrative actions

To review audit logs:

1. Log in as an administrator.
2. Navigate to the Audit Logs page.
3. Review recorded events.

### Security Review

The Security Review dashboard analyzes:

* Failed login activity
* Suspicious behavior
* Risk levels

To review security risk levels:

1. Log in as an administrator.
2. Open Security Review.
3. Analyze current system activity.
4. Review generated risk classifications.

### Security Assistant

The Security Assistant uses audit log information to generate:

* Security summaries
* Risk assessments
* Administrative recommendations

---

## Improvements Based on Final Presentation Feedback

After the final presentation, several areas were identified for improvement. The main feedback focused on project scope, account provisioning, authorization design, upload validation, and overall security maturity.

### Scope Clarification

The project scope has been clarified as a **Secure Medical Record System**. File uploads are part of medical record management and are not the main purpose of the system.

### Account Provisioning

The current course version uses predefined demonstration accounts. A future version should include an account provisioning workflow where users are reviewed and approved by an administrator before receiving access.

Planned improvements include:

* Pending, approved, rejected, and disabled account statuses
* Administrator approval workflow
* Role assignment during approval
* Account deactivation
* Audit logs for account approval, rejection, and role changes

### Authorization Model

The original version used broad roles. The improved version will move toward a more realistic access control model using roles, permissions, patient relationships, and audit logging.

Planned improvements include:

* More granular roles
* Permission-based authorization checks
* Patient assignment checks
* Separation of clinical, administrative, technical, and security duties
* Backend enforcement of authorization rules
* Tests for allowed and denied access

### Upload Validation

The current upload validation should be strengthened. File extension checks alone are not enough because malicious files can be renamed to appear safe.

Planned improvements include:

* MIME type checks
* File signature checks
* File size limits
* Rejection of executable file signatures
* Additional logging for rejected uploads

### Audit Logging and Monitoring

The audit logging and monitoring features will be expanded to better support security review.

Planned improvements include:

* Logs for failed authorization checks
* Logs for rejected uploads
* Logs for account approval and rejection
* Alerts for repeated failed login attempts
* Alerts for suspicious upload attempts
* Security review for high-risk events

---

## Known Limitations

The current version is an educational prototype and has several known limitations:

* Authorization is not yet fully permission-based
* User accounts are predefined instead of being approved through a full provisioning workflow
* Upload validation should be strengthened
* SQLite is used instead of a production database
* Encryption at rest is planned but not fully implemented
* MFA is not yet implemented
* Emergency access is documented as a future enhancement
* The system is not production-ready for real healthcare use

---

## Future Enhancements

### Security Enhancements

* AES-256 encryption for stored medical records
* Multi-Factor Authentication
* JWT-based session management
* Stronger account provisioning workflow
* Permission-based authorization
* Emergency break-glass access
* Immutable audit logging

### Monitoring Enhancements

* SIEM integration
* Log rotation policies
* Advanced alerting
* Security event classification
* Expanded Security Assistant analysis

### Infrastructure Enhancements

* PostgreSQL or MySQL migration
* Docker containerization
* Cloud deployment support
* Backup and recovery planning
* Production deployment documentation

---

## Project Documentation

Course deliverables such as the final report and presentation were submitted through Canvas.

Repository-based documentation includes:

* README and setup instructions
* Threat modeling artifacts
* Data Flow Diagrams
* STRIDE analysis
* Testing evidence
* CI/CD workflows
* Retrospective document
* GitHub Issues and Project Board

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
