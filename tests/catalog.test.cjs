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
  "\n globalThis.__catalogTest={makeCatalog,officialKnowledgeHint,specialGearHint,isCraftedGameplayAccessory,isSpecialEquipment,isConventionalGearFallback,hasProof,isAstraliteObjectName,isExcludedAstraliteRecord,isExternalRewardRecord,isInScopeRecord,isInGameAcquisition,isAutomaticCareerAchievement};\n})();";
const context = {console};
vm.runInNewContext(isolated, context, {timeout: 3000});
const {makeCatalog,officialKnowledgeHint,specialGearHint,isCraftedGameplayAccessory,isSpecialEquipment,isConventionalGearFallback,hasProof,isAstraliteObjectName,isExcludedAstraliteRecord,isExternalRewardRecord,isInScopeRecord,isInGameAcquisition,isAutomaticCareerAchievement} = context.__catalogTest;

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
assert.equal(multi.sources[0].reference,'quest 11');
assert.equal(multi.sources[1].reference,'trade 31');
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
 quest_chain_desc:[...data.quest_chain_desc,{id:40410003,name:'Finding the Forest Owl',requirements:[],rewards:[{ItemStack_:{item_id:303005,quantity:1}}],implicit_rewards:[]}],
 special_unused:undefined
};
const materialRecords=makeCatalog(astraliteFixtures).records;
const hasKey=key=>materialRecords.some(x=>x.key===key);
assert(!hasKey('C:404001'),'Astralite-named collectible removed');
assert(!hasKey('C:404002'),'Astralite deed also excludes linked generic collectible');
assert(hasKey('C:404003'),'In-game Forest Owl preserved despite Astralite exclusions');
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
assert(!screenshotCatalog.some(row=>row.key==='I:2026121'),'Ordinary Birch Axe must now be excluded even if not Astralite');
assert(!screenshotCatalog.some(row=>row.key==='I:2026122'),'Ordinary Wooden Bow must now be excluded even if not Astralite');
assert(isExcludedAstraliteRecord({kind:'item',name:'Astralite Axe'}));
assert(isExcludedAstraliteRecord({kind:'collectible',name:'Astralite Bow'}));
assert(!isExcludedAstraliteRecord({kind:'knowledge',name:'Astralite Construction Knowledge'}));
assert(!isExcludedAstraliteRecord({kind:'item',name:'Birch Axe',description:'Astralite is nearby'}));
assert(html.includes("id=\"buildInfo\""),'Build marker must let the user distinguish old cache from new app');
assert(html.includes('UI v2026.11.12-r7'),'Build version should match reviewed release');
assert(html.includes('return {records:result.filter(isInScopeRecord)'),'Final catalogue scope guard must be applied');
assert(html.includes('const a=records.filter(x=>{if(!isInScopeRecord(x))return false;'),'Search and CSV views must exclude premium and Twitch rewards');
assert(html.includes('function activeItems(){return records.filter(x=>isInScopeRecord(x)'),'Counters must exclude external rewards');
console.log('PASS: 8 exact Astralite Axe/Bow screenshot IDs blocked, non-Astralite controls preserved, build stamp and display guards');


