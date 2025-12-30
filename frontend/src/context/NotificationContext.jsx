
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((type, title, message, action = null) => {
        const id = Date.now();
        const newNotification = {
            id,
            type, // 'success', 'error', 'warning', 'info'
            title,
            message,
            action, // Optional: { label: 'View', route: '/path' }
            timestamp: new Date().toISOString()
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-remove after 5 seconds (except errors)
        if (type !== 'error') {
            setTimeout(() => {
                removeNotification(id);
            }, 5000);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Utility functions for common notifications
    const notify = {
        success: (title, message, action) => addNotification('success', title, message, action),
        error: (title, message, action) => addNotification('error', title, message, action),
        warning: (title, message, action) => addNotification('warning', title, message, action),
        info: (title, message, action) => addNotification('info', title, message, action),

        // DNS Routing Actions - Specific alerts
        scanComplete: (scanType, riskLevel) => {
            const route = `/${scanType}`;
            if (riskLevel === 'high') {
                addNotification('error', 'High Risk Detected', `${scanType.toUpperCase()} scan detected high-risk indicators`, { label: 'Review', route });
            } else if (riskLevel === 'medium') {
                addNotification('warning', 'Medium Risk', `${scanType.toUpperCase()} scan requires attention`, { label: 'View', route });
            } else {
                addNotification('success', 'Scan Complete', `${scanType.toUpperCase()} analysis completed successfully`, { label: 'View', route });
            }
        },

        loginAlert: (username, success) => {
            if (success) {
                addNotification('success', 'Login Successful', `Welcome back, ${username}!`);
            } else {
                addNotification('error', 'Login Failed', 'Invalid credentials. Please try again.');
            }
        },

        securityAlert: (message) => {
            addNotification('warning', 'Security Alert', message, { label: 'Review', route: '/security' });
        },

        dataExport: (format) => {
            addNotification('info', 'Export Complete', `Data exported as ${format.toUpperCase()}`);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, notify, removeNotification }}>
            {children}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        </NotificationContext.Provider>
    );
};

// Notification Display Container
const NotificationContainer = ({ notifications, onRemove }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} />;
            case 'error': return <XCircle size={20} />;
            case 'warning': return <AlertTriangle size={20} />;
            default: return <Info size={20} />;
        }
    };

    return (
        <div className="notification-container">
            {notifications.map(notification => (
                <div key={notification.id} className={`notification ${notification.type}`}>
                    <div className="notification-icon">
                        {getIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        {notification.action && (
                            <a href={notification.action.route} className="notification-action">
                                {notification.action.label} →
                            </a>
                        )}
                    </div>
                    <button className="notification-close" onClick={() => onRemove(notification.id)}>
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};
