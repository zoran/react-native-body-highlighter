/**
 * Tests for validation utilities
 */
import {
  isValidSlug,
  validateBodyPart,
  validateData,
  validateColors,
  warnDeprecatedAPI,
} from '../../src/utils/validation';

describe('isValidSlug', () => {
  it('should return true for valid slugs', () => {
    expect(isValidSlug('abs')).toBe(true);
    expect(isValidSlug('chest')).toBe(true);
    expect(isValidSlug('biceps')).toBe(true);
    expect(isValidSlug('lower-back')).toBe(true);
  });

  it('should return false for invalid slugs', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('invalid slug')).toBe(false);
    expect(isValidSlug('invalid@slug')).toBe(false);
    expect(isValidSlug('left-bicep')).toBe(false); // should be just 'biceps'
  });
});

describe('validateBodyPart', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should warn on invalid slug', () => {
    validateBodyPart({ slug: 'invalid slug', intensity: 1 }, 5);
    expect(warnSpy).toHaveBeenCalled();
    const firstCall = warnSpy.mock.calls[0];
    expect(firstCall.join(' ')).toContain('Invalid slug');
  });

  it('should warn on invalid intensity (out of range)', () => {
    validateBodyPart({ slug: 'abs', intensity: 10 }, 5);
    expect(warnSpy).toHaveBeenCalled();
    const firstCall = warnSpy.mock.calls[0][0];
    expect(firstCall).toContain('Must be between');
  });

  it('should warn on non-integer intensity', () => {
    validateBodyPart({ slug: 'abs', intensity: 1.5 }, 5);
    expect(warnSpy).toHaveBeenCalled();
    const firstCall = warnSpy.mock.calls[0][0];
    expect(firstCall).toContain('must be an integer');
  });

  it('should warn on invalid progress value (out of range)', () => {
    validateBodyPart({ slug: 'abs', intensity: 1, progress: { value: 150 } }, 5);
    expect(warnSpy).toHaveBeenCalled();
    const firstCall = warnSpy.mock.calls[0][0];
    expect(firstCall).toContain('Must be between -100 and 100');
  });

  it('should warn on invalid side', () => {
    validateBodyPart({ slug: 'abs', intensity: 1, side: 'middle' as any }, 5);
    expect(warnSpy).toHaveBeenCalled();
    const firstCall = warnSpy.mock.calls[0][0];
    expect(firstCall).toContain('Must be "left", "right", or "both"');
  });

  it('should warn on negative strokeWidth', () => {
    validateBodyPart({ slug: 'abs', intensity: 1, styles: { strokeWidth: -1 } }, 5);
    expect(warnSpy).toHaveBeenCalled();
    const firstCall = warnSpy.mock.calls[0][0];
    expect(firstCall).toContain('Must be >= 0');
  });

  it('should not warn for valid body part', () => {
    validateBodyPart({ slug: 'abs', intensity: 1 }, 5);
    expect(warnSpy).not.toHaveBeenCalled();

    validateBodyPart({ slug: 'biceps', intensity: 2, progress: { value: 50 }, side: 'left' }, 5);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('validateData', () => {
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('should error if data is not an array', () => {
    validateData({} as any, 5);
    expect(errorSpy).toHaveBeenCalled();
    const firstCall = errorSpy.mock.calls[0];
    expect(firstCall.join(' ')).toContain('must be an array');
  });

  it('should warn for invalid items in array', () => {
    validateData([{ slug: 'invalid slug', intensity: 1 }], 5);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('should validate all items', () => {
    validateData([
      { slug: 'abs', intensity: 1 },
      { slug: 'chest', intensity: 2 },
    ], 5);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('validateColors', () => {
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('should error if colors is not an array', () => {
    validateColors({} as any);
    expect(errorSpy).toHaveBeenCalled();
    const firstCall = errorSpy.mock.calls[0];
    expect(firstCall.join(' ')).toContain('must be an array');
  });

  it('should warn if colors array is empty', () => {
    validateColors([]);
    expect(warnSpy).toHaveBeenCalled();
    const firstCall = warnSpy.mock.calls[0][0];
    expect(firstCall).toContain('At least one color');
  });

  it('should warn for non-string colors', () => {
    validateColors([123 as any, 'red']);
    expect(warnSpy).toHaveBeenCalled();
    const firstCall = warnSpy.mock.calls[0];
    expect(firstCall.join(' ')).toContain('must be a string');
  });

  it('should not warn for valid colors', () => {
    validateColors(['red', 'blue', '#FF0000']);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('warnDeprecatedAPI', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should show deprecation warning', () => {
    warnDeprecatedAPI('oldProp', 'newProp');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const callArg = warnSpy.mock.calls[0][0];
    expect(callArg).toContain('deprecated');
    expect(callArg).toContain('v5.0');
    expect(callArg).toContain('oldProp');
    expect(callArg).toContain('newProp');
  });
});
