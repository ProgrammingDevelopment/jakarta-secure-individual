
import React from 'react';

const Dashboard = () => {
    return (
        <div className="dashboard-home">
            <div className="welcome-banner">
                <h1>Welcome to Jakarta Secure Individual</h1>
                <p>Advanced OSINT & Security Analysis Platform</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Tools Available</h3>
                    <div className="number">12+</div>
                </div>
                <div className="stat-card">
                    <h3>System Status</h3>
                    <div className="number status-ok">ONLINE</div>
                </div>
                <div className="stat-card">
                    <h3>Database</h3>
                    <div className="number">Connected</div>
                </div>
            </div>

            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-grid">
                    <div className="action-card">Check NIK</div>
                    <div className="action-card">Analyze Phone</div>
                    <div className="action-card">Fraud Check</div>
                    <div className="action-card">Persona Scan</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
