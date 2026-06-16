import { useAuth } from "../../context/AuthContext";
import MyPerformance from "./MyPerformance";
import TeamPerformance from "./TeamPerformance";

export default function PerformanceRouter() {
  const { isHR } = useAuth();
  if (isHR()) return <TeamPerformance/>;
  return <MyPerformance/>;
}
