/**
 * Validation utilities for Body component
 * Provides development-time warnings for invalid props
 */

import type { Slug, ExtendedBodyPart } from '../index';

// Valid base slug values (assets use base slugs only)
const VALID_BASE_SLUGS = [
  'abs',
  'adductors',
  'ankles',
  'biceps',
  'calves',
  'chest',
  'deltoids',
  'feet',
  'forearm',
  'gluteal',
  'hamstring',
  'hands',
  'hair',
  'head',
  'knees',
  'lower-back',
  'neck',
  'obliques',
  'quadriceps',
  'tibialis',
  'trapezius',
  'triceps',
  'upper-back',
] as const;

// Base slugs that can be differentiated per-side
const VALID_BILATERAL_BASE_SLUGS = [
  'biceps',
  'calves',
  'deltoids',
  'forearm',
  'gluteal',
  'hamstring',
  'quadriceps',
  'triceps',
] as const;


/**
 * Type guard to check if a string is a valid Slug
 */
export const isValidSlug = (slug: string): slug is Slug => {
  // Accept base slugs
  if ((VALID_BASE_SLUGS as readonly string[]).includes(slug)) return true;

  // Accept suffixed slugs for bilateral muscles (e.g. 'gluteal-left')
  if (slug.endsWith('-left')) {
    const base = slug.slice(0, -5);
    return (VALID_BILATERAL_BASE_SLUGS as readonly string[]).includes(base);
  }

  if (slug.endsWith('-right')) {
    const base = slug.slice(0, -6);
    return (VALID_BILATERAL_BASE_SLUGS as readonly string[]).includes(base);
  }

  return false;
};

/**
 * Validates a body part data object
 * Only runs in development mode (__DEV__)
 */
export const validateBodyPart = (
  part: ExtendedBodyPart,
  colorsLength: number
): void => {
  if (!__DEV__) return;

  // Validate slug
  if (part.slug && !isValidSlug(part.slug)) {
    console.warn(
      `[Body] Invalid slug: "${part.slug}". Valid slugs are:`,
      (VALID_BASE_SLUGS as readonly string[]).join(', ')
    );
  }

  // Validate intensity
  if (part.intensity !== undefined) {
    if (part.intensity < 1 || part.intensity > colorsLength) {
      console.warn(
        `[Body] Invalid intensity: ${part.intensity} for slug "${part.slug}". ` +
          `Must be between 1 and ${colorsLength} (colors array length).`
      );
    }
    if (!Number.isInteger(part.intensity)) {
      console.warn(
        `[Body] Intensity must be an integer, got: ${part.intensity} for slug "${part.slug}"`
      );
    }
  }

  // Validate progress (if implemented in v4)
  if (part.progress?.value !== undefined) {
    const value = part.progress.value;
    if (value < -100 || value > 100) {
      console.warn(
        `[Body] Invalid progress value: ${value} for slug "${part.slug}". ` +
          `Must be between -100 and 100.`
      );
    }
    if (!Number.isFinite(value)) {
      console.warn(
        `[Body] Progress value must be a finite number, got: ${value} for slug "${part.slug}"`
      );
    }
  }

  // Validate side
  if (part.side && !['left', 'right', 'both'].includes(part.side)) {
    console.warn(
      `[Body] Invalid side: "${part.side}" for slug "${part.slug}". ` +
        `Must be "left", "right", or "both".`
    );
  }

  // Validate styles
  if (part.styles) {
    if (part.styles.strokeWidth !== undefined && part.styles.strokeWidth < 0) {
      console.warn(
        `[Body] Invalid strokeWidth: ${part.styles.strokeWidth} for slug "${part.slug}". ` +
          `Must be >= 0.`
      );
    }
  }
};

/**
 * Validates the entire data array
 */
export const validateData = (
  data: readonly ExtendedBodyPart[],
  colorsLength: number
): void => {
  if (!__DEV__) return;

  if (!Array.isArray(data)) {
    console.error('[Body] "data" prop must be an array, got:', typeof data);
    return;
  }

  data.forEach((part, index) => {
    if (!part || typeof part !== 'object') {
      console.warn(`[Body] Invalid data item at index ${index}:`, part);
      return;
    }
    validateBodyPart(part, colorsLength);
  });
};

/**
 * Validates colors array
 */
export const validateColors = (colors: readonly string[]): void => {
  if (!__DEV__) return;

  if (!Array.isArray(colors)) {
    console.error('[Body] "colors" prop must be an array, got:', typeof colors);
    return;
  }

  if (colors.length === 0) {
    console.warn('[Body] "colors" array is empty. At least one color should be provided.');
  }

  colors.forEach((color, index) => {
    if (typeof color !== 'string') {
      console.warn(`[Body] Color at index ${index} must be a string, got:`, typeof color);
    }
  });
};

/**
 * Shows deprecation warning for legacy API
 */
export const warnDeprecatedAPI = (apiName: string, replacement: string): void => {
  if (!__DEV__) return;

  console.warn(
    `[Body] The "${apiName}" prop is deprecated and will be removed in v5.0. ` +
      `Please use "${replacement}" instead.`
  );
};
