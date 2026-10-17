/* Tender 🍗 — browser app. A real Supabase backend is required for shared data. */
(() => {
'use strict';
const ROOT = document.getElementById('root');
const MODALS = document.getElementById('modal-root');
const TOASTER = document.getElementById('toaster');
const ICONS = {
 chat:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h.5a8.48 8.48 0 0 1 8 8z"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 pieces:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.89 1.89-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-2.68v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-1.89-1.89.06-.06A1.65 1.65 0 0 0 7 15a1.65 1.65 0 0 0-1.51-1H5.4v-2.68h.09A1.65 1.65 0 0 0 7 10.32a1.65 1.65 0 0 0-.33-1.82l-.06-.06 1.89-1.89.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V5.4h2.68v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 1.89 1.89-.06.06A1.65 1.65 0 0 0 19.4 10a1.65 1.65 0 0 0 1.51 1h.09v2.68h-.09A1.65 1.65 0 0 0 19.4 15z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
 send:'<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>', back:'<path d="m15 18-6-6 6-6"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>', check:'<path d="m20 6-11 11-5-5"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
 forum:'<path d="M3 6h18M3 12h18M3 18h12"/>',
 logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
 smile:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
 clip:'<path d="m21.44 11.05-9.2 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 1 1 5.66 5.66l-9.2 9.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>',
 heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6m4-6v6"/>',
 external:'<path d="M15 3h6v6m0-6L10 14"/><path d="M21 13v8H3V3h8"/>',
 lock:'<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
 globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
 user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 palette:'<circle cx="12" cy="12" r="9"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="8" r="1"/><path d="M16.4 14.1a2.4 2.4 0 0 0 0 4.8"/>',
 shield:'<path d="m12 22 1.5-.7C19 18.7 21 14 21 8V4l-9-3-9 3v4c0 6 2 10.7 7.5 13.3z"/><path d="m9 12 2 2 4-4"/>',
 accessibility:'<circle cx="12" cy="3.5" r="1.5"/><path d="M3 8h18M12 8v5m0 0-5 8m5-8 5 8"/>',
 mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8"/>',
 'mic-off':'<path d="m2 2 20 20M9 9v3a3 3 0 0 0 5 2M15 9V5a3 3 0 0 0-5-2M5 10a7 7 0 0 0 12 5M19 10a7 7 0 0 1-1 4M12 17v5m-4 0h8"/>',
 headphones:'<path d="M3 14v-3a9 9 0 0 1 18 0v3M3 14v5a2 2 0 0 0 2 2h3v-9H5a2 2 0 0 0-2 2zm18 0v5a2 2 0 0 1-2 2h-3v-9h3a2 2 0 0 1 2 2z"/>',
 'headphones-off':'<path d="m2 2 20 20M3 14v-3a9 9 0 0 1 2-6M10 2a9 9 0 0 1 11 9v3M3 14v5a2 2 0 0 0 2 2h3v-9H5a2 2 0 0 0-2 2zM19 12h-3v9h3a2 2 0 0 0 2-2v-5"/>',
 edit:'<path d="m16 3 5 5-12 12H4v-5zM14 5l5 5"/>', bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>'
};
const ico=(name,extra='')=>`<span class="ico ${extra}" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||ICONS.info}</svg></span>`;
const esc=(value='')=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt = iso => {try{return new Date(iso).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}catch{return ''}};
const relative = iso => {let d=(Date.now()-new Date(iso).getTime())/1000;return d<60?'just now':d<3600?Math.floor(d/60)+'m ago':d<86400?Math.floor(d/3600)+'h ago':new Date(iso).toLocaleDateString();};
const validUrl = url => {try{let u=new URL(url,location.origin);return ['http:','https:'].includes(u.protocol)?u.href:'#';}catch{return '#'}};
const avatars = p => `<span class="avatar md">${p?.avatar_url?`<img src="${esc(validUrl(p.avatar_url))}" alt="">`:esc((p?.display_name||p?.handle||'?').slice(0,1).toUpperCase())}</span>`;
// Piece avatars reuse the existing text "icon" column: HTTPS storage image URL or legacy emoji.
// Existing emoji icons remain compatible; no SQL migration is necessary.
const pieceHasPhoto = p => typeof p?.icon==='string' && /^https:\/\//i.test(p.icon) && validUrl(p.icon)!=='#';
function pieceAvatar(p,extra=''){
 const color=/^#[0-9a-f]{6}$/i.test(p?.color||'')?p.color:'#f47735';
 return `<span class="piece-avatar ${esc(extra)}" style="background:${esc(color)}33">${pieceHasPhoto(p)?`<img class="piece-avatar-image" src="${esc(validUrl(p.icon))}" alt="" loading="lazy">`:esc(p?.icon||'🍗')}</span>`;
}
const profileFace=p=>`<button type="button" class="profile-click profile-face" data-action="open-profile" data-id="${esc(p.id||'')}" aria-label="View ${esc(p.display_name||'member')}'s profile" title="View profile">${avatars(p)}</button>`;
const profileName=p=>`<button type="button" class="profile-click profile-name" data-action="open-profile" data-id="${esc(p.id||'')}" title="View ${esc(p.display_name||'member')}'s profile">${esc(p.display_name||'Tender member')}</button>`;
const config = window.TENDER_CONFIG || {};
let db, session, user, my, profiles=[], friendships=[], conversations=[], pieces=[], memberships=[], activeMessages=[], activePosts=[], activeGallery=[], activeComments=[], activeReactions=[], activeMembers=[], selectedPost=null, channel=null;
let state={area:'chats', selected:null, channelId:null, pieceTab:'chat', settingsTab:'profile', search:'', loginMode:'login', mobileDetail:false, setup:false, busy:false, authReady:false};
let realtimeChannel=null, realtimeRefreshTimer=null;
function toast(message,bad=false){const div=document.createElement('div');div.className='toast';div.textContent=message;div.style.borderColor=bad?'#bb4b5f':'';TOASTER.append(div);setTimeout(()=>div.remove(),5000);}
async function safe(work){if(state.busy)return;state.busy=true;try{await work()}catch(e){console.error('Tender:',e);toast(e.message||'Something went wrong.',true)}finally{state.busy=false}}
function q(table){return db.from(table)};
function assert(result){if(result.error)throw result.error;return result.data}
function pby(id){return profiles.find(p=>p.id===id)||{id,display_name:'Tender member',handle:'member'};}
function myFriendIds(){return friendships.filter(f=>f.status==='accepted').map(f=>f.requester===user.id?f.recipient:f.requester)}
function getConversation(id){return conversations.find(c=>c.id===id)};
function namesFor(c){let members=c?.conversation_members||[];if(c.kind==='group')return c.title;let other=members.find(m=>m.user_id!==user.id);return pby(other?.user_id).display_name||'Direct message'}
function avatarFor(c){return c.kind==='group'?`<span class="squad-avatar">👥</span>`:avatars(pby((c.conversation_members||[]).find(m=>m.user_id!==user.id)?.user_id))}
function inPiece(pid){return memberships.some(m=>m.piece_id===pid && m.user_id===user.id)}
function ownPiece(pid){return pieces.some(p=>p.id===pid&&p.owner_id===user.id)}
const selectedPiece=()=>pieces.find(x=>x.id===state.selected);
// Tender 0.4 — membership-scoped channels, read cursors and honest live presence.
// Legacy Piece messages (without channel_id) always belong to #general.
function channelsFor(pid){
 const rows=pieceChannels.filter(c=>c.piece_id===pid).sort((a,b)=>(a.position||0)-(b.position||0)||(a.created_at||'').localeCompare(b.created_at||''));
 return rows.length?rows:[{id:'legacy-'+pid,piece_id:pid,name:'general',kind:'text',topic:'Main Piece chat',category:'TEXT CHANNELS',is_default:true}];
}
function selectedChannel(pid=state.selected){
 const list=channelsFor(pid);
 return list.find(c=>c.id===state.channelId)||list.find(c=>c.is_default)||list[0];
}
const channelUnreadCount=id=>channelUnread.find(x=>x.channel_id===id)?.unread_count||0;
const pieceUnreadCount=pid=>channelsFor(pid).reduce((sum,c)=>sum+Number(channelUnreadCount(c.id)||0),0);
function railPieceHTML(){
 if(!user)return '';
 const joined=pieces.filter(p=>inPiece(p.id)).slice(0,80);
 return `<div class="rail-piece-divider" role="separator"></div><div class="rail-piece-list" aria-label="Your Pieces">
 ${joined.map(p=>`<button type="button" class="rail-piece ${state.selected===p.id&&['pieces','discover'].includes(state.area)?'active':''}" data-action="rail-piece" data-id="${esc(p.id)}" title="${esc(p.name)}" aria-label="Open Piece ${esc(p.name)}">${pieceAvatar(p)}${pieceUnreadCount(p.id)?`<span class="rail-piece-unread" aria-label="${pieceUnreadCount(p.id)} unread Piece messages">${Math.min(99,pieceUnreadCount(p.id))}</span>`:''}</button>`).join('')}
 </div><button type="button" class="rail-piece-add" data-action="new-piece" title="Create a Piece" aria-label="Create Piece">${ico('plus','icon-sm')}</button>`;
}
let unreadRefreshTimer=null;
async function loadChannelData(){
 if(!user||!db)return;
 try{
  const result=await q('piece_channels').select('*').order('position',{ascending:true}).limit(1000);
  if(result.error){channelReady=false;pieceChannels=[];channelUnread=[];return}
  channelReady=true;pieceChannels=result.data||[];
  await loadChannelUnreads();
 }catch(e){channelReady=false;pieceChannels=[];channelUnread=[];console.warn('Tender channel setup pending',e)}
}
async function loadChannelUnreads(){
 if(!user||!channelReady)return;
 try{const r=await db.rpc('tender_channel_unreads');if(!r.error)channelUnread=r.data||[]}catch(e){console.warn('Unread counts unavailable',e)}
}
function scheduleChannelUnreadRefresh(){
 if(!user||!channelReady)return;
 clearTimeout(unreadRefreshTimer);
 unreadRefreshTimer=setTimeout(async()=>{await loadChannelUnreads();renderPieceRail();if(['pieces','discover'].includes(state.area))renderSidebar()},500);
}
function renderPieceRail(){
 const rail=document.querySelector('.rail-piece-zone');if(rail)rail.innerHTML=railPieceHTML();
 const piecesBtn=document.querySelector('.rail-btn[data-area="pieces"]');
 if(piecesBtn){piecesBtn.querySelector('.unread-badge')?.remove();const total=pieces.filter(p=>inPiece(p.id)).reduce((n,p)=>n+pieceUnreadCount(p.id),0);if(total)piecesBtn.insertAdjacentHTML('beforeend',renderBadge(total))}
}
async function markChannelRead(){
 if(!user||!channelReady||!state.selected||!['pieces','discover'].includes(state.area)||state.pieceTab!=='chat')return;
 const c=selectedChannel();if(!c||c.id.startsWith('legacy-')||!inPiece(c.piece_id))return;
 try{
  const r=await q('piece_channel_reads').upsert({channel_id:c.id,user_id:user.id,last_read_at:new Date().toISOString()},{onConflict:'channel_id,user_id'});
  if(r.error)throw r.error;
  const row=channelUnread.find(x=>x.channel_id===c.id);if(row)row.unread_count=0;
  renderPieceRail();
 }catch(e){console.warn('Piece read cursor failed',e)}
}
let presenceChannel=null;
let presenceRoster=new Map();
function activePresence(id){
 if(!id)return 'offline';
 const declared=pby(id).presence_mode||'online';
 if(declared==='invisible')return 'offline';
 if(id===user?.id)return declared;
 return presenceRoster.get(id)||'offline';
}
function onlineForGroup(conversation){
 const ids=[...new Set((conversation?.conversation_members||[]).map(m=>m.user_id))];
 const online=ids.filter(id=>activePresence(id)!=='offline').length;
 const offline=ids.length-online;
 return {online,offline,status:online>offline?'online':'offline'};
}
function presenceDotHTML(status,label=''){
 const valid=['online','idle','dnd'].includes(status)?status:'offline';
 return `<span class="tender-presence-dot ${valid}" aria-label="${esc(label||(valid==='offline'?'Offline':valid))}" title="${esc(label||(valid==='offline'?'Offline':valid))}"></span>`;
}
async function startPresence(){
 if(!db||!user)return;
 if(presenceChannel){await db.removeChannel(presenceChannel).catch(()=>{});presenceChannel=null}
 presenceRoster=new Map();
 const sessionUser=user.id;
 const channel=db.channel('tender-online-v1',{config:{presence:{key:sessionUser}}});
 presenceChannel=channel;
 const update=()=>{
  const next=new Map();for(const [id,rows] of Object.entries(channel.presenceState()||{})){
   if(id===sessionUser||!Array.isArray(rows))continue;
   const item=rows.find(row=>row.user_id===id&&['online','idle','dnd'].includes(row.status));
   if(item)next.set(id,item.status);
  }
  presenceRoster=next;
  if(user?.id===sessionUser){updatePresenceMarkers();renderInfoPanel()}
 };
 channel.on('presence',{event:'sync'},update);
 channel.subscribe(async status=>{
  if(status==='SUBSCRIBED'&&user?.id===sessionUser){
   if(my?.presence_mode!=='invisible')await channel.track({user_id:sessionUser,status:my?.presence_mode||'online'});
  }
 });
}
async function publishPresence(){
 if(!presenceChannel||!user)return;
 if(my?.presence_mode==='invisible')await presenceChannel.untrack();
 else await presenceChannel.track({user_id:user.id,status:my?.presence_mode||'online'});
 updatePresenceMarkers();
}
function updatePresenceMarkers(){
 document.querySelectorAll('[data-presence-id]').forEach(el=>{
  const id=el.dataset.presenceId,status=activePresence(id);
  el.className='tender-presence-dot '+(['online','idle','dnd'].includes(status)?status:'offline');
  el.title=status;
 });
 document.querySelectorAll('[data-group-presence]').forEach(el=>{
  const c=getConversation(el.dataset.groupPresence);if(!c)return;
  const summary=onlineForGroup(c);
  el.className='tender-presence-dot '+summary.status;
  el.title=summary.online+' online · '+summary.offline+' offline';
 });
}

function empty(title,description,action='',label=''){return `<div class="empty-content"><img src="buffalo.webp" alt="Buffalo"><h2>${esc(title)}</h2><p>${esc(description)}</p>${action?`<button class="btn" data-action="${esc(action)}">${esc(label)}</button>`:''}</div>`}
// Tender 0.2 helpers. Shared DB features are gated behind migration_0_2.sql.
let extendedReady=false, pronounsReady=false, pieceRepliesReady=false, channelReady=false, visualReady=false, pieceChannels=[],channelUnread=[], notifications=[], customEmojis=[], reads=[], bookmarks=[], blockedUsers=[], pieceEvents=[], pieceRoles=[], roleAssignments=[], activePolls=[], activePollVotes=[];
let attachmentUrls=new Map(), replyTo=null, recordedVoice=null, voiceRecorder=null, voiceChunks=[], typingChannel=null, typingTimeout=null, typingLast=0, reconcileTimer=null, notificationReady=false;
const chosenTheme=()=>my?.chat_theme||localStorage.getItem('tender-theme')||'dark';
function applyTheme(){const theme=chosenTheme();document.documentElement.dataset.tenderTheme=theme;document.documentElement.style.setProperty('--personal-accent',my?.accent_color||'#f47735');applyLocalAppearance()}
function localPrefs(){try{return JSON.parse(localStorage.getItem('tender-0.3-appearance')||'{}')}catch{return {}}}
function roomKey(){return user&&state.selected?'tender-room-'+user.id+'-'+state.area+'-'+state.selected:null}
function roomPref(){try{return JSON.parse(localStorage.getItem(roomKey())||'{}')}catch{return {}}}
function applyLocalAppearance(){
 const p=localPrefs(),r=document.documentElement;
 const size=Math.min(118,Math.max(86,Number(p.fontSize)||100));
 r.style.setProperty('--tender-font-scale',String(size/100));
 r.style.setProperty('--tender-row-pad',p.density==='cozy'?'14px':p.density==='minimal'?'5px':'8px');
 r.style.setProperty('--tender-accent-2',/^#[0-9a-f]{6}$/i.test(p.accent2||'')?p.accent2:'#aa68ff');
 r.dataset.tenderFx=p.reduceMotion?'off':'on';
 r.dataset.tenderDensity=p.density||'compact';
 r.dataset.tenderGradient=p.gradient||'sunset';
 const room=roomPref();
 r.dataset.tenderWallpaper=room.wallpaper||'none';
 if(room.wallpaper==='image'&&room.image&&validUrl(room.image)!=='#')r.style.setProperty('--tender-chat-image','url("'+String(room.image).replace(/["\\]/g,'')+'")');
 else r.style.removeProperty('--tender-chat-image');
}
function appearanceStudio(){
 const p=localPrefs();
 return `<section class="card top-spacer appearance-studio"><div class="section-row"><div><h2 class="section-heading">🎨 Appearance Studio</h2><p class="hint">Personal settings stay on this device. Export a theme to save it.</p></div><button class="btn sm secondary" type="button" data-action="export-theme">Export theme</button></div><label class="theme-import-label">Import a theme <input id="tender-theme-import" type="file" accept="application/json,.json"></label><div class="settings-grid">
 <div class="field"><label>UI density</label><select class="input tender-local-pref" name="density">${[['minimal','Ultra compact'],['compact','Compact'],['cozy','Comfortable']].map(([v,l])=>`<option value="${v}" ${(p.density||'compact')===v?'selected':''}>${l}</option>`).join('')}</select></div>
 <div class="field"><label>Accent gradient</label><select class="input tender-local-pref" name="gradient">${[['sunset','Buffalo sunset'],['violet','Violet neon'],['ocean','Blue shift'],['forest','Emerald'],['rose','Rose dusk']].map(([v,l])=>`<option value="${v}" ${(p.gradient||'sunset')===v?'selected':''}>${l}</option>`).join('')}</select></div>
 <div class="field"><label>Secondary accent color</label><input class="input tender-local-pref" type="color" name="accent2" value="${esc(p.accent2||'#aa68ff')}"></div>
 <div class="field"><label>Text size</label><input class="input tender-local-pref" type="range" name="fontSize" min="86" max="118" value="${Number(p.fontSize)||100}"></div>
 <div class="field"><label>Reduce animations</label><select class="input tender-local-pref" name="reduceMotion"><option value="no" ${!p.reduceMotion?'selected':''}>Smooth animations</option><option value="yes" ${p.reduceMotion?'selected':''}>Minimal effects</option></select></div>
 <div class="field"><label>Member panel</label><button type="button" class="btn sm secondary" data-action="toggle-info">Show / hide member panel</button></div>
 </div><p class="hint">Open any DM or Piece and use the palette icon to change its wallpaper.</p></section>`;
}
function roomAppearanceModal(){
 if(!state.selected)return;
 const p=roomPref();
 modal('Chat appearance','This only changes the wallpaper on your own device.',`<form id="room-appearance-form"><div class="field"><label>Wallpaper style</label><select name="wallpaper" class="input">${[['none','Clean dark'],['dots','Subtle dots'],['grid','Fine grid'],['aurora','Soft aurora'],['image','Custom image URL']].map(([v,l])=>`<option value="${v}" ${(p.wallpaper||'none')===v?'selected':''}>${l}</option>`).join('')}</select></div><div class="field"><label>Image URL (HTTPS, optional)</label><input class="input" name="image" type="url" placeholder="https://..." value="${esc(p.image||'')}"></div><p class="hint">Remote images load from their original host. Don't use private image URLs.</p><button class="btn full" type="submit">Save wallpaper</button></form>`);
}
function badgeText(n){return n>99?'99+':String(n)}
function unreadCount(id){return notifications.filter(n=>!n.is_read&&n.kind==='message'&&n.conversation_id===id).length}
function unreadFriends(){return notifications.filter(n=>!n.is_read&&n.kind==='friend').length}
function unreadAll(){return notifications.filter(n=>!n.is_read).length}
// Piece invitations are verified against an actual public Piece in Tender's data.
// A typed URL alone is NOT sufficient to create a trusted-looking invite card.
function pieceInviteURL(piece){
 if(!piece?.is_public)return null;
 const secure=location.protocol==='https:'?new URL(location.href):new URL('https://fyrix341.github.io/Tender/');
 secure.search='';secure.hash='';secure.searchParams.set('piece',piece.id);
 return secure.href;
}
function extractPublicPieceInvite(text){
 const urls=String(text||'').match(/https?:\/\/[^\s<>"']+/gi)||[];
 for(const raw of urls){
  let link;try{link=new URL(raw.replace(/[.,!?;:)\]]+$/,''))}catch{continue}
  if(!['https:','http:'].includes(link.protocol))continue;
  const hostname=link.hostname.toLowerCase();
  const trusted=hostname==='fyrix341.github.io'||hostname==='tender.oops.wtf'||hostname===location.hostname.toLowerCase();
  if(!trusted||link.username||link.password||link.port&&!['80','443'].includes(link.port))continue;
  const path=link.pathname.replace(/\/+$/,'');
  if(hostname==='fyrix341.github.io'&&path.toLowerCase()!=='/tender')continue;
  if(hostname!=='fyrix341.github.io'&&path!==''&&path.toLowerCase()!=='/tender')continue;
  const id=link.searchParams.get('piece');
  if(!id||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))continue;
  const piece=pieces.find(p=>p.id.toLowerCase()===id.toLowerCase()&&p.is_public);
  if(piece)return piece;
 }
 return null;
}
function pieceInviteCardHTML(piece,preview=false){
 if(!piece?.is_public)return '';
 const count=memberships.filter(m=>m.piece_id===piece.id).length;
 const color=/^#[0-9a-f]{6}$/i.test(piece.color||'')?piece.color:'#f47735';
 const banner=piece.banner_url&&/^https:\/\//i.test(piece.banner_url)&&validUrl(piece.banner_url)!=='#'
    ?`<img class="invite-card-banner" src="${esc(validUrl(piece.banner_url))}" alt="" loading="lazy">`
    :`<div class="invite-card-gradient" style="--invite-color:${esc(color)}"></div>`;
 const joined=inPiece(piece.id);
 return `<article class="tender-piece-invite ${preview?'invite-preview':''}">
  ${banner}
  <div class="invite-card-body"><div class="invite-card-heading">🍗 TENDER PIECE INVITE <span class="invite-card-tag">PUBLIC</span></div>
   <div class="invite-card-community">${pieceAvatar(piece,'invite-card-icon')}
   <div class="invite-card-details"><strong>${esc(piece.name)}</strong><span>${esc((piece.description||'Find your people and stay crispy.').slice(0,145))}</span></div></div>
   <div class="invite-card-bottom"><span class="invite-member-count">${ico('users','icon-sm')} ${count} ${count===1?'member':'members'}</span>
    <button type="button" class="btn sm invite-join" data-action="open-piece-invite" data-id="${esc(piece.id)}">${joined?'Open Piece':'View & Join'} ${ico('external','icon-sm')}</button></div>
  </div>
 </article>`;
}
function invitePieceModal(piece){
 if(!piece?.is_public){toast('Only public Pieces have shareable invitation cards.',true);return}
 const link=pieceInviteURL(piece);
 modal('Invite to '+piece.name,'Send this link in a DM to display a preview card.',`
  <div class="invite-share-modal">${pieceInviteCardHTML(piece,true)}
   <label class="field"><span class="invite-field-label">Invitation link</span>
   <input class="input" id="invite-link" value="${esc(link)}" readonly aria-label="Piece invitation link"></label>
   <div class="button-group"><button type="button" class="btn" data-action="copy-piece-invite" data-url="${esc(link)}">${ico('clip','icon-sm')} Copy invitation link</button></div>
   <p class="hint">Public Pieces only. The recipient must sign in and choose to join; the link doesn't bypass membership permissions.</p>
  </div>`);
}
function invitePickerModal(){
 const available=pieces.filter(p=>p.is_public&&inPiece(p.id));
 modal('Share a Piece invite','Pick a public Piece to include as a preview in this conversation.',`
   <div class="invite-picker-list">${available.map(piece=>`<button type="button" class="invite-picker-item" data-action="insert-piece-invite" data-id="${esc(piece.id)}">${pieceAvatar(piece)}<span><strong>${esc(piece.name)}</strong><small>Insert invitation link</small></span>${ico('plus','icon-sm')}</button>`).join('')||'<p class="hint">Join a public Piece first to share its invitation.</p>'}</div>`);
}
// Mention markup only touches ordinary escaped text, never URLs/attributes/other HTML.
function mentionedPlainText(raw){
 return esc(raw).replace(/(^|[^a-z0-9_@])@([a-z0-9_]{3,20})(?![a-z0-9_])/gi,(full,prefix,handle)=>{
  const member=profiles.find(p=>p.handle?.toLowerCase()===handle.toLowerCase());
  if(!member)return full;
  const self=member.id===user?.id;
  return prefix+`<button type="button" class="tender-mention ${self?'mention-self':''}" data-action="open-profile" data-id="${esc(member.id)}" title="View @${esc(member.handle)}'s profile">@${esc(handle)}</button>`;
 });
}
function messageText(text){
 if(String(text||'').startsWith('[TENDER_EMBED]'))return richEmbedHTML(text);
 const raw=String(text||'');
 let result=raw.split(/(https:\/\/[^\s<]+)/gi).map(part=>{
  if(!/^https:\/\//i.test(part))return mentionedPlainText(part);
  const url=validUrl(part);
  return url==='#'?esc(part):`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="message-link">${esc(part)}</a>`;
 }).join('');
 result=result.replace(/:([a-z0-9_]{2,24}):/g,(whole,code)=>{
  const e=customEmojis.find(x=>x.shortcode===code&&(x.piece_id===null||x.piece_id===state.selected));
  return e?`<img class="inline-custom-emoji" src="${esc(db.storage.from('tender-emoji').getPublicUrl(e.image_path).data.publicUrl)}" alt=":${esc(code)}:" title=":${esc(code)}:">`:whole;
 });
 if(/^:[a-z0-9_]{2,24}:$/.test(raw.trim()))result=result.replace('class="inline-custom-emoji"','class="inline-custom-emoji sticker-emoji"');
 const invite=extractPublicPieceInvite(text);
 return result.replace(/\n/g,'<br>')+(invite?pieceInviteCardHTML(invite):'');
}

// Rich announcement embeds are stored as ordinary message text (no new tables needed).
function richEmbedHTML(text){
 let p;try{p=JSON.parse(String(text).slice('[TENDER_EMBED]'.length))}catch{return esc(text)}
 if(!p||typeof p!=='object')return esc(text);
 const color=/^#[0-9a-f]{6}$/i.test(p.color||'')?p.color:'#f47735';
 const thumb=typeof p.thumbnail==='string'&&/^https:\/\//i.test(p.thumbnail)&&validUrl(p.thumbnail)!=='#'?validUrl(p.thumbnail):null;
 return `<article class="rich-embed" style="--embed-accent:${esc(color)}"><div class="rich-embed-main">${p.author?`<small class="rich-embed-author">${esc(String(p.author).slice(0,70))}</small>`:''}<strong class="rich-embed-title">${esc(String(p.title||'Announcement').slice(0,120))}</strong><p class="rich-embed-body">${esc(String(p.description||'').slice(0,1600)).replace(/\n/g,'<br>')}</p>${p.footer?`<small class="rich-embed-footer">${esc(String(p.footer).slice(0,110))}</small>`:''}</div>${thumb?`<img src="${esc(thumb)}" alt="" loading="lazy" class="rich-embed-thumb">`:''}</article>`;
}
function embedModal(){
 modal('✨ Build an announcement','Post a rich card into the current chat or Piece using safe text formatting.',`<form id="embed-form">
 <div class="field"><label>Title</label><input class="input" name="title" maxlength="120" required placeholder="Big Tender Announcement"></div>
 <div class="field"><label>Description</label><textarea class="input textarea" name="description" maxlength="1600" required placeholder="What should everyone know?"></textarea></div>
 <div class="settings-grid"><div class="field"><label>Author label</label><input class="input" name="author" maxlength="70" placeholder="Community team"></div><div class="field"><label>Accent</label><input class="input" name="color" type="color" value="#f47735"></div></div>
 <div class="field"><label>Thumbnail URL (HTTPS, optional)</label><input class="input" name="thumbnail" type="url" placeholder="https://..."></div>
 <div class="field"><label>Footer text</label><input class="input" name="footer" maxlength="110" placeholder="Stay crispy 🍗"></div>
 <button class="btn full" type="submit">Send announcement</button></form>`);
}
function giftGif(text){const s=String(text||'').trim();if(!/^https:\/\/(?:media\d?\.giphy\.com|media\.tenor\.com)\//i.test(s))return '';if(!/\.(gif|webp)(?:\?|$)/i.test(s))return '';return `<img class="gif-preview" src="${esc(validUrl(s))}" alt="Shared GIF" loading="lazy">`}
function attachmentHTML(row){if(!row.attachment_path&&!row.pendingFile)return '';
 const path=row.attachment_path||'', name=(path.split('/').pop()||'attachment').replace(/^[0-9a-f-]{36}-/i,'');
 const src=row.pendingFile || attachmentUrls.get(path);
 const isImage=/\.(png|jpe?g|webp|gif)(?:$|\?)/i.test(name);const isAudio=/\.(webm|ogg|m4a|mp3|mp4)(?:$|\?)/i.test(name);
 if(isImage&&src)return `<div class="inline-attachment"><img data-action="enlarge" data-src="${esc(src)}" src="${esc(src)}" loading="lazy" alt="${esc(name)}"><span>${esc(name)}</span></div>`;
 if(isAudio&&src)return `<div class="inline-attachment audio-attachment"><div>🎙️ ${esc(name)}</div><audio controls preload="none" src="${esc(src)}"></audio></div>`;
 return `<button class="attachment-card" data-action="open-attachment" data-path="${esc(path)}" ${row.pending?'disabled':''}>${ico('clip')} <span>${esc(name)}</span> ${ico('external','icon-sm')}</button>`}
async function prepareAttachmentUrls(){const paths=[...new Set(activeMessages.filter(m=>m.attachment_path&&!attachmentUrls.has(m.attachment_path)).map(m=>m.attachment_path))];if(!paths.length)return;const r=await db.storage.from('tender-chat').createSignedUrls(paths,3600);if(r.error){console.warn('Preview URLs:',r.error);return;}for(const a of r.data||[]){if(a.signedUrl&&a.path)attachmentUrls.set(a.path,validUrl(a.signedUrl));}}
async function refreshExtras(){
 try{const check=await q('notifications').select('id').limit(1);if(check.error){extendedReady=false;return}extendedReady=true;
 const reqs=[q('notifications').select('*').order('created_at',{ascending:false}).limit(250),q('custom_emojis').select('*').order('created_at',{ascending:false}).limit(200),q('conversation_reads').select('*').limit(300),q('bookmarks').select('*').limit(100),q('piece_events').select('*').order('starts_at').limit(70),q('piece_roles').select('*').limit(150),q('piece_role_assignments').select('*').limit(200),q('user_blocks').select('*').limit(200)];
 const [a,b,c,d,e,f,g,h]=await Promise.all(reqs);if(!a.error)notifications=a.data||[];if(!b.error)customEmojis=b.data||[];if(!c.error)reads=c.data||[];if(!d.error)bookmarks=d.data||[];if(!e.error)pieceEvents=e.data||[];if(!f.error)pieceRoles=f.data||[];if(!g.error)roleAssignments=g.data||[];if(h&&!h.error)blockedUsers=h.data||[];
 }catch(e){console.warn('0.2 optional features unavailable',e)}
 try{const probe=await q('profiles').select('pronouns').limit(1);pronounsReady=!probe.error}catch{pronounsReady=false}
 try{const probe=await q('piece_messages').select('reply_to').limit(1);pieceRepliesReady=!probe.error}catch{pieceRepliesReady=false}
 applyTheme();
}
async function loadPolls(){activePolls=[];activePollVotes=[];if(!extendedReady||state.area!=='chats'||!state.selected)return;const ids=activeMessages.map(m=>m.poll_id).filter(Boolean);if(!ids.length)return;const [p,v]=await Promise.all([q('polls').select('*').in('id',ids),q('poll_votes').select('*').in('poll_id',ids)]);if(!p.error)activePolls=p.data||[];if(!v.error)activePollVotes=v.data||[]}
function pollHTML(id){if(!id)return '';const poll=activePolls.find(p=>p.id===id);if(!poll)return `<span class="hint">Loading poll...</span>`;return `<div class="poll-card"><strong>📊 ${esc(poll.question)}</strong>${poll.options.map((o,i)=>{const votes=activePollVotes.filter(v=>v.poll_id===id&&v.option_index===i).length, total=activePollVotes.filter(v=>v.poll_id===id).length,mine=activePollVotes.some(v=>v.poll_id===id&&v.user_id===user.id&&v.option_index===i);return `<button class="poll-option ${mine?'poll-selected':''}" data-action="poll-vote" data-id="${id}" data-index="${i}"><span>${esc(o)}</span><small>${votes} · ${total?Math.round(votes/total*100):0}%</small><span class="poll-progress" style="width:${total?votes/total*100:0}%"></span></button>`}).join('')}</div>`}
function renderBadge(n){return n?`<span class="unread-badge">${badgeText(n)}</span>`:''}
async function markRead(cid=null,friend=false){if(!extendedReady||!user)return;try{
 if(cid){await db.from('conversation_reads').upsert({conversation_id:cid,user_id:user.id,last_read_at:new Date().toISOString()},{onConflict:'conversation_id,user_id'});}
 if(cid||friend){await db.rpc('mark_tender_notifications_read',{cid:cid||null,pid:null,include_friends:friend});notifications.forEach(n=>{if(cid&&n.conversation_id===cid||friend&&n.kind==='friend')n.is_read=true});renderSidebar();renderNavBadges();}
 }catch(e){console.warn('Read receipts:',e)}}
function renderNavBadges(){renderPieceRail();const chatButton=document.querySelector('.rail-btn[data-area="chats"]'),friendButton=document.querySelector('.rail-btn[data-area="friends"]');for(const [el,n] of [[chatButton,notifications.filter(x=>x.kind==='message'&&!x.is_read).length],[friendButton,unreadFriends()]]){if(!el)continue;el.querySelector('.unread-badge')?.remove();if(n)el.insertAdjacentHTML('beforeend',renderBadge(n))}document.title=unreadAll()?`(${unreadAll()}) Tender 🍗`:'Tender 🍗'}
function soundPing(){if(audioPrefs().deafened||!my?.notification_sound||my?.presence_mode==='dnd')return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(my.notification_tone==='soft'?480:my.notification_tone==='chime'?900:680,c.currentTime);o.frequency.exponentialRampToValueAtTime(my.notification_tone==='soft'?550:my.notification_tone==='chime'?1150:920,c.currentTime+.08);g.gain.setValueAtTime(.001,c.currentTime);g.gain.exponentialRampToValueAtTime(.04,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.17);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.2);o.onended=()=>c.close();}catch{}}
// Notifications require HTTPS and an explicit permission grant. The service worker
// enables notifications on mobile while the Tender page is open; it is NOT a push server.
let notificationWorkerPromise=null;
const notifiedEventIds=new Set();
function ensureNotificationWorker(){
 if(notificationWorkerPromise)return notificationWorkerPromise;
 if(!window.isSecureContext||!('serviceWorker' in navigator))return Promise.resolve(null);
 notificationWorkerPromise=navigator.serviceWorker.register('./tender-sw.js',{scope:'./'})
   .then(reg=>reg).catch(error=>{console.warn('Tender notification worker unavailable',error);return null});
 return notificationWorkerPromise;
}
async function emitSystemNotification(title,body,tag='tender-test',conversationId=null){
 if(!window.isSecureContext||typeof Notification==='undefined'||Notification.permission!=='granted')return false;
 const opts={body,icon:new URL('buffalo.webp',location.href).href,badge:new URL('buffalo.webp',location.href).href,tag,renotify:false,data:{conversationId}};
 // A page-owned service-worker registration can show notifications in mobile browsers.
 let worker=null;try{worker=await ensureNotificationWorker()}catch{}
 if(worker?.showNotification){
   await worker.showNotification(title,opts);return true;
 }
 // Desktop-only fallback: the constructor isn't supported in most mobile browsers.
 try{
  const toastNotification=new Notification(title,opts);
  toastNotification.onclick=()=>{window.focus();if(conversationId)goTo('chats',conversationId).catch(console.warn);toastNotification.close()};
  return true;
 }catch(error){console.warn('Browser notification not shown',error);return false}
}
async function showBrowserNotification(n){
 if(!n||!user||n.user_id!==user.id||n.actor_id===user.id)return;
 if(my?.notification_mode==='none'||['dnd','invisible'].includes(my?.presence_mode))return;
 const text=String(n.body||'').toLowerCase(),handle=String(my?.handle||'').toLowerCase();
 if(my?.notification_mode==='mentions'&&n.kind!=='friend'&&!text.includes('@'+handle))return;
 if(notifiedEventIds.has(n.id))return;
 notifiedEventIds.add(n.id);
 if(notifiedEventIds.size>250)notifiedEventIds.delete(notifiedEventIds.values().next().value);
 soundPing();
 const actor=pby(n.actor_id);
 const title=n.kind==='friend'?'👋 New friend request':'💬 '+(actor.display_name||'New Tender message');
 const body=String(n.body||'Open Tender to see the activity.').slice(0,130);
 try{await emitSystemNotification(title,body,'tender-'+n.id,n.conversation_id||null)}
 catch(error){console.warn('Tender notification error',error)}
}
// 0.3: reconcile only the visible stream on realtime message events.
let reconciling=false, reconcileAgain=false;
function scheduleReconcile(active=true,kind='',event=null){
 if(kind==='messages'||kind==='piece_messages'){
   const id=kind==='messages'?(event?.new?.conversation_id||event?.old?.conversation_id):(event?.new?.piece_id||event?.old?.piece_id);
   if(!id||id!==state.selected||(kind==='messages'?state.area!=='chats':!['pieces','discover'].includes(state.area)||state.pieceTab!=='chat'))return;
 }
 clearTimeout(reconcileTimer);
 reconcileTimer=setTimeout(async()=>{
  if(reconciling){reconcileAgain=true;return}
  reconciling=true;const selected=state.selected,area=state.area,tab=state.pieceTab;
  try{
   if(['messages','piece_messages','reactions','poll_votes','conversation_reads'].includes(kind)){
     if(selected&&((area==='chats')||(['pieces','discover'].includes(area)&&tab==='chat'))){
       await loadActive();
       if(selected===state.selected&&area===state.area&&tab===state.pieceTab)syncActiveStream();
     }
   }else{
     await refreshData();if(active&&selected)await loadActive();
     if(selected===state.selected&&area===state.area&&tab===state.pieceTab){renderSidebar();renderMain()}
   }
  }catch(e){console.warn('Live update:',e)}
  finally{reconciling=false;if(reconcileAgain){reconcileAgain=false;scheduleReconcile(true,kind)}}
 },kind==='messages'||kind==='piece_messages'?120:230);
}
function syncActiveStream(scrollOnce=false){
 const list=document.querySelector('#main .chat-scroll');if(!list)return;
 if(!(state.area==='chats'||(['pieces','discover'].includes(state.area)&&state.pieceTab==='chat')))return;
 const near=list.scrollHeight-list.scrollTop-list.clientHeight<96,top=list.scrollTop;
 const kind=state.area==='chats'?'message':'piece_message';
 const old=new Map([...list.querySelectorAll(':scope > [data-message-id]')].map(el=>[el.dataset.messageId,el]));
 const rows=[...new Map(activeMessages.map(r=>[String(r.id),r])).values()].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
 const hasNewMessage=rows.some(r=>!old.has(String(r.id)));
 const ids=new Set(rows.map(r=>String(r.id)));
 for(const [id,el] of old)if(!ids.has(id))el.remove();
 list.querySelector('.chat-empty,.notice-inline')?.remove();
 const t=document.createElement('template');
 if(!rows.length&&list.children.length===0)list.innerHTML='<div class="chat-empty"><img src="buffalo.webp" alt="Buffalo"><h3>No messages yet</h3><p class="hint">Say hello! 🍗</p></div>';
 for(const [i,row] of rows.entries()){
  const html=messageHTML(row,kind);let node=old.get(String(row.id));
  if(!node){t.innerHTML=html;node=t.content.firstElementChild}
  else if(node.__tenderRender!==html){t.innerHTML=html;const fresh=t.content.firstElementChild;node.replaceWith(fresh);node=fresh}
  if(node)node.__tenderRender=html
  if(node&&list.children[i]!==node)list.insertBefore(node,list.children[i]||null);
 }
 const pill=document.getElementById('chat-jump-new');
 if(scrollOnce||near){list.scrollTo({top:list.scrollHeight,behavior:scrollOnce?'smooth':'auto'});if(pill)pill.hidden=true}
 else{list.scrollTop=top;if(pill&&hasNewMessage){pill.hidden=false;pill.textContent='↓ New messages · Jump to latest'}}
}

function unsubTyping(){if(typingChannel&&db)db.removeChannel(typingChannel);typingChannel=null;}
async function subscribeTyping(){if(typingChannel){db.removeChannel(typingChannel);typingChannel=null;}
 if(!state.selected||!(state.area==='chats'||(['pieces','discover'].includes(state.area)&&state.pieceTab==='chat'&&inPiece(state.selected))))return;
 const prefix=state.area==='chats'?'dm':'piece';
 typingChannel=db.channel('typing-'+prefix+'-'+state.selected,{config:{broadcast:{self:false}}}).on('broadcast',{event:'typing'},payload=>{const e=payload.payload;if(e?.user_id===user.id)return;const el=document.getElementById('typing-line');if(!el)return;el.textContent=`${pby(e.user_id).display_name} is typing…`;clearTimeout(typingTimeout);typingTimeout=setTimeout(()=>{if(el)el.textContent=''},2800)}).subscribe();}
function broadcastTyping(){if(!typingChannel||Date.now()-typingLast<1100)return;typingLast=Date.now();typingChannel.send({type:'broadcast',event:'typing',payload:{user_id:user.id}}).catch(()=>{})}
function emojiPicker(mode='insert'){const defaults=['😀','😂','😭','❤️','🔥','👍','🥹','😎','😍','🤯','💀','🥳','🤝','😡','😴','✨','🍗','⭐','💜','🎉','👀','🙌','💯','💀','🤍','🤔','👏','💬','🙏','🥰'];modal('Emoji & stickers','Send something crispy!',`<div class="emoji-grid">${defaults.map(e=>`<button data-action="emoji-insert" data-emoji="${e}" class="emoji-option">${e}</button>`).join('')}${customEmojis.filter(x=>!x.piece_id||x.piece_id===state.selected).map(e=>`<button data-action="emoji-insert" data-emoji=":${esc(e.shortcode)}:" class="emoji-option"><img src="${esc(db.storage.from('tender-emoji').getPublicUrl(e.image_path).data.publicUrl)}" alt=":${esc(e.shortcode)}:"></button>`).join('')}</div><button class="btn secondary top-spacer" data-action="custom-emoji">${ico('plus')} Upload custom emoji</button>`) }
function customEmojiModal(){modal('Upload an emoji','Personal emojis work in DMs; Piece emojis can be shared with their community.',`<form id="custom-emoji-form"><div class="field"><label>Shortcode (2–24 letters/numbers)</label><input class="input" name="shortcode" pattern="[a-z0-9_]{2,24}" placeholder="buffalodance" required></div><div class="field"><label>PNG/WEBP/GIF under 256 KB</label><input class="input" type="file" name="file" accept="image/png,image/webp,image/gif" required></div>${state.area==='pieces'&&ownPiece(state.selected)?'<label class="checkbox-line"><input type="checkbox" name="piece"> Share with this Piece</label>':''}<button class="btn full" type="submit">Upload emoji</button></form>`)}
function gifModal(){modal('Share a GIF','Paste a GIPHY or Tenor media GIF link. No paid GIF API needed.',`<form id="gif-form"><div class="field"><label>Direct GIF URL</label><input class="input" name="url" type="url" required placeholder="https://media.tenor.com/.../gif.gif"></div><button type="submit" class="btn full">Insert GIF</button></form><p class="hint">Find a GIF on a provider's website and copy its media address. GIF links are hosted by their providers.</p>`)}
function pollModal(){if(state.area!=='chats'||!state.selected)return;modal('Create a poll','Ask your chat to vote.',`<form id="poll-form"><div class="field"><label>Question</label><input class="input" name="question" minlength="3" maxlength="200" required></div>${[1,2,3,4].map((i)=>`<div class="field"><label>Option ${i}</label><input class="input" name="option${i}" maxlength="100" ${i<3?'required':''} placeholder="Answer ${i}"></div>`).join('')}<button class="btn full" type="submit">Post poll</button></form>`)}
function searchModal(){modal('Advanced message search','Only searches conversations and Pieces your account may read.',`<form id="global-search-form"><div class="field"><label>Find messages</label><input class="input" name="text" minlength="2" maxlength="80" required placeholder="Search words..."></div><div class="settings-grid"><div class="field"><label>Where to search</label><select name="scope" class="input"><option value="all">All DMs and groups</option><option value="current" ${state.area==='chats'?'selected':''}>Current DM/group</option><option value="pieces" ${['pieces','discover'].includes(state.area)?'selected':''}>Accessible Piece chats</option></select></div><div class="field"><label>Sent by username (optional)</label><input class="input" name="author" placeholder="username without @"></div><div class="field"><label>Since</label><input class="input" name="after" type="date"></div><div class="field"><label>Until</label><input class="input" name="before" type="date"></div><div class="field"><label><input type="checkbox" name="attachments" value="yes"> Attachments only (DM/group)</label></div></div><button class="btn full" type="submit">${ico('search')} Search</button></form><div id="search-results" class="search-results" role="status" aria-live="polite"></div>`)}
function bookmarksModal(){let allowed=new Set(conversations.map(c=>c.id));modal('Bookmarks','Messages saved for later.',`<div class="search-results">${bookmarks.map(b=>{const m=recentBookmarkMessages.find(x=>x.id===b.message_id);return m&&allowed.has(m.conversation_id)?`<button class="saved-row" data-action="goto-message" data-id="${m.id}" data-cid="${m.conversation_id}">${esc(m.body.slice(0,120))||'Attachment'} ${ico('external','icon-sm')}</button>`:''}).join('')||'<p class="hint">No saved messages yet. Bookmark one using the icon below it.</p>'}</div>`)}
let recentBookmarkMessages=[];
async function openBookmarks(){if(bookmarks.length){const r=await q('messages').select('*').in('id',bookmarks.map(x=>x.message_id));if(!r.error)recentBookmarkMessages=r.data||[]}bookmarksModal()}
function eventModal(){modal('Create Piece event','Events belong to this Piece.',`<form id="event-form"><div class="field"><label>Event title</label><input class="input" name="title" maxlength="100" minlength="3" required></div><div class="field"><label>When</label><input class="input" type="datetime-local" name="starts_at" required></div><div class="field"><label>Description</label><textarea class="input textarea" name="description" maxlength="500"></textarea></div><button type="submit" class="btn full">Create event</button></form>`)}
function roleModal(){const members=memberships.filter(m=>m.piece_id===state.selected);const roles=pieceRoles.filter(r=>r.piece_id===state.selected);modal('Piece roles','Custom labels are decorative. Moderator permissions remain separate for safety.',`<form id="role-form"><div class="field"><label>New role name</label><input class="input" name="name" maxlength="32" required placeholder="Contributor"></div><div class="field"><label>Color</label><input class="input" name="color" type="color" value="#f47735"></div><button class="btn full" type="submit">Create role</button></form><h3 class="section-heading top-spacer">Moderator permissions</h3>${members.filter(m=>m.role!=='owner').map(m=>`<div class="role-entry">${esc(pby(m.user_id).display_name)} <select class="input core-role-change" data-person="${m.user_id}"><option value="member" ${m.role==='member'?'selected':''}>Member</option><option value="moderator" ${m.role==='moderator'?'selected':''}>Moderator</option></select></div>`).join('')}<h3 class="section-heading top-spacer">Custom role labels</h3>${roles.map(r=>`<div class="role-entry"><span style="color:${esc(r.color)}">●</span> ${esc(r.name)} <select class="input role-assign" data-role="${r.id}"><option value="">Assign to member...</option>${members.map(m=>`<option value="${m.user_id}">${esc(pby(m.user_id).display_name)}</option>`).join('')}</select></div>`).join('')}`)}
function pinnedHTML(){const list=activeMessages.filter(x=>x.is_pinned);return list.length?`<div class="pinned-strip">📌 ${list.length} pinned · ${esc(list[list.length-1].body.slice(0,85)||'Attachment')}</div>`:''}
function readReceiptHTML(row){if(!extendedReady||row.author_id!==user?.id||!row.id||row.pending)return '';const c=getConversation(state.selected);const ids=(c?.conversation_members||[]).map(m=>m.user_id).filter(id=>id!==user.id);if(!ids.length)return '';const seen=ids.filter(id=>reads.some(r=>r.conversation_id===state.selected&&r.user_id===id&&new Date(r.last_read_at)>=new Date(row.created_at))).length;return `<span class="receipt">${seen===ids.length?'✓✓ Seen':seen?'✓✓ '+seen+' seen':'✓ Sent'}</span>`}
// Only show community overlap supported by the current membership data.
function sharedPublicPieces(otherId){
 if(!user||!otherId)return [];
 const mine=new Set(memberships.filter(m=>m.user_id===user.id).map(m=>m.piece_id));
 const theirs=new Set(memberships.filter(m=>m.user_id===otherId).map(m=>m.piece_id));
 return pieces.filter(p=>p.is_public&&mine.has(p.id)&&theirs.has(p.id));
}
function profileStatus(p){
 if(!p)return '';
 const presence=String(p.presence_mode||'online');
 if(presence==='invisible')return '';
 return `<span class="profile-presence ${['online','idle','dnd'].includes(presence)?presence:'online'}">${presence==='dnd'?'Do not disturb':presence==='idle'?'Idle':'Online'}</span>`;
}
function profileActions(person,compact=false){
 const isSelf=person.id===user?.id;
 if(isSelf)return `<button type="button" class="btn ${compact?'sm':''}" data-action="settings-profile">${ico('edit','icon-sm')} Edit profile</button>`;
 const relationship=friendships.find(f=>(f.requester===user.id&&f.recipient===person.id)||(f.recipient===user.id&&f.requester===person.id));
 const dm=`<button type="button" class="btn ${compact?'sm':''}" data-action="start-dm" data-id="${esc(person.id)}">${ico('chat','icon-sm')} Message</button>`;
 const secondary=relationship?.status==='accepted'
   ? `<span class="tag neutral">✓ Friends</span>`
   :relationship?.status==='pending'
     ? `<span class="tag neutral">${relationship.recipient===user.id?'Friend request received':'Request pending'}</span>`
     :`<button type="button" class="btn secondary ${compact?'sm':''}" data-action="request-friend" data-id="${esc(person.id)}">${ico('plus','icon-sm')} Add friend</button>`;
 return dm+secondary;
}
function publicProfileDetails(person){
 const joined=person.created_at?new Date(person.created_at):null;
 return `<div class="profile-detail-section"><h3>ABOUT ME</h3><div class="profile-detail-about">${esc(person.bio||'No bio yet. Stay crispy! 🍗').replace(/\n/g,'<br>')}</div></div>
  ${person.game_status?`<div class="profile-detail-section"><h3>STATUS</h3><p>${esc(person.status_emoji||'🍗')} ${esc(person.game_status)}</p></div>`:''}
  ${joined&&!Number.isNaN(joined.getTime())?`<div class="profile-detail-section"><h3>MEMBER SINCE</h3><p>${esc(joined.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}))}</p></div>`:''}`;
}
function sharedPiecesHTML(otherId,mini=false){
 const shared=sharedPublicPieces(otherId);
 return `<div class="profile-detail-section"><h3>SHARED PIECES <span class="profile-detail-count">${shared.length}</span></h3>
  ${shared.length?`<div class="profile-shared-pieces">${shared.slice(0,mini?3:8).map(piece=>`<button type="button" class="profile-piece-row" data-action="open-profile-piece" data-id="${esc(piece.id)}">${pieceAvatar(piece)}<span><strong>${esc(piece.name)}</strong><small>Public community</small></span>${ico('external','icon-sm')}</button>`).join('')}</div>`:'<p class="profile-detail-empty">No shared public Pieces yet.</p>'}</div>`;
}
function profileCardHTML(person){
 const isSelf=person.id===user?.id;
 return `<div class="tender-profile-dialog">
  <section class="profile-dialog-identity">
   <div class="profile-dialog-banner" ${person.banner_url?`style="background-image:linear-gradient(#07091440,#07091499),url(&quot;${esc(validUrl(person.banner_url))}&quot;)"`:''}></div>
   <div class="profile-dialog-id">
    <div class="profile-dialog-avatar effect-${esc(person.profile_effect||'none')}">${avatars(person)}</div>
    <div class="profile-dialog-name-row"><div><h2>${esc(person.display_name||'Tender member')}</h2><p>@${esc(person.handle||'member')}${person.pronouns?' · '+esc(person.pronouns):''}</p></div>${profileStatus(person)}</div>
    ${person.game_status?`<div class="profile-dialog-status">${esc(person.status_emoji||'🍗')} ${esc(person.game_status)}</div>`:''}
    <div class="profile-dialog-buttons">${profileActions(person)}</div>
    <div class="profile-dialog-meta"><span>🍗 Tender member</span><span>${isSelf?'Your profile':'Public profile'}</span></div>
   </div>
  </section>
  <section class="profile-dialog-content">
    <div class="profile-dialog-tabs"><span class="active">Overview</span><span>${sharedPublicPieces(person.id).length} shared Pieces</span></div>
    <div class="profile-dialog-scroll">${publicProfileDetails(person)}${sharedPiecesHTML(person.id)}
    <div class="profile-detail-section"><h3>ABOUT TENDER PROFILES</h3><p class="hint">Only information this person chose to share is shown here.</p></div></div>
  </section>
 </div>`;
}
async function showProfile(id){
 if(!id||!user)return;
 let person=profiles.find(p=>p.id===id);
 if(!person){
  const result=await q('profiles').select('*').eq('id',id).maybeSingle();
  if(result.error)throw result.error;person=result.data;
 }
 if(!person)return toast('Profile unavailable.',true);
 modal(person.display_name||'Member profile','Tender profile',profileCardHTML(person));
}
function profileBanner(p){const isSelf=p.id===user?.id;return `<div class="profile-banner crispy-profile effect-${esc(p.profile_effect||'none')}" ${p.banner_url?`style="background-image:linear-gradient(0deg,#17191d7a,transparent),url('${esc(validUrl(p.banner_url))}')"`:''}>${avatars(p)}${isSelf?'<span class="banner-hint">Your Tender profile</span>':''}</div>`}
async function uploadPublicAsset(file,bucket,limit,mimes,prefix){if(!file||file.size>limit||!mimes.includes(file.type))throw Error('This file type or size is not supported.');const extension=({"image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/gif":"gif"})[file.type];const path=`${user.id}/${prefix}-${crypto.randomUUID()}.${extension}`;assert(await db.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false}));return {url:db.storage.from(bucket).getPublicUrl(path).data.publicUrl,path}}
function deviceNotificationsPanel(){
 const secure=window.isSecureContext===true,enabled=secure&&typeof Notification!=='undefined';
 const status=!secure?'🔒 HTTPS is required for browser notifications. Open Tender on the secure GitHub Pages URL until your custom domain has HTTPS.':
 !enabled?'This browser does not support native notifications.':
 Notification.permission==='granted'?'✅ Browser notifications allowed. Tender can notify you while this tab is open, including when you are using another window.':
 Notification.permission==='denied'?'Notifications are blocked by your browser. Open your browser’s site permissions to allow Tender.':
 'Tap Enable notifications and allow Tender to show system alerts.';
 return `<div class="settings-card notification-settings"><div class="settings-card-title"><h3>Desktop & mobile alerts</h3><p>${esc(status)}</p></div>
 <div class="button-group"><button type="button" class="btn" data-action="notification-permission" ${!enabled||Notification.permission==='denied'?'disabled':''}>${ico('bell','icon-sm')} ${enabled&&Notification.permission==='granted'?'Notifications enabled':'Enable notifications'}</button>
 <button type="button" class="btn secondary" data-action="notification-test" ${!enabled||Notification.permission!=='granted'?'disabled':''}>🔔 Send test notification</button>
 <button type="button" class="btn secondary" data-action="open-alerts">Open inbox ${renderBadge(unreadAll())}</button></div>
 <p class="hint">Browser notifications require permission and HTTPS. Alerts work while Tender is open; closed-browser push requires a separate push backend. Each website domain needs its own permission.</p></div>`;
}
function alertsModal(){modal('Activity inbox','New messages and friend requests.',`<div class="notification-feed">${notifications.slice(0,70).map(n=>`<button class="activity-row ${n.is_read?'':'fresh'}" data-action="open-alert" data-id="${n.id}" data-cid="${esc(n.conversation_id||'')}"><span>${n.kind==='friend'?'👋':'💬'}</span><span><strong>${esc(pby(n.actor_id).display_name)}</strong><small>${esc(n.body?.slice(0,110)||'New activity')} · ${relative(n.created_at)}</small></span>${!n.is_read?renderBadge(1):''}</button>`).join('')||'<p class="hint">All caught up! Buffalo approves. 🍗</p>'}</div>`)}

async function boot(){
 if(!window.supabase){ROOT.innerHTML=empty('Connection library unavailable','Check your internet connection, then reload.');return}
 const url=(config.supabaseUrl||'').trim(), key=(config.supabaseAnonKey||'').trim();
 if(!url||!key){renderSetup();return}
 try{db=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const got=await db.auth.getSession();if(got.error)throw got.error;session=got.data.session;user=session?.user||null;
  db.auth.onAuthStateChange((ev,newSession)=>{session=newSession;let previous=user?.id;user=newSession?.user||null;if(previous!==user?.id){if(!user){unsub();reset();renderAuth()}else setTimeout(()=>initialize(),0)}});
  if(window.isSecureContext)ensureNotificationWorker().catch(console.warn);
   if(user)await initialize();else renderAuth();
 }catch(e){ROOT.innerHTML=empty('Could not reach Tender','Check the public Supabase URL and key in config.js.');toast(e.message||'Could not connect.',true)}
}
function reset(){notifications=[];customEmojis=[];reads=[];bookmarks=[];attachmentUrls.clear();replyTo=null;unsubTyping();my=null;blockedUsers=[];profiles=[];friendships=[];conversations=[];pieces=[];memberships=[];pieceChannels=[];channelUnread=[];channelReady=false;state.channelId=null;presenceRoster.clear();if(presenceChannel&&db){db.removeChannel(presenceChannel).catch(()=>{});presenceChannel=null}state.selected=null;state.area='chats';state.mobileDetail=false}
function renderSetup(){ROOT.innerHTML=`<div class="login-layout"><div class="login-art"><img src="buffalo.webp" alt="Buffalo mascot"><h1>tender<span>.</span></h1><p>Your friends. Your spaces. Your flavor.</p></div><div class="login-panel"><div class="eyebrow">Tender setup</div><h2>Almost ready to connect.</h2><p>This website needs a free online Supabase project for accounts, messages and Pieces. It's not a local chat simulator.</p><div class="setup-box"><h3>🍗 Connect the shared database</h3><p>1. Create a free project at <a href="https://supabase.com/dashboard/projects" target="_blank" rel="noopener">Supabase</a>.<br>2. Run <strong>schema.sql</strong> in the project's SQL editor.<br>3. Copy its Project URL and publishable (anon) key into <strong>config.js</strong> on GitHub.<br>4. Refresh this website. Everyone will connect to the same database.</p><details><summary>Important security information</summary>Only use the public publishable/anon key. Never put a service_role key or other secret in GitHub. Set URL configuration for email confirmation in Supabase Auth.</details></div><p class="hint">Your Tender HTML interface is deployed separately from the database. A GitHub Pages link alone cannot deliver live messaging.</p><a class="btn" href="https://supabase.com/dashboard/projects" target="_blank" rel="noopener">Connect Supabase ${ico('external')}</a></div></div>`}
function renderAuth(){state.mobileDetail=false;ROOT.innerHTML=`<div class="login-layout"><div class="login-art"><img src="buffalo.webp" alt="Buffalo mascot"><h1>tender<span>.</span></h1><p>Stay close. Stay crispy. 🍗</p></div><div class="login-panel"><div class="eyebrow">Welcome to Tender</div><h2>${state.loginMode==='login'?'Good to have you back.':'Your people are waiting.'}</h2><p>${state.loginMode==='login'?'Sign in to catch up with your people.':'Create your account to join the conversation.'}</p><div class="login-tabs"><button class="${state.loginMode==='login'?'selected':''}" data-action="auth-tab" data-tab="login">Log in</button><button class="${state.loginMode==='signup'?'selected':''}" data-action="auth-tab" data-tab="signup">Sign up</button></div><form id="auth-form">${state.loginMode==='signup'?`<div class="field"><label for="handle">Username (3–20 letters, numbers, underscores)</label><input class="input" id="handle" name="handle" minlength="3" maxlength="20" pattern="[a-zA-Z0-9_]{3,20}" required autocomplete="username" placeholder="buffalofan"></div><div class="field"><label for="display">Display name</label><input class="input" id="display" name="display_name" maxlength="40" required placeholder="Your name"></div>`:''}<div class="field"><label for="email">Email address</label><input class="input" id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div><div class="field"><label for="password">Password</label><input class="input" id="password" name="password" type="password" minlength="8" autocomplete="${state.loginMode==='login'?'current-password':'new-password'}" required placeholder="At least 8 characters"></div><button class="btn full top-spacer" type="submit">${state.loginMode==='login'?'Log in':'Create account'} ${ico('back')}</button></form><p class="hint top-spacer">Tender is an early beta. Please don't post private information in public Pieces.</p></div></div>`}
async function authSubmit(form){const data=new FormData(form), email=String(data.get('email')).trim(), password=String(data.get('password'));
 await safe(async()=>{if(state.loginMode==='signup'){const handle=String(data.get('handle')).trim().toLowerCase(),display_name=String(data.get('display_name')).trim();if(!/^[a-z0-9_]{3,20}$/.test(handle))throw Error('Username needs 3–20 letters, numbers or underscores.');const r=await db.auth.signUp({email,password,options:{data:{handle,display_name},emailRedirectTo:location.origin+location.pathname}});assert(r);toast(r.data.session?'Welcome to Tender!':'Check your inbox to confirm your email, then sign in.');if(!r.data.session){state.loginMode='login';renderAuth()}}
 else{assert(await db.auth.signInWithPassword({email,password}));toast('Welcome back! 🍗')}})}
async function initialize(){ROOT.innerHTML='<div class="loading-screen"><img src="buffalo.webp" alt="Buffalo"><h1>tender<span>.</span></h1><p>Loading your messages...</p></div>';try{await refreshData();applyTheme();render();subscribe();startPresence().catch(console.warn);if(extendedReady)renderNavBadges();
  const params=new URLSearchParams(window.location.search);
   const targetChat=params.get('chat');
   if(targetChat&&conversations.some(c=>c.id===targetChat))await goTo('chats',targetChat);
   const invitation=params.get('piece');
  if(invitation&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invitation)&&pieces.some(p=>p.id===invitation))await goTo('pieces',invitation);
 }catch(e){toast(e.message||'Unable to load the app',true);ROOT.innerHTML=empty('Something went wrong','Could not load Tender. Try refreshing.') }}
