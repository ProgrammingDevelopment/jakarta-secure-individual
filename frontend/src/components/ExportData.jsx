
import React, { useState } from 'react';
import { Download, FileText, Code, Check } from 'lucide-react';

const ExportData = ({ data, filename = 'export' }) => {
    const [exportType, setExportType] = useState('json');
    const [copied, setCopied] = useState(false);

    if (!data) return null;

    const generateCSV = (obj, prefix = '') => {
        let lines = [];
        const flatten = (o, p = '') => {
            for (let key in o) {
                const fullKey = p ? `${p}.${key}` : key;
                if (typeof o[key] === 'object' && o[key] !== null && !Array.isArray(o[key])) {
                    flatten(o[key], fullKey);
                } else {
                    lines.push(`"${fullKey}","${String(o[key]).replace(/"/g, '""')}"`);
                }
            }
        };
        flatten(obj);
        return 'Key,Value\n' + lines.join('\n');
    };

    const generateTXT = (obj, indent = 0) => {
        let result = '';
        const spaces = '  '.repeat(indent);
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                result += `${spaces}${key}:\n${generateTXT(obj[key], indent + 1)}`;
            } else {
                result += `${spaces}${key}: ${obj[key]}\n`;
            }
        }
        return result;
    };

    const generateEmbed = () => {
        return `<script>
// Jakarta Secure Individual - Embedded Data
const JSI_DATA = ${JSON.stringify(data, null, 2)};
console.log('Jakarta Secure Individual Data Loaded:', JSI_DATA);
</script>`;
    };

    const getContent = () => {
        switch (exportType) {
            case 'csv': return generateCSV(data);
            case 'txt': return generateTXT(data);
            case 'embed': return generateEmbed();
            default: return JSON.stringify(data, null, 2);
        }
    };

    const getFileExtension = () => {
        switch (exportType) {
            case 'csv': return 'csv';
            case 'txt': return 'txt';
            case 'embed': return 'html';
            default: return 'json';
        }
    };

    const getMimeType = () => {
        switch (exportType) {
            case 'csv': return 'text/csv';
            case 'txt': return 'text/plain';
            case 'embed': return 'text/html';
            default: return 'application/json';
        }
    };

    const handleDownload = () => {
        const content = getContent();
        const blob = new Blob([content], { type: getMimeType() });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${Date.now()}.${getFileExtension()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopyEmbed = () => {
        navigator.clipboard.writeText(getContent());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="export-container">
            <h4><Download size={18} /> Export Data</h4>

            <div className="export-options">
                <label className={exportType === 'json' ? 'active' : ''}>
                    <input
                        type="radio"
                        name="exportType"
                        value="json"
                        checked={exportType === 'json'}
                        onChange={(e) => setExportType(e.target.value)}
                    />
                    <FileText size={16} /> JSON
                </label>
                <label className={exportType === 'csv' ? 'active' : ''}>
                    <input
                        type="radio"
                        name="exportType"
                        value="csv"
                        checked={exportType === 'csv'}
                        onChange={(e) => setExportType(e.target.value)}
                    />
                    <FileText size={16} /> CSV
                </label>
                <label className={exportType === 'txt' ? 'active' : ''}>
                    <input
                        type="radio"
                        name="exportType"
                        value="txt"
                        checked={exportType === 'txt'}
                        onChange={(e) => setExportType(e.target.value)}
                    />
                    <FileText size={16} /> TXT
                </label>
                <label className={exportType === 'embed' ? 'active' : ''}>
                    <input
                        type="radio"
                        name="exportType"
                        value="embed"
                        checked={exportType === 'embed'}
                        onChange={(e) => setExportType(e.target.value)}
                    />
                    <Code size={16} /> Embed Code
                </label>
            </div>

            <div className="export-preview">
                <pre>{getContent().substring(0, 500)}{getContent().length > 500 ? '...' : ''}</pre>
            </div>

            <div className="export-actions">
                <button onClick={handleDownload} className="download-btn">
                    <Download size={16} /> Download {getFileExtension().toUpperCase()}
                </button>
                {exportType === 'embed' && (
                    <button onClick={handleCopyEmbed} className="copy-btn">
                        {copied ? <><Check size={16} /> Copied!</> : <><Code size={16} /> Copy Code</>}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ExportData;
