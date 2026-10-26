/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, type ProxyOptions } from 'vite';

/**
 * Modo "http" local: o Vite repassa /api para a API .NET (backend/, porta 5080). O front e a API
 * ficam na mesma origem (sem CORS), como na publicação, e o teste no celular (`npm run dev:host`)
 * continua funcionando. changeOrigin: a API só aceita o host "localhost" (AllowedHosts).
 */
const apiProxy: Record<string, ProxyOptions> = {
  '/api': { target: 'http://localhost:5080', changeOrigin: true },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // React Compiler: memoização automática (dispensa useMemo/useCallback manuais).
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Dados fictícios compartilhados com o back-end (seed do banco).
      '@data': fileURLToPath(new URL('../data', import.meta.url)),
    },
  },
  server: {
    // Permite importar ../data (fora da raiz do front) durante o desenvolvimento.
    fs: { allow: ['..'] },
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
  build: {
    rolldownOptions: {
      output: {
        // Bibliotecas em arquivos próprios: mudam pouco, então o navegador mantém em
        // cache entre deploys e só baixa de novo o código da aplicação.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: 'router',
              test: /node_modules[\\/](react-router|cookie|set-cookie-parser)[\\/]/,
              priority: 10,
            },
            { name: 'query', test: /node_modules[\\/]@tanstack[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
  },
});
