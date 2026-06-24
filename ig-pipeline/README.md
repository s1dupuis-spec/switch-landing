# Pipeline IG full-auto — SWITCH

Chaque matin (7h30 Montréal), GitHub Actions :
1. lit le contenu du jour généré par la routine (`mon-premier-repo/posts-quotidiens/AAAA-MM-JJ/`),
2. rend la carte SWITCH en PNG (`render.mjs`, SVG -> PNG, sans navigateur),
3. committe le PNG (URL publique via raw.githubusercontent),
4. publie sur Instagram via l'API Graph (`publish.mjs`).

Workflow : `.github/workflows/ig-publish.yml`. Lancement manuel : onglet Actions -> Run workflow.

## ⚙️ 3 secrets à configurer (Settings -> Secrets and variables -> Actions, repo `switch-landing`)

1. **`REPO_PAT`** — Personal Access Token GitHub avec accès **lecture** au repo privé `mon-premier-repo` (scope `repo` ou fine-grained: Contents read). Sert à lire le contenu du jour.
2. **`IG_USER_ID`** — l'ID du **compte Instagram Business** (lié à la page FB « Sébastien Dupuis »).
3. **`IG_ACCESS_TOKEN`** — token longue durée avec la permission **`instagram_content_publish`** (+ `instagram_basic`, `pages_show_list`).

## Comment obtenir l'IG_USER_ID + le token
1. Compte Instagram en **Business** (ou Creator), lié à la page FB.
2. App Meta (developers.facebook.com) avec les produits **Instagram Graph API** + permissions ci-dessus. En mode dev, publie sur ton propre compte.
3. Récupérer un **token longue durée** (Graph API Explorer -> échange en long-lived). Le token expire (~60 j) -> à rafraîchir (ou automatiser le refresh plus tard).
4. IG_USER_ID : `GET /me/accounts` -> page -> `GET /{page-id}?fields=instagram_business_account`.

## Portée v1
- Publie les **posts IMAGE** (carte du jour) + caption. Les Reels (vidéo) = manuel pour l'instant.
- Full auto : publie sans validation humaine. Pour ajouter un gate d'approbation plus tard, conditionner l'étape publish à un fichier `approve/AAAA-MM-JJ` présent.

## DST
Cron en UTC. `30 11` = 7h30 l'été. En novembre (heure d'hiver), passer à `30 12`.
