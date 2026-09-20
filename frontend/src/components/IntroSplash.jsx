import { useEffect, useState } from 'react';
import logo from '../assets/logo.jpeg';
import './IntroSplash.css';

// One-time "app open" splash: a flood wave sweeps in from the left,
// settles into a gently moving waterline, and the brand name reveals
// left-to-right in a luminous white/blue gradient while the water is
// still visible underneath. Calls onFinish once it's done and faded out.
function IntroSplash({ onFinish }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Start the fade-out once the wave has settled and the name has
    // had a moment to shine, then unmount after the fade completes.
    const closeTimer = setTimeout(() => setClosing(true), 3400);
    const doneTimer = setTimeout(() => onFinish?.(), 4000);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  const skip = () => {
    setClosing(true);
    setTimeout(() => onFinish?.(), 600);
  };

  return (
    <div
      className={`intro-splash${closing ? ' is-closing' : ''}`}
      onClick={skip}
      role="presentation"
    >
      {/* SPLASH SWEEP — the initial flood surge crossing the screen */}
      <div className="intro-surge" />
      <div className="intro-foam" />

      {/* SPLASH DROPLETS */}
      <div className="intro-droplets">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={`droplet d${i + 1}`} />
        ))}
      </div>

      {/* BRAND */}
      <div className="intro-brand">
        <img src={logo} alt="" className="intro-logo" />
        <h1 className="intro-title">
          <span className="intro-title-fill">NattilAlert</span>
        </h1>
        <p className="intro-tagline">Community Flood Response Network</p>
      </div>

      {/* SETTLED WATERLINE — stays visible while the name is shown */}
      <div className="intro-water">
        <svg className="intro-wave intro-wave-back" viewBox="0 0 2400 220" preserveAspectRatio="none">
          <path
            d="M0,110 C 200,40 400,170 600,110 C 800,50 1000,160 1200,110
               C 1400,40 1600,170 1800,110 C 2000,50 2200,160 2400,110
               L2400,220 L0,220 Z"
          />
        </svg>
        <svg className="intro-wave intro-wave-front" viewBox="0 0 2400 220" preserveAspectRatio="none">
          <path
            d="M0,130 C 220,190 380,70 600,130 C 820,190 980,70 1200,130
               C 1420,190 1580,70 1800,130 C 2020,190 2180,70 2400,130
               L2400,220 L0,220 Z"
          />
        </svg>
      </div>
    </div>
  );
}

export default IntroSplash;
