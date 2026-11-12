// Bidou : le code de l'appli.
'use strict';
/* =================== Constantes =================== */
const APP_VER='bidou-v5';
const DAYS=[['lun','Lundi'],['mar','Mardi'],['mer','Mercredi'],['jeu','Jeudi'],['ven','Vendredi'],['sam','Samedi'],['dim','Dimanche']];
const SLOTS=[['pdj','Petit-déj'],['midi','Déjeuner'],['gouter','Goûter'],['soir','Dîner']];
const SI=b=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
const SLOT_ICON={pdj:SI('<path d="M3 18h18M6 18a6 6 0 0 1 12 0"/><path d="M12 7V4M5.6 10.6 4.2 9.2M18.4 10.6l1.4-1.4"/>'),
  midi:SI('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>'),
  gouter:SI('<circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="14.5" cy="9" r=".9" fill="currentColor"/><circle cx="13.5" cy="14.5" r=".9" fill="currentColor"/><circle cx="9" cy="15" r=".9" fill="currentColor"/>'),
  soir:SI('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>')};
const SLOT_PROMPT={pdj:'petit-déjeuner (sucré ou salé, nourrissant, portion de petit-déjeuner)',midi:'déjeuner (plat complet)',gouter:'goûter (petit en-cas, environ 200 à 300 kcal)',soir:'dîner (plat complet)'};
const SLOT_SHARE={pdj:.25,midi:.35,gouter:.1,soir:.3};
const MODE_ICON={off:SI('<path d="M6 12h12"/>'),express:SI('<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>'),normal:SI('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 3h4"/>'),long:SI('<path d="M4 11h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 11h2M20 11h2M8 7c0-1 1-1 1-2M12 7c0-1 1-1 1-2M16 7c0-1 1-1 1-2"/>')};
const MODES={
  off:{label:'—',short:'—',title:'Pas de repas'},
  express:{label:'Express',short:'20 min',title:'Express · 20 min max',max:20,prompt:'EXPRESS : 20 minutes maximum tout compris (préparation + cuisson), très peu de vaisselle'},
  normal:{label:'Normal',short:'45 min',title:'Normal · 45 min max',max:45,prompt:'NORMAL : entre 25 et 45 minutes tout compris'},
  long:{label:"J'ai le temps",short:'1 h +',title:"J'ai le temps · 1 h et +",max:180,prompt:"J'AI LE TEMPS : plat plus élaboré ou mijoté, 1 h ou plus (cuisson passive bienvenue), le plaisir de cuisiner"}
};
const MODE_KEYS=['off','express','normal','long'];
const RAYONS=['Fruits & légumes','Boucherie & poisson','Crèmerie & œufs','Boulangerie','Épicerie salée','Épicerie sucrée','Surgelés','Épices & condiments','Boissons','Autre'];
const GI=b=>`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
const GEAR_LIST=[
 ['plaques','Plaques',GI('<rect x="6" y="8" width="36" height="32" rx="4"/><circle cx="17" cy="19" r="5"/><circle cx="31" cy="19" r="5"/><circle cx="17" cy="31" r="4"/><circle cx="31" cy="31" r="4"/>')],
 ['four','Four',GI('<rect x="6" y="6" width="36" height="36" rx="4"/><path d="M6 15h36"/><circle cx="13" cy="10.5" r="1.4"/><circle cx="20" cy="10.5" r="1.4"/><rect x="12" y="20" width="24" height="16" rx="2"/><path d="M16 25h16"/>')],
 ['micro-ondes','Micro-ondes',GI('<rect x="4" y="10" width="40" height="28" rx="4"/><rect x="9" y="15" width="22" height="18" rx="2"/><circle cx="37.5" cy="18" r="2"/><path d="M35 26h5M35 30h5"/>')],
 ['airfryer','Airfryer',GI('<path d="M12 12c0-4 3-6 6-6h12c3 0 6 2 6 6v26a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z"/><path d="M12 24h24"/><path d="M20 31h8"/><path d="M19 10h10"/>')],
 ['mixeur','Mixeur',GI('<path d="M14 6h20l-3 22H17z"/><path d="M33 10h5v10h-6"/><rect x="13" y="28" width="22" height="14" rx="3"/><circle cx="24" cy="35" r="2"/>')],
 ['cocotte','Cocotte',GI('<path d="M8 20h32v12a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8z"/><path d="M4 22h4M40 22h4"/><path d="M10 20c0-4 6-7 14-7s14 3 14 7"/><path d="M22 13v-3h4v3"/>')],
 ['robot cuiseur','Robot cuiseur',GI('<path d="M10 14h20l-2 16H12z"/><path d="M8 30h30a4 4 0 0 1 4 4v6H8z"/><rect x="30" y="33" width="8" height="4" rx="1"/><path d="M14 10h12"/>')],
 ['wok','Wok',GI('<path d="M4 22h28c0 8-6 13-14 13S4 30 4 22z"/><path d="M32 23l12-5"/><path d="M14 16c0-3 2-3 2-6M20 16c0-3 2-3 2-6"/>')],
 ['cuiseur vapeur','Cuiseur vapeur',GI('<rect x="8" y="22" width="32" height="8" rx="2"/><rect x="8" y="32" width="32" height="8" rx="2"/><path d="M12 22c0-5 5-8 12-8s12 3 12 8"/><path d="M18 10c0-2 2-2 2-5M26 10c0-2 2-2 2-5"/>')]
];
const GEAR=GEAR_LIST.map(g=>g[0]);
const STAR=(cx,cy,r,f)=>{let pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*0.42:r;pts.push((cx+rr*Math.cos(a)).toFixed(2)+','+(cy+rr*Math.sin(a)).toFixed(2))}return`<polygon points="${pts.join(' ')}" fill="${f}"/>`};
const FL=b=>`<svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${b}</svg>`;
const V3=(a,b,c)=>FL(`<rect width="10" height="20" fill="${a}"/><rect x="10" width="10" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c}"/>`);
const H3=(a,b,c)=>FL(`<rect width="30" height="7" fill="${a}"/><rect y="6.6" width="30" height="7" fill="${b}"/><rect y="13.3" width="30" height="6.7" fill="${c}"/>`);
const CUISINES=[
 ['fr','Française',V3('#002395','#fff','#ed2939')],
 ['it','Italienne',V3('#009246','#fff','#ce2b37')],
 ['es','Espagnole',FL('<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>')],
 ['gr','Grecque',FL('<rect width="30" height="20" fill="#0d5eaf"/><g fill="#fff"><rect y="2.2" width="30" height="2.2"/><rect y="6.7" width="30" height="2.2"/><rect y="11.1" width="30" height="2.2"/><rect y="15.6" width="30" height="2.2"/></g><rect width="11" height="11" fill="#0d5eaf"/><rect x="4.4" width="2.2" height="11" fill="#fff"/><rect y="4.4" width="11" height="2.2" fill="#fff"/>')],
 ['ma','Marocaine',FL('<rect width="30" height="20" fill="#c1272d"/>'+STAR(15,10.5,5,'#006233'))],
 ['lb','Libanaise',FL('<rect width="30" height="20" fill="#fff"/><rect width="30" height="5" fill="#ed1c24"/><rect y="15" width="30" height="5" fill="#ed1c24"/><path d="M15 5.8l4.5 7.4h-9z" fill="#00a651"/><rect x="14.3" y="12.8" width="1.4" height="2" fill="#00a651"/>')],
 ['in','Indienne',H3('#ff9933','#fff','#138808').replace('</svg>','<circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" stroke-width=".8"/></svg>')],
 ['th','Thaïlandaise',FL('<rect width="30" height="20" fill="#a51931"/><rect y="3.3" width="30" height="13.4" fill="#f4f5f8"/><rect y="6.6" width="30" height="6.8" fill="#2d2a4a"/>')],
 ['vn','Vietnamienne',FL('<rect width="30" height="20" fill="#da251d"/>'+STAR(15,10.5,6,'#ffff00'))],
 ['jp','Japonaise',FL('<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>')],
 ['kr','Coréenne',FL('<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5" fill="#cd2e3a"/><path d="M10 10a5 5 0 0 0 10 0a2.5 2.5 0 0 0-5 0a2.5 2.5 0 0 1-5 0z" fill="#0047a0"/><g stroke="#000" stroke-width="1"><path d="M5 4l3 2M22 4l3-2M5 16l3-2M22 16l3 2"/></g>')],
 ['cn','Chinoise',FL('<rect width="30" height="20" fill="#de2910"/>'+STAR(6,6,3.5,'#ffde00'))],
 ['mx','Mexicaine',V3('#006847','#fff','#ce1126').replace('</svg>','<circle cx="15" cy="10" r="2.6" fill="#8c5b2b"/></svg>')],
 ['us','Américaine',FL('<rect width="30" height="20" fill="#fff"/><g fill="#b22234"><rect width="30" height="1.6"/><rect y="3.1" width="30" height="1.6"/><rect y="6.2" width="30" height="1.6"/><rect y="9.2" width="30" height="1.6"/><rect y="12.3" width="30" height="1.6"/><rect y="15.4" width="30" height="1.6"/><rect y="18.5" width="30" height="1.5"/></g><rect width="13" height="10.8" fill="#3c3b6e"/>')],
 ['af','Africaine','']
];
const CUISINE_LABEL=Object.fromEntries(CUISINES.map(c=>[c[0],c[1]]));
const OLD_CUISINES={'française':['fr'],'italienne':['it'],'japonaise':['jp'],'indienne':['in'],'mexicaine':['mx'],'libanaise':['lb'],'africaine':['af'],'américaine':['us'],'asiatique':['cn','th','vn'],'méditerranéenne':['gr','es']};
const DISLIKES=['coriandre','champignons','poivron','aubergine','courgette','chou-fleur','brocoli','épinards','céleri','fenouil','betterave','endive','olives','câpres','oignon cru','ail','piment','poisson','fruits de mer','porc','agneau','abats','tofu','chèvre','fromage bleu','avocat','noix de coco','cumin'];
const ALLERGENS=[
 ['gluten','Gluten',/farine(?! de (pois chiches|riz|sarrasin|maïs))|pain|pâtes|pates|spaghetti|tagliatelle|fusilli|penne|rigatoni|linguine|macaroni|coquillette|orzo|crozets|lasagne|nouilles(?! de (riz|patate))|vermicelles(?! de riz)|semoule|boulgour|couscous|tortillas? (de blé|complète)|galettes? (?!de riz)|udon|ramen|soba|biscuit|chapelure|brioche|bagel|muffin|crêpe|brick|raviolis|seigle|orge|avoine|muesli|granola|\bblé|bière|pâte (brisée|feuilletée|sablée|à pizza)|gnocchi|baguette|pita|sauce soja/],
 ['crustaces','Crustacés',/crevette|homard|langoustine|crabe|gambas|écrevisse|kimchi/],
 ['oeufs','Œufs',/œuf|oeuf|mayonnaise|brioche|crêpe/],
 ['poisson','Poisson',/saumon|thon|cabillaud|poisson|anchois|sardine|truite|merlu|nuoc|colin|\bbar\b|dorade|daurade|maquereau|lieu|haddock|morue|kimchi/],
 ['arachides','Arachides',/cacahu|arachide/],
 ['soja','Soja',/soja|tofu|edamame|miso|hoisin/],
 ['lait','Lait',/lait(?! de coco)|beurre(?! de cacahu)|crème|fromage|yaourt|parmesan|mozzarella|feta|comté|emmental|cheddar|ricotta|chèvre|skyr|mascarpone|raclette|reblochon|burrata|halloumi|pecorino|gorgonzola|tomme|manchego|roquefort|crêpe|brioche|pâte (brisée|feuilletée|sablée)/],
 ['fruits-coque','Fruits à coque',/noix(?! de coco)|noisette|amande|cajou|pistache|pécan|pignon/],
 ['celeri','Céleri',/céleri/],
 ['moutarde','Moutarde',/moutarde/],
 ['sesame','Sésame',/sésame|tahini|houmous|zaatar/],
 ['sulfites','Sulfites',/\bvin\b|vinaigre|fruits secs|abricots secs|pruneau|raisins secs|cidre/],
 ['lupin','Lupin',/lupin/],
 ['mollusques','Mollusques',/moule|calamar|seiche|poulpe|huître|saint-jacques|coque\b/]
];
const ALLERGEN_LABEL=Object.fromEntries(ALLERGENS.map(a=>[a[0],a[1]]));
const DIETS=['végétarien','pescétarien','sans gluten','sans lactose','sans porc','halal'];
const LEVELS=[['debutant','Je débute','Des recettes simples, expliquées pas à pas','🐣'],['a-laise','Je me débrouille','Je connais les bases (cuire, émincer, assaisonner)','🧑‍🍳'],['confirme','J’adore cuisiner','Des techniques et des plats plus élaborés','🔪']];
const DISLIKE_GROUPS=[['Légumes',['champignons','poivron','aubergine','courgette','chou-fleur','brocoli','épinards','céleri','fenouil','betterave','endive','avocat','olives']],
 ['Saveurs',['coriandre','câpres','oignon cru','ail','piment','cumin','noix de coco']],
 ['Viandes, poissons & co',['poisson','fruits de mer','porc','agneau','abats','tofu']],
 ['Fromages',['chèvre','fromage bleu']]];
