'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'App script should be embedded');
new vm.Script(script);

// Exercise actual production functions without starting browser event handlers.
const bootAt = script.indexOf(" $('tbody').addEventListener('change'");
assert.ok(bootAt > 0, 'App startup boundary should be located');
const isolated = script.slice(0, bootAt) +
  "\n globalThis.__catalogTest={makeCatalog,officialKnowledgeHint,specialGearHint,isCraftedGameplayAccessory,hasProof};\n})();";
const context = {console};
vm.runInNewContext(isolated, context, {timeout: 3000});
const {makeCatalog,officialKnowledgeHint,specialGearHint,isCraftedGameplayAccessory,hasProof} = context.__catalogTest;

const fishing = officialKnowledgeHint({title:'Tier 3 Trophy Fishing Knowledge'});
const rarity = officialKnowledgeHint({title:'Tier 7 One That Got Away Knowledge'});
const historical = officialKnowledgeHint({title:'The Starseekers',tag:'Uncharted Research'});
assert.match(fishing.method, /tier 3/i);
assert.match(fishing.evidenceUrl, /bitcraftonline\.com/);
assert.match(rarity.method, /tier 7/i);
assert.equal(historical.verified,'Historical');
assert.equal(hasProof({verified:'Historical',methodType:'Historique'}),false);
assert.equal(hasProof({verified:'Official',methodType:'Guide officiel · pêche'}),true);
assert.equal(isCraftedGameplayAccessory({name:'Survivalist Energy Crystal'}),true);
assert.equal(isCraftedGameplayAccessory({name:'Basic Iron Chestplate'}),false);
assert.ok(specialGearHint({name:'Survivalist Energy Crystal'}).evidenceUrl.includes('giddy-up'));

const data = {
  knowledge_scroll_desc: [
    {item_id:50001,title:'Tier 3 Trophy Fishing Knowledge',tag:'Fishing',secondary_knowledge_id:666,known_by_default:false,auto_collect:true},
    {item_id:50002,title:'The Starseekers',tag:'Uncharted Research',secondary_knowledge_id:777,known_by_default:false,auto_collect:true},
    {item_id:50003,title:'Knowledge From Multiple Paths',tag:'Merchanting',secondary_knowledge_id:888,known_by_default:false,auto_collect:true},
  ],
  knowledge_stat_modifier_desc:[{secondary_knowledge_id:666,stats:[{id:'FishingSpeed',value:.002,is_pct:true}]}],
  secondary_knowledge_desc:[{id:666,name:'Fishing Bonus'},{id:777,name:'Research'},{id:888,name:'Quest Knowledge'}],
  item_desc: [
    {id:1,name:'Coin'},
    {id:901,name:'Survivalist Energy Crystal',tag:'Accessory'},
    {id:902,name:'Silver Crystal Sword',tag:'Weapon'},
    {id:903,name:'Basic Cloth Chestplate',tag:'Armor'},
    {id:904,name:'Special Fishing Bobber',tag:'Fishing Instrument'},
  ],
  equipment_desc:[{item_id:901,stats:[{id:'Forestry Speed',value:0.05,is_pct:true}],level_requirement:{skill_id:2,level:12},required_knowledges:[666]},{item_id:902},{item_id:903},{item_id:904}],
  weapon_desc:[{item_id:902}],
  tool_desc:[],
  crafting_recipe_desc:[
    {id:101,name:'Crystal Recipe',crafted_item_stacks:[{item_id:901,item_type:'Item'}]},
    {id:102,name:'Sword Recipe',crafted_item_stacks:[{item_id:902,item_type:'Item'}]},
    {id:103,name:'Chest Recipe',crafted_item_stacks:[{item_id:903,item_type:'Item'}]}
  ],
  quest_chain_desc:[{id:11,name:'Researcher Quest',rewards:[{ItemStack_:{item_id:50003,quantity:1}}],requirements:[]}],
  traveler_trade_order_desc:[{id:31,traveler:'Heimlich',offer_items:[{item_id:50003,quantity:1}],required_items:[{item_id:1,quantity:100}],required_knowledges:[],blocking_knowledges:[],achievement_requirements:[],level_requirements:[]}],
  stage_rewards_desc:[],achievement_desc:[],premium_item_desc:[],traveler_task_desc:[],
  skill_level_knowledge_desc:[],skill_desc:[{id:2,name:'Forestry'}],collectible_desc:[],ability_unlock_desc:[]
};
const result = makeCatalog(data).records;
const byKey = id => result.find(x => x.key===id);
assert.ok(byKey('I:901'),'Craftable, useful accessory should be included');
assert.match(byKey('I:901').effect,/Forestry Speed \+5 %/);
assert.match(byKey('I:901').requirements,/Forestry niveau 12/);
assert.ok(byKey('I:904'),'Uncrafted bobber should be included');
assert.equal(byKey('I:902'),undefined,'Crafted weapon must be excluded');
assert.equal(byKey('I:903'),undefined,'Crafted armor must be excluded');
assert.equal(byKey('K:50001').effect,'Vitesse de pêche +0.2 %');
assert.equal(byKey('K:50001').verified,'Official');
assert.equal(byKey('K:50002').methodType,'Historique');
assert.equal(hasProof(byKey('K:50002')),false);
const multi=byKey('K:50003');
assert.equal(multi.sources.length,2,'All acquisition methods should be preserved');
assert.equal(multi.sources[0].reference,'trade 31');
assert.equal(multi.sources[1].reference,'quest 11');
assert.match(byKey('I:901').method,/Sentinel/);
assert.match(byKey('I:904').method,/filets de pêche/);
console.log('PASS: official hints, historical uncertainty, gear exclusions, stat effects and route provenance');


