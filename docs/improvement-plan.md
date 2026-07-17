# Improvement Plan

## Purpose

This document explains the planned improvements for the **Secure Medical Record System** after the final presentation and course submission.

The goal of this improvement plan is not only to polish the project, but to make it a stronger portfolio project by addressing feedback from the final review. The main focus is improving the system’s security design, clarifying scope, strengthening access control, and making the project closer to how a real healthcare application should be designed.

---

## Background

The original project began as a secure file-sharing concept and later evolved into a healthcare-focused medical record system. This change created some confusion around the project scope.

During the final review, feedback from the instructor and peers highlighted that the system needed a clearer identity and stronger security design. The project had working features, documentation, testing, CI/CD, and a functioning demo, but the security model was still simplified in several areas.

The main feedback areas were:

* The project scope needed to be clearer.
* The access control model was too broad.
* Account creation and approval were not realistic enough.
* Upload validation needed to be stronger.
* Security decisions needed to better reflect real healthcare workflows.
* The system needed stronger backend enforcement, not only frontend role-based views.
* Some features worked for a class prototype but were not mature enough for a real healthcare setting.

This improvement plan organizes those issues into clear development phases.

---

## Improvement Goals

The main goals for the improved version are to:

* Clarify the project as a **Secure Medical Record System**
* Remove confusion between file sharing and medical record management
* Improve the authorization model beyond four broad roles
* Add account provisioning and approval workflows
* Strengthen file upload validation
* Expand audit logging and security monitoring
* Improve backend enforcement of access rules
* Add tests for security-related behavior
* Document known limitations honestly
* Make the project stronger for a portfolio and future resume use

---

## Improvement Area 1: Project Scope Clarification

### Original Issue

The original project had some confusion between being a secure file-sharing system and being a medical record system.

This caused design problems because a file-sharing system and a healthcare record system have different security requirements. A healthcare application needs stronger controls around patient identity, role-based access, patient relationships, audit logging, and medical data protection.

### Improvement Plan

The project scope has been clarified as a **Secure Medical Record System**.

File uploads are not the main purpose of the system. They are only included as part of medical record management.

### Planned Work

* Update the README to clearly describe the system as a medical record system.
* Remove or rewrite outdated references to general file sharing.
* Explain that the system is an educational prototype.
* Clearly document current features and future improvements.

### Success Criteria

* The README clearly explains the project scope.
* A reader understands that the project is healthcare-focused.
* File upload functionality is described as supporting medical record management, not as the main system purpose.

---

## Improvement Area 2: Realistic Healthcare Authorization Model

### Original Issue

The original version used four broad roles:

* Doctor
* Nurse
* Administrator
* Patient

This was useful for a basic class prototype, but it was too simplified for a realistic healthcare application.

In real healthcare systems, access should not depend only on a broad job title. A user’s access should also depend on their responsibilities, permissions, patient relationship, resource type, and context.

For example:

* A registered nurse and a nurse practitioner may need different privileges.
* A front desk administrator may manage appointments but should not view clinical notes.
* A system administrator may manage accounts but should not automatically access patient records.
* A security reviewer may view logs but should not edit medical records.
* A patient should only access their own records.

### Improvement Plan

The system will move toward a more realistic model that separates:

* Users
* Roles
* Permissions
* Patient relationships
* Resource types
* Account status
* Audit logs

Instead of asking only, “Is this user a doctor?” the system should ask:

**Is this user approved, do they have the required permission, are they allowed to access this patient or resource, and should this action be logged?**

### Planned Work

* Define realistic healthcare roles.
* Define permissions for each role.
* Add helper functions for permission checks.
* Replace broad role checks with permission checks where possible.
* Add patient relationship checks for medical record access.
* Deny access by default when permissions are missing.
* Log denied access attempts.

### Success Criteria

* Authorization logic is not based only on job title.
* Backend routes check permissions before returning sensitive data.
* Patients can only access their own records.
* Clinical users can only access assigned or authorized patient records.
* Administrative users cannot automatically access clinical records.
* Security reviewers can view logs without editing patient data.

---

## Improvement Area 3: Account Provisioning and Approval

### Original Issue

The original system used predefined demonstration accounts. This worked for the class demo, but it did not fully answer how users would realistically receive access.

