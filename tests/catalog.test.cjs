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
  "\n globalThis.__catalogTest={makeCatalog,officialKnowledgeHint,specialGearHint,isCraftedGameplayAccessory,hasProof,isAstraliteObjectName,isExcludedAstraliteRecord};\n})();";
const context = {console};
vm.runInNewContext(isolated, context, {timeout: 3000});
const {makeCatalog,officialKnowledgeHint,specialGearHint,isCraftedGameplayAccessory,hasProof,isAstraliteObjectName,isExcludedAstraliteRecord} = context.__catalogTest;

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
assert.match(araknir.method,/ne sont pas confirmés/,'Unverified drop circumstances remain explicit');
assert.match(araknir.effect,/Force \+20/);
assert.ok(html.includes("const CACHE='bitcraft-tracker-v1.0.2026-11'"),'Existing user progress key must remain unchanged');
console.log('PASS: automatic level exclusions, nonautomatic purchases, deep Brico sources and evidence qualification');


// Material exclusion must be specific to actual item names (not descriptions or lore).
assert.equal(isAstraliteObjectName('Astralite Duelist Helm'),true);
assert.equal(isAstraliteObjectName('Ancient astralite-Pendant'),true);
assert.equal(isAstraliteObjectName('Astraliteish Fragment'),false);
assert.equal(isAstraliteObjectName('Silver Trinket'),false);

const astraliteFixtures={
 ...data,
 item_desc:[
  ...data.item_desc,
  {id:303001,name:'Astralite Duelist Helm',tag:'Metal Armor',rarity:'Mythic'},
  {id:303002,name:'Astralite Pendant',tag:'Trinket',rarity:'Epic'},
  {id:303003,name:'Sunstone Charm',tag:'Charm',description:'A stone found near Astralite'},
  {id:303004,name:'Astralite Memento',tag:'Quest Item'},
  {id:303005,name:'Forest Owl',tag:'Pet'}
 ],
 collectible_desc:[
  {id:404001,name:'Astralite Duelist Helm',item_deed_id:303001,collectible_type:'Clothes',locked:true},
  {id:404002,name:'Traveler Reward',item_deed_id:303002,collectible_type:'Artifact'},
  {id:404003,name:'Forest Owl',item_deed_id:303005,collectible_type:'Pet'}
 ],
 knowledge_scroll_desc:[
  ...data.knowledge_scroll_desc,
  {item_id:505001,title:'Astralite Construction Knowledge',tag:'Construction',secondary_knowledge_id:505002,known_by_default:false,auto_collect:false}
 ],
 secondary_knowledge_desc:[...data.secondary_knowledge_desc,{id:505002,name:'Astralite Construction Knowledge'}],
 special_unused:undefined
};
const materialRecords=makeCatalog(astraliteFixtures).records;
const hasKey=key=>materialRecords.some(x=>x.key===key);
assert(!hasKey('C:404001'),'Astralite-named collectible removed');
assert(!hasKey('C:404002'),'Astralite deed also excludes linked generic collectible');
assert(hasKey('C:404003'),'Non-Astralite collectible preserved');
assert(!hasKey('I:303002'),'Astralite functional accessory removed even when usually retained');
assert(!hasKey('I:303004'),'Astralite special noncraftable item removed');
assert(hasKey('I:303003'),'Astralite mention only in DESCRIPTION must not hide unrelated item');
assert(hasKey('K:505001'),'Knowledge ABOUT Astralite is not an Astralite-made object');
assert(html.includes("!isAstraliteObjectName(r.name)).map("),'Previously manually-added Astralite objects are hidden without deleting saved user data');
assert(html.includes("const CACHE='bitcraft-tracker-v1.0.2026-11'"),'Local save key retained');
console.log('PASS: Astralite object exclusions and preservation of unrelated unlocks');

