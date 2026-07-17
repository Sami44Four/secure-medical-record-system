# Security Model

## Purpose

This document explains the improved security and authorization model for the **Secure Medical Record System**.

The original course version used four broad roles:

* Doctor
* Nurse
* Administrator
* Patient

This was useful for demonstrating basic Role-Based Access Control, but it was too simplified for a realistic healthcare system. In real healthcare environments, access should not depend only on a broad job title. A user’s access should depend on their role, permissions, patient relationship, account status, resource type, and the action they are trying to perform.

The goal of this improved model is to make the system closer to how a real healthcare application would think about access control.

---

## Main Security Problem

The main issue with the original access control model was that it treated roles as too broad.

For example:

* A doctor could access clinical information.
* A nurse had limited access.
* An administrator could access administrative pages.
* A patient could view personal records.

However, this does not fully reflect real healthcare workflows.

In real systems:

* Not every nurse has the same level of access.
* A nurse practitioner may have more clinical privileges than a registered nurse.
* A front desk administrator may manage appointments but should not view detailed clinical notes.
* A system administrator may manage user accounts but should not automatically view patient medical records.
* A security reviewer may view audit logs but should not edit patient information.
* A patient should only access their own records.

Because of this, the improved model separates **job titles** from **actual permissions**.

---

## Improved Authorization Approach

The improved design uses a combination of:

* **Authentication**
* **Account status**
* **Role-Based Access Control**
* **Permission-Based Access Control**
* **Patient relationship checks**
* **Resource type checks**
* **Audit logging**
* **Future emergency access controls**

Instead of asking only:

**“Is this user a doctor?”**

The improved system should ask:

**“Is this user authenticated, approved, assigned the correct permission, allowed to access this patient, and performing an action that matches their responsibility?”**

This creates a more realistic and secure access-control model.

---

## Authorization Concepts

| Concept                  | Meaning                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| **User**                 | The individual person using the system                                  |
| **Account Status**       | Whether the account is pending, approved, rejected, or disabled         |
| **Role**                 | The user’s job function or system function                              |
| **Permission**           | The specific action the user is allowed to perform                      |
| **Patient Relationship** | Whether the user is assigned to or involved in the patient’s care       |
| **Resource Type**        | The type of information being accessed                                  |
| **Context**              | Additional conditions such as emergency access or administrative review |
| **Audit Log**            | A record of sensitive actions performed in the system                   |

---

## Account Status Model

Before a user can access the system, the account should have a valid status.

| Status       | Meaning                                                    |
| ------------ | ---------------------------------------------------------- |
| **Pending**  | The user requested access but has not been approved yet    |
| **Approved** | The user has been approved and can log in                  |
| **Rejected** | The user request was denied                                |
| **Disabled** | The account was previously active but has been deactivated |

A user should not be able to access protected system features unless the account is **approved**.

This improves security because users should not automatically receive access simply because an account exists.

---

## Proposed Role Model

The improved model expands the original four-role design into more realistic healthcare roles.

| Role                         | Purpose                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- |
| **Physician**                | Provides diagnosis, treatment, prescriptions, and clinical decision-making      |
| **Registered Nurse**         | Supports patient care, updates vitals, and adds nursing notes                   |
| **Nurse Practitioner**       | Provides advanced clinical care with broader privileges than a registered nurse |
| **Medical Assistant**        | Supports intake, vitals, and appointment preparation                            |
| **Front Desk Administrator** | Handles scheduling and basic demographic information                            |
| **Billing Staff**            | Handles billing, insurance, and payment-related workflows                       |
| **Lab Technician**           | Handles lab orders, lab results, and lab status updates                         |
| **Pharmacist**               | Reviews medication-related information                                          |
| **Security Reviewer**        | Reviews audit logs, security alerts, and suspicious activity                    |
| **System Administrator**     | Manages accounts, roles, permissions, and system configuration                  |
| **Patient**                  | Views their own health information                                              |

This makes the system more realistic because different healthcare users need different levels of access.

---

## Proposed Permission Model

Permissions define what a user can actually do.

Examples of permissions include:

| Permission                | Meaning                                           |
| ------------------------- | ------------------------------------------------- |
| **view_assigned_records** | View medical records for assigned patients        |
| **view_own_records**      | View only personal patient records                |
| **update_vitals**         | Add or update patient vitals                      |
| **write_clinical_notes**  | Add clinical notes                                |
| **edit_diagnosis**        | Add or update diagnosis information               |
| **write_prescriptions**   | Add or update prescriptions                       |
| **order_labs**            | Create lab orders                                 |
| **upload_lab_results**    | Upload lab results                                |
| **manage_appointments**   | Create, edit, or cancel appointments              |
| **update_demographics**   | Update patient contact or demographic information |
| **view_billing_info**     | View billing and insurance-related information    |
| **approve_users**         | Approve new user accounts                         |
| **assign_roles**          | Assign roles to users                             |
| **disable_users**         | Disable user accounts                             |
| **view_audit_logs**       | Review system audit logs                          |
| **view_security_alerts**  | Review security alerts                            |

