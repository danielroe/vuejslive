#!/usr/bin/env node
// @ts-check

import { defineCommand, runMain } from 'citty'
import { resolve } from 'pathe'
import { createDevServer, createNitro, prepare, build, copyPublicAssets, prerender } from 'nitropack'
import vuePlugin from '@vitejs/plugin-vue'
import { defineLazyEventHandler, defineEventHandler, fromNodeMiddleware } from 'h3'
import { build as buildVite, createServer } from 'vite'

const defaultViteConfig = {
  plugins: [vuePlugin()],
  build: {
    outDir: '.nitro/client',
  },
}
/** @type {import('nitropack').NitroConfig} */
const defaultNitroConfig = {
  publicAssets: [
    {
      dir: './.nitro/client/assets',
      baseURL: '/assets',
      maxAge: 31536000,
    },
  ],
  handlers: [
    {
      route: '/**',
      handler: './app/server'
    }
  ],
  devStorage: {
    templates: {
      driver: 'fs',
      base: '.nitro/templates'
    }
  },
  bundledStorage: ['templates'],
  devHandlers: [
    {
      route: '/__vite',
      handler: defineLazyEventHandler(async () => {
        const viteDevServer = await createServer({
          ...defaultViteConfig,
          base: '/__vite',
          appType: 'custom',
          server: { middlewareMode: true },
        })
        return defineEventHandler(fromNodeMiddleware(viteDevServer.middlewares))
      })
    }
  ],
  rollupConfig: {
    plugins: [
      vuePlugin()
    ]
  }
}

const main = defineCommand({
  meta: {
    name: "nitro",
    description: "Nitro CLI",
  },
  subCommands: {
    dev: () => defineCommand({
      meta: {
        name: "dev",
        description: "Start the development server"
      },
      async run () {
        const rootDir = resolve(".")
        const nitro = await createNitro({
          rootDir,
          dev: true,
          preset: "nitro-dev",
          ...defaultNitroConfig
        })
        const template = await nitro.storage.getItem('root:index.html')
        await nitro.storage.setItem('templates:index.html', template.replace('<script type="module" src="./app/client"></script>',
          `<script type="module" src="/__vite/@vite/client"></script>
  <script type="module" src="/__vite/app/client"></script>`))
        const server = createDevServer(nitro)
        await server.listen({})
        await prepare(nitro)
        await build(nitro)
      }
    }),
    build: () => defineCommand({
      meta: {
        name: "build",
        description: "Build nitro project for production"
      },
      async run () {
        const rootDir = resolve(".")
        const nitro = await createNitro({
          rootDir,
          dev: false,
          ...defaultNitroConfig
        })
        await prepare(nitro)
        await buildVite({
          ...defaultViteConfig,
        })
        await nitro.storage.setItem('templates:index.html', await nitro.storage.getItem('build:client:index.html'))
        await copyPublicAssets(nitro)
        await prerender(nitro)
        await build(nitro)
        await nitro.close()
      }
    })
  }
})
runMain(main)
