// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MoodForm from './components/MoodForm';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import JournalForm from './components/JournalForm';
import SelfCare from './components/SelfCare';
import SOSPlan from './components/SOSPlan'; // ✅ SOS Page
import EmergencyButton from './components/EmergencyButton'; // ✅ Floating SOS Button
import Analytics from './pages/Analytics';
import AppointmentBooking from './components/Appointments/AppointmentBooking'; // ✅ Booking page
import AppointmentList from './components/Appointments/AppointmentList';       // ✅ My Appointments page

// Layout with conditional Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar =
    location.pathname === '/' || location.pathname === '/register';
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideNavbar && <EmergencyButton />} {/* ✅ Show floating SOS button */}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Feature Routes */}
          <Route path="/mood" element={<MoodForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/journal" element={<JournalForm />} />
          <Route path="/selfcare" element={<SelfCare />} />
          <Route path="/sos" element={<SOSPlan />} /> {/* ✅ SOS Route */}
          <Route path="/analytics" element={<Analytics />} />

          {/* ✅ Appointment Routes */}
          <Route path="/appointments" element={<AppointmentBooking />} />
          <Route path="/my-appointments" element={<AppointmentList />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
