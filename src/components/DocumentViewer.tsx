import { useState } from 'react';
import { ExternalLink, FileText, Eye } from 'lucide-react';
import type { DocVersion } from '../types';
import { useApp } from '../context/AppContext';

interface DocumentViewerProps {
  requestId: string;
  selectedVersion?: DocVersion;
}

export default function DocumentViewer({ requestId, selectedVersion }: DocumentViewerProps) {
  const { getRequestVersions } = useApp();
  const versions = getRequestVersions(requestId);
  const [currentVersion, setCurrentVersion] = useState<DocVersion | undefined>(selectedVersion);

  const activeVersion = currentVersion || (versions.length > 0 ? versions[0] : undefined);

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const version = versions.find((v) => v.syn_docversionid === e.target.value);
    setCurrentVersion(version);
  };

  if (versions.length === 0) {
    return (
      <div className="document-viewer">
        <div className="document-viewer-empty" style={{ flex: 1 }}>
          <FileText />
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>No documents to review</p>
          <p>Upload a version first to review documents here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      <div className="document-viewer-toolbar">
        <div className="document-viewer-selector">
          <Eye size={16} style={{ color: 'var(--text-tertiary)' }} />
          <label>Viewing:</label>
          <select
            className="form-select"
            value={activeVersion?.syn_docversionid || ''}
            onChange={handleVersionChange}
            style={{ width: 'auto', padding: '0.375rem 0.75rem' }}
          >
            {versions.map((v) => (
              <option key={v.syn_docversionid} value={v.syn_docversionid}>
                v{v.syn_versionnumber} — {v.syn_title}
              </option>
            ))}
          </select>
        </div>

        <div className="document-viewer-actions">
          {activeVersion && (
            <a
              href={activeVersion.syn_documenturl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <ExternalLink size={14} />
              Open in New Tab
            </a>
          )}
        </div>
      </div>

      <div className="document-viewer-frame">
        {activeVersion ? (
          <iframe
            src={activeVersion.syn_documenturl}
            title={activeVersion.syn_title}
            sandbox="allow-scripts allow-same-origin allow-popups"
            style={{ width: '100%', height: '100%' }}
            onError={() => {}}
          />
        ) : (
          <div className="document-viewer-empty">
            <FileText />
            <p>Select a version to preview</p>
          </div>
        )}
      </div>

      {activeVersion && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
          }}
        >
          <span>
            If the document doesn't load, it may not support embedding.{' '}
            <a
              href={activeVersion.syn_documenturl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--vivid-turquoise)', fontWeight: 600 }}
            >
              Open directly →
            </a>
          </span>
          {activeVersion.syn_signedoff && (
            <span style={{ color: '#059669', fontWeight: 600 }}>
              ✓ This version has been signed off
            </span>
          )}
        </div>
      )}
    </div>
  );
}
