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


function createTenderHarness(){
 const ui={innerHTML:'',append(){},style:{},classList:{add(){},remove(){},toggle(){}}};
 const field={value:'',focus(){}},sent=[];
 const document={
  getElementById(id){return id==='message-box'?field:id==='message-file'?null:id==='file-status'?null:ui},
  querySelector(){return null},addEventListener(){},documentElement:{dataset:{},style:{setProperty(){},removeProperty(){}}}
 };
 const serverRows=[];
 const db={
  from(table){
   if(table==='messages')return {
    insert(record){return {select(){return {async single(){sent.push(record);const saved={...record,created_at:'2026-10-17T10:00:00Z'};serverRows.push(saved);return {data:saved,error:null}}}}}},
    select(){return {eq(){return this},order(){return this},async limit(){return {data:serverRows.slice(),error:null}}}}
   };
   if(table==='reactions')return {select(){return {eq(){return this},async in(){return {data:[],error:null}}}}};
   throw Error('Unexpected database table '+table);
  }
 };
 const window={TENDER_CONFIG:{}};
 const context={window,document,console,URL,Intl,localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  setTimeout(){},clearTimeout(){},crypto:{randomUUID(){return '00000000-0000-4000-8000-000000000001'}},
  FormData:class{constructor(form){this.form=form}get(field){return field==='body'?this.form.body:null}},
  navigator:{}};
 const instrumented=app.replace(/boot\(\);\s*\}\)\(\);\s*$/,
 `window.__tenderHarness={
    setup(){user={id:'user-1'};my={display_name:'Tester',handle:'tester'};state.area='chats';state.selected='room-1';db=window.__mockDb;},
    send:sendMessage,load:loadActive,messages(){return activeMessages},
    setPiece(){state.area='pieces';state.pieceTab='chat';state.selected='piece-1';memberships=[{piece_id:'piece-1',user_id:'user-1',role:'owner'}];activeMessages=[];},
    piece(){return renderPiece({id:'piece-1',name:'Beta Piece',owner_id:'user-1',description:'Community',color:'#f47735',icon:'🍗',is_public:true})}
  };})();`);
 assert.notEqual(instrumented,app,'Harness insertion failed');
 context.window.__mockDb=db;
 vm.runInNewContext(instrumented,context,{timeout:2000});
 const h=window.__tenderHarness;h.setup();
 return {h,field,sent};
}

test('a successful send has one optimistic message and one reconciled database message',async()=>{
 const {h,sent}=createTenderHarness();
 const field={value:'test',focus(){}};
 const form={dataset:{kind:'chat'},body:'Hello from beta',querySelector(){return field}};
 await h.send(form);
 assert.equal(sent.length,1);
 assert.equal(sent[0].id,'00000000-0000-4000-8000-000000000001');
 assert.equal(h.messages().length,1);
 assert.equal(h.messages()[0].pending,undefined);
 await h.load();
 assert.equal(h.messages().length,1,'Realtime reload must not duplicate server ID');
 assert.equal(h.messages()[0].id,sent[0].id);
});

test('Piece chat HTML contains a usable composer outside the scrolling header',()=>{
 const {h}=createTenderHarness();h.setPiece();
 const html=h.piece();
 assert.ok(html.includes('piece-chat-history'));
 assert.ok(html.includes('id="composer-form"'));
 const top=html.indexOf('piece-top-scroll'),chat=html.indexOf('piece-chat-history');
 assert.ok(top>=0&&chat>top);
 assert.ok(html.lastIndexOf('</div></div>',chat)>0);
});