const questFixture={
 ...data,
 skill_desc:[...data.skill_desc,{id:18,name:'Slayer'}],
 item_desc:[...data.item_desc,{id:1682820391,name:'Unlock Araknir Slayer Tasks',tag:'Knowledge'}],
 knowledge_scroll_desc:[...data.knowledge_scroll_desc,{item_id:1682820391,secondary_knowledge_id:225309754,title:'Unlock Araknir Tasks',tag:'Slayer',known_by_default:false,auto_collect:true}],
 secondary_knowledge_desc:[...data.secondary_knowledge_desc,{id:225309754,name:'Araknir - Slayer Tasks'}],
 quest_chain_desc:[...data.quest_chain_desc,
  {id:2109433461,name:'Taking Down the Sentinel',requirements:[],rewards:[],implicit_rewards:[]},
  {id:809605965,name:'Pest Control',
   requirements:[{QuestChain_:2109433461},{QuestChain_:2109433461},{Level_:{skill_id:18,level:70}}],
   rewards:[{ItemStack_:{item_id:1682820391,quantity:1}}],
   implicit_rewards:[]}
 ]
};
const araknirSlayer=makeCatalog(questFixture).records.find(x=>x.key==='K:1682820391');
assert(araknirSlayer,'Araknir Slayer unlock retained');
assert.equal(araknirSlayer.methodType,'Récompense de quête');
assert.match(araknirSlayer.method,/Pest Control/);
assert.match(araknirSlayer.requirements,/Taking Down the Sentinel/);
assert.equal((araknirSlayer.requirements.match(/Taking Down the Sentinel/g)||[]).length,1,'Repeated prerequisites are deduplicated');
assert.match(araknirSlayer.requirements,/Slayer niv\. 70/);
assert(araknirSlayer.sources.some(x=>x.bricoUrl==='https://brico.app/database/quest-chain/809605965'));
assert.match(araknirSlayer.guidance,/destruction du nid/);
console.log('PASS: readable prerequisite quest names, deduplication and Araknir quest guide');


// Regression for exact screenshot: Astralite Axe and Bow appeared in the catalogue after PR #4.
// Test the real displayed names AND identifiers as uncrafted equipment records.
// Exclusion must hold even when these records would otherwise pass equipment filters.
const screenshotAxeIds=[76019200,445668153,698704517,863928001,1666431616,1674000473];
const screenshotBowIds=[1013839268,1709953729];
const screenshotIds=[...screenshotAxeIds,...screenshotBowIds];
const screenshotData={
 ...data,
 item_desc:[...data.item_desc,
   ...screenshotAxeIds.map(id=>({id,name:'Astralite Axe',tag:'Tool',rarity:'Mythic',tier:10})),
   ...screenshotBowIds.map(id=>({id,name:'Astralite Bow',tag:'Weapon',rarity:'Mythic',tier:10})),
   {id:2026121,name:'Birch Axe',tag:'Tool',rarity:'Rare',tier:2},
   {id:2026122,name:'Wooden Bow',tag:'Weapon',rarity:'Rare',tier:2}],
 equipment_desc:[...data.equipment_desc,...screenshotIds.map(item_id=>({item_id,stats:[],level_requirement:{skill_id:2,level:100}})),
   {item_id:2026121},{item_id:2026122}],
 weapon_desc:[...data.weapon_desc,...screenshotBowIds.map(item_id=>({item_id})),{item_id:2026122}],
};
const screenshotCatalog=makeCatalog(screenshotData).records;
for(const id of screenshotIds)assert(!screenshotCatalog.some(row=>row.key==='I:'+id),'Astralite screenshot item '+id+' must never enter the catalogue');
assert(screenshotCatalog.some(row=>row.key==='I:2026121'),'Non-Astralite Axe should not be filtered');
assert(screenshotCatalog.some(row=>row.key==='I:2026122'),'Non-Astralite Bow should not be filtered');
assert(isExcludedAstraliteRecord({kind:'item',name:'Astralite Axe'}));
assert(isExcludedAstraliteRecord({kind:'collectible',name:'Astralite Bow'}));
assert(!isExcludedAstraliteRecord({kind:'knowledge',name:'Astralite Construction Knowledge'}));
assert(!isExcludedAstraliteRecord({kind:'item',name:'Birch Axe',description:'Astralite is nearby'}));
assert(html.includes("id=\"buildInfo\""),'Build marker must let the user distinguish old cache from new app');
assert(html.includes('UI v2026.11.12-r5'),'Build version should match reviewed release');
assert(html.includes('return {records:result.filter(row=>!isExcludedAstraliteRecord(row))'),'Final catalogue filter must be applied');
assert(html.includes('const a=records.filter(x=>{if(isExcludedAstraliteRecord(x))return false;'),'Search and CSV views must independently filter Astralite');
assert(html.includes('function activeItems(){return records.filter(x=>!isExcludedAstraliteRecord(x)'),'Counters must ignore Astralite');
console.log('PASS: 8 exact Astralite Axe/Bow screenshot IDs blocked, non-Astralite controls preserved, build stamp and display guards');
