/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path'
import fs from 'fs-extra'
import colors from 'picocolors'
import pkg from '../package.json'
import typescript from '@rollup/plugin-typescript'
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'

const run = async () => {
  const dist = path.resolve(__dirname, '..', 'dist')

  await fs.remove(dist)

  const external = [
    'esbuild',
    ...Object.keys((pkg as any).dependencies || {}),
    ...Object.keys((pkg as any).peerDependencies || {})
  ]

  const build = await rollup({
    input: {
      index: path.resolve(__dirname, '..', 'src/index.ts'),
      cli: path.resolve(__dirname, '..', 'src/cli.ts')
    },
    external,
    plugins: [
      typescript({
        tsconfig: path.resolve(__dirname, '..', 'tsconfig.json')
      }),
      nodeResolve()
    ]
  })

  await build.write({
    dir: dist,
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/lib-[hash].js',
    format: 'cjs'
  })

  console.log(colors.bold(colors.yellow(`Rolling up type definitions...`)))

  if (pkg.types) {
    const configFile = path.resolve(__dirname, '..', 'api-extractor.json')
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(configFile)
    const extractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true
    })
    if (extractorResult.succeeded) {
      console.log(colors.green('API Extractor completed successfully'))
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`
      )
      process.exitCode = 1
    }
  }

  await fs.remove(path.resolve(dist, 'types'))

  console.log(colors.green(`Build ${pkg.name}@${pkg.version} successfully`))
}

run()