In a real healthcare system, users should not automatically gain access just because an account exists. Accounts should be reviewed, approved, assigned roles, and disabled when necessary.

### Improvement Plan

Add an account provisioning workflow.

The improved workflow should be:

**User requests account → Account is pending → System administrator reviews request → User is approved or rejected → Approved user receives role and permissions**

### Planned Work

* Add account statuses:

  * pending
  * approved
  * rejected
  * disabled
* Prevent pending, rejected, or disabled users from logging in.
* Add administrator ability to approve users.
* Add administrator ability to reject users.
* Add administrator ability to disable users.
* Log account approval, rejection, and role assignment.
* Add tests for pending and rejected users.

### Success Criteria

* New users do not automatically receive access.
* Only approved users can log in.
* Account approval actions are logged.
* Rejected or disabled users cannot access protected pages.
* Role assignment is controlled by an authorized administrator.

---

## Improvement Area 4: Upload Validation

### Original Issue

The original upload validation rejected unsupported file types, but the validation was not strong enough for a realistic healthcare system.

File extension checks alone are weak because a malicious file can be renamed to look safe. For example, an executable file could be renamed as a `.pdf`.

### Improvement Plan

Strengthen upload validation so the system checks more than the file name.

### Planned Work

* Add file size limits.
* Check file extension.
* Check MIME type.
* Check file signature or magic bytes.
* Reject executable file signatures.
* Log rejected upload attempts.
* Add tests for unsafe uploads.
* Add tests for renamed executable files.

### Success Criteria

* Unsupported file types are rejected.
* Files with unsafe signatures are rejected.
* Renamed executable files are rejected.
* Upload rejection events are logged.
* Upload validation tests pass.

---

## Improvement Area 5: Audit Logging

### Original Issue

The original system included audit logging, but the improved version should log more security-relevant events.

Audit logs are important in healthcare systems because access to sensitive information must be accountable. It should be possible to review who accessed data, what action was performed, when it happened, and whether the action was allowed or denied.

### Improvement Plan

Expand audit logging to capture more important security events.

### Planned Work

Add logs for:

* Successful login
* Failed login
* Login attempt from pending account
* Login attempt from rejected account
* Medical record access
* Access denied due to missing permission
* Access denied due to invalid patient relationship
* File upload
* Rejected file upload
* Account approval
* Account rejection
* Account disabled
* Role assignment
* Security alert generation

### Success Criteria

* Sensitive actions are logged.
* Denied actions are logged.
* Administrative actions are logged.
* Upload rejection attempts are logged.
* Logs include useful information such as user, action, timestamp, status, and risk level.

---

## Improvement Area 6: Security Monitoring and Alerts

### Original Issue

The original system had a Security Review dashboard and Security Assistant, but monitoring can be improved with clearer alert logic.

A realistic system should identify suspicious patterns, not just display raw logs.

### Improvement Plan

Add simple alert rules for common suspicious behavior.

### Planned Work

Create alerts for:

* Multiple failed login attempts
* Repeated access denied events
* Rejected executable upload attempts
* Login attempts from unapproved accounts
* Suspicious administrative actions
* Emergency access events if break-glass access is added later

### Success Criteria

* Security Review identifies high-risk events.
* Suspicious activity is easier to find.
* Security Assistant summaries are based on meaningful audit events.
* Alerts are logged or displayed for administrator review.

---

## Improvement Area 7: Backend Enforcement

### Original Issue

The original system had role-specific dashboards and frontend restrictions. However, frontend restrictions are not enough for security.

A user could bypass the frontend and directly call backend API endpoints. For that reason, authorization must be enforced in the backend.

### Improvement Plan

Strengthen backend route protection.

### Planned Work

* Add permission checks to protected backend routes.
* Deny access when permission is missing.
* Add patient ownership checks for patient records.
* Add assigned-patient checks for clinical users.
* Log unauthorized access attempts.
* Avoid relying only on frontend visibility.

### Success Criteria

* Protected backend routes validate user permissions.
* Users cannot bypass restrictions by calling APIs directly.
* Unauthorized requests are denied and logged.
* Patient data is only returned to authorized users.

---

## Improvement Area 8: Testing

### Original Issue

