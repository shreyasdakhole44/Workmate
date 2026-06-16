import { useAuth } from "../../context/AuthContext";
import AdminDashboard    from "./AdminDashboard";
import HRDashboard       from "./HRDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === "ADMIN")      return <AdminDashboard/>;
  if (user?.role === "HR_MANAGER") return <HRDashboard/>;
  return <EmployeeDashboard/>;
}
