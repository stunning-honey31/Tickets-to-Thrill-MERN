/**
 * The site's icon mark: a roller-coaster hill/loop/hill track with a
 * cart and a spark - drawn as plain SVG shapes (no image file), sized
 * to sit inside the existing .logo-badge / .admin-logo blue badge div.
 * Same design (and same coordinate scheme) as the coaster icon drawn
 * on the PDF ticket in server/src/utils/pdfGenerator.js, so the mark
 * matches wherever it appears - header, footer, admin sidebar, or the
 * downloaded ticket.
 */
export default function LogoIcon({ size = 22 }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 38 C13 21 20 21 24 32 C27 40 30 40 33 32 C37 21 44 21 49 30 C52 35 54 37 57 38"
        stroke="#FFFFFF"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="31.5" r="6.8" stroke="#FFFFFF" strokeWidth="2.8" />
      <g transform="translate(38,23) rotate(-24)">
        <rect x="-5" y="-3.6" width="10" height="7.2" rx="1.8" fill="#FF7A00" />
        <circle cx="-2.8" cy="4" r="1.5" fill="#0F1B33" />
        <circle cx="2.8" cy="4" r="1.5" fill="#0F1B33" />
      </g>
      <path
        d="M50 7.5 L51.7 12.3 L56.5 14 L51.7 15.7 L50 20.5 L48.3 15.7 L43.5 14 L48.3 12.3 Z"
        fill="#FFC107"
      />
    </svg>
  );
}