async function refreshData(){if(!user)return;const [a,b,c,d,e]=await Promise.all([q('profiles').select('*').order('created_at',{ascending:false}).limit(300),q('friendships').select('*'),q('conversations').select('*,conversation_members(user_id)').order('created_at',{ascending:false}),q('pieces').select('*').order('created_at',{ascending:false}).limit(100),q('piece_members').select('*')]);profiles=assert(a)||[];my=profiles.find(x=>x.id===user.id)||{id:user.id,handle:'member',display_name:user.email||'Account'};friendships=assert(b)||[];conversations=assert(c)||[];pieces=assert(d)||[];memberships=assert(e)||[];await refreshExtras();await loadChannelData();}
function unsub(){unsubTyping();if(reconcileTimer)clearTimeout(reconcileTimer);if(realtimeChannel&&db)db.removeChannel(realtimeChannel);realtimeChannel=null;if(realtimeRefreshTimer)clearTimeout(realtimeRefreshTimer)}
function subscribe(){
 unsub();if(!user)return;
 realtimeChannel=db.channel('tender-live-'+user.id)
 .on('postgres_changes',{event:'*',schema:'public',table:'messages'},e=>scheduleReconcile(true,'messages',e))
 .on('postgres_changes',{event:'*',schema:'public',table:'piece_messages'},e=>{scheduleReconcile(true,'piece_messages',e);scheduleChannelUnreadRefresh();})
 .on('postgres_changes',{event:'*',schema:'public',table:'piece_posts'},e=>scheduleReconcile(true))
 .on('postgres_changes',{event:'*',schema:'public',table:'piece_gallery'},e=>scheduleReconcile(true))
 .on('postgres_changes',{event:'*',schema:'public',table:'friendships'},e=>scheduleReconcile(true))
 .on('postgres_changes',{event:'*',schema:'public',table:'reactions'},e=>scheduleReconcile(true,'reactions',e))
 .on('postgres_changes',{event:'*',schema:'public',table:'poll_votes'},e=>scheduleReconcile(true,'poll_votes',e))
 .on('postgres_changes',{event:'*',schema:'public',table:'conversation_reads'},e=>scheduleReconcile(true,'conversation_reads',e))
 .on('postgres_changes',{event:'*',schema:'public',table:'piece_events'},e=>scheduleReconcile(true))
 .on('postgres_changes',{event:'*',schema:'public',table:'piece_channels'},e=>scheduleReconcile(false))
 .on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'user_id=eq.'+user.id},e=>{if(e.new){if(!notifications.some(n=>n.id===e.new.id))notifications.unshift(e.new);showBrowserNotification(e.new).catch(console.warn);if(e.new.conversation_id===state.selected&&state.area==='chats'&&document.visibilityState==='visible'){markRead(state.selected).catch(console.warn)}renderNavBadges();renderSidebar()}setTimeout(()=>scheduleReconcile(false),220)})
 .subscribe();
 subscribeTyping().catch(console.warn);
}
function navItem(area,name,label){return `<button data-action="area" data-area="${area}" class="rail-btn ${state.area===area?'active':''}" title="${label}" aria-label="${label}">${ico(name)}<span class="rail-label">${label}</span>${area==='chats'?renderBadge(notifications.filter(n=>!n.is_read&&n.kind==='message').length):area==='friends'?renderBadge(unreadFriends()):''}</button>`}
function render(){if(!user)return renderAuth();ROOT.innerHTML=`<div class="screen ${state.mobileDetail?'in-detail':''}" id="app-screen"><nav class="rail"><div class="rail-brand" title="Tender"><img src="buffalo.webp" alt="Buffalo"></div>${navItem('chats','chat','Chats')}${navItem('friends','users','Friends')}${navItem('pieces','pieces','Pieces')}${navItem('discover','compass','Discover')}<div class="rail-piece-zone">${railPieceHTML()}</div><div class="rail-bottom"><button class="rail-btn" data-action="open-alerts" title="Activity inbox">${ico('bell')}${renderBadge(unreadAll())}</button><button type="button" class="rail-btn rail-toggle" title="Expand or collapse sidebar" data-action="toggle-rail">${ico('pieces')}<span class="rail-label">Expand rail</span></button><button type="button" class="rail-btn" title="Show or hide member panel" data-action="toggle-info">${ico('users')}<span class="rail-label">Members</span></button></div><button class="rail-btn mobile-only ${state.area==='settings'?'active':''}" data-action="area" data-area="settings" aria-label="Settings">${ico('settings')}<span class="rail-label">Settings</span></button></nav><aside class="sidebar" id="sidebar"></aside><div class="splitter splitter-sidebar" data-split="sidebar" role="separator" aria-label="Resize conversation list" aria-orientation="vertical" aria-valuemin="210" aria-valuemax="420" tabindex="0"></div><main class="main" id="main"></main><div class="splitter splitter-info" data-split="info" role="separator" aria-label="Resize member list" aria-orientation="vertical" aria-valuemin="190" aria-valuemax="430" tabindex="0"></div><aside class="info-panel" id="info-panel" aria-label="Conversation details"></aside></div>`;
 const screen=document.getElementById('app-screen');
 screen.classList.toggle('rail-expanded',localStorage.getItem('tender-rail-expanded')==='1');
 screen.style.setProperty('--tender-sidebar-width',readSplitWidth('sidebar')+'px');
 screen.style.setProperty('--tender-info-width',readSplitWidth('info')+'px');
 applyLocalAppearance();renderSidebar();renderMain()}
