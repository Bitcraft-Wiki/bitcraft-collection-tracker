'use strict';
// Pinned, reproducible integration audit over real public BitCraft descriptors.
// This is intentionally separate from small offline unit tests.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const PIN='725b093e18dab57961c652691f13450db46881f7';
const BASE='https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/'+PIN+'/static/';
const names=['item_desc','equipment_desc','weapon_desc','tool_desc'];
async function fetchJson(name){
 let last;
 for(let attempt=0;attempt<2;attempt++){
   try{
     const response=await fetch(BASE+name+'.json',{signal:AbortSignal.timeout(30000)});
     if(!response.ok)throw Error('HTTP '+response.status+' '+name);
     const result=await response.json();
     if(!Array.isArray(result)||!result.length)throw Error('Invalid '+name+' data');
     return result;
   }catch(err){last=err}
 }
 throw last;
}
(async()=>{
 const h=fs.readFileSync('index.html','utf8');
 const src=h.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert(src);
 const cut=src.indexOf(" $('tbody').addEventListener('change'");
 assert(cut>0);
 const context={console};
 vm.runInNewContext(src.slice(0,cut)+"\n globalThis.__catalogLiveTest={makeCatalog};\n})();",context,{timeout:10000});
 const fetched=await Promise.all(names.map(fetchJson));
 const data=Object.fromEntries(names.map((name,i)=>[name,fetched[i]]));
 const itemsById=new Map(data.item_desc.map(it=>[Number(it.id),it]));
 const result=context.__catalogLiveTest.makeCatalog(data).records;
 const equipRows=result.filter(r=>r.kind==='item'&&r.category==='Équipements spéciaux');
 assert(equipRows.length>10,'The real data must retain useful special accessories');
 const material=/\b(?:ferralith|pyrelite|emarium|elenvar|luminite|rathium|aurumite|celestium|umbracite|astralite)\b/i;
 const standard=/\b(?:axe|mace|bow|sword|claymore|dagger|knife|machete|pickaxe|hatchet|helmet|helm|chestplate|gauntlets|greaves|plated pants|shield|quill|saw|chisel|scissors)\b/i;
 const allItemRows=result.filter(r=>r.kind==='item');
 const conventionalType=/(?:^|[^a-z])(?:axe|mace|bow|sword|claymore|dagger|knife|machete|pickaxe|hatchet|helmet|helm|chestplate|gauntlets|greaves|plated pants|shield|quill|saw|chisel|scissors|armguards|gloves|boots|leggings|pants|vest|tunic|robe|coat)(?:$|[^a-z])/i;
 const catalogMaterialLeaks=allItemRows.filter(r=>material.test(r.name)&&conventionalType.test(r.name));
 assert.equal(catalogMaterialLeaks.length,0,'Conventional material gear leaked in ANY item tab: '+catalogMaterialLeaks.slice(0,20).map(x=>x.name+' ('+x.category+')').join(', '));
 const leaks=equipRows.filter(r=>{
   const item=itemsById.get(Number(r.key.slice(2)));
   if(!item)return false;
   return material.test(item.name)&&standard.test(item.name);
 });
 assert.equal(leaks.length,0,'Conventional tier equipment leaked: '+leaks.slice(0,8).map(x=>x.name).join(', '));
 const allMaterials=data.item_desc.filter(x=>material.test(x.name)&&standard.test(x.name)&&data.equipment_desc.some(e=>e.item_id===x.id));
 assert(allMaterials.length>50,'The audit should cover many genuine tier/rarity equipment records');
 const findByName=n=>equipRows.find(x=>x.name===n);
 for(const target of ['Old Bobber','Lucky Gem Charm','Oyster Pearl Charm','Perfect Obsidian']){
   assert(findByName(target),'Special accessory absent from real dataset: '+target);
 }
 const rarityTally={};for(const v of allMaterials)rarityTally[v.rarity]=(rarityTally[v.rarity]||0)+1;
 console.log('PASS pinned public BitCraft data commit '+PIN);
 console.log('Items '+data.item_desc.length+'; equipment '+data.equipment_desc.length+'; tools '+data.tool_desc.length+'; weapon variants '+data.weapon_desc.length);
 console.log('Material-based conventional equipment rows in actual data: '+allMaterials.length+' ('+JSON.stringify(rarityTally)+')');
 console.log('Retained special accessories: '+equipRows.length+'; conventional material leaks: '+leaks.length);
 console.log('Examples retained: '+['Old Bobber','Lucky Gem Charm','Oyster Pearl Charm','Perfect Obsidian'].join(', '));
})().catch(err=>{console.error(err);process.exitCode=1});
