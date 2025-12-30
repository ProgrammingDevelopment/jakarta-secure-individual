
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, MapPin, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import ExportData from '../components/ExportData';

const NIKScanner = () => {
    const { token } = useAuth();
    const [nik, setNik] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3001/api/tools/nik', { nik }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
        } catch (err) {
            alert('Scan failed');
        } finally {
            setLoading(false);
        }
    };

    const isJabodetabek = (provinsi, kota) => {
        const loc = `${provinsi} ${kota}`.toLowerCase();
        const areas = ['jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'dki', 'banten'];
        return areas.some(area => loc.includes(area));
    };

    return (
        <div className="tracker-container">
            <div className="tracker-header">
                <FileText size={32} className="header-icon" />
                <div>
                    <h2>NIK Scanner</h2>
                    <p>Analyze Indonesian National ID (NIK)</p>
                </div>
            </div>

            <form onSubmit={handleScan} className="tracker-form">
                <div className="input-group full-width">
                    <label><FileText size={16} /> NIK (16 Digits)</label>
                    <input
                        type="text"
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        placeholder="3171xxxxxxxxxx"
                        maxLength={16}
                        required
                    />
                </div>
                <button type="submit" disabled={loading} className="track-btn">
                    {loading ? 'Scanning...' : 'Scan NIK'}
                </button>
            </form>

            {results && !results.error && (
                <div className="results-container">
                    <div className="result-card">
                        <h3><MapPin size={20} /> Location</h3>
                        <div className="card-content">
                            <div className="info-row">
                                <span>Province:</span>
                                <strong>{results.provinsi || 'Unknown'}</strong>
                            </div>
                            <div className="info-row">
                                <span>City/Regency:</span>
                                <strong>{results.kabupaten_kota || 'Unknown'}</strong>
                            </div>
                            <div className="info-row">
                                <span>District:</span>
                                <strong>{results.kecamatan || 'Unknown'}</strong>
                            </div>
                            <div className={`jabodetabek-badge ${isJabodetabek(results.provinsi, results.kabupaten_kota) ? 'yes' : 'no'}`}>
                                {isJabodetabek(results.provinsi, results.kabupaten_kota) ? (
                                    <><CheckCircle size={16} /> Jabodetabek Resident</>
                                ) : (
                                    <><XCircle size={16} /> Outside Jabodetabek</>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="result-card">
                        <h3><User size={20} /> Personal Info</h3>
                        <div className="card-content">
                            <div className="info-row">
                                <span>Gender:</span>
                                <strong>{results.gender || 'Unknown'}</strong>
                            </div>
                            <div className="info-row">
                                <span>Date of Birth:</span>
                                <strong>{results.tanggal_lahir || 'Unknown'}</strong>
                            </div>
                        </div>
                    </div>

                    <details className="raw-data">
                        <summary>View Raw Data</summary>
                        <pre>{JSON.stringify(results, null, 2)}</pre>
                    </details>

                    {/* Export Options */}
                    <ExportData data={results} filename="nik_scan" />
                </div>
            )}

            {results?.error && (
                <div className="error-alert">
                    <XCircle size={16} /> {results.error}
                </div>
            )}
        </div>
    );
};

export default NIKScanner;
