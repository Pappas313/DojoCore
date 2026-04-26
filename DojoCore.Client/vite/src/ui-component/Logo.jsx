// project imports
import logoPng from 'assets/images/logo.png';

// ==============================|| LOGO IMAGE ||============================== //

export default function Logo() {
  return (
    <img
      src={logoPng}
      alt="DojoCore"
      height="60"
      style={{
        display: 'block',
        filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))',
        // ensures logo is legible on both light and dark backgrounds
      }}
    />
  );
}

