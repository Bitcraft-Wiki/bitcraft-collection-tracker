# Politique de données et de preuves / Data evidence policy

## Français

Il faut distinguer quatre niveaux de certitude :

1. **Existence** : l'entrée figure dans une table statique publiée. Cela ne prouve pas son accessibilité dans le jeu.
2. **Effet** : une connaissance et ses statistiques sont rapprochées grâce à `secondary_knowledge_id`. Quand `is_pct=true`, une valeur `0.02` s'affiche `2 %`. Ne pas déduire l'empilement des bonus de la seule table.
3. **Méthode d'obtention identifiée** : lien détecté dans les tables de quêtes, récompenses, échanges voyageur ou fabrication. Les prérequis peuvent être incomplets, et l'entrée peut être désactivée.
4. **Disponible dans BitCraft 1.0** : vérifié dans le nouveau monde ou confirmé officiellement. Les données pré-lancement seules ne suffisent pas.

**Règle impérative :** ne jamais inventer un taux de drop, un monstre, un lieu, une durée, une quête, un marchand ou une méthode d'obtention à partir du nom d'une entrée. Les cases « À documenter » restent explicites jusqu'à vérification.

Les catégories et le classement d'« impact » sont des **heuristiques de repérage**, non une estimation de DPS ou une recommandation d'optimisation démontrée. Les noms de capacités techniques sont des identifiants en attente d'analyse. Les récompenses automatiques des niveaux de métier sont exclues de toutes les vues et des exports. Les achats, quêtes et fabrications exigeant un niveau sont conservés car leur acquisition n'est pas automatique.

Priorités d'audit : buffs permanents, mobilité, transport, téléportation, endurance, puissance et vitesse des métiers, capacités spéciales, maîtrise de cuisine, entraînement des animaux et pièces d'équipement exceptionnelles non fabriquées.


## Tranche « guides de déblocage » — 12 novembre 2026

La version préparatoire enrichit les fiches suivantes à partir des annonces **officielles**, en préservant leurs liens vers les tables du jeu :

- **Pêche** : 9 connaissances de poissons trophées et 10 connaissances « One That Got Away ». Le déclencheur (un déblocage unique pour le poisson exceptionnel de chaque tier) est annoncé par Clockwork Labs dans [No Stone Unturned](https://bitcraftonline.com/news/patch-notes-no-stone-unturned). Il reste à confirmer en 1.0.
- **Cristaux de métier** : quatre familles (Survivalist, Stonesmith, Verdant, Landweaver). Les fragments viennent du Sentinel et les cristaux se fabriquent à l'atelier du cœur, d'après [Giddy Up](https://bitcraftonline.com/news/patch-notes-giddy-up). Les valeurs statistiques individuelles doivent encore être examinées.
- **Hameçons en chitine / bobbers** : sources générales respectives (pièges à homards / filets de pêche), issues de [No Stone Unturned](https://bitcraftonline.com/news/patch-notes-no-stone-unturned) ; les taux de butin ne sont pas publiés ici.
- **Recherches des îles non cartographiées** : mentionnées comme **sources historiques**, pas comme méthodes actuellement disponibles. Voir [Shores of Summer](https://bitcraftonline.com/news/patch-notes-shores-of-summer).

Les tables de récompenses permettent désormais d'afficher **plusieurs voies d'obtention**, chacune avec le type de table et l'identifiant de la ligne source. Un chemin extrait des données n'est pas une validation dans le monde 1.0 ; un chemin historique reste classé « à documenter ».

**Exclusions :** les accessoires spéciaux fabricables (cristaux, bijoux, hameçons, bobbers) sont conservés lorsqu'ils apportent des avantages ; les armes et armures conventionnelles fabriquées restent exclues. Les identifiants de suivi existants ne changent pas.

## English

Keep these claims distinct:

1. **In static data** does not prove current game availability.
2. **Stat effect** is derived from `knowledge_stat_modifier_desc` joined by `secondary_knowledge_id`; raw fractions with `is_pct` are displayed as percentages. Actual stacking is not inferred.
3. **Acquisition relation** is a trace in quest rewards, trade offers, tasks, or crafting. It does **not** prove current availability or complete prerequisites.
4. **Obtainable in the 1.0 world** requires in-world checking after release or reliable official confirmation.

Never invent drop rates, boss names, locations, quests, requirements or event dates from an item name. Impact tags are discovery heuristics, not validated optimization or DPS rankings. Automatic skill-level rewards are excluded from all catalog tabs and exports. Scrolls or quests gated by a profession level remain in scope because leveling alone does not grant them.


## Gameplay guide tranche — November 12, 2026

The launch-preparation version adds official, source-linked acquisition clues for **9 Trophy Fishing + 10 One That Got Away** knowledge unlocks, four specialist Energy Crystal families, chitin fishing hooks, and bobbers. Sources: [No Stone Unturned](https://bitcraftonline.com/news/patch-notes-no-stone-unturned) and [Giddy Up](https://bitcraftonline.com/news/patch-notes-giddy-up).

**Uncharted Islands research knowledge** is marked as a **historical acquisition source only**, since an old event does not establish a currently available 1.0 method. See [Shores of Summer](https://bitcraftonline.com/news/patch-notes-shores-of-summer).

The app now preserves **multiple acquisition traces** (quest, traveler trade, task, crafting, achievement, premium pack) with their source table links and row IDs, instead of silently showing only the first. These are static-data relations, **not confirmed 1.0 availability**. Crafted functional accessories stay included, while traditional craftable weapons, armor and profession tools remain excluded. Existing save identifiers remain stable.

## Public references

- https://github.com/BitCraftToolBox/BitCraft_GameData/tree/cereal/cs/static
- https://brico.app/database
- https://bitcraftonline.com/news

## Data update policy

Re-check public source revisions and all high-impact changes. Preserve stable user progress keys (`K:item_id`, `C:collectible_id`, `S:secondary_knowledge_id`; legacy `L:*` saved values can remain in backups but are never displayed or counted) so personal checkmarks survive updates. Future entries should carry independent verification date, source revision and availability status.


## Brico.app cross-check — 12 November 2026 / rapprochement Brico — 12 novembre 2026

The tracker now opens per-item Brico pages as acquisition references and separate knowledge pages for statistical effects. Detected trader, quest and traveler task routes link to their corresponding Brico pages. All routes retain their BitCraftToolBox raw-table links. **Generated Brico links follow inspected URL patterns but have not all been checked individually**; check the page and current game availability before treating an acquisition as confirmed. Brico is a community database, not an official source. See [BRICO_AUDIT.md](BRICO_AUDIT.md) for manually inspected examples.
