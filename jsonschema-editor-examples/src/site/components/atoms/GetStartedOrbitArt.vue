<template>
  <svg
    class="get-started__orbit"
    viewBox="0 0 760 300"
    role="img"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="gs-glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#99f6e4" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#0d9488" stop-opacity="0.06" />
      </linearGradient>
      <linearGradient id="gs-wire" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#0d9488" stop-opacity="0.2" />
        <stop offset="50%" stop-color="#14b8a6" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#0f766e" stop-opacity="0.25" />
      </linearGradient>
      <linearGradient id="gs-form-bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f0fdfa" />
      </linearGradient>
      <filter id="gs-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <filter id="gs-card-shadow" x="-15%" y="-10%" width="130%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.12" />
      </filter>
    </defs>

    <ellipse
      class="get-started__blob get-started__blob--a"
      cx="200"
      cy="150"
      rx="160"
      ry="100"
      fill="url(#gs-glow)"
      filter="url(#gs-soft)"
    />
    <ellipse
      class="get-started__blob get-started__blob--b"
      cx="560"
      cy="160"
      rx="150"
      ry="95"
      fill="url(#gs-glow)"
      filter="url(#gs-soft)"
    />

    <!-- Flow wires: steps → loose → form -->
    <g fill="none" stroke="url(#gs-wire)" stroke-width="1.5">
      <path
        class="get-started__wire get-started__wire--1"
        d="M170 80 C240 80, 280 120, 340 110 S420 70, 500 95"
      />
      <path
        class="get-started__wire get-started__wire--2"
        d="M170 150 C250 150, 290 180, 360 160 S450 140, 500 155"
      />
      <path
        class="get-started__wire get-started__wire--3"
        d="M170 220 C240 230, 300 200, 360 210 S440 230, 500 215"
      />
    </g>

    <circle class="get-started__spark" r="3.2" fill="#0d9488">
      <animateMotion
        dur="5s"
        repeatCount="indefinite"
        path="M170 80 C240 80, 280 120, 340 110 S420 70, 500 95"
      />
    </circle>
    <circle class="get-started__spark" r="2.6" fill="#14b8a6">
      <animateMotion
        dur="6.4s"
        begin="1s"
        repeatCount="indefinite"
        path="M170 150 C250 150, 290 180, 360 160 S450 140, 500 155"
      />
    </circle>
    <circle class="get-started__spark" r="3" fill="#5eead4">
      <animateMotion
        dur="5.6s"
        begin="0.5s"
        repeatCount="indefinite"
        path="M170 220 C240 230, 300 200, 360 210 S440 230, 500 215"
      />
    </circle>

    <!-- LEFT: 3 steps -->
    <g class="get-started__steps-art">
      <g transform="translate(28 42)">
        <g class="get-started__step-card get-started__step-card--1">
          <rect width="150" height="54" rx="14" />
          <circle class="get-started__step-dot" cx="24" cy="27" r="14" />
          <text class="get-started__step-num" x="24" y="32" text-anchor="middle">1</text>
          <text class="get-started__step-label" x="48" y="24">Schema</text>
          <text class="get-started__step-sub" x="48" y="40">describe once</text>
        </g>
      </g>
      <g transform="translate(28 118)">
        <g class="get-started__step-card get-started__step-card--2">
          <rect width="150" height="54" rx="14" />
          <circle class="get-started__step-dot" cx="24" cy="27" r="14" />
          <text class="get-started__step-num" x="24" y="32" text-anchor="middle">2</text>
          <text class="get-started__step-label" x="48" y="24">UI layout</text>
          <text class="get-started__step-sub" x="48" y="40">compose views</text>
        </g>
      </g>
      <g transform="translate(28 194)">
        <g class="get-started__step-card get-started__step-card--3">
          <rect width="150" height="54" rx="14" />
          <circle class="get-started__step-dot" cx="24" cy="27" r="14" />
          <text class="get-started__step-num" x="24" y="32" text-anchor="middle">3</text>
          <text class="get-started__step-label" x="48" y="24">Live form</text>
          <text class="get-started__step-sub" x="48" y="40">validate &amp; ship</text>
        </g>
      </g>
    </g>

    <!-- MIDDLE: loose floating fields -->
    <g class="get-started__loose">
      <g transform="translate(250 48) rotate(-9)">
        <g class="get-started__loose-field get-started__loose-field--1">
          <rect width="118" height="36" rx="8" />
          <rect class="get-started__loose-bar" x="10" y="10" width="42" height="5" rx="2" />
          <rect class="get-started__loose-input" x="10" y="20" width="96" height="8" rx="2" />
        </g>
      </g>
      <g transform="translate(310 108) rotate(7)">
        <g class="get-started__loose-field get-started__loose-field--2">
          <rect width="100" height="36" rx="8" />
          <rect class="get-started__loose-bar" x="10" y="10" width="34" height="5" rx="2" />
          <rect class="get-started__loose-input" x="10" y="20" width="78" height="8" rx="2" />
        </g>
      </g>
      <g transform="translate(235 168) rotate(12)">
        <g class="get-started__loose-field get-started__loose-field--3">
          <rect width="112" height="36" rx="8" />
          <rect class="get-started__loose-bar" x="10" y="10" width="50" height="5" rx="2" />
          <circle class="get-started__loose-radio" cx="18" cy="25" r="4" />
          <circle class="get-started__loose-radio" cx="42" cy="25" r="4" />
          <rect class="get-started__loose-bar" x="54" y="22" width="40" height="5" rx="2" />
        </g>
      </g>
      <g transform="translate(330 218) rotate(-6)">
        <g class="get-started__loose-field get-started__loose-field--4">
          <rect width="90" height="34" rx="8" />
          <rect class="get-started__loose-bar" x="10" y="9" width="28" height="5" rx="2" />
          <rect class="get-started__loose-input" x="10" y="19" width="68" height="8" rx="2" />
        </g>
      </g>
      <text class="get-started__loose-brace" x="290" y="155">{</text>
      <text class="get-started__loose-brace get-started__loose-brace--close" x="410" y="175">}</text>
    </g>

    <!-- RIGHT: pretty assembled form -->
    <g transform="translate(470 28)">
      <g class="get-started__pretty-form" filter="url(#gs-card-shadow)">
        <rect class="get-started__pretty-shell" width="250" height="244" rx="18" fill="url(#gs-form-bg)" />
        <rect class="get-started__pretty-accent" x="0" y="0" width="250" height="8" rx="4" />
        <text class="get-started__pretty-title" x="20" y="38">Contact</text>
        <text class="get-started__pretty-hint" x="20" y="54">Validated live form</text>

        <g transform="translate(20 70)">
          <text class="get-started__pretty-label" x="0" y="0">Full name</text>
          <rect class="get-started__pretty-control" y="8" width="210" height="30" rx="8" />
          <text class="get-started__pretty-value" x="12" y="28">Alex Rivera</text>
        </g>
        <g transform="translate(20 120)">
          <text class="get-started__pretty-label" x="0" y="0">Email</text>
          <rect class="get-started__pretty-control" y="8" width="210" height="30" rx="8" />
          <text class="get-started__pretty-value" x="12" y="28">alex@studio.dev</text>
        </g>
        <g transform="translate(20 170)">
          <text class="get-started__pretty-label" x="0" y="0">Role</text>
          <rect class="get-started__pretty-control" y="8" width="210" height="30" rx="8" />
          <text class="get-started__pretty-value" x="12" y="28">Designer</text>
          <path class="get-started__pretty-chevron" d="M188 20 L196 26 L204 20" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" />
        </g>
        <g transform="translate(20 214)">
          <rect class="get-started__pretty-btn" width="210" height="34" rx="10" />
          <text class="get-started__pretty-btn-label" x="105" y="22" text-anchor="middle">Submit</text>
        </g>
      </g>
    </g>
  </svg>
</template>