This allows the system to check specific actions instead of relying only on broad roles.

---

## Role and Permission Mapping

| Role                         | Example Permissions                                                                                                 | Important Restrictions                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Physician**                | view_assigned_records, edit_diagnosis, write_clinical_notes, write_prescriptions, order_labs, upload_clinical_files | Should only access patients under their care unless emergency access is used                   |
| **Registered Nurse**         | view_assigned_records, update_vitals, add_nursing_notes, view_medications                                           | Should not edit diagnoses or write prescriptions                                               |
| **Nurse Practitioner**       | view_assigned_records, write_clinical_notes, write_prescriptions, order_labs, update_treatment_plan                 | Should still be limited to assigned patients and approved clinical permissions                 |
| **Medical Assistant**        | view_assigned_appointments, update_vitals, update_intake_forms                                                      | Should not access full clinical notes, diagnoses, or prescriptions unless specifically allowed |
| **Front Desk Administrator** | manage_appointments, update_demographics                                                                            | Should not view detailed medical notes, diagnoses, prescriptions, or lab results               |
| **Billing Staff**            | view_billing_info, update_insurance_info                                                                            | Should not access full clinical notes unless required for billing review                       |
| **Lab Technician**           | view_lab_orders, upload_lab_results, update_lab_status                                                              | Should not access unrelated clinical notes or billing information                              |
| **Pharmacist**               | view_prescriptions, view_medication_history, view_allergies                                                         | Should not access full unrelated medical records unless needed for medication safety           |
| **Security Reviewer**        | view_audit_logs, view_security_alerts, review_access_denied_events                                                  | Should not edit patient records or clinical information                                        |
| **System Administrator**     | approve_users, assign_roles, disable_users, manage_system_settings                                                  | Should not automatically view patient medical content                                          |
| **Patient**                  | view_own_records, view_own_appointments, download_own_documents                                                     | Cannot access other patients’ records or administrative dashboards                             |

---

## Patient Relationship Check

One of the most important improvements is checking whether a clinical user is allowed to access a specific patient.

A role alone should not be enough.

For example, a physician may have permission to view patient records, but that does not mean the physician should view every patient in the system.

The system should also check whether the user has a valid patient relationship.

Examples of valid relationships include:

* The patient is assigned to the physician.
* The patient is assigned to the nurse’s care team.
* The patient belongs to the same department or unit.
* The user is accessing their own patient record.
* Emergency access was granted and logged.

This prevents unnecessary access to sensitive healthcare information.

---

## Resource Type Check

Different types of healthcare information should have different access rules.

| Resource Type           | Examples                                     | Access Consideration                                |
| ----------------------- | -------------------------------------------- | --------------------------------------------------- |
| **Demographics**        | Name, address, phone number, date of birth   | Front desk staff may need access                    |
| **Appointments**        | Visit date, provider, appointment status     | Front desk staff and clinical users may need access |
| **Vitals**              | Blood pressure, weight, temperature          | Nurses and medical assistants may update            |
| **Clinical Notes**      | Doctor notes, treatment plans                | Clinical providers only                             |
| **Diagnoses**           | Medical conditions and diagnosis codes       | Physicians and approved advanced providers          |
| **Prescriptions**       | Medication orders and medication history     | Physicians, nurse practitioners, pharmacists        |
| **Lab Orders**          | Requested tests                              | Physicians, nurse practitioners, lab staff          |
| **Lab Results**         | Test results and reports                     | Clinical providers and approved lab staff           |
| **Billing Information** | Insurance, payment status, billing codes     | Billing staff only                                  |
| **Audit Logs**          | Login history, access events, denied actions | Security reviewer and system administrator          |

This supports least privilege because users only access the type of information needed for their responsibility.

---

## Access Decision Logic

Every protected request should follow a clear authorization process.

A request should be allowed only if all required checks pass:

1. **Authentication Check**
   The user must be logged in.

2. **Account Status Check**
   The user account must be approved and active.

3. **Permission Check**
   The user must have the required permission for the action.

4. **Patient Relationship Check**
   The user must have a valid relationship to the patient or resource.

5. **Resource Type Check**
   The user must be allowed to access that type of data.

6. **Audit Logging**
   The action should be logged if it involves sensitive information.

7. **Deny by Default**
   If any check fails, access should be denied.

---

## Example Access Decisions

### Example 1: Registered Nurse Updating Vitals

A registered nurse wants to update a patient’s vitals.

The system should check:

* Is the nurse logged in?
* Is the nurse’s account approved?
* Does the nurse have the `update_vitals` permission?
* Is the patient assigned to the nurse or the nurse’s care team?
* Is the requested resource type allowed for this role?
* Was the action logged?

