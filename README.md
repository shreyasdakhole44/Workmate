# WorkMate HRMS (Human Resource Management System)

WorkMate is a modern, enterprise-grade, full-stack Human Resource Management System (HRMS) designed to streamline organizational workflows, manage employee lifecycles, and automate HR procedures. With a clean, premium, and fully responsive user interface, it provides a seamless experience for administrators, HR professionals, and employees alike.

🌐 **Live Demo**: [https://workmete.netlify.app/](https://workmete.netlify.app/)

---

## 🛠️ Technology Stack

### Frontend (Client-side)
* **Framework**: React.js (via Vite)
* **Styling**: Tailwind CSS (Fully responsive layout system)
* **Routing**: React Router DOM
* **API Client**: Axios (configured with interceptors for JWT token handling)

### Backend (Server-side)
* **Framework**: Spring Boot (Spring Web, Security, Data JPA, Validation)
* **Java Version**: JDK 25
* **Authentication**: JWT (JSON Web Tokens) stateless security
* **Database Access**: JPA / Hibernate
* **AI Capability**: Spring AI integrating with **Groq API** (Llama 3.3 model)
* **PDF Utility**: OpenPDF (for dynamic payslip generation)
* **Email System**: Brevo HTTPS API

### Database
* **Database**: MySQL

---

## 🚀 Key Features

### 👥 1. Role-Based Access Control (RBAC)
* **Admin Dashboard**: Manage user roles, system activity logs, and high-level configurations.
* **HR Portal**: Add and manage employees, configure salary structures, approve leaves, create onboarding checklists, schedule interviews, and log promotions.
* **Employee Portal**: Personal dashboard, attendance tracking, leave requests, download PDF payslips, and check onboarding task completion.

### ⏱️ 2. Attendance Tracker
* Daily check-in and check-out logs with duration/hours calculations.
* Monthly attendance calendar and logs.
* Automated daily scheduler checking for missing check-outs.

### 📅 3. Leave Management System
* Tracks leave balances dynamically by category (e.g., Casual Leave, Sick Leave).
* Employee apply portal and HR approval/rejection workflows.
* Automated email notifications to employees on approval/rejection.

### 💰 4. Payroll & Dynamic Payslips
* Flexible configuration of base salary, allowances, and deductions.
* One-click generation of monthly payslips.
* Downloadable PDF payslips with professional, clean, customized formatting.

### 📋 5. Employee Onboarding
* Structured onboarding task lists for new hires.
* Real-time progress percentage tracking for completed tasks.

### 💼 6. Recruitment Engine
* Create and manage job openings.
* Track candidate pipelines from "Applied" through "Interviewing" to "Offered".
* Integrated interview scheduler.

### 🤖 7. AI HR Chatbot
* Contextual virtual HR assistant integrated directly into the employee workspace.
* Powered by Spring AI and the Groq LLM (Llama 3.3).
* Dynamically answers queries regarding company policy, guidelines, and navigation.

### 📧 8. Lead Capture & Business Inquiries
* Integrated "Try WorkMate For Free!" contact lead capture form.
* Automatically formats and sends inquiries directly to the project administrator via the Brevo API.

### 📱 9. Modern Responsive Design
* Handcrafted CSS layouts and responsive flex grids.
* Optimized for all device viewports (Desktop, Tablet, and Mobile).
