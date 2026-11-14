# vue-features

Entitled Vue feature mounts — lazy-load product UI only when allowed, register custom elements once, and freeze launch props.

Three roles:

| Role | Use |
| --- | --- |
| **Widget** | `useFeatureRuntime` / `createEntitledFeature` inside the feature |
| **Host** | entitle → load → mount list → bus lifecycle |
| **Lab** | `@westlane/vue-features/dev` (+ optional `./lab-vite`) |


## Install

```bash
yarn add @westlane/vue-features
#or
npm install @westlane/vue-features
```

Peer: `vue ^3.5`


## Usage


### Entitled SFC

```ts
import { createEntitledFeature } from "@westlane/vue-features";

const Vote = createEntitledFeature({
  loader: () => import("./VotePanel.vue"),
});
```

```vue
<Vote :entitled="canUseVote" :spec="voteSpec" />
```


### Custom elements

```ts
import { loadFeatureElements } from "@westlane/vue-features";

await loadFeatureElements(
  [{ key: "vote", tag: "app-vote", load: () => import("./vote.ce") }],
  bus,
);
```


### Widget runtime

```ts
import { useFeatureRuntime } from "@westlane/vue-features";

const { spec, hostContext, reportReady, emitSignal } = useFeatureRuntime(props);
```


### Lab host

```ts
import { mountDevFeatureHost } from "@westlane/vue-features/dev";

mountDevFeatureHost(VoteCE, {
  tag: "app-vote",
  featureKey: "vote",
  instanceId: "vote-1",
  spec: {},
  hostContext: {},
  title: "Vote lab",
});
```

Runnable demo (`examples/vue-vite`): `yarn demo` — entitled Vote with Tailwind (port 5190).


## Advanced


### Allowlisted registry

```ts
import { createFeatureRegistry, defineFeatureEntry } from "@westlane/vue-features";

const registry = createFeatureRegistry([
  {
    key: "vote",
    load: async () =>
      defineFeatureEntry({
        mount(el, props) { /* … */ },
        unmount(el) { /* … */ },
      }),
  },
]);

registry.get("vote"); // ok
registry.get("evil"); // undefined
```


### Host helpers

```ts
import {
  filterEntitledFeatures,
  loadEntitledFeatures,
  useFeatureMountLifecycle,
  useFeatureLaunchSnapshots,
} from "@westlane/vue-features";
```

Inject your own `has()` (Clerk, GrowthBook, …). Not a feature-flag SDK.


### Vite lab config

```ts
import { createFeatureLabViteConfig } from "@westlane/vue-features/lab-vite";
```


## Scripts

```bash
yarn install
yarn test
yarn typecheck
yarn lint
yarn demo        # examples/vue-vite lab on :5190
yarn run check   # lint + typecheck + test + build
yarn build
```

Hooks: **pre-commit** lint-staged; **pre-push** typecheck + test.


## License

MIT
