import React, { useState, useEffect } from 'react';
import { SyncConflictResolver, SyncConflict, SyncHistory, ConflictResolutionStrategy } from '../utils/syncConflictResolver';
import { CVProfile } from '../types';
import { t, Lang } from '../i18n';

interface SyncConflictResolverProps {
  language: Lang;
}

export const SyncConflictResolverComponent: React.FC<SyncConflictResolverProps> = ({ language }) => {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [history, setHistory] = useState<SyncHistory[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'conflicts' | 'history'>('conflicts');
  const [comparisonView, setComparisonView] = useState<'side-by-side' | 'diff'>('side-by-side');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [conflictsList, historyList] = await Promise.all([
        SyncConflictResolver.getConflicts(),
        SyncConflictResolver.getHistory(),
      ]);
      setConflicts(conflictsList);
      setHistory(historyList);
    } catch (error) {
      console.error('Failed to load sync data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (conflictId: string, strategy: ConflictResolutionStrategy) => {
    setLoading(true);
    try {
      const conflict = conflicts.find((c) => c.id === conflictId);
      if (!conflict) return;

      let mergedData;
      if (strategy === 'merge') {
        // Perform smart merge
        mergedData = SyncConflictResolver.smartMerge(
          conflict.localVersion,
          conflict.remoteVersion
        );
      }

      await SyncConflictResolver.resolveConflict(conflictId, strategy, mergedData);
      
      alert(
        language === 'en'
          ? `Conflict resolved using ${strategy} strategy`
          : `Çakışma ${strategy} stratejisi kullanılarak çözüldü`
      );
      
      await loadData();
      setSelectedConflict(null);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      alert(language === 'en' ? 'Failed to resolve conflict' : 'Çakışma çözülemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (historyId: string) => {
    if (!confirm(language === 'en' ? 'Rollback to this version?' : 'Bu versiyona geri dönülsün mü?')) {
      return;
    }

    setLoading(true);
    try {
      await SyncConflictResolver.rollback(historyId);
      alert(language === 'en' ? 'Rollback successful' : 'Geri alma başarılı');
      await loadData();
    } catch (error) {
      console.error('Failed to rollback:', error);
      alert(language === 'en' ? 'Rollback failed' : 'Geri alma başarısız');
    } finally {
      setLoading(false);
    }
  };

  const renderConflictComparison = (conflict: SyncConflict) => {
    const { localVersion, remoteVersion } = conflict;

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>
            {language === 'en' ? 'Conflict Resolution' : 'Çakışma Çözümü'}: {localVersion.name}
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn btn-sm ${comparisonView === 'side-by-side' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setComparisonView('side-by-side')}
            >
              {language === 'en' ? 'Side by Side' : 'Yan Yana'}
            </button>
            <button
              className={`btn btn-sm ${comparisonView === 'diff' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setComparisonView('diff')}
            >
              {language === 'en' ? 'Differences' : 'Farklar'}
            </button>
          </div>
        </div>

        {comparisonView === 'side-by-side' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Local Version */}
            <div className="card">
              <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                <strong>{language === 'en' ? '🖥️ Local Version' : '🖥️ Yerel Versiyon'}</strong>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  {new Date(localVersion.updatedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ maxHeight: '400px', overflow: 'auto', fontSize: '13px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(localVersion.data, null, 2)}
                </pre>
              </div>
            </div>

            {/* Remote Version */}
            <div className="card">
              <div style={{ backgroundColor: 'var(--success-color)', color: 'white', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                <strong>{language === 'en' ? '☁️ Cloud Version' : '☁️ Bulut Versiyonu'}</strong>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  {new Date(remoteVersion.updatedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ maxHeight: '400px', overflow: 'auto', fontSize: '13px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(remoteVersion.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <h4>{language === 'en' ? 'Key Differences' : 'Ana Farklar'}</h4>
            <div style={{ marginTop: '15px' }}>
              {renderDifferences(localVersion, remoteVersion)}
            </div>
          </div>
        )}

        {/* Resolution Options */}
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <button
            className="btn btn-primary"
            onClick={() => handleResolve(conflict.id, 'keep-local')}
            disabled={loading}
            style={{ padding: '15px' }}
          >
            🖥️ {language === 'en' ? 'Keep Local' : 'Yerel Tutulacak'}
            <div style={{ fontSize: '11px', marginTop: '5px', opacity: 0.8 }}>
              {language === 'en' ? 'Use your local changes' : 'Yerel değişikliklerinizi kullan'}
            </div>
          </button>

          <button
            className="btn btn-success"
            onClick={() => handleResolve(conflict.id, 'keep-remote')}
            disabled={loading}
            style={{ padding: '15px' }}
          >
            ☁️ {language === 'en' ? 'Keep Cloud' : 'Bulut Tutulacak'}
            <div style={{ fontSize: '11px', marginTop: '5px', opacity: 0.8 }}>
              {language === 'en' ? 'Use cloud version' : 'Bulut versiyonunu kullan'}
            </div>
          </button>

          <button
            className="btn btn-info"
            onClick={() => handleResolve(conflict.id, 'merge')}
            disabled={loading}
            style={{ padding: '15px' }}
          >
            🔀 {language === 'en' ? 'Smart Merge' : 'Akıllı Birleştir'}
            <div style={{ fontSize: '11px', marginTop: '5px', opacity: 0.8 }}>
              {language === 'en' ? 'Combine both versions' : 'İki versiyonu birleştir'}
            </div>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setSelectedConflict(null)}
            disabled={loading}
            style={{ padding: '15px' }}
          >
            ❌ {language === 'en' ? 'Cancel' : 'İptal'}
          </button>
        </div>
      </div>
    );
  };

  const renderDifferences = (local: CVProfile, remote: CVProfile) => {
    const differences: string[] = [];

    // Compare personal info
    Object.keys(local.data.personalInfo).forEach((key) => {
      const localVal = (local.data.personalInfo as any)[key];
      const remoteVal = (remote.data.personalInfo as any)[key];
      if (localVal !== remoteVal) {
        differences.push(`Personal Info - ${key}: "${localVal}" ↔️ "${remoteVal}"`);
      }
    });

    // Compare array lengths
    if (local.data.skills.length !== remote.data.skills.length) {
      differences.push(`Skills: ${local.data.skills.length} items ↔️ ${remote.data.skills.length} items`);
    }
    if (local.data.experience.length !== remote.data.experience.length) {
      differences.push(`Experience: ${local.data.experience.length} items ↔️ ${remote.data.experience.length} items`);
    }
    if (local.data.education.length !== remote.data.education.length) {
      differences.push(`Education: ${local.data.education.length} items ↔️ ${remote.data.education.length} items`);
    }

    if (differences.length === 0) {
      return <div style={{ opacity: 0.7 }}>{language === 'en' ? 'No major differences detected' : 'Büyük fark tespit edilmedi'}</div>;
    }

    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {differences.map((diff, idx) => (
          <li key={idx} style={{ padding: '8px', backgroundColor: 'var(--bg-secondary)', marginBottom: '8px', borderRadius: '4px', fontSize: '13px' }}>
            {diff}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="section">
      <h2 className="section-title">
        🔄 {language === 'en' ? 'Sync Management' : 'Senkronizasyon Yönetimi'}
      </h2>

      {/* Tabs */}
      <div className="subtabs" style={{ marginBottom: '20px' }}>
        <button
          className={`subtab ${activeTab === 'conflicts' ? 'active' : ''}`}
          onClick={() => setActiveTab('conflicts')}
        >
          ⚠️ {language === 'en' ? 'Conflicts' : 'Çakışmalar'} ({conflicts.length})
        </button>
        <button
          className={`subtab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 {language === 'en' ? 'History' : 'Geçmiş'} ({history.length})
        </button>
      </div>

      {activeTab === 'conflicts' && (
        <>
          {selectedConflict ? (
            renderConflictComparison(selectedConflict)
          ) : (
            <>
              {conflicts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-text">
                    {language === 'en' ? 'No conflicts found' : 'Çakışma bulunamadı'}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {conflicts.map((conflict) => (
                    <div key={conflict.id} className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                            ⚠️ {conflict.localVersion.name}
                          </div>
                          <div style={{ fontSize: '13px', opacity: 0.7 }}>
                            {language === 'en' ? 'Detected:' : 'Tespit:'} {new Date(conflict.timestamp).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '12px', marginTop: '8px' }}>
                            <span style={{ marginRight: '15px' }}>
                              🖥️ {language === 'en' ? 'Local:' : 'Yerel:'} {new Date(conflict.localVersion.updatedAt).toLocaleString()}
                            </span>
                            <span>
                              ☁️ {language === 'en' ? 'Cloud:' : 'Bulut:'} {new Date(conflict.remoteVersion.updatedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => setSelectedConflict(conflict)}
                        >
                          {language === 'en' ? 'Resolve' : 'Çöz'} →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <div className="empty-state-text">
                {language === 'en' ? 'No sync history' : 'Senkronizasyon geçmişi yok'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.slice().reverse().map((entry) => (
                <div key={entry.id} className="card" style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '20px' }}>
                          {entry.action === 'sync' ? '🔄' : entry.action === 'conflict' ? '⚠️' : '↩️'}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>
                          {entry.action === 'sync' && (language === 'en' ? 'Sync' : 'Senkronizasyon')}
                          {entry.action === 'conflict' && (language === 'en' ? 'Conflict' : 'Çakışma')}
                          {entry.action === 'rollback' && (language === 'en' ? 'Rollback' : 'Geri Alma')}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '5px' }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px' }}>{entry.details}</div>
                    </div>
                    {entry.snapshot && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRollback(entry.id)}
                        disabled={loading}
                      >
                        ↩️ {language === 'en' ? 'Rollback' : 'Geri Al'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
