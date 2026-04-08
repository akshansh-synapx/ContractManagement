// ============================================================================
// Constants & Seed Data for Synapx Contract Management
// ============================================================================

import type { DocRequest, Discussion, DocVersion } from '../types';

// ── Synapx Brand ─────────────────────────────────────────────────────────────

export const BRAND = {
  colors: {
    darkAzure: "#01263D",
    turquoise: "#00E6C3",
    greyAzure: "#5A6B7A",
    lightCyan: "#9FF7F5",
    lightAzure: "#B1E5FC",
  },
  fontFamily: "'Proxima Nova', 'Inter', 'Segoe UI', system-ui, sans-serif",
} as const;

// ── Choice maps (Dataverse integer ↔ label) ──────────────────────────────────

export const REQUEST_TYPE_TO_INT: Record<string, number> = {
  "legal": 0,
  "contract": 1,
};
export const INT_TO_REQUEST_TYPE: Record<number, string> = {
  0: "legal",
  1: "contract",
};

export const REQUEST_STATUS_TO_INT: Record<string, number> = {
  "open": 0,
  "in-discussion": 1,
  "in-review": 2,
  "closed": 3,
};
export const INT_TO_REQUEST_STATUS: Record<number, string> = {
  0: "open",
  1: "in-discussion",
  2: "in-review",
  3: "closed",
};

export const PRIORITY_TO_INT: Record<string, number> = {
  "low": 0,
  "medium": 1,
  "high": 2,
};
export const INT_TO_PRIORITY: Record<number, string> = {
  0: "low",
  1: "medium",
  2: "high",
};

export const SIGNEDOFF_TO_INT: Record<string, number> = {
  "false": 0,
  "true": 1,
};
export const INT_TO_SIGNEDOFF: Record<number, boolean> = {
  0: false,
  1: true,
};

// ── Default Seed Data (local dev / initial Dataverse import) ─────────────────

const now = new Date();
const yesterday = new Date(now.getTime() - 86400000);
const twoDaysAgo = new Date(now.getTime() - 172800000);
const threeDaysAgo = new Date(now.getTime() - 259200000);
const oneWeekAgo = new Date(now.getTime() - 604800000);

export const SEED_REQUESTS: DocRequest[] = [
  {
    syn_docrequestid: "00000000-0001-0000-0000-000000000001",
    syn_title: "Vendor Supply Agreement - TechCorp",
    syn_description: "Standard vendor supply agreement for hardware procurement with TechCorp Ltd. Requires legal review for compliance with new procurement policies.",
    syn_requesttype: "contract",
    syn_requeststatus: "in-discussion",
    syn_priority: "high",
    syn_requestedby: "Akshansh Sharma",
    syn_assignedto: "Legal Team",
    createdon: threeDaysAgo.toISOString(),
    modifiedon: yesterday.toISOString(),
  },
  {
    syn_docrequestid: "00000000-0001-0000-0000-000000000002",
    syn_title: "NDA - CloudSync Partnership",
    syn_description: "Non-disclosure agreement for the upcoming partnership with CloudSync for joint cloud infrastructure project.",
    syn_requesttype: "legal",
    syn_requeststatus: "in-review",
    syn_priority: "medium",
    syn_requestedby: "Priya Mehta",
    syn_assignedto: "Akshansh Sharma",
    createdon: twoDaysAgo.toISOString(),
    modifiedon: now.toISOString(),
  },
  {
    syn_docrequestid: "00000000-0001-0000-0000-000000000003",
    syn_title: "Employee Contract Template Update",
    syn_description: "Update the standard employment contract template to include new remote work policies and updated benefit structures.",
    syn_requesttype: "contract",
    syn_requeststatus: "open",
    syn_priority: "low",
    syn_requestedby: "Rahul Verma",
    createdon: yesterday.toISOString(),
    modifiedon: yesterday.toISOString(),
  },
  {
    syn_docrequestid: "00000000-0001-0000-0000-000000000004",
    syn_title: "Data Processing Agreement - GDPR",
    syn_description: "Data processing agreement required for EU client data handling in compliance with GDPR regulations.",
    syn_requesttype: "legal",
    syn_requeststatus: "closed",
    syn_priority: "high",
    syn_requestedby: "Akshansh Sharma",
    syn_assignedto: "Legal Team",
    syn_closedat: threeDaysAgo.toISOString(),
    syn_finalversionid: "00000000-0003-0000-0000-000000000004",
    createdon: oneWeekAgo.toISOString(),
    modifiedon: threeDaysAgo.toISOString(),
  },
];

