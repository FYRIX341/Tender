// Tender 0.5: dependency-free smoke tests. Run with: node tests/tender05-smoke.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const app=read('app.js'),helper=read('tender05.js'),index=read('index.html'),sql=read('migration_0_5.sql');
new vm.Script(app,{filename:'app.js'});
new vm.Script(helper,{filename:'tender05.js'});
const window={};
vm.runInNewContext(helper,{window},{timeout:1000});
const tender=window.Tender05;
assert.ok(tender,'Tender05 library is available');
assert.equal(tender.expand(':sob: and :fire:',true),'😭 and 🔥');
assert.equal(tender.expand('Hi :) >:(',true),'Hi 🙂 👿');
assert.equal(tender.expand(':sob:',false),'😭');
assert.equal(tender.expand('https://example.com/:sob:',true),'https://example.com/:sob:');
const embed=tender.renderEmbed({html:'<h1>Hello</h1>',css:'h1{color:red}'});
assert.match(embed,/sandbox=""/,'untrusted HTML iframe has no capabilities');
assert.match(embed,/srcdoc=/,'embed uses srcdoc');
assert.ok(!embed.includes('<h1>Hello</h1>'),'untrusted markup never interpolated directly');
const doc=tender.embedDoc({html:'<p>Test</p>',css:'body{color:red}'});
assert.match(doc,/script-src 'none'/);
assert.match(doc,/connect-src 'none'/);
assert.match(doc,/form-action 'none'/);
const bad=tender.renderSticker(JSON.stringify({name:'<svg onload=alert(1)>',image_path:'../../evil.svg',emoji:'🍗'}),()=>'https://example.com/evil.svg');
assert.ok(!bad.includes('<img'),'reject untrusted image paths');
assert.ok(!bad.includes('<svg'),'escape sticker text');
const valid=tender.renderSticker(JSON.stringify({
 name:'Custom!',image_path:'00000000-0000-0000-0000-000000000000/sticker-00000000-0000-0000-0000-000000000000.png'
}),x=>'https://test.invalid/'+x);
assert.match(valid,/<img /);
assert.ok(index.indexOf('tender05.js')>0 && index.indexOf('tender05.js')<index.indexOf('app.js'),'load helper before app');
assert.ok(app.includes('data-action="channel-submit"')&&app.includes('submitChannelForm(form)'),'0.4.6 Create Channel repair preserved');
assert.ok(app.includes("tender05ThreadView")&&app.includes("tender05RequestModal"),'thread and inbox code present');
assert.ok(app.includes("tender05HTMLPreview")&&app.includes("tender05StickerPicker"),'embed and stickers present');
assert.ok(sql.includes('BEGIN;')&&sql.trimEnd().endsWith('COMMIT;'),'atomic migration');
for(const delimiter of ['$$','$tender$']){
 const count=sql.split(delimiter).length-1;
 assert.equal(count%2,0,'SQL dollar-quote delimiter '+delimiter+' must be balanced');
}
assert.ok(!sql.includes(' AS $\n'),'do not deploy broken SQL function delimiters');
assert.ok(!sql.includes("TG_TABLE_NAME='piece_messages' AND NOT public.is_piece_mod(NEW.piece_id)"),
 'Piece-specific column must never be read in a short-circuit expression');
const hotfix=read('migration_0_5_1.sql');
assert.match(hotfix,/IF TG_TABLE_NAME='piece_messages' THEN\s+IF NOT public\.is_piece_mod\(NEW\.piece_id\) THEN/,
 'Hotfix scopes piece_id to Piece messages only');
assert.ok(hotfix.includes('CREATE OR REPLACE FUNCTION public.tender_guard_message_rate()'),
 "Hotfix replaces the existing function, not the user's tables");
assert.ok(!/(DROP TABLE|TRUNCATE|DELETE FROM)/i.test(hotfix),'Hotfix must not remove data');
assert.ok(hotfix.includes('BEGIN;') && hotfix.trimEnd().endsWith('COMMIT;'),'Hotfix is transactional');


// Tender 0.5.2: long conversations must load newest messages, never oldest 150.
assert.ok(app.includes("q('messages').select('*').eq('conversation_id',selected).order('created_at',{ascending:false}).limit(150)"),
 'DM history must request newest messages first');
