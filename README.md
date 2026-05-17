# Secure Medical Record Sharing System

## Overview

A secure web application for sharing medical records with encryption, role-based access control, and audit logging.

## Features

* Encrypted file storage
* Role-Based Access Control (Doctor, Nurse, Admin)
* Temporary access permissions
* Audit logging of all actions

## Security Focus

* Confidentiality (encryption)
* Authentication \& Authorization
* Least privilege access
* Accountability through logging

## Setup

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

## Run 

python3 backend/app.py

## Run Tests

pytest

## Run Static Analysis

bandit -r backend

## Example API Requests
## Login

curl -X POST http://127.0.0.1:5000/api/login \
-H "Content-Type: application/json" \
-d '{"username":"doctor1","password":"doctor123"}'

## Get Records

curl -X GET http://127.0.0.1:5000/api/records \
-H "Role: doctor"

## View Audit Logs

curl http://127.0.0.1:5000/api/audit-logs


## Tech Stack

(To be determined)

## Team

* Sami
* Maryam



## Push Test

This comment was added by Sami to demonstrate pushing code to the repository.

This comment was added by Maryam to demonstrate pushing code to the repository.
