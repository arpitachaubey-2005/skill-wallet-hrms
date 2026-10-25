# 💼 Skill Wallet — Modern MERN Stack HR Management System (HRMS)

**Skill Wallet** is a production-grade, full-stack Human Resource Management System (HRMS) built with the MERN stack (MongoDB, Express, React, Node.js), featuring strict **Role-Based Access Control (RBAC)** across three organizational tiers: **HR Administrator**, **Manager**, and **Employee**.

---

## 🌟 Key Features

### 1. 🛡️ Authentication & Role-Based Authorization
- **JWT Authentication** backed by secure HTTP-only cookies and Authorization Bearer fallback.
- **Bcryptjs Password Hashing** (10 salt rounds).
- **Server-Side Authorization Middleware**: Non-HR users are strictly prevented from modifying employee records or viewing confidential compensation data.
- **Automated Role Routing**: Logins automatically direct users to their designated portals (`/hr/dashboard`, `/manager/dashboard`, `/employee/dashboard`).
- **Interactive Quick-Role Switcher**: One-click demo accounts on both the login page and the top navigation bar.

### 2. 🏢 HR Administrator Portal
- **Workforce Analytics & Recharts**: Live attendance trends (7-day history), department distribution donut charts, leave type categories, and skill program progress.
- **Employee Directory**: Full CRUD management with salary configuration, technical skills tagging, department assignments, and one-click account deactivation.
- **Leave Request Approvals**: Approve or reject leave applications with custom reviewer remarks.
- **Attendance Audits & CSV Export**: Real-time check-in logs, punctuality metrics, and one-click CSV report downloads.
- **Company Announcements**: Broadcast organizational bulletins categorized by priority (High, Medium, Low) and tag (Policy, Holiday, Event, General).

### 3. 👥 Manager Command Center
- **Direct Reports Management**: Scoped visibility limited strictly to employees reporting to the manager.
- **Team Leave Approvals**: Review and decide leave applications from direct reports.
- **Skill Training Roadmap**: Create curriculum tracks, assign direct reports, and monitor percentage completion and skill milestones.
- **Team Presence Analytics**: Weekly attendance trends for team members.

