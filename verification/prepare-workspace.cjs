const fs=require('fs');const path=require('path');const cp=require('child_process');
const tsc=require.resolve('typescript/bin/tsc');
cp.execFileSync(process.execPath,[tsc,'-p','packages/clinical-domain/tsconfig.json'],{stdio:'inherit'});
const scope=path.resolve('node_modules/@neonatal');const link=path.join(scope,'clinical-domain');fs.mkdirSync(scope,{recursive:true});
try{fs.rmSync(link,{recursive:true,force:true})}catch{}
const target=path.resolve('packages/clinical-domain');
fs.symlinkSync(target,link,process.platform==='win32'?'junction':'dir');
