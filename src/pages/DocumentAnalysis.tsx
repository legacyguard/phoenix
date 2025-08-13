import React, { useEffect, useRef, useState } from "react";
import { DocumentAIService, type AIAnalysisResult } from "@/services/DocumentAIService";
import { VaultService } from "@/services/VaultService";
import { DocumentMetadataService } from "@/services/DocumentMetadataService";
import { PreferencesService } from "@/services/PreferencesService";
import { isWithinQuietHours } from "@/utils/quietHours";
import Toast from "@/components/Toast";
import { HeartbeatService } from "@/services/HeartbeatService";

const DocumentAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });
  const toastTimer = useRef<number | null>(null);

  function showGentleToast(text: string) {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast({ visible: true, message: text });
    toastTimer.current = window.setTimeout(() => {
      setToast({ visible: false, message: "" });
      toastTimer.current = null;
    }, 2500);
  }

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    const result = await DocumentAIService.analyzeDocument(file);
    setAnalysisResult(result);
    setLoading(false);
  };

  useEffect(() => {
    async function fetchDocs() {
      const docs = await VaultService.listDocuments();
      setDocuments(docs.map((doc) => ({ id: doc.id, name: doc.name })));
    }
    fetchDocs();
  }, []);

  return (
    <div>
      <h1>AI Document Analysis</h1>
      <div style={{ marginBottom: 12 }}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleAnalyze} disabled={!file || loading} style={{ marginLeft: 8 }}>
          {loading ? "Analyzujem…" : "Analyze"}
        </button>
      </div>

      {analysisResult && (
        <div style={{ marginTop: 16 }}>
          <h2>Výsledok</h2>
          <p>
            Typ: <strong>{analysisResult.type}</strong> | Dôvera: {Math.round(analysisResult.confidence * 100)}%
          </p>
          <div>
            <h3>Extrahované údaje</h3>
            <ul>
              {analysisResult.extractedData.contractNumber && (
                <li>Číslo zmluvy: {analysisResult.extractedData.contractNumber}</li>
              )}
              {analysisResult.extractedData.expirationDate && (
                <li>Expirácia: {analysisResult.extractedData.expirationDate}</li>
              )}
              {typeof analysisResult.extractedData.amount === "number" && (
                <li>Suma: {analysisResult.extractedData.amount}</li>
              )}
              {analysisResult.extractedData.issuer && (
                <li>Vydavateľ: {analysisResult.extractedData.issuer}</li>
              )}
              {Array.isArray(analysisResult.extractedData.beneficiaries) && (
                <li>Beneficienti: {analysisResult.extractedData.beneficiaries.join(", ")}</li>
              )}
            </ul>
          </div>
          <div>
            <h3>Navrhované akcie</h3>
            <ul>
              {analysisResult.suggestedActions.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Vyberte dokument, do ktorého chcete uložiť metadáta:</label>
            <br />
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              style={{ minWidth: 240 }}
            >
              <option value="">-- vyberte --</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!selectedDocId || !analysisResult) return;
                const meta = (DocumentMetadataService.getMetadata(selectedDocId) as any) || {};
                const newMeta = { ...meta, ...analysisResult.extractedData };
                DocumentMetadataService.saveMetadata(selectedDocId, newMeta);
                const prefs = PreferencesService.get();
                const quiet = prefs.quietHoursEnabled && isWithinQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd);
                if (prefs.metadataToastsEnabled && !quiet) {
                  showGentleToast("Metadáta boli uložené.");
                } else {
                  setSaveMessage("Metadáta boli uložené.");
                  setTimeout(() => setSaveMessage(null), 3000);
                }
                HeartbeatService.touch('web');
              }}
              disabled={!selectedDocId}
              style={{ marginLeft: 8 }}
            >
              Save to Metadata
            </button>
            {saveMessage && <p style={{ color: "green" }}>{saveMessage}</p>}
          </div>
        </div>
      )}
      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={() => setToast({ visible: false, message: "" })}
      />
    </div>
  );
};

export default DocumentAnalysis;