assert.ok(app.includes("assert(await query.order('created_at',{ascending:false}).limit(150))"),
 'Piece chat must request newest messages first');
assert.ok(app.includes('fresh.reverse();'),'Latest-first DB results are presented in chronological order');
assert.ok(app.includes('function tenderChatProbe(force=false)'),'Live chat has a recovery probe');
assert.ok(app.includes("tenderChatProbe(true).catch(console.warn)"),'Reconnection/visibility triggers a chat resync');
assert.ok(app.includes('tenderStartChatSync();'),'Live sync backup starts with the realtime subscription');
assert.ok(app.includes('tenderStopChatSync();'),'Live sync backup stops on logout or re-subscribe');
assert.ok(app.includes('tenderTagPickerModal'),'Piece Tags can be equipped from the profile');
assert.ok(app.includes('data-action="tender-v3-tag-picker"'),'Profile Tag picker has a user-facing action');

// Run the actual Profile Studio renderer in isolation to catch runtime template
// mistakes and ensure it truly has controls + a persistent live preview.
const studioStart=app.indexOf('function renderProfileStudioV3(){');
const studioEnd=app.indexOf('\nfunction tenderStudioPreviewRefresh(){',studioStart);
assert.ok(studioStart>=0&&studioEnd>studioStart,'Profile Studio renderer exists');
const studioSource=app.slice(studioStart,studioEnd);
const context={
 my:{id:'test-id',display_name:'Tender Tester',handle:'tester',bio:'I like Tender',name_style:'classic',name_effect:'solid',banner_mode:'solid'},
 user:{id:'test-id'},
 state:{studioPanel:'identity'},
 visualReady:true,tender05Ready:true,pronounsReady:true,extendedReady:true,
 nameStyles:['classic','rounded'],nameEffects:['solid','gradient'],
 ico:()=>'<span>icon</span>',
 esc:v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;'),
 tenderSafeColor:(v,fallback)=>/^#[a-f0-9]{6}$/i.test(v||'')?v:fallback,
 avatars:()=>'<span class="avatar">T</span>',
 tender05TagHTML:()=>'',tender05WidgetCards:()=>'<div>Widgets</div>',
 tenderStudioPreviewHTML:()=>'<div class="example-profile">Preview</div>'
};
const renderStudio=vm.runInNewContext('('+studioSource+')',context,{timeout:1000});
const studioHTML=renderStudio();
assert.ok(studioHTML.includes('tender-v3-workspace'),'New studio has a dedicated workspace');
assert.ok(studioHTML.includes('tender-v3-preview-rail'),'New studio has a live preview pane');
assert.ok(studioHTML.includes('data-tender-v3-panel="banner"'),'Banner editor tab rendered');
assert.ok(studioHTML.includes('data-tender-v3-panel="name"'),'Name gradient controls rendered');
assert.ok(studioHTML.includes('data-tender-v3-panel="tags"'),'Piece Tag picker section rendered');
assert.ok(studioHTML.includes('id="profile-style-form"'),'Existing profile-style save form preserved');
assert.ok(studioHTML.includes('id="profile-form"'),'Existing identity save form preserved');
assert.ok(studioHTML.includes('data-action="tender-v3-randomize"'),'Surprise Me palette feature rendered');
assert.ok(!studioHTML.includes('settings-profile-preview'),'Old profile editor is not reused');


