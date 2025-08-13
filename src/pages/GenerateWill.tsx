import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WillTemplateService from "@/services/WillTemplateService";
import { jsPDF } from "jspdf";

const GenerateWill: React.FC = () => {
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState("cz");
  const [type, setType] = useState("holografni");
  const [lang, setLang] = useState("cs");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [dedic1Name, setDedic1Name] = useState("");
  const [dedic1Relationship, setDedic1Relationship] = useState("");
  const [dedic1Share, setDedic1Share] = useState("");
  const [willText, setWillText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = {
      "JMÉNO_A_PRÍJMENÍ": `${firstName} ${lastName}`.trim(),
      "DÁTUM_NARODENIA": birthDate,
      "TRVALÝ_POBYT": address,
      dedic1Name,
      dedic1Relationship,
      dedic1Share,
    };
    const text = await WillTemplateService.generateWill(
      countryCode,
      type,
      lang,
      data,
    );
    setWillText(text);
  };

  return (
    <div>
      <h1>Generate Will</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <label>
          Country
          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
            <option value="cz">Czech Republic</option>
            <option value="sk">Slovakia</option>
            <option value="pl">Poland</option>
          </select>
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="holografni">Holografní</option>
            <option value="alografni">Alografní</option>
          </select>
        </label>
        <label>
          Language
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="cs">Čeština</option>
            <option value="sk">Slovenčina</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          First name
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </label>
        <label>
          Last name
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </label>
        <label>
          Birth date
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </label>
        <label>
          Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <fieldset style={{ padding: 8 }}>
          <legend>Dědic 1</legend>
          <label>
            Name
            <input value={dedic1Name} onChange={(e) => setDedic1Name(e.target.value)} />
          </label>
          <label>
            Relationship
            <input value={dedic1Relationship} onChange={(e) => setDedic1Relationship(e.target.value)} />
          </label>
          <label>
            Share
            <input value={dedic1Share} onChange={(e) => setDedic1Share(e.target.value)} />
          </label>
        </fieldset>
        <button type="submit">Generate</button>
      </form>

      {willText && (
        <div style={{ marginTop: 16 }}>
          <h2>Preview</h2>
          <textarea value={willText} readOnly style={{ width: "100%", height: 240 }} />
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                const doc = new jsPDF();
                const lines = doc.splitTextToSize(willText, 180);
                doc.text(lines as unknown as string, 10, 10);
                doc.save("zavet.pdf");
              }}
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateWill;


