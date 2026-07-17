"""
Permission model for the Secure Medical Record System.

This file defines role-to-permission mappings and helper functions used by
backend routes to enforce authorization decisions.

The goal is to move beyond broad role checks such as:
    role == "doctor"

and instead check whether a user has the specific permission required
for the requested action.
"""

# Legacy roles are kept for compatibility with the original course project.
# Improved role names are also included for the v2 security model.
ROLE_ALIASES = {
    "doctor": "physician",
    "nurse": "registered_nurse",
    "admin": "system_admin",
    "administrator": "system_admin",
    "patient": "patient"
}


ROLE_PERMISSIONS = {
    "physician": [
        "view_assigned_records",
        "edit_diagnosis",
        "write_clinical_notes",
        "write_prescriptions",
        "order_labs",
        "upload_clinical_files",
        "view_prescriptions",
        "view_lab_results"
    ],

    "registered_nurse": [
        "view_assigned_records",
        "update_vitals",
        "add_nursing_notes",
        "view_medications"
    ],

    "nurse_practitioner": [
        "view_assigned_records",
        "write_clinical_notes",
        "write_prescriptions",
        "order_labs",
        "update_treatment_plan",
        "view_prescriptions",
        "view_lab_results"
    ],

    "medical_assistant": [
        "view_assigned_appointments",
        "update_vitals",
        "update_intake_forms"
    ],

    "front_desk_admin": [
        "manage_appointments",
        "update_demographics"
    ],

    "billing_staff": [
        "view_billing_info",
        "update_insurance_info"
    ],

    "lab_technician": [
        "view_lab_orders",
        "upload_lab_results",
        "update_lab_status"
    ],

    "pharmacist": [
        "view_prescriptions",
        "view_medication_history",
        "view_allergies"
    ],

    "security_reviewer": [
        "view_audit_logs",
        "view_security_alerts",
        "review_access_denied_events"
    ],

    "system_admin": [
        "approve_users",
        "assign_roles",
        "disable_users",
        "manage_system_settings",
        "view_audit_logs",
        "view_security_alerts",
        "manage_appointments",
        "update_demographics"
    ],

    "patient": [
        "view_own_records",
        "view_own_appointments",
        "download_own_documents"
    ]
}


def normalize_role(role):
    """
    Convert older role names into the improved role names.

    Example:
        doctor -> physician
        nurse -> registered_nurse
        admin -> system_admin
    """
    if not role:
        return None

    normalized = role.strip().lower()
    return ROLE_ALIASES.get(normalized, normalized)


def get_permissions_for_role(role):
    """
    Return the list of permissions assigned to a role.
    """
    normalized_role = normalize_role(role)
    return ROLE_PERMISSIONS.get(normalized_role, [])


def has_permission(role, permission):
    """
    Check whether a role has a specific permission.
    """
    return permission in get_permissions_for_role(role)
