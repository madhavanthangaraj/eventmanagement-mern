import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminEventManagement from './pages/admin/AdminEventManagement';
import OrganizerDashboard from './pages/OrganizerDashboard';
import MentorDashboard from './pages/MentorDashboard';
import ProofVerification from './pages/ProofVerification';
import StudentDashboard from './pages/StudentDashboard';
import AvailableEvents from './pages/AvailableEvents';
import MyRegistrations from './pages/MyRegistrations';
import UploadProof from './pages/UploadProof';
import StudentReports from './pages/StudentReports';
import UserManagement from './pages/UserManagement';
import RoleAssignment from './pages/RoleAssignment';
import Reports from './pages/Reports';
import EventApproval from './pages/EventApproval';
import AdminAvailableEvents from './pages/AdminAvailableEvents';
import MyEvents from './pages/MyEvents';
import AdminReports from './pages/admin/AdminReports';
import StudentsList from './pages/admin/StudentsList';
import StudentDetails from './pages/admin/StudentDetails';
import CreateExternalEvent from './pages/organizer/CreateExternalEvent';
import CreateEvent from './pages/organizer/CreateExternalEvent';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />

          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super-admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/users"
            element={
              <ProtectedRoute allowedRoles={['super-admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/roles"
            element={
              <ProtectedRoute allowedRoles={['super-admin']}>
                <RoleAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/reports"
            element={
              <ProtectedRoute allowedRoles={['super-admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/event-approvals"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <EventApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/available-events"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAvailableEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminEventManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <StudentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/:studentId"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <StudentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/create-event"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/my-events"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['MENTOR']}>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/proof-verification"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <ProofVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/events"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AvailableEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/registrations"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/upload-proof"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <UploadProof />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/reports"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentReports />
              </ProtectedRoute>
            }
          />

          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
