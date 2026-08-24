import { useAuth } from "../../context/AuthContext.jsx";
import TeacherSession from "./TeacherSession.jsx";
import StudentCheckIn from "./StudentCheckIn.jsx";

const AttendancePage = () => {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentCheckIn />;
  return <TeacherSession />;
};

export default AttendancePage;
