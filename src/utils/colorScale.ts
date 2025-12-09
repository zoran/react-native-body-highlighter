/**
 * Progress-based color scale utilities
 * Provides automatic color mapping for positive/negative progress values
 * 
 * @version 4.0.0
 */

export interface ColorStop {
  value: number; // Progress value (-100 to 100)
  color: string; // CSS color string
}

export interface ColorScale {
  /** Color stops defining the gradient scale */
  stops: ColorStop[];
  
  /** Interpolation method */
  interpolation?: 'linear' | 'step';
}

/**
 * Default color scale for progress visualization
 * Negative (red) → Neutral (gray) → Positive (green)
 */
export const DEFAULT_PROGRESS_SCALE: ColorScale = {
  stops: [
    { value: -100, color: '#ef4444' }, // Red 500 (strong negative)
    { value: -50, color: '#f87171' },  // Red 400 (moderate negative)
    { value: 0, color: '#9ca3af' },    // Gray 400 (neutral)
    { value: 50, color: '#4ade80' },   // Green 400 (moderate positive)
    { value: 100, color: '#22c55e' },  // Green 500 (strong positive)
  ],
  interpolation: 'linear',
};

/**
 * Interpolates color between two color stops
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Simple hex color interpolation
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Gets color for a progress value from a color scale
 * 
 * @param value Progress value (-100 to 100)
 * @param scale Color scale configuration
 * @returns CSS color string
 */
export function getProgressColor(value: number, scale: ColorScale = DEFAULT_PROGRESS_SCALE): string {
  // Clamp value to valid range
  const clampedValue = Math.max(-100, Math.min(100, value));
  
  // Sort stops by value
  const sortedStops = [...scale.stops].sort((a, b) => a.value - b.value);
  
  // Find the two stops to interpolate between
  let lowerStop = sortedStops[0];
  let upperStop = sortedStops[sortedStops.length - 1];
  
  for (let i = 0; i < sortedStops.length - 1; i++) {
    if (clampedValue >= sortedStops[i].value && clampedValue <= sortedStops[i + 1].value) {
      lowerStop = sortedStops[i];
      upperStop = sortedStops[i + 1];
      break;
    }
  }
  
  // If value exactly matches a stop, return that color
  if (clampedValue === lowerStop.value) {
    return lowerStop.color;
  }
  if (clampedValue === upperStop.value) {
    return upperStop.color;
  }
  
  // Interpolate between stops
  if (scale.interpolation === 'step') {
    // Step interpolation: use lower stop color
    return lowerStop.color;
  }
  
  // Linear interpolation
  const range = upperStop.value - lowerStop.value;
  const factor = (clampedValue - lowerStop.value) / range;
  
  return interpolateColor(lowerStop.color, upperStop.color, factor);
}

/**
 * Validates a color scale configuration
 */
export function validateColorScale(scale: ColorScale): boolean {
  if (!scale || !Array.isArray(scale.stops)) {
    if (__DEV__) {
      console.error('[Body] ColorScale must have a stops array');
    }
    return false;
  }
  
  if (scale.stops.length < 2) {
    if (__DEV__) {
      console.error('[Body] ColorScale must have at least 2 stops');
    }
    return false;
  }
  
  // Check for valid value range
  const values = scale.stops.map(s => s.value);
  const hasNegative = values.some(v => v < 0);
  const hasPositive = values.some(v => v > 0);
  
  if (!hasNegative || !hasPositive) {
    if (__DEV__) {
      console.warn('[Body] ColorScale should span negative to positive values for progress tracking');
    }
  }
  
  return true;
}
