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
console.log('Tender 0.5 smoke checks passed');
