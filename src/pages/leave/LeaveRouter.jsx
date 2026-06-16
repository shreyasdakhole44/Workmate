import { useAuth } from "../../context/AuthContext";
import MyLeave from "./MyLeave";
import LeaveManagement from "./LeaveManagement";

export default function LeaveRouter() {
  const { isHR } = useAuth();
  if (isHR()) return <LeaveManagement/>;
  return <MyLeave/>;
}
