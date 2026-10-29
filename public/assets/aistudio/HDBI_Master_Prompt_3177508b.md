# HDBI — Smart Collection Manager
## AI App Builder के लिए Master Prompt

**ऐप का नाम:** HDBI  
**टैगलाइन:** Manage Customers. Track Collections. Control Everything.  
**उद्देश्य:** अधिकृत बैंक कलेक्शन एजेंट के लिए ग्राहक प्रबंधन, RD किस्त शेड्यूल, दैनिक कलेक्शन रिकॉर्ड, कर्मचारी प्रबंधन, रिपोर्ट और सुरक्षित डेटा प्रबंधन वाला मोबाइल-फ्रेंडली ऐप बनाना।

> **महत्वपूर्ण:** यह ऐप कलेक्शन प्रबंधन और रिकॉर्ड-कीपिंग टूल है। ऐप में भुगतान दर्ज होना अपने-आप बैंक में जमा होने का प्रमाण नहीं है। भुगतान को जमा/सत्यापित तभी दिखाएँ जब अधिकृत बैंक इंटीग्रेशन या विश्वसनीय आधिकारिक प्रमाण से पुष्टि हो। बैंक के नियमों और अनुमतियों का पालन अनिवार्य है।

---

## AI App Builder के लिए पूरा Master Prompt

नीचे दिए गए पूरे अंग्रेज़ी प्रॉम्प्ट को AI App Builder में कॉपी-पेस्ट करें।

