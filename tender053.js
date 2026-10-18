/* Tender 0.5.3: message formatting + in-app announcements.
 * Markdown never passes original user HTML through to the document.
 */
(function(){
 'use strict';
 const escape=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rules=[
  {re:/^\\([\\*_~|>#\x60-])/,literal:true},
  {re:/^\x60([^\x60\n]{1,300})\x60/,tag:'code',literal:true},
  {re:/^\*\*\*([^*\n][^\n]*?)\*\*\*/,tag:'strong',inner:'em'},
  {re:/^\*\*([^*\n][^\n]*?)\*\*/,tag:'strong'},
  {re:/^__([^_\n][^\n]*?)__/,tag:'u'},
  {re:/^~~([^~\n][^\n]*?)~~/,tag:'del'},
  {re:/^\|\|([^|\n][^\n]*?)\|\|/,tag:'span',spoiler:true},
  {re:/^\*([^*\n][^\n]*?)\*/,tag:'em'},
  {re:/^_([^_\n][^\n]*?)_/,tag:'em'}
 ];
 function inline(source,plain,depth=0){
  if(depth>6)return plain(source);
  let out='',rest=String(source||'');
  while(rest){
   let matched=false;
   for(const rule of rules){
    const m=rest.match(rule.re);if(!m)continue;
    if(rule.literal&&rule.tag==='code')out+='<code class="tender-md-code">'+escape(m[1])+'</code>';
    else if(rule.literal)out+=plain(m[1]);
    else if(rule.spoiler)out+='<span class="tender-md-spoiler" title="Spoiler" data-tender-spoiler="true" tabindex="0" role="button" aria-label="Reveal spoiler">'+inline(m[1],plain,depth+1)+'</span>';
    else{
     const inner=inline(m[1],plain,depth+1);
     out+='<'+rule.tag+' class="tender-md-inline">'+(rule.inner?'<'+rule.inner+'>'+inner+'</'+rule.inner+'>':inner)+'</'+rule.tag+'>';
    }
    rest=rest.slice(m[0].length);matched=true;break;
   }
   if(matched)continue;
   const next=rest.slice(1).search(/[\\*_\x60~|]/);
   const size=next<0?rest.length:Math.max(1,next+1);
   out+=plain(rest.slice(0,size));rest=rest.slice(size);
  }
  return out;
 }
 function format(raw,renderPlain){
  const source=String(raw||'').replace(/\r\n?/g,'\n').slice(0,4000);
  const plain=typeof renderPlain==='function'?renderPlain:escape;
  const lines=source.split('\n');
  let out='',list=[],paragraph=[],quote=[],code=[],inCode=false,codeLanguage='';
  const flushList=()=>{if(list.length){out+='<ul class="tender-md-list">'+list.map(item=>'<li>'+inline(item,plain)+'</li>').join('')+'</ul>';list=[]}};
  const flushParagraph=()=>{if(paragraph.length){out+='<p class="tender-md-paragraph">'+paragraph.map(line=>inline(line,plain)).join('<br>')+'</p>';paragraph=[]}};
  const flushQuote=()=>{if(quote.length){out+='<blockquote class="tender-md-quote">'+quote.map(line=>inline(line,plain)).join('<br>')+'</blockquote>';quote=[]}};
  const flush=()=>{flushList();flushParagraph();flushQuote()};
  for(const line of lines){
   if(/^\s*\x60{3}/.test(line)){
    if(inCode){out+='<pre class="tender-md-pre"><code>'+escape(code.join('\n'))+'</code></pre>';code=[];inCode=false}
    else{flush();inCode=true;codeLanguage=line.trim().slice(3,30)}
    continue;
   }
   if(inCode){code.push(line);continue}
   if(!line.trim()){flush();continue}
   const heading=line.match(/^(#{1,3})\s+(.+)$/);
   if(heading){flush();const level=heading[1].length;out+='<h'+level+' class="tender-md-heading">'+inline(heading[2],plain)+'</h'+level+'>';continue}
   if(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)){flush();out+='<hr class="tender-md-divider">';continue}
   const item=line.match(/^\s*[-*]\s+(.+)$/);
   if(item){flushParagraph();flushQuote();list.push(item[1]);continue}
   const quoted=line.match(/^>\s?(.*)$/);
   if(quoted){flushParagraph();flushList();quote.push(quoted[1]);continue}
   flushList();flushQuote();paragraph.push(line);
  }
  flush();if(inCode)out+='<pre class="tender-md-pre"><code>'+escape(code.join('\n'))+'</code></pre>';
  return out;
 }
 const updates=[
 {version:'0.5.3',date:'18 October 2026',kind:'MINOR UPDATE',title:'Inbox & Message Formatting',desc:'In-app Inbox, Unread, Mentions, Bookmarks, Reminders, Updates and News. A cleaner message composer and Markdown formatting.',image:'buffalo.webp',art:'inbox'},
 {version:'0.5.2',date:'18 October 2026',kind:'PATCH',title:'Profile Studio & Live Chat Fixes',desc:'Rebuilt profile editor with live preview, profile-first Piece Tags, the latest-message fix and automatic chat resynchronization.',image:'buffalo.webp',art:'profile'},
 {version:'0.5.1',date:'18 October 2026',kind:'PATCH',title:'DM Emoji Rescue',desc:'Fixed a database slow-mode trigger causing normal direct messages to fail, including emoji shortcode messages.',image:'buffalo.webp',art:'repair'},
 {version:'0.5',date:'18 October 2026',kind:'MAJOR UPDATE',title:'The Content Update',desc:'Message requests, threads, safe HTML/CSS embeds, stickers, profile widgets, Piece Tags, forum channels and account privacy features.',image:'buffalo.webp',art:'content'},
 {version:'0.4.6',date:'18 October 2026',kind:'PATCH',title:'Create Channel Repair',desc:'Fixed the channel creation click path so browser form validation no longer silently stops channel creation.',image:'buffalo.webp',art:'repair'},
 {version:'0.4.5',date:'October 2026',kind:'PATCH',title:'Chat Date Separators',desc:'Day dividers make ongoing conversations easier to read.',image:'buffalo.webp',art:'messages'},
 {version:'0.4.4',date:'October 2026',kind:'MINOR UPDATE',title:'Live Presence',desc:'Online and offline status indicators update more reliably throughout conversations.',image:'buffalo.webp',art:'presence'}
 ];
 const news=[
 {id:'inbox-launch',date:'18 October 2026',title:'Tender introduces the Inbox',desc:'Activity, updates and reminders now have a home inside the app. Your conversations stay the main focus.',image:'buffalo.webp',art:'inbox'},
 {id:'creator-studio',date:'18 October 2026',title:'Profile customization keeps growing',desc:'Profile Studio brings independent banner and username styling, layouts and free Piece Tags.',image:'buffalo.webp',art:'profile'},
 {id:'bots-roadmap',date:'18 October 2026',title:'Community bots remain a future possibility',desc:'The Tender Developer dashboard and bot APIs are being considered for a future release. No release date has been confirmed.',image:'buffalo.webp',art:'content'}
 ];
 window.Tender053=Object.freeze({format,inline,escape,updates,news});
})();