const DISLIKE_EMOJI={coriandre:'🌿',champignons:'🍄',poivron:'🫑',aubergine:'🍆',courgette:'🥒','chou-fleur':'☁️',brocoli:'🥦','épinards':'🍃','céleri':'🥬',fenouil:'🌱',betterave:'🟣',endive:'🥗',olives:'🫒','câpres':'🟢','oignon cru':'🧅',ail:'🧄',piment:'🌶️',poisson:'🐟','fruits de mer':'🦐',porc:'🐖',agneau:'🐑',abats:'🫀',tofu:'🧊','chèvre':'🐐','fromage bleu':'🧀',avocat:'🥑','noix de coco':'🥥',cumin:'🫙'};
const ALLERGEN_EMOJI={gluten:'🌾',crustaces:'🦐',oeufs:'🥚',poisson:'🐟',arachides:'🥜',soja:'🫘',lait:'🥛','fruits-coque':'🌰',celeri:'🥬',moutarde:'🟡',sesame:'⚪',sulfites:'🍷',lupin:'🌼',mollusques:'🦪'};
const DIET_EMOJI={'végétarien':'🥕','pescétarien':'🐟','sans gluten':'🌾','sans lactose':'🥛','sans porc':'🐖','halal':'🌙'};
/* Photos des cuisines : Wikimedia Commons, licences libres (crédits dans Moi › Crédits photos). */
const WMT='https://thumb.wikimedia.org/wikipedia/commons/thumb/',WMC='https://commons.wikimedia.org/wiki/File:';
const CUISINE_IMG={
 tout:['4/4e/Spices_market_Medenine.jpg','Spices_market_Medenine.jpg','Marché aux épices','Bernard Gagnon','CC BY-SA 3.0'],
 fr:['b/b3/B%C5%93uf_bourguignon_06.JPG','B%C5%93uf_bourguignon_06.JPG','Bœuf bourguignon','Arnaud 25','CC BY-SA 4.0'],
 it:['4/46/Pizza-napoletana.jpg','Pizza-napoletana.jpg','Pizza napolitaine','Fabryx98','CC BY-SA 4.0'],
 es:['8/85/2012_Pa%C3%ABlla_Andalusia_Spain.jpg','2012_Pa%C3%ABlla_Andalusia_Spain.jpg','Paella','Jebulon','CC0'],
 gr:['5/54/Flickr_-_cyclonebill_-_Gr%C3%A6sk_salat.jpg','Flickr_-_cyclonebill_-_Gr%C3%A6sk_salat.jpg','Salade grecque','cyclonebill','CC BY-SA 2.0'],
 ma:['5/5a/Moroccan_tajine_with_meat.jpg','Moroccan_tajine_with_meat.jpg','Tajine','Marco Almbauer','CC BY-SA 4.0'],
 lb:['9/94/Lebanon%2C_Baalbek%2C_Lebanese_Hummus.jpg','Lebanon%2C_Baalbek%2C_Lebanese_Hummus.jpg','Houmous','Vyacheslav Argenberg','CC BY 4.0'],
 in:['f/fd/Chicken_tikka_masala.jpg','Chicken_tikka_masala.jpg','Poulet tikka masala','Michael Hays','CC BY 2.0'],
 th:['3/39/Phat_Thai_kung_Chang_Khien_street_stall.jpg','Phat_Thai_kung_Chang_Khien_street_stall.jpg','Pad thaï','Takeaway','CC BY-SA 3.0'],
 vn:['9/96/Pho-Beef-Noodle-Soup-2008.jpg','Pho-Beef-Noodle-Soup-2008.jpg','Phở bò','Kham Tran','CC BY-SA 3.0'],
 jp:['2/28/Ramen_Jump_002.jpg','Ramen_Jump_002.jpg','Ramen','Ocdp','CC0'],
 kr:['f/f5/Korean.food-Bibimbap-02.jpg','Korean.food-Bibimbap-02.jpg','Bibimbap','abex','CC BY-SA 2.0'],
 cn:['3/35/2019-02-22_Xiaolongbao_in_%22Taste_Of_Shanghai%22_restaurant%2C_Sydney%2C_Australia.jpg','2019-02-22_Xiaolongbao_in_%22Taste_Of_Shanghai%22_restaurant%2C_Sydney%2C_Australia.jpg','Xiaolongbao','Maksym Kozlenko','CC BY-SA 4.0'],
 mx:['7/73/001_Tacos_de_carnitas%2C_carne_asada_y_al_pastor.jpg','001_Tacos_de_carnitas%2C_carne_asada_y_al_pastor.jpg','Tacos','Larry Miller','CC BY-SA 2.0'],
 us:['3/36/Cheeseburgers_and_french_fries.jpg','Cheeseburgers_and_french_fries.jpg','Cheeseburger & frites','jeffreyw','CC BY 2.0'],
 af:['0/01/Jollof_rice_and_Dodo.jpg','Jollof_rice_and_Dodo.jpg','Riz jollof & alloco','Skarfmacaronne','CC BY-SA 4.0']};
const cuisineImg=id=>{const x=CUISINE_IMG[id];return x?WMT+x[0]+'/500px-'+x[1]:''};
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
function R(o){o.kind=o.kind||'repas';o.id='lib-'+o.key;o.total=o.prep+o.cook;o.ing=o.ing.map(([n,q,u,r,p])=>({n,q,u,r:RY[r],p:!!p}));o.months=o.months||[];return o}
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
R({key:'porridge-pomme',kind:'pdj',name:'Porridge pomme-cannelle & noix',desc:'Crémeux, chaud, il cale jusqu’à midi.',mode:'express',prep:3,cook:7,diff:'facile',gear:['plaques'],kcal:420,prot:14,carb:62,fat:12,cost:0.9,tags:['végétarien'],months:[9,10,11,12,1,2,3],
 ing:[['flocons d’avoine',50,'g','ES'],['lait',200,'ml','CO'],['pomme',1,'pièce','FL'],['cerneaux de noix',10,'g','ES'],['miel',1,'c. à c.','EP',1],['cannelle',1,'pincée','EC',1]],
 steps:['Chauffe le lait avec les flocons à feu doux, 5 min en remuant.','Ajoute la pomme râpée et la cannelle, 2 min.','Verse dans un bol, ajoute noix concassées et miel.']}),
R({key:'overnight-oats',kind:'pdj',name:'Overnight oats yaourt, fruits rouges & graines',desc:'Préparé la veille, prêt en sortant du lit.',mode:'express',prep:5,cook:0,diff:'facile',gear:[],kcal:390,prot:18,carb:52,fat:11,cost:1.3,tags:['végétarien','sans cuisson'],
 ing:[['flocons d’avoine',45,'g','ES'],['yaourt nature',100,'g','CO'],['lait',80,'ml','CO'],['fruits rouges surgelés',80,'g','SU'],['graines de chia',1,'c. à s.','ES'],['miel',1,'c. à c.','EP',1]],
 steps:['Mélange flocons, yaourt, lait, chia et miel dans un pot.','Ajoute les fruits rouges dessus.','Ferme et laisse une nuit au frais.']}),
R({key:'tartine-oeuf-avocat',kind:'pdj',name:'Tartine avocat & œuf mollet',desc:'Le petit-déj salé qui donne de l’énergie.',mode:'express',prep:5,cook:6,diff:'facile',gear:['plaques'],kcal:430,prot:18,carb:32,fat:26,cost:1.6,tags:['végétarien'],
 ing:[['pain complet',2,'tranche','BO'],['avocat',0.5,'pièce','FL'],['œufs',1,'pièce','CO'],['citron',0.25,'pièce','FL'],['graines de sésame',1,'c. à c.','ES']],
 steps:['Cuis l’œuf 6 min dans l’eau bouillante, passe-le sous l’eau froide.','Grille le pain.','Écrase l’avocat avec citron, sel et poivre, tartine.','Ajoute l’œuf coupé et le sésame.']}),
R({key:'pancakes-banane',kind:'pdj',name:'Pancakes banane-avoine',desc:'Trois ingrédients, zéro sucre ajouté.',mode:'express',prep:5,cook:10,diff:'facile',gear:['plaques','mixeur'],kcal:410,prot:17,carb:58,fat:12,cost:0.9,tags:['végétarien'],
 ing:[['banane',1,'pièce','FL'],['œufs',2,'pièce','CO'],['flocons d’avoine',40,'g','ES'],['yaourt nature',60,'g','CO'],['huile neutre',1,'c. à c.','EC',1]],
 steps:['Mixe banane, œufs et flocons.','Cuis de petites louches 2 min par face dans une poêle huilée.','Sers avec le yaourt.']}),
R({key:'oeufs-brouilles',kind:'pdj',name:'Œufs brouillés, ciboulette & pain grillé',desc:'Crémeux et protéinés.',mode:'express',prep:3,cook:5,diff:'facile',gear:['plaques'],kcal:400,prot:22,carb:28,fat:22,cost:1.1,tags:['végétarien'],
 ing:[['œufs',2,'pièce','CO'],['beurre',5,'g','CO'],['ciboulette',0.25,'botte','FL'],['pain de campagne',1,'tranche','BO'],['tomate',1,'pièce','FL']],
 steps:['Bats les œufs avec sel et poivre.','Cuis-les à feu doux dans le beurre en remuant sans arrêt.','Retire du feu encore crémeux, ajoute la ciboulette.','Sers avec le pain grillé et la tomate.']}),
R({key:'bol-skyr-granola',kind:'pdj',name:'Bol skyr, granola & kiwi',desc:'Frais, croquant, riche en protéines.',mode:'express',prep:3,cook:0,diff:'facile',gear:[],kcal:360,prot:22,carb:46,fat:9,cost:1.4,tags:['végétarien','sans cuisson'],months:[11,12,1,2,3,4],
 ing:[['skyr',150,'g','CO'],['granola',30,'g','ES'],['kiwi',1,'pièce','FL'],['miel',1,'c. à c.','EP',1]],
 steps:['Verse le skyr dans un bol.','Ajoute le kiwi en dés et le granola.','Arrose de miel.']}),
R({key:'pomme-beurre-cacahuete',kind:'gouter',name:'Pomme & beurre de cacahuète',desc:'Croquant, sucré-salé, prêt en deux minutes.',mode:'express',prep:2,cook:0,diff:'facile',gear:[],kcal:230,prot:7,carb:26,fat:12,cost:0.7,tags:['végétarien','sans cuisson'],
 ing:[['pomme',1,'pièce','FL'],['beurre de cacahuète',1,'c. à s.','ES']],
 steps:['Coupe la pomme en quartiers.','Trempe-les dans le beurre de cacahuète.']}),
