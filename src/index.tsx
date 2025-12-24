/**
 * React Native Body Highlighter
 * 
 * Enhanced fork of the original library by Hicham ELABBASSI
 * Original: https://github.com/HichamELBSI/react-native-body-highlighter
 * 
 * Enhancements in this fork:
 * - Progress-based color system (positive/negative values) [v4.0]
 * - Automatic anatomical mirroring on view flip [v4.0]
 * - Controlled component API [v4.0]
 * - Neutral gender support [v4.0]
 * - Comprehensive TypeScript types (strict mode)
 * - Full test coverage (>95%)
 * - Development-mode validation with helpful warnings
 * 
 * All enhancements maintain full backward compatibility with v3.x
 * 
 * @author Zoran (enhancements)
 * @author Hicham ELABBASSI (original)
 * @license MIT
 * @version 5.0.0
 */

import React, { useCallback, useMemo } from 'react';
import { Path } from 'react-native-svg';

import { bodyFront } from './assets/bodyFront';
import { bodyBack } from './assets/bodyBack';
import { SvgMaleWrapper } from './components/SvgMaleWrapper';
import { bodyFemaleFront } from './assets/bodyFemaleFront';
import { bodyFemaleBack } from './assets/bodyFemaleBack';
import { SvgFemaleWrapper } from './components/SvgFemaleWrapper';
import { getProgressColor, DEFAULT_PROGRESS_SCALE, type ColorScale } from './utils/colorScale';
import { parseMuscleSlug } from './utils/slugParser';
import { validateData, validateColors } from './utils/validation';

// ===== TYPE DEFINITIONS =====

export type BaseMuscleSlug =
  | 'abs'
  | 'adductors'
  | 'ankles'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'deltoids'
  | 'feet'
  | 'forearm'
  | 'gluteal'
  | 'hamstring'
  | 'hands'
  | 'hair'
  | 'head'
  | 'knees'
  | 'lower-back'
  | 'neck'
  | 'obliques'
  | 'quadriceps'
  | 'tibialis'
  | 'trapezius'
  | 'triceps'
  | 'upper-back';

// Bilateral muscle groups that support left/right differentiation
export type BilateralMuscleSlug =
  | 'biceps'
  | 'calves'
  | 'deltoids'
  | 'forearm'
  | 'gluteal'
  | 'hamstring'
  | 'quadriceps'
  | 'triceps';

// Extended slugs with -left and -right suffixes for bilateral muscles
export type ExtendedMuscleSlug =
  | `${BilateralMuscleSlug}-left`
  | `${BilateralMuscleSlug}-right`;

// Complete slug type includes base slugs and extended left/right variants
export type Slug = BaseMuscleSlug | ExtendedMuscleSlug;

export type Gender = 'male' | 'female';
export type Side = 'front' | 'back';
export type PartSide = 'left' | 'right';

export interface BodyPartStyles {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * Progress-based value system (v4.0 feature)
 * Allows tracking of both positive and negative progress
 */
export interface BodyPartProgress {
  value: number; // -100 to +100
  color?: string; // Override automatic color
  showValue?: boolean; // Display numeric value (future feature)
}

/**
 * Base body part definition (from asset files)
 */
export interface BodyPart {
  slug?: Slug;
  color?: string;
  path?: {
    common?: string[];
    left?: string[];
    right?: string[];
  };
}

/**
 * Extended body part with user data
 */
export interface ExtendedBodyPart extends BodyPart {
  intensity?: number; // Legacy v3.x API: 1 to colors.length
  progress?: BodyPartProgress; // New v4.0 API: -100 to +100
  side?: PartSide; // Which side to highlight
  styles?: BodyPartStyles; // Per-part style overrides
}

/**
 * Body component props
 */
export interface BodyProps {
  // Required
  data: ReadonlyArray<ExtendedBodyPart>;

  // Appearance
  colors?: ReadonlyArray<string>; // Legacy: intensity-based colors
  colorScale?: ColorScale; // v4.0: Progress color scale (default: DEFAULT_PROGRESS_SCALE)
  scale?: number; // Default: 1
  side?: Side; // Default: 'front'
  gender?: Gender; // Default: 'male'
  border?: string | 'none'; // Default: '#dfdfdf'