// Regression: profession-level rewards must not become collection goals.
const withLevel={
 ...data,
 skill_level_knowledge_desc:[{id:24680,skill_id:2,level:20,secondary_knowledge_id:500000}],
 secondary_knowledge_desc:[...data.secondary_knowledge_desc,{id:500000,name:'ForestryLevel20Stats'},{id:247498648,name:'Cooking Power I'},{id:1965541450,name:'Dried Spider Blood'}],
 knowledge_scroll_desc:[...data.knowledge_scroll_desc,
  {item_id:255980691,title:'Cooking Power I',tag:"Cook's Knowledge",secondary_knowledge_id:247498648,known_by_default:false,auto_collect:true},
  {item_id:654031403,title:'Dried Spider Blood',tag:'Dungeon Knowledge',secondary_knowledge_id:1965541450,known_by_default:false,auto_collect:false}
 ],
 knowledge_stat_modifier_desc:[...data.knowledge_stat_modifier_desc,{secondary_knowledge_id:247498648,stats:[{id:'CookingPower',value:2,is_pct:false}]},{secondary_knowledge_id:1965541450,stats:[{id:'Strength',value:20,is_pct:false}]}],
 item_desc:[...data.item_desc,{id:255980691,name:'Cooking Power Training I',tag:'Skill Training'},{id:654031403,name:'Dried Araknir Blood',tag:'Dungeon Upgrade'}],
 traveler_trade_order_desc:[...data.traveler_trade_order_desc,
  {id:164868375,traveler:'Heimlich',offer_items:[{item_id:255980691}],required_items:[{item_id:1,quantity:500}],level_requirements:[{skill_id:13,level:10}],required_knowledges:[],blocking_knowledges:[]}],
 skill_desc:[...data.skill_desc,{id:13,name:'Cooking'}],
 ability_unlock_desc:[
  {id:77,show_in_progression:true,level_requirements:[{skill_id:2,level:20}],required_knowledges:[],required_claim_tech_id:0,ability_data:{Prospecting_:17}},
  {id:88,show_in_progression:true,level_requirements:[{skill_id:2,level:20}],required_knowledges:[247498648],required_claim_tech_id:0,ability_data:{Prospecting_:18}}
 ]
};
const x=makeCatalog(withLevel);
const lookup=key=>x.records.find(row=>row.key===key);
assert.equal(x.meta.automaticSkillLevelsExcluded,1);
assert.ok(!x.records.some(row=>row.key.startsWith('L:')||row.kind==='level'||row.automatic),'Auto-level entries must not be created');
assert.equal(lookup('S:500000'),undefined,'Orphan level-only knowledge must not leak into secondary knowledge');
assert.equal(lookup('A:77'),undefined,'Abilities awarded only by level must be excluded');
assert.ok(lookup('A:88'),'Knowledge-gated ability is still a real unlock');
assert.ok(!html.includes("['level',language==="),'Auto-levels tab should be gone');

const cooking=lookup('K:255980691');
assert.equal(cooking.methodType,'Échange voyageur','A level-restricted *purchased* scroll stays in the catalog');
assert.match(cooking.method,/Heimlich/);
assert.equal(cooking.source,'https://brico.app/database/item/255980691','Knowledge item page shows acquisition');
assert.equal(cooking.bricoKnowledgeUrl,'https://brico.app/database/knowledge/247498648','Separate knowledge page shows stat effect');
assert.ok(cooking.sources.some(s=>s.bricoUrl==='https://brico.app/database/traveler-trade/164868375'),'Trade uses a Brico detail route');
assert.ok(multi.sources.some(s=>s.bricoUrl==='https://brico.app/database/quest-chain/11'),'Quest uses a Brico detail route');

const araknir=lookup('K:654031403');
assert.equal(araknir.verified,'Community','A Brico loot-list clue is not mislabeled as an official source');
assert.equal(araknir.methodType,'Liste de butin · Brico');
assert.match(araknir.method,/non confirmés/,'Unverified drop circumstances remain explicit');
assert.match(araknir.effect,/Force \+20/);
assert.ok(html.includes("const CACHE='bitcraft-tracker-v1.0.2026-11'"),'Existing user progress key must remain unchanged');
console.log('PASS: automatic level exclusions, nonautomatic purchases, deep Brico sources and evidence qualification');
