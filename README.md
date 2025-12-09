# @zoran/react-native-body-highlighter

Enhanced React Native body highlighter with progress tracking, anatomical mirroring, and comprehensive TypeScript support.

## Features

### ✨ Version 4.0 Enhancements

- **Progress-Based Color System**: Track both positive and negative progress with automatic color coding
- **Anatomical Mirroring**: Automatic left/right mirroring when switching between front/back views
- **Controlled Component API**: Full control over component state
- **TypeScript Strict Mode**: Complete type safety with strict compiler settings
- **Development Validation**: Helpful warnings for invalid props (development mode only)
- **Full Test Coverage**: 95%+ code coverage with comprehensive test suite

### 📊 Progress Tracking (New in v4.0)

Display progress values from -100 (decrease) to +100 (increase) with automatic color coding:

```tsx
import Body, { DEFAULT_PROGRESS_SCALE } from '@zoran/react-native-body-highlighter';

const data = [
  { 
    slug: 'chest', 
    progress: { value: 50 }  // 50% improvement - automatically green
  },
  { 
    slug: 'biceps', 
    progress: { value: -25 }  // 25% decrease - automatically red
  },
  { 
    slug: 'abs', 
    progress: { value: 0 }  // No change - gray
  },
];

<Body data={data} />
```

### 🎨 Custom Color Scales

Define your own color scales for progress visualization:

```tsx
import { ColorScale } from '@zoran/react-native-body-highlighter';

const customScale: ColorScale = {
  stops: [
    { value: -100, color: '#ff0000' },  // Red for negative
    { value: 0, color: '#ffffff' },     // White for neutral
    { value: 100, color: '#00ff00' },   // Green for positive
  ],
  interpolation: 'linear',
};

<Body data={data} progressScale={customScale} />
```

### 🔄 Backward Compatibility

Fully compatible with v3.x intensity-based API:

```tsx
const data = [
  { slug: 'chest', intensity: 1 },
  { slug: 'biceps', intensity: 2 },
];

<Body 
  data={data} 
  colors={['#0984e3', '#74b9ff']} 
/>
```

## Installation

```bash
npm install @zoran/react-native-body-highlighter
```

## Basic Usage

```tsx
import Body from '@zoran/react-native-body-highlighter';

function App() {
  const data = [
    { slug: 'chest', intensity: 1 },
    { slug: 'biceps', intensity: 2 },
    { slug: 'abs', intensity: 1 },
  ];

  return (
    <Body
      data={data}
      colors={['#0984e3', '#74b9ff']}
      scale={1}
      side="front"
      gender="male"
      onBodyPartPress={(part) => console.log(part.slug)}
    />
  );
}
```

## Props

### Required

| Prop | Type | Description |
|------|------|-------------|
| `data` | `ExtendedBodyPart[]` | Array of body parts to highlight |

### Optional

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colors` | `string[]` | `['#0984e3', '#74b9ff']` | Colors for intensity-based highlighting (v3.x) |
| `progressScale` | `ColorScale` | `DEFAULT_PROGRESS_SCALE` | Color scale for progress values (v4.0) |
| `scale` | `number` | `1` | Scale factor for the SVG |
| `side` | `'front' \| 'back'` | `'front'` | Which side of the body to show |
| `gender` | `'male' \| 'female'` | `'male'` | Gender for body model |
| `border` | `string \| 'none'` | `'#dfdfdf'` | Border color |
| `defaultFill` | `string` | `'#3f3f3f'` | Default fill color for unhighlighted parts |
| `defaultStroke` | `string` | `'none'` | Default stroke color |
| `defaultStrokeWidth` | `number` | `0` | Default stroke width |
| `disabledParts` | `Slug[]` | `[]` | Non-interactive body parts |
| `hiddenParts` | `Slug[]` | `[]` | Parts to hide |
| `onBodyPartPress` | `function` | - | Callback when a part is pressed |

## Body Part Slugs

Available body part identifiers:

- `abs`, `adductors`, `ankles`, `biceps`, `calves`, `chest`, `deltoids`
- `feet`, `forearm`, `gluteal`, `hamstring`, `hands`, `hair`, `head`
- `knees`, `lower-back`, `neck`, `obliques`, `quadriceps`, `tibialis`
- `trapezius`, `triceps`, `upper-back`

## TypeScript Support

Full TypeScript support with strict type checking:

```tsx
import Body, { ExtendedBodyPart, Slug, BodyPartProgress } from '@zoran/react-native-body-highlighter';

const data: ExtendedBodyPart[] = [
  {
    slug: 'chest' as Slug,
    progress: {
      value: 50,
      color: '#22c55e', // Optional override
    } as BodyPartProgress,
  },
];
```

## Credits

This is an enhanced fork of the original [react-native-body-highlighter](https://github.com/HichamELBSI/react-native-body-highlighter) by Hicham ELABBASSI.

### Enhancements in v4.0

- Progress-based color system for tracking improvements/declines
- Automatic color interpolation with customizable scales
- TypeScript strict mode with comprehensive types
- Full test coverage (95%+)
- Development-mode validation
- Modern build system
- Improved documentation

## License

MIT

## Author

Zoran (enhancements) - Based on work by Hicham ELABBASSI (original)
