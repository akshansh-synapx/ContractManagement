// ============================================================================
// Data Service — Dataverse-first with localStorage fallback
// ============================================================================
// When running inside Power Apps the dataverseClient is used for all CRUD
// operations. During local dev (npm run dev) Dataverse is unreachable so
// we fall back transparently to localStorage.
// ============================================================================

import type { DocRequest, Discussion, DocVersion } from '../types';
import {
  SEED_REQUESTS,
  SEED_DISCUSSIONS,
  SEED_VERSIONS,
  REQUEST_TYPE_TO_INT,
  INT_TO_REQUEST_TYPE,
  REQUEST_STATUS_TO_INT,
  INT_TO_REQUEST_STATUS,
  PRIORITY_TO_INT,
  INT_TO_PRIORITY,
  INT_TO_SIGNEDOFF,
} from '../lib/constants';

// Lazy-import the Dataverse client so local-dev never triggers
// the missing @microsoft/power-apps/data imports at module load.
type DvModule = typeof import('./dataverseClient');
let _dvModule: DvModule | null = null;
async function getDv(): Promise<DvModule> {
  if (!_dvModule) {
    _dvModule = await import('./dataverseClient');
  }
  return _dvModule;
}

// -- Constants ---------------------------------------------------------------
const PREFER = "return=representation";
const ACCEPT = "application/json";

/** Dataverse entity-set names (plural logical names used by OData) */
const TABLE = {
  docRequest: "syn_docrequests",
  discussion: "syn_discussions",
  docVersion: "syn_docversions",
} as const;

// -- Helpers -----------------------------------------------------------------
/** System fields Dataverse doesn't accept on write */
const SYSTEM_FIELDS = new Set([
  "createdon", "modifiedon", "createdby", "modifiedby",
  "ownerid", "owningbusinessunit", "owningteam", "owninguser",
  "versionnumber", "statecode", "statuscode",
  "@odata.context", "@odata.etag",
  "syn_docrequestid", "syn_discussionid", "syn_docversionid",
]);

/** Fields stored as Whole Number in Dataverse */
const INT_FIELDS = new Set([
  "syn_versionnumber",
]);

/** Choice column mappings: field name -> label-to-int map */
const CHOICE_FIELDS: Record<string, Record<string, number>> = {
  syn_requesttype: REQUEST_TYPE_TO_INT,
  syn_requeststatus: REQUEST_STATUS_TO_INT,
  syn_priority: PRIORITY_TO_INT,
};

/** Boolean columns stored as Two-Option (0/1) in Dataverse */
const BOOL_FIELDS = new Set(["syn_signedoff"]);

