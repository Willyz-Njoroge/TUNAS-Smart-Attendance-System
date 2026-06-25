import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import RegisterLecturer from "./page/RegisterLecturer";
import LoginLecturer from "./page/LoginLecturer";
import ClassSchedule from "./page/ClassSchedule";
import LandingPage from "./page/LandingPage";
import Attendance from "./page/Attendance";
import SuccessPage from "./page/SuccessPage";
import ClassDetails from "./page/ClassDetails";
import PreviousClass from "./page/PreviousClass";
import RegisterStudent from "./page/RegisterStudent";
import LoginStudent from "./page/LoginStudent";
import Dashboard from "./page/Dashboard";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage />, index: true },

  // ── Lecturer routes ──────────────────────────────────────────
  { path: "/registerLecturer", element: <RegisterLecturer /> },
  { path: "/loginLecturer",    element: <LoginLecturer /> },
  { path: "/classDetails",     element: <ClassDetails /> },
  { path: "/classSchedule",    element: <ClassSchedule /> },
  { path: "/previousClass",    element: <PreviousClass /> },
  { path: "/dashboard",        element: <Dashboard /> },

  // ── Student routes ───────────────────────────────────────────
  { path: "/registerStudent",  element: <RegisterStudent /> },
  { path: "/loginStudent",     element: <LoginStudent /> },
  // LoginStudent redirects here by default after a successful login.
  // For now redirect to the landing page; replace with a real student
  // dashboard page when you build one.
  { path: "/studentDashboard", element: <Navigate to="/" replace /> },

  // ── Shared routes ────────────────────────────────────────────
  { path: "/attendance", element: <Attendance /> },
  { path: "/success",    element: <SuccessPage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;