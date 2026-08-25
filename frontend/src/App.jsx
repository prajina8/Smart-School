import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Courses from "./pages/Courses.jsx";
import AttendancePage from "./pages/attendance/AttendancePage.jsx";
import Notices from "./pages/Notices.jsx";
import Messages from "./pages/Messages.jsx";
import Timetable from "./pages/Timetable.jsx";
import Users from "./pages/Users.jsx";
import NotFound from "./pages/NotFound.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
