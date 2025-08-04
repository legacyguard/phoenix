import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DocumentConfirmationProps {
  documentData: {
    id: string;
    category: string;
    confidence: number;
    extractedText: string;
    metadata: Record<string, unknown>;
    suggestedArea: string;
    areaConfidence: number;
    relationships: {
      linkedPossessionId?: string;
      linkedPersonId?: string;
      missingDocumentSuggestion?: string;
    };
  };
  categories: string[];
  possessions: {id: string;name: string;}[];
  people: {id: string;name: string;}[];
  onSave: (finalData: Record<string, unknown>) => void;
}

const DocumentConfirmation: React.FC<DocumentConfirmationProps> = ({
  documentData,
  categories,
  possessions,
  people,
  onSave
}) => {
  const { t } = useTranslation('common');
  
  // Local states for user edits
  const [category, setCategory] = useState(documentData.category);
  const [metadata, setMetadata] = useState(documentData.metadata);
  const [suggestedArea, setSuggestedArea] = useState(documentData.suggestedArea);
  const [linkedPossessionId, setLinkedPossessionId] = useState(documentData.relationships.linkedPossessionId || '');
  const [linkedPersonId, setLinkedPersonId] = useState(documentData.relationships.linkedPersonId || '');

  // Handle metadata change
  const handleMetadataChange = (key: string, value: unknown) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  // Format metadata field names for display
  const formatFieldName = (key: string): string => {
    return key.
    replace(/([A-Z])/g, ' $1').
    replace(/^./, (str) => str.toUpperCase()).
    trim();
  };

  return (
    <div className="document-confirmation">
      <h2>{t("documentConfirmation.confirm_document_details_1")}</h2>

      {/* Document Type Section */}
      <div className="section">
        <h3>{t("documentUploader.document_type_11")}</h3>
        <p>{t("documentConfirmation.we_detected_this_is_an_3")}<strong>{category}</strong>{t("documentConfirmation.is_that_correct_4")}</p>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) =>
          <option key={cat} value={cat}>{cat}</option>
          )}
        </select>
      </div>

      {/* Extracted Details Section */}
      <div className="section">
        <h3>{t("documentConfirmation.extracted_details_5")}</h3>
        {Object.keys(metadata).map((key) =>
        <div key={key} className="input-group">
            <label>{key}</label>
            <input
            type="text"
            value={String(metadata[key] || '')}
            onChange={(e) => handleMetadataChange(key, e.target.value)} />

          </div>
        )}
      </div>

      {/* Suggested Category Section */}
      <div className="section">
        <h3>{t("documentConfirmation.suggested_category_6")}</h3>
        <p>{t("documentConfirmation.we_suggest_filing_this_under_7")}<strong>{suggestedArea}</strong>.</p>
        <select value={suggestedArea} onChange={(e) => setSuggestedArea(e.target.value)}>
          {['home', 'savings', 'business', 'valuables', 'personal'].map((area) =>
          <option key={area} value={area}>{area}</option>
          )}
        </select>
      </div>

      {/* Detected Relationships Section */}
      <div className="section">
        <h3>{t("documentConfirmation.detected_relationships_8")}</h3>
        {linkedPossessionId &&
        <div className="relationship">
            <p>{t("documentConfirmation.linked_to_possession_9")}</p>
            <select value={linkedPossessionId} onChange={(e) => setLinkedPossessionId(e.target.value)}>
              <option value="">None</option>
              {possessions.map((possession) =>
            <option key={possession.id} value={possession.id}>{possession.name}</option>
            )}
            </select>
          </div>
        }
        {linkedPersonId &&
        <div className="relationship">
            <p>{t("documentConfirmation.linked_to_person_10")}</p>
            <select value={linkedPersonId} onChange={(e) => setLinkedPersonId(e.target.value)}>
              <option value="">None</option>
              {people.map((person) =>
            <option key={person.id} value={person.id}>{person.name}</option>
            )}
            </select>
          </div>
        }
        {documentData.relationships.missingDocumentSuggestion &&
        <div className="alert">
            {documentData.relationships.missingDocumentSuggestion}
          </div>
        }
      </div>

      {/* Save Button */}
      <button
        className="save-button"
        onClick={() => onSave({
          category,
          metadata,
          suggestedArea,
          linkedPossessionId,
          linkedPersonId
        })}>{t("documentUploadFlow.save_document_26")}


      </button>
    </div>);

};

export default DocumentConfirmation;