function dmProfilePanelHTML(person){
 const shared=sharedPublicPieces(person.id);
 return `<div class="info-head"><span class="info-heading">USER PROFILE</span><button type="button" class="round-btn" data-action="toggle-info" aria-label="Hide profile panel" title="Hide profile panel">${ico('x','icon-sm')}</button></div>
 <div class="dm-profile-panel">
  <button type="button" class="dm-profile-cover" data-action="open-profile" data-id="${esc(person.id)}" aria-label="Open full profile of ${esc(person.display_name||'member')}">
    <div class="dm-profile-banner" ${person.banner_url?`style="background-image:linear-gradient(#0c0f2055,#0c0f206a),url(&quot;${esc(validUrl(person.banner_url))}&quot;)"`:''}></div>
    <span class="dm-profile-avatar">${avatars(person)}</span>
  </button>
  <div class="dm-profile-body">
   <button type="button" class="dm-profile-name" data-action="open-profile" data-id="${esc(person.id)}">${esc(person.display_name||'Tender member')} ${ico('external','icon-sm')}</button>
   <div class="dm-profile-handle">@${esc(person.handle||'member')}${person.pronouns?' · '+esc(person.pronouns):''}</div>
   ${profileStatus(person)}
   ${person.game_status?`<div class="dm-profile-status">${esc(person.status_emoji||'🍗')} ${esc(person.game_status)}</div>`:''}
   <div class="dm-profile-actions">${profileActions(person,true)}</div>
   <div class="dm-profile-about"><h3>ABOUT ME</h3><p>${esc(person.bio||'No bio yet. 🍗').replace(/\n/g,'<br>')}</p></div>
   <div class="dm-profile-about"><h3>SHARED PUBLIC PIECES <span class="profile-detail-count">${shared.length}</span></h3>
    ${shared.length?`<div class="profile-shared-pieces">${shared.slice(0,3).map(piece=>`<button type="button" class="profile-piece-row" data-action="open-profile-piece" data-id="${esc(piece.id)}">${pieceAvatar(piece)}<span><strong>${esc(piece.name)}</strong><small>Shared community</small></span>${ico('external','icon-sm')}</button>`).join('')}</div>`:'<p class="hint">No shared public Pieces yet.</p>'}</div>
   <button type="button" class="btn secondary dm-view-full" data-action="open-profile" data-id="${esc(person.id)}">View full profile ${ico('external','icon-sm')}</button>
  </div>
 </div>`;
}
function renderInfoPanel(){
 const box=document.getElementById('info-panel'),screen=document.getElementById('app-screen');
 if(!box||!screen)return;
 const visible=!!state.selected&&(state.area==='chats'||state.area==='pieces'||state.area==='discover');
 screen.classList.toggle('has-info',visible);
 screen.classList.toggle('info-hidden',localStorage.getItem('tender-info-hidden')==='1');
 screen.style.setProperty('--tender-info-width',readSplitWidth('info')+'px');
 if(!visible){box.replaceChildren();return}
 if(state.area==='chats'){
   const c=getConversation(state.selected);if(!c){box.replaceChildren();return}
   if(c.kind!=='group'){
     const other=(c.conversation_members||[]).find(m=>m.user_id!==user.id);
     if(other){box.innerHTML=dmProfilePanelHTML(pby(other.user_id));return}
   }
 }
 let members=[],name='',description='';
 if(state.area==='chats'){
   const c=getConversation(state.selected);if(!c)return;
   name=namesFor(c);description=c.kind==='group'?'Group conversation':'Private conversation';
   members=(c.conversation_members||[]).map(x=>pby(x.user_id));
 }else{
   const piece=selectedPiece();if(!piece)return;
   name=piece.name;description=piece.description||'A Tender Piece';
   members=memberships.filter(x=>x.piece_id===piece.id).map(x=>({...pby(x.user_id),_role:x.role}));
 }
 members=members.sort((a,b)=>(a.display_name||'').localeCompare(b.display_name||''));
 const rows=members.slice(0,65).map(p=>`<button type="button" class="info-member info-member-button" data-action="open-profile" data-id="${esc(p.id)}" title="View profile">${avatars(p)}<span class="info-person"><strong>${esc(p.display_name)}</strong><small>@${esc(p.handle||'member')}${p._role?' · '+esc(p._role):''}</small></span></button>`).join('');
 box.innerHTML=`<div class="info-head"><span class="info-heading">DETAILS</span><button type="button" class="round-btn" data-action="toggle-info" aria-label="Hide panel">${ico('x','icon-sm')}</button></div><div class="info-overview"><div class="info-emblem">🍗</div><h3>${esc(name)}</h3><p>${esc(description)}</p></div><div class="info-count">Members <strong>${members.length}</strong></div><div class="info-members">${rows||'<p class="hint">No members to display.</p>'}</div><div class="info-resize-hint">↔ Drag the divider to resize</div>`;
}
// The dock has real local audio controls and a synced Supabase availability.
const availability=[['online','Online','Ready to chat'],['idle','Idle','Away for a bit'],['dnd','Do Not Disturb','Quiet notifications'],['invisible','Invisible','Appear offline']];
function audioPrefs(){if(!user)return {micMuted:false,deafened:false};try{let x=JSON.parse(localStorage.getItem('tender-audio-'+user.id)||'{}');return {micMuted:x.micMuted===true,deafened:x.deafened===true}}catch{return {micMuted:false,deafened:false}}}
function saveAudioPrefs(p){if(user)localStorage.setItem('tender-audio-'+user.id,JSON.stringify({micMuted:!!p.micMuted,deafened:!!p.deafened}))}
const mediaMuteState=new WeakMap();
function syncDeafenedAudio(){
 const mute=audioPrefs().deafened;
 for(const media of document.querySelectorAll('audio,video')){
  if(mute){if(!mediaMuteState.has(media))mediaMuteState.set(media,media.muted);media.muted=true}
  else if(mediaMuteState.has(media)){media.muted=mediaMuteState.get(media);mediaMuteState.delete(media)}
 }
}
function accountDockHTML(open=false){
 if(!user||!my)return '';
 const audio=audioPrefs(),status=availability.some(x=>x[0]===my.presence_mode)?my.presence_mode:'online';
 return `<div class="tender-account-bar">
  <button type="button" class="account-identity-btn" data-action="account-menu-toggle" aria-controls="tender-account-menu" aria-expanded="${open}" aria-haspopup="menu" title="Your profile and account options">
   <span class="account-dock-avatar">${avatars(my)}<i class="account-presence-dot ${status}"></i></span>
   <span class="account-dock-label"><strong>${esc(my.display_name)}</strong><small>@${esc(my.handle||'member')} · ${availability.find(x=>x[0]===status)[1]}</small></span></button>
  <div class="account-audio-controls">
   <button type="button" class="account-tool-btn ${audio.micMuted?'is-off':''}" data-action="account-mic" aria-pressed="${audio.micMuted}" title="${audio.micMuted?'Unmute':'Mute'} voice-note microphone" aria-label="${audio.micMuted?'Unmute':'Mute'} microphone">${ico(audio.micMuted?'mic-off':'mic','icon-sm')}</button>
   <button type="button" class="account-tool-btn ${audio.deafened?'is-off':''}" data-action="account-deafen" aria-pressed="${audio.deafened}" title="${audio.deafened?'Undeafen':'Deafen'} Tender sounds" aria-label="${audio.deafened?'Undeafen':'Deafen'}">${ico(audio.deafened?'headphones-off':'headphones','icon-sm')}</button>
   <button type="button" class="account-tool-btn" data-action="account-settings" title="Settings" aria-label="Settings">${ico('settings','icon-sm')}</button>
  </div></div>
 <div class="tender-account-menu" role="menu" id="tender-account-menu" aria-label="Account options" ${open?'':'hidden'}>
   <div class="account-menu-banner"></div>
   <div class="account-menu-profile"><span class="account-menu-avatar">${avatars(my)}</span><strong>${esc(my.display_name)}</strong><small>@${esc(my.handle||'member')}</small>${my.game_status?`<p>${esc(my.status_emoji||'🍗')} ${esc(my.game_status)}</p>`:''}</div>
   <div class="account-menu-actions">
    <button type="button" class="account-menu-item" data-action="account-profile">${ico('user','icon-sm')} View Full Profile</button>
    <button type="button" class="account-menu-item" data-action="account-settings">${ico('edit','icon-sm')} Edit Profile</button>
    <span class="account-menu-section">SET YOUR STATUS</span>
    ${availability.map(([key,label,desc])=>`<button type="button" class="account-menu-presence ${status===key?'active':''}" data-action="account-presence" data-value="${key}" aria-pressed="${status===key}"><i class="account-presence-dot ${key}"></i><span><strong>${label}</strong><small>${desc}</small></span>${status===key?ico('check','icon-sm'):''}</button>`).join('')}
    <div class="account-menu-separator"></div>
    <button type="button" class="account-menu-item" data-action="account-copy-id">${ico('clip','icon-sm')} Copy User ID</button>
    <button type="button" class="account-menu-item" data-action="account-switch">${ico('logout','icon-sm')} Switch Accounts</button>
    <p class="account-menu-hint">Mute disables Tender voice-note recording. Deafen silences Tender sounds. Live calls aren't available yet.</p>
   </div>
 </div>`;
}
function renderAccountDock(open){
 const el=document.getElementById('sidebar-account-dock');if(!el)return;
 const wasOpen=!!el.querySelector('#tender-account-menu:not([hidden])');
 el.innerHTML=accountDockHTML(typeof open==='boolean'?open:wasOpen);
}
function closeAccountMenu(){
 const panel=document.getElementById('tender-account-menu');
 if(panel&&!panel.hidden){panel.hidden=true;document.querySelector('.account-identity-btn')?.setAttribute('aria-expanded','false')}
}
function renderSidebar(){
 const el=document.getElementById('sidebar');if(!el)return;
 const data={chats:['MESSAGES','Direct Messages','new-chat'],friends:['YOUR CIRCLE','Friends','find-friends'],pieces:['YOUR SPACES','Pieces','new-piece'],discover:['EXPLORE','Discover','new-piece'],settings:['TENDER','Settings','']};
 const [eyebrow,title,newAction]=data[state.area];let body='';
 if(state.area==='chats'){
  body=conversations.filter(c=>!state.search||namesFor(c).toLowerCase().includes(state.search.toLowerCase())).map(c=>{
   const otherId=c.kind!=='group'?(c.conversation_members||[]).find(m=>m.user_id!==user.id)?.user_id:null;
   const other=otherId?pby(otherId):null;
   return `<div class="side-row ${state.selected===c.id?'selected':''}" data-action="open-chat" data-id="${esc(c.id)}">${other?profileFace(other):avatarFor(c)}<div class="grow">${other?profileName(other):`<strong>${esc(namesFor(c))}</strong>`}<p>${c.kind==='group'?'Group conversation':'Direct message'}</p></div>${renderBadge(unreadCount(c.id))}</div>`;
  }).join('')||'<p class="hint" style="padding:18px">No conversations yet. Find a friend to start chatting.</p>';
 }else if(state.area==='friends'){
  const ids=myFriendIds();
  body=`<div class="side-section">Friends <span>${ids.length}</span></div>${ids.map(id=>`<div class="side-row ${state.selected===id?'selected':''}" data-action="open-friend" data-id="${esc(id)}">${profileFace(pby(id))}<div class="grow">${profileName(pby(id))}<p>@${esc(pby(id).handle)}</p></div></div>`).join('')||'<p class="hint" style="padding:18px">Friends will show up here.</p>'}`;
 }else if(state.area==='pieces'||state.area==='discover'){
  const showing=pieces.filter(p=>(state.area==='discover'?p.is_public:inPiece(p.id))&&(!state.search||p.name.toLowerCase().includes(state.search.toLowerCase())));
  body=showing.map(p=>`<div class="side-row ${state.selected===p.id?'selected':''}" data-action="open-piece" data-id="${esc(p.id)}">${pieceAvatar(p)}<div class="grow"><strong>${esc(p.name)}</strong><p>${esc((p.description||'A Tender Piece').slice(0,58))}</p></div></div>`).join('')||'<p class="hint" style="padding:18px">No Pieces here yet.</p>';
 }else{
  body=`<button type="button" class="side-row account-side-shortcut" data-action="settings-profile">${avatars(my)}<span class="grow"><strong>${esc(my.display_name)}</strong><p>@${esc(my.handle)}</p></span></button>`;
 }
 const accountMenuWasOpen=!!document.getElementById('tender-account-menu')&&!document.getElementById('tender-account-menu').hidden;
 const savedListScroll=el.querySelector('.sidebar-content')?.scrollTop||0;
 el.innerHTML=`<div class="sidebar-top">${state.area==='chats'?`
   <button type="button" class="sidebar-friends-top ${state.area==='friends'?'selected':''}" data-action="area" data-area="friends">${ico('users')}<span>Friends</span>${unreadFriends()?renderBadge(unreadFriends()):''}</button>
   <div class="sidebar-title dm-heading"><span>DIRECT MESSAGES</span><button class="plus-btn" aria-label="New direct message" title="New direct message" data-action="new-chat">${ico('plus')}</button></div>`:
   `<div class="eyebrow">${eyebrow}</div><div class="sidebar-title"><h2>${title}</h2>${newAction?`<button class="plus-btn" aria-label="Create" title="Create" data-action="${newAction}">${ico('plus')}</button>`:''}</div>`}
   ${state.area!=='settings'?`<label class="searchbox">${ico('search','icon-sm')}<input id="sidebar-search" value="${esc(state.search)}" placeholder="Search ${state.area==='chats'?'DMs':state.area==='friends'?'friends':'Pieces'}..." aria-label="Search"></label>`:''}
   </div><div class="sidebar-content">${body}</div><div class="sidebar-account-dock" id="sidebar-account-dock">${accountDockHTML(accountMenuWasOpen)}</div>`;
 const list=el.querySelector('.sidebar-content');if(list)list.scrollTop=savedListScroll;
 syncDeafenedAudio();
}

