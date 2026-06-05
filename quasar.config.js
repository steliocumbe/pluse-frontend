// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig((ctx) => ({
  boot: ['i18n', 'axios'],

  // Tailwind v4 entry must come before app.scss so SCSS overrides win.
  css: ['tailwind.css', 'app.scss'],

  extras: ['material-icons'],

  build: {
    target: {
      browser: 'baseline-widely-available',
      node: 'node22',
    },

    publicPath: ctx.mode.electron ? './' : '/',
    vueRouterMode: 'hash',

    vitePlugins: [
      [
        '@intlify/unplugin-vue-i18n/vite',
        {
          ssr: ctx.modeName === 'ssr',
          include: [fileURLToPath(new URL('./src/i18n', import.meta.url))],
        },
      ],
      [
        'vite-plugin-checker',
        {
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
            useFlatConfig: true,
          },
        },
        { server: false },
      ],
    ],
  },

  devServer: {
    open: true,
  },

  framework: {
    config: {},
    plugins: ['Notify', 'Dialog'],
  },

  animations: [],

  ssr: {
    prodPort: 3000,
    middlewares: ['render'],
    pwa: false,
  },

  pwa: {
    workboxMode: 'GenerateSW',
  },

  cordova: {},

  capacitor: {
    hideSplashscreen: true,
  },

  electron: {
    preloadScripts: ['electron-preload'],
    inspectPort: 5858,
    bundler: 'builder',
    unPackagedInstallParams: ['install', '--prod', '--ignore-workspace'],

    packager: {
      name: 'PLUSE',
      productName: 'PLUSE',
      executableName: 'PLUSE',
    },

    builder: {
      appId: 'co.mz.pluse.desktop',
      productName: 'PLUSE',
      copyright: 'Copyright © 2026 PLUSE',
      publish: null,
      directories: {
        output: 'dist/electron/Packaged',
      },
      win: {
        target: ['nsis'],
        icon: 'src-electron/icons/icon.ico',
        forceCodeSigning: false,
        signAndEditExecutable: false,
      },
      afterPack(context) {
        if (context.electronPlatformName !== 'win32') return

        const executablePath = path.join(context.appOutDir, 'PLUSE.exe')
        const iconPath = path.join(projectRoot, 'src-electron', 'icons', 'icon.ico')
        const rceditPath = path.join(
          projectRoot,
          'node_modules',
          'electron-winstaller',
          'vendor',
          'rcedit.exe',
        )

        execFileSync(rceditPath, [executablePath, '--set-icon', iconPath], {
          stdio: 'inherit',
        })
      },
      nsis: {
        oneClick: false,
        perMachine: false,
        installerIcon: 'src-electron/icons/icon.ico',
        uninstallerIcon: 'src-electron/icons/icon.ico',
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: 'PLUSE',
      },
    },
  },

  bex: {
    extraScripts: [],
  },
}))