```text
Act as a world-class mobile app architect, senior full-stack developer,
UI/UX designer, database architect, cybersecurity engineer, and financial
record management specialist.

Build a fully functional, production-oriented, mobile-first application named:

HDBI

Tagline:
"Manage Customers. Track Collections. Control Everything."

IMPORTANT:
Do not create only a UI mockup, static prototype, or landing page.
Build a working application with persistent database storage, authentication,
functional forms, working buttons, collection records, reports, and role-based
access control.

If an external integration requires credentials or approval, clearly identify
the missing dependency and explain how to configure it. Never claim an
integration is connected when it is not.

==================================================
1. MAIN OBJECTIVE
==================================================

HDBI is a collection management and record-keeping application for an
authorized bank collection agent who handles recurring deposit (RD) payment
collection activities.

The app should help the agent:
- Manage hundreds or thousands of customers.
- Maintain customer-wise RD collection schedules.
- Plan daily collection routes and follow-up activities.
- Record collection attempts and outcomes.
- Track collected, pending, missed, and overdue installments.
- Assign customers and tasks to authorized employees.
- Monitor employee performance and daily collection totals.
- Generate accurate reports and downloadable statements.
- Send payment reminders through properly authorized integrations.
- Securely maintain business records.
- Access the system from an Android phone.
- Synchronize authorized data across multiple devices.

HDBI is not a bank and must not impersonate a bank. It must not claim that a
payment has been deposited unless verified through an authorized bank
integration or reliable official evidence.

==================================================
2. TECHNOLOGY AND ARCHITECTURE
==================================================

Build a mobile-first Progressive Web App (PWA) or installable mobile
application with a clean, responsive interface.

Choose a reliable technology stack supported by the app builder.

Preferred backend:
- Supabase with PostgreSQL, or an equivalent secure backend.
- Secure server-side authentication.
- Role-based authorization.
- Row-level data access policies.
- Server-side validation.
- Secure file storage.
- Database migrations and backups.

Frontend:
- React or another well-supported mobile-friendly framework.
- Responsive layouts optimized for Android phones.
- Fast loading and minimal data usage.
- Simple forms and large touch-friendly buttons.

Use a real persistent database. Do not store sensitive customer information
only in browser local storage.

All privileged operations must be authorized on the server. Never expose
secret API keys in frontend code.

If a PWA is selected, explain its limitations compared with a native Android
application.

==================================================
3. USER ROLES AND PERMISSIONS
==================================================

Create three roles:

A. OWNER / ADMIN
- Full authorized access to the business workspace.
- Add, edit, deactivate, and search customers.
- Create and assign collection schedules.
- Add and deactivate employees.
- Assign customers and tasks to employees.
- Review collection records.
- Approve corrections and reversals.
- View financial and operational reports.
- Configure reminders and business settings.
- Export authorized records.
- Review audit logs.
- Control employee permissions.

B. COLLECTION EMPLOYEE
- Access only assigned customers and permitted tasks.
- View authorized customer contact details.
- View assigned collection schedules.
- Record collection attempts and outcomes.
- Submit collection records for verification.
- View personal daily and monthly performance.
- Synchronize permitted data.

Employees must not be able to view all business customers by default, access
the owner's account, silently change verified financial records, delete
transaction history, export unrestricted customer data, or create unauthorized
employees.

C. SUPERVISOR
- View assigned team members and their work.
- Monitor collection progress.
- Review submitted records.
- Flag discrepancies.
- Access only the customers and reports permitted by the owner.

Enforce permissions in the backend, not merely by hiding buttons in the UI.

==================================================
4. CUSTOMER MANAGEMENT
==================================================

Create a complete customer management module.

Customer fields:
- Unique customer ID generated automatically.
- Full name.
- Mobile number.
- Optional secondary contact number.
- Address.
- Locality or village.
- Assigned employee.
- Customer status.
- Customer consent and communication preferences.
- Date added.
- Internal notes with restricted access.

RD ACCOUNT / SCHEDULE INFORMATION:
- Bank name.
- Branch name, if required.
- Official customer or account reference, if permitted.
- RD installment amount.
- Installment frequency.
- Scheduled payment day.
- Schedule start date.
- Schedule end date, if applicable.
- Maturity date, if applicable.
- Account status.
- Authorized collection instructions.

Store only the minimum account information necessary. Do not store internet
banking passwords, UPI PINs, OTPs, debit card PINs, or unnecessary banking
credentials.

Do not assume that the collection agent is authorized to access the bank's
complete account data.

Support:
- Add customer.
- Edit customer.
- View customer profile.
- Search by name, phone number, or customer ID.
- Filter by locality, employee, and status.
- Import customer records from validated CSV files.
- Detect possible duplicate records.
- Export authorized customer lists.
- Deactivate customers without deleting financial history.

Customer profile should show basic information, RD schedule, payment and
collection history, pending installments, next scheduled collection,
follow-up history, assigned employee, and authorized notes.

==================================================
5. DAILY COLLECTION DASHBOARD
==================================================

Create a dashboard displaying:
- Total active customers.
- Customers scheduled for collection today.
- Expected collection amount today.
- Verified amount collected today.
- Amount pending confirmation.
- Customers not contacted.
- Customers who were unavailable.
- Customers who declined or postponed payment.
- Overdue installments.
- Follow-ups due today.
- Employee-wise collection progress.

Clearly distinguish:
1. Expected collection.
2. Collection recorded.
3. Collection submitted for verification.
4. Collection verified.
5. Payment confirmed through an authorized bank source.

Do not count an unverified entry as a confirmed bank deposit.

Allow the owner to select a date and view the dashboard for that date.
Provide a prominent "START TODAY'S COLLECTION" button.

==================================================
6. DAILY COLLECTION WORKFLOW
==================================================

Create a fast collection entry screen. Employees should be able to open an
assigned customer and record an outcome in a few taps.

Collection outcome options:
- Payment collected.
- Customer unavailable.
- Customer requested another time.
- Customer declined payment.
- Customer could not be contacted.
- Payment already made through another channel.
- Account or schedule needs verification.
- Other.

For a collection entry, capture:
- Customer ID.
- RD schedule ID.
- Scheduled installment amount.
- Actual amount received, if any.
- Date and time.
- Employee ID.
- Collection method.
- Reference number, if available.
- Verification status.
- Optional notes.
- Receipt or supporting evidence, if authorized.
- Server-generated creation timestamp.

Collection methods may include cash, authorized digital payment, or another
method approved by the bank.

Never mark a payment as deposited merely because an employee entered it.

For cash:
- Distinguish cash received from cash handed over.
- Track handover amount, date, recipient, and acknowledgment.
- Reconcile employee collections against cash handovers.
- Flag mismatches.

For digital payments:
- Record the permitted transaction reference.
- Mark as pending verification until confirmed.
- Do not request customer UPI PINs or OTPs.

Provide a confirmation screen before saving a collection.
Prevent duplicate submissions using idempotency controls and appropriate
database constraints.

Once a financial entry is verified, do not allow silent edits. Use an
authorized correction or reversal process that preserves the original record
and creates an audit trail.

==================================================
7. CUSTOMER PAYMENT LEDGER
==================================================

Create a customer-wise installment ledger.

For every scheduled installment, store:
- Installment ID.
- Customer ID.
- Due date.
- Expected installment amount.
- Actual recorded amount.
- Verification status.
- Payment reference, where applicable.
- Outstanding amount.
- Correction or reversal history.

Support partial payments only if permitted by the applicable bank process.

Calculate outstanding amounts using correct business rules. Do not treat an
unverified payment as a settled installment.

Display a clear chronological payment history.

Avoid double-counting an installment when importing data, recording a payment,
or synchronizing offline entries.

Provide reconciliation reports showing:
- Scheduled installments.
- Recorded collections.
- Verified payments.
- Outstanding amounts.
- Unmatched or disputed entries.

==================================================
8. AUTOMATED REMINDERS AND FOLLOW-UPS
==================================================

Create a reminder management system.

Features:
- Upcoming installment reminders.
- Due-today reminders.
- Overdue follow-up reminders.
- Employee task reminders.
- Follow-up scheduling.
- Configurable reminder timing.
- Communication history.

Support WhatsApp Business API, SMS, or email only through properly configured
and authorized integrations.

If an integration is unavailable, provide:
- A working reminder queue.
- Copyable message templates.
- A manual WhatsApp sharing option.
- A clear indication that the message has not been sent.

Never display "message sent" unless the provider confirms it.

Use customer consent and applicable communication rules. Do not send repeated
or unwanted messages automatically.

Provide editable Hindi and English templates.

Example Hindi reminder:
"नमस्कार [ग्राहक का नाम],
आपकी निर्धारित RD किस्त की तारीख [तारीख] है।
कृपया भुगतान की स्थिति की पुष्टि करें।
किसी भी सहायता के लिए अपने अधिकृत कलेक्शन एजेंट से संपर्क करें।"

==================================================
9. EMPLOYEE MANAGEMENT
==================================================

Allow the owner to:
- Create employee accounts.
- Assign secure login credentials through an authentication provider.
- Assign specific customers or localities.
- Set permitted working areas.
- Assign daily collection targets.
- View attendance or work-session records if enabled.
- View collection attempts and pending tasks.
- Review daily and monthly performance.
- Reassign customers when employees leave.
- Suspend access immediately.

Employee performance should include:
- Assigned customers.
- Customers contacted.
- Successful collection attempts.
- Verified collection amount.
- Pending verification amount.
- Follow-ups completed.
- Unresolved discrepancies.

Do not reward employees solely for money entered in the app. Use verified
collections and reconciled records.

Never share one login account among multiple employees.

==================================================
10. SMART WORK PLANNER
==================================================

Create a daily work planner that organizes customers by:
- Scheduled due date.
- Locality.
- Assigned employee.
- Pending follow-up.
- Previous collection outcome.
- Priority.

Provide a simple route list grouped by locality and allow manual reordering.

Do not claim to optimize geographic routes unless a configured mapping or
routing service is available.

Provide:
- Today's tasks.
- Upcoming tasks.
- Overdue follow-ups.
- Completed tasks.
- Reassigned tasks.

Allow the owner to assign or reassign a task in a few taps.

==================================================
11. REPORTS AND EXPORTS
==================================================

Generate date-filtered reports:
- Daily collection report.
- Employee-wise collection report.
- Customer-wise payment ledger.
- Expected versus collected report.
- Verified versus unverified report.
- Outstanding installment report.
- Cash handover report.
- Discrepancy and reconciliation report.
- Customer follow-up report.
- Monthly performance report.

Provide PDF and CSV exports where supported.

Every report must show:
- Selected date range.
- Generation timestamp.
- Report status.
- Appropriate totals.
- Clear distinction between recorded and verified amounts.

Protect exported files and avoid including unnecessary customer personal
information. Never include passwords, OTPs, or secret banking credentials.

==================================================
12. DATA SECURITY AND PRIVACY
==================================================

Security is a core requirement.

Implement:
- Secure authentication.
- Strong password handling by the authentication provider.
- Optional multi-factor authentication.
- Role-based permissions.
- Database-level row access policies.
- HTTPS for network communication.
- Secure session management.
- Automatic session expiry where appropriate.
- Login and access audit logs.
- Server-side input validation.
- Protection against unauthorized record access.
- Secure backups and documented restoration procedures.
- Data retention and deletion policies.
- Restricted access to uploaded documents.
- Secure error handling without exposing sensitive data.

Use the principle of least privilege.

The owner must not be able to read an employee's password. Employees must
never access another employee's customers unless explicitly authorized.

Do not store sensitive customer records in public folders.

Do not log full account numbers, authentication secrets, or unnecessary
personal information.

Clearly document who can access each data category.

Use a secure method to export or restore data.

Explain the backup schedule and recovery procedure.

==================================================
13. OFFLINE AND NETWORK FAILURE HANDLING
==================================================

Collection employees may work in areas with weak internet.

If offline mode is supported:
- Cache only the minimum permitted assigned customer data.
- Store offline actions in an encrypted or appropriately protected local queue.
- Give each offline action a unique ID.
- Synchronize when connectivity returns.
- Detect duplicate submissions.
- Detect conflicting edits.
- Display pending synchronization status.
- Never silently overwrite conflicting financial records.

Clearly distinguish:
- Saved locally.
- Uploaded to server.
- Submitted for verification.
- Verified.

If secure offline operation cannot be implemented reliably, disable financial
entry while offline and explain why.

==================================================
14. GOOGLE-STYLE USER EXPERIENCE
==================================================

Create a clean, familiar interface inspired by the simplicity and usability
of modern Google mobile apps. Do not copy Google's logo or proprietary branding.

Design requirements:
- Mobile-first layout.
- Simple white or light background.
- Clean typography.
- Clear visual hierarchy.
- Large touch-friendly buttons.
- Minimal typing.
- Search prominently available.
- Bottom navigation on mobile.
- Simple forms.
- Useful empty states.
- Clear loading and error messages.
- Accessible contrast and readable font sizes.
- Hindi-first interface with an English option.
- Indian date, number, and currency formatting.
- INR currency display.

Recommended bottom navigation:
1. Home
2. Customers
3. Collection
4. Tasks
5. More

Use simple Hindi labels:
- आज का कलेक्शन
- ग्राहक
- किस्तें
- बकाया
- कर्मचारी
- रिपोर्ट
- फॉलो-अप
- सेटिंग्स

Do not overcrowd the screen with charts or unnecessary animations.

==================================================
15. DATABASE DESIGN
==================================================

Design a normalized relational database.

Include appropriate tables for:
- Organizations or workspaces.
- Users and role assignments.
- Employees.
- Customers.
- RD schedules.
- Scheduled installments.
- Collection attempts.
- Collection transactions.
- Cash handovers.
- Payment verification records.
- Follow-up tasks.
- Reminder queue.
- Communication logs.
- Audit logs.
- Reconciliation records.
- Application settings.

Use unique identifiers, foreign keys, appropriate indexes, and database
constraints.

Store financial amounts using an appropriate exact decimal or integer
representation rather than floating-point arithmetic.

Use server-generated timestamps and preserve a consistent timezone strategy.

Every financial record must be traceable to its creator, status changes,
verification, correction, and reversal.

Design access policies so one workspace cannot read or modify another
workspace's data.

==================================================
16. INITIAL SETUP WIZARD
==================================================

When the app is first opened, guide the owner through:
1. Business or agency name.
2. Owner account creation.
3. Language selection.
4. Timezone selection.
5. Employee setup.
6. Customer import.
7. RD schedule configuration.
8. Collection workflow configuration.
9. Reminder settings.
10. Security and backup setup.

Do not require real customer data to demonstrate the app.

Provide a demo mode with clearly labeled fictional customers.

Never mix demo transactions with real financial records.

==================================================
17. TESTING AND ACCEPTANCE CRITERIA
==================================================

Before declaring the app complete, test:
1. Owner login and logout.
2. Employee login and logout.
3. Role-based access restrictions.
4. Customer creation and editing.
5. Customer search and duplicate detection.
6. RD schedule creation.
7. Scheduled installment generation.
8. Collection entry creation.
9. Duplicate collection prevention.
10. Payment verification workflow.
11. Cash handover reconciliation.
12. Partial payment rules, if enabled.
13. Reminder queue behavior.
14. Employee assignment and reassignment.
15. Daily and monthly report calculations.
16. CSV import validation.
17. PDF or CSV export.
18. Offline synchronization, if enabled.
19. Audit log generation.
20. Unauthorized access attempts.
21. Database backup and restoration.
22. Mobile responsiveness on Android.
23. Data isolation between workspaces.
24. Recovery from network failure.

Use fictional test data. Do not use real customer banking data during testing.

Include automated tests for financial calculations and authorization rules
where supported.

Provide a visible error message whenever an operation fails. Do not silently
discard a collection entry.

==================================================
18. REQUIRED DELIVERABLES
==================================================

Deliver:
A. A working mobile-friendly application.
B. Real database schema and migrations.
C. Secure authentication and role permissions.
D. Functional customer management.
E. Functional collection and ledger modules.
F. Employee management.
G. Working reports and export functions.
H. Reminder queue and integration setup instructions.
I. Audit logging.
J. Test results and known limitations.
K. Deployment instructions.
L. Database backup and recovery instructions.
M. A step-by-step owner user guide in simple Hindi.
N. A clear list of features requiring external API keys, bank approval, or
   third-party subscriptions.

Do not mark a feature complete unless it has been tested.

If the platform cannot support a requested feature, explain the limitation
and provide the safest practical alternative.

==================================================
FINAL BUILD ORDER
==================================================

First, design the complete database schema and security model.

Then build the application module by module.

Prioritize the first working release:
1. Secure login.
2. Customer management.
3. RD schedule management.
4. Daily collection recording.
5. Payment verification and reconciliation.
6. Employee assignment.
7. Daily dashboard.
8. Basic reports.

After these core modules work correctly, add reminders, advanced reporting,
offline synchronization, and other integrations.

The final result must be a usable, secure, and maintainable collection
management application, not merely a visual demo.
```

---