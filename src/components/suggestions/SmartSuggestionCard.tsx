import React from 'react';

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

interface SmartSuggestionCardProps {
  suggestion: SmartSuggestion;
  onAccept: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
  onDefer: (suggestionId: string) => void;
}

const SmartSuggestionCard: React.FC<SmartSuggestionCardProps> = ({
  suggestion,
  onAccept,
  onDismiss,
  onDefer
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'next_step': return '→';
      case 'improvement': return '↑';
      case 'completion': return '✓';
      case 'family_benefit': return '👨‍👩‍👧‍👦';
      default: return '•';
    }
  };
  
  return (
    <div className={`smart-suggestion-card border-2 rounded-lg p-4 mb-4 ${getPriorityColor(suggestion.priority)}`}>
      <div className="suggestion-header flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="type-icon text-2xl mr-3">{getTypeIcon(suggestion.type)}</span>
          <div>
            <h3 className="font-semibold text-lg">{suggestion.suggestion}</h3>
            <p className="text-sm text-gray-600">{suggestion.context}</p>
          </div>
        </div>
        <span className="time-estimate text-sm font-medium text-gray-500">
          {suggestion.timeEstimate}
        </span>
      </div>
      
      <div className="suggestion-details mb-4">
        <div className="reasoning mb-2">
          <p className="text-sm text-gray-700">
            <strong>Why this matters:</strong> {suggestion.reasoning}
          </p>
        </div>
        
        <div className="family-benefit">
          <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
            <strong>Family benefit:</strong> {suggestion.familyBenefit}
          </p>
        </div>
      </div>
      
      <div className="suggestion-actions flex gap-2">
        <button
          onClick={() => {
            suggestion.action();
            onAccept(suggestion.id);
          }}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Start Now
        </button>
        <button
          onClick={() => onDefer(suggestion.id)}
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
        >
          Remind Me Later
        </button>
        <button
          onClick={() => onDismiss(suggestion.id)}
          className="text-gray-500 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
          aria-label="Dismiss suggestion"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SmartSuggestionCard;