The original project had backend tests, frontend tests, and CI/CD, but the improved security features need their own test coverage.

Security improvements should not only be documented. They should be tested.

### Improvement Plan

Add tests that prove the new security controls work.

### Planned Work

Add tests for:

* Pending user cannot log in.
* Rejected user cannot log in.
* Approved user can log in.
* Patient cannot access another patient’s record.
* Front desk administrator cannot view clinical notes.
* Registered nurse cannot write prescriptions.
* Nurse practitioner can perform approved advanced clinical actions.
* Security reviewer can view audit logs but cannot edit patient records.
* Renamed executable file is rejected.
* Rejected upload creates an audit log.
* Unauthorized access creates an audit log.

### Success Criteria

* Security-related tests pass.
* CI/CD runs the tests automatically.
* Tests demonstrate allowed and denied behavior.
* The project shows evidence that improvements were validated.

---

## Improvement Area 9: Documentation and Portfolio Readiness

### Original Issue

The original project documentation was strong for a course submission, but the improved version should be organized for future portfolio use.

A portfolio project should make it easy for someone to understand:

* What the system does
* Why it was built
* What security problems it addresses
* What was improved
* What limitations still exist
* How to run and test it

### Improvement Plan

Organize the repository documentation clearly.

### Planned Work

* Keep the README focused on overview, setup, features, and current status.
* Add `docs/security-model.md` for the detailed authorization model.
* Add `docs/improvement-plan.md` for this roadmap.
* Keep future improvements documented honestly.
* Use GitHub Issues to track each improvement.
* Close issues with commits as improvements are completed.

### Success Criteria

* Documentation is clear and easy to navigate.
* Security model is separated from the README.
* Improvement plan is visible and organized.
* GitHub Issues show the project’s progress.
* The project looks intentional and professional.

---

## Version 2.0 Development Phases

### Phase 1: Documentation and Scope Cleanup

Status: In Progress

Tasks:

* Update README.
* Add security model documentation.
* Add improvement plan.
* Clarify project scope.
* Create GitHub issues for each major improvement.

### Phase 2: Authorization Model

Status: Planned

Tasks:

* Define roles and permissions.
* Add permission-checking helper functions.
* Begin replacing broad role checks.
* Add patient relationship logic.
* Add backend enforcement.

### Phase 3: Account Provisioning

Status: Planned

Tasks:

* Add account statuses.
* Add approval workflow.
* Prevent unapproved accounts from logging in.
* Log account approval and rejection.

### Phase 4: Upload Security

Status: Planned

Tasks:

* Add MIME type checks.
* Add file signature checks.
* Add file size limits.
* Reject renamed executables.
* Log rejected uploads.

### Phase 5: Audit Logging and Monitoring

Status: Planned

Tasks:

* Expand audit event coverage.
* Add access-denied logging.
* Add suspicious activity alerts.
* Improve Security Review dashboard.
* Improve Security Assistant summaries.

### Phase 6: Testing and CI/CD Validation

Status: Planned

Tasks:

* Add backend security tests.
* Add frontend tests where useful.
* Confirm CI/CD passes.
* Document test results.

---

## GitHub Issue Plan

The following GitHub issues should be created to track this work:

1. **Clarify project scope as Secure Medical Record System**
2. **Document improved healthcare security model**
3. **Create feedback-based improvement plan**
4. **Refactor authorization to use roles and permissions**
5. **Add patient relationship checks for record access**
6. **Add account approval and provisioning workflow**
7. **Improve upload validation with MIME type and file signature checks**
8. **Expand audit logging for denied and high-risk actions**
9. **Add security monitoring alerts**
10. **Add tests for improved security controls**
11. **Update README and documentation for portfolio readiness**

Each issue should include acceptance criteria and should be closed only after the related work is completed.

---

## Summary

The improved version of the Secure Medical Record System will focus on security maturity rather than only adding more features.

The most important improvements are:

* Clearer project scope
* More realistic healthcare authorization
* Account approval before access
* Stronger upload validation
* Better audit logging
* More useful security monitoring
* Backend enforcement of access rules
* Tests that prove security controls work

This improvement plan directly responds to the feedback from the final review and provides a structured path for turning the project into a stronger portfolio-ready system.
