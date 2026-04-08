// ============================================================================
// AppContext — Dataverse-first state management for Contract Management
// ============================================================================
// Uses dataService.ts which routes to Dataverse inside Power Apps runtime
// and falls back to localStorage during local development.
// ============================================================================

import React, { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type {
  AppState,
  AppAction,
  DocRequest,
  Discussion,
  DocVersion,
  User,
} from '../types';
import { DocRequestService, DiscussionService, DocVersionService } from '../services/dataService';

const currentUser: User = {
  id: 'user-1',
  name: 'Akshansh Sharma',
  email: 'akshansh@synapx.com',
  role: 'Manager',
  initials: 'AS',
};

const initialState: AppState = {
  requests: [],
  discussions: [],
  versions: [],
  currentUser,
  loading: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'LOAD_REQUESTS':
      return { ...state, requests: action.payload };

    case 'LOAD_DISCUSSIONS':
      return { ...state, discussions: action.payload };

    case 'LOAD_VERSIONS':
      return { ...state, versions: action.payload };

    case 'ADD_REQUEST':
      return { ...state, requests: [action.payload, ...state.requests] };

    case 'UPDATE_REQUEST':
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.syn_docrequestid === action.payload.syn_docrequestid
            ? { ...r, ...action.payload, modifiedon: new Date().toISOString() }
            : r
        ),
      };

    case 'CLOSE_REQUEST':
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.syn_docrequestid === action.payload.id
            ? {
                ...r,
                syn_requeststatus: 'closed' as const,
                syn_closedat: new Date().toISOString(),
                modifiedon: new Date().toISOString(),
                syn_finalversionid: action.payload.finalVersionId,
              }
            : r
        ),
      };

    case 'ADD_DISCUSSION':
      return { ...state, discussions: [...state.discussions, action.payload] };

    case 'ADD_VERSION':
      return { ...state, versions: [...state.versions, action.payload] };

    case 'SIGN_OFF_VERSION':
      return {
        ...state,
        versions: state.versions.map((v) =>
          v.syn_docversionid === action.payload.id
            ? {
                ...v,
                syn_signedoff: true,
                syn_signedoffby: action.payload.signedOffBy,
                syn_signedoffat: new Date().toISOString(),
              }
            : v
        ),
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  currentUser: User;
  refreshData: () => Promise<void>;
  addRequest: (data: Omit<DocRequest, 'syn_docrequestid' | 'createdon' | 'modifiedon'>) => Promise<DocRequest>;
  addDiscussion: (requestId: string, message: string, versionId?: string) => Promise<void>;
  addVersion: (requestId: string, data: { documentUrl: string; title: string; description?: string }) => Promise<void>;
  signOffVersion: (versionId: string) => Promise<void>;
  closeRequest: (requestId: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: DocRequest['syn_requeststatus']) => Promise<void>;
  getRequestDiscussions: (requestId: string, versionId?: string) => Discussion[];
  getRequestVersions: (requestId: string) => DocVersion[];
  getLatestSignedOffVersion: (requestId: string) => DocVersion | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // -- Load all data from Dataverse (or localStorage fallback) ----------------
  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [requests, discussions, versions] = await Promise.all([
        DocRequestService.getAll(),
        DiscussionService.getAll(),
        DocVersionService.getAll(),
      ]);
      dispatch({ type: 'LOAD_REQUESTS', payload: requests });
      dispatch({ type: 'LOAD_DISCUSSIONS', payload: discussions });
      dispatch({ type: 'LOAD_VERSIONS', payload: versions });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load data',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // -- CRUD helpers that call Dataverse then update local state ---------------

  const addRequest = async (
    data: Omit<DocRequest, 'syn_docrequestid' | 'createdon' | 'modifiedon'>
  ): Promise<DocRequest> => {
    const request = await DocRequestService.create(data);
    dispatch({ type: 'ADD_REQUEST', payload: request });
    return request;
  };

  const addDiscussion = async (requestId: string, message: string, versionId?: string) => {
    const discussion = await DiscussionService.create({
      syn_docrequestid: requestId,
      syn_docversionid: versionId,
      syn_userid: state.currentUser.id,
      syn_username: state.currentUser.name,
      syn_message: message,
      syn_timestamp: new Date().toISOString(),
    });
    dispatch({ type: 'ADD_DISCUSSION', payload: discussion });

    // Auto-update status to in-discussion if still open
    const request = state.requests.find((r) => r.syn_docrequestid === requestId);
    if (request && request.syn_requeststatus === 'open') {
      await DocRequestService.update(requestId, { syn_requeststatus: 'in-discussion' });
      dispatch({
        type: 'UPDATE_REQUEST',
        payload: { syn_docrequestid: requestId, syn_requeststatus: 'in-discussion' },
      });
    }
  };

  const addVersion = async (
    requestId: string,
    data: { documentUrl: string; title: string; description?: string }
  ) => {
    const existingVersions = state.versions.filter((v) => v.syn_docrequestid === requestId);
    const nextVersionNumber = existingVersions.length + 1;

    const version = await DocVersionService.create({
      syn_docrequestid: requestId,
      syn_versionnumber: nextVersionNumber,
      syn_documenturl: data.documentUrl,
      syn_title: data.title,
      syn_description: data.description,
      syn_uploadedby: state.currentUser.name,
      syn_uploadedat: new Date().toISOString(),
      syn_signedoff: false,
    });
    dispatch({ type: 'ADD_VERSION', payload: version });

    // Auto-update status to in-review
    await DocRequestService.update(requestId, { syn_requeststatus: 'in-review' });
    dispatch({
      type: 'UPDATE_REQUEST',
      payload: { syn_docrequestid: requestId, syn_requeststatus: 'in-review' },
    });
  };

  const signOffVersion = async (versionId: string) => {
    await DocVersionService.update(versionId, {
      syn_signedoff: true,
      syn_signedoffby: state.currentUser.name,
      syn_signedoffat: new Date().toISOString(),
    });
    dispatch({
      type: 'SIGN_OFF_VERSION',
      payload: { id: versionId, signedOffBy: state.currentUser.name },
    });
  };

  const closeRequest = async (requestId: string) => {
    const versions = state.versions.filter((v) => v.syn_docrequestid === requestId);
    const latestSignedOff = [...versions]
      .filter((v) => v.syn_signedoff)
      .sort((a, b) => b.syn_versionnumber - a.syn_versionnumber)[0];

    if (latestSignedOff && latestSignedOff.syn_docversionid) {
      await DocRequestService.update(requestId, {
        syn_requeststatus: 'closed',
        syn_closedat: new Date().toISOString(),
        syn_finalversionid: latestSignedOff.syn_docversionid,
      });
      dispatch({
        type: 'CLOSE_REQUEST',
        payload: { id: requestId, finalVersionId: latestSignedOff.syn_docversionid },
      });
    }
  };

  const updateRequestStatus = async (requestId: string, status: DocRequest['syn_requeststatus']) => {
    await DocRequestService.update(requestId, { syn_requeststatus: status });
    dispatch({
      type: 'UPDATE_REQUEST',
      payload: { syn_docrequestid: requestId, syn_requeststatus: status },
    });
  };

  // -- Read helpers (synchronous, from local state) ---------------------------

  const getRequestDiscussions = (requestId: string, versionId?: string): Discussion[] => {
    return state.discussions
      .filter((d: Discussion) => {
        if (d.syn_docrequestid !== requestId) return false;
        if (versionId !== undefined) return d.syn_docversionid === versionId;
        return true;
      })
      .sort((a: Discussion, b: Discussion) =>
        new Date(a.syn_timestamp).getTime() - new Date(b.syn_timestamp).getTime()
      );
  };

  const getRequestVersions = (requestId: string): DocVersion[] => {
    return state.versions
      .filter((v: DocVersion) => v.syn_docrequestid === requestId)
      .sort((a: DocVersion, b: DocVersion) => b.syn_versionnumber - a.syn_versionnumber);
  };

  const getLatestSignedOffVersion = (requestId: string): DocVersion | undefined => {
    return state.versions
      .filter((v: DocVersion) => v.syn_docrequestid === requestId && v.syn_signedoff)
      .sort((a: DocVersion, b: DocVersion) => b.syn_versionnumber - a.syn_versionnumber)[0];
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        currentUser: state.currentUser,
        refreshData,
        addRequest,
        addDiscussion,
        addVersion,
        signOffVersion,
        closeRequest,
        updateRequestStatus,
        getRequestDiscussions,
        getRequestVersions,
        getLatestSignedOffVersion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
