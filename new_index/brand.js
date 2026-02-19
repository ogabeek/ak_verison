/**
 * LEAGUES OF CODE — Design Tokens (JS)
 *
 * Mirrors brand.css so canvas / JS animation code can use
 * the same values without hard-coding hex strings.
 *
 * Usage (ES module):
 *   import { brand, courses as courseColors } from './brand.js';
 *   ctx.fillStyle = brand.blue;
 *
 * Usage (CommonJS / plain script tag — exposes window.LOCBrand):
 *   <script src="brand.js"></script>
 *   const { brand } = window.LOCBrand;
 */

// ------------------------------------------------------------------
// PRIMARY PALETTE
// ------------------------------------------------------------------
export const brand = Object.freeze({
  blue:   '#3844FF',  // --loc-blue
  cyan:   '#38C9FF',  // --loc-cyan
  dark:   '#05071D',  // --loc-dark
  white:  '#FFFFFF',  // --loc-white
});

// ------------------------------------------------------------------
// SECONDARY PALETTE  (keyed by Roman numeral i → v)
// ------------------------------------------------------------------
export const secondary = Object.freeze({
  i:   '#38C9FF',  // Cyan
  ii:  '#CF75FF',  // Violet
  iii: '#EB4869',  // Coral
  iv:  '#F8CD46',  // Yellow
  v:   '#5CC88D',  // Green
});

// ------------------------------------------------------------------
// COURSE COLOUR CONFIGS  (matches courseColorConfigs in script.js)
// Particles expect "rgba(r,g,b," prefix strings for perf reasons.
// ------------------------------------------------------------------
export const courseColors = Object.freeze({
  blue: {
    icon:      '#dbeafe',
    button:    '#3b82f6',
    particles: ['rgba(59,130,246,',  'rgba(96,165,250,'],
  },
  green: {
    icon:      '#d1fae5',
    button:    '#10b981',
    particles: ['rgba(16,185,129,',  'rgba(52,211,153,'],
  },
  orange: {
    icon:      '#fef3c7',
    button:    '#f59e0b',
    particles: ['rgba(245,158,11,',  'rgba(251,191,36,'],
  },
  purple: {
    icon:      '#ede9fe',
    button:    '#8b5cf6',
    particles: ['rgba(139,92,246,',  'rgba(167,139,250,'],
  },
  grey: {
    icon:      '#f3f4f6',
    button:    '#6b7280',
    particles: ['rgba(107,114,128,', 'rgba(156,163,175,'],
  },
  cyan: {
    icon:      '#cffafe',
    button:    '#06b6d4',
    particles: ['rgba(6,182,212,',   'rgba(34,211,238,'],
  },
});

// ------------------------------------------------------------------
// GRADIENTS  (CSS strings, useful for canvas linearGradient helpers)
// ------------------------------------------------------------------
export const gradients = Object.freeze({
  brand:     `linear-gradient(135deg, ${brand.blue} 0%, ${brand.cyan} 100%)`,
  brandDark: `linear-gradient(135deg, ${brand.dark} 0%, ${brand.blue} 100%)`,
});

// ------------------------------------------------------------------
// CommonJS / plain <script> fallback
// ------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.LOCBrand = { brand, secondary, courseColors, gradients };
}
