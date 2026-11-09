# Whiteboat for DeepSeek Harness

Whiteboat is growing in the DeepSeek Harness ecosystem. The `0.2.x` release begins with a quiet water surface; later Whiteboat capabilities will join this same package instead of becoming separate top-level repositories.

## First slice: water surface

The first slice opens an unbranded water surface where you can pause or type before beginning a real DSH Session. Merely looking at the surface creates no Session, Prompt, AI call, or write. Opening the composer prepares at most one blank Session; only an explicit non-empty send admits a Prompt.

The surface reuses Whiteboat's shared water field, boat, pointer navigation, mobile roaming, wake intensity, and celestial projection. Its composer, Workspace, Agent preset, commands, permissions, model, reasoning level, draft, and send lifecycle remain native to DSH.

The water surface includes the same gentle, offline water recording used by Whiteboat Home. Sound fades with boat movement. Use the speaker button in the upper right or “白舟 → 水面 → 水面音效” in settings to mute it; DSH remembers the choice. If the browser blocks autoplay, an ordinary click, touch, or key press starts the sound. Leaving the surface or hiding the page stops playback. No microphone access is involved. Sending an idea also drops one randomly chosen stone into the water. Audio attribution is in [AUDIO-LICENSE.md](AUDIO-LICENSE.md).

After an explicit send, a circular ripple expands from the centre of the native Conversation composer, then the water surface yields to DSH's native Conversation detail. Messages, run phases, tools, and agents stay in DSH's detail surface. Obsidian's ripple is a Canvas-node context surface and does not become a DSH node view; this package does not copy Canvas nodes, edges, or ripple state.

## Settings / 配置

打开 DSH 设置，在“白舟”页面可调整“小船跟随速度”。新设置默认值为 `60%`，已有保存值保留，可在 `50%` 到 `200%` 之间调整；修改后会立即用于指针跟随、点击或触控目的地以及手机漫游，并保存在 DSH 的设置文档中。该设置只改变小船的航行速度，不改变水面、投影、Canvas 或 Session 语义。

水面采用圆盘波光和透明水层。「水纹大小」默认 `90%`，支持 `50%`–`200%`，保存后立即生效。

## Installation / 安装

兼容目标：DSH `0.1.1-rc.2` web profile。准备 Node.js `>=20.19` 与 pnpm，并在独立的本地启动目录保存这两个配置文件：[package.json](https://github.com/Circleyan/whiteboat-dsh/blob/v0.2.0/docs/dsh-launcher/package.json) 和 [pnpm-workspace.yaml](https://github.com/Circleyan/whiteboat-dsh/blob/v0.2.0/docs/dsh-launcher/pnpm-workspace.yaml)。配置固定了该宿主所需的 Cordis 依赖；避免旧宿主自动取得不兼容的新依赖。然后在该目录运行：

```sh
pnpm install
pnpm exec dsh plugin --profile web add https://github.com/Circleyan/whiteboat-dsh/releases/download/v0.2.0/whiteboat-dsh-0.2.0.tgz
pnpm exec dsh --profile web
```

DSH 会打开浏览器；也可以按终端打印的本地地址手动访问。已有数据保留在所选 DSH profile 中。

### 更新

从 [GitHub Releases](https://github.com/Circleyan/whiteboat-dsh/releases) 选择新版本，并用对应 tarball URL 再次执行 `plugin --profile web add`。更新后重新启动 DSH。

卸载时运行：

```sh
pnpm exec dsh plugin --profile web remove whiteboat-dsh
```

## Mobile input

The DSH water surface provides text input on mobile. It does not render a microphone control, request microphone permission, or call browser speech-recognition APIs. Features exposed by a user's operating-system keyboard are controlled by the operating system and browser, not by this package, and are not part of the DSH capability contract.

## DSH 0.1.1-rc.2 dependency compatibility

The old DSH release currently resolves newer Cordis packages that cannot mount its standard preset. Create a separate local launcher folder and use the checked configuration in [docs/dsh-launcher/package.json](docs/dsh-launcher/package.json) and [docs/dsh-launcher/pnpm-workspace.yaml](docs/dsh-launcher/pnpm-workspace.yaml). Run `pnpm install`, then `pnpm exec dsh plugin --profile web add https://github.com/Circleyan/whiteboat-dsh/releases/download/v0.2.0/whiteboat-dsh-0.2.0.tgz` and `pnpm exec dsh --profile web`. Existing DSH data stays in its selected profile. These files pin host dependencies; they do not alter DSH source.

## Development

Source development currently requires access to the pinned private `Circleyan/whiteboat-core` submodule. Runtime users installing the prebuilt GitHub Release do not need that repository access.

Clone with the shared capability submodule:

```sh
git clone --recurse-submodules git@github.com:Circleyan/whiteboat-dsh.git
cd whiteboat-dsh
npm install
npm test
npm run build
npm pack
```

`npm install` builds the exact `whiteboat-core` submodule revision before DSH tests or bundling. The released DSH client bundle contains the required core code and has no runtime dependency on the private submodule.

The exact `vendor/whiteboat-core` gitlink owns the shared non-integral-height water wrapping fix, common boat-speed normalization contract, candidate design-system foundation, and host-neutral water sound playback. Host installation and runtime acceptance remain independent from that core proof.

The current compatibility target is `@deepseek-ai/dsh` `0.1.1-rc.2`. DSH is still in developer preview, so host compatibility is verified independently for every release.

### Maintainer release

Ordinary pushes and pull requests run verification only. A public package is created from GitHub Actions with the manually dispatched `Release DSH` workflow on `main`; the entered version must already match `package.json`. The workflow resolves the exact `whiteboat-core` gitlink, reruns tests and build, creates the `.tgz`, waits at the `dsh-release` environment gate, requires its `DSH_RELEASE_GATE=enabled` variable, and then creates the GitHub Release. It does not run `npm publish`.

## Roadmap boundary

Water surface is the first released feature, not the identity of this repository. Future features live under `src/features/` or equivalent host adapters and reuse `whiteboat-core` when their product semantics are genuinely shared with Obsidian. Feature parity is not automatic: every capability keeps its own DSH lifecycle and runtime proof.

### 本地视觉调整 · 2026-09-24

3D 小船采用主舟确认的亮色 C / 暗色 E：白天舱内反差更柔和，夜间船身适度提亮；太阳 / 月亮方向、云遮明暗和水面投影继续参与画面。夜间材质与 Obsidian 一致。这组调整已随 `0.1.2` 进入源码与预构建包；真实客户端的视觉验收仍是独立门禁。