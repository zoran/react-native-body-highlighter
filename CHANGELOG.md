# Changelog

All notable changes to this project will be documented in this file.

## [5.0.1] - 2025-12-24

### Fixed
- Support multiple user data entries per base `slug` using `side` (`left`/`right`/`both`) so left/right progress can render simultaneously without overlays.
- Accept `-left`/`-right` slug suffixes in validation for bilateral muscles (backward compatible with existing usage).

## [5.0.0] - 2024-12-24

### Added
- **Left/Right muscle suffix support** - Bilateral muscles can now be targeted independently using `-left` and `-right` suffixes.
- New types: `BaseMuscleSlug`, `BilateralMuscleSlug`, `ExtendedMuscleSlug`.
  - Supported bilateral muscles: biceps, calves, deltoids, forearm, gluteal, hamstring, quadriceps, triceps.
  - Example: `{ slug: 'biceps-left', intensity: 5 }` will color only the left biceps.
- Slug parser utility (`utils/slugParser.ts`) with functions:
  - `parseMuscleSlug()` - Parse slug with optional side suffix.
  - `hasSideSuffix()` - Check if slug has a side suffix.
  - `getBaseMuscle()` - Get base muscle name without suffix.
- Comprehensive tests for slug parsing (12 new tests).

### Changed
- Enhanced `mergedBodyParts()` to parse and handle suffixed slugs.
- Slug type now includes template literal types for type-safe suffixes.
- Side from suffix takes precedence over explicit `side` property.

### Backward Compatibility
- ✅ All existing code continues to work without changes.
- Non-suffixed slugs work exactly as before.
- Explicit `side` property still supported (but suffix takes precedence).

### Use Cases
- **Unilateral training tracking** - Show different progress for left/right sides.
- **Injury visualization** - Highlight a specific side of a bilateral muscle.
- **Strength imbalance detection** - Visual feedback for asymmetric development.

## [4.3.1] - Previous version
- Progress-based color system
- Automatic anatomical mirroring
- Controlled component API
