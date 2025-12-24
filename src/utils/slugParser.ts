/**
 * Utility functions for parsing muscle slugs with optional side suffixes
 */

export type MuscleSlugParts = {
  base: string;
  side?: 'left' | 'right';
};

/**
 * Parses a muscle slug that may include a -left or -right suffix
 * 
 * @param slug - The muscle slug to parse (e.g., 'biceps', 'biceps-left', 'biceps-right')
 * @returns Object with base muscle name and optional side
 * 
 * @example
 * parseMuscleSlug('biceps') // { base: 'biceps', side: undefined }
 * parseMuscleSlug('biceps-left') // { base: 'biceps', side: 'left' }
 * parseMuscleSlug('biceps-right') // { base: 'biceps', side: 'right' }
 */
export function parseMuscleSlug(slug: string): MuscleSlugParts {
  if (slug.endsWith('-left')) {
    return {
      base: slug.slice(0, -5), // Remove '-left'
      side: 'left'
    };
  }
  
  if (slug.endsWith('-right')) {
    return {
      base: slug.slice(0, -6), // Remove '-right'
      side: 'right'
    };
  }
  
  return {
    base: slug,
    side: undefined
  };
}

/**
 * Checks if a muscle slug has a side suffix
 * 
 * @param slug - The muscle slug to check
 * @returns True if the slug has a -left or -right suffix
 */
export function hasSideSuffix(slug: string): boolean {
  return slug.endsWith('-left') || slug.endsWith('-right');
}

/**
 * Gets the base muscle name without side suffix
 * 
 * @param slug - The muscle slug
 * @returns Base muscle name without suffix
 */
export function getBaseMuscle(slug: string): string {
  return parseMuscleSlug(slug).base;
}
