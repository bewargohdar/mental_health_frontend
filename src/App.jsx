import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Learn from './pages/Learn';
import TrackMood from './pages/TrackMood';
import Community from './pages/Community';
import Doctors from './pages/Doctors';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="learn" element={<Navigate to="/learn/depression/information" replace />} />
            <Route path="learn/:category/:tab" element={<Learn />} />
            <Route path="track-mood" element={<TrackMood />} />
            <Route path="community" element={<Community />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
