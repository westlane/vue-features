# `@westlane/vue-features`

Entitled Vue feature mounts — lazy-load product UI only when allowed, register custom elements once, and freeze launch props.

> Package A in the westlane stack: **feature mounts**. Personalization (flags, Clerk, segments) and json-render generative UI are separate packages that plug into this registry.

## Install

```bash
yarn add @westlane/vue-features
# peer: vue ^3.5
```

## Quick start

### Entitled lazy component

```ts
import { createEntitledFeature } from '@westlane/vue-features'

const Chart = createEntitledFeature({
  loader: () => import('./ChartPanel.vue'),
})
```

```vue
<Chart :entitled="canUseCharts" :spec="chartSpec" />
```

The dynamic `loader` runs only when `entitled === true`, so ungated users never download the chunk.

### Custom element registry

```ts
import { loadFeatureElements, type FeatureEventBus } from '@westlane/vue-features'

await loadFeatureElements(
  [{ key: 'chart', tag: 'app-chart', load: () => import('./chart.ce') }],
  bus,
)
```

### Allowlisted registry (generative UI hosts)

```ts
import { createFeatureRegistry, defineFeatureEntry } from '@westlane/vue-features'

const registry = createFeatureRegistry([
  {
    key: 'chart',
    load: async () =>
      defineFeatureEntry({
        mount(el, props) {
          /* createApp(...).mount(el) */
        },
        unmount(el) {
          /* teardown */
        },
      }),
  },
])

// Agent may only request keys present in the registry
registry.get('chart') // ok
registry.get('evil') // undefined — do not load
```

### Launch-once + lifecycle

```ts
import { useFeatureRuntime } from '@westlane/vue-features'

const { spec, hostContext, reportReady, emitSignal } = useFeatureRuntime(props)
```

## API

| Export | Role |
| --- | --- |
| `createEntitledFeature` | Gate + `defineAsyncComponent` |
| `defineFeatureEntry` | `mount` / `unmount` / `update` contract |
| `registerFeatureElement` / `loadFeatureElements` / `loadEntitledFeatures` | CE define-once + chunk events |
| `filterEntitledFeatures` / `mergeFeatureHas` | Host entitlement filter (inject `has`) |
| `resolveFeatureMount` / `findFeatureEntry` | Instance → mount props |
| `createFeatureRegistry` | Allowlisted feature keys |
| `useLaunchOnce` | Freeze launch props |
| `useFeatureLifecycle` | Widget ready / error / disposed |
| `useFeatureMountLifecycle` | Host mount list → mounting / unmounting |
| `useFeatureInstanceRegistry` | Host instance state from bus events |
| `useFeatureLaunchSnapshots` | Freeze launch props per instance id |
| `useBroadcastHostContext` | Push live host context on the bus |
| `useFeatureRuntime` | Launch + live host context + signals |
| `FeatureEvents` | Default event name constants |
| `@westlane/vue-features/dev` | Lab host + in-memory bus |
| `@westlane/vue-features/lab-vite` | Shared Vite config for CE labs |

## Design notes

- **Not a feature-flag SDK** — pass `entitled: boolean` from Clerk, LaunchDarkly, GrowthBook, ConfigCat, etc.
- **Not qiankun / MFE** — same-origin Vue chunks; optional remote `load()` is your choice.
- **Not `@baleada/vue-features`** — that package is UI composables; this one is product feature mounts.

## Scripts

```bash
yarn install
yarn test
yarn typecheck
yarn build
```

## License

MIT
