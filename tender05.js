/* Tender 0.5 client-side content helpers. No dependencies and no third-party network services. */
(function(){
 'use strict';
 const emoji={
  sob:'😭',cry:'😢',joy:'😂',laughing:'😆',rofl:'🤣',skull:'💀',fire:'🔥',
  heart:'❤️',orange_heart:'🧡',yellow_heart:'💛',green_heart:'💚',blue_heart:'💙',
  purple_heart:'💜',broken_heart:'💔',eyes:'👀',clown:'🤡',thinking:'🤔',
  smile:'🙂',slight_smile:'🙂',grinning:'😀',blush:'😊',wink:'😉',smirk:'😏',
  angry:'😠',rage:'🤬',scream:'😱',pleading:'🥺',pray:'🙏',thumbsup:'👍',
  thumbsdown:'👎',wave:'👋',ok_hand:'👌',100:'💯',star:'⭐',sparkles:'✨',
  chicken:'🐔',poultry_leg:'🍗',buffalo:'🦬',cat:'🐱',dog:'🐶',pizza:'🍕',
  nerd:'🤓',sleep:'😴',yawn:'🥱',sunglasses:'😎',party:'🥳',confetti_ball:'🎊',
  warning:'⚠️',check:'✅',x:'❌',robot:'🤖',ghost:'👻',poop:'💩',
  skull_crossbones:'☠️',imp:'👿',smiling_imp:'😈',question:'❓',
  gg:'🎮',video_game:'🎮',music:'🎵',microphone:'🎤',headphones:'🎧'
 };
 const faces={'>:)':'😈','>:(':'👿',':)':'🙂',':(':'🙁',':D':'😃',':P':'😛',':p':'😛',';)':'😉','<3':'❤️',':/':'😕',':O':'😮',':o':'😮'};
 const faceRe=/(^|\s)(>:\)|>:\(|:\)|:\(|:D|:P|:p|;\)|<3|:\/|:O|:o)(?=\s|$|[.,!?])/g;
 const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function expand(text,emoticons){
  return String(text||'').split(/(https?:\/\/[^\s]+|`[^`]*`)/gi).map((part,i)=>{
   if(/^(https?:\/\/|`)/i.test(part))return part;
   let s=part.replace(/:([a-z0-9_+-]{2,32}):/gi,(whole,name)=>emoji[name.toLowerCase()]||whole);
   if(emoticons)s=s.replace(faceRe,(_,prefix,face)=>prefix+(faces[face]||face));
   return s;
  }).join('');
 }
 function suggestions(query){
  const needle=String(query||'').replace(/^:/,'').toLowerCase();
  return Object.entries(emoji).filter(([name])=>name.includes(needle)).slice(0,12).map(([name,glyph])=>({name,glyph}));
 }
 // srcdoc iframe deliberately has an opaque origin, no JavaScript, no forms,
 // no external loads, no clipboard, no popups and no top-level navigation.
 // CSS is allowed but only INSIDE the isolated embed; message HTML never reaches Tender's DOM.
 function embedDoc(data){
  const html=String(data?.html||'').slice(0,2700);
  const css=String(data?.css||'').slice(0,1200).replace(/<\/style/gi,'<\\/style');
  const policy="default-src 'none'; script-src 'none'; connect-src 'none'; img-src 'none'; font-src 'none'; media-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'; style-src 'unsafe-inline'";
  return '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+policy+'">'+
   '<meta name="referrer" content="no-referrer"><style>html,body{margin:0;padding:8px;background:transparent;color:#f6f7fa;font:14px system-ui,sans-serif;overflow:auto}*{box-sizing:border-box}a{pointer-events:none}'+css+'</style></head><body>'+html+'</body></html>';
 }
 function renderEmbed(payload){
  try{
   const data=typeof payload==='string'?JSON.parse(payload):payload;
   if(typeof data.html!=='string'||typeof data.css!=='string')throw Error('bad payload');
   const doc=embedDoc(data);
   return '<div class="tender-html-embed"><div class="tender-html-embed-head">🍗 HTML + CSS Embed · Scripts disabled</div>'+
    '<iframe sandbox="" loading="lazy" referrerpolicy="no-referrer" tabindex="-1" title="Sandboxed visual message embed" srcdoc="'+escape(doc)+'"></iframe></div>';
  }catch{
   return '<div class="notice-inline">This HTML embed could not be displayed.</div>';
  }
 }
 const stickerPresets=[
  {name:"Crispy Buffalo",emoji:"🍗"},{name:"Fire",emoji:"🔥"},{name:"Skull",emoji:"💀"},
  {name:"Tears",emoji:"😭"},{name:"Purple Heart",emoji:"💜"},{name:"Hype",emoji:"🥳"},
  {name:"Cat",emoji:"🐱"},{name:"Chicken",emoji:"🐔"},{name:"Star",emoji:"⭐"}
 ];
 function renderSticker(text,getImageUrl){
  try{
   const p=JSON.parse(text),e=Array.from(String(p.emoji||'')).slice(0,8).join(''),label=String(p.name||'Sticker').slice(0,40);
   const path=String(p.image_path||'');
   const trustedPath=/^[0-9a-f-]{36}\/sticker-[0-9a-f-]{36}\.(?:png|webp|gif)$/i.test(path);
   const imageUrl=trustedPath&&typeof getImageUrl==='function'?String(getImageUrl(path)||''):'';
   const rendered=imageUrl&&/^https:\/\//i.test(imageUrl)?
    '<img src="'+escape(imageUrl)+'" loading="lazy" alt="'+escape(label)+'" class="tender-sticker-image">':
    '<span aria-hidden="true">'+escape(e||'🍗')+'</span>';
   return '<div class="tender-sticker" title="'+escape(label)+'">'+rendered+'<small>'+escape(label)+'</small></div>';
  }catch{return '<div class="notice-inline">Sticker unavailable.</div>'}
 }
 window.Tender05=Object.freeze({emoji,expand,suggestions,escape,embedDoc,renderEmbed,renderSticker,stickerPresets});
})();