### 4. 🚀 Employee Self-Service Portal & Skill Wallet
- **Daily Attendance Clock**: Real-time Punch In / Punch Out with automatic late arrival detection (after 09:30 AM) and shift hour calculations.
- **Compound Unique Index**: Enforces single daily check-in per employee.
- **Leave Application Engine**: Automatic date calculation, past date validation, and overlap conflict prevention.
- **Skill Wallet & Progress Sliders**: Interactive course progress updater (0-100%) and completion badge awards.
- **Profile & Credential Manager**: Update personal contact, address, and emergency details while confidential corporate fields remain safely read-only.
- **Account Password Security**: Self-service password changes with current credential verification.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router DOM, Axios, Recharts, Lucide Icons, Plus Jakarta Sans |
| **Backend** | Node.js, Express, TypeScript, JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors` |
| **Database** | MongoDB / Mongoose architecture with built-in persistent JSON fallback store |
| **Testing** | Automated TypeScript test runner testing Auth, RBAC, CRUD, Leaves, Attendance, and Training |

---

## 📁 Project Architecture & Folder Structure

```text
├── server/
│   ├── config/
│   │   └── db.ts                # Persistent MongoDB/Mongoose-compatible data store
│   ├── controllers/
│   │   ├── authController.ts       # Login, logout, session verification, change password
│   │   ├── employeeController.ts   # CRUD operations, salary protection, filters
│   │   ├── leaveController.ts      # Leave submission, overlap checks, approvals
│   │   ├── attendanceController.ts # Check-in, check-out, reports, CSV export
│   │   ├── announcementController.ts # Announcements CRUD with priority tagging
│   │   ├── trainingController.ts   # Skill programs and milestone progress
│   │   └── dashboardController.ts  # Role-specific analytics and Recharts data
│   ├── middleware/
│   │   ├── authMiddleware.ts       # JWT token verification & cookie extraction
│   │   ├── roleMiddleware.ts       # Role authorization (HR, Manager, Employee)
│   │   └── errorMiddleware.ts      # Centralized error handler
│   ├── models/
│   │   └── types.ts             # TypeScript interfaces for 6 core collections
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── trainingRoutes.js
│   │   └── dashboardRoutes.js
│   ├── seed/
│   │   └── seedData.ts          # Realistic seed data (1 HR, 2 Managers, 10 Employees)
│   └── tests/
│       └── test_suite.ts        # 25 automated unit & integration tests
├── src/
│   ├── api/
│   │   └── axios.ts             # Configured Axios client with interceptors
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx        # Status pills (Present, Absent, Pending, Approved)
│   │   │   ├── Button.tsx       # Reusable button with variants & loading states
│   │   │   ├── DataTable.tsx    # Table with search, department filters, pagination
│   │   │   ├── Input.tsx        # Styled form inputs with icons and error states
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Modal.tsx        # Accessible dialog with backdrop blur
│   │   │   ├── ProtectedRoute.tsx # Route protection & RBAC redirector
│   │   │   └── StatCard.tsx     # Modern KPI metric cards
│   │   └── layout/
│   │       ├── DashboardLayout.tsx
│   │       ├── Navbar.tsx       # Top bar with demo switcher & notifications
│   │       └── Sidebar.tsx      # Role-tailored collapsible navigation
│   ├── context/
│   │   └── AuthContext.tsx      # User session management
│   ├── pages/
│   │   ├── auth/Login.tsx
│   │   ├── hr/                  # HR dashboards, employees, leaves, attendance, bulletins
│   │   ├── manager/             # Team overview, direct reports, training management
│   │   └── employee/            # Check-in, apply leave, my leaves, training, profile
│   ├── App.tsx                  # React Router definitions
│   ├── index.css                # Tailwind CSS v4 design tokens
│   └── main.tsx
├── server.ts                    # Unified Full-Stack Express & Vite dev server
├── package.json
└── README.md
```

---

## 🔑 Demo Credentials

All demo accounts use the standard password: **`Password123!`**

| Role | Name | Email | Password | Assigned Department |
|---|---|---|---|---|
| **HR Administrator** | Elena Vance | `hr@skillwallet.com` | `Password123!` | Human Resources |
| **Manager** | Sarah Jenkins | `sarah.manager@skillwallet.com` | `Password123!` | Engineering |
| **Manager** | David Mercer | `david.manager@skillwallet.com` | `Password123!` | Marketing & Design |
| **Employee** | Alex Chen | `alex.chen@skillwallet.com` | `Password123!` | Engineering (Senior Full Stack) |
| **Employee** | Maya Patel | `maya.patel@skillwallet.com` | `Password123!` | Engineering (Frontend) |
| **Employee** | Marcus Brody | `marcus.brody@skillwallet.com` | `Password123!` | Design (Senior Product Designer) |

*(Quick demo buttons are also embedded on the login page and top navbar for one-click testing!)*

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.x or later)
- npm (v9.x or later)

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Run the automated test suite
npm test

# 3. Start the unified development server (Express API + Vite React SPA)
npm run dev
```

The application runs at **`http://localhost:3000`**.

---

## 🧪 Automated Testing

To run the automated test suite covering authentication, RBAC, employee CRUD, leave approvals, attendance check-in uniqueness, and skill training milestones:

```bash
npm test
```

