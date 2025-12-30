
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default role
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const res = await login(username, password);
            if (res.success) navigate('/');
            else setError(res.error);
        } else {
            const res = await register(username, password, role);
            if (res.success) {
                alert('Registration successful! Please login.');
                setIsLogin(true);
            } else {
                setError(res.error);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>JAKARTA SECURE</h1>
                <p>{isLogin ? 'Login to Access Ultimate Tools' : 'Create New Account'}</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {!isLogin && (
                        <div className="role-selector" style={{ marginBottom: '10px', textAlign: 'left' }}>
                            <label style={{ marginRight: '10px', color: '#94a3b8' }}>Select Role:</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #334155',
                                    background: '#0f172a',
                                    color: 'white'
                                }}
                            >
                                <option value="user">User (General)</option>
                                <option value="staff">Staff (Internal)</option>
                                <option value="client">Client (Customer)</option>
                            </select>
                        </div>
                    )}
                    <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                </form>

                {error && <div className="error-msg">{error}</div>}

                <div className="toggle-auth">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Register' : 'Login'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
