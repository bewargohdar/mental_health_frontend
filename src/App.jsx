import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Learn from './pages/Learn';
import TrackMood from './pages/TrackMood';
import Community from './pages/Community';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { BookmarkProvider } from './context/BookmarkContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BookmarkProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="learn" element={<Navigate to="/learn/depression/overview" replace />} />
                <Route path="learn/:category/:tab" element={<Learn />} />
                <Route path="track-mood" element={<TrackMood />} />
                <Route path="community" element={<Community />} />
                <Route path="doctors" element={<Doctors />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="profile" element={<Profile />} />
                <Route path="bookmarks" element={<Bookmarks />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Router>
        </BookmarkProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
