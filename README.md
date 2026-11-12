# BitCraft 1.0 — Unlocks & Gameplay Tracker

🇫🇷 **Guide de déblocages et d’optimisation**, 🇬🇧 **Gameplay unlock & knowledge tracker**  
Projet communautaire, statique, sans création de compte.

## 🇫🇷 Pourquoi cet outil ?

La priorité est de **révéler ce qui améliore vraiment le gameplay**, même lorsque le jeu ne signale pas clairement l’existence d’un bonus : connaissances permanentes, améliorations de statistiques, capacités, recettes utiles, entraînements, équipements spéciaux.

L’accueil affiche en priorité ces déblocages. Les objets cosmétiques et autres collectionnables disposent d’un onglet séparé. Les récompenses **accordées automatiquement par les niveaux de métier sont exclues** de tous les onglets, de la recherche et des exports. Un niveau requis pour acheter un parchemin ou accomplir une quête ne supprime pas ce déblocage de la liste.

Chaque fiche indique, si les données existent : **effet**, **méthode d’obtention**, **prérequis**, **source** et **niveau de preuve**. Les méthodes non retrouvées sont clairement marquées *« À documenter »* : l’outil ne doit rien inventer.

### Fonctionnalités

- Bonus de statistiques calculés à partir des connaissances et des modificateurs publiés, **ainsi que les valeurs des accessoires tirées de `equipment_desc.stats`** (niveau requis inclus).
- Croisement automatisé avec quêtes, récompenses de tâches, échanges de voyageurs et fabrication, **avec toutes les voies repérées et leurs références de table**.
- Liens directs vers **Brico.app** pour les fiches d’objets (origine), fiches de connaissances (effets), quêtes, échanges et tâches. Un premier lot d’indices d’obtention a été examiné manuellement.
- Guides officiels d'obtention pour les connaissances de pêche exceptionnelles et certains accessoires spécialisés, et signalement des **anciennes sources événementielles** sans preuve d'accessibilité actuelle.
- Filtres de catégorie, impact, rareté, obtention, statut et preuve ; recherche et tri par impact.
- Progression personnelle par monde **1.0 / EA2** : manquant, cible, obtenu, lié au compte, ignorer.
- Notes personnelles, export CSV, sauvegarde et import JSON. Stockage local dans le navigateur.
- Exclusion par défaut des **outils principaux, armes et armures fabriqués**, des connaissances de départ et des données de test.
- **Objets en Astralite exclus du catalogue** : noms d’objets et objets de collection dont l’acte associé est en Astralite. Les connaissances qui parlent de ce matériau restent visibles, tout comme les objets indépendants qui le mentionnent seulement dans leur description.
- Interface en français / anglais ; les intitulés du jeu et certaines notes d’obtention restent actuellement dans la langue source ou en français.

### Attention aux preuves

**Présent dans les données ≠ disponible dans le monde 1.0.** Une source d’obtention trouvée dans les fichiers ne garantit pas que l’objet soit actuellement accessible, ni que tous les prérequis soient connus. Les effets affichés sont des valeurs de tables, non une simulation du fonctionnement exact des bonus.

Le 13 novembre 2026, il faudra contrôler les entrées prioritaires dans le nouveau monde. La disponibilité 1.0 n’est pas certifiée par la version préparatoire.

### Mise en ligne

Dans le dépôt : **Settings → Pages → Deploy from a branch → main → / (root)**. Après fusion des changements, GitHub Pages publie `index.html`. Sans serveur ni token. Le HTML charge les tables publiques pendant l’utilisation ; sans réseau, seules quelques fiches d’exemple sont visibles.

La progression n’est **pas envoyée sur un serveur** et aucun identifiant BitCraft n’est demandé. Exporter une sauvegarde JSON pour changer d’ordinateur.

## 🇬🇧 Gameplay discovery first

This is **not only a cosmetic collection checklist**. The main view emphasizes permanent upgrades, statistical benefits, abilities, useful recipes, and unusual gameplay unlocks that players may otherwise miss.

For each unlock the app provides a known effect, any **traced acquisition source** (quests, traders, crafting, tasks), prerequisites, links and an evidence label. Unknown acquisition details are explicitly marked as **not yet documented**, rather than guessed.

**Automatically granted profession-level unlocks are omitted entirely**, while scrolls, quests, purchases and other unlocks that merely require a profession level stay visible. Brico.app deep links connect each supported source to item, knowledge, quest, trade or task details.

**Astralite-named objects are excluded** across the catalog, including collectibles with Astralite-named deeds. Knowledge about Astralite and unrelated items mentioning it only in a description remain visible. Existing user progress keys are not deleted.

Players can track their progress per 1.0/EA2 world, set targets and priorities, attach local notes and export CSV/JSON. Ordinary craftable main profession tools, weapons and armor are excluded by default. Cosmetic collectibles remain searchable in a separate view.

**Important:** a record in the static tables is not proof the unlock can be acquired in the 1.0 launch world. A traced path is not live availability confirmation. The interface is bilingual, but detailed acquisition strings are not yet fully translated.

## Sources / Sources

- [BitCraftToolBox game data](https://github.com/BitCraftToolBox/BitCraft_GameData/tree/cereal/cs/static)
- [Brico's Toolbox](https://brico.app/database)
- [Official BitCraft announcements](https://bitcraftonline.com/news)
- [Evidence policy / Politique de preuves](DATA_POLICY.md)
- [Brico.app — audit des sources / source audit](BRICO_AUDIT.md)

## Roadmap / Suite

- [x] Gameplay-first cards, filters, stat-modifier links, acquisitions and local tracking
- [x] Official fishing knowledge unlock guidance; source-linked acquisition alternatives; specialist crafted accessories preserved
- [x] Remove automatic profession-level unlocks from the entire catalogue; keep level-gated acquired knowledge
- [x] Add Brico.app deep links and a first reviewed acquisition-source sample
- [x] Exclude Astralite-made objects without hiding unrelated unlocks or deleting saved progress
- [x] Resolve prerequisite quest names in acquisition guides; add Araknir's Slayer quest
- [ ] Verify in-world acquisition conditions and availability after the 1.0 release
- [ ] Complete FR/EN parity of all detailed item descriptions and methods
- [ ] Audit hidden permanent bonuses, gameplay improvements and noncraftable gear
- [ ] Optional audited community contributions
- [ ] Player-data import only if supported and consent-based

## Development / Développement

Single-file `index.html` site; no npm build or backend. CI checks embedded JS syntax and essential UI contracts. Public game tables are loaded from the `cereal/cs` branch at runtime.
