# flower-password-desktop

Flower Password desktop app based on Electron. 现已迁移为 TypeScript + electron-builder 构建与发布。

![Screen Shot](screenshot.png)

## 0. 开发与构建

- 安装依赖：

```
npm install
```

- 本地运行（先编译 TS 并复制资源到 dist-app/）：

```
npm start
```

- 本地打包（macOS x64/arm64，产物在 dist/）：

```
make package
```

- GitHub Release（macOS/Windows/Linux 多平台矩阵）：
  1) 使用 `npm run release:patch|min|major` 升级版本并打 tag
  2) `git push --follow-tags` 触发 GitHub Actions 构建并创建 Release

项目入口与结构：

- 主进程：`src/main/app.ts`（编译至 `dist-app/main/app.js`，`package.json:main` 指向此文件）
- 渲染进程：`src/renderer/index.ts`（编译至 `dist-app/renderer/index.js`）
- 渲染 HTML/CSS：`src/renderer/index.html`、`src/renderer/styles/{reset.css,index.css}`（复制到 `dist-app/renderer/`）
- 资源：`images/**`（复制到 `dist-app/images/`）

说明：渲染页面通过 `require('./index.js')` 加载编译后的 CommonJS 包，以便在渲染进程中使用 `require/exports`。

说明：已移除旧版 `app.js` / `index.js`；请在 `src/**` 下进行开发。

## 1. 全局快捷键

Command + Alt + S

## 2. “花密”是用来干什么的

“花密”提供一种简单的密码管理方法，你只需要记住一个“记忆密码”，为不同的账号设置不同的“区分代号”，然后通过“花密”计算就可以得到对应的不同的复杂密码。

## 3. “花密” 的计算过程

假设记忆密码为“123456”，区分代号为“taobao”，通过“花密”计算加密，得到最终密码为“KfdDf77F7D64e5c0”。虽然原来的记忆密码比较简单，但是经过花密处理，密码就变得强壮了。

## 4. 如何使用“花密”

### A.设计一个和个人信息无关的“记忆密码”

（“记忆密码”可以由数字、大小写字母、符号或汉字组成）“记忆密码”是你唯一需要记忆的密码，为了防止社会工程学破解，请确保这个密码和你的个人信息无关且长度在6位以上，如生日、姓名拼音、手机号等都不能用来组成记忆密码。

### B.为需要加密的账号填写“区分代号”，使用“花密”计算出最终密码

（“区分代号”可以由数字、大小写字母、符号或汉字组成）如淘宝账号的区分代号可以设置成“taobao”、“tb”、“淘宝”等，注意不同的区分代号将会生成完全不同的最终密码。选择一种适合你的花密应用，如花密网页版，将“记忆密码”和“区分代号”填入，复制最终密码

### C.将原账号的密码修改成由“花密”计算出的最终密码

## 5. 官网地址

<https://flowerpassword.com/>
