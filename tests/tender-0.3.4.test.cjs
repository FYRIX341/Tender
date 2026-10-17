/* Tender 0.3.4 settings stability regressions — no live credentials needed. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

function harness(){
 let written=null,mainRedraws=0,sidebarRedraws=0;
 const attr=()=>({add(){},remove(){},toggle(){},contains(){return false}});
 const elements={
  'settings-preview-name':{textContent:'Old Name'},
  'settings-preview-meta':{textContent:'@old'},
  'settings-preview-status':{textContent:'Old status',classList:attr()}
 };
 const toastContainer={append(){}};
 const fake={innerHTML:'',style:{},classList:attr(),dataset:{},append(){},querySelector(){return null}};
 const document={
  activeElement:null,documentElement:{dataset:{},style:{setProperty(){},removeProperty(){}}},
  getElementById(id){return elements[id]||fake},
  createElement(){return {textContent:'',style:{},remove(){}}},
  addEventListener(){}
 };
 const window={TENDER_CONFIG:{}};
 const db={from(table){
  assert.equal(table,'profiles');
  return {update(upd){written=upd;return {eq(key,value){
   assert.equal(key,'id');assert.equal(value,'user-123');
   return {select(){return {async single(){return {data:{
     id:'user-123',handle:'tester',display_name:upd.display_name||'Tester',
     pronouns:upd.pronouns||'',bio:upd.bio||'',game_status:upd.game_status||'',
     status_emoji:upd.status_emoji||'🍗'
    },error:null}}}}};
  }}}};
 }};
 const ctx={
  window,document,console,URL,Intl,
  localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  navigator:{},location:{origin:'https://fyrix341.github.io'},
  setTimeout(){},clearTimeout(){},FormData:class{constructor(form){this.fields=form.fields||{}}get(key){return this.fields[key]??null}}
 };
 const script=app.replace(/boot\(\);\s*\}\)\(\);\s*$/, `window.__testSettings={
  setup(){
   user={id:'user-123'};
   my={id:'user-123',handle:'tester',display_name:'Tester',bio:'Original bio',pronouns:'',game_status:'Old status',status_emoji:'🍗'};
   profiles=[my];db=window.__mockDb;
   state.area='settings';state.settingsTab='profile';extendedReady=true;pronounsReady=true;
   renderMain=()=>{window.__counts.main++};
   renderSidebar=()=>{window.__counts.sidebar++};
  },
  save:submitForm,capture:captureSettingsView,restore:restoreSettingsView,
  setTab(v){state.settingsTab=v},getMe(){return my},preview:updateSavedProfilePreview
 };})();`);
 assert.notEqual(script,app,'Settings test insertion anchor missing');
 window.__mockDb=db;
 window.__counts={main:0,sidebar:0};
 vm.runInNewContext(script,ctx,{timeout:2000});
 window.__testSettings.setup();
 return {h:window.__testSettings,document,elements,counts:window.__counts,getWritten:()=>written};
}
test('application script parses after profile fix',()=>assert.doesNotThrow(()=>new vm.Script(app)));
test('profile save updates DB, local status and preview without rebuilding settings',async()=>{
 const {h,counts,elements,getWritten}=harness();
 const form={id:'profile-form',fields:{
  display_name:'Tester Two',bio:'New bio',pronouns:'they/them',
  game_status:'Testing the update',status_emoji:'🔥'
 }};
 await h.save(form);
 assert.equal(getWritten().game_status,'Testing the update');
 assert.equal(getWritten().status_emoji,'🔥');
 assert.equal(h.getMe().game_status,'Testing the update');
 assert.equal(elements['settings-preview-status'].textContent,'🔥 Testing the update');
 assert.equal(elements['settings-preview-name'].textContent,'Tester Two');
 assert.equal(elements['settings-preview-meta'].textContent,'@tester · they/them');
 assert.equal(counts.main,0,'Saving must not remount Settings or reset its scroll');
 assert.equal(counts.sidebar,1,'Sidebar identity should reflect saved profile');
});
test('settings snapshot restores unsaved edits, focus, caret and scroll after realtime redraw',()=>{
 const {h,document}=harness();
 const form={id:'profile-form'};
 const text={id:'',name:'game_status',type:'text',value:'Unsaved custom status',form,
  selectionStart:8,selectionEnd:8,disabled:false,focus(opts){this.focusOpts=opts}};
 const bio={id:'',name:'bio',type:'textarea',value:'Unsaved and not submitted',form,disabled:false};
 const inputs=[text,bio];
 const panel={scrollTop:437,scrollLeft:7,querySelectorAll(){return inputs}};
 const nav={scrollLeft:54};
 const main={dataset:{settingsTab:'profile'},querySelector(sel){return sel==='.settings-content'?panel:sel==='.settings-navigation'?nav:null}};
 document.activeElement=text;
 const saved=h.capture(main);
 assert.equal(saved.top,437);
 assert.equal(saved.values[0].value,'Unsaved custom status');
 text.value='Reset by refresh';bio.value='Reset by refresh';panel.scrollTop=0;panel.scrollLeft=0;nav.scrollLeft=0;
 h.restore(main,saved);
 assert.equal(text.value,'Unsaved custom status');
 assert.equal(bio.value,'Unsaved and not submitted');
 assert.equal(panel.scrollTop,437);
 assert.equal(panel.scrollLeft,7);
 assert.equal(nav.scrollLeft,54);
 assert.deepEqual(text.focusOpts,{preventScroll:true});
 assert.equal(saved.selection.start,8);
});
test('navigation between settings tabs does not bleed a profile draft into another form',()=>{
 const {h}=harness();
 const panel={scrollTop:100,querySelectorAll(){return []}};
 const main={dataset:{settingsTab:'profile'},querySelector(){return panel}};
 h.setTab('privacy');
 assert.equal(h.capture(main),null);
});
test('file input never has its value artificially restored',()=>{
 const {h}=harness();
 const file={id:'avatar-file',name:'',type:'file',value:'secret-device-file',disabled:false,form:null};
 const panel={scrollTop:11,scrollLeft:0,querySelectorAll(){return [file]}};
 const main={dataset:{settingsTab:'profile'},querySelector(sel){return sel==='.settings-content'?panel:null}};
 const snapshot=h.capture(main);file.value='';
 h.restore(main,snapshot);
 assert.equal(file.value,'');
});
test('profile update no longer reloads all account and Piece data',()=>{
 const start=app.indexOf("case'profile-form':");
 const end=app.indexOf("case'preferences-form':",start);
 const save=app.slice(start,end);
 assert.match(save,/cacheUpdatedProfile\(saved\)/);
 assert.match(save,/updateSavedProfilePreview\(\)/);
 assert.doesNotMatch(save,/refreshData\(\)/);
 assert.doesNotMatch(save,/renderMain\(\)/);
});
test('profile input and presence update remains accessible and visually clear',()=>{
 assert.match(app,/settings-preview-status/);
 assert.match(css,/\.settings-preview-status/);
 assert.match(app,/function captureSettingsView\(/);
 assert.match(app,/function restoreSettingsView\(/);
});
