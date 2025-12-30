
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, LayoutDashboard, UserCheck, ShieldAlert, FileText, Smartphone, MapPin } from 'lucide-react';

const Layout = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`app-layout ${theme}`}>
            <aside className="sidebar">
                <div className="logo">
                    <h2>JAKARTA SECURE</h2>
                    <span>INDIVIDUAL</span>
                </div>

                <nav>
                    <Link to="/" className="nav-item"><LayoutDashboard size={20} /> Dashboard</Link>
                    <Link to="/persona" className="nav-item"><UserCheck size={20} /> Persona Analysis</Link>
                    <Link to="/fraud" className="nav-item"><ShieldAlert size={20} /> Fraud Detection</Link>
                    <Link to="/nik" className="nav-item"><FileText size={20} /> NIK Scanner</Link>
                    <Link to="/phone" className="nav-item"><Smartphone size={20} /> Phone Tracker</Link>
                    <Link to="/device-track" className="nav-item"><MapPin size={20} /> Device Tracker</Link>
                </nav>

                <div className="user-section">
                    <div className="user-info">Logged in as: <strong>{user?.username}</strong></div>
                    <button onClick={handleLogout} className="logout-btn"><LogOut size={16} /> Logout</button>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <h3>System Dashboard</h3>
                    <button onClick={toggleTheme} className="theme-toggle">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
