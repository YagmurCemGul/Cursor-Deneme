import React, { useState } from 'react';
import { Lang } from '../i18n';

interface VideoTutorialProps {
  language: Lang;
}

interface TutorialChapter {
  id: string;
  title: string;
  timestamp: string;
  duration: string;
  description: string;
}

export const VideoTutorial: React.FC<VideoTutorialProps> = ({ language }) => {
  const [selectedChapter, setSelectedChapter] = useState<string>('intro');

  const chapters: Record<Lang, TutorialChapter[]> = {
    en: [
      {
        id: 'intro',
        title: 'Introduction',
        timestamp: '0:00',
        duration: '2:30',
        description: 'Overview of Google Drive integration and prerequisites',
      },
      {
        id: 'cloud-project',
        title: 'Create Google Cloud Project',
        timestamp: '2:30',
        duration: '2:30',
        description: 'Step-by-step guide to creating your Google Cloud project',
      },
      {
        id: 'enable-apis',
        title: 'Enable Required APIs',
        timestamp: '5:00',
        duration: '3:00',
        description: 'How to enable Drive, Docs, Sheets, and Slides APIs',
      },
      {
        id: 'oauth-setup',
        title: 'OAuth Consent Screen',
        timestamp: '8:00',
        duration: '3:00',
        description: 'Configuring the OAuth consent screen and test users',
      },
      {
        id: 'client-id',
        title: 'Create Client ID',
        timestamp: '11:00',
        duration: '2:00',
        description: 'Creating and configuring OAuth 2.0 Client ID',
      },
      {
        id: 'manifest',
        title: 'Configure Extension',
        timestamp: '13:00',
        duration: '1:30',
        description: 'Adding Client ID to manifest.json',
      },
      {
        id: 'validation',
        title: 'Validate Setup',
        timestamp: '14:30',
        duration: '1:30',
        description: 'Using automatic Client ID validation',
      },
      {
        id: 'testing',
        title: 'Test Integration',
        timestamp: '16:00',
        duration: '2:00',
        description: 'Testing authentication and export features',
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        timestamp: '18:00',
        duration: '2:00',
        description: 'Common issues and solutions',
      },
    ],
    tr: [
      {
        id: 'intro',
        title: 'Giriş',
        timestamp: '0:00',
        duration: '2:30',
        description: 'Google Drive entegrasyonuna genel bakış ve ön koşullar',
      },
      {
        id: 'cloud-project',
        title: 'Google Cloud Projesi Oluşturma',
        timestamp: '2:30',
        duration: '2:30',
        description: 'Google Cloud projenizi oluşturma adım adım kılavuz',
      },
      {
        id: 'enable-apis',
        title: 'Gerekli API\'leri Etkinleştirme',
        timestamp: '5:00',
        duration: '3:00',
        description: 'Drive, Docs, Sheets ve Slides API\'lerini etkinleştirme',
      },
      {
        id: 'oauth-setup',
        title: 'OAuth İzin Ekranı',
        timestamp: '8:00',
        duration: '3:00',
        description: 'OAuth izin ekranını ve test kullanıcılarını yapılandırma',
      },
      {
        id: 'client-id',
        title: 'Client ID Oluşturma',
        timestamp: '11:00',
        duration: '2:00',
        description: 'OAuth 2.0 Client ID oluşturma ve yapılandırma',
      },
      {
        id: 'manifest',
        title: 'Uzantıyı Yapılandırma',
        timestamp: '13:00',
        duration: '1:30',
        description: 'Client ID\'yi manifest.json\'a ekleme',
      },
      {
        id: 'validation',
        title: 'Kurulumu Doğrulama',
        timestamp: '14:30',
        duration: '1:30',
        description: 'Otomatik Client ID doğrulamasını kullanma',
      },
      {
        id: 'testing',
        title: 'Entegrasyonu Test Etme',
        timestamp: '16:00',
        duration: '2:00',
        description: 'Kimlik doğrulama ve dışa aktarma özelliklerini test etme',
      },
      {
        id: 'troubleshooting',
        title: 'Sorun Giderme',
        timestamp: '18:00',
        duration: '2:00',
        description: 'Yaygın sorunlar ve çözümler',
      },
    ],
  };

  const getCurrentChapters = () => chapters[language] || chapters['en'];

  return (
    <div className="video-tutorial-container">
      <div className="tutorial-header">
        <h2 className="tutorial-title">📹 Video Setup Tutorial</h2>
        <p className="tutorial-subtitle">
          Watch our comprehensive guide to setting up Google Drive integration
        </p>
      </div>

      <div className="tutorial-layout">
        {/* Video Player */}
        <div className="video-player">
          <div className="video-placeholder">
            <div className="video-icon">▶️</div>
            <h3>Coming Soon!</h3>
            <p>Video tutorial will be uploaded to YouTube and embedded here.</p>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              For now, please refer to our detailed written guide.
            </p>
            <a
              href="VIDEO_SETUP_GUIDE.md"
              target="_blank"
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
            >
              📖 View Written Guide
            </a>
          </div>
          {/* Future: YouTube embed
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            title="Google Drive Setup Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          */}
        </div>

        {/* Chapter Navigation */}
        <div className="chapter-list">
          <h3 className="chapter-list-title">📑 Chapters</h3>
          {getCurrentChapters().map((chapter) => (
            <div
              key={chapter.id}
              className={`chapter-item ${selectedChapter === chapter.id ? 'active' : ''}`}
              onClick={() => setSelectedChapter(chapter.id)}
            >
              <div className="chapter-header">
                <span className="chapter-number">{chapter.timestamp}</span>
                <span className="chapter-duration">⏱ {chapter.duration}</span>
              </div>
              <h4 className="chapter-title">{chapter.title}</h4>
              <p className="chapter-description">{chapter.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <h3 className="quick-links-title">🔗 Quick Links</h3>
        <div className="links-grid">
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="link-card"
          >
            <span className="link-icon">☁️</span>
            <div>
              <h4>Google Cloud Console</h4>
              <p>Create and manage credentials</p>
            </div>
          </a>
          <a
            href="VIDEO_SETUP_GUIDE.md"
            target="_blank"
            className="link-card"
          >
            <span className="link-icon">📖</span>
            <div>
              <h4>Written Guide</h4>
              <p>Detailed step-by-step instructions</p>
            </div>
          </a>
          <a
            href="GOOGLE_DRIVE_INTEGRATION.md"
            target="_blank"
            className="link-card"
          >
            <span className="link-icon">📚</span>
            <div>
              <h4>Integration Docs</h4>
              <p>Complete documentation</p>
            </div>
          </a>
          <a
            href="TROUBLESHOOTING.md"
            target="_blank"
            className="link-card"
          >
            <span className="link-icon">🔧</span>
            <div>
              <h4>Troubleshooting</h4>
              <p>Common issues and solutions</p>
            </div>
          </a>
        </div>
      </div>

      <style>{`
        .video-tutorial-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .tutorial-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .tutorial-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .tutorial-subtitle {
          color: #666;
          font-size: 16px;
        }

        .tutorial-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        @media (max-width: 768px) {
          .tutorial-layout {
            grid-template-columns: 1fr;
          }
        }

        .video-player {
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16 / 9;
        }

        .video-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          text-align: center;
        }

        .video-icon {
          font-size: 80px;
          margin-bottom: 20px;
          opacity: 0.9;
        }

        .video-placeholder h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .video-placeholder p {
          font-size: 16px;
          opacity: 0.9;
        }

        .chapter-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          max-height: 600px;
          overflow-y: auto;
        }

        .chapter-list-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .chapter-item {
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .chapter-item:hover {
          background: #f9f9f9;
        }

        .chapter-item.active {
          background: #e3f2fd;
          border-color: #2196f3;
        }

        .chapter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .chapter-number {
          font-weight: bold;
          color: #2196f3;
        }

        .chapter-duration {
          font-size: 12px;
          color: #666;
        }

        .chapter-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .chapter-description {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }

        .quick-links {
          background: white;
          border-radius: 12px;
          padding: 30px;
        }

        .quick-links-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .link-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }

        .link-card:hover {
          background: #e3f2fd;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .link-icon {
          font-size: 32px;
        }

        .link-card h4 {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .link-card p {
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
};
