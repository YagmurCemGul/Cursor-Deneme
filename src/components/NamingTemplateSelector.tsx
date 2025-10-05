import React, { useState, useEffect } from 'react';
import { NamingTemplate, CVData } from '../types';
import { FileNamingService } from '../utils/fileNamingService';

interface NamingTemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
  cvData: CVData;
}

export const NamingTemplateSelector: React.FC<NamingTemplateSelectorProps> = ({
  selectedTemplate,
  onSelect,
  cvData,
}) => {
  const [templates, setTemplates] = useState<NamingTemplate[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    updatePreview();
  }, [selectedTemplate, templates, cvData]);

  const loadTemplates = async () => {
    const loaded = await FileNamingService.getTemplates();
    setTemplates(loaded);
  };

  const updatePreview = async () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (template) {
      const previewText = FileNamingService.applyTemplate(template.template, {
        firstName: cvData.personalInfo.firstName || 'John',
        lastName: cvData.personalInfo.lastName || 'Doe',
        type: 'Resume',
        date: new Date().toISOString().split('T')[0]!,
        time: new Date().toTimeString().split(' ')[0]!.replace(/:/g, '-'),
        format: 'pdf',
      });
      setPreview(previewText);
    }
  };

  return (
    <div className="naming-template-selector">
      <select
        value={selectedTemplate}
        onChange={(e) => onSelect(e.target.value)}
        className="template-select"
      >
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name} {template.isDefault ? '(Default)' : ''}
          </option>
        ))}
      </select>

      {preview && (
        <div className="template-preview">
          <span className="preview-label">Preview:</span>
          <code className="preview-text">{preview}</code>
        </div>
      )}

      <button onClick={() => setShowManager(!showManager)} className="btn-manage">
        ⚙️ Manage Templates
      </button>

      {showManager && (
        <NamingTemplateManager
          onClose={() => setShowManager(false)}
          onUpdate={() => {
            loadTemplates();
            updatePreview();
          }}
        />
      )}
    </div>
  );
};

interface NamingTemplateManagerProps {
  onClose: () => void;
  onUpdate: () => void;
}

const NamingTemplateManager: React.FC<NamingTemplateManagerProps> = ({ onClose, onUpdate }) => {
  const [templates, setTemplates] = useState<NamingTemplate[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    template: '',
    description: '',
  });
  const [preview, setPreview] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const loaded = await FileNamingService.getTemplates();
    setTemplates(loaded);
  };

  const handleTemplateChange = (template: string) => {
    setNewTemplate({ ...newTemplate, template });
    const validation = FileNamingService.validateTemplate(template);
    if (!validation.valid) {
      setValidationError(validation.error || null);
      setPreview('');
    } else {
      setValidationError(null);
      setPreview(FileNamingService.previewTemplate(template));
    }
  };

  const handleCreate = async () => {
    if (!newTemplate.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const validation = FileNamingService.validateTemplate(newTemplate.template);
    if (!validation.valid) {
      alert(`Invalid template: ${validation.error}`);
      return;
    }

    try {
      await FileNamingService.saveTemplate(newTemplate);
      setNewTemplate({ name: '', template: '', description: '' });
      setShowCreate(false);
      await loadTemplates();
      onUpdate();
      alert('✅ Template created successfully!');
    } catch (error: any) {
      alert(`❌ Failed to create template: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await FileNamingService.deleteTemplate(id);
      await loadTemplates();
      onUpdate();
      alert('✅ Template deleted');
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await FileNamingService.setDefaultTemplate(id);
      await loadTemplates();
      onUpdate();
      alert('✅ Default template updated');
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  const variables = FileNamingService.getAvailableVariables();

  return (
    <div className="naming-template-manager">
      <div className="manager-header">
        <h4>⚙️ Manage Naming Templates</h4>
        <button onClick={onClose} className="btn-close">
          ×
        </button>
      </div>

      {/* Create New Template */}
      <button onClick={() => setShowCreate(!showCreate)} className="btn-create">
        ➕ Create New Template
      </button>

      {showCreate && (
        <div className="create-template-form">
          <input
            type="text"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            placeholder="Template name..."
            className="input"
          />
          <input
            type="text"
            value={newTemplate.template}
            onChange={(e) => handleTemplateChange(e.target.value)}
            placeholder="Template pattern (e.g., {firstName}_{lastName}_{type}.{format})"
            className={`input ${validationError ? 'error' : ''}`}
          />
          {validationError && <div className="validation-error">{validationError}</div>}
          {preview && (
            <div className="template-preview">
              <span>Preview:</span> <code>{preview}</code>
            </div>
          )}
          <textarea
            value={newTemplate.description}
            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            placeholder="Description (optional)..."
            className="textarea"
            rows={2}
          />
          <div className="form-actions">
            <button onClick={handleCreate} className="btn-primary">
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">
              Cancel
            </button>
          </div>

          {/* Variable Reference */}
          <div className="variable-reference">
            <h5>Available Variables:</h5>
            <div className="variables-list">
              {variables.map((v) => (
                <div key={v.name} className="variable-item">
                  <code>{`{${v.name}}`}</code>
                  <span className="variable-desc">{v.description}</span>
                  <span className="variable-example">e.g., {v.example}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template List */}
      <div className="template-list">
        {templates.map((template) => (
          <div key={template.id} className="template-item">
            <div className="template-info">
              <h5>
                {template.name} {template.isDefault && <span className="badge-default">Default</span>}
              </h5>
              <code className="template-pattern">{template.template}</code>
              {template.description && <p className="template-desc">{template.description}</p>}
            </div>
            <div className="template-actions">
              {!template.isDefault && (
                <button onClick={() => handleSetDefault(template.id)} className="btn-sm">
                  Set as Default
                </button>
              )}
              <button
                onClick={() => handleDelete(template.id)}
                className="btn-sm btn-danger"
                disabled={template.isDefault}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
