import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Plus, Search, Edit, Trash2, X, FileText, Upload, File, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import type { Document } from '../types';

const CATEGORIES = ['Incident Rubrics', 'Procedures', 'Policies', 'Training Materials', 'Other'];

export default function Documents() {
  const { documents, addDocument, updateDocument, deleteDocument, emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate } = useApp();
  
  const [activeTab, setActiveTab] = useState<'documents' | 'email-templates'>('documents');
  const [showDocModal, setShowDocModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editingEmail, setEditingEmail] = useState<typeof emailTemplates[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [docFormData, setDocFormData] = useState({
    name: '',
    category: 'Procedures',
    content: '',
  });

  const [emailFormData, setEmailFormData] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const resetDocForm = () => {
    setDocFormData({ name: '', category: 'Procedures', content: '' });
    setEditingDoc(null);
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
      });
    } else {
      resetDocForm();
    }
    setShowDocModal(true);
  };

  const handleOpenEmailModal = (email?: typeof emailTemplates[0]) => {
    if (email) {
      setEditingEmail(email);
      setEmailFormData({
        name: email.name,
        subject: email.subject,
        body: email.body,
      });
    } else {
      resetEmailForm();
    }
    setShowEmailModal(true);
  };

  const handleSubmitDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoc) {
      updateDocument(editingDoc.id, docFormData);
    } else {
      addDocument(docFormData);
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

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredEmails = emailTemplates.filter(email => {
    return email.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Documents & Templates</h1>
      </div>

      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FolderOpen size={16} style={{ marginRight: '8px' }} />
          Documents & Post Orders
        </div>
        <div 
          className={`tab ${activeTab === 'email-templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('email-templates')}
        >
          <FileText size={16} style={{ marginRight: '8px' }} />
          Email Templates
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
          <select
            className="form-select filter-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
        <button 
          className="btn btn-primary"
          onClick={() => activeTab === 'documents' ? handleOpenDocModal() : handleOpenEmailModal()}
        >
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
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">No documents added yet</td>
                  </tr>
                ) : (
                  filteredDocs.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} />
                          {doc.name}
                        </div>
                      </td>
                      <td>
                        <span className="status-badge status-open">{doc.category}</span>
                      </td>
                      <td>{format(new Date(doc.createdAt), 'MM/dd/yyyy')}</td>
                      <td>{format(new Date(doc.updatedAt), 'MM/dd/yyyy')}</td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleOpenDocModal(doc)}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => deleteDocument(doc.id)}
                          >
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
                  <tr>
                    <td colSpan={3} className="empty-state">No email templates</td>
                  </tr>
                ) : (
                  filteredEmails.map(email => (
                    <tr key={email.id}>
                      <td>{email.name}</td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {email.subject}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleOpenEmailModal(email)}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => deleteEmailTemplate(email.id)}
                          >
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

      {showDocModal && (
        <div className="modal-overlay" onClick={() => setShowDocModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingDoc ? 'Edit Document' : 'Add Document'}</h3>
              <button className="modal-close" onClick={() => setShowDocModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitDoc}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Document Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={docFormData.name}
                    onChange={e => setDocFormData({ ...docFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={docFormData.category}
                    onChange={e => setDocFormData({ ...docFormData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '200px' }}
                    value={docFormData.content}
                    onChange={e => setDocFormData({ ...docFormData, content: e.target.value })}
                    placeholder="Document content or paste URL to file..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDoc ? 'Update' : 'Add'} Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingEmail ? 'Edit Email Template' : 'Add Email Template'}</h3>
              <button className="modal-close" onClick={() => setShowEmailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitEmail}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Template Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailFormData.name}
                    onChange={e => setEmailFormData({ ...emailFormData, name: e.target.value })}
                    placeholder="e.g., Significant Impact"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailFormData.subject}
                    onChange={e => setEmailFormData({ ...emailFormData, subject: e.target.value })}
                    placeholder="Use {location}, {time}, {details}, {resolver} as variables"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Body</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '200px' }}
                    value={emailFormData.body}
                    onChange={e => setEmailFormData({ ...emailFormData, body: e.target.value })}
                    placeholder="Use {location}, {time}, {details}, {resolver} as variables..."
                  />
                </div>
                <div style={{ backgroundColor: 'var(--bg)', padding: '12px', borderRadius: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Available Variables:</strong><br />
                  {'{location}'} - Business location<br />
                  {'{time}'} - Incident time<br />
                  {'{details}'} - Incident details<br />
                  {'{resolver}'} - Resolver initials
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmail ? 'Update' : 'Add'} Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
