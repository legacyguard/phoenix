import React from "react";
import { LEGACY_GUARD_SIGNATURE_CONSTANTS } from "./LegacyGuardSignature.constants";
import type { LegacyGuardSignatureProps } from "./LegacyGuardSignature.utils";

export const LegacyGuardSignature: React.FC<LegacyGuardSignatureProps> = ({
  date = new Date().toISOString(),
  signerName = "",
  documentId = "",
  className = "",
}) => {
  const formattedDate = new Date(date).toLocaleDateString(
    "en-US",
    LEGACY_GUARD_SIGNATURE_CONSTANTS.dateFormat,
  );
  const { colors, fonts, viewBox, style, defaults } =
    LEGACY_GUARD_SIGNATURE_CONSTANTS;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      className={className}
      style={style}
    >
      {/* Background */}
      <rect
        x="0"
        y="0"
        width="300"
        height="150"
        fill={colors.background}
        stroke={colors.border}
        strokeWidth="1"
        rx="8"
      />

      {/* Shield icon matching the app theme */}
      <g transform="translate(20, 20)">
        <path
          d="M12 2L3.5 6.5V12C3.5 16.5 6.5 20.84 12 22C17.5 20.84 20.5 16.5 20.5 12V6.5L12 2Z"
          fill={colors.primary}
          stroke={colors.primary}
          strokeWidth="1.5"
          transform="scale(2)"
        />
        <path
          d="M9 12L11 14L15 10"
          fill="none"
          stroke={colors.white}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="scale(2)"
        />
      </g>

      {/* LegacyGuard text */}
      <text
        x="80"
        y="45"
        fontFamily={fonts.family}
        fontSize="20"
        fill={colors.textPrimary}
      >
        Legacy
        <tspan fontWeight="700" fill={colors.primary}>
          Guard
        </tspan>
      </text>

      {/* Digitally Signed text */}
      <text
        x="80"
        y="65"
        fontFamily={fonts.family}
        fontSize="12"
        fill={colors.textSecondary}
      >
        Digitally Signed Document
      </text>

      {/* Separator line */}
      <line
        x1="20"
        y1="85"
        x2="280"
        y2="85"
        stroke={colors.border}
        strokeWidth="1"
      />

      {/* Signature details */}
      <text
        x="20"
        y="105"
        fontFamily={fonts.family}
        fontSize="10"
        fill={colors.textSecondary}
      >
        Signed by:{" "}
        <tspan fontWeight="600" fill={colors.textDark}>
          {signerName || defaults.signerName}
        </tspan>
      </text>

      <text
        x="20"
        y="120"
        fontFamily={fonts.family}
        fontSize="10"
        fill={colors.textSecondary}
      >
        Date:{" "}
        <tspan fontWeight="600" fill={colors.textDark}>
          {formattedDate}
        </tspan>
      </text>

      {/* Document ID */}
      <text
        x="20"
        y="135"
        fontFamily={fonts.family}
        fontSize="9"
        fill={colors.textMuted}
      >
        ID: {documentId ? documentId.substring(0, 8) : defaults.documentId}
      </text>

      {/* Decorative wave pattern matching the app theme */}
      <path
        d="M0,140 Q75,130 150,140 T300,140"
        fill="none"
        stroke={colors.primary}
        strokeWidth="2"
        opacity="0.3"
      />
    </svg>
  );
};
