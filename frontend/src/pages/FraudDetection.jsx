
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FraudDetection = () => {
    const { token } = useAuth();
    const [imei, setImei] = useState('');
    const [phone, setPhone] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCheckIMEI = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3001/api/tools/fraud/imei', { imei }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
        } catch (err) { alert('Check failed'); }
        setLoading(false);
    };

    const handleCheckPhone = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3001/api/tools/fraud/phone', { phone }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
        } catch (err) { alert('Check failed'); }
        setLoading(false);
    };

    return (
        <div className="tool-container">
            <h2>Fraud Detection System</h2>

            <div className="split-form">
                <div className="sub-tool">
                    <h3>IMEI Check (Kemenperin)</h3>
                    <input value={imei} onChange={e => setImei(e.target.value)} placeholder="IMEI (15 digits)" />
                    <button onClick={handleCheckIMEI} disabled={loading}>Check IMEI</button>
                </div>

                <div className="sub-tool">
                    <h3>Deep Phone Fraud Analysis</h3>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" />
                    <button onClick={handleCheckPhone} disabled={loading}>Analyze Phone</button>
                </div>
            </div>

            {results && (
                <div className="results-display">
                    <h3>Results</h3>
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default FraudDetection;
