import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react()],base:'/experiments/lexical/',build:{outDir:'../../experiments/lexical',emptyOutDir:true}})
