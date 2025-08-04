import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import SecurityStatus from './SecurityStatus';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeCard from './UpgradeCard';
import { useTranslation } from 'react-i18next';

interface DataFlowItem {
  collection: string;
  storage: string;
  processing: string;
  sharing: string;
}

interface AccessLogItem {
  id: string;
  date: string;
  action: string;
  details: string;
  actor: string;
}

interface TransparencyData {
  dataFlow: DataFlowItem;
  accessLog: AccessLogItem[];
  privacyMode: 'local' | 'cloud';
}

const DataTransparency: React.FC = () => {
  const { t } = useTranslation('common');
  const { getToken } = useAuth();
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const [data, setData] = useState<TransparencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransparencyData = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/transparency', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(t('dataTransparency.loadingError'));
        }

        const transparencyData = await response.json();
        setData(transparencyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('dataTransparency.loadingError'));
        console.error('Error fetching transparency data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransparencyData();
  }, [getToken, t]);

  if (loading) {
    return (
      <div className="p-6 font-sans flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t('dataTransparency.loadingMessage')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 font-sans">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{t('dataTransparency.loadingError')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-12">
      <SecurityStatus />
      
      <div className="p-6 font-sans">
        <h2 className="text-2xl font-bold text-gray-800">{t('dataTransparency.title')}</h2>
        <p className="text-gray-600 mt-1">{t('dataTransparency.description')}</p>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">{t('dataTransparency.dataFlow.whereDataLives')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <span className="text-2xl">📥</span>
              <h4 className="font-bold mt-2">{t('dataTransparency.dataFlow.collection')}</h4>
              <p className="text-sm text-gray-600">{data.dataFlow.collection}</p>
            </div>
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <span className="text-2xl">💾</span>
              <h4 className="font-bold mt-2">{t('dataTransparency.dataFlow.storage')}</h4>
              <p className="text-sm text-gray-600">{data.dataFlow.storage}</p>
            </div>
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <span className="text-2xl">⚙️</span>
              <h4 className="font-bold mt-2">{t('dataTransparency.dataFlow.processing')}</h4>
              <p className="text-sm text-gray-600">{data.dataFlow.processing}</p>
            </div>
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <span className="text-2xl">🔗</span>
              <h4 className="font-bold mt-2">{t('dataTransparency.dataFlow.sharing')}</h4>
              <p className="text-sm text-gray-600">{data.dataFlow.sharing}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">{t('dataTransparency.recentActivity.title')}</h3>
          <div className="p-4 border rounded-lg bg-white mt-4">
            <ul className="divide-y">
              {(() => {
                let logsToShow = data.accessLog;
                if (!isPremium && !subscriptionLoading) {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  logsToShow = data.accessLog.filter(log => 
                    new Date(log.date) >= thirtyDaysAgo
                  );
                }
                
                return logsToShow.map((log) => (
                  <li key={log.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-800">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {log.actor} • {new Date(log.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ));
              })()}
            </ul>
            
            {!isPremium && !subscriptionLoading && (
              <div className="mt-6">
                <UpgradeCard 
                  title={t('dataTransparency.recentActivity.premiumTitle')}
                  text={t('dataTransparency.recentActivity.premiumText')}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">{t('dataTransparency.dataOwnership.title')}</h3>
          <div className="p-4 border rounded-lg bg-white mt-4">
            <p className="text-sm text-gray-600 mb-4">{t('dataTransparency.dataOwnership.description')}</p>
            <button className="w-full md:w-auto px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700">
              {t('dataTransparency.dataOwnership.downloadButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTransparency;
