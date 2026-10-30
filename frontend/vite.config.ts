import { defineConfig,loadEnv } from 'vite';
export default defineConfig(({mode})=>{const env=loadEnv(mode,'..','');return { server: { port:Number(env.FRONTEND_PORT||5173), strictPort:true, proxy:{'/api':{target:`http://127.0.0.1:${env.PORT||5150}`,changeOrigin:true}} }, build:{target:'es2022',sourcemap:true} }});
