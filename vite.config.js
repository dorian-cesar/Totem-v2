import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gdsMode = env.VITE_APP_GDS_MODE || 'dev'
  const gdsProxy = gdsMode === 'dev' ? env.VITE_APP_GDS_PROXY_DEV : env.VITE_APP_GDS_PROXY_PROD
  const gdsApiKey = gdsMode === 'dev' ? env.VITE_APP_GDS_API_KEY_DEV : env.VITE_APP_GDS_API_KEY_PROD

  return {
    plugins: [vue()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VUE_APP_USERNAME': JSON.stringify(env.VITE_APP_USERNAME),
      'process.env.VUE_APP_PASSWORD': JSON.stringify(env.VITE_APP_PASSWORD),
      'process.env.VUE_APP_GDS_PROXY': JSON.stringify(gdsProxy),
      'process.env.VUE_APP_GDS_API_KEY': JSON.stringify(gdsApiKey)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            'import',
            'legacy-js-api',
            'color-functions',
            'global-builtin',
            'if-function',
            'abs-percent'
          ]
        }
      }
    },
    server: {
      port: 8080,
      host: '0.0.0.0'
    }
  }
})