Result:
```text
==================================================
🧪 RUNNING SKILL WALLET AUTOMATED TEST SUITE
==================================================
[Suite 1: Authentication & Password Verification]
  ✓ PASS: HR user account exists
  ✓ PASS: Valid password matches bcrypt hash
  ✓ PASS: Invalid password is fundamentally rejected
  ✓ PASS: JWT token decodes valid userId
  ✓ PASS: JWT token preserves HR role authorization
  ✓ PASS: Expired JWT token is rejected with TokenExpiredError

[Suite 2: Role-Based Access Control (RBAC)]
  ✓ PASS: Alex Chen correctly has employee role
  ✓ PASS: Sarah Jenkins correctly has manager role
  ✓ PASS: Employee is prohibited from accessing HR administrative routes
  ✓ PASS: Manager is prohibited from accessing HR-only routes

[Suite 3: Employee Management CRUD]
  ✓ PASS: Successfully created test employee profile
  ✓ PASS: Updated employee designation
  ✓ PASS: Updated employee compensation
  ✓ PASS: Deactivated employee status to Inactive

[Suite 4: Leave Requests & Validation]
  ✓ PASS: Found Alex Chen employee record
  ✓ PASS: Created pending leave application
  ✓ PASS: Approved leave application successfully
  ✓ PASS: Recorded reviewer details on leave approval
  ✓ PASS: Correctly detected date range overlap between leave applications

[Suite 5: Attendance Check-In & Uniqueness]
  ✓ PASS: Successfully recorded first check-in for date
  ✓ PASS: Duplicate check-in accurately detected on unique compound index
  ✓ PASS: Successfully checked out and computed shift working hours

[Suite 6: Training Programs & Skill Progress]
  ✓ PASS: Created training program with assigned team member
  ✓ PASS: Updated employee training progress to 100%
  ✓ PASS: Marked training milestone as Completed

==================================================
📊 TEST RESULTS: 25 PASSED, 0 FAILED
==================================================
```

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/login` — Sign in and receive JWT token + HTTP-only cookie
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Retrieve current authenticated session and profile
- `PUT /api/auth/change-password` — Change password with current credential validation

### Employees
- `GET /api/employees` — List all employees (search, department filter, role filter, pagination)
- `GET /api/employees/:id` — Retrieve single employee profile (salary masked for non-HR)
- `POST /api/employees` — Create new employee and linked user account (HR only)
- `PUT /api/employees/:id` — Update employee information (HR only)
- `DELETE /api/employees/:id` — Deactivate employee profile & user account (HR only)
- `GET /api/employees/me` — Retrieve own profile
- `PATCH /api/employees/me` — Update allowed personal details (contact, address, skills)

### Leaves
- `POST /api/leaves` — Submit leave application (validates start <= end, prevents date overlaps)
- `GET /api/leaves` — List leave requests (scoped to direct reports for managers, all for HR)
- `GET /api/leaves/my` — Employee's personal leave applications
- `PATCH /api/leaves/:id/approve` — Approve leave with reviewer comment (HR or Manager)
- `PATCH /api/leaves/:id/reject` — Reject leave with reviewer comment (HR or Manager)
- `PATCH /api/leaves/:id/cancel` — Withdraw pending leave request (Employee self-service)

### Attendance
- `POST /api/attendance/check-in` — Punch in for today (enforces compound unique date index)
- `POST /api/attendance/check-out` — Punch out and compute shift hours
- `GET /api/attendance/my` — Employee personal attendance logs & punctuality statistics
- `GET /api/attendance` — View company attendance records with filters (HR / Manager)
- `GET /api/attendance/reports` — Department presence summaries and CSV export

### Announcements
- `GET /api/announcements` — Retrieve published company bulletins
- `POST /api/announcements` — Publish bulletin with priority and category (HR / Manager)
- `PUT /api/announcements/:id` — Edit bulletin (HR or Creator Manager)
- `DELETE /api/announcements/:id` — Delete bulletin (HR or Creator Manager)

### Skill Wallet & Training
- `GET /api/training` — Retrieve active training modules
- `POST /api/training` — Create training module & assign team members (HR / Manager)
- `PUT /api/training/:id` — Update training details
- `DELETE /api/training/:id` — Archive / delete training module
- `PATCH /api/training/:id/progress` — Update milestone progress percentage (0-100%) and mark completed

### Analytics Dashboards
- `GET /api/dashboard/hr` — Workforce metrics, 7-day attendance trends, department breakdowns
- `GET /api/dashboard/manager` — Direct team metrics, team leaves, team training completion rates
- `GET /api/dashboard/employee` — Daily punch status, personal attendance score, skill wallet modules

---

## 🌐 Production Deployment

- **Build**: Run `npm run build` to compile the Vite client to the `dist/` directory.
- **Start**: Run `npm start` (`tsx server.ts`), which serves the API and the static React SPA together on port 3000.
