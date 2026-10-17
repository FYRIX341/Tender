/* Tender 0.3.3 release tests; no Supabase secrets or live accounts. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const migration=fs.readFileSync('migration_0_3_3.sql','utf8');

function harness(){
 const modal={innerHTML:'',querySelector(){return null}};
 const messageField={value:'',focus(){this.focused=true},scrollIntoView(){}};
 const editor={querySelector(){return null},insertAdjacentHTML(_pos,html){this.content=html}};
 const dummy={innerHTML:'',append(){},style:{},classList:{add(){},remove(){},toggle(){}}};
 const document={
   getElementById(id){return id==='modal-root'?modal:id==='message-box'?messageField:id==='composer-form'?editor:id==='message-file'?null:id==='file-status'?null:dummy},
   querySelector(){return null},querySelectorAll(){return []},addEventListener(){},
   documentElement:{dataset:{},style:{setProperty(){},removeProperty(){}}}
 };
 const win={TENDER_CONFIG:{},isSecureContext:true};
 const saved=[];
 const db={from(table){
  if(table==='messages'||table==='piece_messages')return {
   insert(row){return {select(){return {async single(){saved.push(row);return {data:{...row,created_at:'2026-10-17T12:00:00Z'},error:null}}}}}}
  };
  throw Error('Unexpected DB table '+table);
 }};
 const localStorage={getItem(){return null},setItem(){},removeItem(){}};
 const ctx={window:win,document,console,URL,Intl,navigator:{},localStorage,location:{protocol:'https:',hostname:'fyrix341.github.io',origin:'https://fyrix341.github.io',pathname:'/Tender/',href:'https://fyrix341.github.io/Tender/'},
  setTimeout(){},clearTimeout(){},crypto:{randomUUID(){return '00000000-0000-4000-8000-000000000009'}},
  FormData:class{constructor(form){this.form=form}get(key){return key==='body'?this.form.body:null}}};
 const exposed=app.replace(/boot\(\);\s*\}\)\(\);\s*$/, `window.__spec={
   setup(){
    user={id:'user-a',email:'a@example.com'};
    my={id:'user-a',display_name:'Alice',handle:'alice',bio:'Self',avatar_url:null};
    profiles=[
      my,
      {id:'user-b',display_name:'Buffalo Fan',handle:'buffalo',pronouns:'they/them',bio:'Hello from Buffalo',game_status:'Chilling',status_emoji:'🍗',created_at:'2026-01-01T00:00:00Z',avatar_url:null},
      {id:'user-c',display_name:'Chris',handle:'chris',bio:'Another member'}
    ];
    pieces=[
     {id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Wings',description:'Everything crispy',icon:'🍗',color:'#f47735',is_public:true,owner_id:'user-a'},
     {id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',name:'Hidden Place',description:'secret',icon:'🔒',color:'#333333',is_public:false,owner_id:'user-a'}
    ];
    memberships=[
     {user_id:'user-a',piece_id:pieces[0].id},{user_id:'user-b',piece_id:pieces[0].id},
     {user_id:'user-a',piece_id:pieces[1].id},{user_id:'user-b',piece_id:pieces[1].id}
    ];
    conversations=[{id:'dm-1',kind:'dm',conversation_members:[{user_id:'user-a'},{user_id:'user-b'}]}];
    state.area='chats';state.selected='dm-1';state.pieceTab='chat';
    extendedReady=true;pieceRepliesReady=true;db=window.__mockDb;
   },
   setPiece(){state.area='pieces';state.selected=pieces[0].id;state.pieceTab='chat';},
   setMessages(rows){activeMessages=rows},messages(){return activeMessages},
   messageHTML,composer,selectReply,reply(){return replyTo},send:sendMessage,
   profileCardHTML,dmProfilePanelHTML,showProfile,sharedPublicPieces,
   pieceInviteURL,extractPublicPieceInvite,pieceInviteCardHTML,messageText
 };})();`);
 assert.notEqual(exposed,app,'Harness injection anchor changed.');
 win.__mockDb=db;
 vm.runInNewContext(exposed,ctx,{timeout:2000});win.__spec.setup();
 return {h:win.__spec,modal,field:messageField,editor,saved};
}
const first={id:'11111111-1111-4111-8111-111111111111',author_id:'user-b',body:'Check this!',created_at:'2026-10-17T11:58:00Z'};
const second={id:'22222222-2222-4222-8222-222222222222',author_id:'user-a',body:'Sure!',created_at:'2026-10-17T11:59:00Z',reply_to:first.id};

test('Reply action is present on both DMs and Piece messages when enabled',()=>{
 const {h}=harness();h.setMessages([first,second]);
 const dm=h.messageHTML(first,'message');
 assert.match(dm,/data-action="reply-message"/);
 assert.match(dm,/reply-quick-action/);
 assert.match(dm,/Reply<\/span>/);
 const piece=h.messageHTML(first,'piece_message');
 assert.match(piece,/data-action="reply-message"/);
 assert.match(piece,/data-message-id=/);
});
test('Reply quote renders actual target and is clickable to jump',()=>{
 const {h}=harness();h.setMessages([first,second]);
 const html=h.messageHTML(second);
 assert.match(html,/data-action="jump-reply"/);
 assert.match(html,/Buffalo Fan/);
 assert.match(html,/Check this!/);
});
test('selecting reply updates composer without redrawing the chat or losing draft',()=>{
 const {h,editor,field}=harness();h.setMessages([first,second]);field.value='I was typing';
 h.selectReply(first.id);
 assert.equal(h.reply().id,first.id);
 assert.match(editor.content,/Replying to Buffalo Fan/);
 assert.equal(field.value,'I was typing');
 assert.equal(field.focused,true);
});
test('real Piece send persists same-Piece reply reference and stable optimistic UUID',async()=>{
 const {h,saved}=harness();h.setPiece();
 h.setMessages([{...first,piece_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}]);
 h.selectReply(first.id);
 const form={dataset:{kind:'piece'},body:'My reply',querySelector(){return null}};
 await h.send(form);
 assert.equal(saved.length,1);
 assert.equal(saved[0].reply_to,first.id);
 assert.equal(saved[0].piece_id,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
 assert.equal(saved[0].id,'00000000-0000-4000-8000-000000000009');
 assert.equal(h.reply(),null);
});
test('full profile is rich and includes only actual user details and shared public Pieces',()=>{
 const {h,modal}=harness();
 const html=h.profileCardHTML({id:'user-b',display_name:'Buffalo Fan',handle:'buffalo',pronouns:'they/them',bio:'Hello from Buffalo',game_status:'Chilling',status_emoji:'🍗'});
 assert.match(html,/tender-profile-dialog/);
 assert.match(html,/Hello from Buffalo/);
 assert.match(html,/they\/them/);
 assert.match(html,/SHARED PIECES/);
 assert.match(html,/Wings/);
 assert.doesNotMatch(html,/Hidden Place/);
 assert.match(html,/data-action="start-dm"/);
});
test('DM right panel shows real profile, not a pointless two-member list',()=>{
 const {h}=harness();
 const html=h.dmProfilePanelHTML({id:'user-b',display_name:'Buffalo Fan',handle:'buffalo',pronouns:'they/them',bio:'Hello from Buffalo',game_status:'Chilling',status_emoji:'🍗'});
 assert.match(html,/dm-profile-panel/);
 assert.match(html,/dm-profile-banner/);
 assert.match(html,/Hello from Buffalo/);
 assert.match(html,/View full profile/);
 assert.match(html,/data-action="open-profile"/);
 assert.doesNotMatch(html,/>Members <strong>2/);
});
test('Piece invite cards appear only for known PUBLIC Piece links at trusted hosts',()=>{
 const {h}=harness();
 const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const link='https://fyrix341.github.io/Tender/?piece='+id;
 const piece=h.extractPublicPieceInvite('Join us '+link);
 assert.ok(piece);assert.equal(piece.name,'Wings');
 const card=h.messageText('Come to '+link);
 assert.match(card,/tender-piece-invite/);
 assert.match(card,/View &amp; Join|Open Piece/);
 assert.match(card,/Wings/);
 assert.match(card,/2 members/);
 assert.equal(h.extractPublicPieceInvite('https://fake.tender.oops.wtf/?piece='+id),null);
 assert.equal(h.extractPublicPieceInvite('https://fyrix341.github.io.evil.tld/Tender/?piece='+id),null);
 assert.equal(h.extractPublicPieceInvite('https://fyrix341.github.io/Tender/?piece=bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),null);
 assert.doesNotMatch(h.messageText('https://example.com/?piece='+id),/tender-piece-invite/);
});
test('invite generation uses an HTTPS link with preserved app path and actual Piece UUID',()=>{
 const {h}=harness();
 const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const url=h.pieceInviteURL({id,is_public:true});
 assert.equal(url,'https://fyrix341.github.io/Tender/?piece='+id);
 assert.equal(h.pieceInviteURL({id,is_public:false}),null);
});
test('additive Piece reply migration ensures same-community references and does not erase data',()=>{
 assert.match(migration,/ADD COLUMN IF NOT EXISTS reply_to uuid/);
 assert.match(migration,/ON DELETE SET NULL/);
 assert.match(migration,/NEW\.reply_to IS NOT NULL/);
 assert.match(migration,/piece_id=NEW\.piece_id/);
 assert.doesNotMatch(migration,/TRUNCATE|DROP TABLE|DELETE FROM public\.piece_messages/);
});
test('reply and full-profile layouts render with accessible focus/touch affordances',()=>{
 assert.match(css,/\.reply-quick-action/);
 assert.match(css,/\.composer-reply-content/);
 assert.match(css,/\.tender-profile-dialog/);
 assert.match(css,/\.dm-profile-panel/);
 assert.match(css,/\.tender-piece-invite/);
 assert.match(css,/@media\(hover:none\)/);
});
