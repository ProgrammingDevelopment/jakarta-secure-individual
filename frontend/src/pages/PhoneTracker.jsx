
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Smartphone, MapPin, Shield, AlertTriangle } from 'lucide-react';
import ExportData from '../components/ExportData';

const PhoneTracker = () => {
    const { token } = useAuth();
    const [phone, setPhone] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3001/api/tools/phone', { phone }, {
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
        <div className="tracker-container">
            <div className="tracker-header">
                <Smartphone size={32} className="header-icon" />
                <div>
                    <h2>Phone Number Analysis</h2>
                    <p>Analyze phone numbers for location, provider, and risk</p>
                </div>
            </div>

            <form onSubmit={handleAnalyze} className="tracker-form">
                <div className="input-group full-width">
                    <label><Smartphone size={16} /> Phone Number</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+6281234567890"
                        required
                    />
                </div>
                <button type="submit" disabled={loading} className="track-btn">
                    {loading ? 'Analyzing...' : 'Analyze Phone'}
                </button>
            </form>

            {results && (
                <div className="results-container">
                    <div className="result-card">
                        <h3><MapPin size={20} /> Location</h3>
                        <div className="card-content">
                            <div className="info-row">
                                <span>Country:</span>
                                <strong>{results.geolocation?.country || 'Unknown'}</strong>
                            </div>
                            <div className="info-row">
                                <span>Region:</span>
                                <strong>{results.geolocation?.location || 'Unknown'}</strong>
                            </div>
                            <div className="info-row">
                                <span>Timezone:</span>
                                <strong>{results.timezone || 'Unknown'}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="result-card">
                        <h3><Shield size={20} /> Provider Info</h3>
                        <div className="card-content">
                            <div className="info-row">
                                <span>Provider:</span>
                                <strong>{results.provider || 'Unknown'}</strong>
                            </div>
                            <div className="info-row">
                                <span>Line Type:</span>
                                <strong>{results.line_type || 'Mobile'}</strong>
                            </div>
                            <div className="info-row">
                                <span>Valid:</span>
                                <strong>{results.valid ? 'Yes' : 'No'}</strong>
                            </div>
                        </div>
                    </div>

                    <details className="raw-data">
                        <summary>View Raw Data</summary>
                        <pre>{JSON.stringify(results, null, 2)}</pre>
                    </details>

                    {/* Export Options */}
                    <ExportData data={results} filename="phone_analysis" />
                </div>
            )}
        </div>
    );
};

export default PhoneTracker;
