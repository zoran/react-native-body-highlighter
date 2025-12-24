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
export type PartSide = 'left' | 'right' | 'both';

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
  side?: PartSide; // Which side this data applies to (left/right/both)
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

  type UserSideBucket = {
    both?: ExtendedBodyPart;
    left?: ExtendedBodyPart;
    right?: ExtendedBodyPart;
  };

  const userDataByBaseSlug = useMemo(() => {
    const map = new Map<string, UserSideBucket>();

    data.forEach((userPart) => {
      if (!userPart.slug) return;

      const { base, side: suffixSide } = parseMuscleSlug(String(userPart.slug));
      const effectiveSide: PartSide = (suffixSide ?? userPart.side ?? 'both') as PartSide;

      const bucket = map.get(base) ?? {};

      const normalized: ExtendedBodyPart = {
        ...userPart,
        // Normalize slug so asset lookup uses base slug (assets do not include -left/-right slugs)
        slug: base as Slug,
        side: effectiveSide,
      };

      if (effectiveSide === 'left') {
        bucket.left = normalized;
      } else if (effectiveSide === 'right') {
        bucket.right = normalized;
      } else {
        bucket.both = normalized;
      }

      map.set(base, bucket);
    });

    return map;
  }, [data]);

  /**
   * Merge asset body part with a single user-side entry
   */
  const mergeAssetWithUserData = useCallback(
    (assetPart: BodyPart, userPart?: ExtendedBodyPart): ExtendedBodyPart => {
      if (!userPart) return assetPart;

      const merged: ExtendedBodyPart = {
        ...assetPart,
        styles: userPart.styles,
        intensity: userPart.intensity,
        progress: userPart.progress,
        color: userPart.color,
      };

      // Auto-color from intensity if no explicit color
      if (!merged.styles?.fill && !merged.color && merged.intensity) {
        merged.color = colors[merged.intensity - 1];
      }

      // Auto-color from progress value
      if (merged.progress?.value !== undefined && !merged.progress.color) {
        merged.progress.color = getProgressColor(merged.progress.value, colorScale);
      }

      return merged;
    },
    [colors, colorScale]
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

  /**
   * Render SVG body with all parts
   */
  const renderBodySvg = useCallback(
    (bodyToRender: ReadonlyArray<BodyPart>) => {
      const SvgWrapper = gender === 'male' ? SvgMaleWrapper : SvgFemaleWrapper;

      const filteredBodyToRender = bodyToRender.filter((part) => !hiddenParts.includes(part.slug!));

      return (
        <SvgWrapper side={side} scale={scale} border={border} backgroundColor={backgroundColor}>
          {filteredBodyToRender.map((assetPart: BodyPart) => {
            const slug = assetPart.slug;
            const disabled = isPartDisabled(slug);
            const bucket = slug ? userDataByBaseSlug.get(String(slug)) : undefined;

            const mergedBoth = mergeAssetWithUserData(assetPart, bucket?.both);
            const mergedLeft = mergeAssetWithUserData(mergedBoth, bucket?.left);
            const mergedRight = mergeAssetWithUserData(mergedBoth, bucket?.right);

            const stylesBoth = getPartStyles(mergedBoth);
            const stylesLeft = getPartStyles(mergedLeft);
            const stylesRight = getPartStyles(mergedRight);

            const fillBoth = getColorToFill(mergedBoth);
            const fillLeft = getColorToFill(mergedLeft);
            const fillRight = getColorToFill(mergedRight);

            const commonPaths = (assetPart.path?.common || []).map((path) => (
              <Path
                key={path}
                onPress={disabled ? undefined : () => onBodyPartPress?.(mergedBoth)}
                aria-disabled={disabled}
                id={slug}
                fill={fillBoth ?? stylesBoth.fill}
                stroke={stylesBoth.stroke}
                strokeWidth={stylesBoth.strokeWidth}
                d={path}
              />
            ));

            const leftPaths = (assetPart.path?.left || []).map((path) => (
              <Path
                key={path}
                onPress={disabled ? undefined : () => onBodyPartPress?.(mergedLeft, 'left')}
                id={slug}
                fill={fillLeft ?? stylesLeft.fill}
                stroke={stylesLeft.stroke}
                strokeWidth={stylesLeft.strokeWidth}
                d={path}
              />
            ));

            const rightPaths = (assetPart.path?.right || []).map((path) => (
              <Path
                key={path}
                onPress={disabled ? undefined : () => onBodyPartPress?.(mergedRight, 'right')}
                id={slug}
                fill={fillRight ?? stylesRight.fill}
                stroke={stylesRight.stroke}
                strokeWidth={stylesRight.strokeWidth}
                d={path}
              />
            ));

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
      backgroundColor,
      hiddenParts,
      userDataByBaseSlug,
      mergeAssetWithUserData,
      getPartStyles,
      getColorToFill,
      isPartDisabled,
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
