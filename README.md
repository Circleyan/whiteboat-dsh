# Whiteboat for DeepSeek Harness

Whiteboat is growing in the DeepSeek Harness ecosystem. The `0.1.x` release begins with a quiet water surface; later Whiteboat capabilities will join this same package instead of becoming separate top-level repositories.

## First slice: water surface

The first slice opens an unbranded water surface where you can pause or type before beginning a real DSH Session. Merely looking at the surface creates no Session, Prompt, AI call, or write. Opening the composer prepares at most one blank Session; only an explicit non-empty send admits a Prompt.

The surface reuses Whiteboat's shared water field, boat, pointer navigation, mobile roaming, wake intensity, and celestial projection. Its composer, Workspace, Agent preset, commands, permissions, model, reasoning level, draft, and send lifecycle remain native to DSH.

## Settings / 配置

打开 DSH 设置，在“白舟”页面可调整“小船跟随速度”。默认值为 `100%`，可在 `50%` 到 `200%` 之间调整；修改后会立即用于指针跟随、点击或触控目的地以及手机漫游，并保存在 DSH 的设置文档中。该设置只改变小船的航行速度，不改变水面、投影、Canvas 或 Session 语义。

## Installation / 安装

准备环境：Node.js `>=20.19` 与 pnpm。直接把 GitHub Release 中的预构建包安装到 DSH 的 `web` profile：

```sh
pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add https://github.com/Circleyan/whiteboat-dsh/releases/download/v0.1.0/whiteboat-dsh-0.1.0.tgz
```

然后启动 DSH：

```sh
pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 --profile web
```

DSH 会打开浏览器；也可以按终端打印的本地地址手动访问。若已经全局安装同版本 DSH，可把上面命令中的 `pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2` 替换为 `dsh`。

### 更新

从 [GitHub Releases](https://github.com/Circleyan/whiteboat-dsh/releases) 选择新版本，并用对应 tarball URL 再次执行 `plugin --profile web add`。更新后重新启动 DSH。

卸载时运行：

```sh
pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web remove whiteboat-dsh
```

## Mobile input

The DSH water surface provides text input on mobile. It does not render a microphone control, request microphone permission, or call browser speech-recognition APIs. Features exposed by a user's operating-system keyboard are controlled by the operating system and browser, not by this package, and are not part of the DSH capability contract.

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

The migration baseline pins `whiteboat-core@daf4122`, which owns the shared non-integral-height water wrapping fix, common boat-speed normalization contract, and candidate design-system foundation. Host installation and runtime acceptance remain independent from that core proof.

The current compatibility target is `@deepseek-ai/dsh` `0.1.1-rc.2`. DSH is still in developer preview, so host compatibility is verified independently for every release.

## Roadmap boundary

Water surface is the first released feature, not the identity of this repository. Future features live under `src/features/` or equivalent host adapters and reuse `whiteboat-core` when their product semantics are genuinely shared with Obsidian. Feature parity is not automatic: every capability keeps its own DSH lifecycle and runtime proof.