R({key:'energy-balls',kind:'gouter',name:'Energy balls dattes, cacao & amandes',desc:'À préparer pour toute la semaine.',mode:'express',prep:15,cook:0,diff:'facile',gear:['mixeur'],kcal:220,prot:5,carb:28,fat:10,cost:0.8,tags:['végétarien','sans cuisson'],
 ing:[['dattes',40,'g','ES'],['amandes',20,'g','ES'],['cacao en poudre',1,'c. à c.','EP'],['flocons d’avoine',10,'g','ES']],
 steps:['Mixe dattes, amandes, flocons et cacao.','Forme des boules avec les mains mouillées.','Garde-les au frais jusqu’à une semaine.']}),
R({key:'yaourt-miel-noix',kind:'gouter',name:'Yaourt grec, miel & noix',desc:'Un classique crémeux.',mode:'express',prep:2,cook:0,diff:'facile',gear:[],kcal:250,prot:12,carb:16,fat:15,cost:0.9,tags:['végétarien','sans cuisson'],
 ing:[['yaourt grec',125,'g','CO'],['cerneaux de noix',10,'g','ES'],['miel',1,'c. à c.','EP',1]],
 steps:['Verse le yaourt dans un bol.','Ajoute noix concassées et miel.']}),
R({key:'tartine-chocolat-banane',kind:'gouter',name:'Tartine complète, chocolat noir & banane',desc:'Le goûter d’enfance, version maline.',mode:'express',prep:3,cook:0,diff:'facile',gear:[],kcal:270,prot:6,carb:42,fat:9,cost:0.7,tags:['végétarien','sans cuisson'],
 ing:[['pain complet',1,'tranche','BO'],['chocolat noir',10,'g','EP'],['banane',0.5,'pièce','FL']],
 steps:['Râpe ou coupe finement le chocolat sur le pain.','Ajoute la banane en rondelles.']}),
R({key:'banana-bread',kind:'gouter',name:'Banana bread moelleux',desc:'Pour plusieurs goûters, encore meilleur le lendemain.',mode:'long',prep:15,cook:50,diff:'facile',gear:['four'],kcal:260,prot:6,carb:36,fat:10,cost:0.6,tags:['végétarien'],
 ing:[['bananes bien mûres',0.5,'pièce','FL'],['farine',30,'g','EC',1],['œufs',0.25,'pièce','CO'],['sucre',8,'g','EC',1],['beurre',8,'g','CO'],['levure chimique',1,'pincée','EP'],['cerneaux de noix',5,'g','ES']],
 steps:['Préchauffe le four à 180 °C.','Écrase les bananes, mélange avec beurre fondu, sucre et œufs.','Ajoute farine, levure et noix.','Verse dans un moule à cake beurré, enfourne 50 min.']}),
R({key:'compote-amandes',kind:'gouter',name:'Compote maison express & amandes',desc:'Pomme et poire fondantes, au micro-ondes.',mode:'express',prep:4,cook:6,diff:'facile',gear:['micro-ondes'],kcal:200,prot:4,carb:32,fat:7,cost:0.8,tags:['végétarien'],months:[9,10,11,12,1,2,3],
 ing:[['pomme',1,'pièce','FL'],['poire',0.5,'pièce','FL'],['amandes',10,'g','ES'],['cannelle',1,'pincée','EC',1]],
 steps:['Coupe pomme et poire en dés.','Cuis 6 min au micro-ondes avec 2 c. à s. d’eau, couvert.','Écrase à la fourchette, ajoute cannelle et amandes.']}),
R({key:'risotto-champignons',name:'Risotto crémeux aux champignons',desc:'Le plaisir de remuer tranquillement.',mode:'long',prep:10,cook:40,diff:'moyen',gear:['plaques'],kcal:620,prot:20,carb:85,fat:20,cost:2.6,tags:['italienne','végétarien'],months:[9,10,11,12],
 ing:[['riz arborio',80,'g','ES'],['champignons',150,'g','FL'],['échalote',1,'pièce','FL'],['parmesan',25,'g','CO'],['beurre',10,'g','CO'],['vin blanc (facultatif)',40,'ml','BS'],['persil plat',0.25,'botte','FL'],['salade verte',50,'g','FL'],['bouillon de légumes',0.5,'cube','EC',1],['huile d’olive',1,'c. à s.','EC',1]],
 steps:['Prépare 300 ml de bouillon chaud par portion.','Fais dorer les champignons émincés à feu vif, réserve.','Fais suer l’échalote, ajoute le riz et nacre-le 2 min, déglace au vin.','Ajoute le bouillon louche par louche en remuant, pendant 18 à 20 min.','Hors du feu, incorpore beurre, parmesan et champignons, couvre 2 min.','Sers avec le persil et une salade verte.'],
 tip:'Le risotto doit onduler comme une vague quand tu secoues la casserole.'})
];
/* Bibliothèque étendue (recipes.js, ~150 recettes) : ajoutée aux recettes intégrées, sans doublon de nom. */
{const seen=new Set(LIB.map(r=>r.name.toLowerCase()));for(const o of (window.BIDOU_RECIPES||[])){if(seen.has(o.name.toLowerCase()))continue;seen.add(o.name.toLowerCase());try{LIB.push(R(Object.assign({},o,{ing:o.ing.map(x=>x.slice())})))}catch(e){}}}
const TAG_CUISINE={'française':['fr'],'italienne':['it'],'espagnole':['es'],'grecque':['gr'],'marocaine':['ma'],'libanaise':['lb'],'indienne':['in'],'thaïlandaise':['th'],'vietnamienne':['vn'],'japonaise':['jp'],'coréenne':['kr'],'chinoise':['cn'],'mexicaine':['mx'],'américaine':['us'],'africaine':['af'],'asiatique':['th','vn','jp','kr','cn'],'méditerranéenne':['gr','es','it','lb']};
const cuisinesOf=r=>(r.tags||[]).flatMap(t=>TAG_CUISINE[t]||[]);

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
const W2='w2:',weekOf=k=>k.startsWith(W2)?2:1,baseDay=d=>String(d).replace(W2,'');
function dayLabel(k){const[d,s]=k.split('-');return (DAYS.find(x=>x[0]===baseDay(d))||[,''])[1]+(weekOf(k)===2?' (sem. 2)':'')+' · '+String((SLOTS.find(x=>x[0]===s)||[,''])[1]).toLowerCase()}
const month=()=>new Date().getMonth()+1;
const inSeason=r=>!!r&&(r.season===true||(r.months||[]).includes(month()));

/* =================== Données =================== */
const ALLDAYS=DAYS.map(d=>d[0]);
function defaultMeals(){return{pdj:{days:[],mode:'express'},midi:{days:['sam','dim'],mode:'normal'},gouter:{days:[],mode:'express'},soir:{days:ALLDAYS.slice(),mode:'normal'}}}
function computePlan(p){const plan={};for(const[d]of DAYS)for(const[s]of SLOTS){const m=p.meals[s];plan[d+'-'+s]=m.days.includes(d)?((p.weekendLong&&(d==='sam'||d==='dim')&&(s==='midi'||s==='soir'))?'long':m.mode):'off'}if(p.weeks===2)for(const k of Object.keys(plan))plan[W2+k]=plan[k];return plan}
function defaultPlan(){return computePlan({meals:defaultMeals(),weekendLong:true})}
function defaultProfile(){return{setup:false,household:1,level:'a-laise',gear:['plaques','four','micro-ondes'],cuisines:['fr','it','jp'],likes:'',dislikes:[],diet:[],allergens:[],meals:defaultMeals(),weekendLong:true,
  plan:defaultPlan(),weeks:1,season:true,useMine:true,budgetOn:false,budget:50,calOn:false,kcal:2400,theme:'auto'}}
function weekFromPlan(plan){const slots={};for(const k in plan)slots[k]={mode:plan[k],recipe:null,pinned:false,portions:null};return{createdAt:null,envies:'',audace:'audace',slots}}
function norm(d){
  d=d&&typeof d==='object'?d:{};
  const hadMeals=!!(d.profile&&d.profile.meals);const p=Object.assign(defaultProfile(),d.profile||{});p.plan=Object.assign(defaultPlan(),p.plan||{});
  if(!hadMeals&&d.profile&&d.profile.plan){for(const[s]of SLOTS){const days=ALLDAYS.filter(x=>p.plan[x+'-'+s]&&p.plan[x+'-'+s]!=='off');const modes=days.map(x=>p.plan[x+'-'+s]);p.meals[s]={days,mode:modes.sort((a,b)=>modes.filter(v=>v===b).length-modes.filter(v=>v===a).length)[0]||p.meals[s].mode}}}
  for(const[s]of SLOTS){p.meals[s]=Object.assign({days:[],mode:'express'},p.meals[s]||{})}
  p.weeks=p.weeks===2?2:1;p.plan=computePlan(p);p.budget=Math.min(300,Math.max(10,+p.budget||50));p.kcal=Math.min(4000,Math.max(1200,+p.kcal||2400));
  p.gear=(p.gear||[]).filter(g=>GEAR.includes(g));p.allergens=Array.isArray(p.allergens)?p.allergens:[];
  p.cuisines=[...new Set((p.cuisines||[]).flatMap(c=>OLD_CUISINES[c]||[c]).filter(c=>c==='tout'||CUISINE_LABEL[c]))];
  const w=d.week&&d.week.slots?d.week:weekFromPlan(p.plan);
  const base=weekFromPlan(p.plan).slots;for(const k in base){w.slots[k]=Object.assign(base[k],w.slots[k]||{})}for(const k in w.slots){if(!base[k])delete w.slots[k]}
  return{profile:p,week:w,favs:Array.isArray(d.favs)?d.favs:[],mine:Array.isArray(d.mine)?d.mine:[],
    shop:Object.assign({checked:{},extra:[],hideDone:false},d.shop||{})};
}
let D=norm((()=>{try{return JSON.parse(LS.get('bidou_d')||'null')}catch(e){return null}})());
const UI={day:DAYS[(new Date().getDay()+6)%7][0],wk:1,shopWk:0,ob:0,carnetTab:'mine',ideas:(()=>{try{return JSON.parse(LS.get('bidou_ideas')||'[]')}catch(e){return[]}})(),ideaForm:{envie:'',use:'',mode:'normal',audace:'audace'},gen:null,busy:{},sheet:null,authMode:'signup',authErr:'',screen:null,install:null};
function save(){LS.set('bidou_d',JSON.stringify(D));markDirty()}
function applyPlan(){const p=D.profile;p.plan=computePlan(p);for(const k in p.plan){const s=D.week.slots[k];if(!s)D.week.slots[k]={mode:p.plan[k],recipe:null,pinned:false,portions:null};else if(!s.recipe)s.mode=p.plan[k]}for(const k in D.week.slots){if(!(k in p.plan))delete D.week.slots[k]}save();render()}
const activeSlots=()=>Object.keys(D.week.slots).filter(k=>D.week.slots[k].mode!=='off');
const portionsOf=k=>D.week.slots[k].portions||D.profile.household;
const mealKcal=(s='soir')=>Math.round(D.profile.kcal*(SLOT_SHARE[s]||.3)/10)*10;
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
  if(c==='no_config')return'Recettes de la bibliothèque Bidou.';
  if(c==='no_session')return'Recettes de la bibliothèque. Connecte-toi pour du sur-mesure.';
  if(c===403)return'Ton compte n’a pas accès à la génération par Claude. Demande à Simon de t’ajouter.';
  if(c===429)return'Limite du jour atteinte. Réessaie demain.';
  if(c==='offline')return'Pas de connexion internet.';
  if(c==='invalid_json')return'La réponse était illisible. Réessaie.';
  return'Petit souci avec Claude. Réessaie dans un moment.'}
const FALLBACK=['no_config','no_session',403];

