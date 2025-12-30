
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info, Lock, Eye, EyeOff } from 'lucide-react';

/**
 * ML Security Analysis Component
 * Analyzes scan results and provides DO/DON'T recommendations
 */
const SecurityAnalysis = ({ scanType, results }) => {
    if (!results) return null;

    // ML-like Risk Scoring based on data patterns
    const analyzeRisk = () => {
        let riskScore = 0;
        let riskFactors = [];
        let recommendations = { do: [], dont: [] };

        if (scanType === 'phone') {
            // Phone-based risk analysis
            if (!results.valid) {
                riskScore += 30;
                riskFactors.push('Invalid phone number format');
                recommendations.dont.push('Do not trust communications from this number');
            }
            if (results.provider === 'Unknown' || !results.provider) {
                riskScore += 20;
                riskFactors.push('Unknown provider (possible virtual/VOIP number)');
                recommendations.dont.push('Avoid sharing sensitive data via this number');
            }
            if (results.line_type === 'VOIP') {
                riskScore += 15;
                riskFactors.push('VOIP number detected - easily spoofable');
                recommendations.do.push('Verify identity through secondary channel');
            }
        }

        if (scanType === 'nik') {
            // NIK-based risk analysis
            if (results.error) {
                riskScore += 40;
                riskFactors.push('Invalid NIK format');
                recommendations.dont.push('Do not proceed with transactions using this NIK');
            }
            // Check for suspicious birth date patterns
            const birthYear = results.tanggal_lahir?.split('-')[0];
            if (birthYear && (parseInt(birthYear) < 1950 || parseInt(birthYear) > 2010)) {
                riskScore += 10;
                riskFactors.push('Unusual birth year detected');
                recommendations.do.push('Request additional identity verification');
            }
        }

        if (scanType === 'device' || scanType === 'persona') {
            // Cross-reference analysis
            if (results.phone?.provider === 'Unknown') {
                riskScore += 15;
                riskFactors.push('Unknown phone provider');
            }
            if (results.nik?.error) {
                riskScore += 25;
                riskFactors.push('NIK validation failed');
                recommendations.dont.push('Do not approve credit or high-value transactions');
            }
            // Location mismatch detection
            const phoneLocation = results.phone?.geolocation?.location?.toLowerCase() || '';
            const nikLocation = (results.nik?.provinsi + ' ' + results.nik?.kabupaten_kota)?.toLowerCase() || '';
            if (phoneLocation && nikLocation && !phoneLocation.includes(nikLocation.split(' ')[0])) {
                riskScore += 20;
                riskFactors.push('Location mismatch between phone and NIK');
                recommendations.do.push('Verify current residence address');
            }
        }

        // General recommendations based on risk level
        if (riskScore < 20) {
            recommendations.do.push('Low risk - proceed with standard verification');
            recommendations.do.push('Document the verification for compliance');
        } else if (riskScore < 50) {
            recommendations.do.push('Request additional documentation');
            recommendations.do.push('Enable enhanced monitoring for this account');
            recommendations.dont.push('Do not auto-approve sensitive operations');
        } else {
            recommendations.do.push('Escalate to security team for manual review');
            recommendations.do.push('Flag account for enhanced due diligence');
            recommendations.dont.push('Do not process any financial transactions');
            recommendations.dont.push('Avoid sharing any internal information');
        }

        return { riskScore, riskFactors, recommendations };
    };

    const analysis = analyzeRisk();
    const riskLevel = analysis.riskScore < 20 ? 'low' : analysis.riskScore < 50 ? 'medium' : 'high';

    return (
        <div className="security-analysis">
            <div className="security-header">
                <Shield size={24} />
                <h3>ML Security Analysis</h3>
            </div>

            {/* Risk Score */}
            <div className={`risk-meter ${riskLevel}`}>
                <div className="risk-label">Risk Score</div>
                <div className="risk-bar">
                    <div
                        className="risk-fill"
                        style={{ width: `${Math.min(analysis.riskScore, 100)}%` }}
                    ></div>
                </div>
                <div className="risk-value">{analysis.riskScore}/100</div>
            </div>

            {/* Risk Factors */}
            {analysis.riskFactors.length > 0 && (
                <div className="risk-factors">
                    <h4><AlertTriangle size={16} /> Risk Factors Detected</h4>
                    <ul>
                        {analysis.riskFactors.map((factor, i) => (
                            <li key={i}><XCircle size={14} /> {factor}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* DO Recommendations */}
            <div className="recommendations do-section">
                <h4><CheckCircle size={16} /> DO - Recommended Actions</h4>
                <ul>
                    {analysis.recommendations.do.map((rec, i) => (
                        <li key={i}><CheckCircle size={14} /> {rec}</li>
                    ))}
                </ul>
            </div>

            {/* DON'T Recommendations */}
            <div className="recommendations dont-section">
                <h4><XCircle size={16} /> DON'T - Avoid These Actions</h4>
                <ul>
                    {analysis.recommendations.dont.map((rec, i) => (
                        <li key={i}><XCircle size={14} /> {rec}</li>
                    ))}
                </ul>
            </div>

            {/* Digital Security Prevention Tips */}
            <div className="security-tips">
                <h4><Lock size={16} /> Digital Security Prevention</h4>
                <div className="tips-grid">
                    <div className="tip-card">
                        <Eye size={20} />
                        <span>Always verify identity through multiple channels</span>
                    </div>
                    <div className="tip-card">
                        <EyeOff size={20} />
                        <span>Never share scan results via unsecured channels</span>
                    </div>
                    <div className="tip-card">
                        <Lock size={20} />
                        <span>Use end-to-end encryption for data transmission</span>
                    </div>
                    <div className="tip-card">
                        <Info size={20} />
                        <span>Log all verification activities for audit trail</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityAnalysis;
