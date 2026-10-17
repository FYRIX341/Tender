/* Tender 0.3.2 release checks: deliberately no Supabase credentials needed. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const sw=fs.readFileSync('tender-sw.js','utf8');
const sql=fs.readFileSync('migration_0_3_2.sql','utf8');
const html=fs.readFileSync('index.html','utf8');

test('app, service worker, and client scripts parse',()=>{
 assert.doesNotThrow(()=>new vm.Script(app));
 assert.doesNotThrow(()=>new vm.Script(sw));
});
test('message rows are natural height rather than flex-distributed across chat',()=>{
 assert.match(css,/\.chat-scroll,\.piece-chat-history \.chat-scroll\{[\s\S]*?display:block!important/);
 assert.match(css,/\.chat-scroll>\.chat-bubble-wrap\{[\s\S]*?height:auto!important/);
 assert.match(css,/\.chat-scroll>\.chat-bubble-wrap\.message-grouped/);
});
test('sidebar and member list resize via separator pointer capture, not input range slider',()=>{
 assert.match(app,/data-split="sidebar"/);
 assert.match(app,/data-split="info"/);
 assert.match(app,/setPointerCapture/);
 assert.match(app,/document\.addEventListener\('pointermove'/);
 assert.match(app,/document\.addEventListener\('pointerup'/);
 assert.match(app,/aria-orientation="vertical"/);
 assert.doesNotMatch(app,/id="info-width"/);
});
test('no blocking browser confirmation dialogs remain',()=>{
 assert.doesNotMatch(app,/\bwindow\.confirm\(/);
 assert.doesNotMatch(app,/\bconfirm\(/);
 assert.match(app,/function tenderConfirm\(/);
 assert.match(app,/data-action="confirm-yes"/);
 assert.match(app,/data-action="confirm-no"/);
});
test('settings have distinct profile, notifications, accessibility, and privacy sections',()=>{
 for(const s of ['profile','account','appearance','notifications','privacy','accessibility'])assert.match(app,new RegExp("'"+s+"'"));
 assert.match(app,/case'notification-preferences-form'/);
 assert.match(app,/case'privacy-preferences-form'/);
 assert.match(app,/name="game_status"/);
 assert.match(app,/name="pronouns"/);
 assert.match(app,/function showProfile\(/);
});
test('pronouns migration is additive, idempotent, and profile saves do not require the migration for older columns',()=>{
 assert.match(sql,/ADD COLUMN IF NOT EXISTS pronouns/);
 assert.match(sql,/char_length\(pronouns\) <= 40/);
 assert.doesNotMatch(sql,/DROP TABLE|TRUNCATE|DELETE FROM/);
 assert.match(app,/if\(pronounsReady\)upd\.pronouns=/);
});
test('type-to-chat respects focus, dialogs and keyboard shortcuts',()=>{
 assert.match(app,/event\.isComposing\|\|event\.ctrlKey\|\|event\.metaKey\|\|event\.altKey/);
 assert.match(app,/event\.key\.length!==1/);
 assert.match(app,/getElementById\('modal-root'\)/);
 assert.match(app,/field\.setRangeText\(event\.key/);
 assert.match(app,/field\.dispatchEvent\(new Event\('input'/);
});
test('browser notifications use actual OS API behind HTTPS and permission',()=>{
 assert.match(app,/Notification\.requestPermission\(\)/);
 assert.match(app,/new Notification\(title,opts\)/);
 assert.match(app,/worker\.showNotification\(title,opts\)/);
 assert.match(app,/notification-test/);
 assert.match(app,/window\.isSecureContext/);
 assert.match(sw,/notificationclick/);
 assert.match(sw,/clients\.matchAll/);
 assert.doesNotMatch(sw,/cache\.put|caches\.open/);
});
test('app still keeps live Supabase config and versioned JS and CSS',()=>{
 assert.match(html,/src="config\.js/);
 assert.match(html,/src="app\.js/);
 assert.match(html,/styles\.css/);
 assert.match(app,/supabase\.createClient/);
});

function confirmationHarness(){
 const modal={innerHTML:'',querySelector(){return null}};
 const dummy={innerHTML:'',append(){},style:{},classList:{add(){},remove(){},toggle(){}}};
 const doc={
  getElementById(id){return id==='modal-root'?modal:dummy},
  addEventListener(){},documentElement:{dataset:{},style:{setProperty(){},removeProperty(){}}}
 };
 const win={TENDER_CONFIG:{}};
 const sandbox={window:win,document:doc,console,URL,Intl,location:{origin:'https://fyrix341.github.io'},
  navigator:{},localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  setTimeout(){},clearTimeout(){}};
 const instrumented=app.replace(/boot\(\);\s*\}\)\(\);\s*$/,
 'window.__test={confirm:tenderConfirm,settle:settleConfirm,close:closeModal};})();');
 assert.notEqual(instrumented,app);
 vm.runInNewContext(instrumented,sandbox,{timeout:2000});
 return {api:win.__test,modal};
}
test('custom confirmation Promise resolves on approve and backdrop close cancels',async()=>{
 const {api,modal}=confirmationHarness();
 const positive=api.confirm('Delete message?','This cannot be undone.','Delete');
 assert.match(modal.innerHTML,/Delete message/);
 assert.match(modal.innerHTML,/data-action="confirm-yes"/);
 api.settle(true);
 assert.equal(await positive,true);
 assert.equal(modal.innerHTML,'');
 const negative=api.confirm('Leave Piece?','Are you sure?','Leave');
 api.close();
 assert.equal(await negative,false);
});
