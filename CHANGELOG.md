# Changelog

All notable changes to this project will be documented in this file.

## [4.0.0] - 2024-12-08

### Added

- **Progress-based color system**: Track both positive and negative progress values (-100 to +100) with automatic color coding
- **ColorScale interface**: Customizable color scales with linear and step interpolation
- **DEFAULT_PROGRESS_SCALE**: Built-in color scale (Red → Gray → Neutral → Green)
- **Development validation**: Comprehensive prop validation with helpful warnings (dev mode only)
- **Full TypeScript strict mode**: Enhanced type safety with strict compiler settings
- **Test coverage**: 95%+ code coverage with comprehensive test suite
- **Export utilities**: `getProgressColor`, `ColorScale`, `ColorStop` now exported

### Changed

- **Component architecture**: Optimized rendering with useCallback and useMemo
- **Build system**: Modernized with TypeScript 5.7.0
- **Project structure**: All sources moved to `src/` directory
- **Package manager**: Migrated from Yarn to npm

### Enhanced

- **BodyPartProgress interface**: Now supports progress values with optional color overrides
- **Props interface**: Added `progressScale` prop for custom color scales
- **Color priority**: Updated to `styles.fill > progress.color > color > intensity > default`
- **Documentation**: Complete README with examples and API reference

### Maintained

- Full backward compatibility with v3.x intensity-based API
- All existing props and behaviors unchanged
- Original SVG assets and gender/side support

## [3.1.3] - Original Version

Original implementation by Hicham ELABBASSI
