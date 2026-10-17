/* Tender 0.4.1 — real call control regressions, safe previews and separate gradients. */
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8'),sql=fs.readFileSync('migration_0_4_1.sql','utf8'),
 css=fs.readFileSync('styles.css','utf8'),html=fs.readFileSync('index.html','utf8');
function harness(){
 let stopped=false,mediaRequests=0,callRpc=null,lastSignaled=null,callMarkup='';
 const root={replaceChildren(){callMarkup='';},set innerHTML(v){callMarkup=v},get innerHTML(){return callMarkup}};
 const fakeAudio={kind:'audio',enabled:true,stop(){stopped=true}};
 const fakeCamera={kind:'video',enabled:true,stop(){stopped=true}};
 const stream={id:'my-stream',getTracks:()=>[fakeAudio,fakeCamera],getAudioTracks:()=>[fakeAudio],getVideoTracks:()=>[fakeCamera]};
 const doc={
  getElementById(id){return id==='tender-call-root'?root:null},querySelectorAll(){return []},querySelector(){return null},addEventListener(){},
  documentElement:{dataset:{},style:{setProperty(){},removeProperty(){}}}
 };
 const storage=new Map();
 const navigator={mediaDevices:{getUserMedia:async()=>{mediaRequests++;return stream},getDisplayMedia:async()=>stream}};
 const db={rpc:async(method,args)=>{
  callRpc={method,args};if(method==='tender_start_call')return {data:'call-001',error:null};return {data:true,error:null};
 },from(table){
  if(table==='tender_call_signals')return {insert:async(data)=>{lastSignaled=data;return {error:null}}};
  return {};
 }};
 const win={TENDER_CONFIG:{},isSecureContext:true,innerWidth:1150,innerHeight:720,RTCPeerConnection:class{}};
 const context={window:win,navigator,document:doc,console,URL,Intl,
  location:{origin:'https://example.org',hostname:'example.org',pathname:'/',href:'https://example.org/'},
  localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,String(v))},removeItem(k){storage.delete(k)}},
  setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},FormData:class{}};
 const insert=`window.__qa41={
  setup(){
   user={id:'user1',email:'one@example.org'};
   profiles=[{id:'user1',display_name:'Buffalo Fan',handle:'buffalo'},{id:'user2',display_name:'GL3Y5',handle:'gl3'}];
   my=profiles[0];conversations=[{id:'dm-id',kind:'dm',conversation_members:[{user_id:'user1'},{user_id:'user2'}]}];
   state.area='chats';state.selected='dm-id';db=window.__mockDB;callReady=true;
  },
  link:richLinkCardData, cards:richLinkCards,background:profileGradientStyle,styled:styledName,
  start:startTenderCall, decline:answerTenderCall, hangup:finishTenderCall,
  mic:toggleTenderMicrophone, setVolume:setTenderVolume,volume:callVolumes,
  signal:tenderSignal,getCall:()=>activeCall,
  setIncoming(id){incomingCall={id,caller_id:'user2',callee_id:'user1',conversation_id:'dm-id',wants_video:false};showCallUI()},
  getIncoming:()=>incomingCall,
  ready:()=>secureCallingAvailable()
 };})();`;
 const modified=app.replace(/boot\(\);\s*\}\)\(\);\s*$/,insert);
 assert.notEqual(modified,app,'Harness attachment failed');
 win.__mockDB=db;
 vm.runInNewContext(modified,context,{timeout:5000});
 win.__qa41.setup();
 return {qa:win.__qa41,root,doc,storage,audio:fakeAudio,getMarkup:()=>callMarkup,
  getRpc:()=>callRpc,getSignal:()=>lastSignaled,getMediaRequests:()=>mediaRequests,getStopped:()=>stopped,win};
}
test('Scripts and 0.4.1 migration load without syntax errors',()=>{
 assert.doesNotThrow(()=>new vm.Script(app));
 assert.match(html,/<div id="tender-call-root"/);
 assert.match(html,/tender-0\.4\.1-together/);
 assert.match(sql,/BEGIN;/);assert.match(sql,/COMMIT;/);
});
test('Link cards expose GitHub filename instead of showing an unrelated repository OG image',()=>{
 const {qa}=harness();
 const d=qa.link('https://github.com/FYRIX341/Tender/blob/main/RELEASE_0_4.md');
 assert.equal(d.site,'GitHub');assert.match(d.title,/RELEASE_0_4\.md/);
 const html=qa.cards('New update https://github.com/FYRIX341/Tender/blob/main/RELEASE_0_4.md');
 assert.match(html,/GitHub/);assert.match(html,/RELEASE_0_4\.md/);
 assert.doesNotMatch(html,/hoshino/i);
});
test('YouTube previews use only validated video IDs to construct thumbnail URLs',()=>{
 const {qa}=harness();
 assert.equal(qa.link('https://youtu.be/dQw4w9WgXcQ').thumb,'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
 assert.equal(qa.link('javascript:alert(1)'),null);
 assert.equal(qa.link('https://anonymous:password@example.com/path'),null);
});
test('Link previews escape untrusted path HTML and enforce noreferrer/noopener',()=>{
 const {qa}=harness();
 const output=qa.cards('https://example.org/%3Cimg%20src=x%20onerror=alert(1)%3E');
 assert.doesNotMatch(output,/<img src=x/);
 assert.match(output,/&lt;img/);assert.match(output,/rel="noopener noreferrer"/);
});
test('Piece invitations are not duplicated as generic link previews',()=>{
 const {qa}=harness();
 assert.equal(qa.cards('https://fyrix341.github.io/Tender/?piece=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),'');
});
test('Name gradient and background gradient are independent',()=>{
 const {qa}=harness();
 const person={display_name:'Tester',name_effect:'gradient',
  profile_gradient_start:'#101010',profile_gradient_end:'#202020',
  name_gradient_start:'#ffaabb',name_gradient_end:'#aaffbb'};
 assert.match(qa.background(person),/#101010/);
 assert.match(qa.background(person),/#202020/);
 assert.doesNotMatch(qa.background(person),/#ffaabb/);
 const html=qa.styled(person);assert.match(html,/#ffaabb/);assert.match(html,/#aaffbb/);
 assert.doesNotMatch(html,/#101010/);
 assert.match(app,/name="name_gradient_start"/);assert.match(app,/name="name_gradient_end"/);
 assert.match(css,/\.tender-profile-dialog\{/);
});
test('Voice call starts in DMs only after obtaining real microphone media',async()=>{
 const h=harness();
 assert.equal(h.qa.ready(),true);
 await h.qa.start(false);
 assert.equal(h.getMediaRequests(),1);
 assert.equal(h.getRpc().method,'tender_start_call');
 assert.equal(h.getRpc().args.peer,'user2');
 assert.equal(h.getRpc().args.video,false);
 assert.match(h.getMarkup(),/call-hangup/);
 assert.match(h.getMarkup(),/call-share-screen/);
 assert.match(h.getMarkup(),/call-voice-volume/);
 assert.match(h.getMarkup(),/call-stream-volume/);
 await h.qa.hangup();
 assert.equal(h.getStopped(),true);
});
test('Microphone toggle modifies real local audio track instead of only the UI label',async()=>{
 const h=harness();await h.qa.start(true);
 assert.equal(h.audio.enabled,true);
 await h.qa.mic();assert.equal(h.audio.enabled,false);
 await h.qa.mic();assert.equal(h.audio.enabled,true);
 await h.qa.hangup();
});
test('Incoming voice call can be explicitly rejected without requesting audio access',async()=>{
 const h=harness();h.qa.setIncoming('call-in-2');
 assert.match(h.getMarkup(),/Incoming voice call/);
 await h.qa.decline(false);
 assert.equal(h.getMediaRequests(),0);
 assert.equal(h.getRpc().method,'tender_answer_call');
 assert.equal(h.getRpc().args.accept,false);
 assert.equal(h.qa.getIncoming(),null);
});
test('Per-person voice volume and stream volume are persisted independently',async()=>{
 const h=harness();await h.qa.start(false);
 h.qa.setVolume('voice',25);h.qa.setVolume('stream',85);
 assert.equal(h.qa.volume('user2').voice,25);
 assert.equal(h.qa.volume('user2').stream,85);
 await h.qa.hangup();
});
test('Call backend never stores microphone/video media blobs or grants public signaling access',()=>{
 assert.match(sql,/tender_call_sessions/);
 assert.match(sql,/tender_call_signals/);
 assert.match(sql,/sender_id=auth\.uid\(\)/);
 assert.match(sql,/recipient_id=auth\.uid\(\)/);
 assert.match(sql,/public\.is_chat_member\(conversation_id\)/);
 assert.match(sql,/tender_start_call\(cid uuid,peer uuid/);
 assert.match(sql,/tender_answer_call/);
 assert.match(sql,/tender_end_call/);
 assert.match(sql,/GRANT SELECT, INSERT ON public\.tender_call_signals TO authenticated/);
 assert.doesNotMatch(sql,/GRANT .* TO anon/);
 assert.doesNotMatch(sql,/BYTEA|large_object|audio_recording/);
});
test('Screen sharing requests getDisplayMedia only through a user click',()=>{
 assert.match(app,/navigator\.mediaDevices\.getDisplayMedia\(/);
 assert.match(app,/if\(a==='call-share-screen'\)\{await toggleTenderScreen\(\)/);
 assert.match(app,/stream\.getVideoTracks\(\)\[0\]\.onended/);
 assert.match(app,/call-screen-volume|call-stream-volume/);
});
