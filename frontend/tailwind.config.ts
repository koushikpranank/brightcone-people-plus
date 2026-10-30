import type { Config } from 'tailwindcss';
export default {
 content:['./index.html','./src/**/*.{ts,html}'],
 corePlugins:{preflight:false},
 theme:{extend:{colors:Object.fromEntries(['brand','brand-2','brand-navy','brand-soft','brand-teal','bg','surface','surface-2','line','text','muted','faint','ok','ok-bg','warn','warn-bg','bad','bad-bg','side-bg','side-text'].map(k=>[k,`var(--${k})`])),borderRadius:{lg:'var(--r-lg)',md:'var(--r-md)',sm:'var(--r-sm)'},boxShadow:{DEFAULT:'var(--shadow)',lg:'var(--shadow-lg)'},fontFamily:{sans:['Figtree','system-ui'],heading:['Sora','Figtree','system-ui'],signature:['Caveat']},screens:{mobile:'820px'}}},plugins:[]
} satisfies Config;
