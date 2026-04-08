import { useState } from 'react';
import { X, Scale, FileText } from 'lucide-react';
import type { RequestType, Priority } from '../types';
import { useApp } from '../context/AppContext';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export default function NewRequestModal({ isOpen, onClose, onCreated }: NewRequestModalProps) {
  const { addRequest, currentUser } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RequestType>('contract');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignedTo, setAssignedTo] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const request = await addRequest({
      syn_title: title.trim(),
      syn_description: description.trim(),
      syn_requesttype: type,
      syn_requeststatus: 'open',
      syn_priority: priority,
      syn_requestedby: currentUser.name,
      syn_assignedto: assignedTo.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setType('contract');
    setPriority('medium');
    setAssignedTo('');
    onClose();
    onCreated?.(request.syn_docrequestid);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Document Request</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Document Type */}
            <div className="form-group">
              <label className="form-label">
                Document Type <span>*</span>
              </label>
              <div className="form-radio-group">
                <label className="form-radio-option">
                  <input
                    type="radio"
                    name="type"
                    value="contract"
                    checked={type === 'contract'}
                    onChange={() => setType('contract')}
                  />
                  <div className="form-radio-label">
                    <div className="form-radio-icon contract">
                      <FileText size={20} />
                    </div>
                    <div className="form-radio-text">
                      <strong>Contract</strong>
                      <span>Agreements & contracts</span>
                    </div>
                  </div>
                </label>
                <label className="form-radio-option">
                  <input
                    type="radio"
                    name="type"
                    value="legal"
                    checked={type === 'legal'}
                    onChange={() => setType('legal')}
                  />
                  <div className="form-radio-label">
                    <div className="form-radio-icon legal">
                      <Scale size={20} />
                    </div>
                    <div className="form-radio-text">
                      <strong>Legal</strong>
                      <span>NDAs, compliance docs</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Title <span>*</span>
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Vendor Supply Agreement - TechCorp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the document requirements, key clauses, and any specific instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Assign To */}
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Legal Team, Priya Mehta"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
              <p className="form-hint">Optionally assign this request to a person or team</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
