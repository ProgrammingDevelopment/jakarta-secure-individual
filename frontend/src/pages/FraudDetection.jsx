
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const FraudDetection = () => {
    const { token } = useAuth();
    const [imei, setImei] = useState('');
    const [phone, setPhone] = useState('');
    const [imeiResult, setImeiResult] = useState(null);
    const [phoneResult, setPhoneResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkImei = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}?action=fraud_check_imei`, { imei }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImeiResult(res.data);
        } catch (err) {
            alert('IMEI check failed');
        } finally {
            setLoading(false);
        }
    };

    const checkPhone = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}?action=fraud_check_phone`, { phone }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPhoneResult(res.data);
        } catch (err) {
            alert('Phone check failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container">
            <h2>Fraud Detection</h2>

            <div className="split-form">
                <div className="sub-tool">
                    <h3>IMEI Check</h3>
                    <form onSubmit={checkImei}>
                        <input
                            type="text"
                            placeholder="Enter IMEI"
                            value={imei}
                            onChange={(e) => setImei(e.target.value)}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Checking...' : 'Check IMEI'}
                        </button>
                    </form>
                    {imeiResult && (
                        <div className="results-display">
                            <pre>{JSON.stringify(imeiResult, null, 2)}</pre>
                        </div>
                    )}
                </div>

                <div className="sub-tool">
                    <h3>Phone Fraud Check</h3>
                    <form onSubmit={checkPhone}>
                        <input
                            type="text"
                            placeholder="Enter Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Checking...' : 'Check Phone'}
                        </button>
                    </form>
                    {phoneResult && (
                        <div className="results-display">
                            <pre>{JSON.stringify(phoneResult, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FraudDetection;
