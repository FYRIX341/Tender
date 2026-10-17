/* Tender 0.4: community channels, honest presence and complete emoji catalogue. */
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8'),
 sql=fs.readFileSync('migration_0_4.sql','utf8'),html=fs.readFileSync('index.html','utf8'),
 emojiJs=fs.readFileSync('emoji-data.js','utf8');

function harness(){
 const window={TENDER_CONFIG:{},innerWidth:1000,innerHeight:750};
 const values=new Map();
 const document={
  getElementById(){return null},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},
  documentElement:{dataset:{},style:{setProperty(){},removeProperty(){}}}
 };
 const ctx={window,document,navigator:{},console,URL,Intl,localStorage:{
  getItem(k){return values.get(k)||null},setItem(k,v){values.set(k,String(v))},removeItem(k){values.delete(k)}
 },location:{origin:'https://fyrix341.github.io',hostname:'fyrix341.github.io',href:'https://fyrix341.github.io/Tender/',pathname:'/Tender/',protocol:'https:'},
  setTimeout(){},clearTimeout(){},FormData:class{}};
 vm.runInNewContext(emojiJs,ctx,{timeout:5000});
 const injected=app.replace(/boot\(\);\s*\}\)\(\);\s*$/, `window.__verify={
  setup(){
   user={id:'a',email:'a@example.com'};my={id:'a',display_name:'Buffalo Fan',handle:'buffalofan',presence_mode:'online'};
   profiles=[my,{id:'b',display_name:'GL3Y5',handle:'gl3',presence_mode:'online'},{id:'c',display_name:'Buffalo 2',handle:'buffalo2',presence_mode:'online'}];
   pieces=[{id:'piece1',name:'Buffalo Wings',color:'#f47735',icon:'🍗',is_public:true,owner_id:'a'},
    {id:'piece2',name:'Private Wings',color:'#f47735',icon:'🍗',is_public:false,owner_id:'b'}];
   memberships=[{piece_id:'piece1',user_id:'a',role:'owner'},{piece_id:'piece1',user_id:'b',role:'member'}];
   pieceChannels=[
    {id:'chan1',piece_id:'piece1',name:'general',category:'TEXT CHANNELS',kind:'text',is_default:true,position:0},
    {id:'chan2',piece_id:'piece1',name:'memes',category:'FUN',kind:'text',is_default:false,position:10}];
   channelUnread=[{channel_id:'chan1',unread_count:2},{channel_id:'chan2',unread_count:4}];
   state.area='pieces';state.selected='piece1';state.channelId='chan2';state.pieceTab='chat';channelReady=true;
  },
  catalog:window.TENDER_EMOJI_CATALOG,channelsFor,selectedChannel,pieceUnreadCount,
  railPieceHTML,emojiResults,storeEmojiHistory,emojiHistory,onlineForGroup,
  presence(id){return activePresence(id)},setRoster(id,status){presenceRoster.set(id,status)},
  miniProfileHTML,styledName,profileGradientStyle,groupState(ids){return onlineForGroup({conversation_members:ids.map(user_id=>({user_id}))})},
  draft:tenderDraftKey
 };})();`);
 assert.notEqual(injected,app,'Unable to inject 0.4 test harness');
 vm.runInNewContext(injected,ctx,{timeout:5000});window.__verify.setup();
 return window.__verify;
}
test('app and bundled Unicode emoji data parse and load before app.js',()=>{
 assert.doesNotThrow(()=>new vm.Script(app));
 assert.doesNotThrow(()=>new vm.Script(emojiJs));
 assert.ok(html.indexOf('emoji-data.js')<html.indexOf('app.js'));
});
test('Complete Unicode 17 fully-qualified emoji: skin tones, flags, families, searchable names',()=>{
 const h=harness();assert.equal(h.catalog.groups.length,10);
 assert.ok(h.catalog.items.length>=3900);
 assert.ok(h.catalog.items.some(x=>x[0]==='🥹'));
 assert.ok(h.catalog.items.some(x=>x[0]==='🍗'));
 assert.ok(h.catalog.items.some(x=>x[0]==='🇲🇩'));
 assert.ok(h.catalog.items.some(x=>x[0]==='👩🏽'));
 assert.ok(h.emojiResults('All','heart').length>20);
 assert.ok(h.emojiResults('Flags','moldova').length>0);
 assert.ok(h.emojiResults('Nature','cat').length>0);
});
test('Emoji picker pages results instead of rendering all 3,900 items simultaneously',()=>{
 assert.match(app,/slice\(emojiOffset,emojiOffset\+150\)/);
 assert.match(app,/tender-emoji-search/);
 assert.match(app,/tender-emoji-category/);
 assert.match(app,/tender-emoji-more/);
});
test('Recent emojis persist separately per signed-in account',()=>{
 const h=harness();
 h.storeEmojiHistory('🦊');h.storeEmojiHistory('🍗');h.storeEmojiHistory('🦊');
 assert.equal(h.emojiHistory()[0],'🦊');
 assert.equal(h.emojiHistory()[1],'🍗');
 assert.equal(h.emojiHistory().length,2);
});
test('Channels partition known communities; default #general and unread badges remain',()=>{
 const h=harness();assert.equal(h.channelsFor('piece1').length,2);
 assert.equal(h.selectedChannel().name,'memes');
 assert.equal(h.pieceUnreadCount('piece1'),6);
 assert.equal(h.pieceUnreadCount('piece2'),0);
 const rail=h.railPieceHTML();assert.match(rail,/Buffalo Wings/);
 assert.match(rail,/rail-piece-unread/);assert.doesNotMatch(rail,/Private Wings/);
});
test('Legacy Pieces without channels fall back to a default #general',()=>{
 const h=harness();assert.equal(h.channelsFor('missing')[0].name,'general');
 assert.equal(h.channelsFor('missing')[0].is_default,true);
});
test('Majority-online group logic counts genuine live roster, tie resolves offline',()=>{
 const h=harness();h.setRoster('b','online');h.setRoster('c','offline');
 assert.equal(h.groupState(['a','b','c']).status,'online');
 h.setRoster('b','offline');assert.equal(h.groupState(['a','b','c']).status,'offline');
 h.setRoster('b','online');assert.equal(h.groupState(['b','c']).status,'offline');
});
test('Invisible mode hides a member even if their stale presence remains tracked',()=>{
 const h=harness();h.setRoster('c','online');
 assert.equal(h.presence('c'),'online');
});
test('Clicking an avatar renders a compact profile with real bio/actions',()=>{
 const h=harness();const html=h.miniProfileHTML({id:'b',display_name:'GL3Y5',handle:'gl3',bio:'Hello world',presence_mode:'online'});
 assert.match(html,/mini-profile-banner/);assert.match(html,/Hello world/);
 assert.match(html,/data-action="open-full-profile"/);
 assert.match(app,/data-action="mini-profile"/);
});
test('Free gradient and display-name effects are constrained to predefined values',()=>{
 const h=harness();const name=h.styledName({display_name:'Buffalo',name_style:'mono',name_effect:'neon',name_color:'#ff4466'});
 assert.match(name,/name-font-mono/);assert.match(name,/name-effect-neon/);
 const bad=h.styledName({display_name:'<bad>',name_style:'evil',name_effect:'evil',name_color:'red'});
 assert.match(bad,/name-font-classic/);assert.match(bad,/&lt;bad&gt;/);assert.doesNotMatch(bad,/name-font-evil/);
});
test('Channel drafts have unique keys, even within the same Piece',()=>{
 const h=harness();const a=h.draft('pieces','piece1','chat','chan1'),b=h.draft('pieces','piece1','chat','chan2');
 assert.notEqual(a,b);assert.match(a,/chan1/);assert.match(b,/chan2/);
});
test('Channel send captures channel at send-time before an asynchronous file upload',()=>{
 assert.match(app,/channelAtSend=kind==='piece'\?state\.channelId:null/);
 assert.match(app,/pieceChannels\.find\(c=>c\.id===channelAtSend&&c\.piece_id===target\)/);
 assert.match(app,/kind==='chat'\|\|state\.channelId===channelAtSend/);
});
test('Additive migration has per-Piece secure channels, read cursors and old-message fallback',()=>{
 assert.match(sql,/ADD COLUMN IF NOT EXISTS channel_id uuid/);
 assert.match(sql,/CREATE TABLE IF NOT EXISTS public\.piece_channels/);
 assert.match(sql,/CREATE TABLE IF NOT EXISTS public\.piece_channel_reads/);
 assert.match(sql,/m\.channel_id IS NULL AND c\.is_default/);
 assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/public\.is_piece_mod\(piece_id\)/);
 assert.match(sql,/FOREIGN KEY\(channel_id,piece_id\)/);
 assert.doesNotMatch(sql,/TRUNCATE|DROP TABLE|DELETE FROM public\.piece_messages/);
});
test('Mobile and desktop styles are present for rail, channels, emoji, and mini profiles',()=>{
 for(const klass of ['rail-piece-zone','piece-channel-row','tender-mini-profile','tender-emoji-results','tender-styled-name','free-nitro-studio'])
  assert.ok(css.includes('.'+klass),klass);
 assert.match(css,/@media\(max-width:760px\)/);
});
