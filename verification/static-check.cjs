const fs=require('fs');const path=require('path');const cp=require('child_process');const assert=require('assert/strict');
const globalRoot=cp.execSync('npm root -g',{encoding:'utf8'}).trim();const ts=require(path.join(globalRoot,'typescript'));
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(ent=>ent.isDirectory()?walk(path.join(dir,ent.name)):[path.join(dir,ent.name)]);}
const files=walk('.').filter(file=>/\.(ts|tsx)$/.test(file)&&!file.endsWith('.d.ts')&&!file.includes('node_modules'));
let errors=[];
for(const file of files){const source=fs.readFileSync(file,'utf8');const result=ts.transpileModule(source,{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,experimentalDecorators:true,emitDecoratorMetadata:true}});for(const diagnostic of result.diagnostics||[]){if(diagnostic.category===ts.DiagnosticCategory.Error){errors.push(`${file}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText,' ')}`)}}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
const panel=fs.readFileSync('apps/web/src/components/RecommendationPanel.tsx','utf8');assert.ok(panel.indexOf('اقدامات غیردارویی پیشنهادی')<panel.indexOf('اقدام پزشکی / درمان دارویی'));assert.doesNotMatch(panel,/<details/i);
const matrix=fs.readFileSync('apps/api/src/clinical/recommendation.matrix.ts','utf8');for(const pair of ['PIPP:none','PIPP:moderate','PIPP:severe','NIPS:none','NIPS:mild','NIPS:moderate','NIPS:severe','CRIES:none','CRIES:mild','CRIES:moderate','CRIES:severe','MPAT:none','MPAT:observe','MPAT:mild','MPAT:moderate','MPAT:severe']){const [scale,severity]=pair.split(':');assert.ok(matrix.includes(`${severity}:`)||matrix.includes(`${severity}(`),`matrix source missing ${pair}`)}
const css=fs.readFileSync('apps/web/src/styles/index.css','utf8');assert.match(css,/\.clinical-button\{min-height:48px/);assert.match(css,/prefers-reduced-motion/);
for(const file of files.filter(f=>f.startsWith('apps/'))){const source=fs.readFileSync(file,'utf8');assert.doesNotMatch(source,/console\.(log|debug|info)\(/,`console logging found in ${file}`)}
assert.ok(fs.existsSync('apps/api/src/persistence/in-memory-assessment.repository.ts'));assert.ok(fs.existsSync('apps/web/src/pages/ClinicalWorkflowPage.tsx'));
console.log(`static checks passed (${files.length} TypeScript/TSX files syntax-checked)`);
