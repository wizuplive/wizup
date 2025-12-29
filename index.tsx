import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initDevTools } from './dev/seasonInspector';
import { initSeasonDevBridge } from './services/seasonalSimulation/devBridge';
import { DEV_SEASON_CLOSE_PREVIEW } from './config/devFlags';
import { installZapsRecognitionDevTools } from './services/zapsRecognition/devTools';
import { installSeason1VerifierDevBridge } from './services/season1Verification/devBridge/installSeason1VerifierDevBridge';
import { installSeason1AuditDevBridge } from './services/season1Verification/audit/devBridge';
import { installSeason1ReadinessDevBridge } from './services/season1Readiness/devBridge';
import { installSeason1ActivationDevBridge } from './services/season1Activation/devBridge';
import { installSeason1CanonBundleDevBridge } from './services/season1Verification/dev/canonBundleDevBridge';
import { installActivationDevBridge } from './services/season1Activation/devBridge';
import { installSeasonEndDevBridge } from './services/seasonEnd/devBridge';
import { installSeason2DevBridge } from './services/season2Readiness/devBridge';
import { installSeason2SeedDevBridge } from './services/season2ReadinessSeed/devBridge';
import { installSeason2ContractDevBridge } from './services/season2Contract/dev/devBridge';
import { installSeason2ActivationDevBridge } from './services/season2Activation/dev/devBridge';
import { installSeason2FreezeDevBridge } from './services/season2FreezeProof/devBridge';
import { installSeason2IntegrityDevBridge } from './services/season2Integrity/devBridge';
import { installSeasonObservabilityDevBridge } from './services/seasonObservability/devBridge';
import { installSeasonAuditExportDevBridge } from './services/seasonAuditExport/devBridge';
import { installProtocolBoundaryDevBridge } from './services/protocolBoundary/devBridge';
import { installAuthIdentityDevTools } from './services/authIdentity/devBridge';
import { installShadowReadDevBridge } from './services/firestoreShadowRead/devBridge';
import { installParityCheckDevBridge } from './services/parityCheck/devBridge';
import { installProtocolReadRouterDevBridge } from './services/protocolReadRouter/devBridge';
import { installShadowWriteParityDevBridge } from './services/protocolWriteRouter/monitor/devBridge';
import { installProtocolWriteRouterCoverageDevBridge } from './services/protocolWriteRouter/tests/devBridge';
import { installProtocolCutoverDevBridge } from './services/protocolCutover/devBridge';
import { runProductionBootIntegrityCheck } from './services/protocolCutoverGuardrails/bootIntegrity/bootIntegrityCheck';
import { firestoreProbe } from './services/protocolCutoverGuardrails/bootIntegrity/firestoreProbe';

// Initialize hidden architect tools
initDevTools();

// Initialize Season Dev Bridge if in development
if (DEV_SEASON_CLOSE_PREVIEW) {
  initSeasonDevBridge();
}

// Initialize Zaps Recognition Tools
installZapsRecognitionDevTools();

// Initialize Season 1 Verifier
installSeason1VerifierDevBridge();

// Initialize Season 1 Batch Audit
installSeason1AuditDevBridge({
  enabled: true, // Dev-only master toggle
  flags: () => ({
    WRITE_S1_AUDIT_LOCAL: true,
    WRITE_S1_AUDIT_FIRESTORE: false,
  }),
});

// Initialize Season 1 Readiness Gate
installSeason1ReadinessDevBridge({
  enabled: true,
  flags: () => ({
    WRITE_S1_READINESS_LOCAL: true,
    WRITE_S1_READINESS_FIRESTORE: false,
  }),
});

// Initialize Season 1 Activation Orchestrator
installSeason1ActivationDevBridge({
  enabled: true,
  enableFirestoreShadow: false,
});

// Initialize Season 1 Canon Indexer
installSeason1CanonBundleDevBridge({
  enabled: true
});

// Initialize Orchestrator Dev Bridge
installActivationDevBridge();

// Initialize Season End Finalizer Bridge
installSeasonEndDevBridge();

// Initialize Season 2 Readiness Pipeline
installSeason2DevBridge();

// Initialize Season 2 Seed Protocol
installSeason2SeedDevBridge();

// Initialize Season 2 Candidate Contract Builder
installSeason2ContractDevBridge();

// Initialize Season 2 Activation Orchestrator
installSeason2ActivationDevBridge();

// Initialize Season 2 Freeze Verification
installSeason2FreezeDevBridge();

// Initialize Season 2 Runtime Integrity Verifier
installSeason2IntegrityDevBridge();

// Initialize Season Health Observability
installSeasonObservabilityDevBridge();

// Initialize Season Audit Export Pipeline
installSeasonAuditExportDevBridge();

// Initialize Protocol Boundary Contract
installProtocolBoundaryDevBridge();

// Initialize Auth Identity Adapter
installAuthIdentityDevTools();

// Initialize Firestore Shadow Read Tools
installShadowReadDevBridge();

// Initialize Parity Checker
installParityCheckDevBridge();

// Initialize Protocol Read Router
installProtocolReadRouterDevBridge();

// Initialize Shadow Write Parity Monitor
installShadowWriteParityDevBridge();

// Initialize Write Router Coverage Harness
installProtocolWriteRouterCoverageDevBridge();

// Initialize Protocol Cutover Ceremony
installProtocolCutoverDevBridge();

// 🩺 BOOT INTEGRITY CHECK
runProductionBootIntegrityCheck({
  firestoreProbe,
  persistLatch: true
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