// Strict equipment whitelist: ordinary craftable armor, tools and weapons NEVER belong in this tracker.
// Importantly, no crafting recipes are present for these synthetic rarity variants.
// The exclusions must hold across ALL six official rarities and across material tiers.
const rarities=['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
const conventionalSamples=[
 ['Ferralith Axe','Tool',1],
 ['Pyrelite Pickaxe','Tool',2],
 ['Emarium Saw','Tool',3],
 ['Elenvar Quill','Tool',4],
 ['Luminite Knife','Tool',5],
 ['Rathium Shield','Weapon',6],
 ['Aurumite Mace','Weapon',7],
 ['Celestium Bow','Weapon',8],
 ['Celestium Chestplate','Metal Armor',8],
 ['Umbracite Leather Boots','Leather Armor',9],
 ['Astralite Duelist Helm','Metal Armor',10],
 ['Aurumite Plated Pants','Metal Armor',7],
 ['Perfected Celestium Axe','Tool',8],
 ['Legendary Rathium Sword','Weapon',6],
 ['Silver Plated Armor','Metal Armor',6]
];
const ordinaryGear=[];
for(let i=0;i<conventionalSamples.length;i++)for(let rarityIndex=0;rarityIndex<rarities.length;rarityIndex++){
 const [name,tag,tier]=conventionalSamples[i];
 ordinaryGear.push({id:41000000+i*10+rarityIndex,name,tag,tier,rarity:rarities[rarityIndex]});
}
const specialGear=[
 {id:5100001,name:'Auric Ring',tag:'Jewelry',rarity:'Epic',slot:'Jewelry'},
 {id:5100002,name:'Silver Ring',tag:'Jewelry',rarity:'Common',slot:'Jewelry'},
 {id:5100003,name:'Argic Coralith Ring',tag:'Jewelry',rarity:'Rare',slot:'Jewelry'},
 {id:5100004,name:'Old Bobber',tag:'Fishing Instrument',rarity:'Common',slot:'FishingInstrument'},
 {id:5100005,name:'Lucky Gem Charm',tag:'Mining Charm',rarity:'Epic',slot:'MiningCharm'},
 {id:5100006,name:'Perfect Obsidian',tag:'Trinket',rarity:'Common',slot:'Trinket'},
 {id:5100007,name:'Ancient Survival Kit (V)',tag:'Trinket',rarity:'Mythic',slot:'Trinket'},
 {id:5100008,name:'Survivalist Energy Crystal',tag:'Accessory',rarity:'Legendary',slot:'Jewelry'},
 {id:5100009,name:'Oyster Pearl Charm',tag:'Jewelry',rarity:'Legendary',slot:'Jewelry'},
 {id:5100010,name:'Crystalized Lobster Chitin Hook',tag:'Fishing Instrument',rarity:'Legendary',slot:'FishingInstrument'}
];
const buildItem=({id,name,tag,tier=7,rarity})=>({id,name,tag,tier,rarity});
const fullGearFixture={
 ...data,
 item_desc:[...data.item_desc,...ordinaryGear.map(buildItem),...specialGear.map(buildItem)],
 equipment_desc:[...data.equipment_desc,...ordinaryGear.map(x=>({item_id:x.id,slots:['MainHand'],level_requirement:{skill_id:2,level:50},stats:[]})),
   ...specialGear.map(x=>({item_id:x.id,slots:[x.slot],level_requirement:{skill_id:2,level:30},stats:[{id:'Strength',value:5,is_pct:false}]}))],
 weapon_desc:[...data.weapon_desc,...ordinaryGear.filter(x=>x.tag==='Weapon').map(x=>({item_id:x.id}))],
 tool_desc:[...data.tool_desc,...ordinaryGear.filter(x=>x.tag==='Tool').map(x=>({item_id:x.id,tool_type:1}))],
 crafting_recipe_desc:[...data.crafting_recipe_desc,
   ...specialGear.map(x=>({id:6100000+x.id,name:'Craft '+x.name,crafted_item_stacks:[{item_id:x.id,item_type:'Item'}]}))]
};
const filteredGear=makeCatalog(fullGearFixture).records;
for(const item of ordinaryGear) assert(!filteredGear.some(r=>r.key==='I:'+item.id),item.name+' '+item.rarity+' should NEVER appear, recipe or no recipe');
for(const item of specialGear){
 const rec=filteredGear.find(r=>r.key==='I:'+item.id);
 assert(rec,item.name+' should remain as a special piece of equipment');
 assert.equal(rec.category,'Équipements spéciaux');
 assert.match(rec.effect,/Force \+5/);
 assert(rec.sources.some(src=>src.type==='Fabrication'),'Crafted accessories must preserve their crafting path even if an official hint takes display priority');
}
assert.equal(ordinaryGear.length,conventionalSamples.length*rarities.length);
assert(isSpecialEquipment({name:'Auric Ring',tag:'Jewelry'}, {slots:['Jewelry']}));
assert(isSpecialEquipment({name:'Ancient Survival Kit (V)',tag:'Trinket'}, {slots:['Trinket']}));
assert(!isSpecialEquipment({name:'Celestium Mace',tag:'Weapon'}, {slots:['MainHand','OffHand']}));
assert(!isSpecialEquipment({name:'Perfected Aurumite Axe',tag:'Tool'}, {slots:['MainHand']}));
assert(isConventionalGearFallback({name:'Legendary Celestium Mace',tag:'Quest Item'}),'Material and weapon type should block false "special" entries');
assert(!isConventionalGearFallback({name:'Silver Ring',tag:'Jewelry'}),'Ring must not be mistaken for a generic material item');
const noEquipmentDescriptions={
 ...data,
 item_desc:[...data.item_desc,
  {id:41190001,name:'Rare Celestium Mace',tag:'Quest Item',rarity:'Rare',tier:8},
  {id:41190002,name:'Perfected Aurumite Axe',tag:'Unique',rarity:'Mythic',tier:7},
  {id:41190003,name:'Argic Silver Ring',tag:'Jewelry',rarity:'Rare',tier:7}]
};
const degraded=makeCatalog(noEquipmentDescriptions).records;
assert(!degraded.some(r=>r.key==='I:41190001'),'Missing equipment table cannot leak a basic quest-marked mace');
assert(!degraded.some(r=>r.key==='I:41190002'),'Missing equipment table cannot leak a perfected axe marked unique');
assert(degraded.some(r=>r.key==='I:41190003'),'Jewelry remains visible when auxiliary equipment tables are missing');
assert(html.includes('if(eq||tool){if(!accessory)continue;}else{if(isConventionalGearFallback(i))continue;'),'Must gate gear even when no crafting recipe data is available');
assert(!html.includes('if(eq&&crafted'), 'Old whitelist-by-absence of crafting must be eliminated');
console.log('PASS: strict equipment whitelist, 90 ordinary gear/rarity examples excluded, 10 crafted or noncrafted special accessories preserved and degraded data covered');


// Conventional material armor can also surface as collectible deeds, not just equipment.
const clothingFixture={
 ...data,
 item_desc:[
  ...data.item_desc,
  {id:57100001,name:'Aurumite Plated Pants',tag:'Cosmetic Clothes'},
  {id:57100002,name:'Celestium Chestplate',tag:'Metal Armor'},
  {id:57100003,name:'Festival Petal Cloak',tag:'Cosmetic Clothes'}
 ],
 collectible_desc:[
  {id:57110001,name:'Aurumite Plated Pants (Mythic)',collectible_type:'Clothes',item_deed_id:57100001,locked:true},
  {id:57110002,name:'Special Outfit',collectible_type:'Clothes',item_deed_id:57100002,locked:true},
  {id:57110003,name:'Festival Petal Cloak',collectible_type:'Clothes',item_deed_id:57100003,locked:true}
 ]
};
clothingFixture.quest_chain_desc=[...data.quest_chain_desc,{id:57110031,name:'A Festival Gift',requirements:[],rewards:[{ItemStack_:{item_id:57100003,quantity:1}}],implicit_rewards:[]}];
const apparel=makeCatalog(clothingFixture).records;
assert(!apparel.some(r=>r.key==='C:57110001'),'Normal material armor/cosmetic variant excluded across rarity labels');
assert(!apparel.some(r=>r.key==='C:57110002'),'Generic collectible deed linked to conventional chestplate excluded');
assert(apparel.some(r=>r.key==='C:57110003'),'Special event cosmetic with a verified game quest remains accessible');
console.log('PASS: ordinary material armor collectible deeds excluded without losing special cosmetic collections');
