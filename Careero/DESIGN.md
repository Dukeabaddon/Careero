---
name: "Careero"
theme: "light"
text-case: "selective-uppercase"
grid:
  columns: 12
  border-color: "rgba(28,35,50,0.12)"
  border-width: "1px"
  continuous: false
colors:
  background: "#F7F6F1"
  midground: "#5B43D6"
  foreground: "#1C2332"
  surface: "#FFFFFF"
  surface-raised: "#EEF1F7"
  text-primary: "#1C2332"
  text-muted: "#667085"
  accent: "#5B43D6"
  accent-cyan: "#087F8C"
  accent-warm: "#C77800"
  success: "#087A55"
  danger: "#C13D58"
  code-bg: "#ECEAF7"
  code-text: "#4935B3"
typography:
  display:
    family: "Space Grotesk"
    size: "clamp(2.75rem, 7vw, 6.75rem)"
    weight: 700
    tracking: "-0.055em"
  body:
    family: "Manrope"
    size: "1rem"
    weight: 400
    leading: 1.65
  meta:
    family: "IBM Plex Mono"
    size: "0.75rem"
    weight: 600
    tracking: "0.14em"
    transform: "uppercase"
  code:
    family: "IBM Plex Mono"
    size: "0.875rem"
spacing:
  section-padding: "clamp(72px, 10vw, 144px)"
  container-max: "1240px"
  element-gap: "24px"
  cell-inset: "clamp(18px, 3vw, 32px)"
  hero-heading-gap: "28px"
effects:
  texture: "grain"
  texture-opacity: 0.018
  ambient: "paper-aurora-orbits"
  vignette: false
  bg-image: null
  bg-image-opacity: 0
  bg-image-filter: "none"
  section-transitions: "soft-overlap"
  scroll-reveal: true
  scroll-reveal-duration: "0.65s"
  scroll-reveal-easing: "cubic-bezier(0.16, 1, 0.3, 1)"
compositing:
  enabled: true
  layers:
    - type: "bg-color"
      z: 0
    - type: "radial-gradient"
      z: 1
      blend: "lighten"
      opacity: 0.14
      color: "#A99AF4"
      position: "top-left"
    - type: "radial-gradient"
      z: 2
      blend: "multiply"
      opacity: 0.07
      color: "#7CCED4"
      position: "bottom-right"
    - type: "grain"
      z: 9999
      blend: "overlay"
      opacity: 0.018
hero:
  layout: "asymmetric-editorial"
  focal-point: "career trajectory headline, left"
  illustration-method: "animated CSS orbit with RIASEC imagery"
showcase:
  type: "carousel"
  items: 6
  layout: "horizontal-scroll"
  center-largest: false
  item-ratio: "4:5"
  rotation-deg: 0
  translate-x: 0
interactive:
  theme-toggle: false
  copy-buttons: true
  hover-style: "group-flash"
  more-details: "accordion"
responsive:
  collapse-at: "768px"
  features-grid: "asymmetric-3-col"
---

# Design Decisions

Careero uses a warm paper-white foundation. Deep ink carries primary content. Indigo drives actions, teal marks progress, and ochre marks achievements without lowering contrast.

The landing screen has one focal point: a large career-trajectory statement. An animated orbital diagram previews the six RIASEC dimensions without competing with the call to action.

Assessment cards prioritize imagery and touch targets. The two choices become a single-column stack below 768px. Intensity controls remain visible after selection and use text, icons, and color together.

Results use an editorial dashboard. The archetype leads, the six-vector profile follows, and schools, scholarships, and programs stream in below it. Decorative blur stays limited to the navbar and modal.

Motion uses restrained spring transitions. Reduced-motion preferences disable nonessential transforms. All controls retain visible focus states, logical keyboard order, and minimum 44px targets. The share card uses the same light tokens.
