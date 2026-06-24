# WorkMate HRMS (Human Resource Management System)

WorkMate is a modern, full-stack Human Resource Management System (HRMS) designed to streamline organizational workflows. It offers role-based access control (Admin, HR, and Employee), attendance tracking, leave requests, payroll processing with PDF payslip generation, performance reviews, recruitment tracking, and a built-in AI HR Chatbot powered by Spring AI and the Groq LLM.

## Repository Structure

The project is structured as a monorepo containing both the frontend and backend:
* **Root Directory (`/`)**: React + Vite + Tailwind CSS frontend application.
* **Backend Directory (`/backend`)**: Spring Boot (Java 25) backend API service.

---

## 🛠️ Technology Stack

### Frontend (Client-side)
* **Framework**: React.js (via Vite)
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM (SPA client-side routing)
* **API Client**: Axios (configured with interceptors for JWT token handling)

### Backend (Server-side)
* **Framework**: Spring Boot 4.0.6 (Spring Web, Security, Data JPA, Validation)
* **Java Version**: JDK 25
* **Authentication**: JWT (JSON Web Tokens) stateless security
* **Database Access**: JPA / Hibernate
* **AI Capability**: Spring AI integrating with **Groq API** (Llama 3.3 model)
* **PDF Utility**: OpenPDF (for dynamic payslip generation)
* **Containerization**: Multi-stage Docker build

### Database & Deployment
* **Database**: MySQL (Aiven Managed MySQL in Production)
* **Frontend Hosting**: Netlify
* **Backend Hosting**: Render (Docker Runtime)

---

## 🚀 Key Features

1. **Role-Based Access Control**:
   * **Admin**: Manage user roles, system activity logs, and high-level configurations.
   * **HR**: Add/remove employees, configure salary structures, approve leaves, create onboarding tasks, schedule interviews, and promote employees.
   * **Employee**: Check in/out (attendance), view personal dashboard, request leaves, download PDF payslips, and check onboarding checklists.
2. **Attendance Tracker**: Log daily check-in and check-out times, calculate total work hours, and view monthly attendance sheets.
3. **Leave Management**: Dynamically tracks leave balances by type (e.g., Casual, Sick). Employees request leaves, and HR approves/rejects them.
4. **Payroll & Promotions**: Define monthly salary structures, generate and export downloadable PDF payslips, and log career promotion histories.
5. **Onboarding Checklist**: Structured task assignment for new hires to track completion.
6. **Recruitment Engine**: Manage job openings, track candidate statuses (Applied, Interviewing, Offered), and schedule interviews.
7. **AI HR Chatbot**: Powered by Groq, the intelligent chatbot assists employees with questions regarding company policies, leave guidelines, or system navigation.

---

## 💻 Local Setup & Installation

### Prerequisites
* **Java**: JDK 25 installed
* **Node.js**: Node 18+ and npm installed
* **Database**: Local MySQL server running

---

### Step 1: Database Setup
1. Log into your local MySQL server:
   ```sql
   CREATE DATABASE workmate_db;
   ```

---

### Step 2: Backend Configuration & Execution
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Open `src/main/resources/application.properties` and verify your local settings:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/workmate_db
   spring.datasource.username=YOUR_MYSQL_USER
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   server.port=8080
   # Set your Groq API Key
   spring.ai.openai.api-key=YOUR_GROQ_API_KEY
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will boot up on `http://localhost:8080` and auto-create the database tables via Hibernate.*

---

### Step 3: Frontend Configuration & Execution
1. Navigate back to the root directory:
   ```bash
   cd ..
   ```
2. Install the node modules:
   ```bash
   npm install
   ```
3. Create a local `.env` file at the root:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will start running, usually at `http://localhost:5173`.*

---

## ☁️ Production Deployment Guide

Deploying WorkMate to production is configured using free tiers across three services: **Aiven** (MySQL), **Render** (Spring Boot), and **Netlify** (React).

