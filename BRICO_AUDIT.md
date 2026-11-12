# Brico.app — examen ciblé des sources / Source audit

**Contrôle initial / Initial check:** 12 novembre / November 12, 2026.

**🇫🇷 Objectif.** Utiliser la base publique de Brico pour retrouver les voies d’obtention de connaissances ayant un effet gameplay. Les URL d’objets indiquent souvent « Traveler Trades », « Rewarded from Quests », « Crafted From » ou « In Item Lists ». Cette information complète les tables `BitCraftToolBox/BitCraft_GameData`, sans garantir une disponibilité effective sur le monde 1.0.

**🇬🇧 Aim.** Use Brico's public database to surface the actual origins of gameplay unlocks. Item pages often show traveler trades, quests, crafting or item-list memberships. These are **static evidence**, not proof that content is available in the fresh 1.0 world.

## Exemples examinés / Reviewed examples

| Entrée / Unlock | Source et moyen / Acquisition clue | Preuve / Evidence | Réserve / Caveat |
| --- | --- | --- | --- |
| **Expanded Teleportation Energy Cell** (item `590511920`) | Échange **Rumbagh**, 10 composants + 25 000 Hex Coins, bonus +10 énergie maximale de téléportation / Rumbagh trade for components and coins | [Item](https://brico.app/database/item/590511920) · [Trade 846539736](https://brico.app/database/traveler-trade/846539736) · [Knowledge](https://brico.app/database/knowledge/1587676416) | Identifier le composant et vérifier l’accès 1.0 / identify component and check 1.0 |
| **Construction Speed V** (item `97803777`) | Échange **Brico** contre 1 430 Hex Coins ; **Construction 50** + connaissance **Building Speed IV**, bonus +2 % / trader purchase, not automatic level reward | [Item](https://brico.app/database/item/97803777) · [Trade 908036277](https://brico.app/database/traveler-trade/908036277) | Le niveau 50 est un prérequis et non la récompense / level is a gate, not a reward |
| **Advanced Cart Wheel Set Recipe** (item `240582066`) | Quête **Reinventing the Wheel** ; Construction 25 et quête préalable **Carty Time** / quest chain | [Item](https://brico.app/database/item/240582066) · [Quest 1121072693](https://brico.app/database/quest-chain/1121072693) | Les étapes restent à vérifier en jeu / live stages still to check |
| **Simple Leather Bag** (item `2105480351`) | Débloque définitivement un préréglage d’équipement / permanent equipment-preset slot. Fabriqué avec Leatherworking 20 à un atelier tier 2 / crafted with Leatherworking 20 at T2 station | [Item](https://brico.app/database/item/2105480351) | Fabricable, mais non obtenu automatiquement par niveau / crafted, not auto-level |
| **Cooking Power I** (item `255980691`) | Parchemin vendu par **Heimlich**, niveau 10 de Cuisine, 500 Hex Coins / purchased scroll, +2 Cooking Power | [BitCraftToolBox trade table](https://github.com/BitCraftToolBox/BitCraft_GameData/blob/cereal/cs/static/traveler_trade_order_desc.json) · [Brico trade list](https://brico.app/database/traveler-trade) | L’échange est attesté par la table statique ; URL détaillée déduite de son ID, non auditée individuellement / deep-link template not individually verified |
| **Dried Araknir Blood / Dried Spider Blood** (item `654031403`) | +20 Force permanente ; l’objet apparaît dans **AraknirBloodOrVenomDrop**, catégorie *Dungeon Contribution Item List* / loot list membership | [Item](https://brico.app/database/item/654031403) · [Item Lists](https://brico.app/database/item-list) | **Ne pas transformer la liste de butin en probabilité de drop.** Rencontre et mécanisme précis à confirmer / no verified rate or exact encounter |

## Limites et méthode / Method and limits

- Conserver les identifiants d’objets et connaissances du jeu comme clés de suivi, pas les URL Brico.
- Ne jamais considérer une **fiche Brico existante** comme preuve suffisante de disponibilité en 1.0.
- Les pages d’**obtention** et d’**effet** sont différentes : `/database/item/<item_id>` et `/database/knowledge/<secondary_knowledge_id>`.
- Les liens de **quête**, **échange** et **tâche** sont ajoutés par le code lorsqu’un identifiant numérique apparaît dans la table du jeu. Les schémas d’URL ont été vérifiés sur plusieurs exemples, **pas toutes les URL individuelles**.
- Si une récompense exige un niveau de métier **et un achat / une quête / une fabrication**, elle reste au catalogue. Si la récompense est **accordée automatiquement au niveau**, elle est exclue de toutes les vues et exports.
- L’interface peut afficher **plusieurs chemins** : ils sont issus des tables, non d'une relecture individuelle de toutes les fiches.
- Historique / Historical event sources : à documenter séparément des méthodes confirmées actuellement actives.

**🇬🇧 Rule:** preserve item and knowledge IDs; never invent acquisition steps or drop rates. In-data evidence is not live-world verification. Distinguish automatic level rewards (excluded) from acquired rewards with level prerequisites (retained).
