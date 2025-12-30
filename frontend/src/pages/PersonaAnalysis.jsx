
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PersonaAnalysis = () => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({ name: '', phone: '', nik: '' });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3001/api/tools/persona', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
        } catch (err) {
            alert('Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-container">
            <h2>Persona Analysis 360 (ML-Powered)</h2>
            <form onSubmit={handleSubmit} className="tool-form">
                <input
                    type="text" placeholder="Full Name"
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    type="text" placeholder="Phone (+62...)"
                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <input
                    type="text" placeholder="NIK"
                    value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value })}
                />
                <button disabled={loading}>{loading ? 'Analyzing...' : 'Run Analysis'}</button>
            </form>

            {results && (
                <div className="results-display">
                    <h3>Results</h3>
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default PersonaAnalysis;
