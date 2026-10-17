/* Tender 0.3 beta — no live Supabase credentials needed. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const html=fs.readFileSync('index.html','utf8');

test('application JavaScript parses as valid script',()=>assert.doesNotThrow(()=>new vm.Script(app)));
test('fresh UI renders without Supabase rather than crashing',()=>{
 const stub={innerHTML:'',append(){},style:{},classList:{add(){},remove(){},toggle(){} }};
 const document={getElementById(){return stub},addEventListener(){},documentElement:{dataset:{},style:{setProperty(){},removeProperty(){}}}};
 const sandbox={document,window:{supabase:null,TENDER_CONFIG:{}},console,localStorage:{getItem(){return null},setItem(){},removeItem(){}},setTimeout(){},clearTimeout(){},navigator:{},URL,Intl};
 assert.doesNotThrow(()=>vm.runInNewContext(app,sandbox,{timeout:2500}));
 assert.match(stub.innerHTML,/Connection library unavailable/);
});
test('send uses client UUID as primary key for realtime reconciliation',()=>{
 assert.match(app,/const tmp=crypto\.randomUUID\(\)/);
 assert.match(app,/id:tmp,conversation_id:target/);
 assert.match(app,/id:tmp,piece_id:target/);
});
test('realtime message events use scoped reconciliation, not full application redraw',()=>{
 assert.match(app,/scheduleReconcile\(true,'messages',e\)/);
 assert.match(app,/scheduleReconcile\(true,'piece_messages',e\)/);
 const scheduler=app.slice(app.indexOf('function scheduleReconcile('),app.indexOf('function syncActiveStream('));
 assert.doesNotMatch(scheduler,/render\(\)/);
});
test('Pieces default to chat and have persistent composer layout',()=>{
 assert.match(app,/pieceTab:'chat'/);
 assert.match(app,/piece-chat-history/);
 assert.match(css,/\.piece-chat-history\{flex:1/);
});
test('appearance and command assists exist',()=>{
 assert.match(app,/function applyLocalAppearance\(/);
 assert.match(app,/function updateComposerAssist\(/);
 assert.match(app,/function applySlashCommand\(/);
 assert.match(css,/\.info-panel\{/);
});
test('website keeps current public config file',()=>{
 assert.match(html,/src="config\.js/);
 assert.match(html,/src="app\.js/);
});
