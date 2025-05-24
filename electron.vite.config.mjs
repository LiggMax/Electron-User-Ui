import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'

// 动态加载环境变量
const getConfig = ({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  // 获取API基础URL，用于开发环境代理
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8899/api';
  const proxyTarget = apiBaseUrl.replace(/\/api$/, '');
  
  console.log(`[Vite配置] 环境: ${mode}`);
  console.log(`[Vite配置] API代理目标: ${!proxyTarget}`);
  
  // 生产环境配置
  const prodEnv = mode === 'production' ? env : {};
  
  return {
    main: {
      plugins: [externalizeDepsPlugin()],
      define: {
        // 主进程只加载生产环境的配置
        'process.env.VITE_API_BASE_URL': JSON.stringify(prodEnv.VITE_API_BASE_URL || 'http://ka.kydb.vip/api'),
        'process.env.VITE_ENABLE_API_LOGS': JSON.stringify(prodEnv.VITE_ENABLE_API_LOGS || 'false')
      }
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src')
        }
      },
      server: {
        port: 7000,
        proxy: {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
            // rewrite: (path) => path.replace(/^\/api/, '')
          }
        }
      },
      plugins: [vue()]
    }
  }
}

export default defineConfig(getConfig)
