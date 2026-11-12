# Cosmétiques obtenables en jeu / In-game cosmetic acquisition audit

**Révision du tracker / Tracker revision:** préparatoire r7 — 12 novembre / November 12, 2026  
**Référence des tables / Pinned data reference:** [BitCraftToolBox/BitCraft_GameData — `725b093e18dab57961c652691f13450db46881f7`](https://github.com/BitCraftToolBox/BitCraft_GameData/tree/725b093e18dab57961c652691f13450db46881f7/static)

## 🇫🇷 Objectif

Le tracker sert à guider les joueurs vers **des actions à effectuer en jeu**, et non vers des achats, récompenses promotionnelles ou cadeaux liés au compte.

**Inclusions positives :** obtenir une récompense de quête, valider un succès qui demande davantage qu'une simple montée automatique de niveau, échanger avec un voyageur, compléter une tâche de voyageur, ou fabriquer un objet spécial.

**Exclusions :** boutique premium (`premium_item_desc.collectible_ids`, packs actifs *et désactivés*), entrées de type `PremiumItem`, pièces de packs, Twitch Drops, titres de compte ou d'achat, cosmétiques de départ et cosmétiques dont aucune voie d'obtention en jeu n'est visible dans les tables. Les grades/titres obtenus automatiquement en montant un métier sont également exclus.

**Prudence :** un objet sans source retrouvée n'est pas nécessairement inaccessible. Il est *retiré du catalogue public* jusqu'à ce qu'une source vérifiable soit ajoutée, pour éviter que les joueurs le poursuivent inutilement. Une voie de récompense présente dans le code ne certifie pas non plus qu'elle soit actuellement active dans le monde **1.0**.

## 🇬🇧 Scope

The tracker should give players **actionable goals inside the game**: quest rewards, non-automatic achievements, traveler trades, traveler tasks and crafted specialist cosmetics.

**Excluded:** all Premium Shop bundles and directly linked collectibles (enabled or disabled), `PremiumItem` entries, known Twitch Drop families, account-purchase / legacy title rewards, starting cosmetics, automatic profession-level awards and cosmetics with no traced in-game acquisition. These are hidden from search, totals, cosmetic tabs and CSV exports; previously saved user progress records remain stored.

**Caution:** “No traced source” means **not yet substantiated in our data**, *not* proven unobtainable. Static relations are not live 1.0 availability confirmation.

## Résultats reproductibles / Reproducible results

Le test d'intégration `tests/cosmetic-source-audit.cjs` télécharge les tables publiques figées et exécute **le même constructeur de catalogue que le site**.

| Mesure / Metric | Résultat / Result |
| --- | ---: |
| Références à des cosmétiques de boutique exclues / Premium-linked collectibles excluded | **389** |
| Collectionnables avec une voie en jeu et conservés / In-game sourced collectible entries retained | **105** |
| Principalement via quêtes / Main route: quest rewards | **50** |
| Principalement via fabrication / Main route: crafting | **26** |
| Principalement via échange / Main route: traveler trade | **18** |
| Principalement via succès non automatique / Main route: non-automatic achievement | **11** |

Les 105 entrées couvrent **cosmétiques, familiers, véhicules et montures** ; il ne faut pas les interpréter comme 105 vêtements. Les voies secondaires sont conservées dans les fiches même si une autre méthode est présentée en premier. / The 105 entries include cosmetics, pets, mounts and vehicles; do not interpret this count as clothing only. Secondary routes remain available in details.

## Exemples traçables / Traced examples

| Déblocage / Unlock | Action répertoriée / Listed action | Tables / Source relations |
| --- | --- | --- |
| **Feline Mask** (collectible `304`) | Quête `Curiosity Brought It Back` et plusieurs prérequis de métiers / Quest with skill prerequisites | `quest_chain_desc` → `item_deed_id` |
| **Emote Salute** (`315153795`) | Quête `A Salute to Your Empire` ; préalable `Basking in the Tree's Wisdom` / Quest and prior quest | `quest_chain_desc` → `collectible_desc` |
| **Alpha Jakyl Puppy** (`861825712`) | Quête `The Littlest Alpha`, après `Hunters and Gatherers` et prérequis de métier / Quest and prerequisite | `quest_chain_desc` → `collectible_desc` |
| **Pink Hair** (`300545610`) | Échange auprès de `Twins` contre **5 000 Hex Coins** / Traveler trade | `traveler_trade_order_desc` |
| **Basic Walls (Red)** (`174699389`) | Fabriquer l'acte `Deed: Basic Walls (Red)` ; recette `127128750` / Craft the appearance deed | `crafting_recipe_desc` |

Ces liens indiquent une relation dans les tables, **pas** une garantie de disponibilité dans le monde 1.0. / These are raw-data links, **not** confirmations of live 1.0 obtainability.

## Exemples exclus / Excluded examples

- **Classic Soiree Dress Bodice** (`4221595`) : référencé par un pack premium / premium bundle.
- **Clockwork Engineer Gloves** (`102863133`) : récompense liée à la boutique / shop-linked.
- **Awakened Wolf's Boots** (`671996935`) : récompense Twitch, non un objectif en jeu / Twitch Drop.
- **Beginner Forester** (`16000000`) : titre accordé par progression automatique du métier / automatic profession-level title.
- **Rough Bonnet** (`1150001`) : méthode non retracée ; entrée retenue hors catalogue jusqu'à vérification / source untraced, withheld pending audit.

## Comment se construit une fiche / Acquisition route construction

1. Les quêtes sont reliées à leurs récompenses et à leurs prérequis nommés. Les doublons entre récompenses de quête et récompenses d'étape sont regroupés. / Quests are linked to named prerequisites; duplicate quest-stage rewards are deduplicated.
2. Les succès affichent leur description, les prérequis de niveau le cas échéant et les succès préalables ; ceux obtenus uniquement au niveau de métier sont exclus. / Achievement conditions are shown; pure level awards are excluded.
3. Les échanges indiquent le nom du voyageur, les objets demandés, leur quantité, les connaissances et les niveaux requis lorsqu'ils sont renseignés. / Trades show traveler names, costs and prerequisites.
4. Les tâches de voyageur indiquent aussi les quantités à **livrer** et le niveau minimal. / Traveler tasks show deliveries and level gates.
5. Les recettes présentant `Craft {0}` affichent à la place le nom réel de l'objet et l'identifiant de recette. / Generic recipe labels are replaced by item names and recipe IDs.

**Ordre de présentation / Primary route priority:** quête / quest → succès / achievement → échange / trade → tâche / task → fabrication / crafting. Les voies additionnelles demeurent consultables.

## Règles de publication / Publication safeguards

- Une erreur de chargement de `premium_item_desc` fait **masquer les collectionnables** plutôt que laisser apparaître des achats : fonctionnement *fail closed*. / Missing premium data hides collectible listings instead of risking shop leakage.
- Les actes d'objets liés à une collection existante ne créent **pas une seconde entrée** ; le collectionnable reste l'objectif. / Linked collectible deeds do not create duplicate tracker entries.
- Les préférences locales et les clés `C:collectible_id`, `K:item_id`, etc. ne sont pas supprimées ; une ancienne coche reste dans la sauvegarde JSON même si la fiche devient hors périmètre. / Saved local checkmarks remain recoverable in JSON backups.
- Les entrées de gameplay non cosmétiques restent évaluées séparément : une connaissance permanente avec provenance inconnue peut être conservée pour la recherche, contrairement à un cosmétique sans piste. / Noncosmetic gameplay discoveries may remain flagged for research.

**Sources publiques / Public sources:** [BitCraftToolBox game tables](https://github.com/BitCraftToolBox/BitCraft_GameData/tree/cereal/cs/static) · [Brico's Toolbox, collectibles](https://brico.app/database/collectible) · [Brico's Toolbox, premium items](https://brico.app/database/premium-item).
