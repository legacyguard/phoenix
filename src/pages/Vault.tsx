import React, { useEffect, useRef, useState } from "react";
import { VaultService } from "@/services/VaultService";
import { DocumentMetadataService } from "@/services/DocumentMetadataService";
import { PreferencesService } from "@/services/PreferencesService";
import { isWithinQuietHours } from "@/utils/quietHours";
import { HeartbeatService } from "@/services/HeartbeatService";
import Toast from "@/components/Toast";

type DocumentItem = { id: string; name: string; createdAt: Date };
type Metadata = Record<string, string>;

const Vault: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [metadataForm, setMetadataForm] = useState<Metadata>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const list = await VaultService.listDocuments();
        if (isActive) setDocuments(list);
      } catch (e) {
        if (isActive) setDocuments([]);
      }
    })();
    return () => {
      isActive = false;
    };
  }, []);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploaded = await VaultService.uploadDocument(file);
      setDocuments((prev) => (prev ? [uploaded, ...prev] : [uploaded]));
      setEditingDocId(uploaded.id);
      setMetadataForm({
        title: "",
        contractNumber: "",
        issuer: "",
        expirationDate: "",
        contactName: "",
        contactPhone: "",
      });
      setFormErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      // keep UI minimal as requested
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await VaultService.deleteDocument(id);
      setDocuments((prev) => (prev ? prev.filter((d) => d.id !== id) : prev));
      DocumentMetadataService.deleteMetadata(id);
    } catch (e) {
      // keep UI minimal as requested
    }
  };

  const handleEdit = (docId: string) => {
    const existing =
      DocumentMetadataService.getMetadata(docId) || {
        title: "",
        contractNumber: "",
        issuer: "",
        expirationDate: "",
        contactName: "",
        contactPhone: "",
      };
    setEditingDocId(docId);
    setMetadataForm(existing);
    setFormErrors({});
  };

  const handleSaveMetadata = () => {
    if (!editingDocId) return;
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!metadataForm.title?.trim()) errors.title = "Povinné";
    if (!metadataForm.contractNumber?.trim()) errors.contractNumber = "Povinné";
    if (!metadataForm.expirationDate?.trim()) errors.expirationDate = "Povinné";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    DocumentMetadataService.saveMetadata(editingDocId, metadataForm);
    setEditingDocId(null);
    const prefs = PreferencesService.get();
    const quiet = prefs.quietHoursEnabled && isWithinQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd);
    if (prefs.metadataToastsEnabled && !quiet) {
      showGentleToast("Údaje k dokumentu sú uložené.");
    }
    HeartbeatService.touch('web');
  };

  if (documents === null) return <div>Loading…</div>;

  return (
    <div>
      <h1>Vault</h1>
      <div style={{ marginBottom: 16 }}>
        <input ref={fileInputRef} type="file" />
        <button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? "Uploading…" : "Upload"}
        </button>
      </div>
      <ul>
        {documents.map((doc) => {
          const meta = DocumentMetadataService.getMetadata(doc.id) as Metadata | null;
          const displayTitle = meta?.title || (meta as any)?.contractName || "—";
          const displayNumber = meta?.contractNumber || "—";
          const displayIssuer = meta?.issuer || (meta as any)?.providerName || "—";
          const displayExpires = meta?.expirationDate || "—";
          const displayContact = meta?.contactName || (meta as any)?.contactPerson || "—";
          const displayPhone = meta?.contactPhone || (meta as any)?.phone || "—";

          return (
            <li key={doc.id} style={{ marginBottom: 12 }}>
              <div>
                <strong>{doc.name}</strong> – {doc.createdAt.toLocaleString()} {" "}
                <button onClick={() => handleDelete(doc.id)} style={{ marginLeft: 8 }}>Delete</button>
              </div>

              {editingDocId === doc.id ? (
                <div style={{ marginTop: 8, padding: 8, border: "1px solid #ddd" }}>
                  <div style={{ marginBottom: 6 }}>
                    <label>Title:</label>
                    <input
                      type="text"
                      value={metadataForm.title || ""}
                      onChange={(e) => setMetadataForm({ ...metadataForm, title: e.target.value })}
                    />
                    {formErrors.title && (
                      <span style={{ color: "red", marginLeft: 8 }}>{formErrors.title}</span>
                    )}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <label>Contract number:</label>
                    <input
                      type="text"
                      value={metadataForm.contractNumber || ""}
                      onChange={(e) => setMetadataForm({ ...metadataForm, contractNumber: e.target.value })}
                    />
                    {formErrors.contractNumber && (
                      <span style={{ color: "red", marginLeft: 8 }}>{formErrors.contractNumber}</span>
                    )}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <label>Issuer:</label>
                    <input
                      type="text"
                      value={metadataForm.issuer || ""}
                      onChange={(e) => setMetadataForm({ ...metadataForm, issuer: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <label>Expiration date:</label>
                    <input
                      type="date"
                      value={metadataForm.expirationDate || ""}
                      onChange={(e) => setMetadataForm({ ...metadataForm, expirationDate: e.target.value })}
                    />
                    {formErrors.expirationDate && (
                      <span style={{ color: "red", marginLeft: 8 }}>{formErrors.expirationDate}</span>
                    )}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <label>Contact name:</label>
                    <input
                      type="text"
                      value={metadataForm.contactName || ""}
                      onChange={(e) => setMetadataForm({ ...metadataForm, contactName: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <label>Contact phone:</label>
                    <input
                      type="text"
                      value={metadataForm.contactPhone || ""}
                      onChange={(e) => setMetadataForm({ ...metadataForm, contactPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <button onClick={handleSaveMetadata} style={{ marginRight: 8 }}>Save</button>
                    <button onClick={() => setEditingDocId(null)}>Cancel</button>
                  </div>
                </div>
              ) : meta ? (
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  <div>Title: {displayTitle}</div>
                  <div>Number: {displayNumber}</div>
                  <div>Issuer: {displayIssuer}</div>
                  <div>Expires: {displayExpires}</div>
                  <div>Contact: {displayContact}</div>
                  <div>Phone: {displayPhone}</div>
                  <button onClick={() => handleEdit(doc.id)} style={{ marginTop: 6 }}>Edit</button>
                </div>
              ) : (
                <button onClick={() => handleEdit(doc.id)} style={{ marginTop: 4 }}>
                  Pridať metadáta
                </button>
              )}
            </li>
          );
        })}
        {documents.length === 0 && <li>No documents</li>}
      </ul>
      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={() => setToast({ visible: false, message: "" })}
      />
    </div>
  );
};

export default Vault;