If all checks pass, the nurse can update the vitals.

---

### Example 2: Front Desk Administrator Viewing Clinical Notes

A front desk administrator wants to view clinical notes.

The system should check:

* Is the user logged in?
* Is the account approved?
* Does the user have permission to view clinical notes?

The answer should be no.

The system should deny access and log the denied request.

---

### Example 3: System Administrator Managing Accounts

A system administrator wants to approve a pending user account.

The system should check:

* Is the system administrator logged in?
* Is the account approved?
* Does the user have the `approve_users` permission?

If yes, the system administrator can approve or reject the account.

However, this should not automatically give the system administrator access to patient medical records.

---

### Example 4: Patient Viewing Another Patient’s Record

A patient tries to access another patient’s medical record.

The system should check:

* Is the user logged in?
* Is the account approved?
* Does the patient have permission to view this record?
* Does the record belong to that patient?

The answer should be no.

The system should deny access and log the attempt.

---

### Example 5: Security Reviewer Viewing Audit Logs

A security reviewer wants to review failed login attempts and access-denied events.

The system should check:

* Is the security reviewer logged in?
* Is the account approved?
* Does the user have `view_audit_logs` or `view_security_alerts` permission?

If yes, the security reviewer can view security events.

However, the security reviewer should not be able to edit medical records.

---

## Backend Enforcement

Authorization should be enforced in the backend.

Frontend restrictions are useful for user experience, but they are not enough for security. A user can bypass frontend controls by directly calling API endpoints.

For this reason, every protected backend route should check permissions before returning or modifying data.

Example logic:

```text
Request received
 ↓
Check login session
 ↓
Check account status
 ↓
Check required permission
 ↓
Check patient relationship if patient data is requested
 ↓
Allow action or deny access
 ↓
Write audit log
```

---

## Deny by Default

The system should follow a **deny by default** approach.

This means access should be denied unless the system can clearly confirm that the user is allowed to perform the requested action.

This is safer than allowing access by default and only blocking known bad actions.

---

## Separation of Duties

The improved model also supports separation of duties.

Examples:

* A front desk administrator can manage appointments but cannot view clinical notes.
* A system administrator can manage accounts but should not automatically view patient records.
* A security reviewer can view logs but cannot edit medical records.
* A billing user can view billing information but not full treatment notes.
* A patient can view their own information but cannot access other patients’ records.

This reduces the risk of excessive access.

---

## Emergency Access Future Enhancement

A future version of the system could include **break-glass emergency access**.

Break-glass access would allow temporary access to restricted patient information during emergencies.

This should include strict controls:

* The user must provide an emergency reason.
* The access should be temporary.
* The event should be logged as high risk.
* A security reviewer or administrator should review the event afterward.
* Emergency access should not replace normal permissions.

This would allow the system to support urgent care situations while still maintaining accountability.

---

## Audit Logging Requirements

The improved model should log all sensitive security events.

Examples include:

* Successful login
* Failed login
* Login attempt from a pending account
* Access to medical records
* Access denied due to missing permission
* Access denied due to invalid patient relationship
* Account approval
* Account rejection
* Role assignment
* Role change
* File upload
* Rejected file upload
* Emergency access request
* Emergency access approval
* Security alert generation

Each log entry should include:

* User ID
* Role
* Action
* Resource accessed
* Timestamp
* Status
* Risk level
* Reason if applicable

---

## Planned Implementation Steps

The improved security model will be implemented in stages.

### Phase 1: Role and Permission Definitions

* Define realistic healthcare roles.
* Define permissions for each role.
* Create a helper function for permission checks.

### Phase 2: Account Status

* Add account statuses such as pending, approved, rejected, and disabled.
* Prevent unapproved users from logging in.
* Log account approval and rejection actions.

### Phase 3: Patient Assignment

* Add patient assignment checks.
* Ensure clinical users can only access assigned patients.
* Ensure patients can only access their own records.

### Phase 4: Backend Route Protection

* Replace broad role checks with permission checks.
* Enforce authorization in backend routes.
* Deny unauthorized access by default.

### Phase 5: Audit Logging

* Add audit logs for allowed and denied actions.
* Add logs for role changes and account approvals.
* Add logs for suspicious access attempts.

### Phase 6: Testing

* Test allowed access.
* Test denied access.
* Test patient-only access.
* Test admin-only actions.
* Test audit logs for denied actions.

---

## Summary

The improved security model makes the project stronger by moving beyond simple job-title-based RBAC.

The new model is based on:

* Approved user accounts
* Realistic healthcare roles
* Specific permissions
* Patient relationships
* Resource type restrictions
* Backend enforcement
* Deny-by-default logic
* Audit logging
* Future emergency access controls

This creates a more realistic and secure foundation for the Secure Medical Record System.
