import React from 'react';
import { AdminSetupPanel, UstadzAttendancePanel, AgentRuntimePanel, NotificationSettingsPanel } from './CompletionPanels';
import AdminPortfolioPanel from './AdminPortfolioPanel';
import AdminEnrollmentPanel from './AdminEnrollmentPanel';

// Permukaan kompatibilitas (contract validate:ui): AppV14 adalah shell utama;
// panel-panel completion dipertahankan di sini dan di CompletionPanels.
export { AdminSetupPanel, UstadzAttendancePanel, AgentRuntimePanel, NotificationSettingsPanel, AdminPortfolioPanel, AdminEnrollmentPanel };

export default function AppV2() {
  return (
    <div className="stack">
      <h2>PMMI Digital Campus</h2>
      <p className="muted">Aplikasi utama adalah shell AppV14. Halaman ini hanya permukaan kompatibilitas untuk panel completion yang telah dimigrasi (AdminSetup, UstadzAttendance, AgentRuntime, NotificationSettings, AdminPortfolio, Enrollment).</p>
    </div>
  );
}
