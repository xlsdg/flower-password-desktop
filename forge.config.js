const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'src/renderer/assets/FlowerPassword.icns',
    appBundleId: 'org.xlsdg.flowerpassword',
    // 确保包含所有必要的文件
    extraResource: [],
    ignore: [
      /^\/src/, // 排除源代码目录
      /^\/\.git/, // 排除 git 目录
      /^\/\.github/, // 排除 GitHub Actions
      /^\/\.vscode/, // 排除 VSCode 配置
      /tsconfig\.json$/, // 排除 TypeScript 配置
      /^\/\.eslintrc/, // 排除 ESLint 配置
      /^\/\.prettierrc/, // 排除 Prettier 配置
      /^\/\.prettierignore/, // 排除 Prettier ignore
      /\.ts$/, // 排除 TypeScript 源文件
      /\.map$/, // 排除 source map 文件
      /^\/CLAUDE\.md$/, // 排除 Claude 指令文件
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
