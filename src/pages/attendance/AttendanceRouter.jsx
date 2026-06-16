import { useAuth } from "../../context/AuthContext";
import MyAttendance from "./MyAttendance";
import TeamAttendance from "./TeamAttendance";

export default function AttendanceRouter() {
  const { isHR } = useAuth();
  if (isHR()) return <TeamAttendance/>;
  return <MyAttendance/>;
}
