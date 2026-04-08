import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  FileStack,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Lock,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import ChatPanel from '../components/ChatPanel';
import VersionPanel from '../components/VersionPanel';
import UploadVersionModal from '../components/UploadVersionModal';
import DocumentViewer from '../components/DocumentViewer';
import type { DocVersion } from '../types';
import { formatDate } from '../utils/helpers';

type TabType = 'discussion' | 'versions' | 'review';

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, closeRequest, getRequestVersions, getRequestDiscussions, getLatestSignedOffVersion } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('discussion');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DocVersion | undefined>();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const request = state.requests.find((r) => r.syn_docrequestid === id);

  if (!request) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Request not found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          The document request you're looking for doesn't exist.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const versions = getRequestVersions(request.syn_docrequestid);
  const discussions = getRequestDiscussions(request.syn_docrequestid);
  const latestSignedOff = getLatestSignedOffVersion(request.syn_docrequestid);
  const isClosed = request.syn_requeststatus === 'closed';
  const canClose = latestSignedOff && !isClosed;

  const handleCloseRequest = () => {
    closeRequest(request.syn_docrequestid);
    setShowCloseConfirm(false);
  };

  const handleSelectVersionForReview = (version: DocVersion) => {
    setSelectedVersion(version);
    setActiveTab('review');
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'discussion',
      label: 'Discussion',
      icon: <MessageSquare size={18} />,
      count: discussions.filter((d) => !d.syn_docversionid).length,
    },
    {
      id: 'versions',
      label: 'Versions',
      icon: <FileStack size={18} />,
      count: versions.length,
    },
    {
      id: 'review',
      label: 'Review Document',
      icon: <Eye size={18} />,
    },
  ];

  return (
    <div className="request-detail">
      {/* Back link */}
      <Link to="/requests" className="back-link">
        <ArrowLeft />
        Back to All Requests
      </Link>

      {/* Close confirmation banner */}
      {showCloseConfirm && (
        <div className="close-confirm">
          <AlertTriangle />
          <div className="close-confirm-text">
            <p>
              Are you sure you want to close this request?{' '}
              <strong>v{latestSignedOff?.syn_versionnumber} — {latestSignedOff?.syn_title}</strong>{' '}
              will become the final version.
            </p>
            <span>This action cannot be undone.</span>
          </div>
          <div className="close-confirm-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCloseConfirm(false)}>
              Cancel
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleCloseRequest}>
              <Lock size={14} />
              Close Request
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="request-detail-header">
        <div className="request-detail-top">
          <div>
            <h1 className="request-detail-title">{request.syn_title}</h1>
            <div className="request-detail-badges">
              <StatusBadge status={request.syn_requeststatus} />
              <span className={`request-card-type ${request.syn_requesttype}`}>
                {request.syn_requesttype === 'legal' ? '⚖️' : '📄'} {request.syn_requesttype}
              </span>
              <span className={`priority-badge ${request.syn_priority}`}>
                {request.syn_priority} priority
              </span>
              {request.syn_finalversionid && (
                <span className="final-badge">
                  <CheckCircle2 size={12} />
                  Finalized
                </span>
              )}
            </div>
          </div>
          <div className="request-detail-actions">
            {canClose && (
              <button
                className="btn btn-danger"
                onClick={() => setShowCloseConfirm(true)}
              >
                <Lock size={16} />
                Close Request
              </button>
            )}
            {isClosed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#F1F5F9',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--grey-azure)',
                }}
              >
                <Lock size={16} />
                Request Closed
              </div>
            )}
          </div>
        </div>

        <p className="request-detail-desc">{request.syn_description}</p>

        <div className="request-detail-meta">
          <div className="request-detail-meta-item">
            <User />
            <span>Requested by</span>
            <strong>{request.syn_requestedby}</strong>
          </div>
          {request.syn_assignedto && (
            <div className="request-detail-meta-item">
              <Tag />
              <span>Assigned to</span>
              <strong>{request.syn_assignedto}</strong>
            </div>
          )}
          <div className="request-detail-meta-item">
            <Calendar />
            <span>Created</span>
            <strong>{formatDate(request.createdon)}</strong>
          </div>
          {request.syn_closedat && (
            <div className="request-detail-meta-item">
              <Lock />
              <span>Closed</span>
              <strong>{formatDate(request.syn_closedat)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="tab-badge">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'discussion' && (
          <ChatPanel requestId={request.syn_docrequestid} disabled={isClosed} />
        )}

        {activeTab === 'versions' && (
          <VersionPanel
            requestId={request.syn_docrequestid}
            onUpload={() => setShowUploadModal(true)}
            onSelectVersion={handleSelectVersionForReview}
            disabled={isClosed}
            finalVersionId={request.syn_finalversionid}
          />
        )}

        {activeTab === 'review' && (
          <DocumentViewer requestId={request.syn_docrequestid} selectedVersion={selectedVersion} />
        )}
      </div>

      {/* Version Discussion section (shown below when a version is selected for review) */}
      {activeTab === 'review' && selectedVersion && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
            💬 Discussion on v{selectedVersion.syn_versionnumber} — {selectedVersion.syn_title}
          </h3>
          <div className="tab-content">
            <ChatPanel
              requestId={request.syn_docrequestid}
              versionId={selectedVersion.syn_docversionid}
              disabled={isClosed}
            />
          </div>
        </div>
      )}

      {/* Upload Version Modal */}
      <UploadVersionModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        requestId={request.syn_docrequestid}
      />
    </div>
  );
}
