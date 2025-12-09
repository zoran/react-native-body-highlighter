/**
 * Tests for color scale utilities
 */
import {
  getProgressColor,
  validateColorScale,
  DEFAULT_PROGRESS_SCALE,
  type ColorScale,
} from '../../src/utils/colorScale';

describe('getProgressColor', () => {
  it('should return correct color for exact stop values', () => {
    const color = getProgressColor(0);
    expect(color).toBe('#9ca3af'); // Gray 400 at 0
  });

  it('should return color for -100 (most negative)', () => {
    const color = getProgressColor(-100);
    expect(color).toBe('#ef4444'); // Red 500
  });

  it('should return color for +100 (most positive)', () => {
    const color = getProgressColor(100);
    expect(color).toBe('#22c55e'); // Green 500
  });

  it('should interpolate between stops', () => {
    // Value between 0 and 50 should interpolate between gray and green
    const color = getProgressColor(25);
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    // Should not be exactly gray or green
    expect(color).not.toBe('#9ca3af');
    expect(color).not.toBe('#4ade80');
  });

  it('should clamp values below -100', () => {
    const color = getProgressColor(-200);
    expect(color).toBe('#ef4444'); // Should be same as -100
  });

  it('should clamp values above 100', () => {
    const color = getProgressColor(200);
    expect(color).toBe('#22c55e'); // Should be same as 100
  });

  it('should work with custom color scale', () => {
    const customScale: ColorScale = {
      stops: [
        { value: -100, color: '#ff0000' },
        { value: 0, color: '#ffffff' },
        { value: 100, color: '#00ff00' },
      ],
      interpolation: 'linear',
    };

    expect(getProgressColor(0, customScale)).toBe('#ffffff');
    expect(getProgressColor(-100, customScale)).toBe('#ff0000');
    expect(getProgressColor(100, customScale)).toBe('#00ff00');
  });

  it('should support step interpolation', () => {
    const stepScale: ColorScale = {
      stops: [
        { value: -100, color: '#ff0000' },
        { value: 0, color: '#ffffff' },
        { value: 100, color: '#00ff00' },
      ],
      interpolation: 'step',
    };

    // Value between stops should return lower stop color
    const color = getProgressColor(50, stepScale);
    expect(color).toBe('#ffffff'); // Lower stop for 50 is 0
  });
});

describe('validateColorScale', () => {
  it('should validate default progress scale', () => {
    expect(validateColorScale(DEFAULT_PROGRESS_SCALE)).toBe(true);
  });

  it('should require stops array', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const invalid = { stops: null as any };
    expect(validateColorScale(invalid)).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
    
    errorSpy.mockRestore();
  });

  it('should require at least 2 stops', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const invalid: ColorScale = {
      stops: [{ value: 0, color: '#000000' }],
    };
    expect(validateColorScale(invalid)).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
    
    errorSpy.mockRestore();
  });

  it('should warn if scale does not span negative to positive', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Only positive values - should trigger warning
    const limitedScale: ColorScale = {
      stops: [
        { value: 10, color: '#000000' },
        { value: 50, color: '#ffffff' },
      ],
    };
    expect(validateColorScale(limitedScale)).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
    
    warnSpy.mockRestore();
  });

  it('should accept valid custom scale', () => {
    const customScale: ColorScale = {
      stops: [
        { value: -50, color: '#ff0000' },
        { value: 0, color: '#808080' },
        { value: 50, color: '#00ff00' },
      ],
    };
    expect(validateColorScale(customScale)).toBe(true);
  });
});

describe('DEFAULT_PROGRESS_SCALE', () => {
  it('should have 5 stops', () => {
    expect(DEFAULT_PROGRESS_SCALE.stops).toHaveLength(5);
  });

  it('should span from -100 to 100', () => {
    const values = DEFAULT_PROGRESS_SCALE.stops.map(s => s.value);
    expect(Math.min(...values)).toBe(-100);
    expect(Math.max(...values)).toBe(100);
  });

  it('should use linear interpolation', () => {
    expect(DEFAULT_PROGRESS_SCALE.interpolation).toBe('linear');
  });

  it('should have neutral color at 0', () => {
    const neutralStop = DEFAULT_PROGRESS_SCALE.stops.find(s => s.value === 0);
    expect(neutralStop).toBeDefined();
    expect(neutralStop?.color).toBe('#9ca3af'); // Gray 400
  });
});
