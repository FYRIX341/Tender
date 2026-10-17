/* Tender 0.3.5 account dock and mentions integration regressions. No live Supabase credentials. */
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8');

function tenderHarness(){
 const state=new Map(),audio={muted:false};
 let lastProfileWrite=null,copied=null,signOutCalls=0,mediaRequestCalls=0;
 const sidebar={innerHTML:'',querySelector(){return null}};
 const dock={innerHTML:'',querySelector(){return null}};
 const assist={innerHTML:'',hidden:true};
 const toaster={append(){}};
 const defaultElement={innerHTML:'',append(){},querySelector(){return null},style:{},classList:{add(){},remove(){},toggle(){}}};
 const elems={'sidebar':sidebar,'sidebar-account-dock':dock,'composer-assist':assist};
 const document={
  getElementById(id){return elems[id]||defaultElement},
  querySelectorAll(selector){return selector==='audio,video'?[audio]:[]},
  querySelector(){return null},addEventListener(){},
  createElement(){return {style:{},className:'',textContent:'',remove(){}}},
  documentElement:{dataset:{},style:{setProperty(){},removeProperty(){}}}
 };
 const localStorage={getItem(k){return state.has(k)?state.get(k):null},setItem(k,v){state.set(k,String(v))},removeItem(k){state.delete(k)}};
 const navigator={
  clipboard:{async writeText(id){copied=id}},
  mediaDevices:{async getUserMedia(){mediaRequestCalls++;return null}}
 };
 const db={from(table){
   assert.equal(table,'profiles');
   return {update(payload){lastProfileWrite=payload;return {eq(key,id){
    assert.equal(key,'id');assert.equal(id,'user-a');
    return {data:[payload],error:null};
   }}}};
  },auth:{async signOut(){signOutCalls++;return {data:{},error:null}}}};
 const win={TENDER_CONFIG:{}};
 const ctx={
  document,navigator,window:win,localStorage,URL,Intl,console,
  location:{origin:'https://fyrix341.github.io',href:'https://fyrix341.github.io/Tender/'},
  setTimeout(){},clearTimeout(){},
  FormData:class{}
 };
 const extension=`window.__qa={
  init(){
   user={id:'user-a',email:'a@example.com'};
   my={id:'user-a',display_name:'Buffalo Fan',handle:'buffalofan',presence_mode:'online',game_status:'chilling',notification_sound:false};
   profiles=[my,{id:'user-b',display_name:'GL3Y5',handle:'gl3',avatar_url:'https://cdn.example.org/avatar.png'}];
   conversations=[{id:'dm-1',kind:'dm',conversation_members:[{user_id:'user-a'},{user_id:'user-b'}]}];
   friendships=[];pieces=[];memberships=[];
   state.area='chats';state.selected='dm-1';extendedReady=true;
   db=window.__mockDb;
   renderAuth=()=>{window.__authCalls++};
  },
  sidebar:renderSidebar,account:accountDockHTML,assist:updateComposerAssist,
  text:messageText,handles:mentionedPlainText,
  action:handleAction,prefs:audioPrefs,play:syncDeafenedAudio,
  setPresence(v){my.presence_mode=v},getPresence(){return my.presence_mode},
  setMode(v){state.area=v},
  forceSwitch(){tenderConfirm=async()=>true},
  toggleVoice:toggleVoiceRecording
 };})();`;
 const replaced=app.replace(/boot\(\);\s*\}\)\(\);\s*$/,extension);
 assert.notEqual(replaced,app,'Test harness attachment failed');
 win.__mockDb=db;win.__authCalls=0;
 vm.runInNewContext(replaced,ctx,{timeout:3000});win.__qa.init();
 return {qa:win.__qa,sidebar,dock,assist,audio,state,navigator,getWrite:()=>lastProfileWrite,
  getCopy:()=>copied,getSignOuts:()=>signOutCalls,getMediaRequests:()=>mediaRequestCalls,win};
}
test('Tender client remains valid JavaScript',()=>assert.doesNotThrow(()=>new vm.Script(app)));
test('DM sidebar is Friends at top, direct messages in middle and account dock at bottom',()=>{
 const {qa,sidebar}=tenderHarness();qa.sidebar();
 const html=sidebar.innerHTML;
 assert.match(html,/class="sidebar-friends-top/);
 assert.match(html,/data-area="friends"/);
 assert.match(html,/DIRECT MESSAGES/);
 assert.match(html,/GL3Y5/);
 assert.match(html,/data-action="open-chat"/);
 assert.match(html,/class="sidebar-content"/);
 assert.match(html,/id="sidebar-account-dock"/);
 assert.ok(html.indexOf('sidebar-friends-top')<html.indexOf('DIRECT MESSAGES'));
 assert.ok(html.indexOf('DIRECT MESSAGES')<html.indexOf('class="sidebar-content"'));
 assert.ok(html.indexOf('class="sidebar-content"')<html.indexOf('sidebar-account-dock'));
});
test('account dock offers functional controls and account profile/status menu',()=>{
 const {qa}=tenderHarness();const html=qa.account(true);
 for(const action of ['account-menu-toggle','account-mic','account-deafen','account-settings',
 'account-profile','account-presence','account-copy-id','account-switch']){
  assert.match(html,new RegExp('data-action="'+action+'"'));
 }
 for(const status of ['online','idle','dnd','invisible'])assert.match(html,new RegExp('data-value="'+status+'"'));
 assert.match(html,/Mute disables Tender voice-note recording/);
 assert.match(html,/aria-pressed="false"/);
 assert.match(html,/Account/);
});
test('status selection persists through existing Supabase profile update without remounting chat',async()=>{
 const {qa,dock,getWrite}=tenderHarness();
 await qa.action({dataset:{action:'account-presence',value:'dnd'}});
 assert.equal(getWrite().presence_mode,'dnd');
 assert.equal(qa.getPresence(),'dnd');
 assert.match(dock.innerHTML,/data-value="dnd" aria-pressed="true"/);
 await qa.action({dataset:{action:'account-presence',value:'invisible'}});
 assert.equal(qa.getPresence(),'invisible');
 assert.match(dock.innerHTML,/account-presence-dot invisible/);
});
test('mic button persists per account and blocks recording while muted',async()=>{
 const {qa,dock,state,getMediaRequests}=tenderHarness();
 await qa.action({dataset:{action:'account-mic'}});
 assert.equal(qa.prefs().micMuted,true);
 assert.match(state.get('tender-audio-user-a'),/"micMuted":true/);
 assert.match(dock.innerHTML,/aria-label="Unmute microphone"/);
 await qa.toggleVoice();
 assert.equal(getMediaRequests(),0);
 await qa.action({dataset:{action:'account-mic'}});
 assert.equal(qa.prefs().micMuted,false);
});
test('deafen mutes app audio and restores preexisting media state',async()=>{
 const {qa,audio,dock}=tenderHarness();
 await qa.action({dataset:{action:'account-deafen'}});
 assert.equal(qa.prefs().deafened,true);
 assert.equal(audio.muted,true);
 assert.match(dock.innerHTML,/aria-label="Undeafen"/);
 await qa.action({dataset:{action:'account-deafen'}});
 assert.equal(qa.prefs().deafened,false);
 assert.equal(audio.muted,false);
});
test('Copy User ID copies current authenticated UUID, not another account or password',async()=>{
 const {qa,getCopy}=tenderHarness();
 await qa.action({dataset:{action:'account-copy-id'}});
 assert.equal(getCopy(),'user-a');
});
test('switch accounts signs out of real current Supabase session instead of pretending to switch',async()=>{
 const {qa,getSignOuts,win}=tenderHarness();
 qa.forceSwitch();
 await qa.action({dataset:{action:'account-switch'}});
 assert.equal(getSignOuts(),1);
 assert.equal(win.__authCalls,1);
});
test('recognized @gl3 is blue/clickable but ordinary words and fake names remain plain',()=>{
 const {qa}=tenderHarness();
 const html=qa.text('Hi @gl3, your status is cool! @notreal');
 assert.match(html,/class="tender-mention/);
 assert.match(html,/data-id="user-b"/);
 assert.match(html,/>@gl3<\/button>/);
 assert.match(html,/your status is cool!/);
 assert.match(html,/@notreal/);
 assert.equal((html.match(/class="tender-mention/g)||[]).length,1);
 assert.match(css,/\.tender-mention\{/);
 assert.match(css,/text-shadow:/);
});
test('mention tokenizer never injects markup or changes URL and email text',()=>{
 const {qa}=tenderHarness();
 const html=qa.text('A link https://example.com/@gl3 and an email foo@gl3.com <script>alert(1)</script>');
 assert.match(html,/https:\/\/example.com\/@gl3/);
 assert.match(html,/foo@gl3\.com/);
 assert.doesNotMatch(html,/class="tender-mention/);
 assert.doesNotMatch(html,/<script>/);
 assert.match(html,/&lt;script&gt;/);
});
test('self mention has the stronger glow only around the @handle',()=>{
 const {qa}=tenderHarness();
 const html=qa.text('hello @buffalofan normal text');
 assert.match(html,/mention-self/);
 assert.match(html,/normal text/);
});
test('mention picker uses fixed avatar wrapper, no flex-grown or oval profile photos',()=>{
 const {qa,assist}=tenderHarness();
 qa.assist({value:'hey @gl'});
 assert.match(assist.innerHTML,/mention-suggest-avatar/);
 assert.match(assist.innerHTML,/mention-suggest-identity/);
 assert.match(assist.innerHTML,/data-handle="gl3"/);
 assert.match(css,/\.mention-assist-row \.mention-suggest-avatar>\.avatar/);
 assert.match(css,/min-width:29px!important/);
 assert.match(css,/object-fit:cover!important/);
 assert.equal(assist.hidden,false);
});
test('account sidebar and mention features are responsive without changing any database schema',()=>{
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/\.sidebar-account-dock/);
 assert.match(app,/function accountDockHTML/);
 assert.match(app,/function saveAudioPrefs/);
 assert.match(app,/function mentionedPlainText/);
 assert.match(app,/async function toggleVoiceRecording/);
 assert.match(app,/if\(audioPrefs\(\)\.micMuted\)/);
});
