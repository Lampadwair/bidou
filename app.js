// Bidou : le code de l'appli.
'use strict';
/* =================== Constantes =================== */
const APP_VER='bidou-v1';
const DAYS=[['lun','Lundi'],['mar','Mardi'],['mer','Mercredi'],['jeu','Jeudi'],['ven','Vendredi'],['sam','Samedi'],['dim','Dimanche']];
const SLOTS=[['midi','Midi'],['soir','Soir']];
const MODES={
  off:{label:'—',short:'—',title:'Pas de repas'},
  express:{label:'Express',short:'20 min',title:'Express · 20 min max',max:20,prompt:'EXPRESS : 20 minutes maximum tout compris (préparation + cuisson), très peu de vaisselle'},
  normal:{label:'Normal',short:'45 min',title:'Normal · 45 min max',max:45,prompt:'NORMAL : entre 25 et 45 minutes tout compris'},
  long:{label:"J'ai le temps",short:'1 h +',title:"J'ai le temps · 1 h et +",max:180,prompt:"J'AI LE TEMPS : plat plus élaboré ou mijoté, 1 h ou plus (cuisson passive bienvenue), le plaisir de cuisiner"}
};
const MODE_KEYS=['off','express','normal','long'];
const RAYONS=['Fruits & légumes','Boucherie & poisson','Crèmerie & œufs','Boulangerie','Épicerie salée','Épicerie sucrée','Surgelés','Épices & condiments','Boissons','Autre'];
const GEAR=['plaques','four','micro-ondes','airfryer','mixeur','cocotte','robot cuiseur','wok','cuiseur vapeur','plancha'];
const CUISINES=['française','italienne','asiatique','japonaise','indienne','mexicaine','méditerranéenne','libanaise','africaine','américaine'];
const DIETS=['végétarien','pescétarien','sans gluten','sans lactose','sans porc','halal'];
const LEVELS=[['debutant','Débutant'],['a-laise',"À l'aise"],['confirme','Confirmé']];
const AUDACE=[['classique','Classique','des recettes familières et réconfortantes, bien exécutées'],['audace',"Un peu d'audace",'des classiques revisités avec une touche originale (une épice, une association inattendue, une technique simple qui change tout)'],['surprise','Surprends-moi',"des recettes vraiment originales : cuisines du monde, associations que je n'aurais pas eu l'idée de faire, tout en restant faisables à la maison"]];
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const SEASON=[
 'poireau, chou, chou de Bruxelles, carotte, céleri-rave, endive, potiron, panais, topinambour, mâche, navet, orange, clémentine, kiwi, pomme, poire',
 'poireau, chou, carotte, céleri-rave, endive, panais, topinambour, mâche, navet, citron, orange, pamplemousse, kiwi, pomme, poire',
 'poireau, chou-fleur, épinard, endive, radis, carotte, panais, blette, citron, kiwi, pomme, poire',
 'asperge, radis, épinard, petits pois, blette, carotte nouvelle, oignon nouveau, artichaut, rhubarbe, fraise',
 'asperge, petits pois, fève, radis, artichaut, courgette, laitue, oignon nouveau, fraise, rhubarbe, cerise',
 'courgette, tomate, concombre, haricot vert, petits pois, fève, aubergine, poivron, fraise, cerise, abricot, melon',
 'tomate, courgette, aubergine, poivron, haricot vert, concombre, maïs, fenouil, abricot, pêche, nectarine, melon, framboise',
 'tomate, aubergine, poivron, courgette, haricot vert, maïs, fenouil, pêche, prune, melon, figue, mûre',
 'tomate, poivron, courgette, potiron, champignons, brocoli, poireau, raisin, figue, prune, pomme, poire',
 'courge, potiron, potimarron, champignons, brocoli, chou-fleur, céleri-rave, poireau, betterave, épinard, pomme, poire, raisin, coing, châtaigne',
 'potiron, potimarron, courge butternut, poireau, chou, chou de Bruxelles, carotte, panais, céleri-rave, endive, champignons, topinambour, pomme, poire, kiwi, clémentine, châtaigne',
 'potiron, courge butternut, poireau, chou, chou de Bruxelles, carotte, panais, céleri-rave, endive, mâche, topinambour, orange, clémentine, mandarine, kiwi, pomme, poire'
];
const STAPLE_WORDS=['sel','poivre','huile','vinaigre','farine','sucre','sauce soja','moutarde'];

