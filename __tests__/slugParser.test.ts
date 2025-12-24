import { parseMuscleSlug, hasSideSuffix, getBaseMuscle } from '../src/utils/slugParser';

describe('slugParser', () => {
  describe('parseMuscleSlug', () => {
    it('should parse slug without suffix', () => {
      const result = parseMuscleSlug('biceps');
      expect(result).toEqual({
        base: 'biceps',
        side: undefined,
      });
    });

    it('should parse slug with -left suffix', () => {
      const result = parseMuscleSlug('biceps-left');
      expect(result).toEqual({
        base: 'biceps',
        side: 'left',
      });
    });

    it('should parse slug with -right suffix', () => {
      const result = parseMuscleSlug('biceps-right');
      expect(result).toEqual({
        base: 'biceps',
        side: 'right',
      });
    });

    it('should parse all bilateral muscles with -left', () => {
      const bilateralMuscles = [
        'biceps',
        'calves',
        'deltoids',
        'forearm',
        'gluteal',
        'hamstring',
        'quadriceps',
        'triceps',
      ];

      bilateralMuscles.forEach((muscle) => {
        const result = parseMuscleSlug(`${muscle}-left`);
        expect(result).toEqual({
          base: muscle,
          side: 'left',
        });
      });
    });

    it('should parse all bilateral muscles with -right', () => {
      const bilateralMuscles = [
        'biceps',
        'calves',
        'deltoids',
        'forearm',
        'gluteal',
        'hamstring',
        'quadriceps',
        'triceps',
      ];

      bilateralMuscles.forEach((muscle) => {
        const result = parseMuscleSlug(`${muscle}-right`);
        expect(result).toEqual({
          base: muscle,
          side: 'right',
        });
      });
    });

    it('should handle slug with "left" or "right" in name but not as suffix', () => {
      const result = parseMuscleSlug('lower-back');
      expect(result).toEqual({
        base: 'lower-back',
        side: undefined,
      });
    });
  });

  describe('hasSideSuffix', () => {
    it('should return false for slug without suffix', () => {
      expect(hasSideSuffix('biceps')).toBe(false);
      expect(hasSideSuffix('abs')).toBe(false);
      expect(hasSideSuffix('lower-back')).toBe(false);
    });

    it('should return true for slug with -left suffix', () => {
      expect(hasSideSuffix('biceps-left')).toBe(true);
      expect(hasSideSuffix('gluteal-left')).toBe(true);
    });

    it('should return true for slug with -right suffix', () => {
      expect(hasSideSuffix('biceps-right')).toBe(true);
      expect(hasSideSuffix('deltoids-right')).toBe(true);
    });
  });

  describe('getBaseMuscle', () => {
    it('should return the slug itself if no suffix', () => {
      expect(getBaseMuscle('biceps')).toBe('biceps');
      expect(getBaseMuscle('abs')).toBe('abs');
    });

    it('should return base muscle for -left suffix', () => {
      expect(getBaseMuscle('biceps-left')).toBe('biceps');
      expect(getBaseMuscle('deltoids-left')).toBe('deltoids');
    });

    it('should return base muscle for -right suffix', () => {
      expect(getBaseMuscle('biceps-right')).toBe('biceps');
      expect(getBaseMuscle('calves-right')).toBe('calves');
    });
  });
});