### ═══════════════════════════════════════════
### 🛠️ STEP 1 — DATABASE: MySQL on Aiven
### ═══════════════════════════════════════════
1. Sign up/log in to [aiven.io](https://aiven.io).
2. Create a new service: select **MySQL** and choose the **Free Plan** (Hobbyist tier).
3. Pick a hosting region close to where you plan to host your backend (e.g., US/Oregon or US/East).
4. Once the service is running, create a database named `workmate_db` inside the instance.
5. Under the **Overview** tab, copy your connection parameters:
   * **Host**
   * **Port**
   * **User** (typically `avnadmin`)
   * **Password**
6. Note: Aiven requires SSL mode. Your production database URL will look like:
   `jdbc:mysql://<aiven-host>:<aiven-port>/workmate_db?sslMode=REQUIRED`

---

### ═══════════════════════════════════════════
### 💻 STEP 2 — BACKEND: Spring Boot on Render
### ═══════════════════════════════════════════
1. Log in to [render.com](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository containing the WorkMate codebase.
3. Configure the web service:
   * **Name**: `workmate-backend`
   * **Region**: Choose a region close to your Aiven MySQL database.
   * **Root Directory**: `backend` (CRITICAL: Set this to `backend` since our Spring Boot app is in the `/backend` subfolder)
   * **Runtime**: `Docker` (Render will automatically detect the `Dockerfile` inside the root directory we specified)
4. Add the following **Environment Variables** in Render's dashboard under the **Environment** tab:
   * `SPRING_DATASOURCE_URL` = `jdbc:mysql://<aiven-host>:<aiven-port>/workmate_db?sslMode=REQUIRED`
   * `SPRING_DATASOURCE_USERNAME` = `<aiven-user>`
   * `SPRING_DATASOURCE_PASSWORD` = `<aiven-password>`
   * `SPRING_JPA_HIBERNATE_DDL_AUTO` = `update` (for the first startup to seed tables, then you can change it to `validate`)
   * `JWT_SECRET` = `[Generate a secure, random, long alphanumeric string]`
   * `GROQ_API_KEY` = `<your-groq-api-key>`
   * `SPRING_PROFILES_ACTIVE` = `production`
5. Click **Create Web Service**. Render will pull the code, execute the Docker build, and deploy the service.
6. Note: Render's free tier spins down services after 15 minutes of inactivity. The first API call after idle time will experience a 30-60 second "cold start" delay.

---

### ═══════════════════════════════════════════
### 🎨 STEP 3 — FRONTEND: React on Netlify
### ═══════════════════════════════════════════
1. Log in to [netlify.com](https://netlify.com) and click **Add new site** → **Import an existing project** → connect GitHub.
2. Select your repository.
3. Configure build settings:
   * **Base directory**: `.` (leave empty or root)
   * **Build command**: `npm run build`
   * **Publish directory**: `dist`
4. Add the following **Environment Variable** in Netlify's settings (**Site configuration** → **Environment variables**):
   * `VITE_API_URL` = `https://workmate-backend.onrender.com/api` (replace with your Render web service URL)
5. Click **Deploy site**.
6. **Important SPA Routing Setup**: To prevent `404` errors when refreshing a route in React Router, the repository has been preconfigured with `public/_redirects` containing:
   ```text
   /*    /index.html   200
   ```

---

### ═══════════════════════════════════════════
### 🔄 STEP 4 — CORS Alignment
### ═══════════════════════════════════════════
The backend is preconfigured to read its allowed origins list from environment properties. By default, it allows standard local dev environments and `https://workmate-hrms.netlify.app`.

If your Netlify site URL differs (e.g. `https://workmate-hrms-abc123.netlify.app`), set the following environment variable in your **Render Web Service settings** to align the CORS origins:
* `APP_CORS_ALLOWED_ORIGINS` = `https://your-custom-netlify-name.netlify.app,http://localhost:5173`

Render will automatically restart the service, allowing your frontend client to securely request the API.
