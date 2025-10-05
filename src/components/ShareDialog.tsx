import React, { useState } from 'react';
import { ShareOptions } from '../types';
import { GoogleDriveService } from '../utils/googleDriveService';

interface ShareDialogProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ fileId, fileName, onClose }) => {
  const [shareType, setShareType] = useState<'link' | 'email'>('link');
  const [role, setRole] = useState<'reader' | 'writer' | 'commenter'>('reader');
  const [recipients, setRecipients] = useState<string>('');
  const [message, setMessage] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCreateLink = async () => {
    setIsSharing(true);
    try {
      const link = await GoogleDriveService.createShareableLink(fileId, role);
      setShareLink(link);
      alert('✅ Shareable link created!');
    } catch (error: any) {
      alert(`❌ Failed to create link: ${error.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareViaEmail = async () => {
    const emailList = recipients
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e);

    if (emailList.length === 0) {
      alert('Please enter at least one email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      alert(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    setIsSharing(true);
    try {
      // Share with each recipient
      const results = await Promise.allSettled(
        emailList.map((email) => GoogleDriveService.shareFile(fileId, email, role))
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (failed === 0) {
        alert(`✅ File shared with ${successful} recipient(s)!`);
        onClose();
      } else {
        alert(
          `⚠️ Shared with ${successful} recipient(s), but ${failed} failed. Please check email addresses.`
        );
      }
    } catch (error: any) {
      alert(`❌ Failed to share: ${error.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="share-dialog-overlay">
      <div className="share-dialog">
        <div className="dialog-header">
          <h3>🔗 Share Document</h3>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <div className="dialog-content">
          <div className="file-info">
            <span className="file-icon">📄</span>
            <span className="file-name">{fileName}</span>
          </div>

          {/* Share Type Selection */}
          <div className="share-type-selector">
            <button
              className={`type-btn ${shareType === 'link' ? 'active' : ''}`}
              onClick={() => setShareType('link')}
            >
              🔗 Share Link
            </button>
            <button
              className={`type-btn ${shareType === 'email' ? 'active' : ''}`}
              onClick={() => setShareType('email')}
            >
              ✉️ Share via Email
            </button>
          </div>

          {/* Permission Selection */}
          <div className="permission-selector">
            <label>Permission Level:</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="reader">👁️ Viewer (can view)</option>
              <option value="commenter">💬 Commenter (can comment)</option>
              <option value="writer">✏️ Editor (can edit)</option>
            </select>
          </div>

          {/* Link Sharing */}
          {shareType === 'link' && (
            <div className="link-sharing">
              <p className="help-text">Create a shareable link that anyone can access</p>
              <button onClick={handleCreateLink} disabled={isSharing} className="btn-create-link">
                {isSharing ? 'Creating...' : '🔗 Create Shareable Link'}
              </button>

              {shareLink && (
                <div className="share-link-result">
                  <div className="link-box">
                    <input type="text" value={shareLink} readOnly className="link-input" />
                    <button onClick={handleCopyLink} className="btn-copy">
                      {copySuccess ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <p className="link-help">Share this link with anyone to give them access</p>
                </div>
              )}
            </div>
          )}

          {/* Email Sharing */}
          {shareType === 'email' && (
            <div className="email-sharing">
              <label>Recipient Email(s):</label>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="Enter email addresses (comma or space separated)&#10;example@email.com, another@email.com"
                className="recipients-input"
                rows={3}
              />

              <label>Message (Optional):</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                className="message-input"
                rows={3}
              />

              <button onClick={handleShareViaEmail} disabled={isSharing} className="btn-share">
                {isSharing ? 'Sharing...' : '📧 Share via Email'}
              </button>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button onClick={onClose} className="btn-cancel">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