/* =================== Icônes =================== */
const I={
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2"/><circle cx="9.5" cy="19.5" r="1.2"/><circle cx="17" cy="19.5" r="1.2"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.7 1.6 1.6.7-1.6.7L19 21l-.7-1.6-1.6-.7 1.6-.7z"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  leaf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 19C5 10 11 5 20 4c0 9-5 15-14 15"/><path d="M5 19l7-7"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'
};
function logo(size){ // logo 6b : bonhomme au bol, avec baguettes
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="Bidou"><g stroke="#8a5a2b" stroke-width="3.4" stroke-linecap="round"><path d="M64 46L90 8"/><path d="M70 46L96 14"/></g><circle cx="46" cy="24" r="13" fill="#fff1e2" stroke="#22150f" stroke-width="3.4"/><g fill="none" stroke="#22150f" stroke-width="3.2" stroke-linecap="round"><path d="M39.5 23q2.5-3.3 5 0M47.5 23q2.5-3.3 5 0"/><path d="M40.5 28.5q5.5 5.5 11 0"/></g><circle cx="38" cy="27.5" r="2.2" fill="#f08a6a"/><circle cx="54" cy="27.5" r="2.2" fill="#f08a6a"/><path d="M16 46H84C84 71 69 87 50 87C31 87 16 71 16 46Z" fill="#e3a93a" stroke="#22150f" stroke-width="3.4" stroke-linejoin="round"/><rect x="38" y="86" width="24" height="6" rx="3" fill="#22150f"/><rect x="11" y="41" width="78" height="9" rx="4.5" fill="#22150f"/><path d="M26 60h48" stroke="#fff1e2" stroke-width="3" stroke-dasharray="2 5" stroke-linecap="round"/><circle cx="40" cy="68" r="5.5" fill="#fff1e2" stroke="#22150f" stroke-width="3"/><circle cx="60" cy="68" r="5.5" fill="#fff1e2" stroke="#22150f" stroke-width="3"/></svg>`;
}

/* =================== Bibliothèque intégrée (exemples et secours sans Claude) =================== */
const RY={FL:'Fruits & légumes',BP:'Boucherie & poisson',CO:'Crèmerie & œufs',BO:'Boulangerie',ES:'Épicerie salée',EP:'Épicerie sucrée',SU:'Surgelés',EC:'Épices & condiments',BS:'Boissons'};
function R(o){o.id='lib-'+o.key;o.total=o.prep+o.cook;o.ing=o.ing.map(([n,q,u,r,p])=>({n,q,u,r:RY[r],p:!!p}));o.months=o.months||[];return o}
const LIB=[
R({key:'nouilles-poulet',name:'Nouilles sautées poulet, brocoli & cacahuètes',desc:'Un wok minute, sucré-salé, croquant.',mode:'express',prep:8,cook:12,diff:'facile',gear:['plaques'],kcal:640,prot:40,carb:70,fat:20,cost:2.9,tags:['asiatique'],months:[9,10,11,12,1,2,3],
 ing:[['nouilles de blé',80,'g','ES'],['blanc de poulet',120,'g','BP'],['brocoli',150,'g','FL'],['carotte',1,'pièce','FL'],['gingembre frais',5,'g','FL'],['ail',1,'gousse','FL'],['cacahuètes grillées',15,'g','ES'],['sauce soja',1.5,'c. à s.','EC',1],['miel',1,'c. à c.','EP',1],['huile neutre',1,'c. à s.','EC',1]],
 steps:['Cuis les nouilles selon le paquet, égoutte-les et passe-les sous l’eau froide.','Coupe le poulet en lamelles, le brocoli en petits bouquets et la carotte en fins bâtonnets.','Saisis le poulet 4 min à feu vif dans l’huile, puis réserve-le.','Fais sauter brocoli et carotte 4 min avec l’ail et le gingembre râpés et 2 c. à s. d’eau.','Remets le poulet et les nouilles, ajoute soja et miel, mélange 1 min.','Sers parsemé de cacahuètes concassées.'],
 tip:'Une poignée de pousses d’épinards à la toute fin ajoute des légumes sans effort.'}),
R({key:'veloute-potimarron',name:'Velouté de potimarron, croûtons au comté',desc:'Doux, orange et réconfortant, prêt en 20 minutes.',mode:'express',prep:6,cook:14,diff:'facile',gear:['plaques','mixeur'],kcal:520,prot:20,carb:52,fat:24,cost:1.9,tags:['végétarien','française'],months:[9,10,11,12,1],
 ing:[['potimarron',300,'g','FL'],['oignon',0.5,'pièce','FL'],['lait de coco',50,'ml','ES'],['comté',30,'g','CO'],['pain de campagne',1,'tranche','BO'],['graines de courge',10,'g','ES'],['bouillon de légumes',0.5,'cube','EC',1],['muscade',1,'pincée','EC',1]],
 steps:['Lave le potimarron (pas besoin de l’éplucher) et coupe-le en cubes.','Fais revenir l’oignon 2 min, ajoute le potimarron et de l’eau à hauteur avec le bouillon.','Laisse cuire 12 min à couvert, jusqu’à ce que la courge soit tendre.','Mixe avec le lait de coco et la muscade, rectifie le sel.','Grille le pain avec le comté râpé dessus, coupe en croûtons et parsème de graines.'],
 tip:'Un filet d’huile de noisette au service change tout.'}),
R({key:'omelette-feta',name:'Omelette roulée épinards-feta, salade de tomates',desc:'Moelleuse, salée juste comme il faut.',mode:'express',prep:5,cook:10,diff:'facile',gear:['plaques'],kcal:480,prot:30,carb:22,fat:30,cost:2.4,tags:['végétarien'],months:[4,5,6,7,8,9],
 ing:[['œufs',3,'pièce','CO'],['pousses d’épinards',80,'g','FL'],['feta',40,'g','CO'],['tomates',2,'pièce','FL'],['pain complet',1,'tranche','BO'],['huile d’olive',1,'c. à s.','EC',1],['vinaigre balsamique',1,'c. à c.','EC',1]],
 steps:['Coupe les tomates en quartiers, assaisonne avec un filet d’huile, le vinaigre, sel et poivre.','Fais tomber les épinards 1 min dans une poêle huilée, réserve.','Bats les œufs avec sel et poivre, verse dans la poêle à feu moyen.','Quand le dessus est presque pris, ajoute épinards et feta émiettée, roule l’omelette.','Sers avec la salade et le pain grillé.'],
 tip:'Un peu de piment d’Espelette dans les œufs relève tout.'}),
R({key:'wrap-thon',name:'Wraps thon, avocat & crudités',desc:'Zéro cuisson, frais et rassasiant.',mode:'express',prep:10,cook:0,diff:'facile',gear:[],kcal:560,prot:32,carb:50,fat:24,cost:2.6,tags:['sans cuisson'],
 ing:[['tortillas complètes',2,'pièce','BO'],['thon au naturel',100,'g','ES'],['avocat',0.5,'pièce','FL'],['carotte',1,'pièce','FL'],['concombre',0.25,'pièce','FL'],['fromage blanc',40,'g','CO'],['citron',0.5,'pièce','FL'],['salade verte',30,'g','FL']],
 steps:['Écrase l’avocat avec le jus de citron, sel et poivre.','Mélange le thon émietté avec le fromage blanc.','Râpe la carotte, coupe le concombre en bâtonnets.','Tartine les tortillas d’avocat, ajoute thon, crudités et salade.','Roule serré et coupe en deux.'],
 tip:'Passe les wraps 1 min à la poêle pour un côté croustillant.'}),
R({key:'pates-pois-chiches',name:'Pâtes complètes pois chiches, citron & roquette',desc:'Une assiette vive et croquante, riche en fibres.',mode:'express',prep:6,cook:12,diff:'facile',gear:['plaques'],kcal:620,prot:26,carb:88,fat:16,cost:1.6,tags:['végétarien','italienne'],
 ing:[['pâtes complètes',90,'g','ES'],['pois chiches cuits',120,'g','ES'],['roquette',40,'g','FL'],['citron',0.5,'pièce','FL'],['ail',1,'gousse','FL'],['parmesan',15,'g','CO'],['huile d’olive',1,'c. à s.','EC',1],['piment d’Espelette',1,'pincée','EC',1]],
 steps:['Cuis les pâtes al dente, garde une louche d’eau de cuisson.','Fais dorer les pois chiches égouttés 5 min dans l’huile avec l’ail émincé et le piment.','Ajoute les pâtes, le zeste et le jus du citron et un peu d’eau de cuisson.','Hors du feu, mélange la roquette et le parmesan.'],
 tip:'Laisse les pois chiches colorer sans trop remuer : ils deviennent croustillants.'}),
R({key:'riz-saute',name:'Riz sauté aux œufs, petits pois & sésame',desc:'Le plat anti-gaspi par excellence.',mode:'express',prep:5,cook:10,diff:'facile',gear:['plaques'],kcal:560,prot:22,carb:78,fat:16,cost:1.5,tags:['asiatique','végétarien'],
 ing:[['riz cuit',180,'g','ES'],['œufs',2,'pièce','CO'],['petits pois surgelés',80,'g','SU'],['carotte',1,'pièce','FL'],['oignon nouveau',1,'pièce','FL'],['graines de sésame',1,'c. à c.','ES'],['sauce soja',1,'c. à s.','EC',1],['huile neutre',1,'c. à s.','EC',1]],
 steps:['Coupe la carotte en petits dés et l’oignon nouveau en rondelles.','Fais sauter carotte et petits pois 3 min dans l’huile bien chaude.','Pousse les légumes sur le côté, brouille les œufs dans la poêle.','Ajoute le riz et la sauce soja, saute 3 min à feu vif.','Sers avec l’oignon nouveau et le sésame.'],
 tip:'Le riz de la veille marche mieux : il ne colle pas.'}),
R({key:'curry-lentilles',name:'Curry de lentilles corail au lait de coco',desc:'Doux, parfumé et très économique.',mode:'normal',prep:10,cook:25,diff:'facile',gear:['plaques'],kcal:590,prot:24,carb:80,fat:18,cost:1.7,tags:['indienne','végétarien'],
 ing:[['lentilles corail',75,'g','ES'],['lait de coco',100,'ml','ES'],['tomates concassées',100,'g','ES'],['oignon',0.5,'pièce','FL'],['ail',1,'gousse','FL'],['gingembre frais',5,'g','FL'],['pousses d’épinards',50,'g','FL'],['riz basmati',60,'g','ES'],['coriandre fraîche',0.25,'botte','FL'],['curry en poudre',1,'c. à c.','EC',1],['huile neutre',1,'c. à s.','EC',1]],
 steps:['Lance la cuisson du riz.','Fais revenir l’oignon émincé 5 min dans l’huile, ajoute ail, gingembre et curry 1 min.','Ajoute lentilles rincées, tomates, lait de coco et 150 ml d’eau par portion.','Laisse mijoter 18 min en remuant, jusqu’à ce que les lentilles fondent.','Incorpore les épinards, sale, et sers avec le riz et la coriandre.'],
 tip:'Un trait de citron vert à la fin réveille le curry.'}),
R({key:'saumon-patate-douce',name:'Saumon rôti, patate douce & haricots verts',desc:'Tout au four, sauce yaourt-citron.',mode:'normal',prep:10,cook:25,diff:'facile',gear:['four','plaques'],kcal:640,prot:34,carb:55,fat:30,cost:4.2,tags:['poisson'],
 ing:[['pavé de saumon',1,'pièce','BP'],['patate douce',200,'g','FL'],['haricots verts surgelés',150,'g','SU'],['yaourt grec',50,'g','CO'],['citron',0.5,'pièce','FL'],['herbes de Provence',1,'c. à c.','EC',1],['huile d’olive',1,'c. à s.','EC',1]],
 steps:['Préchauffe le four à 200 °C.','Coupe la patate douce en cubes, mélange avec huile, herbes, sel ; enfourne 10 min.','Ajoute le saumon sur la plaque, arrose de citron, enfourne encore 12 à 15 min.','Pendant ce temps, cuis les haricots verts 8 min à l’eau bouillante salée.','Mélange yaourt, zeste de citron, sel, poivre et sers à côté.'],
 tip:'Le saumon est parfait quand il se détache juste en lamelles.'}),
R({key:'chili-sin-carne',name:'Chili sin carne fumé',desc:'Réconfortant et encore meilleur réchauffé.',mode:'normal',prep:10,cook:30,diff:'facile',gear:['plaques'],kcal:580,prot:24,carb:85,fat:12,cost:1.8,tags:['mexicaine','végétarien'],
 ing:[['haricots rouges',150,'g','ES'],['maïs',50,'g','ES'],['tomates concassées',150,'g','ES'],['poivron rouge',0.5,'pièce','FL'],['oignon',0.5,'pièce','FL'],['ail',1,'gousse','FL'],['riz',60,'g','ES'],['yaourt grec',30,'g','CO'],['cumin',1,'c. à c.','EC',1],['paprika fumé',1,'c. à c.','EC',1],['huile d’olive',1,'c. à s.','EC',1]],
 steps:['Lance la cuisson du riz.','Fais revenir oignon, ail et poivron en dés 6 min dans l’huile.','Ajoute cumin et paprika 1 min, puis tomates, haricots rincés et maïs.','Laisse mijoter 20 min à couvert, sale et poivre.','Sers avec le riz et une cuillère de yaourt.'],
 tip:'Un carré de chocolat noir dans le chili donne une profondeur étonnante.'}),
R({key:'poulet-citron-miel',name:'Poulet citron-miel, semoule aux herbes',desc:'Laqué, acidulé, et une semoule pleine de menthe.',mode:'normal',prep:10,cook:20,diff:'facile',gear:['plaques'],kcal:610,prot:40,carb:70,fat:16,cost:2.9,tags:['méditerranéenne'],months:[5,6,7,8,9],
 ing:[['blanc de poulet',130,'g','BP'],['semoule complète',70,'g','ES'],['courgette',1,'pièce','FL'],['citron',0.5,'pièce','FL'],['menthe fraîche',0.25,'botte','FL'],['ail',1,'gousse','FL'],['miel',1,'c. à s.','EP',1],['huile d’olive',1,'c. à s.','EC',1]],
 steps:['Couvre la semoule du même volume d’eau bouillante salée, laisse gonfler 5 min.','Coupe la courgette en demi-rondelles, fais-la dorer 6 min, réserve.','Saisis le poulet en morceaux 6 min, ajoute ail, miel et jus de citron, laisse laquer 2 min.','Égrène la semoule avec un filet d’huile, la menthe ciselée et la courgette.','Sers le poulet sur la semoule.'],
 tip:'Garde quelques feuilles de menthe entières pour le dressage.'}),
R({key:'gratin-chou-fleur',name:'Chou-fleur rôti, pois chiches & sauce tahini',desc:'Doré au four, croquant, une sauce citronnée.',mode:'normal',prep:10,cook:30,diff:'facile',gear:['four'],kcal:560,prot:22,carb:52,fat:28,cost:2.1,tags:['libanaise','végétarien'],months:[10,11,12,1,2,3],
 ing:[['chou-fleur',250,'g','FL'],['pois chiches cuits',120,'g','ES'],['tahini',1,'c. à s.','ES'],['citron',0.5,'pièce','FL'],['yaourt grec',40,'g','CO'],['persil plat',0.25,'botte','FL'],['pain pita',1,'pièce','BO'],['cumin',1,'c. à c.','EC',1],['huile d’olive',1,'c. à s.','EC',1]],
 steps:['Préchauffe le four à 220 °C.','Détaille le chou-fleur en bouquets, mélange avec pois chiches, huile, cumin et sel.','Enfourne 25 à 30 min, jusqu’à ce que les bords soient bien dorés.','Mélange tahini, yaourt, jus de citron et un peu d’eau pour une sauce nappante.','Sers avec la sauce, le persil et la pita tiède.'],
 tip:'Plus le four est chaud, plus le chou-fleur caramélise.'}),
R({key:'boeuf-mijote',name:'Bœuf mijoté aux carottes, façon bourguignon léger',desc:'Le plat du dimanche qui embaume la maison.',mode:'long',prep:20,cook:120,diff:'moyen',gear:['plaques','cocotte'],kcal:650,prot:42,carb:45,fat:28,cost:4.5,tags:['française'],months:[10,11,12,1,2,3],
 ing:[['bœuf à braiser',150,'g','BP'],['carotte',2,'pièce','FL'],['champignons de Paris',80,'g','FL'],['oignon',0.5,'pièce','FL'],['pommes de terre',200,'g','FL'],['concentré de tomate',1,'c. à s.','ES'],['vin rouge (facultatif)',80,'ml','BS'],['bouillon de bœuf',0.5,'cube','EC',1],['farine',1,'c. à s.','EC',1],['thym et laurier',1,'pincée','EC',1],['huile neutre',1,'c. à s.','EC',1]],
 steps:['Coupe le bœuf en gros cubes, sale, poivre et farine-les.','Fais-les dorer en plusieurs fois dans la cocotte huilée, réserve.','Fais revenir l’oignon, ajoute le concentré de tomate 1 min, déglace au vin.','Remets la viande, ajoute carottes en tronçons, bouillon, thym, laurier et de l’eau à hauteur.','Couvre et laisse mijoter 1 h 30 à feu doux.','Ajoute champignons et pommes de terre en morceaux, poursuis 30 min.'],
 tip:'Fais-en deux fois plus : ça se congèle très bien.'}),
R({key:'poulet-roti-epices',name:'Cuisses de poulet rôties aux épices, légumes racines',desc:'Peau croustillante, légumes caramélisés, sauce yaourt.',mode:'long',prep:15,cook:60,diff:'facile',gear:['four'],kcal:680,prot:45,carb:50,fat:30,cost:3.6,tags:['française'],months:[10,11,12,1,2,3],
 ing:[['cuisse de poulet',1,'pièce','BP'],['panais',1,'pièce','FL'],['carotte',1,'pièce','FL'],['pommes de terre',150,'g','FL'],['oignon rouge',0.5,'pièce','FL'],['ail',2,'gousse','FL'],['yaourt grec',50,'g','CO'],['citron',0.5,'pièce','FL'],['paprika',1,'c. à c.','EC',1],['cumin',1,'c. à c.','EC',1],['huile d’olive',1.5,'c. à s.','EC',1]],
 steps:['Préchauffe le four à 200 °C.','Frotte le poulet avec huile, paprika, cumin, sel et poivre.','Coupe les légumes en gros morceaux, mélange-les avec l’huile et l’ail en chemise.','Dispose le poulet sur les légumes et enfourne 55 à 60 min en arrosant à mi-cuisson.','Mélange yaourt, citron et l’ail rôti écrasé pour la sauce.'],
 tip:'Laisse reposer le poulet 5 min avant de servir.'}),
R({key:'risotto-champignons',name:'Risotto crémeux aux champignons',desc:'Le plaisir de remuer tranquillement.',mode:'long',prep:10,cook:40,diff:'moyen',gear:['plaques'],kcal:620,prot:20,carb:85,fat:20,cost:2.6,tags:['italienne','végétarien'],months:[9,10,11,12],
 ing:[['riz arborio',80,'g','ES'],['champignons',150,'g','FL'],['échalote',1,'pièce','FL'],['parmesan',25,'g','CO'],['beurre',10,'g','CO'],['vin blanc (facultatif)',40,'ml','BS'],['persil plat',0.25,'botte','FL'],['salade verte',50,'g','FL'],['bouillon de légumes',0.5,'cube','EC',1],['huile d’olive',1,'c. à s.','EC',1]],
 steps:['Prépare 300 ml de bouillon chaud par portion.','Fais dorer les champignons émincés à feu vif, réserve.','Fais suer l’échalote, ajoute le riz et nacre-le 2 min, déglace au vin.','Ajoute le bouillon louche par louche en remuant, pendant 18 à 20 min.','Hors du feu, incorpore beurre, parmesan et champignons, couvre 2 min.','Sers avec le persil et une salade verte.'],
 tip:'Le risotto doit onduler comme une vague quand tu secoues la casserole.'})
];

/* =================== Outils =================== */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const sum=a=>a.reduce((x,y)=>x+(+y||0),0);
const nf0=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}), nf1=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1});
const eur=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n||0);
function mins(m){m=Math.round(m||0);if(m<60)return m+' min';const h=Math.floor(m/60),r=m%60;return h+' h'+(r?' '+String(r).padStart(2,'0'):'')}
function frac(x){const w=Math.floor(x+1e-9),f=Math.round((x-w)*4)/4;const F={0.25:'¼',0.5:'½',0.75:'¾'};if(f===0)return String(w);if(f===1)return String(w+1);return (w?w+' ':'')+F[f]}
const LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{if(v===''||v==null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}}};
function dayLabel(k){const[d,s]=k.split('-');return (DAYS.find(x=>x[0]===d)||[,''])[1]+' '+(s==='midi'?'midi':'soir')}
const month=()=>new Date().getMonth()+1;
const inSeason=r=>!!r&&(r.season===true||(r.months||[]).includes(month()));

/* =================== Données =================== */
function defaultPlan(){const p={};for(const[d]of DAYS)for(const[s]of SLOTS)p[d+'-'+s]='off';
  Object.assign(p,{'lun-soir':'express','mar-soir':'normal','mer-soir':'express','jeu-soir':'normal','ven-soir':'express','sam-soir':'long','dim-midi':'long','dim-soir':'express'});return p}
function defaultProfile(){return{setup:false,household:1,level:'a-laise',gear:['plaques','four','micro-ondes'],cuisines:['française','italienne','asiatique'],likes:'',dislikes:[],diet:[],
  plan:defaultPlan(),season:true,useMine:true,budgetOn:false,budget:50,calOn:false,kcal:2400,theme:'auto'}}
function weekFromPlan(plan){const slots={};for(const k in plan)slots[k]={mode:plan[k],recipe:null,pinned:false,portions:null};return{createdAt:null,envies:'',audace:'audace',slots}}
function norm(d){
  d=d&&typeof d==='object'?d:{};
  const p=Object.assign(defaultProfile(),d.profile||{});p.plan=Object.assign(defaultPlan(),p.plan||{});
  const w=d.week&&d.week.slots?d.week:weekFromPlan(p.plan);
  const base=weekFromPlan(p.plan).slots;for(const k in base){w.slots[k]=Object.assign(base[k],w.slots[k]||{})}
  return{profile:p,week:w,favs:Array.isArray(d.favs)?d.favs:[],mine:Array.isArray(d.mine)?d.mine:[],
    shop:Object.assign({checked:{},extra:[],hideDone:false},d.shop||{})};
}
let D=norm((()=>{try{return JSON.parse(LS.get('bidou_d')||'null')}catch(e){return null}})());
const UI={ob:0,carnetTab:'mine',ideas:(()=>{try{return JSON.parse(LS.get('bidou_ideas')||'[]')}catch(e){return[]}})(),ideaForm:{envie:'',use:'',mode:'normal',audace:'audace'},gen:null,busy:{},sheet:null,authMode:'signup',authErr:'',screen:null,install:null};
function save(){LS.set('bidou_d',JSON.stringify(D));markDirty()}
const activeSlots=()=>Object.keys(D.week.slots).filter(k=>D.week.slots[k].mode!=='off');
const portionsOf=k=>D.week.slots[k].portions||D.profile.household;
const mealKcal=()=>Math.round(D.profile.kcal*0.35/10)*10;
const isFav=r=>!!r&&D.favs.some(f=>f.name===r.name);
function applyTheme(){const t=D.profile.theme;if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme')}

/* =================== Compte et synchro (Supabase) =================== */
const CFG=window.BIDOU_CONFIG||{};
const SUPA={url:String(CFG.supabaseUrl||'').replace(/\/$/,''),key:String(CFG.supabaseKey||'')};
const SB={
  on(){return !!SUPA.url&&!!SUPA.key},
  sess(){try{return JSON.parse(LS.get('bidou_auth')||'null')}catch(e){return null}},
  setSess(x){LS.set('bidou_auth',x?JSON.stringify(x):'')},
  store(j){SB.setSess({at:j.access_token,rt:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000,uid:j.user.id,email:j.user.email})},
  async req(path,o={}){const h={apikey:SUPA.key,'Content-Type':'application/json',...(o.headers||{})};
    if(o.auth!==false){const t=await SB.token();if(!t)throw{code:'no_session'};h.Authorization='Bearer '+t}
    let r;try{r=await fetch(SUPA.url+path,{method:o.method||'GET',headers:h,body:o.body?JSON.stringify(o.body):undefined})}catch(e){throw{code:'offline'}}
    const txt=await r.text();let j=null;try{j=txt?JSON.parse(txt):null}catch(e){}
    if(!r.ok)throw{code:r.status,msg:(j&&(j.msg||j.error_description||j.message||j.error_code||j.error))||''};
    return j},
  async token(){const x=SB.sess();if(!x)return null;if(Date.now()<x.exp-60000)return x.at;
    try{const j=await SB.req('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:x.rt},auth:false});SB.store(j);return j.access_token}
    catch(e){if(e.code===400||e.code===401)SB.setSess(null);return null}},
  back(){return encodeURIComponent(location.origin+location.pathname)},
  async login(email,password){SB.store(await SB.req('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password},auth:false}))},
  async signup(email,password){const j=await SB.req('/auth/v1/signup?redirect_to='+SB.back(),{method:'POST',body:{email,password},auth:false});if(j&&j.access_token){SB.store(j);return true}return false},
  async recover(email){await SB.req('/auth/v1/recover?redirect_to='+SB.back(),{method:'POST',body:{email},auth:false})},
  async logout(){try{await SB.req('/auth/v1/logout',{method:'POST'})}catch(e){}SB.setSess(null)}
};
function authErr(e){const m=String(e&&e.msg||'');if(e&&e.code==='offline')return'Pas de connexion internet.';
  if(/invalid.?login|invalid_credentials/i.test(m))return'E-mail ou mot de passe incorrect.';if(/not.?confirmed/i.test(m))return'Confirme d’abord ton e-mail avec le lien reçu.';
  if(/already|exists/i.test(m))return'Ce compte existe déjà : connecte-toi.';if(/signup.*(not allowed|disabled)|signups/i.test(m))return'Les inscriptions sont fermées sur cette appli.';
  if(/password/i.test(m))return'Mot de passe trop court (6 caractères minimum).';if(e&&e.code===429)return'Trop de tentatives : réessaie dans quelques minutes.';
  return'Échec'+(m?' : '+m:'')+'. Réessaie plus tard.'}
let DIRTY=!!LS.get('bidou_dirty'),VER=0,PUSH_T=null,SYNC_BUSY=false,SYNC='local';
function signedIn(){return SB.on()&&!!SB.sess()}
function markDirty(){if(!signedIn())return;DIRTY=true;VER++;LS.set('bidou_dirty','1');clearTimeout(PUSH_T);PUSH_T=setTimeout(sync,1200)}
function mergeData(loc,rem){
  const uniq=(a,b)=>{const m=new Map();[...(b||[]),...(a||[])].forEach(x=>m.set(x.id||x.name,x));return[...m.values()]};
  return norm({profile:loc.profile.setup?loc.profile:rem.profile,week:loc.week.createdAt>=(rem.week&&rem.week.createdAt||'')?loc.week:rem.week,
    favs:uniq(loc.favs,rem.favs),mine:uniq(loc.mine,rem.mine),shop:loc.shop})}
async function sync(){if(!signedIn()||SYNC_BUSY)return;SYNC_BUSY=true;let failed=false;
  try{const x=SB.sess();const uid=encodeURIComponent(x.uid);
    const head=await SB.req('/rest/v1/bidou_data?select=updated_at&user_id=eq.'+uid);let row=head&&head[0];
    if(row&&row.updated_at!==(LS.get('bidou_pulled')||'')){
      const full=await SB.req('/rest/v1/bidou_data?select=d,updated_at&user_id=eq.'+uid);row=full&&full[0]||row;
      const rem=norm(row.d);D=DIRTY?mergeData(D,rem):rem;LS.set('bidou_d',JSON.stringify(D));LS.set('bidou_pulled',row.updated_at);applyTheme();softRender()}
    if(DIRTY||!row){const v=VER;
      const res=await SB.req('/rest/v1/bidou_data?on_conflict=user_id&select=updated_at',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:{user_id:x.uid,d:D,updated_at:new Date().toISOString()}});
      if(VER===v){DIRTY=false;LS.set('bidou_dirty','')}if(res&&res[0])LS.set('bidou_pulled',res[0].updated_at)}
    SYNC='ok'}
  catch(e){failed=true;if(e.code==='no_session'){SYNC='local';toast('Session expirée : reconnecte-toi dans « Moi ».');softRender()}else SYNC=e.code==='offline'?'offline':'err'}
  finally{SYNC_BUSY=false;if(DIRTY&&!failed){clearTimeout(PUSH_T);PUSH_T=setTimeout(sync,1500)}}}
function claimDevice(){const x=SB.sess(),id=x&&x.uid;if(!id)return;const own=LS.get('bidou_owner');
  if(own&&own!==id){D=norm({});LS.set('bidou_d',JSON.stringify(D));DIRTY=false;LS.set('bidou_dirty','');LS.set('bidou_pulled','')}
  else if(!own&&D.profile.setup){DIRTY=true;LS.set('bidou_dirty','1')}
  LS.set('bidou_owner',id)}
let LOOP=false;
function startSync(){claimDevice();SYNC='wait';sync();
  if(!LOOP){LOOP=true;setInterval(()=>{if(document.visibilityState==='visible')sync()},60000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){sync();checkVersion()}});addEventListener('online',()=>sync())}}
function handleAuthHash(){const h=location.hash;if(!/access_token=/.test(h))return false;const q=new URLSearchParams(h.slice(1));
  const at=q.get('access_token'),rt=q.get('refresh_token'),type=q.get('type'),exp=+q.get('expires_in')||3600;
  history.replaceState(null,'',location.pathname+'#semaine');if(!SB.on()||!at)return true;
  fetch(SUPA.url+'/auth/v1/user',{headers:{apikey:SUPA.key,Authorization:'Bearer '+at}}).then(r=>r.json()).then(u=>{if(!u||!u.id)return;
    SB.store({access_token:at,refresh_token:rt,expires_in:exp,user:u});startSync();
    if(type==='recovery'){openSheet({type:'password'})}else toast('Compte confirmé, tu es connecté.');render()}).catch(()=>{});return true}

/* =================== Claude via la fonction Supabase =================== */
async function askChef(prompt,o={}){
  if(!SB.on())throw{code:'no_config'};
  const t=await SB.token();if(!t)throw{code:'no_session'};
  let r;try{r=await fetch(SUPA.url+'/functions/v1/bidou-chef',{method:'POST',headers:{apikey:SUPA.key,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({prompt,max_tokens:o.max||8000}),signal:o.signal})}
  catch(e){if(e&&e.name==='AbortError')throw{code:'cancelled'};throw{code:'offline'}}
  if(!r.ok){let j=null;try{j=await r.json()}catch(e){}throw{code:r.status,msg:j&&j.error||''}}
  const rd=r.body.getReader(),dec=new TextDecoder();let text='';
  try{for(;;){const{done,value}=await rd.read();if(done)break;text+=dec.decode(value,{stream:true});o.onText&&o.onText(text)}}
  catch(e){if(e&&e.name==='AbortError')throw{code:'cancelled'};throw{code:'offline'}}
  const m=text.match(/\[\[BIDOU_ERROR:([^\]]*)\]\]/);if(m)throw{code:'upstream',msg:m[1]};
  return text;
}
function parseJSON(text){
  let t=String(text||'').trim();const f=t.match(/```(?:json)?\s*([\s\S]*?)```/);if(f)t=f[1].trim();
  try{return JSON.parse(t)}catch(e){}
  const a=Math.min(...['{','['].map(c=>{const i=t.indexOf(c);return i<0?1e9:i})),b=Math.max(t.lastIndexOf('}'),t.lastIndexOf(']'));
  if(a<1e9&&b>a){try{return JSON.parse(t.slice(a,b+1))}catch(e){}}
  throw{code:'invalid_json'}}
function chefErr(e){const c=e&&e.code;
  if(c==='no_config')return'La génération par Claude n’est pas encore branchée : Bidou pioche dans sa bibliothèque.';
  if(c==='no_session')return'Connecte-toi (onglet Moi) pour des recettes sur mesure. En attendant, Bidou pioche dans sa bibliothèque.';
  if(c===403)return'Ton compte n’a pas accès à la génération par Claude. Demande à Simon de t’ajouter.';
  if(c===429)return'Limite du jour atteinte. Réessaie demain.';
  if(c==='offline')return'Pas de connexion internet.';
  if(c==='invalid_json')return'La réponse était illisible. Réessaie.';
  return'Petit souci avec Claude. Réessaie dans un moment.'}
const FALLBACK=['no_config','no_session',403];

/* =================== Prompts =================== */
function profileText(seasonOn){const p=D.profile;const lvl=(LEVELS.find(l=>l[0]===p.level)||LEVELS[1])[1];
  return[`- Matériel disponible (n'utilise RIEN d'autre ; couteaux, planche, casseroles, poêles et saladiers sont toujours là) : ${p.gear.join(', ')||'plaques uniquement'}`,
    `- Niveau en cuisine : ${lvl}`,`- Cuisines appréciées : ${p.cuisines.join(', ')||'toutes'}`,p.likes?`- Ce qu'il aime : ${p.likes}`:'',
    `- À EXCLURE ABSOLUMENT (n'aime pas) : ${p.dislikes.join(', ')||'rien de particulier'}`,`- Régime / allergies à respecter strictement : ${p.diet.join(', ')||'aucun, mange de tout'}`,
    p.budgetOn?`- Budget : environ ${p.budget} € de courses pour toute la semaine pour ${p.household} personne(s)`:'- Budget : pas de contrainte stricte, reste raisonnable',
    p.calOn?`- Objectif : environ ${p.kcal} kcal par jour ; un déjeuner ou un dîner apporte environ ${mealKcal()} kcal par portion`:"- Pas d'objectif calorique : portions normales, rassasiantes et équilibrées",
    seasonOn?`- DE SAISON (${MONTHS[month()-1]}) : construis les recettes autour des fruits et légumes de saison en France ce mois-ci : ${SEASON[month()-1]}. Mets "season": true quand la recette met en avant un produit de saison.`:''
  ].filter(Boolean).join('\n')}
