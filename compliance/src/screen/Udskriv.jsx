import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gdprSupabaseService from '../components/gdbrSupabase';
import Supabase from '../SupabaseClient';

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
  const [completedPolicies, setCompletedPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(name || '');
  const [approvalMeta, setApprovalMeta] = useState({
    standard: standard || 'GDPR',
    dato,
    godkendtAf,
  });

  const resolved = {
    name: currentUserName || name || 'Saim',
    standard: approvalMeta.standard || 'GDPR',
    dato: formatDate(approvalMeta.dato || approvalMeta.approvedDate || dato),
    godkendtAf: approvalMeta.godkendtAf || 'Abdirahim',
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await Supabase.auth.getUser();
        setCurrentUserName(user?.user_metadata?.full_name || user?.email || 'Ukendt bruger');
      } catch (error) {
        console.error('Fejl ved hentning af bruger:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const receiptRaw = localStorage.getItem('gdpr_last_receipt');
    if (receiptRaw) {
      try {
        const parsed = JSON.parse(receiptRaw);
        setApprovalMeta((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Fejl ved indlæsning af seneste godkendelse:', error);
      }
    }
  }, []);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const structure = await gdprSupabaseService.getGDPRFullStructure();
        const savedPoliciesRaw = localStorage.getItem('gdpr_saved_policies');

        if (!savedPoliciesRaw || !structure?.controls) {
          setCompletedPolicies([]);
          return;
        }

        let savedPolicies = {};
        try {
          savedPolicies = JSON.parse(savedPoliciesRaw) || {};
        } catch (err) {
          console.error('Kunne ikke parse gemte politikker', err);
        }

        const compiled = [];
        structure.controls.forEach((control) => {
          control.subcontrols?.forEach((subcontrol) => {
            const policyText = savedPolicies[subcontrol.id];
            if (typeof policyText === 'string' && policyText.trim()) {
              compiled.push({
                controlCode: control.code,
                controlDefinition: control.definition,
                subcontrolCode: subcontrol.code,
                subcontrolTitle: subcontrol.title || subcontrol.definition || '',
                policy: policyText.trim(),
                activities: subcontrol.activities || [],
              });
            }
          });
        });

        setCompletedPolicies(compiled);
      } catch (error) {
        console.error('Fejl ved indlæsning af politikker til Udskriv', error);
        setLoadError('Kunne ikke indlæse udfyldte politikker. Prøv igen senere.');
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  const policiesForMail = useMemo(() => {
    if (!completedPolicies.length) return '- Ingen politikker udfyldt';
    return completedPolicies
      .map((policy, index) => {
        const baseLines = [
          `${index + 1}. [${policy.subcontrolCode}] ${policy.policy}`,
        ];

        if (policy.activities?.length) {
          baseLines.push('   Aktiviteter:');
          policy.activities.forEach((activity, activityIndex) => {
            baseLines.push(`   ${activityIndex + 1}) ${activity.description}`);
          });
        }

        return baseLines.join('\n');
      })
      .join('\n');
  }, [completedPolicies]);

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
        'Udfyldte Politikker:',
        policiesForMail,
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

        <div className="policies-section">
          <h2>Udfyldte Politikker</h2>
          {loading ? (
            <p className="policies-status">Indlæser politikker...</p>
          ) : loadError ? (
            <p className="policies-status error">{loadError}</p>
          ) : completedPolicies.length === 0 ? (
            <p className="policies-status">Ingen politikker er udfyldt endnu.</p>
          ) : (
            <div className="policies-list">
              {completedPolicies.map((policy, index) => (
                <div className="policy-card" key={`${policy.subcontrolCode}-${index}`}>
                  <div className="policy-header">
                    <div className="policy-code">
                      <span className="badge primary">{policy.controlCode}</span>
                      <span className="badge secondary">{policy.subcontrolCode}</span>
                    </div>
                    {policy.subcontrolTitle && (
                      <p className="policy-title">{policy.subcontrolTitle}</p>
                    )}
                  </div>
                  <div className="policy-body">
                    <p>{policy.policy}</p>
                  </div>
                  {policy.activities?.length > 0 && (
                    <div className="policy-activities">
                      <p className="activities-label">Aktiviteter:</p>
                      <ul>
                        {policy.activities.map((activity) => (
                          <li key={activity.id}>{activity.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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

        .policies-section {
          margin-top: 40px;
          text-align: left;
        }

        .policies-section h2 {
          font-size: 24px;
          color: #1e3a8a;
          margin-bottom: 20px;
        }

        .policies-status {
          color: #475569;
          font-size: 16px;
        }

        .policies-status.error {
          color: #b91c1c;
        }

        .policies-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .policy-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          background: #f8fafc;
        }

        .policy-header {
          margin-bottom: 12px;
        }

        .policy-code {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .badge {
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge.primary {
          background: #e0e7ff;
          color: #3730a3;
        }

        .badge.secondary {
          background: #fef3c7;
          color: #92400e;
        }

        .policy-title {
          margin: 0;
          font-weight: 600;
          color: #0f172a;
        }

        .policy-body {
          background: white;
          border-radius: 10px;
          padding: 16px;
          font-size: 16px;
          color: #111827;
          line-height: 1.6;
        }

        .policy-activities {
          margin-top: 12px;
          font-size: 14px;
          color: #475569;
        }

        .activities-label {
          font-weight: 600;
          margin-bottom: 6px;
        }

        .policy-activities ul {
          margin: 0;
          padding-left: 20px;
        }

        .policy-activities li {
          margin-bottom: 4px;
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

          .policies-section {
            margin-top: 20px;
          }

          .policies-list {
            gap: 12px;
          }

          .policy-card {
            background: transparent;
            border-color: #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
}