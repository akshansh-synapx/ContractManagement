// ============================================================================
// TypeScript types for Synapx Contract Management
// These mirror the Dataverse table schemas. When you run:
//   pac code add-data-source -a dataverse -t syn_docrequest
//   pac code add-data-source -a dataverse -t syn_discussion
//   pac code add-data-source -a dataverse -t syn_docversion
// The generated models will replace these for production use.
// ============================================================================

// ── Choice Enums ─────────────────────────────────────────────────────────────

export type RequestType = 'legal' | 'contract';
export type RequestStatus = 'open' | 'in-discussion' | 'in-review' | 'closed';
export type Priority = 'low' | 'medium' | 'high';

// ── Document Request ─────────────────────────────────────────────────────────
// Dataverse table: syn_docrequest

export interface DocRequest {
  syn_docrequestid: string;
  syn_title: string;
  syn_description: string;
  syn_requesttype: RequestType;
  syn_requeststatus: RequestStatus;
  syn_priority: Priority;
  syn_requestedby: string;
  syn_assignedto?: string;
  syn_closedat?: string;
  syn_finalversionid?: string;
  createdon: string;
  modifiedon: string;
}

// ── Discussion ───────────────────────────────────────────────────────────────
// Dataverse table: syn_discussion

export interface Discussion {
  syn_discussionid: string;
  syn_name?: string;
  syn_docrequestid: string;
  syn_docversionid?: string;
  syn_userid: string;
  syn_username: string;
  syn_message: string;
  syn_timestamp: string;
  createdon?: string;
  modifiedon?: string;
}

// ── Document Version ─────────────────────────────────────────────────────────
// Dataverse table: syn_docversion

export interface DocVersion {
  syn_docversionid: string;
  syn_docrequestid: string;
  syn_title: string;
  syn_versionnumber: number;
  syn_documenturl: string;
  syn_description?: string;
  syn_uploadedby: string;
  syn_uploadedat: string;
  syn_signedoff: boolean;
  syn_signedoffby?: string;
  syn_signedoffat?: string;
  createdon?: string;
  modifiedon?: string;
}

// ── User (runtime only — not a Dataverse table) ─────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

// ── App State (used by context) ──────────────────────────────────────────────

export interface AppState {
  requests: DocRequest[];
  discussions: Discussion[];
  versions: DocVersion[];
  currentUser: User;
  loading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_REQUESTS'; payload: DocRequest[] }
  | { type: 'LOAD_DISCUSSIONS'; payload: Discussion[] }
  | { type: 'LOAD_VERSIONS'; payload: DocVersion[] }
  | { type: 'ADD_REQUEST'; payload: DocRequest }
  | { type: 'UPDATE_REQUEST'; payload: Partial<DocRequest> & { syn_docrequestid: string } }
  | { type: 'CLOSE_REQUEST'; payload: { id: string; finalVersionId: string } }
  | { type: 'ADD_DISCUSSION'; payload: Discussion }
  | { type: 'ADD_VERSION'; payload: DocVersion }
  | { type: 'SIGN_OFF_VERSION'; payload: { id: string; signedOffBy: string } };
