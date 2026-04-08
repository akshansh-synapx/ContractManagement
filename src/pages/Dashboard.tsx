import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import RequestCard from '../components/RequestCard';
import NewRequestModal from '../components/NewRequestModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [showNewRequest, setShowNewRequest] = useState(false);

  const stats = {
    total: state.requests.length,
    open: state.requests.filter((r) => r.syn_requeststatus === 'open' || r.syn_requeststatus === 'in-discussion').length,
    inReview: state.requests.filter((r) => r.syn_requeststatus === 'in-review').length,
    closed: state.requests.filter((r) => r.syn_requeststatus === 'closed').length,
  };

  const recentRequests = [...state.requests]
    .sort((a, b) => new Date(b.modifiedon).getTime() - new Date(a.modifiedon).getTime())
    .slice(0, 6);

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <h1>Welcome back, {state.currentUser.name.split(' ')[0]} 👋</h1>
        <p>Here's what's happening with your document requests today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card turquoise">
          <div className="stat-card-header">
            <div className="stat-card-icon turquoise">
              <FileText />
            </div>
            <TrendingUp size={16} style={{ color: 'var(--vivid-turquoise)' }} />
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Requests</div>
        </div>

        <div className="stat-card azure">
          <div className="stat-card-header">
            <div className="stat-card-icon azure">
              <MessageSquare />
            </div>
          </div>
          <div className="stat-card-value">{stats.open}</div>
          <div className="stat-card-label">Open & In Discussion</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-card-header">
            <div className="stat-card-icon warning">
              <Clock />
            </div>
          </div>
          <div className="stat-card-value">{stats.inReview}</div>
          <div className="stat-card-label">In Review</div>
        </div>

        <div className="stat-card cyan">
          <div className="stat-card-header">
            <div className="stat-card-icon cyan">
              <CheckCircle2 />
            </div>
          </div>
          <div className="stat-card-value">{stats.closed}</div>
          <div className="stat-card-label">Closed</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <button className="btn btn-primary btn-lg" onClick={() => setShowNewRequest(true)}>
          <Plus size={20} />
          New Document Request
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/requests')}>
          <FileText size={20} />
          View All Requests
        </button>
      </div>

      {/* Recent Requests */}
      <div className="section-header">
        <h2 className="section-title">Recent Requests</h2>
        <button className="section-action" onClick={() => navigate('/requests')}>
          View All <ArrowRight size={14} />
        </button>
      </div>

      {recentRequests.length > 0 ? (
        <div className="requests-grid">
          {recentRequests.map((request) => (
            <RequestCard key={request.syn_docrequestid} request={request} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText />
          </div>
          <h3>No requests yet</h3>
          <p>Create your first document request to get started with contract management.</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowNewRequest(true)}
            style={{ marginTop: '1rem' }}
          >
            <Plus size={16} />
            Create First Request
          </button>
        </div>
      )}

      <NewRequestModal
        isOpen={showNewRequest}
        onClose={() => setShowNewRequest(false)}
        onCreated={(id) => navigate(`/requests/${id}`)}
      />
    </div>
  );
}
