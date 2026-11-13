// Bidou : configuration de la sauvegarde en ligne et de Claude.
// Colle ici l'URL et la clé publique (« publishable ») de ton projet Supabase :
// Supabase → Project Settings → API Keys (et Data API pour l'URL). Ces deux valeurs sont faites pour être publiques.
// Laisse vide pour utiliser Bidou sans compte (données sur l'appareil, recettes de la bibliothèque).
window.BIDOU_CONFIG = {
  supabaseUrl: 'https://oofcnoykwzhvifqxzkcg.supabase.co',   // ex. https://abcdefghijkl.supabase.co
  supabaseKey: 'sb_publishable_i7ElcFG_m0V5lGnk6_tijw_2IaBWLjn',    // ex. sb_publishable_xxxxxxxxxxxxxxxx
  chefFunction: 'dynamic-endpoint'   // nom de la fonction dans l'adresse Supabase (…/functions/v1/<nom>)
};
