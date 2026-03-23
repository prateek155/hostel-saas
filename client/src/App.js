import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Pagenotfound from "./pages/Pagenotfound";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import AdminRoute from "./components/Routes/AdminRoutes";
import OwnerRoute from "./components/Routes/OwnerRoute";
import StudentRoute from "./components/Routes/StudentRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CreateOwner from "./pages/Admin/CreateOwner";
import AllStudents from "./pages/Admin/AllStudents";
import OwnerDashboard from "./pages/Owner/OwnerDashboard";
import CreateHostel from "./pages/Owner/CreateHostel";
import MyHostel from "./pages/Owner/MyHostel";
import Students from "./pages/Owner/Students";
import Rooms from "./pages/Owner/Rooms";
import AssignRooms from "./pages/Owner/AssignRooms";
import Attandance from "./pages/Owner/Attandance";
import StudentDashboard from "./pages/Student/StudentDashboard";
import SetPassword from "./pages/Student/SetPassword";
import "./App.css";
import AllHostels from "./pages/Admin/AllHostels";
import AdminProfile from "./pages/Admin/AdminProfile";
import OwnerProfile from "./pages/Owner/OwnerProfile";
import StudentProfile from "./pages/Student/StudentProfile";
import Vehicle from "./pages/Owner/Vehicle";
import Fees from "./pages/Owner/Fees";
import MessMenu from "./pages/Owner/MessMenu";
import AdminSettings from "./pages/Admin/AdminSettings";
import Settings from "./pages/Owner/Settings";
import DailyMenu from "./pages/Student/DailyMenu";
import Project from "./pages/Student/Project";
import Event from "./pages/Event";
import Projects from "./pages/Projects";
import Announcement from "./pages/Owner/Announcement";
import Learningbox from "./pages/Student/Learningbox";
import Reportadmin from "./pages/Admin/Reportadmin";
import Emails from "./pages/Owner/Emails";
import Setemail from "./pages/Admin/Setemail";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/events" element={<Event />} />
        <Route path="/projects" element={<Projects />} />


        {/* 🔓 PUBLIC STUDENT PASSWORD SET */}
        <Route path="/student/set-password/:token" element={<SetPassword />} />

        {/* OWNER ROUTES */}
        <Route path="/dashboard" element={<OwnerRoute />}>
          <Route path="owner">
            <Route index element={<OwnerDashboard />} />
            <Route path="profile" element={<OwnerProfile />} />
            <Route path="create-hostel" element={<CreateHostel />} />
            <Route path="my-hostel" element={<MyHostel />} />
            <Route path="students" element={<Students />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="assign-room" element={<AssignRooms />} />
            <Route path="attandance" element={<Attandance />} />
            <Route path="vehicle" element={<Vehicle />} />
            <Route path="fees" element={<Fees />} />
            <Route path="mess" element={<MessMenu />} />
            <Route path="setting" element={<Settings />} />
            <Route path="announcement" element={<Announcement />} />
            <Route path="emails" element={<Emails />} />
          </Route>
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/dashboard" element={<AdminRoute />}>
            <Route path="admin">
              <Route index element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="create-owner" element={<CreateOwner />} />
              <Route path="allstudents" element={<AllStudents />} />
              <Route path="allhostels" element={<AllHostels />} />
              <Route path="adminsetting" element={<AdminSettings />} />
              <Route path="reports" element={<Reportadmin />} />
              <Route path="emailset" element={<Setemail />} />
              <Route path="system-settings" element={<AdminSystemSettings />} />
            </Route>
        </Route>

        {/* STUDENT ROUTES (AFTER LOGIN) */}
        <Route path="/dashboard" element={<StudentRoute />}>
          <Route path="student">
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="daily-menu" element={<DailyMenu />} />
            <Route path="projects" element={<Project />} />
            <Route path="learning" element={<Learningbox />} />

          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Pagenotfound />} />
      </Routes>
    </div>
  );
}

export default App;
