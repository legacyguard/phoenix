import { LEGACY_GUARD_SIGNATURE_CONSTANTS } from './LegacyGuardSignature.constants';

export interface LegacyGuardSignatureProps {
  date?: string;
  signerName?: string;
  documentId?: string;
  className?: string;
}

// Function to convert SVG to base64
export const svgToBase64 = (svgElement: string): string => {
  const base64 = btoa(unescape(encodeURIComponent(svgElement)));
  return `data:image/svg+xml;base64,${base64}`;
};

// Function to get SVG string
export const getLegacyGuardSignatureSVG = (props: LegacyGuardSignatureProps): string => {
  const date = props.date || new Date().toISOString();
  const signerName = props.signerName || LEGACY_GUARD_SIGNATURE_CONSTANTS.defaults.signerName;
  const documentId = props.documentId || LEGACY_GUARD_SIGNATURE_CONSTANTS.defaults.documentId;
  const formattedDate = new Date(date).toLocaleDateString('en-US', LEGACY_GUARD_SIGNATURE_CONSTANTS.dateFormat);
  
  const { colors, fonts } = LEGACY_GUARD_SIGNATURE_CONSTANTS;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LEGACY_GUARD_SIGNATURE_CONSTANTS.viewBox}">
    <rect x="0" y="0" width="300" height="150" fill="${colors.background}" stroke="${colors.border}" stroke-width="1" rx="8" />
    <g transform="translate(20, 20)">
      <path d="M12 2L3.5 6.5V12C3.5 16.5 6.5 20.84 12 22C17.5 20.84 20.5 16.5 20.5 12V6.5L12 2Z" fill="${colors.primary}" stroke="${colors.primary}" stroke-width="1.5" transform="scale(2)" />
      <path d="M9 12L11 14L15 10" fill="none" stroke="${colors.white}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="scale(2)" />
    </g>
    <text x="80" y="45" font-family="${fonts.family}" font-size="20" fill="${colors.textPrimary}">
      Legacy<tspan font-weight="700" fill="${colors.primary}">Guard</tspan>
    </text>
    <text x="80" y="65" font-family="${fonts.family}" font-size="12" fill="${colors.textSecondary}">
      Digitally Signed Document
    </text>
    <line x1="20" y1="85" x2="280" y2="85" stroke="${colors.border}" stroke-width="1" />
    <text x="20" y="105" font-family="${fonts.family}" font-size="10" fill="${colors.textSecondary}">
      Signed by: <tspan font-weight="600" fill="${colors.textDark}">${signerName}</tspan>
    </text>
    <text x="20" y="120" font-family="${fonts.family}" font-size="10" fill="${colors.textSecondary}">
      Date: <tspan font-weight="600" fill="${colors.textDark}">${formattedDate}</tspan>
    </text>
    <text x="20" y="135" font-family="${fonts.family}" font-size="9" fill="${colors.textMuted}">
      ID: ${documentId.substring(0, 8)}
    </text>
    <path d="M0,140 Q75,130 150,140 T300,140" fill="none" stroke="${colors.primary}" stroke-width="2" opacity="0.3" />
  </svg>`;
};