function header(title,sub='',buttons=''){return `<header class="main-top"><div class="head-left"><button class="round-btn mobile-back" data-action="go-back" title="Back">${ico('back')}</button><div class="title-area"><h2>${esc(title)}</h2><p>${esc(sub)}</p></div></div><div class="head-actions">${buttons}</div></header>`}
// Tender 0.3.4: background updates must not erase in-progress settings edits.
// Capture only within the SAME section; tab changes are deliberate navigation.
function captureSettingsView(main){
 const panel=main.querySelector?.('.settings-content');
 if(!panel||!user||state.area!=='settings'||main.dataset.settingsTab!==state.settingsTab)return null;
 const navigation=main.querySelector('.settings-navigation');
 const inputs=[...panel.querySelectorAll('input,textarea,select')];
 const focused=document.activeElement;
 const focusIndex=inputs.indexOf(focused);
 return {
  top:panel.scrollTop,left:panel.scrollLeft,navLeft:navigation?.scrollLeft||0,
  values:inputs.map(el=>({
   id:el.id||'',name:el.name||'',formId:el.form?.id||'',
   type:el.type||'',value:el.type==='file'?null:el.value,
   checked:el.type==='checkbox'||el.type==='radio'?el.checked:null
  })),
  focusIndex,selection:focusIndex>=0&&typeof focused.selectionStart==='number'
   ?{start:focused.selectionStart,end:focused.selectionEnd}:null
 };
}
function restoreSettingsView(main,snapshot){
 if(!snapshot)return;
 const panel=main.querySelector('.settings-content');if(!panel)return;
 const inputs=[...panel.querySelectorAll('input,textarea,select')];
 for(let i=0;i<snapshot.values.length;i++){
  const before=snapshot.values[i],el=inputs[i];
  if(!el||before.type==='file'||el.disabled||
     (el.id||'')!==before.id||(el.name||'')!==before.name||(el.form?.id||'')!==before.formId
     ||el.type!==before.type)continue;
  if(before.checked!==null)el.checked=before.checked;
  else if(before.value!==null)el.value=before.value;
 }
 const focus=snapshot.focusIndex>=0?inputs[snapshot.focusIndex]:null;
 if(focus&&!focus.disabled){
  try{focus.focus({preventScroll:true})}catch{}
  if(snapshot.selection&&typeof focus.setSelectionRange==='function'){
   try{focus.setSelectionRange(snapshot.selection.start,snapshot.selection.end)}catch{}
  }
 }
 panel.scrollTop=snapshot.top;panel.scrollLeft=snapshot.left;
 const navigation=main.querySelector('.settings-navigation');
 if(navigation)navigation.scrollLeft=snapshot.navLeft;
}
function updateSavedProfilePreview(){
 if(state.area!=='settings'||state.settingsTab!=='profile')return;
 const name=document.getElementById('settings-preview-name');
 const meta=document.getElementById('settings-preview-meta');
 const status=document.getElementById('settings-preview-status');
 if(name)name.textContent=my.display_name||'Tender member';
 if(meta)meta.textContent='@'+(my.handle||'member')+(my.pronouns?' · '+my.pronouns:'');
 if(status){
  status.textContent=my.game_status?(my.status_emoji||'🍗')+' '+my.game_status:'No custom status yet';
  status.classList.toggle('is-empty',!my.game_status);
 }
}
function cacheUpdatedProfile(saved){
 if(!saved||!user)return;
 const current=profiles.find(p=>p.id===user.id);
 if(current)Object.assign(current,saved);
 if(my?.id===user.id)Object.assign(my,saved);
 else my={...(my||{}),...saved,id:user.id};
}
function renderMain(){const m=document.getElementById('main');if(!m)return;
 const settingsSnapshot=captureSettingsView(m);
 const oldDraft=m.querySelector('#message-box')?.value||'';
 const oldKey=m.dataset.threadKey, newKey=[state.area,state.selected||'',state.pieceTab].join(':');
 if(oldKey&&oldKey!==newKey&&oldDraft&&user)localStorage.setItem('tender-draft:'+user.id+':'+oldKey,oldDraft);
 const oldScroll=m.querySelector('.chat-scroll');
 const pos=oldScroll?{top:oldScroll.scrollTop,near:oldScroll.scrollHeight-oldScroll.scrollTop-oldScroll.clientHeight<96}:null;
 let view='';
 if(state.area==='chats'){let c=getConversation(state.selected);view=c?renderChat(c):header('Your conversations','Welcome to Tender!')+`<div class="main-body">${empty('Stay close. Stay crispy.','Find your people, start a DM or create a group chat. Buffalo will be here cheering for you.','find-friends','Find friends')}</div>`;}
 else if(state.area==='friends'){view=state.selected&&pby(state.selected).id?renderFriend(pby(state.selected)):renderFriends()}
 else if(state.area==='pieces'||state.area==='discover'){view=selectedPiece()?renderPiece(selectedPiece()):renderPieceList(state.area==='discover')}
 else view=renderSettings();m.innerHTML=view;
 m.dataset.settingsTab=state.area==='settings'?state.settingsTab:'';
 restoreSettingsView(m,settingsSnapshot);
 const newDraft=m.querySelector('#message-box');if(newDraft)newDraft.value=oldKey===newKey&&oldDraft?oldDraft:(localStorage.getItem('tender-draft:'+user.id+':'+newKey)||'');
 renderNavBadges();m.dataset.threadKey=newKey;
 const chatScroll=m.querySelector('.chat-scroll');
 if(chatScroll)chatScroll.scrollTop=pos&&oldKey===newKey&&!pos.near?pos.top:chatScroll.scrollHeight;
 syncDeafenedAudio();
 renderInfoPanel()
}
function renderChat(c){const title=namesFor(c),otherId=c.kind!=='group'?(c.conversation_members||[]).find(x=>x.user_id!==user.id)?.user_id:null;return header(title,c.kind==='group'?`${(c.conversation_members||[]).length} members`:'Private conversation',`${otherId?`<button class="round-btn" data-action="open-profile" data-id="${esc(otherId)}" title="View profile" aria-label="View profile">${ico('users')}</button>`:''}<button class="round-btn" data-action="search" title="Search messages">${ico('search')}</button><button class="round-btn" data-action="chat-info" title="Conversation info">${ico('info')}</button><button class="round-btn" data-action="toggle-info" title="Toggle member panel">${ico('users')}</button><button class="round-btn" data-action="room-appearance" title="Customize this chat">🎨</button>`)+`<div class="main-body"><div class="chat-history">${pinnedHTML()}<div class="chat-scroll" id="chat-scroll">${activeMessages.length?activeMessages.map(x=>messageHTML(x,'message')).join(''):`<div class="chat-empty"><img src="buffalo.webp" alt="Buffalo"><h3>Start the conversation</h3><p class="hint">Say hi to ${esc(title)}!</p></div>`}</div><button type="button" class="chat-jump-new" id="chat-jump-new" data-action="jump-latest" hidden>↓ New messages · Jump to latest</button>${composer('chat',`Message ${title}`)}</div></div>`}
function messageHTML(row,target_type='message'){
 const p=pby(row.author_id),mine=row.author_id===user.id;
  const previous=activeMessages[activeMessages.findIndex(x=>x.id===row.id)-1];
  const grouped=!!(previous&&previous.author_id===row.author_id&&Math.abs(new Date(row.created_at)-new Date(previous.created_at))<300000&&!row.reply_to&&!previous.reply_to);
 const reacts=activeReactions.filter(r=>r.target_type===target_type&&r.target_id===row.id);const emojiMap={};reacts.forEach(r=>(emojiMap[r.emoji] ||= []).push(r));
 const reply=row.reply_to?activeMessages.find(x=>x.id===row.reply_to):null;
 const replyHTML=row.reply_to?`<button type="button" class="reply-quote reply-ref" data-action="jump-reply" data-id="${esc(row.reply_to)}" title="Jump to replied message">↳ ${reply?`<strong>${esc(pby(reply.author_id).display_name)}</strong> ${esc((reply.body||'Attachment').slice(0,130))}`:'Original message is outside the loaded history'}</button>`:'';
 const gif=giftGif(row.body);
 return `<div data-message-id="${esc(row.id)}" role="group" tabindex="0" class="chat-bubble-wrap ${mine?'mine':''} ${grouped?'message-grouped':''} ${row.pending?'bubble-pending':''}">${profileFace(p)}<div class="bubble-content">${!grouped?`<div class="bubble-name">${profileName(p)}</div>`:''}${replyHTML}<div class="bubble">${messageText(row.body||'')}${gif}${attachmentHTML(row)}${row.poll_id?pollHTML(row.poll_id):''}</div><div class="bubble-meta">${fmt(row.created_at)} ${row.edited_at?'· edited':''} ${row.pending?'· Sending…':''} ${readReceiptHTML(row)}</div>${Object.keys(emojiMap).length?`<div class="bubble-reactions">${Object.entries(emojiMap).map(([emoji,recs])=>`<button class="react-chip ${recs.some(r=>r.author_id===user.id)?'mine-react':''}" data-action="react" data-type="${target_type}" data-id="${row.id}" data-emoji="${esc(emoji)}">${esc(emoji)} ${recs.length}</button>`).join('')}</div>`:''}<div class="bubble-actions" aria-label="Message actions">${!row.pending&&(target_type==='message'||pieceRepliesReady)?`<button type="button" class="emoji-inline reply-quick-action" data-action="reply-message" data-id="${esc(row.id)}" title="Reply to message" aria-label="Reply to ${esc(p.display_name||'member')}">${ico('chat','icon-sm')}<span>Reply</span></button>`:''}<button class="emoji-inline" data-action="reaction-menu" data-type="${target_type}" data-id="${row.id}" title="React">${ico('smile','icon-sm')}</button>${target_type==='message'&&!row.pending?`<button class="emoji-inline" data-action="bookmark-message" data-id="${row.id}" title="Bookmark">${bookmarks.some(b=>b.message_id===row.id)?'★':'☆'}</button><button class="emoji-inline" data-action="forward-message" data-id="${row.id}" title="Forward text">↗</button>`:''}${mine&&!row.pending?`<button class="emoji-inline" data-action="edit-message" data-id="${row.id}" title="Edit">${ico('edit','icon-sm')}</button><button class="emoji-inline" data-action="pin-message" data-id="${row.id}" title="Pin">${row.is_pinned?'📌':'📍'}</button><button class="emoji-inline" data-action="delete-message" data-id="${row.id}" data-type="${target_type}" title="Delete">${ico('trash','icon-sm')}</button>`:''}</div></div></div>`}
