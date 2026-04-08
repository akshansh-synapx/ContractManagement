import {
  Upload,
  CheckCircle2,
  ExternalLink,
  Link2,
  FileStack,
  Shield,
  Star,
} from 'lucide-react';
import type { DocVersion } from '../types';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/helpers';

interface VersionPanelProps {
  requestId: string;
  onUpload: () => void;
  onSelectVersion: (version: DocVersion) => void;
  disabled?: boolean;
  finalVersionId?: string;
}

export default function VersionPanel({
  requestId,
  onUpload,
  onSelectVersion,
  disabled = false,
  finalVersionId,
}: VersionPanelProps) {
  const { getRequestVersions, signOffVersion } = useApp();
  const versions = getRequestVersions(requestId);

  return (
    <div className="version-panel">
      <div className="version-panel-header">
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Document Versions
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            {versions.length} version{versions.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        {!disabled && (
          <button className="btn btn-primary btn-sm" onClick={onUpload}>
            <Upload size={14} />
            Upload Version
          </button>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="version-empty">
          <FileStack />
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>No versions yet</p>
          <p style={{ fontSize: '0.8125rem' }}>
            Upload a document URL to create the first version
          </p>
          {!disabled && (
            <button className="btn btn-primary" onClick={onUpload} style={{ marginTop: '0.5rem' }}>
              <Upload size={16} />
              Upload First Version
            </button>
          )}
        </div>
      ) : (
        <div className="version-list">
          {versions.map((version) => (
            <div
              key={version.syn_docversionid}
              className={`version-item ${version.syn_docversionid === finalVersionId ? 'final' : ''}`}
            >
              <div className="version-number">
                {version.syn_docversionid === finalVersionId ? (
                  <Star size={20} />
                ) : (
                  `v${version.syn_versionnumber}`
                )}
              </div>

              <div className="version-info">
                <div className="version-title">
                  {version.syn_title}
                  {version.syn_docversionid === finalVersionId && (
                    <span className="final-badge" style={{ marginLeft: '0.5rem' }}>
                      <Star size={10} /> Final Version
                    </span>
                  )}
                </div>
                <div className="version-meta">
                  Uploaded by {version.syn_uploadedby} · {formatDateTime(version.syn_uploadedat)}
                  {version.syn_description && (
                    <span style={{ display: 'block', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                      {version.syn_description}
                    </span>
                  )}
                </div>
                <div className="version-url">
                  <Link2 size={12} />
                  <a href={version.syn_documenturl} target="_blank" rel="noopener noreferrer">
                    {version.syn_documenturl.length > 50
                      ? version.syn_documenturl.slice(0, 50) + '...'
                      : version.syn_documenturl}
                  </a>
                </div>
              </div>

              <div className="version-actions">
                {version.syn_signedoff ? (
                  <div className="version-signed-off">
                    <CheckCircle2 size={12} />
                    Signed Off
                  </div>
                ) : (
                  !disabled && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => signOffVersion(version.syn_docversionid)}
                    >
                      <Shield size={14} />
                      Sign Off
                    </button>
                  )
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSelectVersion(version)}
                >
                  <ExternalLink size={14} />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
