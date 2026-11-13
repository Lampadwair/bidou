# Bidou : mise en route

Bidou est une webapp installable (iPhone, Fairphone, PC). Elle fonctionne tout de suite sans rien configurer : tes données restent alors sur l'appareil et les recettes viennent d'une petite bibliothèque intégrée.

Pour avoir **un compte avec sauvegarde** et **des recettes inventées par Claude**, il faut brancher Supabase (gratuit) et ta clé Claude. Compte 20 minutes, une seule fois.

## 1. Créer le projet Supabase

1. Sur https://supabase.com, crée un nouveau projet nommé `bidou` (région Europe, par exemple Paris). Garde le mot de passe de la base quelque part.
2. Ouvre **SQL Editor**, colle tout le contenu de `supabase/schema.sql`, puis **Run**. Ça crée la table de tes données et le compteur d'appels à Claude, avec des règles qui font que chacun ne voit que ses propres données.
3. Ouvre **Authentication → URL Configuration** :
   - **Site URL** : `https://lampadwair.github.io/bidou/`
   - **Redirect URLs** : ajoute aussi `https://lampadwair.github.io/bidou/`
4. Dans **Authentication → Sign In / Providers → Email**, laisse **Confirm email** coché : chacun confirme son adresse par e-mail. C'est ce qui empêche quelqu'un de créer un compte avec l'adresse d'un autre.
5. Ouvre **Project Settings → API Keys** et copie la clé **Publishable** (`sb_publishable_…`). Copie aussi l'**URL du projet** (`https://xxxx.supabase.co`, visible dans **Project Settings → Data API** ou sur l'accueil du projet).
6. Colle ces deux valeurs dans `config.js`. Elles sont faites pour être publiques : la sécurité vient des règles créées à l'étape 2.

## 2. Brancher Claude

1. Sur https://console.anthropic.com, crée une clé API (**API Keys → Create Key**) et ajoute quelques euros de crédit (**Billing**). Tu peux y fixer une limite de dépense mensuelle.
2. Dans Supabase, ouvre **Edge Functions → Deploy a new function → Via Editor**. Nomme-la exactement `bidou-chef`, remplace le code par le contenu de `supabase/functions/bidou-chef/index.ts`, puis **Deploy**.
3. Dans les réglages de la fonction (**Details**), désactive **Verify JWT with legacy secret** : la fonction vérifie elle-même que la personne est connectée.
4. Ouvre **Edge Functions → Secrets** et ajoute :
   - `ANTHROPIC_API_KEY` : ta clé `sk-ant-…`
   - `ALLOWED_EMAILS` (obligatoire) : ton e-mail, puis ceux de tes amis, séparés par des virgules. Seuls ces comptes, une fois leur e-mail confirmé, peuvent faire travailler Claude (et donc dépenser ton crédit). Si ce secret est vide, personne ne peut.
   - `DAILY_LIMIT` (facultatif) : nombre d'appels par personne et par jour, 30 par défaut.
   - `BIDOU_MODEL` (facultatif) : `claude-sonnet-5-5` par défaut.

Ta clé Claude reste dans Supabase : elle n'est jamais dans l'appli ni sur GitHub.

La même fonction sert aussi à **importer une recette depuis un lien** (Marmiton, 750g, blogs…). Cette partie n'a pas besoin de la clé Claude : la fonction lit la recette au format standard des sites de cuisine. Claude n'intervient que si la page n'a pas ce format.

**Mettre à jour la fonction** (quand `index.ts` change) : Supabase → **Edge Functions** → `bidou-chef` → **Code**, remplace tout le code par le nouveau contenu de `supabase/functions/bidou-chef/index.ts`, puis **Deploy**. Les secrets sont conservés.

Coût indicatif avec Claude Sonnet 5.5 : environ 5 à 10 centimes pour une semaine complète, moins d'un centime pour une idée ou une recette collée.

## 3. Mettre en ligne avec GitHub Pages

1. Sur GitHub, crée un dépôt **public** nommé `bidou` (Pages est gratuit pour les dépôts publics ; le dépôt ne contient que le code, jamais tes données ni ta clé Claude).
2. Depuis ce dossier :
   ```
   git init
   git add .
   git commit -m "Bidou"
   git branch -M main
   git remote add origin https://github.com/Lampadwair/bidou.git
   git push -u origin main
   ```
3. Sur GitHub, ouvre **Settings → Pages**, choisis **Deploy from a branch**, puis `main` et `/ (root)`, puis Save.
4. Une à deux minutes plus tard, Bidou est en ligne sur `https://lampadwair.github.io/bidou/`.

## 4. L'installer

- **iPhone** : ouvre l'adresse dans **Safari**, touche **Partager**, puis **Sur l'écran d'accueil**.
- **Fairphone / Android** : ouvre l'adresse dans **Chrome**, menu **⋮**, puis **Installer l'application** (ou **Ajouter à l'écran d'accueil**).
- **PC** : dans Chrome ou Edge, icône **Installer** dans la barre d'adresse.

Bidou s'ouvre alors en plein écran, comme une appli, et marche aussi hors ligne (sauf la génération par Claude).

## 5. Partager avec des amis

1. Ajoute leur e-mail dans le secret `ALLOWED_EMAILS` (Supabase → Edge Functions → Secrets).
2. Envoie-leur l'adresse de l'appli : ils créent leur compte au premier lancement. Chacun a ses propres goûts, semaines et recettes.

## Sécurité

- **Ce qui est public, et c'est normal** : le code de l'appli, l'adresse du projet Supabase et la clé « publishable » de `config.js`. Toute appli web envoie son code au navigateur, donc un dépôt privé ne le cacherait pas vraiment.
- **Ce qui protège tes données** : les règles de la base (`schema.sql`). Chaque personne ne peut lire et modifier que sa propre ligne, et ses données sont limitées à 2 Mo.
- **Ce qui ne doit jamais être publié** : le mot de passe de la base, la clé « secret » / « service_role » de Supabase et ta clé Claude `sk-ant-…`. Aucune n'est dans ce dossier.
- **Ta clé Claude** reste dans les secrets Supabase. Seuls les e-mails de `ALLOWED_EMAILS`, confirmés, peuvent s'en servir, avec une limite par jour. Fixe aussi une limite de dépense mensuelle dans la console Anthropic.
- **Active la double authentification (2FA)** sur GitHub et sur Supabase : si quelqu'un prenait ton compte GitHub, il pourrait modifier l'appli.
- **Option** : quand tes amis ont créé leur compte, tu peux fermer les inscriptions dans **Authentication → Sign In / Providers → Allow new users to sign up**.

## Mettre à jour

Double-clique sur `publier.bat` pour envoyer les modifications sur GitHub. Quand tu modifies l'appli, change aussi le numéro de version aux trois endroits (`APP_VER` dans `app.js`, `VERSION` dans `sw.js`, et `version.json`), puis fais un push. Les téléphones récupèrent la nouvelle version à la prochaine ouverture avec du réseau.
