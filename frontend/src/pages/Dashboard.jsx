import { useAuth } from "../context/AuthContext.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import TeacherDashboard from "./TeacherDashboard.jsx";
import StudentDashboard from "./StudentDashboard.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "teacher") return <TeacherDashboard />;
  return <StudentDashboard />;
};

export default Dashboard;