const script053=read('tender053.js');
new vm.Script(script053,{filename:'tender053.js'});
const win053={};
vm.runInNewContext(script053,{window:win053},{timeout:1000});
const md053=win053.Tender053;
assert.ok(md053.format('# hi').includes('<h1'));
assert.ok(md053.format('**Bold**').includes('<strong'));
assert.ok(md053.format('***both***').includes('<em'));
assert.ok(md053.format('__underline__').includes('<u'));
assert.ok(md053.format('~~strike~~').includes('<del'));
assert.ok(md053.format('---').includes('<hr'));
assert.ok(!md053.format('<script>alert(1)</script>').includes('<script>'),'raw HTML escaped');
assert.ok(!md053.format('**<img src=x>**').includes('<img'),'nested HTML escaped');
assert.ok(md053.updates.some(x=>x.kind==='MAJOR UPDATE'),'major release visible');
assert.ok(md053.updates.every(x=>x.image),'update artwork present');
assert.ok(md053.news.every(x=>x.title&&x.image),'news artwork present');
assert.ok(index.indexOf('tender053.js')<index.indexOf('app.js'),'safe renderer loads first');
assert.ok(app.includes('window.Tender053.format(raw,safePlain)'),'messages use Markdown');
assert.ok(app.includes('tender-inbox-toggle'),'topbar Inbox button');
assert.ok(app.includes('composer-plus'),'unified plus menu');
assert.ok(app.includes('function tenderInboxContent()'),'in-app Inbox views');
const sql053=read('migration_0_5_3.sql');
assert.ok(sql053.includes('ENABLE ROW LEVEL SECURITY'),'inbox access rules');
assert.ok(sql053.includes('tender_inbox_capture_mentions'),'mention index trigger');
assert.ok(sql053.includes('tender_inbox_mark_all_read'),'mark-read RPC');
assert.ok(sql053.trimEnd().endsWith('COMMIT;'),'transactional migration');
assert.equal((sql053.split('$tender$').length-1)%2,0,'balanced SQL tags');
// Tender 0.5.4: inline edits, historic mentions and complete in-app articles.
assert.ok(app.includes('function tenderEditStart(id,type)'),'inline editor exists');
assert.ok(app.includes('function tenderEditSubmit(form)'),'edit save function exists');
assert.ok(app.includes('function tenderEditCancel()'),'edit cancel exists');
assert.ok(app.includes('tender-inline-edit-form'),'editing happens inside the original message bubble');
assert.ok(app.includes("case'tender-inline-edit-form'"),'inline form submission is connected');
assert.ok(!app.includes('case\'edit-message-form\''),'old separate edit modal form removed');
assert.ok(app.includes('tender_edit_own_message'),'edited messages use a permission-checked RPC');
assert.ok(app.includes(".select('id,edited_at').single()"),'legacy DM update verifies that one row changed');
assert.ok(app.includes('node.querySelector(\'.tender-inline-edit-form\')'),'realtime preserves draft while editing');
assert.ok(app.includes('tenderInboxRecoverMentions'),'older mention recovery exists');
assert.ok(app.includes('tender-inbox-mention-scan'),'older mention scan has a continue button');
assert.ok(app.includes('tenderInboxOpenArticle'),'Inbox opens full release/news articles');
assert.ok(app.includes('tender-inbox-article-hero'),'article popup has image/hero content');
assert.ok(app.includes('data-action="tender-inbox-article"'),'news/update cards are buttons');
assert.ok(win053.Tender053.updates.some(x=>x.version==='0.5.4'),'0.5.4 changelog in the app');
for(const update of win053.Tender053.updates)assert.ok(win053.Tender053.articles[update.version]?.sections?.length,'full changelog for '+update.version);
for(const story of win053.Tender053.news)assert.ok(win053.Tender053.articles[story.id]?.sections?.length,'complete article for '+story.id);
const migration054=read('migration_0_5_4.sql');
assert.ok(migration054.includes('tender_inbox_backfill_my_mentions'),'historic mention scan function exists');
assert.ok(migration054.includes('tender_edit_own_message'),'edit function is server protected');
assert.ok(migration054.includes('m.author_id=editor'),'edits checked against current author');
assert.ok(migration054.includes('member.user_id=viewer'),'Piece mention backfill limited to current members');
assert.ok(migration054.includes('cm.user_id=viewer'),'DM mention backfill limited to conversation members');
assert.ok(migration054.includes('b.created_at,true'),'historical mentions marked already read');
assert.ok(migration054.includes('batch_count'),'historical scan uses bounded batches');
assert.equal((migration054.split('$tender$').length-1)%2,0,'0.5.4 SQL dollar quotes balanced');
assert.ok(migration054.trimEnd().endsWith('COMMIT;'),'0.5.4 migration is transactional');
assert.ok(!/(DROP TABLE|TRUNCATE TABLE|DELETE FROM public\.messages|DELETE FROM public\.piece_messages)/i.test(migration054),'no destructive chat operations');

console.log('Tender 0.5 smoke checks passed');