export const SEED_DISCUSSIONS: Discussion[] = [
  {
    syn_discussionid: "00000000-0002-0000-0000-000000000001",
    syn_docrequestid: "00000000-0001-0000-0000-000000000001",
    syn_userid: "user-1",
    syn_username: "Akshansh Sharma",
    syn_message: "I've created this request for the TechCorp supply agreement. We need to ensure the payment terms align with our Q2 budget.",
    syn_timestamp: threeDaysAgo.toISOString(),
  },
  {
    syn_discussionid: "00000000-0002-0000-0000-000000000002",
    syn_docrequestid: "00000000-0001-0000-0000-000000000001",
    syn_userid: "user-2",
    syn_username: "Priya Mehta",
    syn_message: "Thanks Akshansh. I'll review the standard template and flag any clauses that need modification for this deal. The liability section might need updating.",
    syn_timestamp: new Date(threeDaysAgo.getTime() + 3600000).toISOString(),
  },
  {
    syn_discussionid: "00000000-0002-0000-0000-000000000003",
    syn_docrequestid: "00000000-0001-0000-0000-000000000001",
    syn_userid: "user-1",
    syn_username: "Akshansh Sharma",
    syn_message: "Good point about the liability clause. Also, please check the warranty terms - TechCorp wants a 3-year warranty on all hardware.",
    syn_timestamp: new Date(twoDaysAgo.getTime() + 1800000).toISOString(),
  },
  {
    syn_discussionid: "00000000-0002-0000-0000-000000000004",
    syn_docrequestid: "00000000-0001-0000-0000-000000000002",
    syn_userid: "user-2",
    syn_username: "Priya Mehta",
    syn_message: "The NDA draft is ready for review. I've uploaded version 1 with standard confidentiality terms. Please check the scope section.",
    syn_timestamp: twoDaysAgo.toISOString(),
  },
  {
    syn_discussionid: "00000000-0002-0000-0000-000000000005",
    syn_docrequestid: "00000000-0001-0000-0000-000000000002",
    syn_userid: "user-1",
    syn_username: "Akshansh Sharma",
    syn_message: "Reviewing now. The non-compete clause duration seems too long at 5 years. Can we reduce to 2 years?",
    syn_timestamp: yesterday.toISOString(),
  },
];

export const SEED_VERSIONS: DocVersion[] = [
  {
    syn_docversionid: "00000000-0003-0000-0000-000000000001",
    syn_docrequestid: "00000000-0001-0000-0000-000000000001",
    syn_versionnumber: 1,
    syn_documenturl: "https://docs.google.com/document/d/example-techcorp-v1",
    syn_title: "Initial Draft - TechCorp Supply Agreement",
    syn_description: "First draft based on standard template",
    syn_uploadedby: "Priya Mehta",
    syn_uploadedat: twoDaysAgo.toISOString(),
    syn_signedoff: false,
  },
  {
    syn_docversionid: "00000000-0003-0000-0000-000000000002",
    syn_docrequestid: "00000000-0001-0000-0000-000000000002",
    syn_versionnumber: 1,
    syn_documenturl: "https://docs.google.com/document/d/example-cloudsync-nda-v1",
    syn_title: "NDA Draft v1 - CloudSync",
    syn_description: "Standard NDA with confidentiality terms",
    syn_uploadedby: "Priya Mehta",
    syn_uploadedat: twoDaysAgo.toISOString(),
    syn_signedoff: false,
  },
  {
    syn_docversionid: "00000000-0003-0000-0000-000000000003",
    syn_docrequestid: "00000000-0001-0000-0000-000000000002",
    syn_versionnumber: 2,
    syn_documenturl: "https://docs.google.com/document/d/example-cloudsync-nda-v2",
    syn_title: "NDA Revised v2 - CloudSync",
    syn_description: "Updated non-compete clause to 2 years per feedback",
    syn_uploadedby: "Priya Mehta",
    syn_uploadedat: yesterday.toISOString(),
    syn_signedoff: true,
    syn_signedoffby: "Akshansh Sharma",
    syn_signedoffat: now.toISOString(),
  },
  {
    syn_docversionid: "00000000-0003-0000-0000-000000000004",
    syn_docrequestid: "00000000-0001-0000-0000-000000000004",
    syn_versionnumber: 1,
    syn_documenturl: "https://docs.google.com/document/d/example-gdpr-dpa-final",
    syn_title: "GDPR DPA - Final Version",
    syn_description: "Finalized data processing agreement for EU compliance",
    syn_uploadedby: "Legal Team",
    syn_uploadedat: new Date(now.getTime() - 432000000).toISOString(),
    syn_signedoff: true,
    syn_signedoffby: "Akshansh Sharma",
    syn_signedoffat: threeDaysAgo.toISOString(),
  },
];
