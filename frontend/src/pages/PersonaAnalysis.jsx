
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const PersonaAnalysis = () => {
    const { token } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [nik, setNik] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}?action=analyze_persona`, { name, phone, nik }, {
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
            <h2>Persona Analysis</h2>
            <form onSubmit={handleSubmit} className="tool-form">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="NIK"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Analyze Persona'}
                </button>
            </form>

            {results && (
                <div className="results-display">
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default PersonaAnalysis;