/* =================== Prompts =================== */
function profileText(seasonOn){const p=D.profile;const lvl=(LEVELS.find(l=>l[0]===p.level)||LEVELS[1])[1];
  return[`- Matériel disponible (n'utilise RIEN d'autre ; couteaux, planche, casseroles, poêles et saladiers sont toujours là) : ${p.gear.join(', ')||'plaques uniquement'}`,
    `- Niveau en cuisine : ${lvl}`,`- Cuisines appréciées : ${p.cuisines.includes('tout')||!p.cuisines.length?'toutes : il est curieux et veut découvrir des cuisines du monde entier':p.cuisines.map(c=>CUISINE_LABEL[c]).join(', ')}`,p.likes?`- Ce qu'il aime : ${p.likes}`:'',
    `- À EXCLURE ABSOLUMENT (n'aime pas) : ${p.dislikes.join(', ')||'rien de particulier'}`,`- Régime / contraintes à respecter strictement : ${p.diet.join(', ')||'aucun, mange de tout'}`,
    p.allergens.length?`- ALLERGIES (danger : exclure absolument tout ingrédient qui en contient, y compris sauces et produits transformés) : ${p.allergens.map(a=>ALLERGEN_LABEL[a]).join(', ')}`:'',
    p.budgetOn?`- Budget : environ ${p.budget} € de courses par semaine pour ${p.household} personne(s)`:'- Budget : pas de contrainte stricte, reste raisonnable',
    p.calOn?`- Objectif : environ ${p.kcal} kcal par jour (petit-déjeuner ≈ ${mealKcal('pdj')}, déjeuner ≈ ${mealKcal('midi')}, goûter ≈ ${mealKcal('gouter')}, dîner ≈ ${mealKcal('soir')} kcal par portion)`:"- Pas d'objectif calorique : portions normales, rassasiantes et équilibrées",
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
${keys.map(k=>`- ${k} (${dayLabel(k)}, ${SLOT_PROMPT[k.split('-')[1]]}) : ${MODES[w.slots[k].mode].prompt}`).join('\n')}
${kept.length?`\nREPAS DÉJÀ PRÉVUS (ne les répète pas ; réutilise leurs ingrédients frais si c'est naturel) :\n${kept.join('\n')}`:''}
${mine.length?`\nSES RECETTES PERSO : tu peux en placer au plus 2 si elles collent au temps du créneau, en renvoyant seulement {"slot":"…","mine":"<id>"} pour ce créneau :\n${mine.join('\n')}`:''}

${RULES()}
- Petit-déjeuner et goûter : des recettes adaptées à ce moment (pas un plat de dîner), simples et équilibrées.
- Sur la période (déjeuners et dîners) : varie les protéines (volaille, poisson 1 à 2 fois, œufs, légumineuses, viande rouge au plus 1 fois), les cuisines et les textures. Jamais deux fois le même plat.
- Mutualise les ingrédients frais entre les recettes pour limiter le gaspillage et le coût.

FORMAT : réponds uniquement par un objet JSON, une entrée par créneau, dans l'ordre :
{"meals":[{"slot":"${keys[0]}",…recette…}]}
où chaque recette a exactement cette forme : ${SHAPE}`}
function replacePrompt(k){const w=D.week;const avoid=activeSlots().filter(x=>w.slots[x].recipe).map(x=>w.slots[x].recipe.name);
  return`Tu es le chef de Bidou, une application française qui planifie les repas de la semaine. Propose UNE nouvelle recette pour ${dayLabel(k)} : ${SLOT_PROMPT[k.split('-')[1]]}.

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

/* allergènes */
function allergensOf(r){const t=(r&&r.ing||[]).map(i=>String(i.n).toLowerCase()).join(' | ');return ALLERGENS.filter(a=>a[2].test(t)).map(a=>a[0])}
function userAlerts(r){const mine=D.profile.allergens;return mine.length?allergensOf(r).filter(a=>mine.includes(a)):[]}
function ingFlags(i){const n=String(i.n).toLowerCase();return{al:ALLERGENS.filter(a=>D.profile.allergens.includes(a[0])&&a[2].test(n)).map(a=>a[1]),dis:D.profile.dislikes.some(d=>n.includes(String(d).toLowerCase().replace(/ cru$/,'')))}}
/* secours sans Claude */
const kindOf=k=>{const s=k.split('-')[1];return s==='pdj'?'pdj':s==='gouter'?'gouter':'repas'};
function libPick(mode,avoid,kind='repas'){const p=D.profile,dis=p.dislikes.map(d=>d.toLowerCase().replace(/ cru$/,'')),veg=p.diet.includes('végétarien');
  const fits=r=>r.kind===kind&&r.gear.every(g=>p.gear.includes(g))&&!userAlerts(r).length&&!r.ing.some(i=>dis.some(d=>i.n.toLowerCase().includes(d)))&&(!veg||r.tags.includes('végétarien'));
  const base=LIB.filter(fits);if(!base.length)return null;
  const fresh=base.filter(r=>!avoid.includes(r.name)),M=r=>r.mode===mode,T=r=>r.total<=MODES[mode].max;
  const near=x=>x.slice().sort((a,b)=>Math.abs(a.total-MODES[mode].max)-Math.abs(b.total-MODES[mode].max)).slice(0,3);
  let pool=[fresh.filter(M),base.filter(M),fresh.filter(T),base.filter(T),near(base)].find(x=>x.length);
  if(p.season){const s2=pool.filter(r=>!r.months.length||r.months.includes(month()));if(s2.length)pool=s2}
  if(p.cuisines.length&&!p.cuisines.includes('tout')&&Math.random()<0.8){const s3=pool.filter(r=>cuisinesOf(r).some(c=>p.cuisines.includes(c)));if(s3.length)pool=s3}
  const r=clone(pool[Math.floor(Math.random()*pool.length)]);r.season=inSeason(r);return r}
function fillFromLibrary(keys){const used=activeSlots().filter(k=>!keys.includes(k)&&D.week.slots[k].recipe).map(k=>D.week.slots[k].recipe.name);
  for(const k of keys){const r=libPick(D.week.slots[k].mode,used,kindOf(k));D.week.slots[k].recipe=r;if(r)used.push(r.name)}}

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
function shoppingList(wk=0){const map=new Map(),keys=activeSlots().filter(k=>!wk||weekOf(k)===wk);
  for(const k of keys){const s=D.week.slots[k];if(!s.recipe)continue;const por=portionsOf(k);
    for(const i of s.recipe.ing||[]){const[q,u]=toBase(i.q,normUnit(i.u));const name=String(i.n||'').trim();if(!name)continue;
      const key=name.toLowerCase().split(/\s+/).map(w=>w.replace(/[sx]$/,'')).join(' ')+'|'+u;
      const staple=!!i.p||STAPLE_WORDS.some(w=>name.toLowerCase().startsWith(w));
      if(!map.has(key))map.set(key,{key,name,u,q:0,r:RAYONS.includes(i.r)?i.r:'Autre',staple,uses:new Set()});
      const it=map.get(key);it.q+=q*por;it.uses.add(s.recipe.name);if(!staple)it.staple=false}}
  const cost=sum(keys.filter(k=>D.week.slots[k].recipe).map(k=>(D.week.slots[k].recipe.cost||0)*portionsOf(k)));
  return{items:[...map.values()],cost}}
function listText(){const{items}=shoppingList(D.profile.weeks===2?UI.shopWk:0);const main=items.filter(i=>!i.staple&&!D.shop.checked[i.key]);const out=['Courses Bidou',''];
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
const shownOnce=new Set();function toastOnce(m){if(shownOnce.has(m))return;shownOnce.add(m);toast(m)}
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
  renderSheet();initDials()}
function softRender(){const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA')&&a.closest('#app'))return;render()}
function vTabbar(){const t=tab();const n=shoppingList().items.filter(i=>!i.staple&&!D.shop.checked[i.key]).length+D.shop.extra.filter(e=>!e.done).length;
  return`<nav class="tabbar" aria-label="Sections"><div class="wrap">${TABS.map(([id,l,ic])=>`<a href="#${id}" ${t===id?'aria-current="page"':''}><span class="ic">${ic}</span>${l}${id==='courses'&&n?`<span class="count num">${n}</span>`:''}</a>`).join('')}</div></nav>`}
function band(inner,cls=''){return`<header class="band gutter ${cls}"><div class="wrap"><div class="band-top"><span class="brand"><span class="badge">${logo(30)}</span>Bidou</span>${syncBadge()}</div>${inner}</div></header>`}
function syncBadge(){if(!SB.on()||tab()==='moi')return'';if(!signedIn())return`<a class="btn small ghost" href="#moi">Se connecter</a>`;
  const t=SYNC==='ok'?'':SYNC==='offline'?'Hors ligne':SYNC==='err'?'Synchro en attente':'';return t?`<span class="sub" style="font-size:12px;font-weight:600">${t}</span>`:''}
const ICO={
  users:SI('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.9-3.3 3-4.8 5.5-4.8s4.6 1.5 5.5 4.8"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.3c2.3.1 3.9 1.5 4.6 4.2"/>'),
  person:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" fill="currentColor"/><path d="M4 21c1-5 4.4-7.5 8-7.5s7 2.5 8 7.5z" fill="currentColor"/></svg>',
  chef:SI('<path d="M7 14a4 4 0 0 1-.6-7.9A5 5 0 0 1 16 5a4 4 0 0 1 1 9"/><path d="M7 14v6h10v-6M7 17h10"/>'),
  globe:SI('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>'),
  no:SI('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'),
  alert:SI('<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17v.5"/>'),
  sliders:SI('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  moon:SI('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  phone:SI('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
  pot:GEAR_LIST[5][2],
  euro:SI('<path d="M17 6.5a7 7 0 1 0 0 11M4 10h9M4 14h9"/>'),
  flame:SI('<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 5 1-2 1-5 1-9z"/>'),
  chev:SI('<path d="M9 5l7 7-7 7"/>'),
  sun:SI('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>')
};

/* ---- accueil ---- */
function vWelcome(){return`<div class="screen welcome gutter"><div class="wrap">
  <div class="hero"><div class="logo-big">${logo(130)}</div><h1>Bidou</h1><p class="tagline">Tes repas de la semaine et ta liste de courses, en un geste.</p></div>
  <ol class="howto">
    <li><span class="hemo">🗓️</span><span><b>Tu choisis tes repas</b>Sur 1 ou 2 semaines : 14 ou 28 repas, à ton rythme.</span></li>
    <li><span class="hemo">✨</span><span><b>Bidou propose les recettes</b>Selon tes goûts, ton matériel et ton temps.</span></li>
    <li><span class="hemo">🛒</span><span><b>Ta liste de courses est prête</b>Triée par rayon, à cocher au magasin.</span></li>
  </ol>
  ${installHint()}
  <div class="stack"><button class="btn primary block" data-act="start">Commencer</button>
  ${SB.on()?`<button class="btn ghost block" data-act="goLogin">J’ai déjà un compte</button>`:''}</div></div></div>`}
function isIOS(){return/iphone|ipad|ipod/i.test(navigator.userAgent)}
function standalone(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function installHint(){if(standalone())return'';
  if(UI.install)return`<button class="btn ghost block" data-act="install">${I.share} Installer sur l’écran d’accueil</button>`;
  if(isIOS())return`<p class="note">${I.share.replace('<svg','<svg width="16" height="16" style="vertical-align:-3px"')} Partager › Sur l’écran d’accueil</p>`;
  return''}

/* ---- éditeurs (questionnaire et onglet Moi) ---- */
function tagInput(field,list,ph){return`<div class="chips">${list.map((t,i)=>`<span class="chip" aria-pressed="true">${esc(t)}<button class="x" data-act="untag" data-field="${field}" data-i="${i}" aria-label="Retirer ${esc(t)}">×</button></span>`).join('')}</div>
  <form class="row nowrap" data-form="tag" data-field="${field}"><input type="text" id="tag-${field}" placeholder="${esc(ph)}" aria-label="${esc(ph)}" enterkeyhint="done"><button class="btn" type="submit" aria-label="Ajouter">${I.plus}</button></form>`}
function householdEditor(){const n=D.profile.household;
  return`<div class="people" aria-hidden="true">${Array.from({length:Math.min(n,8)},()=>`<span>${ICO.person}</span>`).join('')}${n>8?`<b>+${n-8}</b>`:''}</div>
  <div class="big-stepper"><div class="stepper"><button data-act="household" data-d="-1" aria-label="Une personne de moins">−</button><span class="num">${n}</span><button data-act="household" data-d="1" aria-label="Une personne de plus">+</button></div></div>
  <h3 class="sec-sub">En cuisine, tu…</h3>
  <div class="levels" role="group" aria-label="Niveau en cuisine">${LEVELS.map(([id,l,d,e])=>`<button class="lvl" data-act="level" data-val="${id}" aria-pressed="${D.profile.level===id}"><span class="emo" aria-hidden="true">${e}</span><span class="lt"><b>${l}</b><span>${d}</span></span></button>`).join('')}</div>`}
function weeksSeg(cls=''){const w=D.profile.weeks;return`<div class="seg full ${cls}" role="group" aria-label="Durée du planning"><button data-act="weeks" data-val="1" aria-pressed="${w===1}">1 semaine</button><button data-act="weeks" data-val="2" aria-pressed="${w===2}">2 semaines</button></div>`}
function mealsEditor(){const m=D.profile.meals;
  return`<div class="stack">${weeksSeg()}<p class="muted center">${mealCount()} repas ${D.profile.weeks===2?'sur 2 semaines':'par semaine'}</p>${SLOTS.map(([s,l])=>{const on=m[s].days;return`<div class="mealrow ${on.length?'on':''}">
    <button class="mealhead" data-act="mealAll" data-slot="${s}" aria-pressed="${on.length>0}"><span class="mic">${SLOT_ICON[s]}</span><b>${l}</b><span class="cnt num">${on.length?on.length+' j':'—'}</span></button>
    <div class="daydots">${DAYS.map(([d,dl])=>`<button class="dd" data-act="mealDay" data-slot="${s}" data-day="${d}" aria-pressed="${on.includes(d)}" aria-label="${l} ${dl}">${dl.slice(0,2)}</button>`).join('')}</div></div>`}).join('')}</div>`}
function timeEditor(){const p=D.profile,act=SLOTS.filter(([s])=>p.meals[s].days.length);
  if(!act.length)return`<p class="muted">Choisis d’abord au moins un repas.</p>`;
  return`<div class="stack">${act.map(([s,l])=>`<div class="timecard"><div class="tc-head"><span class="mic">${SLOT_ICON[s]}</span><b>${l}</b></div>
    <div class="timeopts">${['express','normal','long'].map(m=>`<button class="topt" data-act="mealMode" data-slot="${s}" data-mode="${m}" data-tone="${m}" aria-pressed="${p.meals[s].mode===m}">${MODE_ICON[m]}<b>${MODES[m].short}</b></button>`).join('')}</div></div>`).join('')}
    ${act.some(([s])=>s==='midi'||s==='soir')?`<label class="switchrow"><span class="mic">${ICO.sun}</span><b>Plus de temps le week-end</b><input type="checkbox" data-act="weekendLong" ${p.weekendLong?'checked':''}></label>`:''}</div>`}
function gearEditor(){const p=D.profile;return`<div class="tiles">${GEAR_LIST.map(([id,l,ic])=>`<button class="tile" data-act="toggleArr" data-field="gear" data-val="${esc(id)}" aria-pressed="${p.gear.includes(id)}">${ic}<span>${l}</span></button>`).join('')}</div>`}
function cuisineEditor(){const p=D.profile,all=p.cuisines.includes('tout');
  return`<div class="cuisines">${[['tout','Tout, je suis curieux'],...CUISINES].map(([id,l])=>`<button class="cuisine${id==='tout'?' wide':''}" data-act="cuisine" data-val="${id}" aria-pressed="${id==='tout'?all:(!all&&p.cuisines.includes(id))}"><img src="${cuisineImg(id)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="cn">${l}</span><span class="ck" aria-hidden="true">✓</span></button>`).join('')}</div>`}
function likesField(id){return`<textarea id="${id}" data-bind="profile.likes" rows="2" aria-label="Ce que tu adores" placeholder="Tu adores… (fromage, épicé, croquant)">${esc(D.profile.likes)}</textarea>`}
function dislikeEditor(){const p=D.profile,custom=p.dislikes.filter(d=>!DISLIKES.includes(d));
  return`${DISLIKE_GROUPS.map(([g,list])=>`<h3 class="sec-sub">${g}</h3><div class="chips">${list.map(d=>`<button class="chip no" data-act="toggleArr" data-field="dislikes" data-val="${esc(d)}" aria-pressed="${p.dislikes.includes(d)}"><span class="emo" aria-hidden="true">${DISLIKE_EMOJI[d]||'•'}</span>${esc(d)}</button>`).join('')}</div>`).join('')}
  <h3 class="sec-sub">Autre chose ?</h3>${tagInput('dislikesCustom',custom,'Ex. : betterave crue')}`}
function allergyEditor(){const p=D.profile;
  return`<div class="algs">${ALLERGENS.map(([id,l])=>`<button class="alg" data-act="toggleArr" data-field="allergens" data-val="${id}" aria-pressed="${p.allergens.includes(id)}"><span class="emo" aria-hidden="true">${ALLERGEN_EMOJI[id]||'•'}</span><span>${l}</span></button>`).join('')}</div>
  <h3 class="sec-sub">Régime</h3>
  <div class="chips">${DIETS.map(d=>`<button class="chip" data-act="toggleArr" data-field="diet" data-val="${esc(d)}" aria-pressed="${p.diet.includes(d)}"><span class="emo" aria-hidden="true">${DIET_EMOJI[d]||''}</span>${esc(d)}</button>`).join('')}</div>
  ${tagInput('allergies',p.diet.filter(d=>!DIETS.includes(d)),'Autre contrainte…')}`}
function dial(field,val,min,max,step,unit,per){const f=(val-min)/(max-min);
  return`<div class="dial" data-dial="${field}" data-min="${min}" data-max="${max}" data-step="${step}" data-unit="${unit}">
    <svg viewBox="0 0 200 200" role="slider" tabindex="0" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${val}" aria-label="${unit} ${per}">
      <circle class="dtrack" cx="100" cy="100" r="80"/><circle class="dfill" cx="100" cy="100" r="80"/><circle class="dknob" r="14" cx="100" cy="100"/></svg>
    <div class="dval"><span><b class="num">${val}</b><small>${unit} ${per}</small></span></div>
    <div class="dctl"><button class="dstep" data-act="dialStep" data-field="${field}" data-d="-1" aria-label="Moins">−</button><span class="muted">Glisse le rond</span><button class="dstep" data-act="dialStep" data-field="${field}" data-d="1" aria-label="Plus">+</button></div></div>`}
function optionsEditor(){const p=D.profile;
  return`<div class="stack">
    <label class="switchrow"><span class="emo-ic" aria-hidden="true">🍂</span><b>De saison</b><input type="checkbox" data-act="opt" data-field="season" ${p.season?'checked':''}></label>
    <label class="switchrow"><span class="emo-ic" aria-hidden="true">📒</span><b>Mes recettes dans le planning</b><input type="checkbox" data-act="opt" data-field="useMine" ${p.useMine?'checked':''}></label>
    <label class="switchrow"><span class="emo-ic" aria-hidden="true">💶</span><b>Budget courses</b><input type="checkbox" data-act="opt" data-field="budgetOn" ${p.budgetOn?'checked':''}></label>
    ${p.budgetOn?dial('budget',p.budget,10,300,5,'€','/ semaine'):''}
    <label class="switchrow"><span class="emo-ic" aria-hidden="true">🔥</span><b>Objectif de calories</b><input type="checkbox" data-act="opt" data-field="calOn" ${p.calOn?'checked':''}></label>
    ${p.calOn?dial('kcal',p.kcal,1200,4000,50,'kcal','/ jour'):''}
  </div>`}
function themeEditor(){return`<div class="seg full" role="group" aria-label="Apparence">${[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(([id,l])=>`<button data-act="theme" data-val="${id}" aria-pressed="${D.profile.theme===id}">${l}</button>`).join('')}</div>`}

/* ---- questionnaire ---- */
const OB=[
  ['household','Combien à table ?','',householdEditor],
  ['meals','Tu cuisines quand ?','Touche un repas, puis ajuste les jours.',mealsEditor],
  ['time','Combien de temps ?','Pour chaque repas, en général.',timeEditor],
  ['gear','Ton matériel','',gearEditor],
  ['cuisines','Tu aimes manger…','',()=>cuisineEditor()+likesField('likes')],
  ['dislikes','Tu n’aimes pas…','',dislikeEditor],
  ['allergies','Des allergies ?','Aucune ? Passe à la suite.',allergyEditor],
  ['options','Options','',optionsEditor],
  ['account','Ton compte','Pour sauvegarder tes données.',()=>authForm('signup')]];
function obSteps(){return OB.filter(s=>s[0]!=='account'||(SB.on()&&!signedIn()))}
function vOnboard(){const steps=obSteps(),i=Math.min(UI.ob,steps.length-1),[id,title,lead,ed]=steps[i],last=i===steps.length-1;
  return`<div class="screen gutter"><div class="wrap ob">
    <div class="ob-top"><button class="icon-btn" data-act="obBack" aria-label="Retour">${I.back}</button><div class="ob-bar" style="grid-template-columns:repeat(${steps.length},1fr)">${steps.map((_,j)=>`<span class="${j<=i?'on':''}"></span>`).join('')}</div></div>
    <div class="ob-head"><h1>${title}</h1>${lead?`<p class="lead">${lead}</p>`:''}</div>
    ${ed()}
    <div class="ob-actions">${id==='account'?`<button class="btn block" data-act="obFinish">Plus tard</button>`:`<button class="btn primary block" data-act="${last?'obFinish':'obNext'}">${last?'C’est parti':'Continuer'}</button>`}</div>
  </div></div>`}
function authForm(mode){return`<form class="stack" data-form="auth" data-mode="${mode}">
  <input type="email" id="au-email" autocomplete="email" placeholder="E-mail" aria-label="E-mail" required>
  <input type="password" id="au-pw" autocomplete="${mode==='signup'?'new-password':'current-password'}" minlength="6" placeholder="Mot de passe (6 caractères min.)" aria-label="Mot de passe" required>
  ${UI.authErr?`<p class="err">${esc(UI.authErr)}</p>`:''}
  <button class="btn primary block" type="submit">${mode==='signup'?'Créer mon compte':'Me connecter'}</button>
  ${mode==='login'?`<button class="btn block" type="button" data-act="forgot">Mot de passe oublié</button>`:''}
  </form>`}
function vAuth(){const m=UI.authMode;return`<div class="screen gutter"><div class="wrap ob">
  <div class="ob-top"><button class="icon-btn" data-act="authBack" aria-label="Retour">${I.back}</button></div>
  <div class="ob-head"><h1>${m==='signup'?'Crée ton compte':'Content de te revoir'}</h1></div>
  ${authForm(m)}
  <button class="btn block" data-act="authSwitch">${m==='signup'?'J’ai déjà un compte':'Créer un compte'}</button></div></div>`}

/* ---- semaine ---- */
function meta(r,por){const b=[mins(r.total)];if(r.cost)b.push(eur(r.cost));if(r.kcal)b.push(nf0.format(r.kcal)+' kcal');if(por&&por!==1)b.push(por+' pers.');return b.join(' · ')}
function tagsFor(r){return`${inSeason(r)?`<span class="tag season">${I.leaf.replace('<svg','<svg width="12" height="12"')}Saison</span>`:''}${r.mine?'<span class="tag mine">Ma recette</span>':''}${userAlerts(r).length?`<span class="tag danger">! ${esc(userAlerts(r).map(a=>ALLERGEN_LABEL[a]).join(', '))}</span>`:''}`}
function mealCard(k){const s=D.week.slots[k],slot=k.split('-')[1],sl=(SLOTS.find(x=>x[0]===slot)||[])[1];
  const head=`<div class="meal-top"><span class="mic">${SLOT_ICON[slot]}</span><span class="slot-name">${sl}</span><button class="timechip" data-tone="${s.mode}" data-act="timeSheet" data-slot="${k}" aria-label="Temps pour ${esc(dayLabel(k))} : ${esc(MODES[s.mode].short)}">${MODE_ICON[s.mode]}${MODES[s.mode].short}</button></div>`;
  if(UI.busy[k])return`<article class="meal busy">${head}<p class="muted">Bidou cherche une idée…</p></article>`;
  if(!s.recipe)return`<article class="meal empty">${head}<p class="muted">À générer</p></article>`;
  const r=s.recipe;
  return`<article class="meal">${head}<button class="meal-open" data-act="open" data-slot="${k}"><span class="meal-name">${esc(r.name)}</span><span class="meal-meta num">${esc(meta(r,portionsOf(k)))}</span></button>
    <div class="meal-foot"><span class="tags">${tagsFor(r)}${r.total>MODES[s.mode].max+5?`<span class="tag danger">Trop long</span>`:''}</span>
    <span class="meal-acts"><button class="icon-btn ${s.pinned?'on':''}" data-act="pin" data-slot="${k}" aria-pressed="${s.pinned}" aria-label="Garder ce repas">${I.lock}</button>
    <button class="icon-btn" data-act="replace" data-slot="${k}" aria-label="Autre idée">${I.refresh}</button>
    <button class="icon-btn fav ${isFav(r)?'on':''}" data-act="favSlot" data-slot="${k}" aria-label="Favori">${I.heart}</button></span></div></article>`}
function progressHTML(){const g=UI.gen;if(!g)return'';const pct=g.n?Math.min(100,Math.round(g.n/g.total*100)):35;
  const label=g.n?`${g.n} / ${g.total}`:(g.kind==='week'?'Bidou cuisine ta semaine…':'Bidou cherche…');
  return`<div class="progress" id="gen-progress"><div class="bar ${g.n?'':'indet'}"><span style="width:${pct}%"></span></div><span class="num">${label}</span><button class="btn small" data-act="stop">Arrêter</button></div>`}
function updateProgress(n){if(!UI.gen||n===UI.gen.n)return;UI.gen.n=n;const el=document.getElementById('gen-progress');if(el)el.outerHTML=progressHTML()}
const AUDACE_SHORT={classique:'Classique',audace:'Audacieux',surprise:'Surprenant'};
const mealCount=()=>activeSlots().length;
function vWeek(){const w=D.week,p=D.profile,act=activeSlots(),filled=act.filter(k=>w.slots[k].recipe);
  const g=UI.gen,two=p.weeks===2,wk=two?UI.wk:1,pre=wk===2?W2:'',d=UI.day,dl=(DAYS.find(x=>x[0]===d)||DAYS[0])[1];
  const toGen=act.filter(k=>!w.slots[k].pinned).length,missing=act.filter(k=>!w.slots[k].recipe).length;
  const shop=shoppingList(),nItems=shop.items.filter(i=>!i.staple).length;
  const complete=act.length&&!missing,cta=!filled.length?`Générer mes ${act.length} repas`:missing?`Compléter les ${missing} repas`:'Tout régénérer';
  const ks=SLOTS.map(([s])=>pre+d+'-'+s).filter(k=>w.slots[k]),on=ks.filter(k=>w.slots[k].mode!=='off'),off=ks.filter(k=>w.slots[k].mode==='off');
  const prefs=[w.envies?'« '+w.envies+' »':'',p.season?'De saison':'',AUDACE_SHORT[w.audace||'audace']].filter(Boolean).join(' · ');
  return band(`<h1>${two?'Tes 2 semaines':'Ta semaine'}</h1>
    <div class="plan">
      ${weeksSeg('onband')}
      <button class="plan-sum" data-act="openEdit" data-sec="meals"><span><b class="num">${act.length}</b> repas · <b class="num">${p.household}</b> pers.</span><span class="plan-edit">Modifier ›</span></button>
      ${complete&&!g?`<a class="btn dark block big" href="#courses">${I.cart}<span>Voir mes courses · ${nItems} articles</span></a>`:`<button class="btn dark block big" data-act="generate" ${g||!toGen?'disabled':''}>${I.spark}<span>${cta}</span></button>`}
      <button class="prefs" data-act="prefsSheet"><span class="emo" aria-hidden="true">🎛️</span><span class="pt">${esc(prefs)}</span><span class="plan-edit">Envies ›</span></button>
    </div>
    ${g&&g.kind==='week'?progressHTML():''}`,'compact')+
  `<main class="gutter"><div class="wrap stack">
    <ol class="flow">
      <li class="done"><button data-act="openEdit" data-sec="meals"><span class="femo">🗓️</span><b>Repas</b><span>${act.length} prévus</span></button></li>
      <li class="${complete?'done':'cur'}"><button data-act="generate" ${g||!toGen?'disabled':''} aria-label="${complete?'Tout régénérer':cta}"><span class="femo">✨</span><b>Recettes</b><span class="num">${complete?'Tout régénérer':filled.length+' / '+act.length}</span></button></li>
      <li class="${filled.length?'cur':''}"><a href="#courses"><span class="femo">🛒</span><b>Courses</b><span>${nItems?nItems+' articles':'—'}</span></a></li>
    </ol>
    ${complete?'':filled.length?`<a class="shopcta" href="#courses"><span class="femo">🛒</span><span><b>Ma liste de courses</b><span class="num">${nItems} articles · ≈ ${eur(shop.cost)}</span></span>${ICO.chev}</a>`:
      `<div class="card hint"><p>Appuie sur <b>${cta}</b> : Bidou choisit les recettes, puis ta liste de courses se remplit toute seule.</p></div>`}
    ${two?`<div class="seg full wksel" role="tablist" aria-label="Semaine affichée"><button role="tab" data-act="wk" data-val="1" aria-selected="${wk===1}" aria-pressed="${wk===1}">Semaine 1</button><button role="tab" data-act="wk" data-val="2" aria-selected="${wk===2}" aria-pressed="${wk===2}">Semaine 2</button></div>`:''}
    <div class="daystrip" role="tablist" aria-label="Jours">${DAYS.map(([x,l])=>{const k2=SLOTS.map(([s])=>pre+x+'-'+s).filter(k=>w.slots[k]&&w.slots[k].mode!=='off');
      return`<button role="tab" class="dpill" data-act="day" data-day="${x}" aria-selected="${x===d}"><b>${l.slice(0,3)}</b><span class="dots">${k2.map(k=>`<i class="${w.slots[k].recipe?'full':''}"></i>`).join('')||'<i class="none"></i>'}</span></button>`}).join('')}</div>
    <h2 class="dayname">${dl}${two?` <small class="muted">· semaine ${wk}</small>`:''}</h2>
    ${on.length?on.map(mealCard).join(''):`<div class="card empty-state"><p>Pas de repas prévu.</p></div>`}
    ${off.length?`<div class="addmeals">${off.map(k=>{const s=k.split('-')[1];return`<button class="chip" data-act="timeSheet" data-slot="${k}">${I.plus}${(SLOTS.find(x=>x[0]===s)||[])[1]}</button>`}).join('')}</div>`:''}
    <button class="btn block subtle" data-act="newWeek">${I.refresh} Repartir de zéro</button>
  </div></main>`}

/* ---- courses ---- */
function itemRow(it){const done=!!D.shop.checked[it.key];if(done&&D.shop.hideDone)return'';
  return`<li><label class="item ${done?'done':''}"><input type="checkbox" data-act="check" data-key="${esc(it.key)}" ${done?'checked':''}><span class="nm">${esc(it.name)}</span><span class="q num">${esc(shopQty(it.q,it.u))}</span></label></li>`}
function vShop(){const two=D.profile.weeks===2,{items,cost}=shoppingList(two?UI.shopWk:0),extra=D.shop.extra;
  const main=items.filter(i=>!i.staple),stap=items.filter(i=>i.staple),left=main.filter(i=>!D.shop.checked[i.key]).length+extra.filter(e=>!e.done).length;
  const groups=RAYONS.map(r=>[r,main.filter(i=>i.r===r).sort((a,b)=>a.name.localeCompare(b.name,'fr'))]).filter(g=>g[1].length);
  return band(`<div class="between"><h1>Courses</h1><span class="pill num">${left} · ≈ ${eur(cost)}</span></div>
    <div class="row quick"><button class="qchip dark" data-act="shareList">${I.share}<span>Partager</span></button><button class="qchip" data-act="hideDone" aria-pressed="${D.shop.hideDone}">${I.close.replace('stroke-width="2.4"','stroke-width="2"')}<span>Masquer pris</span></button></div>
    ${two?`<div class="seg full onband" role="group" aria-label="Quelle semaine">${[[0,'Tout'],[1,'Semaine 1'],[2,'Semaine 2']].map(([v,l])=>`<button data-act="shopWk" data-val="${v}" aria-pressed="${UI.shopWk===v}">${l}</button>`).join('')}</div>`:''}`,'compact')+
  `<main class="gutter"><div class="wrap stack">
    <form class="row nowrap" data-form="extra"><input type="text" id="extra-input" placeholder="Ajouter (café, lessive…)" aria-label="Ajouter un article" enterkeyhint="done"><button class="btn primary" type="submit" aria-label="Ajouter">${I.plus}</button></form>
    ${!items.length&&!extra.length?`<div class="card empty-state"><h3>Liste vide</h3><a class="btn primary" href="#semaine">Planifier ma semaine</a></div>`:''}
    ${groups.map(([r,l])=>`<div class="card aisle"><h3>${esc(r)}<span class="muted num">${l.length}</span></h3><ul>${l.map(itemRow).join('')}</ul></div>`).join('')}
    ${extra.length?`<div class="card aisle"><h3>Autres</h3><ul>${extra.map(e=>(e.done&&D.shop.hideDone)?'':`<li class="xrow"><label class="item ${e.done?'done':''}"><input type="checkbox" data-act="checkExtra" data-id="${e.id}" ${e.done?'checked':''}><span class="nm">${esc(e.text)}</span><span></span></label><button class="icon-btn" data-act="delExtra" data-id="${e.id}" aria-label="Retirer ${esc(e.text)}">${I.close}</button></li>`).join('')}</ul></div>`:''}
    ${stap.length?`<div class="card aisle"><h3>Placards (à vérifier)</h3><ul>${stap.sort((a,b)=>a.name.localeCompare(b.name,'fr')).map(itemRow).join('')}</ul></div>`:''}
  </div></main>`}

/* ---- idées ---- */
function slotOptions(){const wks=D.profile.weeks===2?[['',' (sem. 1)'],[W2,' (sem. 2)']]:[['','']];return`<option value="">Ajouter à…</option>`+wks.map(([pre,suf])=>DAYS.map(([d,l])=>`<optgroup label="${l}${suf}">${SLOTS.map(([s,sl])=>{const k=pre+d+'-'+s,x=D.week.slots[k];return x?`<option value="${k}">${l}${suf} · ${sl.toLowerCase()}${x.recipe&&x.mode!=='off'?' (remplace)':''}</option>`:''}).join('')}</optgroup>`).join('')).join('')}
function rcard(r,type,i){return`<article class="card rcard"><button class="meal-open" data-act="openList" data-type="${type}" data-i="${i}"><span class="meal-name">${esc(r.name)}</span><span class="meal-meta num">${esc(meta(r))}</span></button>
  <div class="meal-foot"><span class="tags"><span class="tag ${esc(r.mode)}">${esc(MODES[r.mode]?.short||'')}</span>${tagsFor(r)}</span>
  <span class="meal-acts"><button class="icon-btn fav ${isFav(r)?'on':''}" data-act="favList" data-type="${type}" data-i="${i}" aria-label="Favori">${I.heart}</button></span></div>
  <select data-act="addList" data-type="${type}" data-i="${i}" aria-label="Ajouter à la semaine">${slotOptions()}</select></article>`}
function vIdeas(){const f=UI.ideaForm,g=UI.gen;
  return band(`<h1>Idées</h1>`,'compact')+
  `<main class="gutter"><div class="wrap stack"><form class="card stack" data-form="ideas">
    <input type="text" id="idea-envie" data-bind="ideaForm.envie" value="${esc(f.envie)}" placeholder="J’ai envie de… (croustillant, soupe…)" aria-label="J’ai envie de">
    <input type="text" id="idea-use" data-bind="ideaForm.use" value="${esc(f.use)}" placeholder="À finir : 2 courgettes, crème…" aria-label="Ingrédients à finir">
    <div class="timeopts small">${['express','normal','long'].map(m=>`<button type="button" class="topt" data-act="ideaMode" data-mode="${m}" data-tone="${m}" aria-pressed="${f.mode===m}">${MODE_ICON[m]}<b>${MODES[m].short}</b></button>`).join('')}</div>
    <div class="row quick"><button type="button" class="qchip light" data-act="season" aria-pressed="${D.profile.season}">${I.leaf}<span>Saison</span></button>
      <button type="button" class="qchip light" data-act="ideaAudaceCycle">${I.spark}<span>${AUDACE_SHORT[f.audace]}</span></button></div>
    <button class="btn primary block" type="submit" ${g?'disabled':''}>${I.spark} Trouver 3 idées</button>
    ${g&&g.kind==='ideas'?progressHTML():''}</form>
    ${UI.ideas.length?UI.ideas.map((r,i)=>rcard(r,'idea',i)).join(''):''}
  </div></main>`}

/* ---- carnet ---- */
function vCarnet(){const t=UI.carnetTab,list=t==='mine'?D.mine:D.favs;
  return band(`<div class="between"><h1>Carnet</h1>${t==='mine'?`<button class="btn dark small" data-act="newRecipe">${I.plus}<span>Ajouter</span></button>`:''}</div>
    <div class="seg" role="group"><button data-act="carnetTab" data-val="mine" aria-pressed="${t==='mine'}">Mes recettes · ${D.mine.length}</button><button data-act="carnetTab" data-val="favs" aria-pressed="${t==='favs'}">Favoris · ${D.favs.length}</button></div>`,'compact')+
  `<main class="gutter"><div class="wrap stack">
    ${list.length?list.map((r,i)=>rcard(r,t,i)).join(''):t==='mine'?`<div class="card empty-state">${I.book.replace('<svg','<svg width="40" height="40"')}<h3>Ton carnet est vide</h3><button class="btn primary" data-act="newRecipe">${I.plus} Ajouter une recette</button></div>`:`<div class="card empty-state">${I.heart.replace('<svg','<svg width="40" height="40"')}<h3>Aucun favori</h3><p>Touche le cœur sur une recette.</p></div>`}
  </div></main>`}

/* ---- moi : un menu, chaque réglage s’ouvre en plein écran ---- */
const SECTIONS={
  table:['À table','👥',householdEditor],
  meals:['Mes repas','🗓️',()=>mealsEditor()+'<h3 class="sec-sub">Temps</h3>'+timeEditor()],
  gear:['Matériel','🍳',gearEditor],
  cuisines:['Cuisines','🌍',()=>cuisineEditor()+likesField('likes2')],
  dislikes:['Je n’aime pas','🙅',dislikeEditor],
  allergies:['Allergies','⚠️',allergyEditor],
  options:['Options','🎚️',optionsEditor],
  theme:['Apparence','🌗',themeEditor],
  credits:['Crédits photos','📷',creditsView]};
const ME_GROUPS=[['Mon foyer',['table','meals','gear']],['Mes goûts',['cuisines','dislikes','allergies']],['Réglages',['options','theme','credits']]];
function creditsView(){return`<p class="muted">Photos des cuisines du monde : Wikimedia Commons, sous licence libre.</p><div class="menu card">${Object.entries(CUISINE_IMG).map(([id,x])=>`<a class="menurow" href="${WMC+x[1]}" target="_blank" rel="noopener"><span class="mt"><b>${esc(x[2])}</b><span class="muted">${esc(x[3])} · ${esc(x[4])}</span></span>${ICO.chev}</a>`).join('')}</div>`}
function secSummary(id){const p=D.profile;
  if(id==='table')return`${p.household} pers. · ${(LEVELS.find(l=>l[0]===p.level)||LEVELS[1])[1]}`;
  if(id==='credits')return'Wikimedia';
  if(id==='meals')return`${mealCount()} repas${p.weeks===2?' · 2 sem.':''}`;
  if(id==='gear')return`${p.gear.length} équipement${p.gear.length>1?'s':''}`;
  if(id==='cuisines')return p.cuisines.includes('tout')?'Tout':p.cuisines.map(c=>CUISINE_LABEL[c]).slice(0,3).join(', ')+(p.cuisines.length>3?'…':'')||'—';
  if(id==='dislikes')return p.dislikes.length?`${p.dislikes.length} ingrédient${p.dislikes.length>1?'s':''}`:'Rien';
  if(id==='allergies')return p.allergens.length?p.allergens.map(a=>ALLERGEN_LABEL[a]).join(', '):p.diet.length?p.diet.join(', '):'Aucune';
  if(id==='options')return[p.season?'Saison':'',p.budgetOn?p.budget+' €':'',p.calOn?p.kcal+' kcal':''].filter(Boolean).join(' · ')||'—';
  if(id==='theme')return{auto:'Auto',light:'Clair',dark:'Sombre'}[p.theme]||'Auto'}
function vMe(){const x=SB.sess();
  return band(`<h1>Moi</h1>`,'compact')+
  `<main class="gutter"><div class="wrap stack">
    <div class="card account">${!SB.on()?`<span class="avatar">${ICO.person}</span><p class="muted">Données sur cet appareil.</p>`:
      x?`<span class="avatar">${esc((x.email||'?')[0].toUpperCase())}</span><div class="acc-txt"><b>${esc(x.email||'')}</b><span class="muted">Sauvegardé</span></div><button class="btn small" data-act="accountSheet">Gérer</button>`:
      `<span class="avatar">${ICO.person}</span><div class="acc-txt"><b>Pas connecté</b><span class="muted">Pour sauvegarder</span></div><button class="btn primary small" data-act="goLogin">Se connecter</button>`}</div>
    ${ME_GROUPS.map(([g,ids])=>`<section class="mgroup" aria-label="${g}"><h2 class="section-title">${g}</h2><div class="mtiles">${ids.map(id=>{const[t,e]=SECTIONS[id];return`<button class="mtile" data-act="openEdit" data-sec="${id}"><span class="memo" aria-hidden="true">${e}</span><b>${t}</b><span class="muted">${esc(secSummary(id))}</span></button>`}).join('')}</div></section>`).join('')}
    ${standalone()?'':`<button class="mtile wide" data-act="installSheet"><span class="memo" aria-hidden="true">📲</span><b>Installer l’appli</b><span class="muted">Sur l’écran d’accueil</span></button>`}
    <p class="muted" style="text-align:center;font-size:12px">Bidou · ${APP_VER}</p>
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
  else if(s.type==='time'){const cur=D.week.slots[s.slot].mode;html=`<div class="sheet-wrap modal" data-act="sheetBg"><div class="panel"><div class="between"><h2>${esc(dayLabel(s.slot))}</h2><button class="icon-btn" data-act="closeSheet" aria-label="Fermer">${I.close}</button></div>
    <div class="timeopts big">${MODE_KEYS.map(m=>`<button class="topt" data-act="setTime" data-mode="${m}" data-tone="${m}" aria-pressed="${cur===m}">${MODE_ICON[m]}<b>${m==='off'?'Aucun':MODES[m].short}</b><span>${m==='off'?'Pas de repas':MODES[m].label}</span></button>`).join('')}</div></div></div>`}
  else if(s.type==='prefs'){const w=D.week,p=D.profile;html=`<div class="sheet-wrap modal" data-act="sheetBg"><div class="panel"><div class="between"><h2>Envies</h2><button class="icon-btn" data-act="closeSheet" aria-label="Fermer">${I.close}</button></div>
    <label class="lbl" for="envies">Une envie particulière ?</label><input type="text" id="envies" data-bind="week.envies" value="${esc(w.envies||'')}" placeholder="Thaï, réconfortant, léger…" enterkeyhint="done">
    <label class="switchrow"><span class="emo-ic" aria-hidden="true">🍂</span><b>Produits de saison</b><input type="checkbox" data-act="opt" data-field="season" ${p.season?'checked':''}></label>
    <span class="lbl">Originalité</span><div class="levels">${AUDACE.map(([id,l])=>`<button class="lvl" data-act="audace" data-val="${id}" aria-pressed="${(w.audace||'audace')===id}"><span class="emo" aria-hidden="true">${{classique:'🍲',audace:'🌶️',surprise:'🎲'}[id]}</span><span class="lt"><b>${l}</b><span>${{classique:'Des plats familiers et réconfortants',audace:'Des classiques avec une touche nouvelle',surprise:'Des recettes du monde, inattendues'}[id]}</span></span></button>`).join('')}</div>
    <button class="btn primary block" data-act="closeSheet">OK</button></div></div>`}
  else if(s.type==='edit'){const[t,,ed]=SECTIONS[s.sec];html=`<div class="sheet-wrap" role="dialog" aria-modal="true" aria-label="${esc(t)}"><header class="band gutter compact"><div class="wrap"><div class="between"><button class="icon-btn" data-act="closeSheet" aria-label="Retour" style="background:var(--band-soft);color:inherit">${I.back}</button><h1 style="font-size:24px">${esc(t)}</h1><span style="width:42px"></span></div></div></header>
    <main class="gutter" style="padding-bottom:32px"><div class="wrap stack">${ed()}<button class="btn primary block" data-act="closeSheet">Terminé</button></div></main></div>`}
  else if(s.type==='account'){const x=SB.sess()||{};html=`<div class="sheet-wrap modal" data-act="sheetBg"><div class="panel"><div class="between"><h2>Mon compte</h2><button class="icon-btn" data-act="closeSheet" aria-label="Fermer">${I.close}</button></div>
    <p class="muted">${esc(x.email||'')}</p><button class="btn block" data-act="changePw">Changer le mot de passe</button><button class="btn block" data-act="logout">Se déconnecter</button></div></div>`}
  else if(s.type==='install')html=`<div class="sheet-wrap modal" data-act="sheetBg"><div class="panel"><div class="between"><h2>Installer Bidou</h2><button class="icon-btn" data-act="closeSheet" aria-label="Fermer">${I.close}</button></div>
    ${UI.install?`<button class="btn primary block" data-act="install">${I.share} Installer maintenant</button>`:''}
    <div class="menu card"><div class="menurow static"><span class="mic">${ICO.phone}</span><span class="mt"><b>iPhone</b><span class="muted">Safari › Partager › Sur l’écran d’accueil</span></span></div>
    <div class="menurow static"><span class="mic">${ICO.phone}</span><span class="mt"><b>Fairphone / Android</b><span class="muted">Chrome › ⋮ › Installer l’application</span></span></div></div></div></div>`;
  else if(s.type==='copy')html=`<div class="sheet-wrap modal" data-act="sheetBg"><div class="panel"><div class="between"><h2>Ta liste</h2><button class="icon-btn" data-act="closeSheet" aria-label="Fermer">${I.close}</button></div><textarea id="copy-area" rows="14" readonly>${esc(s.text)}</textarea></div></div>`;
  const old=box.querySelector('.sheet-wrap'),same=old&&box.dataset.key===sheetKey(s),top=same?old.scrollTop:0;
  box.innerHTML=html;box.hidden=false;box.dataset.key=sheetKey(s);document.body.style.overflow='hidden';
  const nw=box.querySelector('.sheet-wrap');if(nw&&top)nw.scrollTop=top;initDials()}
function sheetKey(s){return[s.type,s.slot||'',s.i==null?'':s.i,s.sec||''].join(':')}
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
    ${(()=>{const al=allergensOf(r),ua=userAlerts(r);return(ua.length?`<div class="notice danger" role="alert"><span><b>Attention :</b> cette recette contient ${esc(ua.map(a=>ALLERGEN_LABEL[a]).join(', '))}, que tu as indiqué dans tes allergies.</span></div>`:'')+
      (al.length?`<div class="allergens"><span class="lbl" style="margin:0">Allergènes</span>${al.map(a=>`<span class="tag ${ua.includes(a)?'danger':'mine'}">${esc(ALLERGEN_LABEL[a])}</span>`).join('')}</div>`:'')})()}
    <section class="card"><div class="between" style="padding:2px 0 6px"><h2 style="font-size:19px">Ingrédients</h2>
      <div class="stepper"><button data-act="portions" data-d="-1" aria-label="Moins de portions">−</button><span class="num" style="font-size:14px;min-width:60px">${por} pers.</span><button data-act="portions" data-d="1" aria-label="Plus de portions">+</button></div></div>
      <ul class="ing">${(r.ing||[]).map((i,ix)=>{const f=ingFlags(i);return`<li class="${f.al.length?'danger':f.dis?'disliked':''}"><label><input type="checkbox" id="ing-${ix}"><span>${esc(i.n)}${f.al.length?`<small class="flag-al">Allergène : ${esc(f.al.join(', '))}</small>`:f.dis?'<small class="flag-dis">Tu n’aimes pas</small>':''}</span><span class="q num">${esc(ingQty(i,por))}</span></label></li>`}).join('')}</ul></section>
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

/* =================== Jauge ronde (budget, calories) =================== */
const DIAL_C=2*Math.PI*80;
function paintDial(el,v){const min=+el.dataset.min,max=+el.dataset.max,f=Math.max(0,Math.min(1,(v-min)/(max-min))),a=(135+f*270)*Math.PI/180;
  const fill=el.querySelector('.dfill'),knob=el.querySelector('.dknob');
  el.querySelector('.dtrack').setAttribute('stroke-dasharray',`${DIAL_C*.75} ${DIAL_C}`);fill.setAttribute('stroke-dasharray',`${DIAL_C*.75*f} ${DIAL_C}`);
  knob.setAttribute('cx',(100+80*Math.cos(a)).toFixed(1));knob.setAttribute('cy',(100+80*Math.sin(a)).toFixed(1));
  el.querySelector('.dval b').textContent=v;el.querySelector('svg').setAttribute('aria-valuenow',v)}
function setDial(el,v,commit){const min=+el.dataset.min,max=+el.dataset.max,st=+el.dataset.step;v=Math.max(min,Math.min(max,Math.round(v/st)*st));
  D.profile[el.dataset.dial]=v;paintDial(el,v);if(commit)save()}
function initDials(){document.querySelectorAll('.dial').forEach(el=>{paintDial(el,+D.profile[el.dataset.dial]);if(el.dataset.on)return;el.dataset.on='1';
  const svg=el.querySelector('svg');let drag=false;
  const at=e=>{const r=svg.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;let deg=Math.atan2(y,x)*180/Math.PI;let rel=(deg-135+720)%360;if(rel>270)rel=rel>315?0:270;
    const min=+el.dataset.min,max=+el.dataset.max;setDial(el,min+rel/270*(max-min),false)};
  svg.addEventListener('pointerdown',e=>{drag=true;svg.setPointerCapture(e.pointerId);at(e);e.preventDefault()});
  svg.addEventListener('pointermove',e=>{if(drag)at(e)});
  const end=()=>{if(drag){drag=false;save()}};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  svg.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'||e.key==='ArrowUp'?1:e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:0;if(d){e.preventDefault();setDial(el,+D.profile[el.dataset.dial]+d*+el.dataset.step,true)}})})}

/* =================== Actions =================== */
async function generateWeek(){const keys=activeSlots().filter(k=>!D.week.slots[k].pinned);if(!keys.length){toast('Choisis au moins un repas à générer.');return}
  const ctl=new AbortController();UI.gen={kind:'week',n:0,total:keys.length,ctl};render();
  const batches=[];for(let i=0;i<keys.length;i+=14)batches.push(keys.slice(i,i+14));let ok=0,done=0;
  try{for(const b of batches){
      const text=await askChef(weekPrompt(b),{signal:ctl.signal,max:14000,onText:t=>updateProgress(Math.min(keys.length,done+countNames(t)))});
      const res=parseJSON(text),arr=Array.isArray(res)?res:(res&&res.meals)||[];
      b.forEach((k,i)=>{const raw=arr.find(m=>m&&m.slot===k)||arr[i];
        if(raw&&raw.mine){const m=D.mine.find(x=>x.id===raw.mine);if(m){D.week.slots[k].recipe=clone(m);ok++;return}}
        const r=cleanRecipe(raw,D.week.slots[k].mode);if(r){D.week.slots[k].recipe=r;ok++}});
      done+=b.length;save()}
    if(!ok)throw{code:'invalid_json'};
    toast(ok<keys.length?`${ok} repas sur ${keys.length} générés.`:'C’est prêt ! Ta liste de courses aussi.');finishWeek()}
  catch(e){if(e&&e.code==='cancelled'){}else if(e&&FALLBACK.includes(e.code)){fillFromLibrary(keys.filter(k=>!D.week.slots[k].recipe||!ok));finishWeek();toastOnce(chefErr(e))}else toast(chefErr(e))}
  finally{UI.gen=null;render()}}
function finishWeek(){D.week.createdAt=new Date().toISOString();D.shop.checked={};save()}
async function replaceSlot(k){if(UI.busy[k])return;UI.busy[k]=true;if(UI.sheet&&UI.sheet.slot===k)closeSheet();render();
  try{const text=await askChef(replacePrompt(k),{max:4000});const raw=parseJSON(text);const r=cleanRecipe(Array.isArray(raw)?raw[0]:(raw&&raw.recipe)||raw,D.week.slots[k].mode);
    if(!r)throw{code:'invalid_json'};D.week.slots[k].recipe=r;save()}
  catch(e){if(e&&FALLBACK.includes(e.code)){const avoid=activeSlots().filter(x=>D.week.slots[x].recipe).map(x=>D.week.slots[x].recipe.name);const r=libPick(D.week.slots[k].mode,avoid,kindOf(k));if(r){D.week.slots[k].recipe=r;save()}toastOnce(chefErr(e))}else if(!e||e.code!=='cancelled')toast(chefErr(e))}
  finally{delete UI.busy[k];render()}}
async function findIdeas(){const ctl=new AbortController();UI.gen={kind:'ideas',n:0,total:3,ctl};render();
  try{const text=await askChef(ideasPrompt(),{signal:ctl.signal,max:9000,onText:t=>updateProgress(Math.min(3,countNames(t)))});
    const res=parseJSON(text),arr=(Array.isArray(res)?res:(res&&res.recipes)||[]).map(o=>cleanRecipe(o,UI.ideaForm.mode)).filter(Boolean);
    if(!arr.length)throw{code:'invalid_json'};UI.ideas=arr;LS.set('bidou_ideas',JSON.stringify(arr))}
  catch(e){if(e&&FALLBACK.includes(e.code)){let pool=LIB.filter(r=>r.kind==='repas'&&r.mode===UI.ideaForm.mode&&!userAlerts(r).length);UI.ideas=clone(pool.sort(()=>Math.random()-.5).slice(0,3));toastOnce(chefErr(e))}else if(!e||e.code!=='cancelled')toast(chefErr(e))}
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
function newWeek(){const old=D.week;UI.wk=1;D.profile.plan=computePlan(D.profile);D.week=weekFromPlan(D.profile.plan);for(const k in D.week.slots){if(old.slots[k]&&old.slots[k].pinned&&old.slots[k].recipe&&D.week.slots[k].mode!=='off'){D.week.slots[k].recipe=old.slots[k].recipe;D.week.slots[k].pinned=true}}D.week.audace=old.audace;D.week.envies=old.envies||'';D.shop.checked={};save();render();toast('Planning remis à zéro.')}

const A={
  start(){UI.screen='onboard';UI.ob=0;render();scrollTo(0,0)},
  goLogin(){UI.authMode='login';UI.authErr='';UI.screen='auth';render()},
  goSignup(){UI.authMode='signup';UI.authErr='';UI.screen='auth';render()},
  authBack(){UI.screen=D.profile.setup?null:'welcome';render()},
  authSwitch(){UI.authMode=UI.authMode==='signup'?'login':'signup';UI.authErr='';render()},
  async forgot(){const em=($('#au-email')||{}).value||'';if(!em){UI.authErr='Indique ton e-mail.';render();return}try{await SB.recover(em);toast('E-mail envoyé : suis le lien pour choisir un nouveau mot de passe.')}catch(e){UI.authErr=authErr(e);render()}},
  obNext(){UI.ob++;render();scrollTo(0,0)},
  obBack(){if(UI.ob===0){UI.screen=null;render();return}UI.ob--;render();scrollTo(0,0)},
  obFinish(){D.profile.setup=true;D.profile.plan=computePlan(D.profile);D.week=weekFromPlan(D.profile.plan);UI.screen=null;save();location.hash='#semaine';render();scrollTo(0,0)},
  household(b){D.profile.household=Math.max(1,Math.min(12,D.profile.household+ +b.dataset.d));save();render()},
  cuisine(b){const p=D.profile,v=b.dataset.val;if(v==='tout'){p.cuisines=p.cuisines.includes('tout')?[]:['tout']}else{p.cuisines=p.cuisines.filter(c=>c!=='tout');const i=p.cuisines.indexOf(v);if(i>=0)p.cuisines.splice(i,1);else p.cuisines.push(v)}save();render()},
  toggleArr(b){const a=D.profile[b.dataset.field],v=b.dataset.val,i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);save();render()},
  untag(b){const p=D.profile,f=b.dataset.field,i=+b.dataset.i;if(f==='allergies'){const ex=p.diet.filter(d=>!DIETS.includes(d));p.diet=p.diet.filter(d=>d!==ex[i])}else if(f==='dislikesCustom'){const ex=p.dislikes.filter(d=>!DISLIKES.includes(d));p.dislikes=p.dislikes.filter(d=>d!==ex[i])}else p[f].splice(i,1);save();render()},
  mealAll(b){const m=D.profile.meals[b.dataset.slot];m.days=m.days.length?[]:ALLDAYS.slice();applyPlan()},
  mealDay(b){const m=D.profile.meals[b.dataset.slot],d=b.dataset.day,i=m.days.indexOf(d);if(i>=0)m.days.splice(i,1);else m.days.push(d);applyPlan()},
  mealMode(b){D.profile.meals[b.dataset.slot].mode=b.dataset.mode;applyPlan()},
  weekendLong(b){D.profile.weekendLong=b.checked;applyPlan()},
  day(b){UI.day=b.dataset.day;render()},
  timeSheet(b){openSheet({type:'time',slot:b.dataset.slot})},
  setTime(b){const k=UI.sheet.slot;D.week.slots[k].mode=b.dataset.mode;closeSheet();save();render()},
  audaceCycle(){const o=['classique','audace','surprise'];D.week.audace=o[(o.indexOf(D.week.audace||'audace')+1)%3];save();render()},
  ideaAudaceCycle(){const o=['classique','audace','surprise'];UI.ideaForm.audace=o[(o.indexOf(UI.ideaForm.audace)+1)%3];render()},
  openEdit(b){openSheet({type:'edit',sec:b.dataset.sec})},
  accountSheet(){openSheet({type:'account'})},
  installSheet(){openSheet({type:'install'})},
  opt(b){D.profile[b.dataset.field]=b.checked;save();render()},
  level(b){D.profile.level=b.dataset.val;save();render()},
  theme(b){D.profile.theme=b.dataset.val;save();render()},
  mode(b){D.week.slots[b.dataset.slot].mode=b.dataset.mode;save();render()},
  audace(b){D.week.audace=b.dataset.val;save();render()},
  season(){D.profile.season=!D.profile.season;save();render()},
  generate(){if(UI.sheet)closeSheet();generateWeek()},
  weeks(b){D.profile.weeks=+b.dataset.val===2?2:1;if(D.profile.weeks===1){UI.wk=1;UI.shopWk=0}applyPlan()},
  wk(b){UI.wk=+b.dataset.val===2?2:1;render()},
  shopWk(b){UI.shopWk=+b.dataset.val||0;render()},
  prefsSheet(){openSheet({type:'prefs'})},
  dialStep(b){const el=b.closest('.dial');if(el)setDial(el,(+D.profile[b.dataset.field]||0)+ +b.dataset.d*+el.dataset.step,true)},
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
  async logout(){closeSheet();await SB.logout();SYNC='local';toast('Déconnecté. Tes données restent sur cet appareil.');render()},
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
    if(field==='allergies'){if(!p.diet.includes(t))p.diet.push(t)}else if(field==='dislikesCustom'){if(!p.dislikes.includes(t))p.dislikes.push(t)}else if(!p[field].includes(t))p[field].push(t);save();render();const n=document.getElementById('tag-'+field);n&&n.focus();return}
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
