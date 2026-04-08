import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowRight,
  FileText,
  Scale,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { RequestStatus, RequestType } from '../types';
import StatusBadge from '../components/StatusBadge';
import NewRequestModal from '../components/NewRequestModal';
import { formatDate, timeAgo } from '../utils/helpers';

type FilterStatus = 'all' | RequestStatus;
type FilterType = 'all' | RequestType;

export default function AllRequests() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');

  const filteredRequests = state.requests
    .filter((r) => {
      if (statusFilter !== 'all' && r.syn_requeststatus !== statusFilter) return false;
      if (typeFilter !== 'all' && r.syn_requesttype !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.syn_title.toLowerCase().includes(q) ||
          r.syn_description.toLowerCase().includes(q) ||
          r.syn_requestedby.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.modifiedon).getTime() - new Date(a.modifiedon).getTime());

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in-discussion', label: 'In Discussion' },
    { value: 'in-review', label: 'In Review' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="requests-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            All Requests
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewRequest(true)}>
          <Plus size={16} />
          New Request
        </button>
      </div>

      {/* Toolbar */}
      <div className="requests-toolbar">
        <div className="requests-filters">
          {/* Search */}
          <div className="header-search" style={{ width: 280 }}>
            <Search size={16} />
            <input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filters */}
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              className={`filter-btn ${statusFilter === opt.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="requests-filters">
          <button
            className={`filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            <Filter size={14} /> All Types
          </button>
          <button
            className={`filter-btn ${typeFilter === 'contract' ? 'active' : ''}`}
            onClick={() => setTypeFilter('contract')}
          >
            <FileText size={14} /> Contracts
          </button>
          <button
            className={`filter-btn ${typeFilter === 'legal' ? 'active' : ''}`}
            onClick={() => setTypeFilter('legal')}
          >
            <Scale size={14} /> Legal
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredRequests.length > 0 ? (
        <div className="requests-table">
          <div className="requests-table-header">
            <div>Title</div>
            <div>Type</div>
            <div>Status</div>
            <div>Priority</div>
            <div>Updated</div>
            <div></div>
          </div>
          {filteredRequests.map((request) => (
            <div
              key={request.syn_docrequestid}
              className="requests-table-row"
              onClick={() => navigate(`/requests/${request.syn_docrequestid}`)}
            >
              <div className="requests-table-cell title">
                <span className="truncate">{request.syn_title}</span>
              </div>
              <div className="requests-table-cell">
                <span className={`request-card-type ${request.syn_requesttype}`}>
                  {request.syn_requesttype === 'legal' ? '⚖️' : '📄'} {request.syn_requesttype}
                </span>
              </div>
              <div className="requests-table-cell">
                <StatusBadge status={request.syn_requeststatus} />
              </div>
              <div className="requests-table-cell">
                <span className={`priority-badge ${request.syn_priority}`}>
                  {request.syn_priority}
                </span>
              </div>
              <div className="requests-table-cell date">
                {timeAgo(request.modifiedon)}
              </div>
              <div className="requests-table-cell">
                <button className="requests-table-action">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div className="empty-state-icon">
            <Search />
          </div>
          <h3>No requests found</h3>
          <p>
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Create your first document request to get started.'}
          </p>
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
