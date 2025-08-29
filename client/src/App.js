// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminModeration from './components/Admin/AdminModeration';
import AdminAppointments from './components/Admin/AdminAppointments';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MoodForm from './components/MoodForm';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import JournalForm from './components/JournalForm';
import SelfCare from './components/SelfCare';
import SOSPlan from './components/SOSPlan';
import EmergencyButton from './components/EmergencyButton';

import AppointmentBooking from './components/Appointments/AppointmentBooking';
import AppointmentCalendar from './pages/AppointmentCalendar';
import Analytics from './pages/Analytics';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/' || location.pathname === '/register';
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideNavbar && <EmergencyButton />}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />

          <Route path="/mood" element={<MoodForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/journal" element={<JournalForm />} />
          <Route path="/selfcare" element={<SelfCare />} />
          <Route path="/sos" element={<SOSPlan />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* Appointments */}
          <Route path="/appointments" element={<AppointmentBooking />} />
          <Route path="/appointments/calendar" element={<AppointmentCalendar />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
