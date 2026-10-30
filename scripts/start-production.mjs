import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const artifact=process.env.RELEASE_DIR?path.resolve(process.env.RELEASE_DIR):path.join(root,'dist/brightcone');
const binary=path.join(artifact,'bin',process.platform==='win32'?'brightcone-people-plus.exe':'brightcone-people-plus');
if(!fs.existsSync(binary))throw new Error('Build a release first with npm run build:release, or set RELEASE_DIR.');
const env={...process.env,LOCO_ENV:'production'};
const envFile=process.env.ENV_FILE?path.resolve(process.env.ENV_FILE):path.join(root,'.env');
if(fs.existsSync(envFile))for(const line of fs.readFileSync(envFile,'utf8').split(/\r?\n/)){
  const match=line.match(/^([^#=]+)=(.*)$/);if(match&&env[match[1]]===undefined)env[match[1]]=match[2];
}
for(const name of ['DATABASE_URL','JWT_SECRET','SESSION_SECRET'])if(!env[name])throw new Error(`Set ${name} in the process environment or ENV_FILE.`);
const child=spawn(binary,['start'],{cwd:path.join(artifact,'backend'),env,stdio:'inherit',windowsHide:true});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
