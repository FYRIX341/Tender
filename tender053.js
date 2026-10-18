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

 const articles={
  '0.5.4':{
   intro:'This patch focuses on the little things that should just work: changing your own messages, finding people who mentioned you in the past, and reading complete release stories without leaving Tender.',
   sections:[
    {title:'Inline message editing',body:['Editing no longer opens a separate dialog. Press Edit on a message you sent, and its original chat bubble becomes an editable message box.','Press Enter to save, Shift+Enter for a new line, or Escape to cancel. A small (edited) label remains on changed messages.'],items:['Messages are saved only after the server confirms the change.','The editor remains usable while other chat messages arrive.','Your own messages in DMs and Pieces are supported after the 0.5.4 database migration.']},
    {title:'Older mentions return',body:['Previous Inbox versions captured new @mentions, but had no index of messages written before that feature launched.','The new historical scan searches messages you are allowed to read from conversations and Pieces you still belong to, recording matching mentions in your personal Inbox.'],items:['Historical mentions are already marked as read so they do not create a flood of alerts.','Large histories are searched in batches, with a Continue scanning option.','Old usernames and messages from Pieces you have left cannot always be recovered.']},
    {title:'Full changelog and news articles',body:['The cards under Inbox → Updates and News now open large, scrollable articles. Each story has a cover, full explanation, feature sections and release details.','Tender keeps the information inside the app so members do not have to browse GitHub release Markdown files.']},
    {title:'Getting started',body:['Run migration_0_5_4.sql after the earlier Tender database migrations, then refresh Tender. Open Inbox → Mentions to begin recovering older messages.','This patch does not remove existing messages, bookmarks, profiles or Pieces.']}
   ]
  },
  '0.5.3':{
   intro:'Tender gained a new home for activity, announcements and important messages: the Inbox. This release also redesigned the composer and introduced Discord-style text formatting.',
   sections:[
    {title:'A new Inbox',body:['Open the Inbox button in the conversation top bar. Six tabs put activity in one convenient place: Unread, Mentions, Bookmarks, Reminders, Updates and News.','Unread combines message notifications with Piece channels. Mentions can jump to a conversation or Piece, and bookmarks and reminders preserve the message you care about.'],items:['Mark all as read for alerts and supported Piece channel cursors.','Updates are grouped into Major, Minor and Patch categories.','News is curated from actual Tender project decisions and announcements.']},
    {title:'Cleaner message composer',body:['The attachment and creation tools now live inside one + menu on the left: Upload File, Poll, Record Voice Clip, HTML/CSS Embed and Rich Embed.','GIFs, stickers and emojis stay on the right where they are easy to reach.']},
    {title:'Message formatting',body:['Tender now supports first, second and third-level headings with #, ## and ###, along with bold, italic, bold italic, underline, strikethrough, quote blocks, lists, dividers, spoilers and code blocks.','Formatting is rendered with escaped HTML. Typing markup into a message cannot execute HTML or JavaScript in someone else’s browser.']},
    {title:'Reminders and saved messages',body:['Right-click a message to bookmark it or schedule an in-app reminder. These records are protected by database access rules and require migration_0_5_3.sql.','Reminders notify you while Tender is open, or when you next open Tender after the due time. They are not offline system push notifications.']},
    {title:'Profile Studio integration',body:['The familiar editor and live preview were returned to User Settings, with less decorative styling and a simpler title.']}
   ]
  },
  '0.5.2':{
   intro:'A repair and redesign release following feedback from the first Content Update.',
   sections:[
    {title:'Messages appear more reliably',body:['Long conversations were mistakenly loading the oldest 150 messages instead of the newest. Tender now requests the newest messages and displays them in chronological order.','A lightweight backup sync checks for missing messages when realtime delivery pauses, and it resynchronizes when Tender regains focus.']},
    {title:'Profile Studio rebuilt',body:['The profile customization interface moved from a long wall of settings to a three-column editor with category navigation, editing controls and a persistent preview.'],items:['Identity, banners, name effects, layouts, tags, widgets and media each have a section.','Live previews show changes before saving.','The Surprise Me button previews a coordinated color palette.']},
    {title:'Piece Tags belong to your profile',body:['Members can choose an eligible Piece Tag directly from their own profile. The tag can also be unequipped without visiting the Piece.','Piece owners still set the tag’s appearance inside the Piece.']}
   ]
  },
  '0.5.1':{
   intro:'A small database hotfix for a very annoying message-sending bug.',
   sections:[
    {title:'What happened?',body:['After the 0.5 database update, some messages failed with the error: record "new" has no field "piece_id".','The spam/slow-mode trigger was shared by direct messages and Piece messages, but one condition referenced a Piece-only column on a normal direct-message row.']},
    {title:'How it was fixed',body:['The Piece slow-mode check now runs only inside an explicit Piece-message branch. This preserves the slow-mode feature while allowing ordinary direct messages and emoji shortcodes to send again.','Existing databases needed migration_0_5_1.sql. The hotfix does not delete message history.']}
   ]
  },
  '0.5':{
   intro:'The Content Update: a huge collection of profile, community, privacy and messaging features developed for Tender’s next chapter.',
   sections:[
    {title:'Message requests and privacy',body:['Message requests allow non-friends to contact you according to your privacy settings. Requests include Accept, Decline, Batch Decline, Block and Report.','Members can allow direct DMs from everyone, require a request, accept friends only, or disable incoming DMs.'],items:['Mutual-friend and shared-Piece context for pending requests.','Suspicious-link warnings for unexpected requests.','Account deactivation and a cancellable 30-day deletion-request flow.']},
    {title:'Threads, forums and communities',body:['Conversations and Pieces gained public discussion threads and invited-member private threads protected by database access checks.','Pieces gained forum channels, an onboarding welcome screen, announcements and an owner-configurable message slow mode.']},
    {title:'Profiles and personalization',body:['The Profile Studio expanded with gradient and solid-color banners, separate username effects, layout presets, widget customization and free Piece Tags.','Guestbooks let other members leave profile messages under moderation rules.']},
    {title:'More expressive messaging',body:['Tender added emoji shortcode conversion, classic emoticons, custom image/emoji stickers, pinned-message panels and optional translations.','HTML/CSS embeds render inside a restricted iframe. Arbitrary JavaScript and interactive external code were intentionally not enabled.']},
    {title:'Calls and appearance',body:['The existing one-to-one calling interface gained movable and expandable windows. Light-mode contrast and workspace themes received additional attention.']},
    {title:'What was intentionally not included?',body:['Community bots and a Tender Developer portal remained possible future projects, not confirmed releases.','True multi-user Stage/voice channels and interactive user-script embeds need separate infrastructure. Account-deletion requests require a secure cleanup service before permanent deletion is automated.']}
   ]
  },
  '0.4.6':{
   intro:'Channel creation finally started behaving like a real button.',
   sections:[
    {title:'The bug',body:['The Create Channel form could be blocked by native browser validation before Tender’s JavaScript submit handler ever ran. This made it look like clicking Create did absolutely nothing.']},
    {title:'The repair',body:['Tender added a direct click path alongside the form submit handler and made errors more visible. The modal also received a version marker so the repaired frontend could be identified.','No database tables or message history were reset for this fix.']}
   ]
  },
  '0.4.5':{
   intro:'Longer chats are easier to follow when days are clearly separated.',
   sections:[
    {title:'A timeline you can read',body:['Messages now display date separators between different calendar days. The date labels are integrated with chat updates so they remain in the right place as messages arrive.']},
    {title:'Compatibility',body:['The change was focused on presentation and did not remove existing messages or conversation features.']}
   ]
  },
  '0.4.4':{
   intro:'Tender made presence feel more like an actual shared space.',
   sections:[
    {title:'Online status improvements',body:['Live online/offline indicators became more connection-aware rather than treating a saved preference as proof of a live connection.','Users can see presence signals in chats and community views where available.']},
    {title:'Connection limits',body:['A user’s status may briefly update when their connection drops or when the app reconnects. Presence indicates Tender connection state, not all device activity.']}
   ]
  },
  'inbox-launch':{
   intro:'Tender members have a new place to catch up without hunting around in every chat.',
   sections:[
    {title:'One button, six tabs',body:['The Inbox lives in the conversation top bar. Unread collects chat activity, Mentions tracks messages addressed to your username, and Bookmarks keeps messages you saved.','Reminders help you return to important messages, Updates shows release history, and News shares meaningful Tender announcements.']},
    {title:'A release history inside Tender',body:['Updates can be filtered by Major, Minor and Patch. Open an update card to read its entire changelog with a cover image. No GitHub Markdown file is required for normal reading.']},
    {title:'Privacy and availability',body:['Bookmarks and reminders are private to their owner, and archived mentions are recovered only from chats and Pieces you still have permission to read.']}
   ]
  },
  'creator-studio':{
   intro:'Members asked for control over how their profiles look, and Tender keeps giving them more options.',
   sections:[
    {title:'Your identity, your presentation',body:['Profile Studio keeps your identity details, banners, username styles, layouts, widgets and Piece Tags in one editor.','Solid banner colors are available for people who do not want to upload images. Username gradients are independent of banner and profile-background colors.']},
    {title:'Made for actual use',body:['A live preview makes it easier to understand your changes before saving. The editor now sits inside User Settings with a calmer background and straightforward navigation.']},
    {title:'Community identity',body:['Piece Tags let members display a tag from a Piece they joined, and members equip those tags from their own profile.']}
   ]
  },
  'bots-roadmap':{
   intro:'Tender bot support is an idea the community likes—but it is not a confirmed shipped feature.',
   sections:[
    {title:'The idea',body:['A future bot system could let developers create automated accounts for community moderation, game tools and other integrations.','One proposed location is tender.oops.wtf/dev/dashboard, where developers could register bots, manage credentials and program integrations.']},
    {title:'Why it is being saved for later',body:['Bot creation would need a secure API, credential rotation, permission scopes, abuse controls, rate limits and dependable hosting. Adding those systems to an already-large update would not be responsible.']},
    {title:'Current status',body:['A dedicated bot update was discussed as a possible 0.5.5 or 0.6 release. Those version numbers and dates are proposals, not promises.']}
   ]
  }
 };

 const updates=[
 {version:'0.5.4',date:'18 October 2026',kind:'PATCH',title:'Inline Editing & Mention History',desc:'Edit messages right in the chat, recover previous @mentions, and open full news/changelog articles.',image:'buffalo.webp',art:'repair'},
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
 window.Tender053=Object.freeze({format,inline,escape,updates,news,articles});
})();
