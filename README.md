# Whiteboat for DeepSeek Harness

Whiteboat is growing in the DeepSeek Harness ecosystem. The `0.1.x` release begins with a quiet water surface; later Whiteboat capabilities will join this same package instead of becoming separate top-level repositories.

## First slice: water surface

The first slice opens an unbranded water surface where you can pause or type before beginning a real DSH Session. Merely looking at the surface creates no Session, Prompt, AI call, or write. Opening the composer prepares at most one blank Session; only an explicit non-empty send admits a Prompt.

The surface reuses Whiteboat's shared water field, boat, pointer navigation, mobile roaming, wake intensity, and celestial projection. Its composer, Workspace, Agent preset, commands, permissions, model, reasoning level, draft, and send lifecycle remain native to DSH.

## Installation / 安装

`whiteboat-dsh` 尚未发布到 npm。当前版本请从 GitHub 源码打包，再安装到 DSH 的 `web` profile。仓库仍为 Private 时，执行克隆的 GitHub 账号需要拥有仓库访问权限。

准备环境：Node.js `>=20.19`、Git、pnpm，以及可访问 GitHub 的终端。

### 1. 克隆并打包

```sh
git clone --recurse-submodules https://github.com/Circleyan/whiteboat-dsh.git
cd whiteboat-dsh
npm install
npm pack
```

`npm pack` 会先运行测试和构建，成功后在仓库根目录生成 `whiteboat-dsh-0.1.0.tgz`。

### 2. 安装到 DSH

```sh
pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add "$PWD/whiteboat-dsh-0.1.0.tgz"
```

### 3. 启动

```sh
pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 --profile web
```

DSH 会打开浏览器；也可以按终端打印的本地地址手动访问。若已经全局安装同版本 DSH，可把上面命令中的 `pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2` 替换为 `dsh`。

### 更新

```sh
git pull --ff-only
git submodule update --init --recursive
npm install
npm pack
pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web remove whiteboat-dsh
pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add "$PWD/whiteboat-dsh-0.1.0.tgz"
```

更新后重新启动 DSH。卸载时只需运行：

```sh
pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web remove whiteboat-dsh
```

待 npm 正式发布后，安装命令会简化为 `dsh plugin --profile web add whiteboat-dsh`；现在请不要使用这条尚未生效的命令。

## Mobile input

The DSH water surface provides text input on mobile. It does not render a microphone control, request microphone permission, or call browser speech-recognition APIs. Features exposed by a user's operating-system keyboard are controlled by the operating system and browser, not by this package, and are not part of the DSH capability contract.

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
