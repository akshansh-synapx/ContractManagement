import { useState } from 'react';
import { X, Link2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface UploadVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

export default function UploadVersionModal({ isOpen, onClose, requestId }: UploadVersionModalProps) {
  const { addVersion } = useApp();
  const [title, setTitle] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !documentUrl.trim()) return;

    addVersion(requestId, {
      title: title.trim(),
      documentUrl: documentUrl.trim(),
      description: description.trim() || undefined,
    });

    setTitle('');
    setDocumentUrl('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Upload New Version</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Version Title <span>*</span>
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Revised Draft - Updated Payment Terms"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Document URL */}
            <div className="form-group">
              <label className="form-label">
                Document URL <span>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Link2
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                  }}
                />
              </div>
              <p className="form-hint">
                Paste the URL of the document (Google Docs, SharePoint, PDF link, etc.)
              </p>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Change Description</label>
              <textarea
                className="form-textarea"
                placeholder="What changed in this version? e.g. Updated liability clause, revised payment terms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || !documentUrl.trim()}
            >
              Upload Version
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
