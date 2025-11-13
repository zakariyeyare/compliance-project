import React from 'react';
import { useLocation } from 'react-router-dom';

function formatDate(value) {
  try {
    const d = typeof value === 'string' ? new Date(value) : value || new Date();
    return d.toLocaleDateString('da-DK');
  } catch {
    return String(value || '');
  }
}

export default function Udskriv() {
  const location = useLocation();
  const { name, standard, dato, godkendtAf } = location?.state || {};

  const resolved = {
    name: name || 'Saim',
    standard: standard || 'GDPR',
    dato: formatDate(dato),
    godkendtAf: godkendtAf || 'Abdirahim',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMail = () => {
    const subject = encodeURIComponent('Compliance Receipt');
    const body = encodeURIComponent(
      [
        'Hej,',
        '',
        'Vedhæftet finder du PDF-kvittering.',
        '',
        'Detaljer:',
        `- Navn: ${resolved.name}`,
        `- Standard: ${resolved.standard}`,
        `- Dato: ${resolved.dato}`,
        `- Godkendt af: ${resolved.godkendtAf}`,
        '',
        'Venlig hilsen',
      ].join('\n')
    );

    // Opens the default mail client. Note: Attaching a generated PDF requires a backend or user to attach manually.
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="receipt-page">
      <div className="receipt-box">
        <h1 className="title">Compliance Receipt</h1>

        <div className="details">
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value">{resolved.name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Standard:</span>
            <span className="value">{resolved.standard}</span>
          </div>
          <div className="detail-row">
            <span className="label">Dato:</span>
            <span className="value">{resolved.dato}</span>
          </div>
          <div className="detail-row">
            <span className="label">Godkendt af:</span>
            <span className="value">{resolved.godkendtAf}</span>
          </div>
        </div>

        <div className="btn-row no-print">
          <button className="print-btn" onClick={handlePrint}>Udskriv</button>
          <button className="export-btn" onClick={handleMail}>Export PDF to Mail</button>
        </div>
      </div>

      <style>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background-color: #f1f5f9;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .receipt-page {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 24px;
        }

        .receipt-box {
          background-color: white;
          width: 650px;
          max-width: 100%;
          padding: 60px 50px;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .title {
          color: #1e3a8a;
          font-size: 34px;
          font-weight: 700;
          margin-bottom: 40px;
        }

        .details {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 40px;
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          font-size: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .label {
          color: #475569;
          font-weight: 600;
        }

        .value {
          color: #111827;
          font-weight: 500;
        }

        .btn-row {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .export-btn {
          background-color: #2563EB;
          color: white;
          border: none;
          padding: 18px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .export-btn:hover {
          background-color: #1d4ed8;
        }

        .print-btn {
          background-color: white;
          color: #1e3a8a;
          border: 1px solid #cbd5e1;
          padding: 18px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .print-btn:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }

        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .receipt-page {
            padding: 0;
          }
          .receipt-box {
            box-shadow: none;
            border-radius: 0;
            width: 100%;
            padding: 0;
          }
          .title {
            margin: 0 0 16px 0;
            padding: 16px 0;
            text-align: center;
          }
          .details {
            border: none;
            background: white;
            padding: 0 0 16px 0;
          }
          .detail-row {
            border-bottom: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
}