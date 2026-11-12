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
})().catch(e=>{console.error(e);process.exitCode=1});