function updateComposerReply(){
 const form=document.getElementById('composer-form');if(!form?.querySelector||!form.insertAdjacentHTML)return;
 form.querySelector('.composer-reply')?.remove();
 if(!replyTo)return;
 const name=esc(pby(replyTo.author_id).display_name),preview=esc((replyTo.body||'Attachment').slice(0,110));
 form.insertAdjacentHTML('afterbegin',`<div class="composer-reply"><span class="composer-reply-bar"></span><div class="composer-reply-content"><strong>Replying to ${name}</strong><span>${preview}</span></div><button type="button" class="round-btn" data-action="cancel-reply" aria-label="Cancel reply" title="Cancel reply">${ico('x','icon-sm')}</button></div>`);
}
function selectReply(messageId){
 const found=activeMessages.find(m=>m.id===messageId&&!m.pending);
 if(!found)return toast('This message is no longer available.',true);
 if(state.area!=='chats'&&!pieceRepliesReady)return toast('Piece replies are not available until the database migration completes.',true);
 replyTo=found;updateComposerReply();
 const field=document.getElementById('message-box');if(field){field.focus();field.scrollIntoView({block:'nearest'})}
}
function jumpToReply(id){
 const node=[...document.querySelectorAll('#main .chat-scroll [data-message-id]')].find(el=>el.dataset.messageId===id);
 if(!node){toast('The original message is outside the latest 150 messages.',true);return}
 node.scrollIntoView({behavior:'smooth',block:'center'});node.classList.add('reply-target-highlight');
 setTimeout(()=>node.classList.remove('reply-target-highlight'),1700);
}
function composer(kind,placeholder,extra=''){const disabled=kind==='piece'&&!inPiece(state.selected);return `<form class="composer-wrap" id="composer-form" data-kind="${kind}">${replyTo?`<div class="composer-reply"><span class="composer-reply-bar"></span><div class="composer-reply-content"><strong>Replying to ${esc(pby(replyTo.author_id).display_name)}</strong><span>${esc((replyTo.body||'Attachment').slice(0,110))}</span></div><button type="button" class="round-btn" data-action="cancel-reply" aria-label="Cancel reply" title="Cancel reply">${ico('x','icon-sm')}</button></div>`:''}<div id="composer-assist" class="composer-assist" hidden></div><div class="composer">${kind==='chat'?`<button type="button" class="round-btn" data-action="attach" title="Attach file">${ico('clip')}</button>`:''}<button type="button" class="round-btn" data-action="emoji-picker" title="Emojis">${ico('smile')}</button>${kind==='chat'?`<button type="button" class="round-btn composer-extra" data-action="gif-picker" title="GIF">GIF</button><button type="button" class="round-btn composer-extra" data-action="new-poll" title="Poll">📊</button><button type="button" class="round-btn composer-extra" data-action="record-voice" title="Voice message">🎙️</button>`:''}<textarea id="message-box" name="body" maxlength="4000" rows="1" ${disabled?'disabled':''} placeholder="${disabled?'Join this Piece to chat':esc(placeholder)}"></textarea><button class="send-btn" type="submit" ${disabled?'disabled':''} aria-label="Send">${ico('send')}</button></div><div class="composer-footer"><span id="typing-line"></span><span id="file-status" role="status" aria-live="polite"></span><span>${extra||'Enter to send · Shift+Enter for a new line'}</span></div><input type="file" id="message-file" hidden accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,audio/webm,audio/ogg,audio/mp4,audio/mpeg"></form>`}
function renderFriends(){let pending=friendships.filter(f=>f.status==='pending');const incoming=pending.filter(f=>f.recipient===user.id),outgoing=pending.filter(f=>f.requester===user.id),accepted=myFriendIds();return header('Friends','Keep the people who matter close',`<button class="btn sm" data-action="find-friends">${ico('plus')} Add friends</button>`)+`<div class="main-body"><div class="content-pad"><h1 class="page-title">Your circle 🧡</h1><p class="page-subtitle">Your friends, friend requests, and the next great conversation.</p>${incoming.length?`<div class="section-row top-spacer"><h2 class="section-heading">Friend requests</h2></div><div class="card">${incoming.map(f=>friendItem(pby(f.requester),'incoming',f.id)).join('')}</div>`:''}${outgoing.length?`<div class="section-row top-spacer"><h2 class="section-heading">Sent requests</h2></div><div class="card">${outgoing.map(f=>friendItem(pby(f.recipient),'outgoing',f.id)).join('')}</div>`:''}<div class="section-row top-spacer"><h2 class="section-heading">Friends (${accepted.length})</h2></div><div class="card">${accepted.map(id=>friendItem(pby(id),'friend')).join('')||'<div class="notice-inline">No friends yet. Search for people by username and send them a request.</div>'}</div></div></div>`}
function friendItem(p,kind,fid=''){return `<div class="friend-row">${profileFace(p)}<div class="friend-data">${profileName(p)}<p>@${esc(p.handle)}</p></div>${kind==='incoming'?`<button class="btn sm" data-action="accept-friend" data-id="${fid}">Accept</button>`:kind==='outgoing'?`<span class="tag neutral">Pending</span>`:`<button class="btn sm secondary" data-action="start-dm" data-id="${p.id}">Message</button>`}</div>`}
function renderFriend(p){
 const isFriend=myFriendIds().includes(p.id);
 return header(p.display_name,`@${p.handle}`)+`<div class="main-body"><div class="friend-profile-page">
   <section class="friend-profile-primary">
    <div class="friend-profile-cover" ${p.banner_url?`style="background-image:linear-gradient(#0c102555,#0c102599),url(&quot;${esc(validUrl(p.banner_url))}&quot;)"`:''}></div>
    <div class="friend-profile-identity">
     <button type="button" class="friend-profile-avatar" data-action="open-profile" data-id="${esc(p.id)}" aria-label="Open full profile">${avatars(p)}</button>
     <h1>${esc(p.display_name)}</h1><p>@${esc(p.handle||'member')}${p.pronouns?' · '+esc(p.pronouns):''}</p>
     ${profileStatus(p)}
     ${p.game_status?`<div class="profile-dialog-status">${esc(p.status_emoji||'🍗')} ${esc(p.game_status)}</div>`:''}
     <div class="friend-profile-cta">${profileActions(p)}
       ${isFriend?`<button class="btn secondary" data-action="remove-friend" data-id="${esc(p.id)}">Remove friend</button>`:''}
       ${extendedReady?`<button class="btn secondary" data-action="toggle-block" data-id="${esc(p.id)}">${blockedUsers.some(b=>b.blocked_id===p.id)?'Unblock':'Block'}</button>`:''}
     </div>
    </div>
   </section>
   <section class="friend-profile-secondary">
    <div class="friend-profile-section-title">PROFILE DETAILS</div>
    ${publicProfileDetails(p)}${sharedPiecesHTML(p.id)}
    <button type="button" class="btn secondary friend-full-profile" data-action="open-profile" data-id="${esc(p.id)}">View full profile ${ico('external','icon-sm')}</button>
   </section>
  </div></div>`;
}
function renderPieceList(discover){const list=pieces.filter(p=>discover?p.is_public:inPiece(p.id));return header(discover?'Discover Pieces':'Your Pieces',discover?'Explore communities made by people':'All your favorite corners of Tender',`<button class="btn sm" data-action="new-piece">${ico('plus')} New Piece</button>`)+`<div class="main-body"><div class="content-pad"><div class="section-row"><div><h1 class="page-title">${discover?'Find your people 🔥':'Your Pieces 🧩'}</h1><p class="page-subtitle">Each Piece has a chat, forum, and gallery. No servers. Just shared interests.</p></div></div><div class="grid grid-3">${list.map(p=>`<article class="card piece-grid-card" tabindex="0" role="button" data-action="open-piece" data-id="${p.id}"><div class="piece-card-banner" style="background:${esc(p.color)}33">${pieceAvatar(p,'piece-icon-card')}</div><div class="piece-card-inner"><h3>${esc(p.name)}</h3><p>${esc(p.description||'A Tender community')}</p><div class="compact-stats"><span class="tag">${p.is_public?'Public':'Private'}</span></div></div></article>`).join('')}</div>${list.length?'':`<div class="notice-inline top-spacer">${discover?'No public Pieces yet. Create the first one!':'You have not joined any Pieces yet. Head to Discover to browse.'}</div>`}</div></div>`}
function renderPiece(piece){let joined=inPiece(piece.id),own=ownPiece(piece.id);let buttons=`${joined?`<button class="btn sm secondary" data-action="leave-piece" ${own?'disabled title="Owner cannot leave"':''}>${own?'Owner':'Leave'}</button>`:`${piece.is_public?`<button class="btn sm" data-action="join-piece">Join Piece</button>`:''}`}${own?`<button class="round-btn" title="Edit Piece" data-action="edit-piece">${ico('settings')}</button><button class="round-btn" title="Custom roles" data-action="piece-roles">👑</button>`:''}`;
 buttons+=`${piece.is_public?'<button class="round-btn" data-action="copy-piece-link" title="Share Piece invitation card" aria-label="Share Piece invitation card">🔗</button>':''}<button class="round-btn" data-action="toggle-info" title="Members">👥</button><button class="round-btn" data-action="room-appearance" title="Customize this Piece">🎨</button>`;
  let content='';if(state.pieceTab==='chat') content=`<div class="chat-history piece-chat-history"><div class="chat-scroll">${activeMessages.length?activeMessages.map(m=>messageHTML(m,'piece_message')).join(''):`<div class="chat-empty"><img src="buffalo.webp" alt="Buffalo"><h3>${joined?'No messages yet':'Join this Piece to chat'}</h3><p>${joined?'Say hello to your Piece! 🍗':'Become a member to participate in community chat.'}</p>${!joined&&piece.is_public?'<button type="button" class="btn" data-action="join-piece">Join Piece</button>':''}</div>`}</div><button type="button" class="chat-jump-new" id="chat-jump-new" data-action="jump-latest" hidden>↓ New messages · Jump to latest</button>${composer('piece','Message this Piece')}</div>`;
 if(state.pieceTab==='forum') content=`<div class="section-row"><h2 class="section-heading">Discussions</h2>${joined?`<button class="btn sm" data-action="new-post">${ico('plus')} New post</button>`:''}</div><div class="grid">${activePosts.map(post=>`<article class="post-card" role="button" tabindex="0" data-action="open-post" data-id="${post.id}"><div class="post-meta">${profileName(pby(post.author_id))} · ${relative(post.created_at)}</div><h3>${post.pinned?'📌 ':''}${esc(post.title)}</h3>${post.tags?.length?`<div class="tagline">${post.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>`:''}<p class="post-body">${esc(post.body.slice(0,240))}${post.body.length>240?'...':''}</p><div class="post-footer">${ico('chat','icon-sm')} ${post.locked?'🔒 Locked':'Read discussion'} ${(own||memberships.some(m=>m.piece_id===post.piece_id&&m.user_id===user.id&&m.role==='moderator'))&&extendedReady?`<button class="emoji-inline" data-action="pin-post" data-id="${post.id}" title="Pin">📌</button><button class="emoji-inline" data-action="lock-post" data-id="${post.id}" title="Lock">🔒</button>`:''}${post.author_id===user.id||own?`<button class="emoji-inline" data-action="delete-post" data-id="${post.id}" title="Delete post">${ico('trash','icon-sm')}</button>`:''}</div></article>`).join('')||'<div class="notice-inline">No discussions yet. Be the first to post.</div>'}</div>`;
 if(state.pieceTab==='gallery')content=`<div class="section-row"><h2 class="section-heading">Gallery</h2>${joined&&piece.is_public?`<button class="btn sm" data-action="new-gallery">${ico('plus')} Upload picture</button>`:''}</div><div class="gallery-grid">${activeGallery.map(photo=>`<article class="gallery-card"><img src="${esc(galleryUrl(photo.image_path))}" alt="${esc(photo.caption||'Community image')}" data-action="enlarge" data-src="${esc(galleryUrl(photo.image_path))}"><div class="gallery-info"><p>${esc(photo.caption)}</p><div class="post-meta">${profileName(pby(photo.author_id))} · ${relative(photo.created_at)}</div><div class="bubble-actions"><button class="emoji-inline" data-action="reaction-menu" data-type="gallery" data-id="${photo.id}">${ico('smile')}</button>${own||photo.author_id===user.id?`<button class="emoji-inline" data-action="delete-gallery" data-id="${photo.id}" data-path="${esc(photo.image_path)}">${ico('trash')}</button>`:''}</div></div></article>`).join('')||'<div class="notice-inline">The gallery is waiting for its first photo.</div>'}</div>`;
  if(state.pieceTab==='events')content=`<div class="section-row"><h2 class="section-heading">Events</h2>${(own||memberships.some(m=>m.piece_id===piece.id&&m.user_id===user.id&&m.role==='moderator'))?`<button class="btn sm" data-action="new-event">+ Create event</button>`:''}</div><div class="grid">${pieceEvents.filter(e=>e.piece_id===piece.id).map(e=>`<article class="post-card"><div class="post-meta">${new Date(e.starts_at).toLocaleString()}</div><h3>📅 ${esc(e.title)}</h3><p>${esc(e.description)}</p></article>`).join('')||'<p class="notice-inline">No upcoming events yet.</p>'}</div>`;
  return header(piece.name,piece.is_public?'Public Piece · Chat / Forum / Gallery':'Private Piece',buttons)+`<div class="main-body piece-body"><div class="piece-top-scroll"><div class="content-pad"><section class="piece-hero layout-${esc(piece.layout_style||'classic')}"><div class="piece-banner" style="background:${piece.banner_url?`linear-gradient(135deg,#0009,#0004),url(${esc(validUrl(piece.banner_url))}) center/cover`:`linear-gradient(135deg,${esc(piece.color)},#35211a)`}">${own?`<button type="button" class="piece-hero-edit" data-action="edit-piece" title="Change Piece profile picture" aria-label="Change Piece picture">${pieceAvatar(piece,'piece-icon-hero')}<span class="piece-hero-pencil">✎</span></button>`:pieceAvatar(piece,'piece-icon-hero')}</div><div class="piece-info"><div><h2>${esc(piece.name)}</h2><p>${esc(piece.description||'Welcome to this Tender Piece!')}</p>${piece.welcome_text?`<p class="hint">✨ ${esc(piece.welcome_text)}</p>`:''}</div><span class="tag">${piece.is_public?'🌎 Public':'🔒 Private'}</span></div></section><nav class="tabs" aria-label="Piece sections">${[['chat','Chat'],['forum','Forum'],['gallery','Gallery'],['events','Events']].map(([id,label])=>`<button class="${state.pieceTab===id?'active':''}" data-action="piece-tab" data-tab="${id}">${ico(id==='gallery'?'image':id==='forum'?'forum':id==='events'?'bell':'chat','icon-sm')} ${label}</button>`).join('')}</nav>${state.pieceTab!=='chat'?content:''}</div></div>${state.pieceTab==='chat'?content:''}</div>`;
}
function renderSettings(){
 const sections=[['profile','user','My Profile'],['account','settings','My Account'],['appearance','palette','Appearance'],['notifications','bell','Notifications'],['privacy','shield','Privacy & Safety'],['accessibility','accessibility','Accessibility']];
 const tab=sections.some(x=>x[0]===state.settingsTab)?state.settingsTab:'profile';
 const nav=sections.map(([id,icon,label])=>`<button type="button" class="settings-nav-item ${tab===id?'active':''}" data-action="settings-tab" data-tab="${id}" aria-current="${tab===id?'page':'false'}">${ico(icon,'icon-sm')}<span>${label}</span></button>`).join('');
 let content='';
 if(tab==='profile')content=`
  <div class="settings-section-head"><span class="eyebrow">PERSONAL PROFILE</span><h1>Make it yours.</h1><p>Give your Tender profile some personality.</p></div>
  <div class="settings-profile-preview">${profileBanner(my)}<div class="settings-preview-identity"><div><h2 id="settings-preview-name">${esc(my.display_name)}</h2><p id="settings-preview-meta">@${esc(my.handle)}${my.pronouns?' · '+esc(my.pronouns):''}</p><p id="settings-preview-status" class="settings-preview-status ${my.game_status?'':'is-empty'}">${my.game_status?esc((my.status_emoji||'🍗')+' '+my.game_status):'No custom status yet'}</p></div><button class="btn secondary sm" data-action="open-profile" data-id="${esc(user.id)}">Preview profile</button></div></div>
  <div class="settings-card"><div class="settings-card-title"><h3>About you</h3><p>Shown when someone clicks your profile picture or name.</p></div>
  <form id="profile-form" class="settings-fields">
  <div class="field"><label>Display name</label><input class="input" name="display_name" maxlength="40" required value="${esc(my.display_name)}"></div>
  <div class="field"><label>Pronouns</label><input class="input" name="pronouns" maxlength="40" value="${esc(my.pronouns||'')}" placeholder="e.g. he/him · she/her · they/them" ${!pronounsReady?'disabled':''}><p class="hint">${pronounsReady?'Optional. Visible on your profile.':'Pronouns will be available once the small 0.3.2 database migration finishes.'}</p></div>
  <div class="field"><label>Bio <span class="field-caption">Up to 220 characters</span></label><textarea class="input textarea" name="bio" maxlength="220" rows="4" placeholder="Tell people something about yourself">${esc(my.bio||'')}</textarea></div>
  <div class="settings-two-fields"><div class="field"><label>Custom text status</label><input class="input" name="game_status" maxlength="90" value="${esc(my.game_status||'')}" placeholder="What's on your mind?"></div>
  ${extendedReady?`<div class="field"><label>Status emoji</label><input class="input" name="status_emoji" maxlength="12" value="${esc(my.status_emoji||'🍗')}"></div>`:''}</div>
  <div class="settings-actions"><button class="btn" type="submit">Save profile</button></div></form></div>
  <div class="settings-card"><h3>Avatar & banner</h3><p class="hint">Your pictures are visible to other Tender members.</p>
  <div class="settings-two-fields"><div class="field"><label>Upload avatar (2 MB)</label><input type="file" class="input" id="avatar-file" accept="image/png,image/jpeg,image/webp"></div>
  <div class="field"><label>Upload banner (3 MB)</label><input class="input" id="banner-file" type="file" accept="image/png,image/jpeg,image/webp"></div></div></div>`;
 if(tab==='account')content=`<div class="settings-section-head"><span class="eyebrow">ACCOUNT</span><h1>My Account</h1><p>See your account details, current user identity and personal profile.</p></div>
  <div class="settings-card"><div class="account-identity">${avatars(my)}<div><h3>${esc(my.display_name)}</h3><p>@${esc(my.handle)}</p></div><button class="btn sm secondary" data-action="settings-tab" data-tab="profile">Edit profile</button></div><div class="settings-readonly"><span>Account email</span><strong>${esc(user.email||'Available in your sign-in provider')}</strong></div><div class="settings-readonly"><span>User ID</span><code>${esc(user.id)}</code></div><p class="hint">Password and email updates are managed securely by your sign-in provider. Never share your password.</p></div>
  <div class="settings-card"><h3>Session</h3><p class="hint">Sign out from this browser.</p><button class="btn danger" data-action="logout">Log out of Tender</button></div>`;
 if(tab==='appearance')content=`<div class="settings-section-head"><span class="eyebrow">CUSTOMIZE</span><h1>Appearance</h1><p>Give your Tender client the look you want.</p></div>
  ${extendedReady?`<div class="settings-card"><h3>Synced appearance</h3><p class="hint">These options are saved to your account and follow you across devices.</p><form id="preferences-form"><div class="settings-two-fields">
  <div class="field"><label>Theme</label><select class="input" name="chat_theme">${[['dark','Tender Dark'],['light','Tender Light'],['midnight','Midnight'],['cozy','Cozy Orange']].map(([v,l])=>`<option value="${v}" ${my.chat_theme===v?'selected':''}>${l}</option>`).join('')}</select></div>
  <div class="field"><label>Accent color</label><input class="input" type="color" name="accent_color" value="${esc(my.accent_color||'#f47735')}"></div>
  <div class="field"><label>Profile animation</label><select class="input" name="profile_effect">${['none','glow','float','sparkle'].map(v=>`<option value="${v}" ${my.profile_effect===v?'selected':''}>${v}</option>`).join('')}</select></div></div><button class="btn" type="submit">Save synced appearance</button></form></div>`:''}
  ${appearanceStudio()}`;
 if(tab==='notifications')content=`<div class="settings-section-head"><span class="eyebrow">STAY CONNECTED</span><h1>Notifications</h1><p>Keep up with friends even while browsing other tabs.</p></div>
  ${deviceNotificationsPanel()}
  ${extendedReady?`<div class="settings-card"><h3>Notification preferences</h3><form id="notification-preferences-form" class="settings-fields"><div class="settings-two-fields"><div class="field"><label>Notify me about</label><select class="input" name="notification_mode">${[['all','All messages & friends'],['mentions','Mentions & friend requests'],['none','Nothing']].map(([v,label])=>`<option value="${v}" ${my.notification_mode===v?'selected':''}>${label}</option>`).join('')}</select></div><div class="field"><label>Sound</label><select class="input" name="notification_sound"><option value="yes" ${my.notification_sound?'selected':''}>Enabled</option><option value="no" ${!my.notification_sound?'selected':''}>Muted</option></select></div><div class="field"><label>Notification sound</label><select class="input" name="notification_tone">${["pop","chime","soft"].map(v=>`<option value="${v}" ${my.notification_tone===v?'selected':''}>${v}</option>`).join('')}</select></div></div><button class="btn" type="submit">Save notification preferences</button></form></div>`:''}`;
 if(tab==='privacy')content=`<div class="settings-section-head"><span class="eyebrow">YOUR SPACE</span><h1>Privacy & Safety</h1><p>Decide how others can interact with you.</p></div>
  ${extendedReady?`<div class="settings-card"><h3>Privacy options</h3><form id="privacy-preferences-form"><div class="field"><label>Presence</label><select class="input" name="presence_mode">${[['online','Online'],['idle','Idle'],['dnd','Do Not Disturb'],['invisible','Invisible']].map(([v,t])=>`<option value="${v}" ${my.presence_mode===v?'selected':''}>${t}</option>`).join('')}</select></div><button class="btn" type="submit">Save privacy options</button></form></div>
  <div class="settings-card"><h3>Blocked users</h3><p class="hint">Blocked accounts cannot contact you by DM.</p><button class="btn secondary" data-action="blocked-list">Manage blocked people (${blockedUsers.length})</button></div>`:''}
  <div class="settings-card"><h3>Staying safe</h3><p class="hint">Think carefully before sharing personal details in public Pieces. Moderation tools are still being developed.</p></div>`;
 if(tab==='accessibility')content=`<div class="settings-section-head"><span class="eyebrow">COMFORT</span><h1>Accessibility</h1><p>Adjust readability and motion to suit you.</p></div>
  <div class="settings-card"><h3>Readability & motion</h3><p class="hint">Find font size, density, and reduced-motion controls in Appearance Studio.</p><button class="btn secondary" data-action="settings-tab" data-tab="appearance">Open Appearance Studio</button></div>
  <div class="settings-card"><h3>Keyboard shortcuts</h3><div class="shortcut-row"><kbd>Any letter</kbd><span>Start typing into the current chat</span></div><div class="shortcut-row"><kbd>Enter</kbd><span>Send message while composing</span></div><div class="shortcut-row"><kbd>Shift + Enter</kbd><span>New line</span></div><div class="shortcut-row"><kbd>Esc</kbd><span>Close an open dialog</span></div><div class="shortcut-row"><kbd>Tab</kbd><span>Navigate buttons and inputs</span></div></div>`;
 return header('User Settings','Your space, your rules')+`<div class="main-body settings-page"><div class="settings-layout"><nav class="settings-navigation" aria-label="Settings categories"><div class="settings-nav-label">USER SETTINGS</div>${nav}</nav><section class="settings-content">${content}<div class="settings-footer">Tender 0.3.4 · Stay close. Stay crispy. 🍗</div></section></div></div>`;
}

let activeLoadVersion=0;
async function loadActive(){
 if(!db||!state.selected)return;
 const seq=++activeLoadVersion,selected=state.selected,area=state.area,tab=state.pieceTab;
 const pending=activeMessages.filter(m=>m.pending&&(area==='chats'?m.conversation_id===selected:m.piece_id===selected));
 let fresh=[],reactions=[],posts=[],gallery=[];
 if(area==='chats'){
  fresh=assert(await q('messages').select('*').eq('conversation_id',selected).order('created_at',{ascending:true}).limit(150))||[];
  if(fresh.length)reactions=assert(await q('reactions').select('*').eq('target_type','message').in('target_id',fresh.map(x=>x.id)))||[];
 }else if(area==='pieces'||area==='discover'){
  if(tab==='chat'){
   fresh=assert(await q('piece_messages').select('*').eq('piece_id',selected).order('created_at',{ascending:true}).limit(150))||[];
   if(fresh.length)reactions=assert(await q('reactions').select('*').eq('target_type','piece_message').in('target_id',fresh.map(x=>x.id)))||[];
  }
  if(tab==='forum')posts=assert(await q('piece_posts').select('*').eq('piece_id',selected).order('created_at',{ascending:false}).limit(100))||[];
  if(tab==='gallery')gallery=assert(await q('piece_gallery').select('*').eq('piece_id',selected).order('created_at',{ascending:false}).limit(100))||[];
 }
 if(seq!==activeLoadVersion||selected!==state.selected||area!==state.area||tab!==state.pieceTab)return;
 const ids=new Set(fresh.map(x=>x.id));for(const row of pending)if(!ids.has(row.id))fresh.push(row);
 activeMessages=fresh;activeReactions=reactions;activePosts=posts;activeGallery=gallery;
 await Promise.all([prepareAttachmentUrls(),loadPolls()]);
}
async function goTo(area,id=null){state.area=area;state.selected=id;state.search='';state.mobileDetail=!!id||['discover','settings'].includes(area);if(area==='friends'&&!id)state.mobileDetail=true;if(area==='pieces'||area==='discover')state.pieceTab='chat';replyTo=null;if(id&&['chats','pieces','discover'].includes(area))await loadActive();if(state.area!==area||state.selected!==id)return;applyLocalAppearance();render();if(area==='chats'&&id){markRead(id);subscribeTyping().catch(console.warn)}else if(['pieces','discover'].includes(area)&&id&&state.pieceTab==='chat'){subscribeTyping().catch(console.warn)}else{unsubTyping()}if(area==='friends')markRead(null,true);}
let confirmationResolve=null;
function tenderConfirm(title,description,action='Confirm',danger=true){
 if(confirmationResolve){confirmationResolve(false);confirmationResolve=null}
 return new Promise(resolve=>{
  confirmationResolve=resolve;
  modal(title,description,`<div class="tender-confirm"><div class="tender-confirm-icon">${danger?'⚠️':'🍗'}</div>
  <p>${esc(description)}</p><div class="tender-confirm-actions"><button type="button" class="btn secondary" data-action="confirm-no">Cancel</button>
  <button type="button" class="btn ${danger?'danger':''}" data-action="confirm-yes">${esc(action)}</button></div></div>`);
 });
}
function settleConfirm(value){
 const resolver=confirmationResolve;confirmationResolve=null;
 closeModal();if(resolver)resolver(value);
}
function modal(title,sub,body,footer=''){MODALS.innerHTML=`<div class="modal-outer" data-action="close-on-backdrop"><div class="modal-panel" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div><button class="round-btn" data-action="close-modal" aria-label="Close">${ico('x')}</button></div>${body}${footer}</div></div>`;const first=MODALS.querySelector('input,textarea,button');first?.focus()}
function closeModal(){if(confirmationResolve){const resolver=confirmationResolve;confirmationResolve=null;resolver(false)}const preview=document.getElementById('piece-pfp-preview-img');if(preview?.dataset?.previewUrl)URL.revokeObjectURL(preview.dataset.previewUrl);MODALS.innerHTML=''}
function findFriendsModal(){const options=profiles.filter(p=>p.id!==user.id&&!myFriendIds().includes(p.id)).slice(0,30);modal('Find friends','Search by exact username, then send a friend request.',`<form id="friend-search-form"><div class="field"><label for="friend-handle">Username</label><input class="input" id="friend-handle" name="handle" autocomplete="off" placeholder="friend_username" required maxlength="20"></div><button class="btn full" type="submit">${ico('search')} Search</button></form><div id="friend-search-results" class="top-spacer"></div>`)}
function newChatModal(){let options=myFriendIds().map(id=>pby(id));modal('New conversation','Choose a friend or build a squad.',`<div class="button-group"><button class="btn secondary" data-action="find-friends">${ico('users')} Find friends</button></div><div class="divider"></div><form id="group-form"><div class="field"><label>Group name</label><input name="group_name" class="input" maxlength="50" minlength="2" required placeholder="The crispy squad"></div><h3 class="section-heading">Invite friends</h3><div style="max-height:230px;overflow:auto">${options.map(p=>`<label class="member-checkbox"><input type="checkbox" name="member" value="${p.id}">${avatars(p)} ${esc(p.display_name)}</label>`).join('')||'<p class="notice-inline">Add friends before creating a group.</p>'}</div><button class="btn full top-spacer" type="submit">Create group</button></form>`)}
function newPieceModal(p=null){
 const editing=!!p,photo=pieceHasPhoto(p);
 modal(editing?'Edit Piece':'Create a Piece',editing?'Customize your community’s identity.':'Give people a reason to come together.',`
 <form id="piece-form" class="piece-editor-form">
   <input type="hidden" name="piece_id" value="${esc(p?.id||'')}">
   <div class="piece-editor-preview">
     ${pieceAvatar(p||{icon:'🍗',color:'#f47735'},'piece-icon-preview')}
     <div><strong>${editing?'Piece profile picture':'Choose a Piece picture'}</strong>
     <p class="hint">Upload a PNG, JPG or WEBP (max 3 MB), or keep an emoji icon.</p></div>
   </div>
   <div class="field"><label for="piece-pfp-file">Piece profile picture (optional)</label>
     <input class="input" id="piece-pfp-file" name="piece_pfp" type="file" accept="image/png,image/jpeg,image/webp">
     <div class="piece-image-preview" id="piece-pfp-preview" hidden><img id="piece-pfp-preview-img" alt="Selected Piece picture preview"></div>
   </div>
   <div class="field"><label for="piece-icon-mode">Picture or emoji</label>
     <select class="input" id="piece-icon-mode" name="icon_mode">
       <option value="keep">${editing?'Keep current icon unless you upload a picture':'Use the emoji below unless you upload a picture'}</option>
       <option value="emoji">Use the emoji instead of a picture</option>
     </select>
   </div>
   <div class="field"><label for="piece-emoji">Emoji fallback / replacement</label>
     <input class="input" id="piece-emoji" name="icon_emoji" maxlength="12" value="${esc(photo?'🍗':p?.icon||'🍗')}" placeholder="🍗">
   </div>
   <div class="field"><label>Piece name</label><input class="input" name="name" minlength="2" maxlength="70" required value="${esc(p?.name||'')}" placeholder="My First Piece"></div>
   <div class="field"><label>Description</label><textarea class="input textarea" name="description" maxlength="500" placeholder="What is this Piece all about?">${esc(p?.description||'')}</textarea></div>
   <div class="field"><label>Accent color</label><input class="input" name="color" type="color" value="${esc(p?.color||'#f47735')}"></div>
   <div class="field"><label>Visibility</label><select class="input" name="visibility">
     <option value="public" ${!p||p.is_public?'selected':''}>Public · Discoverable</option>
     <option value="private" ${p&&!p.is_public?'selected':''}>Private · Members only</option>
   </select></div>
   ${editing&&extendedReady?`<div class="field"><label>Homepage layout</label><select class="input" name="layout_style">${['classic','cards','compact'].map(v=>`<option value="${v}" ${p?.layout_style===v?'selected':''}>${v}</option>`).join('')}</select></div>
     <div class="field"><label>Welcome message</label><textarea class="input textarea" name="welcome_text" maxlength="500">${esc(p?.welcome_text||'')}</textarea></div>
     <div class="field"><label>Banner image (max 3 MB)</label><input class="input" type="file" name="banner" accept="image/png,image/jpeg,image/webp"></div>`:''}
   <p class="hint">Only the Piece owner can edit its name, image and settings.</p>
   <button class="btn full top-spacer" type="submit">${editing?'Save Piece changes':'Create Piece'} 🍗</button>
 </form>`);
}
function newPostModal(){modal('New discussion','Start a topic in '+selectedPiece().name,`<form id="post-form"><div class="field"><label>Title</label><input class="input" name="title" maxlength="130" minlength="3" required placeholder="What should we discuss?"></div><div class="field"><label>Post</label><textarea class="input textarea" name="body" maxlength="8000" required placeholder="Write something interesting..."></textarea></div><div class="field"><label>Tags (comma-separated, optional)</label><input class="input" name="tags" maxlength="100" placeholder="art, help, questions"></div><button class="btn full" type="submit">Publish discussion</button></form>`)}
function galleryModal(){modal('Add to gallery','Share something with the Piece.',`<form id="gallery-form"><div class="field"><label>Image (maximum 5 MB)</label><input class="input" name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required></div><div class="field"><label>Caption</label><textarea class="input textarea" name="caption" maxlength="500" placeholder="What did you make?"></textarea></div><button class="btn full" type="submit">Upload image</button></form>`)}
async function postModal(id){const post=activePosts.find(p=>p.id===id);if(!post)return;selectedPost=post;let comments=assert(await q('piece_comments').select('*').eq('post_id',id).order('created_at',{ascending:true}).limit(100))||[];modal(post.title,`Posted by ${pby(post.author_id).display_name} · ${relative(post.created_at)}`,`<div class="post-detail-body">${esc(post.body)}</div><div class="divider"></div><h3>${comments.length} replies</h3><div>${comments.map(c=>`<div class="reply-item"><div class="post-meta">${profileName(pby(c.author_id))} · ${relative(c.created_at)}</div><p>${esc(c.body)}</p></div>`).join('')||'<p class="hint top-spacer">No replies yet.</p>'}</div>${inPiece(state.selected)&&!post.locked?`<form id="reply-form" class="top-spacer"><div class="field"><label>Write a reply</label><textarea name="body" maxlength="3000" required class="input textarea" placeholder="Add to the conversation..."></textarea></div><button class="btn" type="submit">Post reply</button></form>`:'<p class="notice-inline">Join this Piece to reply.</p>'}`)}
function reactionModal(type,id){const choices=['🍗','❤️','😂','🔥','👍','⭐','🎉','😮','🤝','😭','💀','🤩','😍','🥳','😎','😡','🤔','😴','🥹','💯','👏','🙌','👀','💜','✨','🧡','💙','✅','❌','🌈','👑','🎨'];modal('React to this','Pick an emoji! Reactions update instantly.',`<div class="emoji-grid">${choices.map(emoji=>`<button class="emoji-option" data-action="react" data-type="${type}" data-id="${id}" data-emoji="${emoji}">${emoji}</button>`).join('')}</div>`)}
function chatInfo(){let c=getConversation(state.selected);modal('Conversation details',c?.kind==='group'?'This is your group chat.':'Private messaging between two friends.',`<h3 class="section-heading">Members</h3><div>${(c?.conversation_members||[]).map(m=>friendItem(pby(m.user_id),'info')).join('')}</div><p class="hint top-spacer">Only conversation members can read messages and attachments.</p>`)}
// Tender 0.3 commands are explicit opt-in shortcuts. Private utilities NEVER write chat messages.
const tenderCommands=[
 {name:'help',detail:'Show the command guide',usage:'/help'},
 {name:'roll',detail:'Roll a dice (2 to 100 sides)',usage:'/roll 20'},
 {name:'coin',detail:'Flip a coin',usage:'/coin'},
 {name:'shrug',detail:'Add a shrug to your message',usage:'/shrug [text]'},
 {name:'me',detail:'Roleplay-style action text',usage:'/me waves hello'},
 {name:'tableflip',detail:'Flip a table',usage:'/tableflip'},
 {name:'poll',detail:'Create a DM/group poll',usage:'/poll'},
 {name:'gif',detail:'Add a GIF media URL',usage:'/gif'},
 {name:'search',detail:'Search your messages',usage:'/search'},
 {name:'theme',detail:'Change current chat wallpaper',usage:'/theme'},
 {name:'who',detail:'Show conversation members',usage:'/who'},
 {name:'trivia',detail:'Play a private trivia round',usage:'/trivia'},
 {name:'embed',detail:'Build a rich announcement card',usage:'/embed'},
 {name:'invite',detail:'Share a public Piece with an invitation card',usage:'/invite'}
];
function updateComposerAssist(field){
 let box=document.getElementById('composer-assist');if(!box||!field)return;
 const value=field.value,cmd=value.match(/^\/([a-z]*)$/i),mention=value.match(/(?:^|\s)@([a-z0-9_]*)$/i);
 if(cmd){
  const matches=tenderCommands.filter(c=>c.name.startsWith(cmd[1].toLowerCase())).slice(0,7);
  box.innerHTML=matches.map(c=>`<button type="button" class="assist-row" data-action="insert-slash" data-command="${c.name}"><strong>/${c.name}</strong><span>${esc(c.detail)}</span><small>${esc(c.usage)}</small></button>`).join('');
 }else if(mention){
  const ids=state.area==='chats'?(getConversation(state.selected)?.conversation_members||[]).map(x=>x.user_id):memberships.filter(x=>x.piece_id===state.selected).map(x=>x.user_id);
  const people=[...new Set(ids)].map(id=>pby(id)).filter(p=>(p.handle||'').toLowerCase().startsWith(mention[1].toLowerCase())).slice(0,6);
  box.innerHTML=people.map(p=>`<button type="button" class="assist-row mention-assist-row" data-action="insert-mention" data-handle="${esc(p.handle)}"><span class="mention-suggest-avatar">${avatars(p)}</span><span class="mention-suggest-identity"><strong>@${esc(p.handle)}</strong><small>${esc(p.display_name)}</small></span></button>`).join('');
 }else box.innerHTML='';
 box.hidden=!box.innerHTML;
}
function triviaModal(){
 const questions=[
  {q:'Which planet has the most prominent rings?',answers:['Mars','Saturn','Mercury','Venus'],correct:1},
  {q:'Which language runs natively in web browsers?',answers:['Python','Ruby','JavaScript','C++'],correct:2},
  {q:'How many sides does a hexagon have?',answers:['5','6','7','8'],correct:1},
  {q:'What is the largest ocean on Earth?',answers:['Atlantic','Indian','Pacific','Arctic'],correct:2}
 ];
 const trivia=questions[Math.floor(Math.random()*questions.length)];
 modal('🍗 Tender Trivia','Play a quick solo round — your answer stays private.',`<div class="trivia-game"><h3>${esc(trivia.q)}</h3><div class="trivia-options">${trivia.answers.map((a,i)=>`<button type="button" class="btn secondary trivia-answer" data-action="trivia-answer" data-correct="${i===trivia.correct?'1':'0'}">${esc(a)}</button>`).join('')}</div><p id="trivia-result" class="hint" role="status"></p></div>`);
}
function applySlashCommand(body,kind){
 const match=body.match(/^\/([a-z]+)(?:\s+([\s\S]*))?$/i);if(!match)return {text:body};
 const name=match[1].toLowerCase(),args=(match[2]||'').trim();
 switch(name){
  case'help':modal('Tender slash commands','These commands are interactive shortcuts, not a third-party bot.',`<div class="command-list">${tenderCommands.map(c=>`<div class="command-item"><strong>${esc(c.usage)}</strong><small>${esc(c.detail)}</small></div>`).join('')}</div>`);return {handled:true};
  case'who':if(kind==='chat')chatInfo();else{const p=selectedPiece();modal('Piece members',p?.name||'Members',`<div>${memberships.filter(x=>x.piece_id===state.selected).slice(0,50).map(x=>friendItem(pby(x.user_id),'info')).join('')}</div>`)}return {handled:true};
  case'trivia':triviaModal();return {handled:true};
  case'embed':embedModal();return {handled:true};
  case'invite':if(kind!=='chat')return {error:'Use /invite in a DM or group chat.'};invitePickerModal();return {handled:true};
  case'poll':if(kind!=='chat')return {error:'Piece polls require backend support; use a DM or group for now.'};pollModal();return {handled:true};
  case'gif':gifModal();return {handled:true};
  case'search':searchModal();return {handled:true};
  case'theme':roomAppearanceModal();return {handled:true};
  case'coin':return {text:'🪙 Coin flip: '+(Math.random()<.5?'Heads':'Tails')};
  case'roll':{const sides=Number(args||6);if(!Number.isSafeInteger(sides)||sides<2||sides>100)return {error:'Use /roll with 2–100 sides, for example /roll 20.'};return {text:'🎲 Rolled '+(1+Math.floor(Math.random()*sides))+' / '+sides}}
  case'shrug':return {text:(args?args+' ':'')+'¯\\_(ツ)_/¯'};
  case'tableflip':return {text:(args?args+' ':'')+'(╯°□°)╯︵ ┻━┻'};
  case'me':return args?{text:'✦ '+my.display_name+' '+args}:{error:'Use /me followed by an action.'};
  default:return {error:'Unknown command. Use /help to see available commands.'};
 }
}
async function sendMessage(form){let text=String(new FormData(form).get('body')||'').trim();const command=text.startsWith('/')?applySlashCommand(text,form.dataset.kind):null;if(command?.error){toast(command.error,true);return}if(command?.handled){const field=form.querySelector('#message-box');if(field)field.value='';return}if(command?.text)text=command.text;let file=document.getElementById('message-file')?.files?.[0]||recordedVoice||null;if(!text&&!file)return;
 if(state.busy)return;const kind=form.dataset.kind,table=kind==='chat'?'messages':'piece_messages',target=state.selected,area=state.area;
 const original=text,replyId=replyTo?.id||null;const tmp=crypto.randomUUID();const pending={id:tmp,created_at:new Date().toISOString(),author_id:user.id,body:text,pending:true,conversation_id:kind==='chat'?target:null,piece_id:kind==='piece'?target:null,attachment_path:file?file.name:null,pendingFile:file?URL.createObjectURL(file):null,reply_to:replyId};
 const field=form.querySelector('#message-box');if(field)field.value='';localStorage.removeItem('tender-draft:'+user.id+':'+[area,target,kind==='piece'?'chat':state.pieceTab].join(':'));if(form.querySelector('#message-file'))form.querySelector('#message-file').value='';recordedVoice=null;replyTo=null;updateComposerReply();
 activeMessages.push(pending);syncActiveStream(true);document.getElementById('message-box')?.focus();
 await safe(async()=>{let attachment_path=null;try{
 if(file){const status=document.getElementById('file-status');if(status)status.textContent='Uploading attachment…';if(kind!=='chat')throw Error('Upload attachments in DMs/groups, or use the Gallery in Pieces.');if(file.size>5*1024*1024)throw Error('Maximum attachment size is 5 MB.');if(!['image/png','image/jpeg','image/webp','image/gif','application/pdf','audio/webm','audio/ogg','audio/mp4','audio/mpeg'].includes(file.type))throw Error('Unsupported file type.');attachment_path=`${target}/${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9_.-]/gi,'_')}`;assert(await db.storage.from('tender-chat').upload(attachment_path,file,{contentType:file.type,upsert:false}));}
 const record=kind==='chat'?{id:tmp,conversation_id:target,author_id:user.id,body:text,attachment_path}:{id:tmp,piece_id:target,author_id:user.id,body:text};
 if(replyId&&((kind==='chat'&&extendedReady)||(kind==='piece'&&pieceRepliesReady)))record.reply_to=replyId;
 const status=document.getElementById('file-status');if(status)status.textContent='Sending…';const result=assert(await q(table).insert(record).select('*').single());let pos=activeMessages.findIndex(m=>m.id===tmp);if(pos>=0)activeMessages[pos]=result;else if(state.selected===target&&state.area===area&&!activeMessages.some(m=>m.id===result.id))activeMessages.push(result);
 if(pending.pendingFile){URL.revokeObjectURL(pending.pendingFile)}if(status)status.textContent='Sent ✓';if(attachment_path)await prepareAttachmentUrls();if(state.selected===target&&state.area===area){syncActiveStream();document.getElementById('message-box')?.focus()}else scheduleReconcile(false);
 }catch(e){activeMessages=activeMessages.filter(m=>m.id!==tmp);if(pending.pendingFile)URL.revokeObjectURL(pending.pendingFile);if(state.selected===target&&state.area===area){replyTo=replyId?activeMessages.find(m=>m.id===replyId)||null:null;updateComposerReply();syncActiveStream();const field=document.getElementById('message-box');if(field)field.value=original;}throw e;}});
}
const galleryUrl=path=>db.storage.from('tender-gallery').getPublicUrl(path).data.publicUrl;
async function handleAction(el){const a=el.dataset.action,id=el.dataset.id,tab=el.dataset.tab;try{
 if(a==='account-menu-toggle'){
  const menu=document.getElementById('tender-account-menu');
  if(menu){menu.hidden=!menu.hidden;el.setAttribute('aria-expanded',String(!menu.hidden));}
  return;
 }
 if(a==='account-profile'){closeAccountMenu();await showProfile(user.id);return}
 if(a==='account-settings'){closeAccountMenu();state.settingsTab='profile';await goTo('settings');return}
 if(a==='account-copy-id'){
  closeAccountMenu();
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(user.id);toast('Your Tender user ID was copied. 🍗')}
  catch{modal('Copy your Tender ID','This identifies your account, not your password.',`<label class="field"><span>Your user ID</span><input class="input" id="tender-user-id-copy" readonly value="${esc(user.id)}"></label>`);document.getElementById('tender-user-id-copy')?.select();}
  return;
 }
 if(a==='account-switch'){
  closeAccountMenu();
  if(!await tenderConfirm('Switch Tender accounts?','Your current session will end on this device. Sign in using your other account to continue.','Switch accounts',false))return;
  await safe(async()=>{assert(await db.auth.signOut());unsub();reset();state.loginMode='login';renderAuth()});
  return;
 }
 if(a==='account-presence'){
  const value=String(el.dataset.value||'');
  if(!availability.some(x=>x[0]===value))return;
  if(!extendedReady)return toast('Presence settings require Tender account features.',true);
  await safe(async()=>{
   assert(await q('profiles').update({presence_mode:value}).eq('id',user.id));
   cacheUpdatedProfile({presence_mode:value});
   publishPresence().catch(console.warn);
   renderAccountDock(true);updatePresenceMarkers();
   toast('Status set to '+availability.find(x=>x[0]===value)[1]+'.');
  });
  return;
 }
 if(a==='account-mic'){
  const audio=audioPrefs();
  if(!audio.micMuted&&voiceRecorder?.state==='recording')return toast('Finish recording your voice note before muting the microphone.',true);
  audio.micMuted=!audio.micMuted;
  saveAudioPrefs(audio);renderAccountDock(false);
  toast(audio.micMuted?'Tender microphone muted for voice notes.':'Tender microphone ready for voice notes.');
  return;
 }
 if(a==='account-deafen'){
  const audio=audioPrefs();
  audio.deafened=!audio.deafened;saveAudioPrefs(audio);
  syncDeafenedAudio();renderAccountDock(false);
  toast(audio.deafened?'Tender sounds muted. 🔇':'Tender sounds enabled. 🔊');
  return;
 }
 if(a==='trivia-answer'){const box=document.getElementById('trivia-result');if(box){box.textContent=el.dataset.correct==='1'?'✅ Nice! Buffalo approves. 🍗':'Not quite! Try another round.';box.style.color=el.dataset.correct==='1'?'#70ddb6':'#ffad80';document.querySelectorAll('.trivia-answer').forEach(b=>b.disabled=true)}return}
  if(a==='insert-slash'||a==='insert-mention'){const field=document.getElementById('message-box');if(!field)return;if(a==='insert-slash')field.value='/'+el.dataset.command+' ';else field.value=field.value.replace(/@[a-z0-9_]*$/i,'@'+el.dataset.handle+' ');field.focus();updateComposerAssist(field);field.dispatchEvent(new Event('input',{bubbles:true}));return}
  if(a==='copy-piece-link'){invitePieceModal(selectedPiece());return}
  if(a==='copy-piece-invite'){
    const url=String(el.dataset.url||'');
    if(!url.startsWith('https://'))return toast('Secure HTTPS invitation links are required.',true);
    try{await navigator.clipboard.writeText(url);toast('Invitation copied! Send it to your friends. 🍗')}
    catch{const field=document.getElementById('invite-link');field?.focus();field?.select();toast('Select and copy the invitation link above.')}
    return;
  }
  if(a==='open-piece-invite'){
    const piece=pieces.find(p=>p.id===id&&p.is_public);
    if(!piece)return toast('This Piece invite is no longer available.',true);
    closeModal();await goTo(inPiece(piece.id)?'pieces':'discover',piece.id);return;
  }
  if(a==='insert-piece-invite'){
    const piece=pieces.find(p=>p.id===id&&p.is_public);
    if(!piece)return toast('This Piece invite is no longer available.',true);
    const url=pieceInviteURL(piece);closeModal();
    const field=document.getElementById('message-box');if(!field)return;
    field.value=(field.value.trim()?field.value.trim()+'\n':'')+url;
    field.focus();field.dispatchEvent(new Event('input',{bubbles:true}));
    toast('Invite inserted into your message.');return;
  }
  if(a==='room-appearance'){roomAppearanceModal();return}
  if(a==='export-theme'){const p=JSON.stringify({name:'Tender 0.3 theme',appearance:localPrefs()},null,2);const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([p],{type:'application/json'}));link.download='tender-theme.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),2500);toast('Theme saved locally!');return}
  if(a==='toggle-info'){const visible=localStorage.getItem('tender-info-hidden')==='1';localStorage.setItem('tender-info-hidden',visible?'0':'1');renderInfoPanel();return}
  if(a==='toggle-rail'){const expanded=localStorage.getItem('tender-rail-expanded')==='1';localStorage.setItem('tender-rail-expanded',expanded?'0':'1');document.getElementById('app-screen')?.classList.toggle('rail-expanded',!expanded);return}
  if(a==='open-profile-piece'){closeModal();await goTo('pieces',id);return}
   if(a==='open-profile'){await showProfile(id);return}
  if(a==='open-alerts'){alertsModal();return}
 if(a==='open-alert'){closeModal();if(el.dataset.cid)await goTo('chats',el.dataset.cid);else await goTo('friends');return}
 if(a==='confirm-yes'){settleConfirm(true);return}
  if(a==='confirm-no'){settleConfirm(false);return}
  if(a==='settings-tab'){state.settingsTab=el.dataset.tab||'profile';renderMain();return}
  if(a==='notification-permission'){
   if(!window.isSecureContext||typeof Notification==='undefined')return toast('HTTPS and browser notification support are required.',true);
   const perm=await Notification.requestPermission();
   if(perm==='granted')await ensureNotificationWorker();
   toast(perm==='granted'?'System notifications enabled! 🍗':perm==='denied'?'Notifications blocked in browser settings.':'Permission not granted.',perm!=='granted');
   renderMain();return;
 }
 if(a==='notification-test'){
   const ok=await emitSystemNotification('🍗 Tender notifications work!','You’ll see alerts for new messages and friend requests while Tender is open.','tender-notification-test');
   toast(ok?'Test notification sent! Check your system notifications.':'Could not display a notification. Check HTTPS and browser permissions.',!ok);return;
 }
 if(a==='emoji-picker'){emojiPicker();return}
 if(a==='emoji-insert'){const val=el.dataset.emoji;closeModal();const area=document.getElementById('message-box');if(area){area.value+=val;area.focus()}return}
 if(a==='custom-emoji'){customEmojiModal();return}
 if(a==='gif-picker'){gifModal();return}
 if(a==='new-poll'){if(!extendedReady)return toast('Run the 0.2 SQL migration first.',true);pollModal();return}
 if(a==='search'){searchModal();return}
 if(a==='bookmarks'){await openBookmarks();return}
 if(a==='blocked-list'){modal('Blocked users','Blocking stops DMs from that account.',`<div class="search-results">${blockedUsers.map(b=>`<button class="saved-row" data-action="toggle-block" data-id="${b.blocked_id}">Unblock ${esc(pby(b.blocked_id).display_name)}</button>`).join('')||'<p class="hint">Nobody blocked.</p>'}</div>`);return}
 if(a==='toggle-block'){if(!extendedReady)return;await safe(async()=>{const b=blockedUsers.find(x=>x.blocked_id===id);if(b){assert(await q('user_blocks').delete().eq('blocker_id',user.id).eq('blocked_id',id));toast('User unblocked.')}else{if(!await tenderConfirm('Block this user?','They will not be able to send you direct messages.','Block user'))return;assert(await q('user_blocks').insert({blocker_id:user.id,blocked_id:id}));toast('User blocked.')}await refreshExtras();closeModal();render()});return}
 if(a==='new-event'){eventModal();return}
 if(a==='pin-post'||a==='lock-post'){if(!extendedReady)return;await safe(async()=>{const post=activePosts.find(p=>p.id===id);if(!post)return;const key=a==='pin-post'?'pinned':'locked';assert(await q('piece_posts').update({[key]:!post[key]}).eq('id',id));post[key]=!post[key];renderMain();toast('Discussion updated!')});return}
 if(a==='piece-roles'){roleModal();return}
 if(a==='cancel-reply'){replyTo=null;updateComposerReply();document.getElementById('message-box')?.focus();return}
 if(a==='reply-message'){selectReply(id);return}
 if(a==='jump-latest'){const sc=document.querySelector('#main .chat-scroll');sc?.scrollTo({top:sc.scrollHeight,behavior:'smooth'});el.hidden=true;return}
  if(a==='jump-reply'){jumpToReply(id);return}
 if(a==='edit-message'){let m=activeMessages.find(x=>x.id===id);if(!m)return;modal('Edit message','Update your message.',`<form id="edit-message-form"><input name="id" type="hidden" value="${id}"><textarea name="body" class="input textarea" maxlength="4000" required>${esc(m.body)}</textarea><button class="btn full" type="submit">Save changes</button></form>`);return}
 if(a==='pin-message'){if(!extendedReady)return toast('Run the 0.2 SQL migration first.',true);await safe(async()=>{const m=activeMessages.find(x=>x.id===id);assert(await q('messages').update({is_pinned:!m.is_pinned}).eq('id',id));m.is_pinned=!m.is_pinned;renderMain()});return}
 if(a==='bookmark-message'){if(!extendedReady)return toast('Run the 0.2 SQL migration first.',true);await safe(async()=>{const b=bookmarks.find(x=>x.message_id===id);if(b){assert(await q('bookmarks').delete().eq('message_id',id).eq('user_id',user.id));bookmarks=bookmarks.filter(x=>x!==b)}else{assert(await q('bookmarks').insert({message_id:id,user_id:user.id}));bookmarks.push({message_id:id,user_id:user.id})}renderMain()});return}
 if(a==='forward-message'){let m=activeMessages.find(x=>x.id===id);if(!m)return;modal('Forward message','Forward text to another conversation. Attachments are not forwarded.',`<form id="forward-form"><input name="message_id" type="hidden" value="${id}"><select class="input" name="conversation_id">${conversations.filter(x=>x.id!==state.selected).map(c=>`<option value="${c.id}">${esc(namesFor(c))}</option>`).join('')}</select><button class="btn full" type="submit">Forward text</button></form>`);return}
 if(a==='poll-vote'){if(!extendedReady)return;await safe(async()=>{const poll=activePolls.find(p=>p.id===id);const index=Number(el.dataset.index);if(!poll||index<0||index>=poll.options.length)return;const existing=activePollVotes.find(v=>v.poll_id===id&&v.user_id===user.id);if(existing)existing.option_index=index;else activePollVotes.push({poll_id:id,user_id:user.id,option_index:index});renderMain();assert(await q('poll_votes').upsert({poll_id:id,user_id:user.id,option_index:index},{onConflict:'poll_id,user_id'}));await loadPolls();renderMain()});return}
 if(a==='record-voice'){await toggleVoiceRecording();return}
 if(a==='goto-piece-message'){closeModal();await goTo('pieces',el.dataset.cid);document.querySelector('[data-message-id="'+CSS.escape(id)+'"]')?.scrollIntoView({behavior:'smooth',block:'center'});return}
  if(a==='goto-message'){closeModal();await goTo('chats',el.dataset.cid);document.querySelector(`[data-message-id="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});return}
 if(a==='auth-tab'){state.loginMode=tab;renderAuth();return}
 if(a==='area'){await goTo(el.dataset.area);return}
 if(a==='go-back'){state.mobileDetail=false;state.selected=null;render();return}
 if(a==='open-chat'){await goTo('chats',id);return}
 if(a==='open-friend'){await goTo('friends',id);return}
 if(a==='open-piece'){await goTo(state.area==='discover'?'discover':'pieces',id);return}
 if(a==='piece-tab'){state.pieceTab=tab;await loadActive();renderMain();if(tab==='chat')subscribeTyping().catch(console.warn);else unsubTyping();return}
 if(a==='new-chat'){newChatModal();return}
 if(a==='new-piece'){newPieceModal();return}
 if(a==='edit-piece'){newPieceModal(selectedPiece());return}
 if(a==='find-friends'){findFriendsModal();return}
 if(a==='close-modal'){closeModal();return}
 if(a==='close-on-backdrop'){if(el===window.event?.target)closeModal();return}
 if(a==='new-post'){newPostModal();return}
 if(a==='new-gallery'){galleryModal();return}
 if(a==='open-post'){await postModal(id);return}
 if(a==='reaction-menu'){reactionModal(el.dataset.type,id);return}
 if(a==='chat-info'){chatInfo();return}
 if(a==='settings-profile'){closeModal();state.settingsTab='profile';await goTo('settings');return}
 if(a==='attach'){document.getElementById('message-file')?.click();return}
 if(a==='enlarge'){MODALS.innerHTML=`<div class="backdrop-img" data-action="close-modal"><img src="${esc(validUrl(el.dataset.src))}" alt="Gallery picture"></div>`;return}
 if(a==='open-attachment'){let url=assert(await db.storage.from('tender-chat').createSignedUrl(el.dataset.path,60)).signedUrl;window.open(validUrl(url),'_blank','noopener,noreferrer');return}
 if(a==='logout'){await safe(async()=>{assert(await db.auth.signOut());unsub();reset();renderAuth()});return}
 if(a==='start-dm')await safe(async()=>{let cid=assert(await db.rpc('start_dm',{other_id:id}));closeModal();await refreshData();await goTo('chats',cid)});
 if(a==='accept-friend')await safe(async()=>{assert(await q('friendships').update({status:'accepted'}).eq('id',id));await refreshData();render();toast('Friend request accepted!')});
 if(a==='remove-friend') {if(!await tenderConfirm('Remove friend?','They will be removed from your friends list. You can add them back later.','Remove friend'))return;await safe(async()=>{let f=friendships.find(f=>f.status==='accepted'&&[f.requester,f.recipient].includes(id));if(f)assert(await q('friendships').delete().eq('id',f.id));await refreshData();await goTo('friends');toast('Friend removed.')})}
 if(a==='join-piece')await safe(async()=>{assert(await db.rpc('join_piece',{pid:state.selected}));await refreshData();await loadActive();render();toast('Joined the Piece! 🍗')});
 if(a==='leave-piece'){if(ownPiece(state.selected)||!await tenderConfirm('Leave this Piece?','You will stop seeing its member-only messages unless you rejoin.','Leave Piece'))return;await safe(async()=>{assert(await db.rpc('leave_piece',{pid:state.selected}));await refreshData();render();toast('Left Piece.')})}
 if(a==='react'){const type=el.dataset.type, emoji=el.dataset.emoji;let existing=activeReactions.find(r=>r.target_type===type&&r.target_id===id&&r.author_id===user.id&&r.emoji===emoji);if(existing)activeReactions=activeReactions.filter(r=>r!==existing);else activeReactions.push({id:'pending-'+crypto.randomUUID(),author_id:user.id,target_type:type,target_id:id,emoji});closeModal();renderMain();safe(async()=>{try{if(existing)assert(await q('reactions').delete().eq('id',existing.id));else assert(await q('reactions').insert({author_id:user.id,target_type:type,target_id:id,emoji}));}catch(e){await loadActive();renderMain();throw e}});return}
 if(a==='delete-message'){if(!await tenderConfirm('Delete message?','This message will be removed for everyone who could see it. This cannot be undone.','Delete message'))return;await safe(async()=>{assert(await q(el.dataset.type==='message'?'messages':'piece_messages').delete().eq('id',id));await loadActive();renderMain()})}
 if(a==='delete-post'){if(!await tenderConfirm('Delete discussion?','This discussion and all of its replies will be permanently removed.','Delete discussion'))return;await safe(async()=>{assert(await q('piece_posts').delete().eq('id',id));await loadActive();renderMain()})}
 if(a==='delete-gallery'){if(!await tenderConfirm('Delete gallery image?','This entry will disappear from the Piece gallery.','Delete image'))return;await safe(async()=>{assert(await q('piece_gallery').delete().eq('id',id));await loadActive();renderMain()})}
 }catch(e){toast(e.message||'Could not complete action.',true);console.error(e)}}
async function submitForm(form){switch(form.id){
 case'auth-form':return authSubmit(form);
  case'embed-form':{const d=new FormData(form);const image=String(d.get('thumbnail')||'').trim();if(image&&(!/^https:\/\//i.test(image)||validUrl(image)==='#'))throw Error('Use a valid HTTPS thumbnail URL.');
    const payload={title:String(d.get('title')||'').trim(),description:String(d.get('description')||'').trim(),author:String(d.get('author')||'').trim(),color:String(d.get('color')||'#f47735'),thumbnail:image,footer:String(d.get('footer')||'').trim()};
    if(!payload.title||!payload.description)throw Error('Title and description are required.');
    const body='[TENDER_EMBED]'+JSON.stringify(payload);if(body.length>4000)throw Error('Announcement too long.');
    closeModal();const composer=document.getElementById('composer-form'),field=document.getElementById('message-box');
    if(!composer||!field){toast('Open a chat before sending an announcement.',true);return}
    field.value=body;composer.requestSubmit();return}
  case'room-appearance-form':{const d=new FormData(form),key=roomKey();if(!key)return;
    const wallpaper=String(d.get('wallpaper')||'none'),image=String(d.get('image')||'').trim();
    if(wallpaper==='image' && (!/^https:\/\//i.test(image)||validUrl(image)==='#'))throw Error('Choose an HTTPS image URL.');
    localStorage.setItem(key,JSON.stringify({wallpaper,image:image.slice(0,1200)}));closeModal();applyLocalAppearance();toast('Wallpaper saved!');return}
 case'composer-form':return sendMessage(form);
 case'friend-search-form':return safe(async()=>{let h=String(new FormData(form).get('handle')).trim().toLowerCase();let target=assert(await q('profiles').select('id,handle,display_name,avatar_url').eq('handle',h).maybeSingle());let res=document.getElementById('friend-search-results');if(!res)return;if(!target){res.innerHTML='<p class="notice-inline">No user with that username. Double-check their spelling.</p>';return}if(target.id===user.id){res.innerHTML='<p class="notice-inline">That\'s you, Buffalo! 🍗</p>';return}let f=friendships.find(f=>[f.requester,f.recipient].includes(user.id)&&[f.requester,f.recipient].includes(target.id));res.innerHTML=`<div class="friend-row">${profileFace(target)}<div class="friend-data">${profileName(target)}<p>@${esc(target.handle)}</p></div>${f?`<span class="tag">${esc(f.status)}</span>`:`<button class="btn sm" data-action="request-friend" data-id="${target.id}">Add friend</button>`}</div>`;return});
 case'group-form':return safe(async()=>{let data=new FormData(form),name=String(data.get('group_name')).trim(),members=data.getAll('member');let cid=assert(await db.rpc('start_group',{group_name:name,member_ids:members}));closeModal();await refreshData();await goTo('chats',cid);toast('Group created!')});
 case'piece-form':return safe(async()=>{
  const d=new FormData(form),name=String(d.get('name')||'').trim(),description=String(d.get('description')||'').trim();
  const color=String(d.get('color')||'#f47735'),is_public=d.get('visibility')==='public';
  const pieceId=String(d.get('piece_id')||'');
  const old=pieceId?pieces.find(p=>p.id===pieceId):null;
  if(pieceId&&(!old||old.owner_id!==user.id))throw Error('Only the Piece owner can edit this Piece.');
  const image=d.get('piece_pfp'),banner=d.get('banner');
  const mime=['image/png','image/jpeg','image/webp'];
  if(image?.size&&(image.size>3145728||!mime.includes(image.type)))throw Error('Choose a PNG, JPG or WEBP Piece picture under 3 MB.');
  if(banner?.size&&(banner.size>3145728||!mime.includes(banner.type)))throw Error('Choose a PNG, JPG or WEBP banner under 3 MB.');
  const emoji=String(d.get('icon_emoji')||'🍗').trim().slice(0,12)||'🍗';
  const mode=d.get('icon_mode');
  const updated={name,description,color,is_public};
  if(old){
    if(image?.size)updated.icon=(await uploadPublicAsset(image,'tender-banners',3145728,mime,'piece-avatar-'+old.id)).url;
    else if(mode==='emoji')updated.icon=emoji;
    if(extendedReady){
      updated.layout_style=d.get('layout_style')||'classic';
      updated.welcome_text=String(d.get('welcome_text')||'');
      if(banner?.size)updated.banner_url=(await uploadPublicAsset(banner,'tender-banners',3145728,mime,'piece-banner-'+old.id)).url;
    }
    assert(await q('pieces').update(updated).eq('id',old.id).eq('owner_id',user.id));
    toast('Piece updated! 🍗');
  }else{
    const id=assert(await db.rpc('create_piece',{piece_name:name,piece_description:description,piece_color:color,piece_public:is_public}));
    state.selected=id;state.area='pieces';state.pieceTab='chat';
    if(image?.size||mode==='emoji'||emoji!=='🍗'){
      try{
        const icon=image?.size?(await uploadPublicAsset(image,'tender-banners',3145728,mime,'piece-avatar-'+id)).url:emoji;
        assert(await q('pieces').update({icon}).eq('id',id).eq('owner_id',user.id));
      }catch(e){console.warn('Piece picture could not be set:',e);toast('Piece created, but the picture was not saved. You can retry in Edit Piece.',true)}
    }
    toast('Piece created! 🍗');
  }
  closeModal();await refreshData();await loadActive();render();
});
 case'post-form':return safe(async()=>{let d=new FormData(form);assert(await q('piece_posts').insert({piece_id:state.selected,author_id:user.id,title:String(d.get('title')).trim(),body:String(d.get('body')).trim(),...(extendedReady?{tags:String(d.get('tags')||'').split(',').map(x=>x.trim().replace(/[^a-z0-9_-]/gi,'').slice(0,24)).filter(Boolean).slice(0,5)}:{})}));closeModal();await loadActive();renderMain();toast('Discussion published!')});
 case'reply-form':return safe(async()=>{assert(await q('piece_comments').insert({post_id:selectedPost.id,author_id:user.id,body:String(new FormData(form).get('body')).trim()}));await postModal(selectedPost.id);toast('Reply posted!')});
 case'gallery-form':return safe(async()=>{let d=new FormData(form),file=d.get('file');if(!file?.size||file.size>5*1024*1024||!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))throw Error('Choose a PNG/JPG/WEBP/GIF under 5 MB.');let path=`${state.selected}/${user.id}/${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`;assert(await db.storage.from('tender-gallery').upload(path,file,{contentType:file.type}));try{assert(await q('piece_gallery').insert({piece_id:state.selected,author_id:user.id,image_path:path,caption:String(d.get('caption')).trim()}))}catch(e){await db.storage.from('tender-gallery').remove([path]);throw e}closeModal();await loadActive();renderMain();toast('Image uploaded!')});
 case'profile-form':return safe(async()=>{
  const d=new FormData(form),upd={
    display_name:String(d.get('display_name')||'').trim().slice(0,40),
    bio:String(d.get('bio')||'').trim().slice(0,220),
    game_status:String(d.get('game_status')||'').trim().slice(0,90)
  };
  if(!upd.display_name)throw Error('Please enter a display name.');
  if(extendedReady)upd.status_emoji=String(d.get('status_emoji')||'🍗').slice(0,12);
  if(pronounsReady)upd.pronouns=String(d.get('pronouns')||'').trim().slice(0,40);
  const saved=assert(await q('profiles').update(upd).eq('id',user.id).select('*').single());
   if(!saved)throw Error('Unable to verify the saved profile. Please try again.');
   cacheUpdatedProfile(saved);
   // Keep the live form, caret, settings section and scroll position intact.
   updateSavedProfilePreview();
   renderSidebar();
   toast('Profile saved! 🍗');
});
 case'preferences-form':
 case'notification-preferences-form':
 case'privacy-preferences-form':return safe(async()=>{
   if(!extendedReady)throw Error('Notification and privacy preferences require the Tender 0.2 schema.');
   const d=new FormData(form),upd={};
   if(form.id==='preferences-form'){
    upd.chat_theme=d.get('chat_theme');upd.accent_color=d.get('accent_color');upd.profile_effect=d.get('profile_effect');
   }else if(form.id==='notification-preferences-form'){
    upd.notification_mode=d.get('notification_mode');upd.notification_sound=d.get('notification_sound')==='yes';upd.notification_tone=d.get('notification_tone')||'pop';
   }else{upd.presence_mode=d.get('presence_mode')}
   assert(await q('profiles').update(upd).eq('id',user.id));
   cacheUpdatedProfile(upd);applyTheme();toast('Preferences saved! 🍗');
 });
 case'edit-message-form':return safe(async()=>{const d=new FormData(form),id=String(d.get('id')),body=String(d.get('body')).trim();assert(await q('messages').update({body,edited_at:new Date().toISOString()}).eq('id',id));closeModal();await loadActive();renderMain();toast('Message edited.')});
 case'forward-form':return safe(async()=>{const d=new FormData(form),id=String(d.get('message_id')),cid=String(d.get('conversation_id'));if(!cid)throw Error('Choose a conversation');const m=activeMessages.find(x=>x.id===id);if(!m)throw Error('Message no longer available');assert(await q('messages').insert({conversation_id:cid,author_id:user.id,body:'↗ Forwarded: '+m.body}));closeModal();toast('Message forwarded!')});
 case'gif-form':{const u=String(new FormData(form).get('url')).trim();if(!giftGif(u))return toast('Use a direct media.giphy.com or media.tenor.com GIF image URL.',true);closeModal();const field=document.getElementById('message-box');if(field){field.value=(field.value?field.value+'\n':'')+u;field.focus();}return}
 case'global-search-form':return safe(async()=>{
    const d=new FormData(form),term=String(d.get('text')||'').trim();if(term.length<2)return;
    const scope=String(d.get('scope')||'all'),author=String(d.get('author')||'').trim().replace(/^@/,'').toLowerCase();
    const after=String(d.get('after')||''),before=String(d.get('before')||'');
    const authorId=author?profiles.find(p=>p.handle?.toLowerCase()===author)?.id:null;
    const box=document.getElementById('search-results');if(!box)return;
    if(author&&!authorId){box.innerHTML='<p class="hint">That username was not found in your loaded profiles.</p>';return}
    const table=scope==='pieces'?'piece_messages':'messages';
    let query=q(table).select(scope==='pieces'?'id,body,created_at,piece_id,author_id':'id,body,created_at,conversation_id,author_id,attachment_path');
    query=query.ilike('body','%'+term.replace(/[%,_]/g,'')+'%');
    if(scope==='current'&&state.area==='chats'&&state.selected)query=query.eq('conversation_id',state.selected);
    if(authorId)query=query.eq('author_id',authorId);
    if(/^\d{4}-\d{2}-\d{2}$/.test(after))query=query.gte('created_at',after+'T00:00:00');
    if(/^\d{4}-\d{2}-\d{2}$/.test(before))query=query.lte('created_at',before+'T23:59:59');
    if(scope!=='pieces'&&d.get('attachments')==='yes')query=query.not('attachment_path','is',null);
    const res=assert(await query.order('created_at',{ascending:false}).limit(75))||[];
    box.innerHTML=res.map(m=>{
      const piece=scope==='pieces',place=piece?pieces.find(p=>p.id===m.piece_id):getConversation(m.conversation_id);
      const name=piece?place?.name||'Piece':place?namesFor(place):'Conversation';
      return `<button data-action="${piece?'goto-piece-message':'goto-message'}" data-id="${esc(m.id)}" data-cid="${esc(piece?m.piece_id:m.conversation_id)}" class="saved-row"><strong>${esc(name)} · ${esc(pby(m.author_id).display_name)}</strong><small>${esc(new Date(m.created_at).toLocaleString())}</small><span>${esc((m.body||'').slice(0,170))}</span></button>`;
    }).join('')||'<p class="hint">No matching messages found.</p>';
  });
 case'poll-form':return safe(async()=>{const d=new FormData(form),options=[1,2,3,4].map(i=>String(d.get('option'+i)||'').trim()).filter(Boolean);if(options.length<2)throw Error('Add at least two options');let poll=assert(await q('polls').insert({conversation_id:state.selected,author_id:user.id,question:String(d.get('question')).trim(),options}).select('*').single());assert(await q('messages').insert({conversation_id:state.selected,author_id:user.id,body:'📊 '+poll.question,poll_id:poll.id}));closeModal();await loadActive();renderMain();toast('Poll sent!')});
 case'custom-emoji-form':return safe(async()=>{const d=new FormData(form),file=d.get('file'),code=String(d.get('shortcode')).trim().toLowerCase();if(!/^[a-z0-9_]{2,24}$/.test(code))throw Error('Invalid shortcode');const pic=await uploadPublicAsset(file,'tender-emoji',262144,['image/png','image/webp','image/gif'],'emoji');assert(await q('custom_emojis').insert({owner_id:user.id,shortcode:code,image_path:pic.path,piece_id:d.get('piece')==='on'?state.selected:null}));closeModal();await refreshExtras();toast('Emoji added! Type :'+code+': to send it.')});
 case'event-form':return safe(async()=>{const d=new FormData(form);assert(await q('piece_events').insert({piece_id:state.selected,creator_id:user.id,title:String(d.get('title')).trim(),description:String(d.get('description')).trim(),starts_at:new Date(String(d.get('starts_at'))).toISOString()}));closeModal();await refreshExtras();renderMain();toast('Event created!')});
 case'role-form':return safe(async()=>{const d=new FormData(form);assert(await q('piece_roles').insert({piece_id:state.selected,name:String(d.get('name')).trim(),color:String(d.get('color'))}));closeModal();await refreshExtras();toast('Role created!')});
 }}
// Drag either separator directly; widths persist on pointer release. Keyboard arrows supported.
const splitterSpec={
 sidebar:{min:210,max:420,initial:270,key:'tender-sidebar-width',property:'--tender-sidebar-width'},
 info:{min:190,max:430,initial:248,key:'tender-info-width',property:'--tender-info-width'}
};
function readSplitWidth(which){
 const spec=splitterSpec[which];if(!spec)return 270;
 const stored=Number(localStorage.getItem(spec.key));
 return Number.isFinite(stored)&&stored>=spec.min&&stored<=spec.max?stored:spec.initial;
}
function updateSplitWidth(which,value,save=false){
 const spec=splitterSpec[which];if(!spec)return;
 const screen=document.getElementById('app-screen');if(!screen)return;
 const available=Math.max(spec.min,window.innerWidth-(which==='sidebar'?630:700));
 const width=Math.round(Math.min(spec.max,available,Math.max(spec.min,value)));
 screen.style.setProperty(spec.property,width+'px');
 const handle=screen.querySelector('[data-split="'+which+'"]');
 if(handle)handle.setAttribute('aria-valuenow',String(width));
 if(save)localStorage.setItem(spec.key,String(width));
 return width;
}
let dragSplit=null;
document.addEventListener('pointerdown',event=>{
 const handle=event.target.closest?.('[data-split]');if(!handle||event.button!==0)return;
 const which=handle.dataset.split,screen=document.getElementById('app-screen');
 if(!screen||window.matchMedia('(max-width:760px)').matches)return;
 const spec=splitterSpec[which];
 dragSplit={which,pointerId:event.pointerId,startX:event.clientX,initial:parseFloat(getComputedStyle(screen).getPropertyValue(spec.property))||readSplitWidth(which)};
 handle.setPointerCapture?.(event.pointerId);
 handle.classList.add('dragging');document.body.classList.add('tender-dragging');
 event.preventDefault();
});
document.addEventListener('pointermove',event=>{
 if(!dragSplit||event.pointerId!==dragSplit.pointerId)return;
 const delta=event.clientX-dragSplit.startX;
 updateSplitWidth(dragSplit.which,dragSplit.initial+(dragSplit.which==='info'?-delta:delta));
});
function endSplitDrag(event){
 if(!dragSplit||event.pointerId!==dragSplit.pointerId)return;
 const which=dragSplit.which,handle=document.querySelector('[data-split="'+which+'"]');
 const screen=document.getElementById('app-screen');
 if(screen){
  const current=parseFloat(getComputedStyle(screen).getPropertyValue(splitterSpec[which].property));
  updateSplitWidth(which,current,true);
 }
 if(handle?.hasPointerCapture?.(event.pointerId))handle.releasePointerCapture(event.pointerId);
 handle?.classList.remove('dragging');document.body.classList.remove('tender-dragging');dragSplit=null;
}
document.addEventListener('pointerup',endSplitDrag);
document.addEventListener('pointercancel',endSplitDrag);
document.addEventListener('dblclick',event=>{
 const handle=event.target.closest?.('[data-split]');if(handle)updateSplitWidth(handle.dataset.split,splitterSpec[handle.dataset.split].initial,true);
});
document.addEventListener('submit',event=>{if(event.target.matches('form')){event.preventDefault();submitForm(event.target).catch(e=>{console.error(e);toast(e.message||'Error',true)})}});
document.addEventListener('click',event=>{if(!event.target.closest?.('.sidebar-account-dock'))closeAccountMenu();let t=event.target.closest('[data-action]');if(!t)return;if(t.dataset.action==='close-on-backdrop'&&event.target!==t)return;if(t.dataset.action==='request-friend'){safe(async()=>{assert(await q('friendships').insert({requester:user.id,recipient:t.dataset.id,status:'pending'}));toast('Friend request sent!');await refreshData();closeModal();render()});return}handleAction(t)});
document.addEventListener('input',e=>{if(e.target.id==='message-box'&&user&&state.selected){const key='tender-draft:'+user.id+':'+[state.area,state.selected,state.pieceTab].join(':');if(e.target.value)localStorage.setItem(key,e.target.value);else localStorage.removeItem(key);updateComposerAssist(e.target)}if(e.target.id==='message-box')broadcastTyping();if(e.target.id==='sidebar-search'){const start=e.target.selectionStart,end=e.target.selectionEnd;state.search=e.target.value;renderSidebar();const input=document.getElementById('sidebar-search');input?.focus();input?.setSelectionRange(start,end)}});
// Type-to-chat works like a desktop messenger: printable keystrokes land
// in the current composer, never in settings or behind an open modal.
document.addEventListener('keydown',event=>{
 if(event.defaultPrevented||event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return;
 if(event.key.length!==1||event.target?.closest?.('input,textarea,select,button,[contenteditable="true"],[role="dialog"]'))return;
 if(document.getElementById('modal-root')?.children?.length)return;
 if(!user||!state.selected||!(state.area==='chats'||(['pieces','discover'].includes(state.area)&&state.pieceTab==='chat')))return;
 const field=document.getElementById('message-box');
 if(!field||field.disabled||!field.isConnected||field.getClientRects().length===0)return;
 event.preventDefault();
 field.focus();
 const caret=Number.isInteger(field.selectionStart)?field.selectionStart:field.value.length;
 const end=Number.isInteger(field.selectionEnd)?field.selectionEnd:caret;
 field.setRangeText(event.key,caret,end,'end');
 field.dispatchEvent(new Event('input',{bubbles:true}));
});
if('serviceWorker' in navigator){
 navigator.serviceWorker.addEventListener('message',event=>{
  if(event.data?.type==='tender-notification-open'&&user&&event.data.conversationId&&conversations.some(c=>c.id===event.data.conversationId)){
   goTo('chats',event.data.conversationId).catch(console.warn);
  }
 });
}
document.addEventListener('keydown',e=>{
 if(e.target?.matches?.('[data-split]')&&['ArrowLeft','ArrowRight','Home'].includes(e.key)){
   e.preventDefault();const which=e.target.dataset.split,spec=splitterSpec[which],dir=which==='info'?-1:1;
   const value=e.key==='Home'?spec.initial:readSplitWidth(which)+dir*(e.key==='ArrowRight'?16:-16);
   updateSplitWidth(which,value,true);return;
 }
 if(e.key==='Escape'){closeAccountMenu();closeModal()}if(e.key==='Enter'&&!e.shiftKey&&e.target.id==='message-box'){e.preventDefault();e.target.closest('form')?.requestSubmit()}if(e.key==='Enter'&&e.target.getAttribute('role')==='button')e.target.click()});
document.addEventListener('change',e=>{
  if(e.target.id==='tender-theme-import'){
    const file=e.target.files?.[0];if(!file)return;
    if(file.size>16384)return toast('Theme file is too large (max 16 KB).',true);
    file.text().then(raw=>{
      const decoded=JSON.parse(raw);if(!decoded||typeof decoded.appearance!=='object'||!decoded.appearance)throw Error('Invalid Tender theme');
      const src=decoded.appearance,p={};
      if(['minimal','compact','cozy'].includes(src.density))p.density=src.density;
      if(['sunset','violet','ocean','forest','rose'].includes(src.gradient))p.gradient=src.gradient;
      if(/^#[0-9a-f]{6}$/i.test(src.accent2||''))p.accent2=src.accent2;
      if(Number.isFinite(Number(src.fontSize)))p.fontSize=Math.min(118,Math.max(86,Number(src.fontSize)));
      p.reduceMotion=src.reduceMotion===true;
      localStorage.setItem('tender-0.3-appearance',JSON.stringify(p));applyLocalAppearance();renderMain();toast('Theme imported!');
    }).catch(()=>toast('Could not load this theme file.',true));
    return
  }
  if(e.target.matches('.tender-local-pref')){const p=localPrefs(),k=e.target.name;p[k]=k==='fontSize'?Number(e.target.value):k==='reduceMotion'?e.target.value==='yes':e.target.value;localStorage.setItem('tender-0.3-appearance',JSON.stringify(p));applyLocalAppearance();return}
  
 if(e.target.id==='piece-pfp-file'){
   const file=e.target.files?.[0],preview=document.getElementById('piece-pfp-preview'),image=document.getElementById('piece-pfp-preview-img');
   if(preview&&image){if(image.dataset.previewUrl)URL.revokeObjectURL(image.dataset.previewUrl);
     const ok=file&&file.size<=3145728&&['image/png','image/jpeg','image/webp'].includes(file.type);
     preview.hidden=!ok;if(ok){const url=URL.createObjectURL(file);image.src=url;image.dataset.previewUrl=url;}
     if(file&&!ok)toast('Choose a PNG/JPG/WEBP under 3 MB.',true);
   }
   return;
 }
 if(e.target.id==='avatar-file'||e.target.id==='banner-file'){
 const file=e.target.files[0];if(!file)return;safe(async()=>{const isAvatar=e.target.id==='avatar-file';const asset=await uploadPublicAsset(file,isAvatar?'tender-avatars':'tender-banners',isAvatar?2097152:3145728,['image/png','image/jpeg','image/webp'],isAvatar?'avatar':'banner');assert(await q('profiles').update(isAvatar?{avatar_url:asset.url}:{banner_url:asset.url}).eq('id',user.id));await refreshData();render();toast(isAvatar?'Profile picture updated!':'Banner updated!')});}
 if(e.target.id==='message-file'){const label=document.getElementById('file-status');if(label)label.textContent=e.target.files?.[0]?`📎 ${e.target.files[0].name}`:''}
 if(e.target.matches('.core-role-change')&&e.target.value){const uid=e.target.dataset.person,role=e.target.value;safe(async()=>{assert(await db.rpc('set_piece_member_role',{pid:state.selected,uid,new_role:role}));await refreshData();toast('Member role updated!')})}
 if(e.target.matches('.role-assign')&&e.target.value){const role=e.target.dataset.role;const userId=e.target.value;safe(async()=>{assert(await q('piece_role_assignments').insert({role_id:role,user_id:userId}));toast('Role assigned!')})}
});
let dragDepth=0;
document.addEventListener('play',e=>{if(audioPrefs().deafened&&e.target?.matches?.('audio,video'))syncDeafenedAudio()},true);
document.addEventListener('scroll',e=>{if(!e.target?.matches?.('.chat-scroll'))return;const pill=document.getElementById('chat-jump-new');if(pill&&e.target.scrollHeight-e.target.scrollTop-e.target.clientHeight<55)pill.hidden=true},true);
document.addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files')&&document.querySelector('#composer-form')){e.preventDefault();document.body.classList.add('dragover')}});
document.addEventListener('dragleave',e=>{if(e.relatedTarget===null)document.body.classList.remove('dragover')});
document.addEventListener('drop',e=>{if(!document.querySelector('#composer-form'))return;e.preventDefault();document.body.classList.remove('dragover');const file=e.dataTransfer?.files?.[0],input=document.getElementById('message-file');if(file&&input){const transfer=new DataTransfer();transfer.items.add(file);input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}))}});
async function toggleVoiceRecording(){
 if(voiceRecorder&&voiceRecorder.state==='recording'){voiceRecorder.stop();return}
 if(audioPrefs().micMuted){toast('Your Tender microphone is muted. Unmute it in your account dock to record a voice note.',true);return}
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){toast('Voice recording unavailable in this browser.',true);return}
 try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});voiceChunks=[];const mime=['audio/webm','audio/ogg','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t));voiceRecorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);voiceRecorder.ondataavailable=e=>{if(e.data?.size)voiceChunks.push(e.data)};
 voiceRecorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const type=voiceRecorder.mimeType||'audio/webm',extension=type.includes('ogg')?'ogg':type.includes('mp4')?'mp4':'webm';const blob=new Blob(voiceChunks,{type});if(blob.size>5*1024*1024){toast('Voice note too large. Maximum 5 MB.',true);return}recordedVoice=new File([blob],'Voice-message.'+extension,{type});const label=document.getElementById('file-status');if(label)label.textContent='🎙️ Voice note ready. Press Send!';toast('Voice note ready!')};voiceRecorder.start();const label=document.getElementById('file-status');if(label)label.textContent='🔴 Recording… press microphone again to stop.';
 }catch(e){toast('Microphone access failed: '+e.message,true)}
}
boot();
})();