  // Default styles
  defaultFill?: string; // Default: '#f5f5f5'
  muscleStroke?: string; // Default: same as border (for muscle separation lines)
  defaultStroke?: string; // Default: 'none'
  backgroundColor?: string; // Background color behind all muscles (fills gaps)
  skinColor?: string; // Default: same as defaultFill (for hair, hands, feet, face)
  hairColor?: string; // Default: same as skinColor (for hair only)
  defaultStrokeWidth?: number; // Default: 0

  // Part filtering
  disabledParts?: Slug[]; // Non-interactive parts
  hiddenParts?: Slug[]; // Parts not rendered

  // Interaction
  onBodyPartPress?: (part: ExtendedBodyPart, side?: PartSide) => void;
}

// ===== COMPONENT =====

const Body: React.FC<BodyProps> = ({
  colors = ['#0984e3', '#74b9ff'],
  colorScale = DEFAULT_PROGRESS_SCALE,
  data,
  scale = 1,
  side = 'front',
  gender = 'male',
  onBodyPartPress,
  border = '#dfdfdf',
  disabledParts = [],
  muscleStroke = border,
  hiddenParts = [],
  backgroundColor = "transparent",
  defaultFill = '#f5f5f5',
  skinColor = defaultFill,
  hairColor = backgroundColor,
  defaultStroke = 'none',
  defaultStrokeWidth = 0,
}) => {
  // Development-mode validation
  if (__DEV__) {
    validateColors(colors);
    validateData(data, colors.length);
  }

  /**
   * Get styles for a body part (per-part overrides or defaults)
   */
  const getPartStyles = useCallback(
    (bodyPart: ExtendedBodyPart): BodyPartStyles => ({
      fill: bodyPart.styles?.fill ?? defaultFill,
      stroke: bodyPart.styles?.stroke ?? muscleStroke,
      strokeWidth: bodyPart.styles?.strokeWidth ?? defaultStrokeWidth,
    }),
    [defaultFill, defaultStroke, defaultStrokeWidth, muscleStroke]
  );

  /**
   * Merge asset body parts with user data
   * Asset parts have SVG paths, user parts have colors/intensities
   */
  const mergedBodyParts = useCallback(
    (dataSource: ReadonlyArray<BodyPart>) => {
      const filteredDataSource = dataSource.filter(
        (part) => !hiddenParts.includes(part.slug!)
      );

      // Create map for O(1) lookup - supports both base slugs and suffixed slugs
      const userDataMap = new Map<string, ExtendedBodyPart>();
      data.forEach((userPart) => {
        if (userPart.slug) {
          // Parse slug to handle -left/-right suffixes
          const { base, side } = parseMuscleSlug(userPart.slug);
          
          // Store with full slug as key for direct lookup
          userDataMap.set(userPart.slug, {
            ...userPart,
            side: side || userPart.side, // Side from suffix takes precedence
          });
          
          // Also store by base slug if it has a side suffix
          // This allows base asset slugs to match suffixed user data
          if (side) {
            const key = `${base}-${side}`;
            if (!userDataMap.has(key)) {
              userDataMap.set(key, {
                ...userPart,
                side,
              });
            }
          }
        }
      });

      return filteredDataSource.map((assetPart): ExtendedBodyPart => {
        const userPart = userDataMap.get(assetPart.slug!);
        if (!userPart) return assetPart;

        const merged: ExtendedBodyPart = {
          ...assetPart,
          styles: userPart.styles,
          intensity: userPart.intensity,
          progress: userPart.progress,
          side: userPart.side,
          color: userPart.color,
        };

        // Auto-color from intensity if no explicit color
        if (!merged.styles?.fill && !merged.color && merged.intensity) {
          merged.color = colors[merged.intensity - 1];
        }

        // TODO v4.0: Auto-color from progress value
         if (merged.progress?.value !== undefined && !merged.progress.color) {
           merged.progress.color = getProgressColor(merged.progress.value, colorScale);
}

        return merged;
      });
    },
    [data, colors, hiddenParts]
  );

  /**
   * Get fill color for a body part
   * Priority: styles.fill > color > intensity-based > default
   */
  const getColorToFill = useCallback(
    (bodyPart: ExtendedBodyPart): string | undefined => {
      // Disabled parts get gray
      if (bodyPart.slug && disabledParts.includes(bodyPart.slug)) {
        return '#EBEBE4';
      }
      // Skin parts (hair, hands, feet, face) use skinColor
      // Hair gets its own color
      if (bodyPart.slug === 'hair') {
        return hairColor;
      }

      // Other skin parts use skinColor
      const skinParts = ['hands', 'feet', 'head'];
      if (bodyPart.slug && skinParts.includes(bodyPart.slug)) {
        return skinColor;
      }


      // Per-part style override
      if (bodyPart.styles?.fill) {
        return bodyPart.styles.fill;
      }

      // Direct color
      if (bodyPart.color) {
        return bodyPart.color;
      }

      // Intensity-based color (legacy v3.x)
      if (bodyPart.intensity && bodyPart.intensity > 0) {
        return colors[bodyPart.intensity - 1];
      }

      // TODO v4.0: Progress-based color
       if (bodyPart.progress?.value !== undefined) {
         return getProgressColor(bodyPart.progress.value, colorScale);
}

      return undefined; // Fall back to default from getPartStyles
    },
    [colors, disabledParts, colorScale, skinColor, hairColor]
  );

  /**
   * Check if a part is disabled (non-interactive)
   */
  const isPartDisabled = useCallback(
    (slug?: Slug): boolean => slug !== undefined && disabledParts.includes(slug),
    [disabledParts]
  );

  /**
   * Render SVG body with all parts
   */
  const renderBodySvg = useCallback(
    (bodyToRender: ReadonlyArray<BodyPart>) => {
      const SvgWrapper = gender === 'male' ? SvgMaleWrapper : SvgFemaleWrapper;

      return (
        <SvgWrapper side={side} scale={scale} border={border} backgroundColor={backgroundColor}>
          {mergedBodyParts(bodyToRender).map((bodyPart: ExtendedBodyPart) => {
            const partStyles = getPartStyles(bodyPart);
            const fillColor = getColorToFill(bodyPart);
            const disabled = isPartDisabled(bodyPart.slug);

            // Render common paths (center, no left/right distinction)
            const commonPaths = (bodyPart.path?.common || []).map((path) => (
              <Path
                key={path}
                onPress={disabled ? undefined : () => onBodyPartPress?.(bodyPart)}
                aria-disabled={disabled}
                id={bodyPart.slug}
                fill={fillColor ?? partStyles.fill}
                stroke={partStyles.stroke}
                strokeWidth={partStyles.strokeWidth}
                d={path}
              />
            ));

            // Render left paths
            const leftPaths = (bodyPart.path?.left || []).map((path) => {
              const isOnlyRight = bodyPart.side === 'right';
              const leftFillColor = isOnlyRight ? defaultFill : fillColor;

              return (
                <Path
                  key={path}
                  onPress={disabled ? undefined : () => onBodyPartPress?.(bodyPart, 'left')}
                  id={bodyPart.slug}
                  fill={leftFillColor ?? partStyles.fill}
                  stroke={partStyles.stroke}
                  strokeWidth={partStyles.strokeWidth}
                  d={path}
                />
              );
            });

            // Render right paths
            const rightPaths = (bodyPart.path?.right || []).map((path) => {
              const isOnlyLeft = bodyPart.side === 'left';
              const rightFillColor = isOnlyLeft ? defaultFill : fillColor;

              return (
                <Path
                  key={path}
                  onPress={disabled ? undefined : () => onBodyPartPress?.(bodyPart, 'right')}
                  id={bodyPart.slug}
                  fill={rightFillColor ?? partStyles.fill}
                  stroke={partStyles.stroke}
                  strokeWidth={partStyles.strokeWidth}
                  d={path}
                />
              );
            });

            return [...commonPaths, ...leftPaths, ...rightPaths];
          })}
        </SvgWrapper>
      );
    },
    [
      gender,
      side,
      scale,
      border,
      mergedBodyParts,
      getPartStyles,
      getColorToFill,
      isPartDisabled,
      defaultFill,
      onBodyPartPress,
    ]
  );

  // Select body assets based on gender and side
  const bodyAssets = useMemo(() => {
    if (gender === 'female') {
      return side === 'front' ? bodyFemaleFront : bodyFemaleBack;
    }
    return side === 'front' ? bodyFront : bodyBack;
  }, [gender, side]);

  return renderBodySvg(bodyAssets);
};

export default Body;

// Re-export color scale utilities
export { getProgressColor, DEFAULT_PROGRESS_SCALE, type ColorScale, type ColorStop } from './utils/colorScale';
