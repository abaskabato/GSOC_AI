import { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { useAudit } from '../store/AuditContext';
import { Plus, Edit, Trash2, X, FileText, Upload, FolderOpen, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { Document } from '../types';
import { readFileAsDataURL, formatFileSize } from '../utils/export';

const CATEGORIES = ['Incident Rubrics', 'Procedures', 'Policies', 'Training Materials', 'Other'];

function getFileIcon(fileType?: string) {
  if (!fileType) return <FileText size={16} />;
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word') || fileType.includes('docx')) return '📝';
  return <FileText size={16} />;
}

export default function Documents() {
  const { documents, addDocument, updateDocument, deleteDocument, emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate } = useApp();
  const { currentUser } = useAuth();
  const { addAuditEntry } = useAudit();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'documents' | 'email-templates'>('documents');
  const [showDocModal, setShowDocModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [editingEmail, setEditingEmail] = useState<typeof emailTemplates[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadError, setUploadError] = useState('');

  const [docFormData, setDocFormData] = useState({
    name: '',
    category: 'Procedures',
    content: '',
    fileName: undefined as string | undefined,
    fileType: undefined as string | undefined,
    fileSize: undefined as number | undefined,
  });

  const [emailFormData, setEmailFormData] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const resetDocForm = () => {
    setDocFormData({ name: '', category: 'Procedures', content: '', fileName: undefined, fileType: undefined, fileSize: undefined });
    setEditingDoc(null);
    setUploadError('');
  };

  const resetEmailForm = () => {
    setEmailFormData({ name: '', subject: '', body: '' });
    setEditingEmail(null);
  };

  const handleOpenDocModal = (doc?: Document) => {
    if (doc) {
      setEditingDoc(doc);
      setDocFormData({
        name: doc.name,
        category: doc.category,
        content: doc.content,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
      });
    } else {
      resetDocForm();
    }
    setShowDocModal(true);
  };

  const handleOpenEmailModal = (email?: typeof emailTemplates[0]) => {
    if (email) {
      setEditingEmail(email);
      setEmailFormData({ name: email.name, subject: email.subject, body: email.body });
    } else {
      resetEmailForm();
    }
    setShowEmailModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      setUploadError('File too large. Maximum size is 10 MB.');
      return;
    }

    setUploadError('');
    try {
      const dataUrl = await readFileAsDataURL(file);
      setDocFormData(prev => ({
        ...prev,
        name: prev.name || file.name.replace(/\.[^/.]+$/, ''),
        content: dataUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }));
    } catch {
      setUploadError('Failed to read file. Please try again.');
    }
  };

  const handleSubmitDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoc) {
      updateDocument(editingDoc.id, docFormData);
      addAuditEntry({ username: currentUser?.username || 'unknown', action: 'updated', entityType: 'document', entityId: editingDoc.id, details: `Updated document: ${docFormData.name}` });
    } else {
      addDocument(docFormData);
      addAuditEntry({ username: currentUser?.username || 'unknown', action: 'created', entityType: 'document', details: `Added document: ${docFormData.name} (${docFormData.category})` });
    }
    setShowDocModal(false);
    resetDocForm();
  };

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmail) {
      updateEmailTemplate(editingEmail.id, emailFormData);
    } else {
      addEmailTemplate(emailFormData);
    }
    setShowEmailModal(false);
    resetEmailForm();
  };

  const handleDeleteDoc = (doc: Document) => {
    deleteDocument(doc.id);
    addAuditEntry({ username: currentUser?.username || 'unknown', action: 'deleted', entityType: 'document', entityId: doc.id, details: `Deleted document: ${doc.name}` });
  };

  const handleDownload = (doc: Document) => {
    if (!doc.content) return;
    const link = document.createElement('a');
    link.href = doc.content;
    link.download = doc.fileName || doc.name;
    link.click();
  };

  const handleView = (doc: Document) => {
    if (doc.fileType && (doc.fileType.startsWith('image/') || doc.fileType === 'application/pdf')) {
      window.open(doc.content, '_blank');
    } else {
      setViewingDoc(doc);
      setShowViewModal(true);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredEmails = emailTemplates.filter(email =>
    email.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Documents & Templates</h1>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
          <FolderOpen size={16} style={{ marginRight: '8px' }} /> Documents & Post Orders
        </div>
        <div className={`tab ${activeTab === 'email-templates' ? 'active' : ''}`} onClick={() => setActiveTab('email-templates')}>
          <FileText size={16} style={{ marginRight: '8px' }} /> Email Templates
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {activeTab === 'documents' && (
          <select className="form-select filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        )}
        <button className="btn btn-primary" onClick={() => activeTab === 'documents' ? handleOpenDocModal() : handleOpenEmailModal()}>
          <Plus size={16} /> Add {activeTab === 'documents' ? 'Document' : 'Template'}
        </button>
      </div>

      {activeTab === 'documents' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>File</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state">No documents added yet</td></tr>
                ) : (
                  filteredDocs.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{typeof getFileIcon(doc.fileType) === 'string' ? getFileIcon(doc.fileType) : <FileText size={16} />}</span>
                          {doc.name}
                        </div>
                      </td>
                      <td><span className="status-badge status-open">{doc.category}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {doc.fileName ? (
                          <span>{doc.fileName} {doc.fileSize ? `(${formatFileSize(doc.fileSize)})` : ''}</span>
                        ) : (
                          <span>Text</span>
                        )}
                      </td>
                      <td>{format(new Date(doc.createdAt), 'MM/dd/yyyy')}</td>
                      <td>{format(new Date(doc.updatedAt), 'MM/dd/yyyy')}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn btn-secondary btn-sm" onClick={() => handleView(doc)} title="View">
                            <Eye size={14} />
                          </button>
                          {doc.fileName && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(doc)} title="Download">
                              <Download size={14} />
                            </button>
                          )}
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenDocModal(doc)} title="Edit">
                            <Edit size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDoc(doc)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'email-templates' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Subject</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.length === 0 ? (
                  <tr><td colSpan={3} className="empty-state">No email templates</td></tr>
                ) : (
                  filteredEmails.map(email => (
                    <tr key={email.id}>
                      <td>{email.name}</td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email.subject}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEmailModal(email)}><Edit size={14} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteEmailTemplate(email.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && (
        <div className="modal-overlay" onClick={() => setShowDocModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingDoc ? 'Edit Document' : 'Add Document'}</h3>
              <button className="modal-close" onClick={() => setShowDocModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitDoc}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Document Name</label>
                    <input type="text" className="form-input" value={docFormData.name} onChange={e => setDocFormData({ ...docFormData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={docFormData.category} onChange={e => setDocFormData({ ...docFormData, category: e.target.value })}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Upload File</label>
                  <div
                    className="file-upload-area"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={async e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const syntheticEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                        await handleFileUpload(syntheticEvent);
                      }
                    }}
                  >
                    <Upload size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    {docFormData.fileName ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{docFormData.fileName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {docFormData.fileSize ? formatFileSize(docFormData.fileSize) : ''}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>Click or drag & drop to upload</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          PDF, DOCX, images, text files (max 10 MB)
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.svg"
                    onChange={handleFileUpload}
                  />
                  {uploadError && <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{uploadError}</div>}
                </div>

                {(!docFormData.fileName || docFormData.fileType?.startsWith('text/')) && (
                  <div className="form-group">
                    <label className="form-label">Text Content {docFormData.fileName ? '(optional)' : ''}</label>
                    <textarea
                      className="form-textarea"
                      style={{ minHeight: '150px' }}
                      value={docFormData.fileType && !docFormData.fileType.startsWith('text/') ? '' : (docFormData.fileType ? '' : docFormData.content)}
                      onChange={e => setDocFormData({ ...docFormData, content: e.target.value })}
                      placeholder="Paste document content or notes here..."
                      disabled={!!docFormData.fileName && !docFormData.fileType?.startsWith('text/')}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingDoc ? 'Update' : 'Add'} Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingDoc && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{viewingDoc.name}</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <pre style={{
                backgroundColor: 'var(--bg)',
                padding: '16px',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: '13px',
                maxHeight: '500px',
                overflowY: 'auto',
              }}>
                {viewingDoc.content.startsWith('data:') ? '(Binary file — use Download to view)' : viewingDoc.content}
              </pre>
            </div>
            <div className="modal-footer">
              {viewingDoc.fileName && (
                <button className="btn btn-secondary" onClick={() => handleDownload(viewingDoc)}>
                  <Download size={16} /> Download
                </button>
              )}
              <button className="btn btn-primary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Template Modal */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingEmail ? 'Edit Email Template' : 'Add Email Template'}</h3>
              <button className="modal-close" onClick={() => setShowEmailModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitEmail}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Template Name</label>
                  <input type="text" className="form-input" value={emailFormData.name} onChange={e => setEmailFormData({ ...emailFormData, name: e.target.value })} placeholder="e.g., Significant Impact" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-input" value={emailFormData.subject} onChange={e => setEmailFormData({ ...emailFormData, subject: e.target.value })} placeholder="Use {location}, {time}, {details}, {resolver} as variables" />
                </div>
                <div className="form-group">
                  <label className="form-label">Body</label>
                  <textarea className="form-textarea" style={{ minHeight: '200px' }} value={emailFormData.body} onChange={e => setEmailFormData({ ...emailFormData, body: e.target.value })} placeholder="Use {location}, {time}, {details}, {resolver} as variables..." />
                </div>
                <div style={{ backgroundColor: 'var(--bg)', padding: '12px', borderRadius: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Available Variables:</strong><br />
                  {'{location}'} - Business location &nbsp; {'{time}'} - Incident time &nbsp; {'{details}'} - Details &nbsp; {'{resolver}'} - Resolver
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingEmail ? 'Update' : 'Add'} Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
