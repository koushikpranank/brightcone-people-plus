import {spawnSync,execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
function run(command,args){const r=spawnSync(command,args,{cwd:root,stdio:'inherit',shell:process.platform==='win32'&&command==='npm',windowsHide:true});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
run('npm',['--prefix','frontend','ci']);
run('npm',['--prefix','frontend','run','build']);
run('cargo',['build','--locked','--release','--workspace','-j',process.env.CARGO_BUILD_JOBS||'3','--manifest-path','backend/Cargo.toml']);
const target=path.join(root,'dist/brightcone');
if(fs.existsSync(target)){
 const relative=path.relative(fs.realpathSync(root),fs.realpathSync(target));
 if(relative!==path.join('dist','brightcone'))throw new Error('Release cleanup target must resolve to this project\'s dist/brightcone directory.');
 fs.rmSync(target,{recursive:true,force:true});
}
fs.mkdirSync(path.join(target,'bin'),{recursive:true});
fs.mkdirSync(path.join(target,'backend/config'),{recursive:true});
const files=[];
for(const name of ['brightcone-people-plus','brightcone-schema']){
 const file=name+(process.platform==='win32'?'.exe':'');
 fs.copyFileSync(path.join(root,'backend/target/release',file),path.join(target,'bin',file));
 files.push('bin/'+file);
}
fs.copyFileSync(path.join(root,'backend/config/production.yaml'),path.join(target,'backend/config/production.yaml'));
fs.cpSync(path.join(root,'frontend/dist'),path.join(target,'frontend'),{recursive:true});
fs.cpSync(path.join(root,'deploy'),path.join(target,'deploy'),{recursive:true});
for(const name of ['README.md','DEPLOYMENT.md','.env.production.example'])fs.copyFileSync(path.join(root,name),path.join(target,name));
let commit='unversioned';try{commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
const manifest={builtAt:new Date().toISOString(),commit,platform:process.platform,arch:process.arch,binaries:files.map(file=>({file,sha256:createHash('sha256').update(fs.readFileSync(path.join(target,file))).digest('hex')}))};
fs.writeFileSync(path.join(target,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Release ready: ${target}. Build on the operating system where it will run.`);