function cleanPayload(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (SYSTEM_FIELDS.has(k)) continue;
    if (k.startsWith("_") && k.endsWith("_value")) continue;
    // Convert Choice labels to integer keys
    if (CHOICE_FIELDS[k] && typeof v === "string") {
      const intVal = CHOICE_FIELDS[k][v];
      clean[k] = intVal !== undefined ? intVal : v;
    // Convert boolean to Two-Option integer
    } else if (BOOL_FIELDS.has(k) && typeof v === "boolean") {
      clean[k] = v ? 1 : 0;
    // Coerce known integer fields
    } else if (INT_FIELDS.has(k) && typeof v === "number") {
      clean[k] = Math.round(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

interface EntityItem {
  dynamicProperties?: Record<string, unknown>;
}

/** Cast rows from connector response and convert Dataverse integers back to labels. */
function toTyped<T>(items: EntityItem[] | undefined): T[] {
  return (items ?? []).map((i) => {
    const data = i.dynamicProperties ?? (i as unknown as Record<string, unknown>);
    const row = { ...(data as Record<string, unknown>) };
    // Convert Choice integers -> labels
    if (typeof row.syn_requesttype === "number") {
      row.syn_requesttype = INT_TO_REQUEST_TYPE[row.syn_requesttype] ?? row.syn_requesttype;
    }
    if (typeof row.syn_requeststatus === "number") {
      row.syn_requeststatus = INT_TO_REQUEST_STATUS[row.syn_requeststatus] ?? row.syn_requeststatus;
    }
    if (typeof row.syn_priority === "number") {
      row.syn_priority = INT_TO_PRIORITY[row.syn_priority] ?? row.syn_priority;
    }
    // Convert Two-Option integer -> boolean
    if (typeof row.syn_signedoff === "number") {
      row.syn_signedoff = INT_TO_SIGNEDOFF[row.syn_signedoff] ?? false;
    }
    return row as unknown as T;
  });
}

// -- localStorage fallback (local dev) ---------------------------------------
const STORAGE_KEYS = {
  requests: "syn_docrequests",
  discussions: "syn_discussions",
  versions: "syn_docversions",
} as const;

function loadFromStorage<T>(key: string, defaults: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T[];
  } catch { /* fall through */ }
  return [...defaults];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return crypto.randomUUID();
}

// -- Runtime mode detection --------------------------------------------------
function isDv(): boolean {
  try {
    const host = window.location.hostname.toLowerCase();
    return (
      host.includes("powerapps.com") ||
      host.includes("powerplatform") ||
      host.includes("dynamics.com") ||
      host.includes("msappproxy.net") ||
      host.includes("crm")
    );
  } catch {
    return false;
  }
}

// ============================================================================
// Document Request Service
// ============================================================================

export const DocRequestService = {
  async getAll(): Promise<DocRequest[]> {
    if (isDv()) {
      const Dv = await getDv();
      const res = await Dv.ListRecords(
        TABLE.docRequest,
        undefined,
        ACCEPT,
        undefined,
        undefined,
        undefined,
        "createdon desc",
      );
      return toTyped<DocRequest>(res.data?.value);
    }
    return loadFromStorage<DocRequest>(STORAGE_KEYS.requests, SEED_REQUESTS);
  },

  async get(id: string): Promise<DocRequest | undefined> {
    if (isDv()) {
      const Dv = await getDv();
      const res = await Dv.GetItem(PREFER, ACCEPT, TABLE.docRequest, id);
      if (!res.data) return undefined;
      const items = toTyped<DocRequest>([res.data as unknown as EntityItem]);
      return items[0];
    }
    const all = loadFromStorage<DocRequest>(STORAGE_KEYS.requests, SEED_REQUESTS);
    return all.find((r) => r.syn_docrequestid === id);
  },

  async create(request: Omit<DocRequest, 'syn_docrequestid' | 'createdon' | 'modifiedon'>): Promise<DocRequest> {
    if (isDv()) {
      const Dv = await getDv();
      const payload = cleanPayload(request as unknown as Record<string, unknown>);
      const res = await Dv.CreateRecord(PREFER, ACCEPT, TABLE.docRequest, payload);
      const created = res.data as unknown as Record<string, unknown> | undefined;
      const id = (created?.syn_docrequestid as string) ?? generateId();
      return {
        ...request,
        syn_docrequestid: id,
        createdon: new Date().toISOString(),
        modifiedon: new Date().toISOString(),
      } as DocRequest;
    }
    const all = loadFromStorage<DocRequest>(STORAGE_KEYS.requests, SEED_REQUESTS);
    const newRequest: DocRequest = {
      ...request,
      syn_docrequestid: generateId(),
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    };
    all.unshift(newRequest);
    saveToStorage(STORAGE_KEYS.requests, all);
    return newRequest;
  },

  async update(id: string, changes: Partial<DocRequest>): Promise<DocRequest> {
    if (isDv()) {
      const Dv = await getDv();
      const payload = cleanPayload(changes as Record<string, unknown>);
      const res = await Dv.UpdateRecord(PREFER, ACCEPT, TABLE.docRequest, id, payload);
      return (res.data ?? { ...changes, syn_docrequestid: id }) as unknown as DocRequest;
    }
    const all = loadFromStorage<DocRequest>(STORAGE_KEYS.requests, SEED_REQUESTS);
    const idx = all.findIndex((r) => r.syn_docrequestid === id);
    if (idx === -1) throw new Error("Request not found");
    all[idx] = { ...all[idx], ...changes, modifiedon: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.requests, all);
    return all[idx];
  },

  async delete(id: string): Promise<void> {
    if (isDv()) {
      const Dv = await getDv();
      await Dv.DeleteRecord(TABLE.docRequest, id);
      return;
    }
    const all = loadFromStorage<DocRequest>(STORAGE_KEYS.requests, SEED_REQUESTS);
    saveToStorage(STORAGE_KEYS.requests, all.filter((r) => r.syn_docrequestid !== id));
  },
};

// ============================================================================
// Discussion Service
// ============================================================================

export const DiscussionService = {
  async getAll(requestId?: string): Promise<Discussion[]> {
    if (isDv()) {
      const Dv = await getDv();
      const $filter = requestId ? `syn_docrequestid eq '${requestId}'` : undefined;
      const res = await Dv.ListRecords(
        TABLE.discussion,
        undefined,
        ACCEPT,
        undefined,
        undefined,
        $filter,
        "syn_timestamp asc",
      );
      return toTyped<Discussion>(res.data?.value);
    }
    const all = loadFromStorage<Discussion>(STORAGE_KEYS.discussions, SEED_DISCUSSIONS);
    if (requestId) return all.filter((d) => d.syn_docrequestid === requestId);
    return all;
  },

  async create(discussion: Omit<Discussion, 'syn_discussionid' | 'createdon' | 'modifiedon'>): Promise<Discussion> {
    if (isDv()) {
      const Dv = await getDv();
      const payload = cleanPayload(discussion as unknown as Record<string, unknown>);
      const res = await Dv.CreateRecord(PREFER, ACCEPT, TABLE.discussion, payload);
      const created = res.data as unknown as Record<string, unknown> | undefined;
      const id = (created?.syn_discussionid as string) ?? generateId();
      return {
        ...discussion,
        syn_discussionid: id,
        createdon: new Date().toISOString(),
        modifiedon: new Date().toISOString(),
      } as Discussion;
    }
    const all = loadFromStorage<Discussion>(STORAGE_KEYS.discussions, SEED_DISCUSSIONS);
    const newDisc: Discussion = {
      ...discussion,
      syn_discussionid: generateId(),
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    };
    all.push(newDisc);
    saveToStorage(STORAGE_KEYS.discussions, all);
    return newDisc;
  },
};

// ============================================================================
// Document Version Service
// ============================================================================

export const DocVersionService = {
  async getAll(requestId?: string): Promise<DocVersion[]> {
    if (isDv()) {
      const Dv = await getDv();
      const $filter = requestId ? `syn_docrequestid eq '${requestId}'` : undefined;
      const res = await Dv.ListRecords(
        TABLE.docVersion,
        undefined,
        ACCEPT,
        undefined,
        undefined,
        $filter,
        "syn_versionnumber desc",
      );
      return toTyped<DocVersion>(res.data?.value);
    }
    const all = loadFromStorage<DocVersion>(STORAGE_KEYS.versions, SEED_VERSIONS);
    if (requestId) return all.filter((v) => v.syn_docrequestid === requestId);
    return all;
  },

  async create(version: Omit<DocVersion, 'syn_docversionid' | 'createdon' | 'modifiedon'>): Promise<DocVersion> {
    if (isDv()) {
      const Dv = await getDv();
      const payload = cleanPayload(version as unknown as Record<string, unknown>);
      const res = await Dv.CreateRecord(PREFER, ACCEPT, TABLE.docVersion, payload);
      const created = res.data as unknown as Record<string, unknown> | undefined;
      const id = (created?.syn_docversionid as string) ?? generateId();
      return {
        ...version,
        syn_docversionid: id,
        createdon: new Date().toISOString(),
        modifiedon: new Date().toISOString(),
      } as DocVersion;
    }
    const all = loadFromStorage<DocVersion>(STORAGE_KEYS.versions, SEED_VERSIONS);
    const newVer: DocVersion = {
      ...version,
      syn_docversionid: generateId(),
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    };
    all.push(newVer);
    saveToStorage(STORAGE_KEYS.versions, all);
    return newVer;
  },

  async update(id: string, changes: Partial<DocVersion>): Promise<DocVersion> {
    if (isDv()) {
      const Dv = await getDv();
      const payload = cleanPayload(changes as Record<string, unknown>);
      const res = await Dv.UpdateRecord(PREFER, ACCEPT, TABLE.docVersion, id, payload);
      return (res.data ?? { ...changes, syn_docversionid: id }) as unknown as DocVersion;
    }
    const all = loadFromStorage<DocVersion>(STORAGE_KEYS.versions, SEED_VERSIONS);
    const idx = all.findIndex((v) => v.syn_docversionid === id);
    if (idx === -1) throw new Error("Version not found");
    all[idx] = { ...all[idx], ...changes, modifiedon: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.versions, all);
    return all[idx];
  },
};
