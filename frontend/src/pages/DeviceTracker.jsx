
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Smartphone, User, AlertTriangle, CheckCircle } from 'lucide-react';
import ExportData from '../components/ExportData';
import SecurityAnalysis from '../components/SecurityAnalysis';

const DeviceTracker = () => {
    const { token } = useAuth();
    const [phone, setPhone] = useState('');
    const [nik, setNik] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResults(null);

        try {
            // Track device by phone
            const phoneRes = await axios.post('http://localhost:3001/api/tools/track', { phone }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Also get phone analysis for more data
            const phoneAnalysis = await axios.post('http://localhost:3001/api/tools/phone', { phone }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If NIK provided, analyze it too
            let nikData = null;
            if (nik) {
                const nikRes = await axios.post('http://localhost:3001/api/tools/nik', { nik }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                nikData = nikRes.data;
            }

            setResults({
                device: phoneRes.data,
                phone: phoneAnalysis.data,
                nik: nikData
            });

        } catch (err) {
            setError(err.response?.data?.error || 'Tracking failed');
        } finally {
            setLoading(false);
        }
    };

    // Check if location is in Jabodetabek
    const isJabodetabek = (location) => {
        if (!location) return false;
        const jabodetabekAreas = ['jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'dki'];
        return jabodetabekAreas.some(area => location.toLowerCase().includes(area));
    };

    return (
        <div className="tracker-container">
            <div className="tracker-header">
                <MapPin size={32} className="header-icon" />
                <div>
                    <h2>Device Tracker</h2>
                    <p>Track devices registered in Jabodetabek region</p>
                </div>
            </div>

            <form onSubmit={handleTrack} className="tracker-form">
                <div className="form-row">
                    <div className="input-group">
                        <label><Smartphone size={16} /> Phone Number</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+6281234567890"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label><User size={16} /> NIK (Optional)</label>
                        <input
                            type="text"
                            value={nik}
                            onChange={(e) => setNik(e.target.value)}
                            placeholder="3171xxxxxxxxxx"
                        />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="track-btn">
                    {loading ? 'Tracking...' : 'Track Device'}
                </button>
            </form>

            {error && <div className="error-alert"><AlertTriangle size={16} /> {error}</div>}

            {results && (
                <div className="results-container">
                    {/* Location Card */}
                    <div className="result-card location-card">
                        <h3><MapPin size={20} /> Location Information</h3>
                        <div className="card-content">
                            {results.phone?.geolocation && (
                                <>
                                    <div className="info-row">
                                        <span>Region:</span>
                                        <strong>{results.phone.geolocation.location || 'Unknown'}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span>Timezone:</span>
                                        <strong>{results.phone.timezone || 'Unknown'}</strong>
                                    </div>
                                    <div className={`jabodetabek-badge ${isJabodetabek(results.phone.geolocation?.location) ? 'yes' : 'no'}`}>
                                        {isJabodetabek(results.phone.geolocation?.location) ? (
                                            <><CheckCircle size={16} /> Registered in Jabodetabek</>
                                        ) : (
                                            <><AlertTriangle size={16} /> Outside Jabodetabek</>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Phone Info Card */}
                    <div className="result-card">
                        <h3><Smartphone size={20} /> Phone Details</h3>
                        <div className="card-content">
                            <div className="info-row">
                                <span>Number:</span>
                                <strong>{phone}</strong>
                            </div>
                            <div className="info-row">
                                <span>Provider:</span>
                                <strong>{results.phone?.provider || 'Unknown'}</strong>
                            </div>
                            <div className="info-row">
                                <span>Type:</span>
                                <strong>{results.phone?.line_type || 'Mobile'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* NIK Info Card */}
                    {results.nik && !results.nik.error && (
                        <div className="result-card">
                            <h3><User size={20} /> NIK Information</h3>
                            <div className="card-content">
                                <div className="info-row">
                                    <span>Province:</span>
                                    <strong>{results.nik.provinsi || 'Unknown'}</strong>
                                </div>
                                <div className="info-row">
                                    <span>City:</span>
                                    <strong>{results.nik.kabupaten_kota || 'Unknown'}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Gender:</span>
                                    <strong>{results.nik.gender || 'Unknown'}</strong>
                                </div>
                                <div className="info-row">
                                    <span>DOB:</span>
                                    <strong>{results.nik.tanggal_lahir || 'Unknown'}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Raw Data */}
                    <details className="raw-data">
                        <summary>View Raw Data</summary>
                        <pre>{JSON.stringify(results, null, 2)}</pre>
                    </details>

                    {/* Export Options */}
                    <ExportData data={results} filename="device_tracking" />

                    {/* ML Security Analysis */}
                    <SecurityAnalysis scanType="device" results={results} />
                </div>
            )}
        </div>
    );
};

export default DeviceTracker;
