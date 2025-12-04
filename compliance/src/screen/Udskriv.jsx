import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import gdprSupabaseService from '../components/gdbrSupabase';
import Supabase from '../SupabaseClient';

const EMAIL_API_BASE = (import.meta.env.VITE_EMAIL_API_BASE || '/api').replace(/\/$/, '');
const EMAIL_SEND_ENDPOINT = `${EMAIL_API_BASE}/send-receipt`;

function formatDate(value) {
  try {
    const d = typeof value === 'string' ? new Date(value) : value || new Date();
    return d.toLocaleDateString('da-DK');
  } catch {
    return String(value || '');
  }
}

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export default function Udskriv() {
  const location = useLocation();
  const {
    report: navigationReport,
    name: navigationName,
    standard: navigationStandard,
    dato: navigationDate,
    godkendtAf: navigationApprover,
  } = location?.state || {};

  const [reportData, setReportData] = useState(navigationReport || null);
  const [completedPolicies, setCompletedPolicies] = useState(navigationReport?.policies || []);
  const [loading, setLoading] = useState(!navigationReport);
  const [loadError, setLoadError] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(
    navigationName ||
      navigationReport?.requestedByName ||
      navigationReport?.requestedBy ||
      ''
  );
  const [approvalMeta, setApprovalMeta] = useState({
    standard: navigationStandard || navigationReport?.standard || 'GDPR',
    dato:
      navigationDate ||
      navigationReport?.publishedDate ||
      navigationReport?.approvedDate ||
      navigationReport?.createdDate,
    godkendtAf:
      navigationApprover ||
      navigationReport?.approvedByName ||
      navigationReport?.approvedBy ||
      '',
  });
  const [emailAddress, setEmailAddress] = useState(
    navigationReport?.requestedBy || ''
  );
  const [sendStatus, setSendStatus] = useState('idle');
  const [sendError, setSendError] = useState('');
  const [sendInfoMessage, setSendInfoMessage] = useState('');

  const resolved = {
    name: currentUserName || 'Ukendt bruger',
    standard: approvalMeta.standard || 'GDPR',
    dato: formatDate(approvalMeta.dato || new Date()),
    godkendtAf: approvalMeta.godkendtAf || 'Ukendt',
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const { data: { user } } = await Supabase.auth.getUser();
        if (!isMounted) return;
        const derivedName = user?.user_metadata?.full_name || user?.email || 'Ukendt bruger';
        setCurrentUserName((prev) => prev || derivedName);
        setEmailAddress((prev) => prev || user?.email || '');
      } catch (error) {
        console.error('Fejl ved hentning af bruger:', error);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [currentUserName]);

  useEffect(() => {
    if (navigationReport) {
      const derivedPayload = {
        name:
          navigationName ||
          navigationReport.requestedByName ||
          navigationReport.requestedBy ||
          'Ukendt bruger',
        standard: navigationStandard || navigationReport.standard || 'GDPR',
        dato:
          navigationDate ||
          navigationReport.publishedDate ||
          navigationReport.approvedDate ||
          navigationReport.createdDate,
        godkendtAf:
          navigationApprover ||
          navigationReport.approvedByName ||
          navigationReport.approvedBy ||
          '',
        report: navigationReport,
      };

      try {
        localStorage.setItem('gdpr_last_receipt', JSON.stringify(derivedPayload));
      } catch (error) {
        console.error('Fejl ved lagring af kvitteringsdata:', error);
      }

      setReportData(navigationReport);
      setCompletedPolicies(navigationReport.policies || []);
      setApprovalMeta({
        standard: derivedPayload.standard,
        dato: derivedPayload.dato,
        godkendtAf: derivedPayload.godkendtAf,
      });
      setCurrentUserName((prev) => prev || derivedPayload.name);
      setEmailAddress((prev) => prev || navigationReport.requestedBy || '');
      setLoading(false);
      setLoadError(null);
      return;
    }

    const receiptRaw = localStorage.getItem('gdpr_last_receipt');
    if (!receiptRaw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(receiptRaw);
      if (parsed.report) {
        setReportData(parsed.report);
        setCompletedPolicies(parsed.report.policies || []);
        if (parsed.report.requestedBy) {
          setEmailAddress((prev) => prev || parsed.report.requestedBy);
        }
      }
      setApprovalMeta((prev) => ({
        standard: parsed.standard || prev.standard,
        dato: parsed.dato || prev.dato,
        godkendtAf: parsed.godkendtAf || prev.godkendtAf,
      }));
      if (parsed.name) {
        setCurrentUserName((prev) => prev || parsed.name);
      }
    } catch (error) {
      console.error('Fejl ved indlæsning af seneste godkendelse:', error);
    } finally {
      setLoading(false);
    }
  }, [navigationReport, navigationName, navigationStandard, navigationDate, navigationApprover]);

  useEffect(() => {
    if (navigationReport || completedPolicies.length > 0) {
      return;
    }

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
  }, [navigationReport, completedPolicies]);

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

  const completionPercent = useMemo(() => {
    if (typeof reportData?.stats?.percentage === 'number') {
      return reportData.stats.percentage;
    }
    if (!completedPolicies.length) {
      return 0;
    }
    const denominator = reportData?.stats?.total || completedPolicies.length;
    if (!denominator) {
      return 0;
    }
    return Math.min(100, Math.round((completedPolicies.length / denominator) * 100));
  }, [reportData, completedPolicies.length]);

  const handlePrint = () => {
    window.print();
  };

  const createPdfFromElement = async (element) => {
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    const imgWidth = pageWidth; // full width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pageHeight;
    }

    return pdf;
  };

  const generateReceiptPdf = async () => {
    const receiptElement = document.querySelector('.receipt-box');
    if (!receiptElement) {
      throw new Error('Kunne ikke finde kvitteringen på siden.');
    }

    const pdf = await createPdfFromElement(receiptElement);
    const filename = `compliance-receipt-${Date.now()}.pdf`;
    pdf.save(filename);
  };

  const handleMail = async () => {
    try {
      await generateReceiptPdf();
    } catch (err) {
      console.error('Kunne ikke generere PDF til mail:', err);
    }

    const subject = encodeURIComponent('Compliance Receipt');
    const lines = [
      'Hej,',
      '',
      'Vedhæftet finder du PDF-kvittering.',
      '',
      'Detaljer:',
      `- Navn: ${resolved.name}`,
      `- Standard: ${resolved.standard}`,
      `- Dato: ${resolved.dato}`,
      `- Godkendt af: ${resolved.godkendtAf || 'Ikke godkendt'}`,
    ];

    if (reportData) {
      lines.push(
        `- Rapport: ${reportData.title || 'Ukendt titel'}`,
        `- Version: ${reportData.version || 'N/A'}`,
        `- Status: ${reportData.status || 'N/A'}`,
        `- Politikker: ${reportData.policies?.length ?? completedPolicies.length}`
      );
    }

    lines.push(
      '',
      'Udfyldte Politikker:',
      policiesForMail,
      '',
      'Venlig hilsen'
    );

    const body = encodeURIComponent(lines.join('\n'));

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSendPdfEmail = async () => {
    if (!emailAddress || !emailAddress.trim()) {
      setSendError('Indtast en e-mailadresse.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress.trim())) {
      setSendError('Angiv en gyldig e-mailadresse.');
      return;
    }

    try {
      setSendError('');
  setSendStatus('sending');
  setSendInfoMessage('Sender PDF ...');
      const receiptElement = document.querySelector('.receipt-box');
      if (!receiptElement) {
        setSendError('Kunne ikke finde kvitteringen på siden.');
        return;
      }

      const pdf = await createPdfFromElement(receiptElement);
      const pdfBlob = pdf.output('blob');
      const pdfDataUrl = await blobToBase64(pdfBlob);
      const base64Payload = pdfDataUrl.replace(/^data:application\/pdf;base64,/, '');
      const filename = `compliance-receipt-${Date.now()}.pdf`;

      const response = await fetch(EMAIL_SEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress.trim(),
          subject: 'Compliance rapport PDF',
          filename,
          pdfBase64: base64Payload,
          metadata: {
            reportTitle: reportData?.title || 'Compliance Report',
            userName: resolved.name,
            standard: resolved.standard,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || 'Kunne ikke sende PDF-email.');
      }

      const isMockDelivery = Boolean(payload?.mockDelivery);
      const nextStatus = isMockDelivery ? 'mock' : 'sent';
      setSendStatus(nextStatus);
      setSendInfoMessage(
        isMockDelivery
          ? 'Serveren kører i mock-mode: tjek terminalen for mailindhold.'
          : 'Look at mail inbox!'
      );
      setTimeout(() => {
        setSendStatus('idle');
        setSendInfoMessage('');
      }, 6000);
    } catch (error) {
      console.error('Fejl ved afsendelse af PDF:', error);
      setSendError(error?.message || 'Kunne ikke sende PDF. Prøv igen.');
      setSendStatus('error');
      setSendInfoMessage('');
    }
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

        {reportData && (
          <div className="summary-grid">
            <div className="summary-card accent">
              <span className="summary-label">Rapport</span>
              <span className="summary-value">{reportData.title || 'GDPR Rapport'}</span>
              <span className="summary-pill">v{reportData.version || 'N/A'}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Status</span>
              <span className="summary-value">{reportData.status || 'Draft'}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Politikker</span>
              <span className="summary-value">{reportData.policies?.length ?? completedPolicies.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Færdiggørelse</span>
              <span className="summary-value">{completionPercent}%</span>
            </div>
          </div>
        )}

        <div className="btn-row no-print">
          <button className="print-btn" onClick={handlePrint}>Udskriv</button>
          <button className="export-btn" onClick={handleMail}>Download pdf</button>
        </div>

        <div className="email-send no-print">
          <p className="email-send-label">Input E-mail to receive PDF of report via mail</p>
          <div className="email-send-row">
            <input
              type="email"
              className="email-input"
              value={emailAddress}
              onChange={(event) => {
                setEmailAddress(event.target.value);
                if (sendStatus !== 'idle') {
                  setSendStatus('idle');
                }
                if (sendError) {
                  setSendError('');
                }
                if (sendInfoMessage) {
                  setSendInfoMessage('');
                }
              }}
              placeholder="email@example.com"
            />
            <button
              className={`send-btn ${sendStatus === 'sent' ? 'success' : ''}`}
              onClick={handleSendPdfEmail}
              disabled={sendStatus === 'sending'}
            >
              {sendStatus === 'sending' ? 'Sending…' : 'Send'}
            </button>
            {sendInfoMessage && (
              <span
                className={`inbox-message ${
                  sendStatus === 'mock' ? 'mock' : sendStatus === 'sending' ? 'sending' : ''
                }`}
              >
                {sendInfoMessage}
              </span>
            )}
          </div>
          {sendError && <p className="email-error">{sendError}</p>}
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

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .summary-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          text-align: left;
          color: #0f172a;
        }

        .summary-card.accent {
          background: linear-gradient(135deg, #2563EB, #7c3aed);
          color: white;
          border: none;
        }

        .summary-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.8;
          display: block;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 700;
          margin-top: 6px;
          display: block;
        }

        .summary-pill {
          margin-top: 10px;
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.2);
          color: inherit;
          font-weight: 600;
          font-size: 14px;
        }

        .btn-row {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .email-send {
          margin-top: 24px;
          padding: 20px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-align: left;
        }

        .email-send-label {
          margin-bottom: 12px;
          font-weight: 600;
          color: #0f172a;
        }

        .email-send-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .email-input {
          flex: 1;
          min-width: 220px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 16px;
        }

        .email-input:focus {
          outline: none;
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .send-btn {
          background-color: #2563EB;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .send-btn:hover:not(:disabled) {
          background-color: #1d4ed8;
        }

        .send-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .send-btn.success {
          background-color: #16a34a;
        }

        .inbox-message {
          font-size: 14px;
          font-weight: 600;
          color: #15803d;
        }

        .inbox-message.sending {
          color: #0f172a;
        }

        .inbox-message.mock {
          color: #b45309;
        }

        .email-error {
          margin-top: 8px;
          color: #b91c1c;
          font-size: 14px;
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