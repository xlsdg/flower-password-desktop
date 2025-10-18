const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'src/renderer/assets/FlowerPassword', // Will auto-select .icns for macOS, .ico for Windows
    appBundleId: 'org.xlsdg.flowerpassword',
    // Ensure all necessary files are included
    extraResource: [],
    ignore: [
      /^\/src/, // Exclude source code directory
      /^\/\.git/, // Exclude git directory
      /^\/\.github/, // Exclude GitHub Actions
      /^\/\.vscode/, // Exclude VSCode configuration
      /tsconfig\.json$/, // Exclude TypeScript configuration
      /^\/\.eslintrc/, // Exclude ESLint configuration
      /^\/\.prettierrc/, // Exclude Prettier configuration
      /^\/\.prettierignore/, // Exclude Prettier ignore
      /\.ts$/, // Exclude TypeScript source files
      /\.map$/, // Exclude source map files
      /^\/CLAUDE\.md$/, // Exclude Claude instruction file
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: 'FlowerPassword',
        icon: 'src/renderer/assets/FlowerPassword.icns',
        format: 'ULFO', // Use ULFO format for better compatibility
      },
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux', 'win32'],
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'FlowerPassword',
        setupIcon: 'src/renderer/assets/FlowerPassword.ico',
      },
      platforms: ['win32'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'xLsDg',
          homepage: 'https://github.com/xlsdg/flower-password-desktop',
          icon: 'src/renderer/assets/FlowerPassword.png',
        },
      },
      platforms: ['linux'],
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/xlsdg/flower-password-desktop',
          icon: 'src/renderer/assets/FlowerPassword.png',
        },
      },
      platforms: ['linux'],
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
