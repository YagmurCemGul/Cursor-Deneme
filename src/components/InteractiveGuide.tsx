import React, { useState, useEffect } from 'react';
import { Lang } from '../i18n';

interface InteractiveGuideProps {
  language: Lang;
  onComplete?: () => void;
  onSkip?: () => void;
}

interface GuideStep {
  id: string;
  target?: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    url?: string;
    callback?: () => void;
  };
}

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({
  language,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [completed, setCompleted] = useState(false);

  const steps: Record<Lang, GuideStep[]> = {
    en: [
      {
        id: 'welcome',
        title: '👋 Welcome to Google Drive Setup!',
        content:
          'Let me guide you through setting up Google Drive integration. This will take about 5-10 minutes.',
        position: 'center',
        action: {
          label: "Let's Go!",
        },
      },
      {
        id: 'google-cloud',
        target: '.google-drive-settings',
        title: '☁️ Google Cloud Console',
        content:
          'First, you\'ll need to create a project in Google Cloud Console and enable the required APIs.',
        position: 'top',
        action: {
          label: 'Open Console',
          url: 'https://console.cloud.google.com/apis/credentials',
        },
      },
      {
        id: 'client-id',
        target: '.validation-section',
        title: '🔑 Get Your Client ID',
        content:
          'After creating your OAuth credentials in Google Cloud, copy your Client ID and paste it into manifest.json.',
        position: 'bottom',
      },
      {
        id: 'validation',
        target: '.validate-button',
        title: '✓ Validate Your Setup',
        content:
          'Use the automatic validation button to verify your Client ID is configured correctly. This will save you from authentication errors later!',
        position: 'top',
      },
      {
        id: 'authenticate',
        target: '.sign-in-button',
        title: '🔐 Sign In',
        content:
          'Once validation passes, click the Sign In button to connect your Google account.',
        position: 'bottom',
      },
      {
        id: 'export',
        target: '.export-section',
        title: '📄 Export Features',
        content:
          'You can now export your CV to Google Docs, Sheets, or Slides. Your files will appear in your Google Drive!',
        position: 'top',
      },
      {
        id: 'complete',
        title: '🎉 Setup Complete!',
        content:
          'You\'re all set! You can now use all Google Drive features. Need help? Check out our video tutorials and documentation.',
        position: 'center',
        action: {
          label: 'Finish',
        },
      },
    ],
    tr: [
      {
        id: 'welcome',
        title: '👋 Google Drive Kurulumuna Hoş Geldiniz!',
        content:
          'Google Drive entegrasyonunu kurmanıza yardımcı olacağım. Bu yaklaşık 5-10 dakika sürecek.',
        position: 'center',
        action: {
          label: 'Başlayalım!',
        },
      },
      {
        id: 'google-cloud',
        target: '.google-drive-settings',
        title: '☁️ Google Cloud Console',
        content:
          'Öncelikle Google Cloud Console\'da bir proje oluşturmanız ve gerekli API\'leri etkinleştirmeniz gerekiyor.',
        position: 'top',
        action: {
          label: 'Console\'u Aç',
          url: 'https://console.cloud.google.com/apis/credentials',
        },
      },
      {
        id: 'client-id',
        target: '.validation-section',
        title: '🔑 Client ID\'nizi Alın',
        content:
          'Google Cloud\'da OAuth kimlik bilgilerinizi oluşturduktan sonra, Client ID\'nizi kopyalayın ve manifest.json\'a yapıştırın.',
        position: 'bottom',
      },
      {
        id: 'validation',
        target: '.validate-button',
        title: '✓ Kurulumu Doğrulayın',
        content:
          'Client ID\'nizin doğru yapılandırıldığını doğrulamak için otomatik doğrulama düğmesini kullanın. Bu daha sonra kimlik doğrulama hatalarından kaçınmanızı sağlar!',
        position: 'top',
      },
      {
        id: 'authenticate',
        target: '.sign-in-button',
        title: '🔐 Giriş Yapın',
        content:
          'Doğrulama geçtikten sonra, Google hesabınızı bağlamak için Giriş Yap düğmesine tıklayın.',
        position: 'bottom',
      },
      {
        id: 'export',
        target: '.export-section',
        title: '📄 Dışa Aktarma Özellikleri',
        content:
          'Artık CV\'nizi Google Docs, Sheets veya Slides\'a aktarabilirsiniz. Dosyalarınız Google Drive\'ınızda görünecek!',
        position: 'top',
      },
      {
        id: 'complete',
        title: '🎉 Kurulum Tamamlandı!',
        content:
          'Hazırsınız! Artık tüm Google Drive özelliklerini kullanabilirsiniz. Yardıma mı ihtiyacınız var? Video eğitimlerimize ve belgelerimize göz atın.',
        position: 'center',
        action: {
          label: 'Bitir',
        },
      },
    ],
  };

  const getCurrentSteps = () => steps[language] || steps['en'];
  const currentStepData = getCurrentSteps()[currentStep];

  const handleNext = () => {
    if (currentStep < getCurrentSteps().length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    onSkip?.();
  };

  const handleComplete = () => {
    setCompleted(true);
    setIsActive(false);
    onComplete?.();
    // Save completion status to localStorage
    localStorage.setItem('googleDriveGuideCompleted', 'true');
  };

  const handleAction = () => {
    if (currentStepData.action?.url) {
      window.open(currentStepData.action.url, '_blank');
    }
    if (currentStepData.action?.callback) {
      currentStepData.action.callback();
    }
    handleNext();
  };

  // Check if user has already completed the guide
  useEffect(() => {
    const hasCompleted = localStorage.getItem('googleDriveGuideCompleted');
    if (hasCompleted) {
      setIsActive(false);
      setCompleted(true);
    }
  }, []);

  if (!isActive) {
    return (
      <button
        className="guide-trigger-button"
        onClick={() => {
          setIsActive(true);
          setCurrentStep(0);
        }}
      >
        📚 {language === 'en' ? 'Show Interactive Guide' : 'Etkileşimli Kılavuzu Göster'}
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="guide-overlay" />

      {/* Spotlight for targeted elements */}
      {currentStepData.target && (
        <div
          className="guide-spotlight"
          style={{
            /* Position calculation would happen here based on target element */
          }}
        />
      )}

      {/* Guide Tooltip */}
      <div
        className={`guide-tooltip guide-position-${currentStepData.position}`}
        style={{
          /* Position calculation would happen here based on step and target */
        }}
      >
        {/* Progress Indicator */}
        <div className="guide-progress">
          <div className="progress-dots">
            {getCurrentSteps().map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              />
            ))}
          </div>
          <span className="progress-text">
            {currentStep + 1} / {getCurrentSteps().length}
          </span>
        </div>

        {/* Content */}
        <div className="guide-content">
          <h3 className="guide-title">{currentStepData.title}</h3>
          <p className="guide-text">{currentStepData.content}</p>
        </div>

        {/* Actions */}
        <div className="guide-actions">
          <button className="btn btn-link btn-sm" onClick={handleSkip}>
            {language === 'en' ? 'Skip Tour' : 'Turu Atla'}
          </button>
          <div className="guide-navigation">
            {currentStep > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handlePrevious}>
                {language === 'en' ? '← Back' : '← Geri'}
              </button>
            )}
            {currentStepData.action ? (
              <button className="btn btn-primary btn-sm" onClick={handleAction}>
                {currentStepData.action.label}
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleNext}>
                {currentStep < getCurrentSteps().length - 1
                  ? language === 'en'
                    ? 'Next →'
                    : 'İleri →'
                  : language === 'en'
                    ? 'Finish'
                    : 'Bitir'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .guide-trigger-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 20px;
          background: #4285f4;
          color: white;
          border: none;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
          transition: all 0.2s ease;
          z-index: 9998;
        }

        .guide-trigger-button:hover {
          background: #3367d6;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(66, 133, 244, 0.4);
        }

        .guide-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .guide-spotlight {
          position: fixed;
          background: white;
          border-radius: 8px;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
          z-index: 10000;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .guide-tooltip {
          position: fixed;
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          z-index: 10001;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .guide-position-center {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .guide-position-top {
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
        }

        .guide-position-bottom {
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%);
        }

        .guide-position-left {
          top: 50%;
          left: 20%;
          transform: translateY(-50%);
        }

        .guide-position-right {
          top: 50%;
          right: 20%;
          transform: translateY(-50%);
        }

        .guide-progress {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .progress-dots {
          display: flex;
          gap: 8px;
        }

        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0e0e0;
          transition: all 0.2s ease;
        }

        .progress-dot.active {
          width: 24px;
          border-radius: 4px;
          background: #4285f4;
        }

        .progress-dot.completed {
          background: #34a853;
        }

        .progress-text {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .guide-content {
          margin-bottom: 20px;
        }

        .guide-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #202124;
        }

        .guide-text {
          font-size: 14px;
          line-height: 1.6;
          color: #5f6368;
        }

        .guide-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .guide-navigation {
          display: flex;
          gap: 10px;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }
      `}</style>
    </>
  );
};
