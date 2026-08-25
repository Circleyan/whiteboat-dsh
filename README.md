# Whiteboat for DeepSeek Harness

Whiteboat is growing in the DeepSeek Harness ecosystem. The `0.1.x` release begins with a quiet water surface; later Whiteboat capabilities will join this same package instead of becoming separate top-level repositories.

## First slice: water surface

The first slice opens an unbranded water surface where you can pause, type, or use mobile dictation before beginning a real DSH Session. Merely looking at the surface creates no Session, Prompt, AI call, or write. Opening the composer prepares at most one blank Session; only an explicit non-empty send admits a Prompt.

The surface reuses Whiteboat's shared water field, boat, pointer navigation, mobile roaming, wake intensity, and celestial projection. Its composer, Workspace, Agent preset, commands, permissions, model, reasoning level, draft, and send lifecycle remain native to DSH.

## Installation

The package has not been published yet. After the release gate is approved, installation will be:

```sh
dsh plugin --profile web add whiteboat-dsh
```

## Mobile voice input

- iOS and Android system keyboard dictation is the baseline.
- The dedicated microphone appears only on coarse-pointer devices when the browser supports speech recognition and the page is a secure context.
- The first release does not save, upload, or independently transcribe raw audio.

## Development

Clone with the shared capability submodule:

```sh
git clone --recurse-submodules git@github.com:Circleyan/whiteboat-dsh.git
cd whiteboat-dsh
npm install
npm test
npm run build
npm pack
```

`npm install` builds the exact `whiteboat-core` submodule revision before DSH tests or bundling. The published DSH client bundle contains the required core code and has no runtime dependency on the private submodule.

The current compatibility target is `@deepseek-ai/dsh` `0.1.1-rc.2`. DSH is still in developer preview, so host compatibility is verified independently for every release.

## Roadmap boundary

Water surface is the first released feature, not the identity of this repository. Future features live under `src/features/` or equivalent host adapters and reuse `whiteboat-core` when their product semantics are genuinely shared with Obsidian. Feature parity is not automatic: every capability keeps its own DSH lifecycle and runtime proof.
