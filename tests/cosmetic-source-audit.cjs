'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const PIN='725b093e18dab57961c652691f13450db46881f7';
const BASE='https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/'+PIN+'/static/';
const names=['collectible_desc','premium_item_desc','item_desc','quest_chain_desc','stage_rewards_desc','achievement_desc','traveler_trade_order_desc','traveler_task_desc','crafting_recipe_desc'];
async function fetchJson(n){
 const r=await fetch(BASE+n+'.json',{signal:AbortSignal.timeout(40000)});
 if(!r.ok)throw Error(n+': '+r.status);return r.json();
}
(async()=>{
 const results=await Promise.all(names.map(fetchJson));const d=Object.fromEntries(names.map((name,i)=>[name,results[i]]));
 const {collectible_desc:C,premium_item_desc:P,item_desc:I,quest_chain_desc:Q,stage_rewards_desc:SR,achievement_desc:A,traveler_trade_order_desc:V,traveler_task_desc:TT,crafting_recipe_desc:R}=d;
 const itemMap=new Map(I.map(x=>[x.id,x]));
 const premiumIds=new Set(P.flatMap(p=>p.collectible_ids||[]).map(Number));
 const questItems=new Set(Q.flatMap(q=>[...(q.rewards||[]),...(q.implicit_rewards||[])].map(x=>x?.ItemStack_?.item_id).filter(Boolean)));
 for(const s of SR)for(const x of s.rewards||[])questItems.add(x.item_id);
 const traderItems=new Set(V.flatMap(v=>(v.offer_items||[]).map(x=>x.item_id)));
 const taskItems=new Set(TT.flatMap(v=>(v.rewarded_items||[]).map(x=>x.item_id)));
 const craftedItems=new Set(R.flatMap(r=>(r.crafted_item_stacks||[]).filter(x=>x.item_type!=='Cargo').map(x=>x.item_id)));
 const achieveIds=new Set(A.flatMap(a=>(a.collectible_rewards||[]).map(x=>typeof x==='number'?x:(x?.id??x?.collectible_id??0))));
 const counts={};const examples={};const byCat={};
 for(const c of C){
   const cat=c.collectible_type||'OTHER';const item=itemMap.get(c.item_deed_id);
   const premium=premiumIds.has(c.id);
   const routes=[questItems.has(c.item_deed_id)?'quest':'',traderItems.has(c.item_deed_id)?'trade':'',taskItems.has(c.item_deed_id)?'task':'',craftedItems.has(c.item_deed_id)?'craft':'',achieveIds.has(c.id)?'achievement':''].filter(Boolean);
   const status=premium?'PREMIUM':routes.length?'INGAME':'UNTRACED';
   const k=cat+' '+status;counts[k]=(counts[k]||0)+1;
   if(!examples[k])examples[k]=[];
   if(examples[k].length<7)examples[k].push({id:c.id,name:c.name,deed:c.item_deed_id,deedName:item?.name,routes});
   if(!byCat[cat])byCat[cat]={total:0,premium:0,ingame:0,unknown:0};
   byCat[cat].total++;
   byCat[cat][premium?'premium':routes.length?'ingame':'unknown']++;
 }
 console.log('AUDIT PIN',PIN,'ROWS',Object.fromEntries(names.map((n,i)=>[n,results[i].length])));
 console.log('BY TYPE',JSON.stringify(Object.entries(byCat).sort((a,b)=>b[1].total-a[1].total)));
 console.log('SAMPLE BY STATUS',JSON.stringify(examples));
 console.log('TWITCH NAME MATCHES',JSON.stringify(C.filter(x=>/awakened wolf|twitch|stream|drop/i.test(x.name)).slice(0,30).map(x=>({id:x.id,name:x.name,premium:premiumIds.has(x.id)}))));
 const itemC=C.filter(c=>questItems.has(c.item_deed_id)&&!premiumIds.has(c.id)).slice(0,14);
 console.log('QUEST-GRANTED NONPREMIUM',JSON.stringify(itemC.map(x=>({id:x.id,name:x.name,deed:x.item_deed_id}))));

 const h=fs.readFileSync('index.html','utf8');
 const src=h.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 const stop=src.indexOf(" $('tbody').addEventListener('change'");
 if(!src||stop<0)throw Error('Cannot isolate production catalog');
 const sandbox={console};vm.runInNewContext(src.slice(0,stop)+"\n globalThis.__auditCatalog=makeCatalog;\n})();",sandbox,{timeout:10000});
 const catalog=sandbox.__auditCatalog(d).records;
 const cos=catalog.filter(x=>x.kind==='collectible');
 const leakedPremium=cos.filter(c=>premiumIds.has(Number(c.key.slice(2))));
 if(leakedPremium.length)throw Error('Premium collectible leak: '+JSON.stringify(leakedPremium.slice(0,6)));
 const unknown=cos.filter(x=>!x.inGameEvidence||!(x.sources||[]).some(z=>['Récompense de quête','Échange voyageur','Tâche de voyageur','Fabrication','Succès'].includes(z.type)));
 if(unknown.length)throw Error('Unverified collectible leak: '+JSON.stringify(unknown.slice(0,6)));
 const cids=new Set(cos.map(x=>Number(x.key.slice(2))));
 const mustKeep=[304,315153795,861825712,300545610,174699389]; // quest mask, quest emote, quest pet, trader hair color, quest cape
 const mustRemove=[4221595,671996935,2916289,16000000]; // premium outfit, Twitch boots, PremiumItem, automatic profession title
 for(const id of mustKeep)if(!cids.has(id))throw Error('Expected game-sourced collectible missing: '+id+' '+C.find(x=>x.id===id)?.name);
 for(const id of mustRemove)if(cids.has(id))throw Error('Disallowed cosmetic included: '+id+' '+C.find(x=>x.id===id)?.name);
 const typeCounts={};const methodCounts={};for(const c of cos){
   const t=C.find(z=>z.id===Number(c.key.slice(2)))?.collectible_type||'UNKNOWN';
   typeCounts[t]=(typeCounts[t]||0)+1;
   methodCounts[c.methodType]=(methodCounts[c.methodType]||0)+1;
 }
 console.log('PASS: real in-game cosmetics retained',cos.length,'premium removed',C.filter(x=>premiumIds.has(x.id)).length,'Twitch/unknown excluded');
 console.log('FINAL IN-GAME COSMETICS BY TYPE',JSON.stringify(typeCounts));
 console.log('FINAL IN-GAME COSMETICS BY ACQUISITION',JSON.stringify(methodCounts));
 console.log('CONFIRMED SAMPLE',JSON.stringify(mustKeep.map(id=>{const x=cos.find(c=>c.key==='C:'+id);return {name:x.name,method:x.method,requirements:x.requirements}})));

})().catch(e=>{console.error(e);process.exitCode=1});
