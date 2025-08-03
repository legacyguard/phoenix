import React from 'react';

interface LegacyGuardSignatureProps {
  date?: string;
  signerName?: string;
  documentId?: string;
  className?: string;
}

export const LegacyGuardSignature: React.FC<LegacyGuardSignatureProps> = ({
  date = new Date().toISOString(),
  signerName = '',
  documentId = '',
  className = ''
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 150"
      className={className}
      style={{ minWidth: '200px', maxWidth: '300px' }}
    >
      {/* Background */}
      <rect x="0" y="0" width="300" height="150" fill="#fafafa" stroke="#e5e7eb" strokeWidth="1" rx="8" />
      
      {/* Shield icon matching the app theme */}
      <g transform="translate(20, 20)">
        <path
          d="M12 2L3.5 6.5V12C3.5 16.5 6.5 20.84 12 22C17.5 20.84 20.5 16.5 20.5 12V6.5L12 2Z"
          fill="#4f46e5"
          stroke="#4f46e5"
          strokeWidth="1.5"
          transform="scale(2)"
        />
        <path
          d="M9 12L11 14L15 10"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="scale(2)"
        />
      </g>
      
      {/* LegacyGuard text */}
      <text x="80" y="45" fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="20" fill="#1f2937">
        Legacy<tspan fontWeight="700" fill="#4f46e5">Guard</tspan>
      </text>
      
      {/* Digitally Signed text */}
      <text x="80" y="65" fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="12" fill="#6b7280">
        Digitally Signed Document
      </text>
      
      {/* Separator line */}
      <line x1="20" y1="85" x2="280" y2="85" stroke="#e5e7eb" strokeWidth="1" />
      
      {/* Signature details */}
      <text x="20" y="105" fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="10" fill="#6b7280">
        Signed by: <tspan fontWeight="600" fill="#374151">{signerName || 'Anonymous'}</tspan>
      </text>
      
      <text x="20" y="120" fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="10" fill="#6b7280">
        Date: <tspan fontWeight="600" fill="#374151">{formattedDate}</tspan>
      </text>
      
      {/* Document ID */}
      <text x="20" y="135" fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="9" fill="#9ca3af">
        ID: {documentId ? documentId.substring(0, 8) : 'N/A'}
      </text>
      
      {/* Decorative wave pattern matching the app theme */}
      <path
        d="M0,140 Q75,130 150,140 T300,140"
        fill="none"
        stroke="#4f46e5"
        strokeWidth="2"
        opacity="0.3"
      />
    </svg>
  );
};

// Function to convert SVG to base64
export const svgToBase64 = (svgElement: string): string => {
  const base64 = btoa(unescape(encodeURIComponent(svgElement)));
  return `data:image/svg+xml;base64,${base64}`;
};

// Function to get SVG string
export const getLegacyGuardSignatureSVG = (props: LegacyGuardSignatureProps): string => {
  const date = props.date || new Date().toISOString();
  const signerName = props.signerName || 'Anonymous';
  const documentId = props.documentId || 'N/A';
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150">
    <rect x="0" y="0" width="300" height="150" fill="#fafafa" stroke="#e5e7eb" stroke-width="1" rx="8" />
    <g transform="translate(20, 20)">
      <path d="M12 2L3.5 6.5V12C3.5 16.5 6.5 20.84 12 22C17.5 20.84 20.5 16.5 20.5 12V6.5L12 2Z" fill="#4f46e5" stroke="#4f46e5" stroke-width="1.5" transform="scale(2)" />
      <path d="M9 12L11 14L15 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="scale(2)" />
    </g>
    <text x="80" y="45" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="20" fill="#1f2937">
      Legacy<tspan font-weight="700" fill="#4f46e5">Guard</tspan>
    </text>
    <text x="80" y="65" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="#6b7280">
      Digitally Signed Document
    </text>
    <line x1="20" y1="85" x2="280" y2="85" stroke="#e5e7eb" stroke-width="1" />
    <text x="20" y="105" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="#6b7280">
      Signed by: <tspan font-weight="600" fill="#374151">${signerName}</tspan>
    </text>
    <text x="20" y="120" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="#6b7280">
      Date: <tspan font-weight="600" fill="#374151">${formattedDate}</tspan>
    </text>
    <text x="20" y="135" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="9" fill="#9ca3af">
      ID: ${documentId.substring(0, 8)}
    </text>
    <path d="M0,140 Q75,130 150,140 T300,140" fill="none" stroke="#4f46e5" stroke-width="2" opacity="0.3" />
  </svg>`;
};
