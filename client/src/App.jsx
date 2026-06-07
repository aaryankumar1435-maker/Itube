import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore.js';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import Watch from './pages/Watch.jsx';
import Upload from './pages/Upload.jsx';
import Search from './pages/Search.jsx';
import Channel from './pages/Channel.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-surface">
        <Navbar />
        <div className="flex flex-1 pt-14">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-60 p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/search" element={<Search />} />
              <Route path="/channel/:id" element={<Channel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
