import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
if(!fs.existsSync(path.join(root,'.env'))){console.error('Create .env from .env.example, or run scripts/setup-local.ps1 first.');process.exit(1)}
const env={...process.env};for(const line of fs.readFileSync(path.join(root,'.env'),'utf8').split(/\r?\n/)){const m=line.match(/^([^#=]+)=(.*)$/);if(m)env[m[1]]=m[2]}
const backend=spawn('cargo',['run','-j','2','--','start'],{cwd:path.join(root,'backend'),env,stdio:'inherit',windowsHide:true});
const frontend=spawn(process.execPath,[path.join(root,'frontend/node_modules/vite/bin/vite.js'),'--host','127.0.0.1'],{cwd:path.join(root,'frontend'),env,stdio:'inherit',windowsHide:true});
const close=()=>{backend.kill();frontend.kill()};process.on('SIGINT',close);process.on('SIGTERM',close);
backend.on('exit',code=>{if(code){frontend.kill();process.exitCode=code}});
frontend.on('exit',code=>{if(code){backend.kill();process.exitCode=code}});
