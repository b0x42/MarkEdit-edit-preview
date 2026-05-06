import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'markedit-api',
        '@codemirror/view',
        '@codemirror/state',
        '@codemirror/language',
      ],
    },
    lib: {
      entry: 'main.ts',
      formats: ['cjs'],
      fileName: 'markedit-edit-preview',
    },
  },
});
