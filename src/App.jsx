import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import EmployeePage from "./pages/admin/EmployeeManagement/EmployeePage";
import AttendancePage from "./pages/attendance/AttendancePage";
import LeavePage from "./pages/leave/LeavePage";
import PerformancePage from "./pages/performance/PerformancePage";
import ProfilePage from "./pages/profile/ProfilePage";
import RecruitmentPage from "./pages/recruitment/RecruitmentPage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import SalaryStructurePage from "./pages/admin/Payroll/SalaryStructurePage";
import UserManagementPage from "./pages/admin/UserManagement/UserManagementPage";
import OrgReportsPage from "./pages/admin/Reports/OrgReportsPage";
import PayslipPage from "./pages/payslip/PayslipPage";
import Layout from "./components/layout/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardRouter />,
      },
      {
        path: "employees",
        element: (
          <ProtectedRoute roles={["ADMIN", "HR_MANAGER"]}>
            <EmployeePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "attendance",
        element: <AttendancePage />,
      },
      {
        path: "leave",
        element: <LeavePage />,
      },
      {
        path: "performance",
        element: <PerformancePage />,
      },
      {
        path: "recruitment",
        element: (
          <ProtectedRoute roles={["ADMIN", "HR_MANAGER"]}>
            <RecruitmentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "onboarding",
        element: <OnboardingPage />,
      },
      {
        path: "payroll",
        element: (
          <ProtectedRoute roles={["ADMIN", "HR_MANAGER"]}>
            <SalaryStructurePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "user-management",
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute roles={["ADMIN", "HR_MANAGER"]}>
            <OrgReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payslip",
        element: (
          <ProtectedRoute roles={["EMPLOYEE"]}>
            <PayslipPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
