import React, { useState } from 'react';
import { FileParser } from '../utils/fileParser';
import { CVData } from '../types';
import { t, Lang } from '../i18n';

interface CVUploadProps {
  onCVParsed: (data: Partial<CVData>) => void;
  language: Lang;
}

export const CVUpload: React.FC<CVUploadProps> = ({ onCVParsed, language }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    
    try {
      const parsedData = await FileParser.parseFile(file);
      onCVParsed(parsedData);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert(t(language, 'upload.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        📄 {t(language, 'upload.section')}
      </h2>
      
      <div
        className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('cv-upload-input')?.click()}
      >
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p className="loading-text">{t(language, 'upload.uploading')}</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              {fileName ? `${t(language, 'upload.uploaded')}: ${fileName}` : t(language, 'upload.drag')}
            </div>
            <div className="upload-subtext">
              {t(language, 'upload.supported')}
            </div>
          </>
        )}
        
        <input
          id="cv-upload-input"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};
