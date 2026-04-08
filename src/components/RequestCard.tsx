import { useNavigate } from 'react-router-dom';
import { Calendar, User, MessageSquare, FileStack, ArrowRight } from 'lucide-react';
import type { DocRequest } from '../types';
import { formatDate, timeAgo } from '../utils/helpers';
import { useApp } from '../context/AppContext';
import StatusBadge from './StatusBadge';

interface RequestCardProps {
  request: DocRequest;
}

export default function RequestCard({ request }: RequestCardProps) {
  const navigate = useNavigate();
  const { getRequestDiscussions, getRequestVersions } = useApp();

  const discussions = getRequestDiscussions(request.syn_docrequestid);
  const versions = getRequestVersions(request.syn_docrequestid);

  return (
    <div className="request-card" onClick={() => navigate(`/requests/${request.syn_docrequestid}`)}>
      <div className="request-card-header">
        <h3 className="request-card-title">{request.syn_title}</h3>
        <StatusBadge status={request.syn_requeststatus} />
      </div>

      <p className="request-card-desc">{request.syn_description}</p>

      <div className="request-card-meta">
        <span className="request-card-meta-item">
          <Calendar />
          {formatDate(request.createdon)}
        </span>
        <span className="request-card-meta-item">
          <User />
          {request.syn_requestedby}
        </span>
        <span className="request-card-meta-item">
          <MessageSquare />
          {discussions.length}
        </span>
        <span className="request-card-meta-item">
          <FileStack />
          v{versions.length > 0 ? versions[0].syn_versionnumber : 0}
        </span>
      </div>

      <div className="request-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`request-card-type ${request.syn_requesttype}`}>
            {request.syn_requesttype === 'legal' ? '⚖️' : '📄'} {request.syn_requesttype}
          </span>
          <span className={`priority-badge ${request.syn_priority}`}>
            {request.syn_priority}
          </span>
        </div>
        <span className="request-card-meta-item" style={{ fontSize: '0.6875rem' }}>
          {timeAgo(request.modifiedon)}
          <ArrowRight style={{ width: 12, height: 12 }} />
        </span>
      </div>
    </div>
  );
}
