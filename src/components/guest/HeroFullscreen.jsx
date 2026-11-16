import React from 'react';

export default function HeroFullscreen() {
  return (
    <section className="hero-fs">
      {/* Background Ambience & Delicate Texture */}
      <div className="hero-fs-bg-glow" aria-hidden="true"></div>

      <div className="container hero-fs-inner">
        {/* Left Column: Typography & Hiragana */}
        <div className="hero-fs-left">
          {/* Desktop-only Latin Editorial Typography */}
          <div className="hero-fs-desktop-latin">

            <div className="hero-fs-headline-group">
              <h1 className="hero-fs-title">
                A little taste<br />
                of <em>Japan.</em>
              </h1>
              <p className="hero-fs-tagline">SUSHI · RAMEN · GOOD MOMENTS</p>
            </div>
          </div>

          {/* Vertical Japanese Hiragana (Always visible on Desktop & Mobile) */}
          <div className="hero-fs-hiragana-container">
            <div className="vertical-hiragana-col">
              <span className="hiragana-text">おいしい時間を。</span>
              <span className="hiragana-sub hero-fs-desktop-latin">Oishii jikan o</span>
            </div>
            <div className="vertical-hiragana-col secondary">
              <span className="hiragana-text">いただきます</span>
              <span className="hiragana-sub hero-fs-desktop-latin">Itadakimasu</span>
            </div>
          </div>

          {/* Desktop-only Meta Info */}
          <div className="hero-fs-meta hero-fs-desktop-latin">
            <span>01 / 03</span>
            <span>MADE FRESH, SERVED WITH CARE · BANYUWANGI</span>
          </div>
        </div>

        {/* Right Column: Clean Floating Bowl (No background card) */}
        <div className="hero-fs-right">
          <div className="hero-fs-bowl-wrap">
            <div className="hero-fs-bowl">
              <div className="noodle-swirl"></div>
              <div className="bowl-topping egg"></div>
              <div className="bowl-topping fish"></div>
              <div className="bowl-topping nori"></div>
              <span className="bowl-topping scallion">✳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Red Japanese Seal Stamp - Fixed to Bottom Right Corner of Hero Section */}
      <div className="hero-fs-corner-stamp" title="Ichiraku Kitchen Stamp">
        <span className="corner-stamp-kanji">一楽</span>
        <span className="corner-stamp-sub">いただきます！</span>
      </div>

      {/* Floating Bottom Scroll Prompt */}
      <a href="#menu-catalog" className="hero-fs-scroll" aria-label="Scroll ke menu">
        <span className="hero-fs-desktop-latin">SCROLL TO MENU</span>
        <span className="scroll-arrow">↓</span>
      </a>
    </section>
  );
}
