import React, { useState } from 'react';
import { t, Lang } from '../i18n';
import {
  CoverLetterLanguage,
  IndustryType,
  ToneType,
  CompanyCulture,
  CompanyResearch,
  CoverLetterOptions,
} from '../utils/advancedCoverLetterService';

interface AdvancedCoverLetterSettingsProps {
  language: Lang;
  options: CoverLetterOptions;
  onOptionsChange: (options: CoverLetterOptions) => void;
  onClose: () => void;
}

export const AdvancedCoverLetterSettings: React.FC<AdvancedCoverLetterSettingsProps> = ({
  language,
  options,
  onOptionsChange,
  onClose,
}) => {
  const [localOptions, setLocalOptions] = useState<CoverLetterOptions>(options);
  const [showCompanyResearch, setShowCompanyResearch] = useState(!!options.companyResearch);

  const handleSave = () => {
    onOptionsChange(localOptions);
    onClose();
  };

  const updateCompanyResearch = (field: keyof CompanyResearch, value: any) => {
    setLocalOptions({
      ...localOptions,
      companyResearch: {
        ...(localOptions.companyResearch || { name: '' }),
        [field]: value,
      },
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ {t(language, 'advancedCoverLetter.title')}</h2>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Language Selection */}
          <div className="form-group">
            <label className="form-label">
              🌍 {t(language, 'advancedCoverLetter.language')}
            </label>
            <select
              className="form-select"
              value={localOptions.language}
              onChange={(e) =>
                setLocalOptions({ ...localOptions, language: e.target.value as CoverLetterLanguage })
              }
            >
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
              <option value="it">Italiano</option>
              <option value="nl">Nederlands</option>
              <option value="pl">Polski</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="ko">한국어</option>
            </select>
          </div>

          {/* Industry Selection */}
          <div className="form-group">
            <label className="form-label">
              🏢 {t(language, 'advancedCoverLetter.industry')}
            </label>
            <select
              className="form-select"
              value={localOptions.industry || 'general'}
              onChange={(e) =>
                setLocalOptions({ ...localOptions, industry: e.target.value as IndustryType })
              }
            >
              <option value="general">{t(language, 'advancedCoverLetter.industryGeneral')}</option>
              <option value="technology">{t(language, 'advancedCoverLetter.industryTechnology')}</option>
              <option value="finance">{t(language, 'advancedCoverLetter.industryFinance')}</option>
              <option value="healthcare">{t(language, 'advancedCoverLetter.industryHealthcare')}</option>
              <option value="education">{t(language, 'advancedCoverLetter.industryEducation')}</option>
              <option value="marketing">{t(language, 'advancedCoverLetter.industryMarketing')}</option>
              <option value="consulting">{t(language, 'advancedCoverLetter.industryConsulting')}</option>
              <option value="manufacturing">{t(language, 'advancedCoverLetter.industryManufacturing')}</option>
              <option value="retail">{t(language, 'advancedCoverLetter.industryRetail')}</option>
              <option value="hospitality">{t(language, 'advancedCoverLetter.industryHospitality')}</option>
              <option value="legal">{t(language, 'advancedCoverLetter.industryLegal')}</option>
              <option value="nonprofit">{t(language, 'advancedCoverLetter.industryNonprofit')}</option>
              <option value="government">{t(language, 'advancedCoverLetter.industryGovernment')}</option>
              <option value="media">{t(language, 'advancedCoverLetter.industryMedia')}</option>
              <option value="real-estate">{t(language, 'advancedCoverLetter.industryRealEstate')}</option>
              <option value="automotive">{t(language, 'advancedCoverLetter.industryAutomotive')}</option>
            </select>
          </div>

          {/* Tone Selection */}
          <div className="form-group">
            <label className="form-label">
              💬 {t(language, 'advancedCoverLetter.tone')}
            </label>
            <select
              className="form-select"
              value={localOptions.tone || 'professional'}
              onChange={(e) =>
                setLocalOptions({ ...localOptions, tone: e.target.value as ToneType })
              }
            >
              <option value="formal">{t(language, 'advancedCoverLetter.toneFormal')}</option>
              <option value="professional">{t(language, 'advancedCoverLetter.toneProfessional')}</option>
              <option value="friendly">{t(language, 'advancedCoverLetter.toneFriendly')}</option>
              <option value="enthusiastic">{t(language, 'advancedCoverLetter.toneEnthusiastic')}</option>
              <option value="conservative">{t(language, 'advancedCoverLetter.toneConservative')}</option>
              <option value="innovative">{t(language, 'advancedCoverLetter.toneInnovative')}</option>
              <option value="academic">{t(language, 'advancedCoverLetter.toneAcademic')}</option>
            </select>
          </div>

          {/* Options */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={localOptions.emphasizeQuantification !== false}
                onChange={(e) =>
                  setLocalOptions({
                    ...localOptions,
                    emphasizeQuantification: e.target.checked,
                  })
                }
              />
              📊 {t(language, 'advancedCoverLetter.emphasizeQuantification')}
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={localOptions.includeCallToAction !== false}
                onChange={(e) =>
                  setLocalOptions({
                    ...localOptions,
                    includeCallToAction: e.target.checked,
                  })
                }
              />
              📞 {t(language, 'advancedCoverLetter.includeCallToAction')}
            </label>
          </div>

          {/* Max Length */}
          <div className="form-group">
            <label className="form-label">
              📏 {t(language, 'advancedCoverLetter.maxLength')}
            </label>
            <input
              type="number"
              className="form-input"
              value={localOptions.maxLength || 350}
              onChange={(e) =>
                setLocalOptions({ ...localOptions, maxLength: parseInt(e.target.value) || 350 })
              }
              min="200"
              max="600"
            />
            <small className="form-hint">
              {t(language, 'advancedCoverLetter.maxLengthHint')}
            </small>
          </div>

          {/* Company Research Section */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showCompanyResearch}
                onChange={(e) => setShowCompanyResearch(e.target.checked)}
              />
              🔍 {t(language, 'advancedCoverLetter.addCompanyResearch')}
            </label>
          </div>

          {showCompanyResearch && (
            <div className="company-research-section">
              <h3 className="subsection-title">
                {t(language, 'advancedCoverLetter.companyResearchTitle')}
              </h3>

              <div className="form-group">
                <label className="form-label">
                  {t(language, 'advancedCoverLetter.companyName')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={localOptions.companyResearch?.name || ''}
                  onChange={(e) => updateCompanyResearch('name', e.target.value)}
                  placeholder={t(language, 'advancedCoverLetter.companyNamePlaceholder')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t(language, 'advancedCoverLetter.companyIndustry')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={localOptions.companyResearch?.industry || ''}
                  onChange={(e) => updateCompanyResearch('industry', e.target.value)}
                  placeholder={t(language, 'advancedCoverLetter.companyIndustryPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t(language, 'advancedCoverLetter.companySize')}
                </label>
                <select
                  className="form-select"
                  value={localOptions.companyResearch?.size || ''}
                  onChange={(e) =>
                    updateCompanyResearch(
                      'size',
                      e.target.value as 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
                    )
                  }
                >
                  <option value="">{t(language, 'advancedCoverLetter.companySizeSelect')}</option>
                  <option value="startup">{t(language, 'advancedCoverLetter.companySizeStartup')}</option>
                  <option value="small">{t(language, 'advancedCoverLetter.companySizeSmall')}</option>
                  <option value="medium">{t(language, 'advancedCoverLetter.companySizeMedium')}</option>
                  <option value="large">{t(language, 'advancedCoverLetter.companySizeLarge')}</option>
                  <option value="enterprise">{t(language, 'advancedCoverLetter.companySizeEnterprise')}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t(language, 'advancedCoverLetter.companyCulture')}
                </label>
                <select
                  className="form-select"
                  value={localOptions.companyResearch?.culture || ''}
                  onChange={(e) =>
                    updateCompanyResearch('culture', e.target.value as CompanyCulture)
                  }
                >
                  <option value="">{t(language, 'advancedCoverLetter.companyCultureSelect')}</option>
                  <option value="corporate">{t(language, 'advancedCoverLetter.companyCultureCorporate')}</option>
                  <option value="startup">{t(language, 'advancedCoverLetter.companyCultureStartup')}</option>
                  <option value="creative">{t(language, 'advancedCoverLetter.companyCultureCreative')}</option>
                  <option value="traditional">{t(language, 'advancedCoverLetter.companyCultureTraditional')}</option>
                  <option value="innovative">{t(language, 'advancedCoverLetter.companyCultureInnovative')}</option>
                  <option value="casual">{t(language, 'advancedCoverLetter.companyCultureCasual')}</option>
                  <option value="remote-first">{t(language, 'advancedCoverLetter.companyCultureRemote')}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t(language, 'advancedCoverLetter.companyValues')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={localOptions.companyResearch?.values?.join(', ') || ''}
                  onChange={(e) =>
                    updateCompanyResearch(
                      'values',
                      e.target.value.split(',').map((v) => v.trim())
                    )
                  }
                  placeholder={t(language, 'advancedCoverLetter.companyValuesPlaceholder')}
                />
                <small className="form-hint">
                  {t(language, 'advancedCoverLetter.companyValuesHint')}
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t(language, 'advancedCoverLetter.companyProducts')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={localOptions.companyResearch?.products?.join(', ') || ''}
                  onChange={(e) =>
                    updateCompanyResearch(
                      'products',
                      e.target.value.split(',').map((v) => v.trim())
                    )
                  }
                  placeholder={t(language, 'advancedCoverLetter.companyProductsPlaceholder')}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t(language, 'common.cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            💾 {t(language, 'common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
