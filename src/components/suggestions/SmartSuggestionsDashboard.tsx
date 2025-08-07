import React, { useState, useEffect } from 'react';
import SmartSuggestionCard from './SmartSuggestionCard';
import { 
  generateSmartSuggestions, 
  trackSuggestionResponse,
  categorizeSuggestionsByTime 
} from '@/services/smartSuggestions';

interface SmartSuggestion {
  id: string;
  type: 'next_step' | 'improvement' | 'completion' | 'family_benefit';
  priority: 'high' | 'medium' | 'low';
  context: string;
  suggestion: string;
  reasoning: string;
  familyBenefit: string;
  timeEstimate: string;
  action: () => void;
}

interface SmartSuggestionsDashboardProps {
  userProfile: any;
  userProgress: any;
  behaviorPatterns: any[];
}

const SmartSuggestionsDashboard: React.FC<SmartSuggestionsDashboardProps> = ({
  userProfile,
  userProgress,
  behaviorPatterns
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [deferredSuggestions, setDeferredSuggestions] = useState<Map<string, Date>>(new Map());
  const [viewMode, setViewMode] = useState<'priority' | 'time'>('priority');
  
  useEffect(() => {
    // Generate suggestions based on user data
    const allSuggestions = generateSmartSuggestions(userProfile, userProgress, behaviorPatterns);
    
    // Filter out dismissed suggestions
    const activeSuggestions = allSuggestions.filter(s => !dismissedSuggestions.has(s.id));
    
    // Filter out deferred suggestions that aren't ready to show again
    const now = new Date();
    const readySuggestions = activeSuggestions.filter(s => {
      const deferredUntil = deferredSuggestions.get(s.id);
      return !deferredUntil || deferredUntil <= now;
    });
    
    setSuggestions(readySuggestions);
  }, [userProfile, userProgress, behaviorPatterns, dismissedSuggestions, deferredSuggestions]);
  
  const handleAccept = (suggestionId: string) => {
    trackSuggestionResponse({
      suggestionId,
      action: 'accepted',
      timestamp: new Date()
    });
    
    // Remove from current suggestions
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };
  
  const handleDismiss = (suggestionId: string) => {
    trackSuggestionResponse({
      suggestionId,
      action: 'dismissed',
      timestamp: new Date()
    });
    
    // Add to dismissed set
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };
  
  const handleDefer = (suggestionId: string) => {
    trackSuggestionResponse({
      suggestionId,
      action: 'deferred',
      timestamp: new Date()
    });
    
    // Defer for 7 days
    const deferUntil = new Date();
    deferUntil.setDate(deferUntil.getDate() + 7);
    setDeferredSuggestions(prev => new Map(prev).set(suggestionId, deferUntil));
    
    // Remove from current suggestions
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };
  
  const categorizedSuggestions = categorizeSuggestionsByTime(suggestions);
  
  return (
    <div className="smart-suggestions-dashboard">
      <div className="dashboard-header mb-6">
        <h2 className="text-2xl font-bold mb-2">Personalized Recommendations</h2>
        <p className="text-gray-600">
          Based on your family situation and what you've already documented
        </p>
      </div>
      
      {suggestions.length === 0 ? (
        <div className="no-suggestions text-center py-8">
          <p className="text-gray-500">
            No new recommendations at this time. You're doing great!
          </p>
        </div>
      ) : (
        <>
          <div className="view-toggle mb-4">
            <button
              onClick={() => setViewMode('priority')}
              className={`mr-2 px-4 py-2 rounded ${
                viewMode === 'priority' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              By Priority
            </button>
            <button
              onClick={() => setViewMode('time')}
              className={`px-4 py-2 rounded ${
                viewMode === 'time' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              By Time Needed
            </button>
          </div>
          
          {viewMode === 'priority' ? (
            <div className="suggestions-by-priority">
              {suggestions.map(suggestion => (
                <SmartSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={handleAccept}
                  onDismiss={handleDismiss}
                  onDefer={handleDefer}
                />
              ))}
            </div>
          ) : (
            <div className="suggestions-by-time">
              {categorizedSuggestions.quickWins.length > 0 && (
                <div className="time-category mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Quick Wins (5-10 minutes)
                  </h3>
                  {categorizedSuggestions.quickWins.map(suggestion => (
                    <SmartSuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAccept={handleAccept}
                      onDismiss={handleDismiss}
                      onDefer={handleDefer}
                    />
                  ))}
                </div>
              )}
              
              {categorizedSuggestions.highImpact.length > 0 && (
                <div className="time-category mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    High Impact (15-30 minutes)
                  </h3>
                  {categorizedSuggestions.highImpact.map(suggestion => (
                    <SmartSuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAccept={handleAccept}
                      onDismiss={handleDismiss}
                      onDefer={handleDefer}
                    />
                  ))}
                </div>
              )}
              
              {categorizedSuggestions.comprehensive.length > 0 && (
                <div className="time-category mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Comprehensive Planning (45+ minutes)
                  </h3>
                  {categorizedSuggestions.comprehensive.map(suggestion => (
                    <SmartSuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAccept={handleAccept}
                      onDismiss={handleDismiss}
                      onDefer={handleDefer}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SmartSuggestionsDashboard;
