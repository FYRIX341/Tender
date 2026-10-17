/* Tender 0.3.2 — notification event handler.
   This worker intentionally does not cache login HTML, auth tokens, or private data.
   Showing alerts while Tender is open does not constitute closed-browser push.
*/
'use strict';
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=event.notification.data?.conversationId;
 event.waitUntil((async()=>{
   const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   const appUrl=new URL('./',self.registration.scope);
   if(target && /^[0-9a-f-]{36}$/i.test(target))appUrl.searchParams.set('chat',target);
   const match=clientsList.find(client=>{
     try{return new URL(client.url).origin===appUrl.origin}catch{return false}
   });
   if(match){
     if(match.focus)await match.focus();
     match.postMessage({type:'tender-notification-open',conversationId:target||null});
   }else if(self.clients.openWindow){
     await self.clients.openWindow(appUrl.href);
   }
 })());
});