const RULES=()=>`RÈGLES
- Équilibre simple à chaque repas : une source de protéines, des légumes (environ la moitié de l'assiette), un féculent de préférence complet. Ce n'est pas un régime : juste bien manger, avec plaisir.
- Recettes réalistes, ingrédients trouvables en supermarché en France.
- Étapes courtes et concrètes (4 à 7), avec temps, feu et repères visuels. Respecte strictement le temps total demandé.
- Quantités POUR 1 PORTION. Unités autorisées : g, ml, pièce, c. à s., c. à c., pincée, gousse, tranche, botte, cube.
- "r" (rayon) parmi : ${RAYONS.join(' | ')}.
- "p": true uniquement pour les basiques de placard (huiles, vinaigres, épices sèches, sauce soja, moutarde, farine, sucre, miel, cubes de bouillon). N'inclus ni le sel, ni le poivre, ni l'eau.
- kcal, prot, carb, fat : estimations réalistes par portion. "cost" : coût estimé par portion en euros (prix supermarché France).
- "mode" vaut "express", "normal" ou "long".`;
const SHAPE='{"name":"…","desc":"une phrase appétissante","mode":"express","prep":10,"cook":10,"diff":"facile","gear":["plaques"],"kcal":620,"prot":38,"carb":65,"fat":20,"cost":2.8,"season":false,"tags":["asiatique"],"ing":[{"n":"blanc de poulet","q":120,"u":"g","r":"Boucherie & poisson","p":false}],"steps":["…"],"tip":"une astuce courte"}';
const audaceText=id=>(AUDACE.find(a=>a[0]===id)||AUDACE[1])[2];
function weekPrompt(keys){const w=D.week;
  const kept=activeSlots().filter(k=>!keys.includes(k)&&w.slots[k].recipe).map(k=>`- ${dayLabel(k)} : ${w.slots[k].recipe.name}`);
  const mine=D.profile.useMine?D.mine.slice(0,40).map(r=>`- id "${r.id}" : ${r.name} (${MODES[r.mode]?.label||''}, ${r.total||0} min)`):[];
  return`Tu es le chef de Bidou, une application française qui planifie les repas de la semaine. Écris les recettes des créneaux ci-dessous.

PROFIL
${profileText(D.profile.season)}

ENVIES DE LA SEMAINE : ${w.envies||'pas de demande particulière'}
ORIGINALITÉ VOULUE : ${audaceText(w.audace)}

CRÉNEAUX À REMPLIR (le temps choisi est une contrainte stricte)
${keys.map(k=>`- ${k} (${dayLabel(k)}) : ${MODES[w.slots[k].mode].prompt}`).join('\n')}
${kept.length?`\nREPAS DÉJÀ PRÉVUS (ne les répète pas ; réutilise leurs ingrédients frais si c'est naturel) :\n${kept.join('\n')}`:''}
${mine.length?`\nSES RECETTES PERSO : tu peux en placer au plus 2 si elles collent au temps du créneau, en renvoyant seulement {"slot":"…","mine":"<id>"} pour ce créneau :\n${mine.join('\n')}`:''}

${RULES()}
- Sur la semaine : varie les protéines (volaille, poisson 1 à 2 fois, œufs, légumineuses, viande rouge au plus 1 fois), les cuisines et les textures. Jamais deux fois le même plat.
- Mutualise les ingrédients frais entre les recettes pour limiter le gaspillage et le coût.

FORMAT : réponds uniquement par un objet JSON, une entrée par créneau, dans l'ordre :
{"meals":[{"slot":"${keys[0]}",…recette…}]}
où chaque recette a exactement cette forme : ${SHAPE}`}
function replacePrompt(k){const w=D.week;const avoid=activeSlots().filter(x=>w.slots[x].recipe).map(x=>w.slots[x].recipe.name);
  return`Tu es le chef de Bidou, une application française qui planifie les repas de la semaine. Propose UNE nouvelle recette pour ${dayLabel(k)}.

PROFIL
${profileText(D.profile.season)}

ENVIES DE LA SEMAINE : ${w.envies||'pas de demande particulière'}
ORIGINALITÉ VOULUE : ${audaceText(w.audace)}
TEMPS (contrainte stricte) : ${MODES[w.slots[k].mode].prompt}
À NE PAS PROPOSER (déjà dans la semaine) : ${avoid.join(' ; ')||'rien'}

${RULES()}

FORMAT : réponds uniquement par un objet JSON de cette forme : ${SHAPE}`}
function ideasPrompt(){const f=UI.ideaForm;
  return`Tu es le chef de Bidou, une application française de recettes maison. Propose 3 recettes bien différentes les unes des autres.

PROFIL
${profileText(D.profile.season)}

ENVIE : ${f.envie||'surprends-moi'}
INGRÉDIENTS À UTILISER EN PRIORITÉ : ${f.use||'aucun en particulier'}
ORIGINALITÉ VOULUE : ${audaceText(f.audace)}
TEMPS (contrainte stricte) : ${MODES[f.mode].prompt}

${RULES()}

FORMAT : réponds uniquement par un objet JSON : {"recipes":[recette, recette, recette]} où chaque recette a exactement cette forme : ${SHAPE}`}
function importPrompt(text){
  return`Tu es le chef de Bidou. Voici une recette collée par l'utilisateur (texte d'un site, d'un livre ou de ses notes). Remets-la au format Bidou sans la dénaturer : garde son nom, ses ingrédients et ses étapes, reformule les étapes de façon courte et claire, convertis les quantités POUR 1 PORTION (divise par le nombre de personnes indiqué ; si rien n'est indiqué, suppose 4 personnes), estime les temps, le mode, les calories et le coût.

${RULES()}

RECETTE COLLÉE :
"""
${String(text).slice(0,12000)}
"""

FORMAT : réponds uniquement par un objet JSON de cette forme : ${SHAPE}`}
function cleanRecipe(o,mode){
  if(!o||typeof o!=='object'||!o.name)return null;const n=x=>Math.max(0,+x||0);
  const r={id:'ai-'+uid(),name:String(o.name).slice(0,140),desc:String(o.desc||''),mode:['express','normal','long'].includes(o.mode)?o.mode:mode,
    prep:n(o.prep),cook:n(o.cook),diff:String(o.diff||''),gear:Array.isArray(o.gear)?o.gear.map(String):[],kcal:n(o.kcal),prot:n(o.prot),carb:n(o.carb),fat:n(o.fat),cost:n(o.cost),
    season:!!o.season,tags:Array.isArray(o.tags)?o.tags.map(String).slice(0,6):[],
    ing:(Array.isArray(o.ing)?o.ing:[]).filter(i=>i&&i.n).map(i=>({n:String(i.n),q:n(i.q),u:String(i.u||''),r:RAYONS.includes(i.r)?i.r:'Autre',p:!!i.p})),
    steps:(Array.isArray(o.steps)?o.steps:[]).map(String).filter(Boolean),tip:String(o.tip||'')};
  r.total=n(o.total)||r.prep+r.cook;if(!r.ing.length||!r.steps.length)return null;return r}
const countNames=t=>(t.match(/"(name|mine)"\s*:/g)||[]).length;

/* secours sans Claude */
function libPick(mode,avoid){const p=D.profile,dis=p.dislikes.map(d=>d.toLowerCase()),veg=p.diet.includes('végétarien');
  const ok=r=>r.gear.every(g=>p.gear.includes(g))&&!r.ing.some(i=>dis.some(d=>i.n.toLowerCase().includes(d)))&&(!veg||r.tags.includes('végétarien'))&&!avoid.includes(r.name);
  let pool=LIB.filter(r=>r.mode===mode&&ok(r));if(!pool.length)pool=LIB.filter(r=>r.total<=MODES[mode].max&&ok(r));if(!pool.length)return null;
  if(p.season){const s=pool.filter(r=>r.months.includes(month()));if(s.length)pool=s}
  const r=clone(pool[Math.floor(Math.random()*pool.length)]);r.season=inSeason(r);return r}
function fillFromLibrary(keys){const used=activeSlots().filter(k=>!keys.includes(k)&&D.week.slots[k].recipe).map(k=>D.week.slots[k].recipe.name);
  for(const k of keys){const r=libPick(D.week.slots[k].mode,used);D.week.slots[k].recipe=r;if(r)used.push(r.name)}}

/* =================== Liste de courses =================== */
function normUnit(u){u=String(u||'').trim().toLowerCase();
  if(/^c\.?\s*à\s*s|^cs$|cuill.*soupe/.test(u))return'c. à s.';if(/^c\.?\s*à\s*c|^cc$|cuill.*café/.test(u))return'c. à c.';
  if(/^pi[eè]ces?$|^pcs?$|^unit/.test(u)||u==='')return'pièce';if(/^gousses?$/.test(u))return'gousse';if(/^tranches?$/.test(u))return'tranche';if(/^bottes?$/.test(u))return'botte';
  if(/^pinc[ée]es?$/.test(u))return'pincée';if(/^bo[iî]tes?$/.test(u))return'boîte';if(/^cubes?$/.test(u))return'cube';return u}
function toBase(q,u){q=+q||0;if(u==='kg')return[q*1000,'g'];if(u==='l')return[q*1000,'ml'];if(u==='cl')return[q*10,'ml'];return[q,u]}
function shopQty(q,u){
  if(u==='g'){if(q>=1000)return nf1.format(q/1000)+' kg';return nf0.format(q<50?Math.ceil(q/5)*5:Math.ceil(q/10)*10)+' g'}
  if(u==='ml'){if(q>=1000)return nf1.format(q/1000)+' L';return nf0.format(Math.ceil(q/10)*10)+' ml'}
  if(['pièce','gousse','botte','tranche','boîte','cube'].includes(u)){const n=Math.ceil(q-1e-9);return u==='pièce'?'× '+n:n+' '+u+(n>1?'s':'')}
  return nf1.format(q)+' '+u}
function ingQty(i,por){const u=normUnit(i.u),q=(+i.q||0)*por;if(!q)return'';
  if(u==='g'||u==='ml')return q>=1000?nf1.format(q/1000)+(u==='g'?' kg':' L'):nf0.format(q)+' '+u;if(u==='pièce')return frac(q);return frac(q)+' '+u}
function shoppingList(){const map=new Map();
  for(const k of activeSlots()){const s=D.week.slots[k];if(!s.recipe)continue;const por=portionsOf(k);
    for(const i of s.recipe.ing||[]){const[q,u]=toBase(i.q,normUnit(i.u));const name=String(i.n||'').trim();if(!name)continue;
      const key=name.toLowerCase().split(/\s+/).map(w=>w.replace(/[sx]$/,'')).join(' ')+'|'+u;
      const staple=!!i.p||STAPLE_WORDS.some(w=>name.toLowerCase().startsWith(w));
      if(!map.has(key))map.set(key,{key,name,u,q:0,r:RAYONS.includes(i.r)?i.r:'Autre',staple,uses:new Set()});
      const it=map.get(key);it.q+=q*por;it.uses.add(s.recipe.name);if(!staple)it.staple=false}}
  const cost=sum(activeSlots().filter(k=>D.week.slots[k].recipe).map(k=>(D.week.slots[k].recipe.cost||0)*portionsOf(k)));
  return{items:[...map.values()],cost}}
function listText(){const{items}=shoppingList();const main=items.filter(i=>!i.staple&&!D.shop.checked[i.key]);const out=['Courses Bidou',''];
  for(const r of RAYONS){const l=main.filter(i=>i.r===r);if(!l.length)continue;out.push(r);l.forEach(i=>out.push('- '+i.name+' : '+shopQty(i.q,i.u)));out.push('')}
  const ex=D.shop.extra.filter(e=>!e.done);if(ex.length){out.push('Autres');ex.forEach(e=>out.push('- '+e.text));out.push('')}
  const st=items.filter(i=>i.staple&&!D.shop.checked[i.key]);if(st.length){out.push('À vérifier dans les placards');st.forEach(i=>out.push('- '+i.name))}
  return out.join('\n').trim()}

/* =================== Mes recettes : saisie =================== */
function guessRayon(n){n=n.toLowerCase();const T=[
  ['Boucherie & poisson',/poulet|bœuf|boeuf|porc|veau|agneau|dinde|canard|lardon|jambon|saucisse|steak|viande|saumon|thon frais|cabillaud|poisson|crevette|moule|chorizo/],
  ['Crèmerie & œufs',/pâte (brisée|feuilletée|sablée|à pizza)|œuf|oeuf|lait(?! de coco)|beurre|crème|fromage|yaourt|emmental|comté|gruyère|parmesan|mozzarella|feta|chèvre|ricotta|skyr/],
  ['Boulangerie',/pain|baguette|tortilla|pita|brioche/],
  ['Surgelés',/surgel/],
  ['Épices & condiments',/sel\b|poivre|épice|curry|cumin|paprika|cannelle|muscade|herbes de provence|thym|laurier|moutarde|vinaigre|huile|sauce soja|bouillon|ketchup|mayonnaise/],
  ['Épicerie sucrée',/sucre|miel|chocolat|confiture|sirop|levure|vanille/],
  ['Épicerie salée',/pâtes|pates|riz|semoule|quinoa|lentille|pois chiche|haricot rouge|farine|conserve|coulis|concentré|lait de coco|nouille|boulgour|thon/],
  ['Boissons',/vin|bière|jus/],
  ['Fruits & légumes',/./]];return(T.find(([,re])=>re.test(n))||['Autre'])[0]}
function parseIngLine(line,portions){
  const L=line.trim().replace(/^[-•*]\s*/,'');if(!L)return null;
  const m=L.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+|½|¼|¾)\s*(kg|g|ml|cl|l|c\.?\s*à\s*s\.?|c\.?\s*à\s*c\.?|cs|cc|cuill[eè]res? à soupe|cuill[eè]res? à café|pinc[ée]es?|gousses?|tranches?|bottes?|pi[eè]ces?|bo[iî]tes?|cubes?)?\.?\s+(?:de\s+|d['’]\s*)?(.+)$/i);
  let q=0,u='pièce',n=L;
  if(m){const raw=m[1];q=raw==='½'?0.5:raw==='¼'?0.25:raw==='¾'?0.75:raw.includes('/')?(+raw.split('/')[0]/+raw.split('/')[1]):parseFloat(raw.replace(',','.'));u=m[2]?normUnit(m[2]):'pièce';n=m[3]}
  const[bq,bu]=toBase(q,u);const r=guessRayon(n);
  return{n:n.trim(),q:Math.round(bq/Math.max(1,portions)*100)/100,u:bu,r,p:r==='Épices & condiments'}}
function modeFor(total){return total<=20?'express':total<=45?'normal':'long'}

/* =================== Rendu =================== */
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3600)}
document.addEventListener('click',e=>{if(e.target.id==='toast')e.target.hidden=true});
const TABS=[['semaine','Semaine',I.cal],['courses','Courses',I.cart],['idees','Idées',I.spark],['carnet','Carnet',I.book],['moi','Moi',I.user]];
function tab(){const h=location.hash.replace('#','');return TABS.some(t=>t[0]===h)?h:'semaine'}
function screen(){if(UI.screen)return UI.screen;if(!D.profile.setup)return'welcome';return'app'}
function render(){
  applyTheme();const sc=screen(),app=$('#app');
  if(sc==='welcome')app.innerHTML=vWelcome();
  else if(sc==='onboard')app.innerHTML=vOnboard();
  else if(sc==='auth')app.innerHTML=vAuth();
  else{const t=tab();app.innerHTML=(t==='semaine'?vWeek():t==='courses'?vShop():t==='idees'?vIdeas():t==='carnet'?vCarnet():vMe())+vTabbar()}
  renderSheet()}
function softRender(){const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA')&&a.closest('#app'))return;render()}
function vTabbar(){const t=tab();const n=shoppingList().items.filter(i=>!i.staple&&!D.shop.checked[i.key]).length+D.shop.extra.filter(e=>!e.done).length;
  return`<nav class="tabbar" aria-label="Sections"><div class="wrap">${TABS.map(([id,l,ic])=>`<a href="#${id}" ${t===id?'aria-current="page"':''}><span class="ic">${ic}</span>${l}${id==='courses'&&n?`<span class="count num">${n}</span>`:''}</a>`).join('')}</div></nav>`}
function band(inner){return`<header class="band gutter"><div class="wrap"><div class="band-top"><span class="brand"><span class="badge">${logo(30)}</span>Bidou</span>${syncBadge()}</div>${inner}</div></header>`}
function syncBadge(){if(!SB.on())return'';if(!signedIn())return`<a class="btn small ghost" href="#moi">Se connecter</a>`;
  const t=SYNC==='ok'?'Synchronisé':SYNC==='offline'?'Hors ligne':SYNC==='err'?'Synchro en attente':'Synchro…';return`<span class="sub" style="font-size:12px;font-weight:600">${t}</span>`}

/* ---- accueil ---- */
function vWelcome(){return`<div class="screen welcome gutter"><div class="wrap">
  <div class="hero"><div class="logo-big">${logo(150)}</div><h1>Bidou</h1><p class="tagline">Tes repas de la semaine, au temps que tu as envie de passer en cuisine.</p></div>
  ${installHint()}
  <div class="stack"><button class="btn primary block" data-act="start">Commencer</button>
  ${SB.on()?`<button class="btn ghost block" data-act="goLogin">J’ai déjà un compte</button>`:''}
  <p class="note">Gratuit. Ton compte sert seulement à sauvegarder tes données.</p></div></div></div>`}
function isIOS(){return/iphone|ipad|ipod/i.test(navigator.userAgent)}
function standalone(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function installHint(){if(standalone())return'';
  if(UI.install)return`<button class="btn ghost block" data-act="install">${I.share} Installer Bidou sur l’écran d’accueil</button>`;
  if(isIOS())return`<div class="notice" style="background:var(--band-soft);color:inherit"><span>Pour l’installer : touche <b>Partager</b> puis <b>Sur l’écran d’accueil</b>.</span></div>`;
  return''}

/* ---- questionnaire (premier lancement) ---- */
const OB=['household','gear','cuisines','dislikes','diet','plan','options','account'];
function obSteps(){return OB.filter(s=>s!=='account'||(SB.on()&&!signedIn()))}
function vOnboard(){const steps=obSteps(),i=Math.min(UI.ob,steps.length-1),s=steps[i],p=D.profile;
  const bar=`<div class="ob-bar" style="grid-template-columns:repeat(${steps.length},1fr)">${steps.map((_,j)=>`<span class="${j<=i?'on':''}"></span>`).join('')}</div>`;
  let body='';
  if(s==='household')body=`<h1>Vous êtes combien à table ?</h1><p class="lead">Les quantités et la liste de courses s’adaptent. Tu pourras changer repas par repas.</p>
    <div class="big-stepper" style="display:flex;justify-content:center;padding:24px 0"><div class="stepper"><button data-act="household" data-d="-1" aria-label="Moins">−</button><span class="num">${p.household}</span><button data-act="household" data-d="1" aria-label="Plus">+</button></div></div>`;
  if(s==='gear')body=`<h1>Qu’as-tu dans ta cuisine ?</h1><p class="lead">Bidou ne proposera que des recettes faisables avec.</p>
    <div class="checklist">${GEAR.map(g=>`<label>${esc(g[0].toUpperCase()+g.slice(1))}<input type="checkbox" data-act="toggleArr" data-field="gear" data-val="${esc(g)}" ${p.gear.includes(g)?'checked':''}></label>`).join('')}</div>`;
  if(s==='cuisines')body=`<h1>Qu’est-ce que tu aimes manger ?</h1><p class="lead">Choisis tes cuisines préférées, et dis-en un peu plus si tu veux.</p>
    <div class="chips">${CUISINES.map(c=>`<button class="chip" data-act="toggleArr" data-field="cuisines" data-val="${esc(c)}" aria-pressed="${p.cuisines.includes(c)}">${esc(c)}</button>`).join('')}</div>
    <div><label class="lbl" for="likes">En quelques mots</label><textarea id="likes" data-bind="profile.likes" placeholder="ex. j’adore le fromage, les plats épicés, le croquant">${esc(p.likes)}</textarea></div>`;
  if(s==='dislikes')body=`<h1>Et ce que tu n’aimes pas ?</h1><p class="lead">Ces ingrédients ne seront jamais proposés.</p>${tagInput('dislikes',p.dislikes,'ex. coriandre, betterave')}`;
  if(s==='diet')body=`<h1>Un régime ou une allergie ?</h1><p class="lead">Aucun par défaut : juste bien manger, de façon équilibrée.</p>
    <div class="chips">${DIETS.map(d=>`<button class="chip" data-act="toggleArr" data-field="diet" data-val="${esc(d)}" aria-pressed="${p.diet.includes(d)}">${esc(d)}</button>`).join('')}</div>
    ${tagInput('allergies',p.diet.filter(d=>!DIETS.includes(d)),'Autre allergie ou contrainte')}`;
  if(s==='plan')body=`<h1>Combien de temps veux-tu cuisiner ?</h1><p class="lead">Ta semaine type. Tu pourras changer chaque repas avant de générer.</p>${planEditor()}`;
  if(s==='options')body=`<h1>Quelques options</h1><p class="lead">Tout se change plus tard dans l’onglet Moi.</p>${optionsEditor()}`;
  if(s==='account')body=`<h1>Crée ton compte</h1><p class="lead">Pour retrouver tes semaines et tes recettes sur tous tes appareils, et pour que Claude invente tes recettes.</p>${authForm('signup')}`;
  const last=i===steps.length-1;
  return`<div class="screen gutter"><div class="wrap ob">
    <div class="ob-top"><button class="icon-btn" data-act="obBack" aria-label="Retour">${I.back}</button>${bar}<span class="muted num" style="font-weight:700">${i+1}/${steps.length}</span></div>
    ${body}
    <div class="ob-actions">${s==='account'?`<button class="btn" data-act="obFinish">Plus tard</button>`:`<button class="btn primary" data-act="${last?'obFinish':'obNext'}">${last?'C’est parti':'Continuer'}</button>`}</div>
  </div></div>`}
function tagInput(field,list,ph){return`<div class="chips">${list.map((t,i)=>`<span class="chip" aria-pressed="true">${esc(t)}<button class="x" data-act="untag" data-field="${field}" data-i="${i}" aria-label="Retirer ${esc(t)}">×</button></span>`).join('')}</div>
  <form class="row" data-form="tag" data-field="${field}" style="flex-wrap:nowrap"><input type="text" id="tag-${field}" placeholder="${esc(ph)}" aria-label="${esc(ph)}" enterkeyhint="done"><button class="btn" type="submit">Ajouter</button></form>`}
function planEditor(){const p=D.profile;
  return`<div class="card" style="padding:4px 14px">${DAYS.map(([d,l])=>{const k=d+'-soir';return`<div class="planrow"><b>${l}</b><div class="seg modes" role="group" aria-label="${l} soir">${MODE_KEYS.map(m=>`<button data-act="planMode" data-slot="${k}" data-mode="${m}" aria-pressed="${p.plan[k]===m}">${MODES[m].short}</button>`).join('')}</div></div>`}).join('')}</div>
  <div class="card" style="padding:4px 14px">${['sam','dim'].map(d=>{const k=d+'-midi',l=(DAYS.find(x=>x[0]===d)||[])[1];return`<div class="planrow"><b>${l} midi</b><div class="seg modes" role="group" aria-label="${l} midi">${MODE_KEYS.map(m=>`<button data-act="planMode" data-slot="${k}" data-mode="${m}" aria-pressed="${p.plan[k]===m}">${MODES[m].short}</button>`).join('')}</div></div>`}).join('')}</div>
  <p class="muted" style="font-size:13px">— pas de repas · 20 min express · 45 min normal · 1 h + j’ai le temps. Les midis de semaine s’ajoutent dans l’onglet Semaine.</p>`}
function optionsEditor(){const p=D.profile;
  return`<div class="checklist">
    <label>De saison par défaut<input type="checkbox" data-act="opt" data-field="season" ${p.season?'checked':''}></label>
    <label>Glisser mes recettes dans la semaine<input type="checkbox" data-act="opt" data-field="useMine" ${p.useMine?'checked':''}></label>
    <label>Budget courses par semaine<input type="checkbox" data-act="opt" data-field="budgetOn" ${p.budgetOn?'checked':''}></label>
    ${p.budgetOn?`<div class="row" style="padding:0 0 12px"><input type="number" min="10" step="5" id="budget" data-bind="profile.budget" value="${p.budget}" aria-label="Budget en euros"><span class="muted">€ / semaine</span></div>`:''}
    <label>Objectif de calories<input type="checkbox" data-act="opt" data-field="calOn" ${p.calOn?'checked':''}></label>
    ${p.calOn?`<div class="row" style="padding:0 0 12px"><input type="number" min="1200" step="50" id="kcal" data-bind="profile.kcal" value="${p.kcal}" aria-label="Calories par jour"><span class="muted">kcal / jour</span></div>`:''}
  </div><p class="muted" style="font-size:13px">Sans objectif, les calories restent affichées pour info.</p>`}
function authForm(mode){return`<form class="stack" data-form="auth" data-mode="${mode}">
  <div><label class="lbl" for="au-email">E-mail</label><input type="email" id="au-email" autocomplete="email" required></div>
  <div><label class="lbl" for="au-pw">Mot de passe</label><input type="password" id="au-pw" autocomplete="${mode==='signup'?'new-password':'current-password'}" minlength="6" required></div>
  ${UI.authErr?`<p class="err">${esc(UI.authErr)}</p>`:''}
  <button class="btn primary block" type="submit">${mode==='signup'?'Créer mon compte':'Me connecter'}</button>
  ${mode==='login'?`<button class="btn block" type="button" data-act="forgot">Mot de passe oublié</button>`:''}
  </form>`}
function vAuth(){const m=UI.authMode;return`<div class="screen gutter"><div class="wrap ob">
  <div class="ob-top"><button class="icon-btn" data-act="authBack" aria-label="Retour">${I.back}</button></div>
  <h1>${m==='signup'?'Crée ton compte':'Content de te revoir'}</h1>
  <p class="lead">${m==='signup'?'Tes goûts, tes semaines et tes recettes seront sauvegardés.':'Connecte-toi pour retrouver tes semaines et tes recettes.'}</p>
  ${authForm(m)}
  <button class="btn block" data-act="authSwitch">${m==='signup'?'J’ai déjà un compte':'Créer un compte'}</button></div></div>`}

/* ---- semaine ---- */
function modeSeg(k,mode){return`<div class="seg modes" role="group" aria-label="Temps pour ${esc(dayLabel(k))}">${MODE_KEYS.map(m=>`<button data-act="mode" data-slot="${k}" data-mode="${m}" aria-pressed="${mode===m}" title="${esc(MODES[m].title)}">${MODES[m].short}</button>`).join('')}</div>`}
function meta(r,por){const b=[mins(r.total)];if(r.cost)b.push(eur(r.cost)+'/pers.');if(r.kcal)b.push(nf0.format(r.kcal)+' kcal');if(por&&por!==1)b.push(por+' pers.');return b.join(' · ')}
function mealCard(k){const s=D.week.slots[k];if(s.mode==='off')return'';
  if(UI.busy[k])return`<div class="meal busy">Bidou cherche une idée…</div>`;
  if(!s.recipe)return`<div class="meal empty">À générer : ${esc(MODES[s.mode].title)}</div>`;
  const r=s.recipe,tooLong=r.total>MODES[s.mode].max+5;
  return`<article class="meal"><button class="meal-open" data-act="open" data-slot="${k}"><span class="meal-name">${esc(r.name)}</span><span class="meal-meta num">${esc(meta(r,portionsOf(k)))}</span></button>
    ${tooLong?`<span class="warn">Trop long pour ce créneau (${mins(r.total)}).</span>`:''}
    <div class="meal-foot"><span class="tags"><span class="tag ${s.mode}">${esc(MODES[s.mode].label)}</span>${inSeason(r)?`<span class="tag season">${I.leaf.replace('<svg','<svg width="12" height="12"')}De saison</span>`:''}${r.mine?'<span class="tag mine">Ma recette</span>':''}</span>
    <span class="meal-acts"><button class="icon-btn ${s.pinned?'on':''}" data-act="pin" data-slot="${k}" aria-pressed="${s.pinned}" aria-label="Garder ce repas" title="Garder lors de la prochaine génération">${I.lock}</button>
    <button class="icon-btn" data-act="replace" data-slot="${k}" aria-label="Autre idée">${I.refresh}</button>
    <button class="icon-btn fav ${isFav(r)?'on':''}" data-act="favSlot" data-slot="${k}" aria-label="Favori">${I.heart}</button></span></div></article>`}
function progressHTML(){const g=UI.gen;if(!g)return'';const pct=g.n?Math.min(100,Math.round(g.n/g.total*100)):35;
  const label=g.n?`${g.n} / ${g.total} ${g.kind==='week'?'recettes écrites':'idées'}`:(g.kind==='week'?'Bidou réfléchit à ta semaine… (environ une minute)':'Bidou cherche…');
  return`<div class="progress" id="gen-progress"><div class="bar ${g.n?'':'indet'}"><span style="width:${pct}%"></span></div><span class="num">${label}</span><button class="btn small" data-act="stop">Arrêter</button></div>`}
function updateProgress(n){if(!UI.gen||n===UI.gen.n)return;UI.gen.n=n;const el=document.getElementById('gen-progress');if(el)el.outerHTML=progressHTML()}
function vWeek(){const w=D.week,p=D.profile,act=activeSlots(),filled=act.filter(k=>w.slots[k].recipe);
  const cost=sum(filled.map(k=>(w.slots[k].recipe.cost||0)*portionsOf(k))),totalMin=sum(filled.map(k=>w.slots[k].recipe.total));
  const toGen=act.filter(k=>!w.slots[k].pinned).length,g=UI.gen;
  return band(`<h1>Ta semaine</h1><p class="sub num">${act.length} repas · ${mins(totalMin)} en cuisine · ≈ ${eur(cost)}</p>
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="envies" data-bind="week.envies" value="${esc(w.envies||'')}" placeholder="Tes envies : un plat thaï, du réconfort…" aria-label="Tes envies cette semaine" enterkeyhint="go">
    <button class="btn dark" data-act="generate" ${g||!toGen?'disabled':''}>${I.spark} Générer</button></div>
    <div class="row"><button class="chip" data-act="season" aria-pressed="${p.season}">${I.leaf} De saison</button>
    <div class="seg" role="group" aria-label="Originalité">${AUDACE.map(([id,l])=>`<button data-act="audace" data-val="${id}" aria-pressed="${(w.audace||'audace')===id}">${l}</button>`).join('')}</div></div>
    ${g&&g.kind==='week'?progressHTML():''}`)+
  `<main class="gutter"><div class="wrap stack">
    ${!w.createdAt&&!filled.length?`<div class="notice"><span>Choisis le temps de chaque repas puis touche <b>Générer</b>. ${toGen} repas à préparer.</span></div>`:''}
    ${!signedIn()&&SB.on()?`<div class="notice"><span>Sans compte, Bidou pioche dans sa petite bibliothèque. Connecte-toi pour des recettes inventées pour toi.</span><a class="btn small" href="#moi">Moi</a></div>`:''}
    <div class="days">${DAYS.map(([d,label])=>{const ks=SLOTS.map(([s])=>d+'-'+s);const dk=sum(ks.filter(k=>w.slots[k].mode!=='off'&&w.slots[k].recipe).map(k=>w.slots[k].recipe.kcal));
      return`<section class="day"><div class="day-head"><h2>${label}</h2>${p.calOn&&dk?`<span class="muted num" style="font-size:13px">≈ ${nf0.format(dk)} kcal</span>`:''}</div>
      ${SLOTS.map(([s,sl])=>{const k=d+'-'+s,slot=w.slots[k];return`<div class="slot"><div class="slot-head"><span class="slot-name">${sl}</span>${modeSeg(k,slot.mode)}</div>${mealCard(k)}</div>`}).join('')}</section>`}).join('')}</div>
    <button class="btn block" data-act="newWeek" style="margin-top:8px">Nouvelle semaine depuis ma semaine type</button>
  </div></main>`}

/* ---- courses ---- */
function itemRow(it){const done=!!D.shop.checked[it.key];if(done&&D.shop.hideDone)return'';const uses=[...it.uses];
  return`<li><label class="item ${done?'done':''}"><input type="checkbox" data-act="check" data-key="${esc(it.key)}" ${done?'checked':''}><span class="nm">${esc(it.name)}<span class="for">${esc(uses.length>2?uses.length+' recettes':uses.join(' · '))}</span></span><span class="q num">${esc(shopQty(it.q,it.u))}</span></label></li>`}
function vShop(){const{items,cost}=shoppingList(),extra=D.shop.extra;
  const main=items.filter(i=>!i.staple),stap=items.filter(i=>i.staple),left=main.filter(i=>!D.shop.checked[i.key]).length+extra.filter(e=>!e.done).length;
  const groups=RAYONS.map(r=>[r,main.filter(i=>i.r===r).sort((a,b)=>a.name.localeCompare(b.name,'fr'))]).filter(g=>g[1].length);
  return band(`<h1>Courses</h1><p class="sub num">${left} article${left>1?'s':''} à prendre · ≈ ${eur(cost)} estimés</p>
    <div class="row"><button class="btn dark small" data-act="shareList">${I.share} Partager la liste</button><button class="chip" data-act="hideDone" aria-pressed="${D.shop.hideDone}">Masquer ce qui est pris</button></div>`)+
  `<main class="gutter"><div class="wrap stack">
    <form class="row" data-form="extra" style="flex-wrap:nowrap"><input type="text" id="extra-input" placeholder="Ajouter (café, lessive, fruits…)" aria-label="Ajouter un article" enterkeyhint="done"><button class="btn primary" type="submit" aria-label="Ajouter">${I.plus}</button></form>
    ${!items.length&&!extra.length?`<div class="card empty-state"><h3>Rien à acheter pour l’instant</h3><p>Génère ta semaine : la liste se remplit toute seule, triée par rayon.</p><a class="btn primary" href="#semaine">Planifier ma semaine</a></div>`:''}
    ${groups.map(([r,l])=>`<div class="card aisle"><h3>${esc(r)}<span class="muted num">${l.length}</span></h3><ul>${l.map(itemRow).join('')}</ul></div>`).join('')}
    ${extra.length?`<div class="card aisle"><h3>Autres articles</h3><ul>${extra.map(e=>(e.done&&D.shop.hideDone)?'':`<li class="xrow"><label class="item ${e.done?'done':''}"><input type="checkbox" data-act="checkExtra" data-id="${e.id}" ${e.done?'checked':''}><span class="nm">${esc(e.text)}</span><span></span></label><button class="icon-btn" data-act="delExtra" data-id="${e.id}" aria-label="Retirer ${esc(e.text)}">${I.close}</button></li>`).join('')}</ul></div>`:''}
    ${stap.length?`<div class="card aisle"><h3>Dans tes placards ?</h3><p class="muted" style="font-size:13px;margin-bottom:4px">Les basiques utilisés cette semaine. Coche ce que tu as déjà.</p><ul>${stap.sort((a,b)=>a.name.localeCompare(b.name,'fr')).map(itemRow).join('')}</ul></div>`:''}
  </div></main>`}

/* ---- idées ---- */
function slotOptions(){return`<option value="">Ajouter à la semaine…</option>`+DAYS.map(([d,l])=>SLOTS.map(([s,sl])=>{const k=d+'-'+s,x=D.week.slots[k];return`<option value="${k}">${l} ${sl.toLowerCase()}${x.recipe&&x.mode!=='off'?' (remplace)':''}</option>`}).join('')).join('')}
function rcard(r,type,i){return`<article class="card rcard"><div class="row"><span class="tag ${esc(r.mode)}">${esc(MODES[r.mode]?.label||'')}</span>${inSeason(r)?'<span class="tag season">De saison</span>':''}<span class="muted num" style="font-size:13px">${esc(meta(r))}</span></div>
  <h3>${esc(r.name)}</h3>${r.desc?`<p>${esc(r.desc)}</p>`:''}
  <div class="foot"><button class="btn small" data-act="openList" data-type="${type}" data-i="${i}">Voir</button>
  <button class="icon-btn fav ${isFav(r)?'on':''}" data-act="favList" data-type="${type}" data-i="${i}" aria-label="Favori">${I.heart}</button>
  <select data-act="addList" data-type="${type}" data-i="${i}" aria-label="Ajouter à la semaine">${slotOptions()}</select></div></article>`}
function vIdeas(){const f=UI.ideaForm,g=UI.gen;
  return band(`<h1>Idées</h1><p class="sub">Une envie, un reste à finir, un soir sans idée : trois recettes pour toi.</p>`)+
  `<main class="gutter"><div class="wrap stack"><form class="card stack" data-form="ideas">
    <div><label class="lbl" for="idea-envie">J’ai envie de…</label><input type="text" id="idea-envie" data-bind="ideaForm.envie" value="${esc(f.envie)}" placeholder="ex. croustillant et épicé, une soupe-repas"></div>
    <div><label class="lbl" for="idea-use">Ingrédients à finir</label><input type="text" id="idea-use" data-bind="ideaForm.use" value="${esc(f.use)}" placeholder="ex. 2 courgettes, un reste de crème"></div>
    <div><span class="lbl">Temps</span><div class="seg modes full" role="group">${['express','normal','long'].map(m=>`<button type="button" data-act="ideaMode" data-mode="${m}" aria-pressed="${f.mode===m}">${MODES[m].short}</button>`).join('')}</div></div>
    <div><span class="lbl">Originalité</span><div class="seg full" role="group">${AUDACE.map(([id,l])=>`<button type="button" data-act="ideaAudace" data-val="${id}" aria-pressed="${f.audace===id}">${l}</button>`).join('')}</div></div>
    <div class="row"><button type="button" class="chip" data-act="season" aria-pressed="${D.profile.season}">${I.leaf} De saison</button></div>
    <button class="btn primary block" type="submit" ${g?'disabled':''}>${I.spark} Trouver des idées</button>
    ${g&&g.kind==='ideas'?progressHTML():''}</form>
    ${UI.ideas.length?UI.ideas.map((r,i)=>rcard(r,'idea',i)).join(''):`<div class="card empty-state"><h3>Pas encore d’idées</h3><p>Décris ton envie et lance la recherche.</p></div>`}
  </div></main>`}

/* ---- carnet : mes recettes et favoris ---- */
function vCarnet(){const t=UI.carnetTab,list=t==='mine'?D.mine:D.favs;
  return band(`<h1>Carnet</h1><p class="sub">Tes recettes et celles que tu veux refaire.</p>
    <div class="seg" role="group"><button data-act="carnetTab" data-val="mine" aria-pressed="${t==='mine'}">Mes recettes · ${D.mine.length}</button><button data-act="carnetTab" data-val="favs" aria-pressed="${t==='favs'}">Favoris · ${D.favs.length}</button></div>`)+
  `<main class="gutter"><div class="wrap stack">
    ${t==='mine'?`<button class="btn primary block" data-act="newRecipe">${I.plus} Ajouter une recette</button>`:''}
    ${list.length?list.map((r,i)=>rcard(r,t,i)).join(''):t==='mine'?`<div class="card empty-state"><h3>Ton carnet est vide</h3><p>Ajoute la quiche de ta grand-mère ou colle une recette trouvée en ligne : Bidou la range au bon format.</p></div>`:`<div class="card empty-state"><h3>Aucun favori</h3><p>Touche le cœur sur un repas ou une idée pour le garder ici.</p></div>`}
  </div></main>`}

/* ---- moi ---- */
function vMe(){const p=D.profile,x=SB.sess();
  return band(`<h1>Moi</h1><p class="sub">Tes goûts, ta semaine type et ton compte.</p>`)+
  `<main class="gutter"><div class="wrap stack">
    <h2 class="section-title">Compte</h2>
    <div class="card stack">${!SB.on()?`<p class="muted">La sauvegarde en ligne n’est pas encore configurée (voir LISEZMOI). Tes données restent sur cet appareil.</p>`:
      x?`<div class="between"><div><b>${esc(x.email||'')}</b><p class="muted" style="font-size:13px">Tes données sont sauvegardées et synchronisées.</p></div></div>
        <div class="row"><button class="btn small" data-act="changePw">Changer le mot de passe</button><button class="btn small" data-act="logout">Se déconnecter</button></div>`:
      `<p class="muted">Crée un compte pour sauvegarder tes données et recevoir des recettes inventées par Claude.</p><div class="row"><button class="btn primary small" data-act="goSignup">Créer un compte</button><button class="btn small" data-act="goLogin">Se connecter</button></div>`}</div>
    <h2 class="section-title">À table</h2>
    <div class="card stack"><div class="between"><b>Nombre de personnes</b><div class="stepper"><button data-act="household" data-d="-1" aria-label="Moins">−</button><span class="num">${p.household}</span><button data-act="household" data-d="1" aria-label="Plus">+</button></div></div>
      <div><span class="lbl">Niveau en cuisine</span><div class="seg full" role="group">${LEVELS.map(([id,l])=>`<button data-act="level" data-val="${id}" aria-pressed="${p.level===id}">${l}</button>`).join('')}</div></div></div>
    <h2 class="section-title">Ma semaine type</h2>${planEditor()}
    <h2 class="section-title">Mon matériel</h2>
    <div class="card"><div class="chips">${GEAR.map(g=>`<button class="chip" data-act="toggleArr" data-field="gear" data-val="${esc(g)}" aria-pressed="${p.gear.includes(g)}">${esc(g)}</button>`).join('')}</div></div>
    <h2 class="section-title">Ce que j’aime</h2>
    <div class="card stack"><div class="chips">${CUISINES.map(c=>`<button class="chip" data-act="toggleArr" data-field="cuisines" data-val="${esc(c)}" aria-pressed="${p.cuisines.includes(c)}">${esc(c)}</button>`).join('')}</div>
      <textarea id="likes2" data-bind="profile.likes" aria-label="Ce que j’aime en quelques mots" placeholder="ex. j’adore le fromage, les plats épicés">${esc(p.likes)}</textarea></div>
    <h2 class="section-title">Je n’aime pas</h2><div class="card stack">${tagInput('dislikes',p.dislikes,'ex. coriandre, betterave')}</div>
    <h2 class="section-title">Régime et allergies</h2>
    <div class="card stack"><div class="chips">${DIETS.map(d=>`<button class="chip" data-act="toggleArr" data-field="diet" data-val="${esc(d)}" aria-pressed="${p.diet.includes(d)}">${esc(d)}</button>`).join('')}</div>${tagInput('allergies',p.diet.filter(d=>!DIETS.includes(d)),'Autre allergie ou contrainte')}</div>
    <h2 class="section-title">Options</h2>${optionsEditor()}
    <h2 class="section-title">Apparence</h2>
    <div class="card"><div class="seg full" role="group">${[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(([id,l])=>`<button data-act="theme" data-val="${id}" aria-pressed="${p.theme===id}">${l}</button>`).join('')}</div></div>
    ${standalone()?'':`<h2 class="section-title">Installer l’appli</h2><div class="card stack">${UI.install?`<button class="btn primary" data-act="install">${I.share} Installer Bidou</button>`:''}
      <p style="font-size:14px"><b>iPhone</b> : dans Safari, touche <b>Partager</b> puis <b>Sur l’écran d’accueil</b>.</p>
      <p style="font-size:14px"><b>Fairphone / Android</b> : dans Chrome, menu <b>⋮</b> puis <b>Installer l’application</b> (ou « Ajouter à l’écran d’accueil »).</p></div>`}
    <p class="muted" style="text-align:center;font-size:12px;margin-top:8px">Bidou · ${APP_VER}</p>
  </div></main>`}

/* ---- feuilles : fiche recette, éditeur, mot de passe ---- */
function sheetRecipe(){const s=UI.sheet;
  if(s.type==='slot')return D.week.slots[s.slot]?.recipe;if(s.type==='idea')return UI.ideas[s.i];if(s.type==='mine')return D.mine[s.i];if(s.type==='favs')return D.favs[s.i];return null}
function openSheet(s){UI.sheet=s;$('#sheet').dataset.key='';renderSheet()}
function closeSheet(){UI.sheet=null;renderSheet()}
function renderSheet(){const box=$('#sheet'),s=UI.sheet;if(!s){box.hidden=true;box.innerHTML='';document.body.style.overflow='';return}
  let html='';
  if(['slot','idea','mine','favs'].includes(s.type)){const r=sheetRecipe();if(!r){UI.sheet=null;box.hidden=true;box.innerHTML='';return}html=vRecipe(r,s)}
  else if(s.type==='editor')html=vEditor(s);
  else if(s.type==='password')html=`<div class="sheet-wrap modal" data-act="sheetBg"><div class="panel"><div class="between"><h2>Nouveau mot de passe</h2><button class="icon-btn" data-act="closeSheet" aria-label="Fermer">${I.close}</button></div>
    <form class="stack" data-form="pw"><input type="password" id="np" autocomplete="new-password" minlength="6" placeholder="6 caractères minimum" aria-label="Nouveau mot de passe"><button class="btn primary block" type="submit">Enregistrer</button></form></div></div>`;
  else if(s.type==='confirm')html=`<div class="sheet-wrap modal" data-act="sheetBg"><div class="panel"><h2>${esc(s.title)}</h2><p class="muted">${esc(s.text)}</p>
    <div class="row" style="justify-content:flex-end"><button class="btn" data-act="closeSheet">Annuler</button><button class="btn primary" data-act="confirmYes">${esc(s.yes)}</button></div></div></div>`;
  else if(s.type==='copy')html=`<div class="sheet-wrap modal" data-act="sheetBg"><div class="panel"><div class="between"><h2>Ta liste</h2><button class="icon-btn" data-act="closeSheet" aria-label="Fermer">${I.close}</button></div><textarea id="copy-area" rows="14" readonly>${esc(s.text)}</textarea></div></div>`;
  const old=box.querySelector('.sheet-wrap'),same=old&&box.dataset.key===sheetKey(s),top=same?old.scrollTop:0;
  box.innerHTML=html;box.hidden=false;box.dataset.key=sheetKey(s);document.body.style.overflow='hidden';
  const nw=box.querySelector('.sheet-wrap');if(nw&&top)nw.scrollTop=top}
function sheetKey(s){return[s.type,s.slot||'',s.i==null?'':s.i].join(':')}
function vRecipe(r,s){const por=s.type==='slot'?portionsOf(s.slot):(s.portions||D.profile.household);
  return`<div class="sheet-wrap" role="dialog" aria-modal="true" aria-labelledby="r-title">
  <header class="band r-band gutter"><div class="wrap">
    <div class="between"><button class="icon-btn" data-act="closeSheet" aria-label="Retour" style="background:var(--band-soft);color:inherit">${I.back}</button>
      <span class="row"><span class="tag ${esc(r.mode)}">${esc(MODES[r.mode]?.title||'')}</span>${inSeason(r)?'<span class="tag" style="background:#fff1e2;color:#22150f">De saison</span>':''}</span></div>
    ${s.type==='slot'?`<span class="sub">${esc(dayLabel(s.slot))}</span>`:''}
    <h1 id="r-title" style="font-size:29px">${esc(r.name)}</h1>${r.desc?`<p class="sub">${esc(r.desc)}</p>`:''}
    <div class="facts num"><div class="fact"><b>${mins(r.total)}</b><span>${mins(r.prep)} prép. · ${mins(r.cook)} cuiss.</span></div>
      <div class="fact"><b>${r.cost?eur(r.cost):'—'}</b><span>par portion</span></div>
      <div class="fact"><b>${r.kcal?nf0.format(r.kcal)+' kcal':'—'}</b><span>${r.prot?nf0.format(r.prot)+' g protéines':'par portion'}</span></div></div>
  </div></header>
  <main class="gutter" style="padding-bottom:24px"><div class="wrap stack">
    <section class="card"><div class="between" style="padding:2px 0 6px"><h2 style="font-size:19px">Ingrédients</h2>
      <div class="stepper"><button data-act="portions" data-d="-1" aria-label="Moins de portions">−</button><span class="num" style="font-size:14px;min-width:60px">${por} pers.</span><button data-act="portions" data-d="1" aria-label="Plus de portions">+</button></div></div>
      <ul class="ing">${(r.ing||[]).map((i,ix)=>`<li><label><input type="checkbox" id="ing-${ix}"><span>${esc(i.n)}</span><span class="q num">${esc(ingQty(i,por))}</span></label></li>`).join('')}</ul></section>
    <section class="card stack"><h2 style="font-size:19px">Préparation</h2><ol class="steps">${(r.steps||[]).map(x=>`<li><span>${esc(x)}</span></li>`).join('')}</ol>
      ${r.tip?`<p class="tip"><b>Astuce · </b>${esc(r.tip)}</p>`:''}</section>
    ${(r.gear||[]).length?`<p class="muted" style="font-size:13px;padding:0 4px">Matériel : ${esc(r.gear.join(', '))}${r.diff?' · '+esc(r.diff):''}</p>`:''}
  </div></main>
  <div class="r-actions"><div class="wrap">
    ${s.type==='slot'?`<button class="btn primary" style="flex:1" data-act="replace" data-slot="${s.slot}">${I.refresh} Autre idée</button>`:`<select id="sheet-slot" aria-label="Créneau">${slotOptions()}</select><button class="btn primary" data-act="addSheet">Ajouter</button>`}
    ${s.type==='mine'?`<button class="icon-btn" data-act="editMine" data-i="${s.i}" aria-label="Modifier">${I.edit}</button>`:''}
    <button class="icon-btn fav ${isFav(r)?'on':''}" data-act="favSheet" aria-label="Favori">${I.heart}</button>
  </div></div></div>`}
function vEditor(s){const r=s.draft;const ingText=(r.ing||[]).map(i=>{const q=ingQty(i,s.portions||1);return(q?q+' ':'')+i.n}).join('\n');
  return`<div class="sheet-wrap" role="dialog" aria-modal="true" aria-label="Ma recette">
  <header class="band gutter"><div class="wrap"><div class="between"><button class="icon-btn" data-act="closeSheet" aria-label="Fermer" style="background:var(--band-soft);color:inherit">${I.close}</button>
    ${s.i!=null?`<button class="btn small ghost" data-act="deleteMine" data-i="${s.i}">${I.trash} Supprimer</button>`:''}</div>
    <h1>${s.i!=null?'Modifier ma recette':'Nouvelle recette'}</h1>
    <div class="seg" role="group"><button data-act="edMode" data-val="paste" aria-pressed="${s.mode==='paste'}">Coller un texte</button><button data-act="edMode" data-val="form" aria-pressed="${s.mode==='form'}">Saisir</button></div></div></header>
  <main class="gutter"><div class="wrap stack">
  ${s.mode==='paste'?`<div class="card stack"><p class="muted" style="font-size:14px">Colle une recette (d’un site, d’un livre, de tes notes). Claude la range au format Bidou : ingrédients par personne, étapes claires, temps, coût et calories. Tu pourras la relire avant d’enregistrer.</p>
      <textarea id="paste-text" rows="10" placeholder="Colle ta recette ici…">${esc(s.paste||'')}</textarea>
      ${UI.gen&&UI.gen.kind==='import'?`<div class="progress"><div class="bar indet" style="background:var(--surface-2)"><span style="background:var(--accent)"></span></div><span>Claude met en forme…</span></div>`:`<button class="btn primary block" data-act="importPaste">${I.spark} Mettre en forme</button>`}</div>`:
  `<form class="stack" data-form="editor">
    <div class="card stack">
      <div><label class="lbl" for="ed-name">Nom</label><input type="text" id="ed-name" value="${esc(r.name||'')}" required></div>
      <div><label class="lbl" for="ed-desc">En une phrase (facultatif)</label><input type="text" id="ed-desc" value="${esc(r.desc||'')}"></div>
      <div class="row"><div style="flex:1"><label class="lbl" for="ed-prep">Prép. (min)</label><input type="number" id="ed-prep" min="0" value="${r.prep||0}" style="width:100%"></div>
        <div style="flex:1"><label class="lbl" for="ed-cook">Cuisson (min)</label><input type="number" id="ed-cook" min="0" value="${r.cook||0}" style="width:100%"></div>
        <div style="flex:1"><label class="lbl" for="ed-por">Pour (pers.)</label><input type="number" id="ed-por" min="1" value="${s.portions||1}" style="width:100%"></div></div>
    </div>
    <div class="card stack"><label class="lbl" for="ed-ing">Ingrédients, un par ligne</label><textarea id="ed-ing" rows="8" placeholder="200 g de farine&#10;3 œufs&#10;1 c. à s. d’huile d’olive">${esc(ingText)}</textarea>
      <p class="muted" style="font-size:12px">Écris les quantités pour le nombre de personnes indiqué au-dessus : Bidou les ramène à une personne.</p></div>
    <div class="card stack"><label class="lbl" for="ed-steps">Étapes, une par ligne</label><textarea id="ed-steps" rows="8">${esc((r.steps||[]).join('\n'))}</textarea>
      <label class="lbl" for="ed-tip">Astuce (facultatif)</label><input type="text" id="ed-tip" value="${esc(r.tip||'')}"></div>
    <div class="card stack"><div class="row"><div style="flex:1"><label class="lbl" for="ed-kcal">kcal / portion</label><input type="number" id="ed-kcal" min="0" value="${r.kcal||0}" style="width:100%"></div>
      <div style="flex:1"><label class="lbl" for="ed-cost">€ / portion</label><input type="number" id="ed-cost" min="0" step="0.1" value="${r.cost||0}" style="width:100%"></div></div></div>
    <button class="btn primary block" type="submit">Enregistrer dans mon carnet</button>
  </form>`}
  </div></main></div>`}

/* =================== Actions =================== */
async function generateWeek(){const keys=activeSlots().filter(k=>!D.week.slots[k].pinned);if(!keys.length){toast('Choisis au moins un repas à générer.');return}
  const ctl=new AbortController();UI.gen={kind:'week',n:0,total:keys.length,ctl};render();
  try{const text=await askChef(weekPrompt(keys),{signal:ctl.signal,max:14000,onText:t=>updateProgress(Math.min(keys.length,countNames(t)))});
    const res=parseJSON(text),arr=Array.isArray(res)?res:(res&&res.meals)||[];let ok=0;
    keys.forEach((k,i)=>{const raw=arr.find(m=>m&&m.slot===k)||arr[i];
      if(raw&&raw.mine){const m=D.mine.find(x=>x.id===raw.mine);if(m){D.week.slots[k].recipe=clone(m);ok++;return}}
      const r=cleanRecipe(raw,D.week.slots[k].mode);if(r){D.week.slots[k].recipe=r;ok++}});
    if(!ok)throw{code:'invalid_json'};
    toast(ok<keys.length?`${ok} repas sur ${keys.length} générés. Utilise « Autre idée » pour les autres.`:'Ta semaine est prête. La liste de courses aussi.');finishWeek()}
  catch(e){if(e&&e.code==='cancelled'){}else if(e&&FALLBACK.includes(e.code)){fillFromLibrary(keys);finishWeek();toast(chefErr(e))}else toast(chefErr(e))}
  finally{UI.gen=null;render()}}
function finishWeek(){D.week.createdAt=new Date().toISOString();D.shop.checked={};save()}
async function replaceSlot(k){if(UI.busy[k])return;UI.busy[k]=true;if(UI.sheet&&UI.sheet.slot===k)closeSheet();render();
  try{const text=await askChef(replacePrompt(k),{max:4000});const raw=parseJSON(text);const r=cleanRecipe(Array.isArray(raw)?raw[0]:(raw&&raw.recipe)||raw,D.week.slots[k].mode);
    if(!r)throw{code:'invalid_json'};D.week.slots[k].recipe=r;save()}
  catch(e){if(e&&FALLBACK.includes(e.code)){const avoid=activeSlots().filter(x=>D.week.slots[x].recipe).map(x=>D.week.slots[x].recipe.name);const r=libPick(D.week.slots[k].mode,avoid);if(r){D.week.slots[k].recipe=r;save()}toast(chefErr(e))}else if(!e||e.code!=='cancelled')toast(chefErr(e))}
  finally{delete UI.busy[k];render()}}
async function findIdeas(){const ctl=new AbortController();UI.gen={kind:'ideas',n:0,total:3,ctl};render();
  try{const text=await askChef(ideasPrompt(),{signal:ctl.signal,max:9000,onText:t=>updateProgress(Math.min(3,countNames(t)))});
    const res=parseJSON(text),arr=(Array.isArray(res)?res:(res&&res.recipes)||[]).map(o=>cleanRecipe(o,UI.ideaForm.mode)).filter(Boolean);
    if(!arr.length)throw{code:'invalid_json'};UI.ideas=arr;LS.set('bidou_ideas',JSON.stringify(arr))}
  catch(e){if(e&&FALLBACK.includes(e.code)){let pool=LIB.filter(r=>r.mode===UI.ideaForm.mode);UI.ideas=clone(pool.sort(()=>Math.random()-.5).slice(0,3));toast(chefErr(e))}else if(!e||e.code!=='cancelled')toast(chefErr(e))}
  finally{UI.gen=null;render()}}
async function importPaste(){const s=UI.sheet,txt=($('#paste-text')||{}).value||'';s.paste=txt;if(txt.trim().length<30){toast('Colle une recette un peu plus complète.');return}
  UI.gen={kind:'import',n:0,total:1};renderSheet();
  try{const text=await askChef(importPrompt(txt),{max:4000});const r=cleanRecipe(parseJSON(text),'normal');if(!r)throw{code:'invalid_json'};
    s.draft=r;s.portions=1;s.mode='form';toast('Relis puis enregistre.')}
  catch(e){toast(e&&FALLBACK.includes(e.code)?'Il faut un compte connecté pour la mise en forme par Claude. Tu peux aussi saisir la recette.':chefErr(e))}
  finally{UI.gen=null;renderSheet()}}
function saveEditor(){const s=UI.sheet,v=id=>($('#'+id)||{}).value||'';const por=Math.max(1,+v('ed-por')||1);
  const ing=v('ed-ing').split('\n').map(l=>parseIngLine(l,por)).filter(Boolean),steps=v('ed-steps').split('\n').map(x=>x.trim().replace(/^\d+[.)]\s*/,'')).filter(Boolean);
  const name=v('ed-name').trim();if(!name){toast('Donne un nom à ta recette.');return}if(!ing.length){toast('Ajoute au moins un ingrédient.');return}
  const prep=Math.max(0,+v('ed-prep')||0),cook=Math.max(0,+v('ed-cook')||0),total=prep+cook||30;
  const base=s.draft||{};const r=Object.assign({},base,{id:base.id&&base.mine?base.id:'m-'+uid(),mine:true,name,desc:v('ed-desc').trim(),prep,cook,total,mode:modeFor(total),
    ing,steps,tip:v('ed-tip').trim(),kcal:Math.max(0,+v('ed-kcal')||0),cost:Math.max(0,+v('ed-cost')||0),gear:base.gear||[],tags:base.tags||[],diff:base.diff||''});
  if(s.i!=null)D.mine[s.i]=r;else D.mine.unshift(r);save();UI.carnetTab='mine';closeSheet();if(tab()!=='carnet')location.hash='#carnet';else render();toast('Recette enregistrée dans ton carnet.')}
function toggleFav(r){if(!r)return;const i=D.favs.findIndex(f=>f.name===r.name);
  if(i>=0){D.favs.splice(i,1);toast('Retiré des favoris.')}else{if(D.favs.length>=200){toast('200 favoris maximum.');return}D.favs.unshift(clone(r));toast('Ajouté aux favoris.')}save();render()}
function addToSlot(r,k){if(!r||!k)return;const s=D.week.slots[k];s.recipe=clone(r);if(s.mode==='off'||r.total>MODES[s.mode].max)s.mode=r.mode;save();toast('Ajouté : '+dayLabel(k)+'.');render()}
function listItem(type,i){return type==='idea'?UI.ideas[i]:type==='mine'?D.mine[i]:D.favs[i]}
function newWeek(){const old=D.week;D.week=weekFromPlan(D.profile.plan);for(const k in D.week.slots){if(old.slots[k]&&old.slots[k].pinned&&old.slots[k].recipe&&D.week.slots[k].mode!=='off'){D.week.slots[k].recipe=old.slots[k].recipe;D.week.slots[k].pinned=true}}D.week.audace=old.audace;D.shop.checked={};save();render();toast('Nouvelle semaine prête à générer.')}

const A={
  start(){UI.screen='onboard';UI.ob=0;render();scrollTo(0,0)},
  goLogin(){UI.authMode='login';UI.authErr='';UI.screen='auth';render()},
  goSignup(){UI.authMode='signup';UI.authErr='';UI.screen='auth';render()},
  authBack(){UI.screen=D.profile.setup?null:'welcome';render()},
  authSwitch(){UI.authMode=UI.authMode==='signup'?'login':'signup';UI.authErr='';render()},
  async forgot(){const em=($('#au-email')||{}).value||'';if(!em){UI.authErr='Indique ton e-mail.';render();return}try{await SB.recover(em);toast('E-mail envoyé : suis le lien pour choisir un nouveau mot de passe.')}catch(e){UI.authErr=authErr(e);render()}},
  obNext(){UI.ob++;render();scrollTo(0,0)},
  obBack(){if(UI.ob===0){UI.screen=null;render();return}UI.ob--;render();scrollTo(0,0)},
  obFinish(){D.profile.setup=true;D.week=weekFromPlan(D.profile.plan);UI.screen=null;save();location.hash='#semaine';render();scrollTo(0,0)},
  household(b){D.profile.household=Math.max(1,Math.min(12,D.profile.household+ +b.dataset.d));save();render()},
  toggleArr(b){const a=D.profile[b.dataset.field],v=b.dataset.val,i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);save();render()},
  untag(b){const p=D.profile,f=b.dataset.field,i=+b.dataset.i;if(f==='allergies'){const ex=p.diet.filter(d=>!DIETS.includes(d));p.diet=p.diet.filter(d=>d!==ex[i])}else p[f].splice(i,1);save();render()},
  planMode(b){D.profile.plan[b.dataset.slot]=b.dataset.mode;if(!D.week.createdAt){const s=D.week.slots[b.dataset.slot];if(s&&!s.recipe)s.mode=b.dataset.mode}save();render()},
  opt(b){D.profile[b.dataset.field]=b.checked;save();render()},
  level(b){D.profile.level=b.dataset.val;save();render()},
  theme(b){D.profile.theme=b.dataset.val;save();render()},
  mode(b){D.week.slots[b.dataset.slot].mode=b.dataset.mode;save();render()},
  audace(b){D.week.audace=b.dataset.val;save();render()},
  season(){D.profile.season=!D.profile.season;save();render()},
  generate(){generateWeek()},
  stop(){UI.gen&&UI.gen.ctl&&UI.gen.ctl.abort()},
  open(b){openSheet({type:'slot',slot:b.dataset.slot})},
  pin(b){const s=D.week.slots[b.dataset.slot];s.pinned=!s.pinned;save();render()},
  replace(b){replaceSlot(b.dataset.slot)},
  favSlot(b){toggleFav(D.week.slots[b.dataset.slot].recipe)},
  newWeek(){openSheet({type:'confirm',title:'Nouvelle semaine ?',text:'Les repas actuels seront remplacés par ta semaine type, sauf ceux que tu as gardés (cadenas).',yes:'Repartir de zéro',run:newWeek})},
  confirmYes(){const f=UI.sheet&&UI.sheet.run;closeSheet();f&&f()},
  check(b){const k=b.dataset.key;if(D.shop.checked[k])delete D.shop.checked[k];else D.shop.checked[k]=true;save();render()},
  checkExtra(b){const e=D.shop.extra.find(x=>x.id===b.dataset.id);if(e){e.done=!e.done;save();render()}},
  delExtra(b){D.shop.extra=D.shop.extra.filter(x=>x.id!==b.dataset.id);save();render()},
  hideDone(){D.shop.hideDone=!D.shop.hideDone;save();render()},
  async shareList(){const t=listText();if(navigator.share){try{await navigator.share({title:'Courses Bidou',text:t});return}catch(e){if(e&&e.name==='AbortError')return}}
    try{await navigator.clipboard.writeText(t);toast('Liste copiée.')}catch(e){openSheet({type:'copy',text:t})}},
  ideaMode(b){UI.ideaForm.mode=b.dataset.mode;render()},
  ideaAudace(b){UI.ideaForm.audace=b.dataset.val;render()},
  openList(b){openSheet({type:b.dataset.type,i:+b.dataset.i})},
  favList(b){toggleFav(listItem(b.dataset.type,+b.dataset.i))},
  carnetTab(b){UI.carnetTab=b.dataset.val;render()},
  newRecipe(){openSheet({type:'editor',mode:'paste',draft:{},portions:4,i:null})},
  editMine(b){const i=+b.dataset.i;openSheet({type:'editor',mode:'form',draft:clone(D.mine[i]),portions:1,i})},
  deleteMine(b){const i=+b.dataset.i,r=D.mine[i];openSheet({type:'confirm',title:'Supprimer cette recette ?',text:'« '+(r&&r.name||'')+' » sera retirée de ton carnet.',yes:'Supprimer',run:()=>{D.mine.splice(i,1);save();render();toast('Recette supprimée.')}})},
  edMode(b){const s=UI.sheet;if(s.mode==='paste'){s.paste=($('#paste-text')||{}).value||''}s.mode=b.dataset.val;renderSheet()},
  importPaste(){importPaste()},
  closeSheet(){closeSheet()},
  sheetBg(b,e){if(e.target===b)closeSheet()},
  portions(b){const s=UI.sheet,d=+b.dataset.d;if(s.type==='slot'){const x=D.week.slots[s.slot];x.portions=Math.max(1,Math.min(12,portionsOf(s.slot)+d));save();render()}else{s.portions=Math.max(1,Math.min(12,(s.portions||D.profile.household)+d));renderSheet()}},
  favSheet(){toggleFav(sheetRecipe())},
  addSheet(){const k=($('#sheet-slot')||{}).value;if(!k){toast('Choisis un jour et un repas.');return}const r=sheetRecipe();closeSheet();addToSlot(r,k)},
  changePw(){openSheet({type:'password'})},
  async logout(){await SB.logout();SYNC='local';toast('Déconnecté. Tes données restent sur cet appareil.');render()},
  async install(){const p=UI.install;if(!p)return;UI.install=null;try{p.prompt();await p.userChoice}catch(e){}render()}
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.tagName==='SELECT')return;const f=A[b.dataset.act];if(f)f(b,e)});
document.addEventListener('change',e=>{const s=e.target;if(s.tagName!=='SELECT'||!s.dataset.act||!s.value)return;if(s.dataset.act==='addList')addToSlot(listItem(s.dataset.type,+s.dataset.i),s.value)});
let bindT;document.addEventListener('input',e=>{const el=e.target,b=el.dataset&&el.dataset.bind;if(!b)return;const[o,f]=b.split('.');
  if(o==='ideaForm'){UI.ideaForm[f]=el.value;return}const v=el.type==='number'?Math.max(0,+el.value||0):el.value;D[o][f]=v;LS.set('bidou_d',JSON.stringify(D));clearTimeout(bindT);bindT=setTimeout(save,800)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='envies'){e.preventDefault();e.target.blur();if(!UI.gen)generateWeek()}if(e.key==='Escape'&&UI.sheet)closeSheet()});
document.addEventListener('submit',async e=>{e.preventDefault();const f=e.target,k=f.dataset.form;
  if(k==='ideas'){findIdeas();return}
  if(k==='extra'){const inp=$('#extra-input'),t=inp.value.trim();if(!t)return;D.shop.extra.push({id:uid(),text:t,done:false});save();render();($('#extra-input')||{}).focus&&$('#extra-input').focus();return}
  if(k==='tag'){const field=f.dataset.field,inp=f.querySelector('input'),t=inp.value.trim();if(!t)return;const p=D.profile;
    if(field==='allergies'){if(!p.diet.includes(t))p.diet.push(t)}else if(!p[field].includes(t))p[field].push(t);save();render();const n=document.getElementById('tag-'+field);n&&n.focus();return}
  if(k==='editor'){saveEditor();return}
  if(k==='pw'){const pw=($('#np')||{}).value||'';if(pw.length<6){toast('6 caractères minimum.');return}try{await SB.req('/auth/v1/user',{method:'PUT',body:{password:pw}});closeSheet();toast('Mot de passe changé.')}catch(err){toast(authErr(err))}return}
  if(k==='auth'){const mode=f.dataset.mode,em=$('#au-email').value.trim(),pw=$('#au-pw').value;UI.authErr='';
    const btn=f.querySelector('button[type=submit]');btn.disabled=true;
    try{if(mode==='signup'){const ok=await SB.signup(em,pw);if(!ok){UI.authErr='';toast('Vérifie ta boîte mail : clique sur le lien pour confirmer ton compte, puis reviens te connecter.');UI.authMode='login';UI.screen='auth';if(!D.profile.setup){D.profile.setup=true;D.week=weekFromPlan(D.profile.plan);LS.set('bidou_d',JSON.stringify(D))}render();return}}
      else await SB.login(em,pw);
      if(!D.profile.setup&&mode==='signup'){D.profile.setup=true;D.week=weekFromPlan(D.profile.plan)}
      LS.set('bidou_d',JSON.stringify(D));claimDevice();SYNC='wait';await sync();startSync();UI.screen=null;location.hash='#semaine';render();toast(mode==='signup'?'Compte créé. Bienvenue !':'Connecté.')}
    catch(err){UI.authErr=authErr(err);render()}finally{btn.disabled=false}}
});
window.addEventListener('hashchange',()=>{if(handleAuthHash())return;if(UI.sheet)closeSheet();render();scrollTo(0,0)});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();UI.install=e;softRender()});

/* =================== Mises à jour et démarrage =================== */
let VER_AT=0,NEW_VER=false;
async function checkVersion(){if(location.protocol==='file:'||Date.now()-VER_AT<10*60000)return;VER_AT=Date.now();
  try{const r=await fetch('version.json',{cache:'no-store'}),j=await r.json();if(j&&j.v&&j.v!==APP_VER&&!NEW_VER){NEW_VER=true;toast('Nouvelle version de Bidou : elle sera là à la prochaine ouverture.')}}catch(e){}}
if('serviceWorker' in navigator&&location.protocol!=='file:'){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
handleAuthHash();
if(signedIn())startSync();
render();checkVersion();
