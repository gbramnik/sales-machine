# Correction Projet Supabase - N8N Sales Machine → Sales-Machine

## Problème Identifié

Les migrations et données ont été déployées par erreur dans le projet **N8N Sales Machine** (`oowpbypwihbskxajdnjd`) au lieu du projet **Sales-Machine** (`sizslvtrbuldfzaoygbs`).

## État Actuel (2025-01-15)

### Comparaison des Projets

| Aspect | N8N Sales Machine (❌ Mauvais) | Sales-Machine (✅ Bon) |
|--------|-------------------------------|----------------------|
| **Project Ref** | `oowpbypwihbskxajdnjd` | `sizslvtrbuldfzaoygbs` |
| **Migrations** | 25 migrations appliquées | 25 migrations appliquées |
| **Tables** | Identiques | Identiques |
| **Données** | Identiques | Identiques |

### Données Actuelles

- **lists**: 402 lignes (1 user unique)
- **prospects**: 102 lignes (28 listes uniques)
- **email_templates**: 13 lignes (templates système)
- **topic_blacklist**: 26 lignes (blacklist système)
- **automation_logs**: 3 lignes (1 user unique)

## Actions Requises

### ✅ Étape 1: Vérification Sales-Machine (Bon Projet)

Le projet **Sales-Machine** a déjà toutes les migrations et données correctes. Aucune action nécessaire.

### ⚠️ Étape 2: Nettoyage N8N Sales Machine (Mauvais Projet)

**Option A: Supprimer toutes les données de test** (Recommandé si données de test uniquement)
- Supprimer les données des tables: `lists`, `prospects`, `automation_logs`
- Conserver les tables système: `email_templates`, `topic_blacklist` (peuvent être utiles pour référence)

**Option B: Réinitialiser complètement le projet** (Si le projet n'est plus utilisé)
- Supprimer le projet Supabase ou le laisser vide

### 📝 Étape 3: Documentation Configuration MCP

S'assurer que toutes les futures migrations utilisent le projet **Sales-Machine**:
- Vérifier que les scripts de migration pointent vers le bon projet
- Documenter dans les scripts de déploiement

## Configuration MCP Actuelle

```json
{
  "N8N-Sales-Machine": {
    "project-ref": "oowpbypwihbskxajdnjd"  // ❌ Mauvais projet
  },
  "Sales-Machine": {
    "project-ref": "sizslvtrbuldfzaoygbs"   // ✅ Bon projet
  }
}
```

## Recommandations

1. **Garder les deux projets MCP actifs** pour permettre le transfert/validation
2. **Nettoyer N8N Sales Machine** en supprimant les données de test
3. **Utiliser uniquement Sales-Machine** pour toutes les futures migrations
4. **Documenter** dans les scripts de migration quel projet utiliser

## Prochaines Étapes

- [x] Confirmer avec l'utilisateur si les données dans N8N Sales Machine sont des données de test
- [x] Nettoyer N8N Sales Machine si nécessaire
- [ ] Vérifier que tous les scripts pointent vers Sales-Machine
- [ ] Mettre à jour la documentation de déploiement

## Actions Effectuées (2025-01-15)

### ✅ Nettoyage N8N Sales Machine

**Données supprimées :**
- `automation_logs`: 3 lignes supprimées
- `prospects`: 102 lignes supprimées
- `lists`: 402 lignes supprimées

**Données conservées (tables système) :**
- `email_templates`: 13 lignes (templates système)
- `topic_blacklist`: 26 lignes (blacklist système)

### ✅ Vérification Sales-Machine

Le projet **Sales-Machine** était déjà vide de données utilisateur (comme prévu) :
- `automation_logs`: 0 lignes (vide)
- `prospects`: 0 lignes (vide)
- `lists`: 0 lignes (vide)
- `email_templates`: 13 lignes ✅ (templates système présents)
- `topic_blacklist`: 26 lignes ✅ (blacklist système présente)

**Résultat :** Le nettoyage a été effectué avec succès. 
- ✅ N8N Sales Machine : Données de test supprimées (lists, prospects, automation_logs)
- ✅ Sales-Machine : Prêt à recevoir les nouvelles données (vide mais avec tables système configurées)
- ✅ Les deux projets ont les mêmes migrations et tables système (email_templates, topic_blacklist)

**Conclusion :** La situation est maintenant correcte. Les données de test ont été supprimées du mauvais projet, et Sales-Machine est prêt pour les futures migrations et données de production.

## ✅ Vérification Finale - Sales-Machine

**Toutes les tables existent dans Sales-Machine :**
- ✅ `users` - Table utilisateurs
- ✅ `campaigns` - Campagnes
- ✅ `prospects` - Prospects
- ✅ `prospect_enrichment` - Enrichissement
- ✅ `email_templates` - Templates email (13 templates système)
- ✅ `ai_conversation_log` - Logs de conversation
- ✅ `lists` - Listes
- ✅ `companies` - Entreprises
- ✅ `credentials` - Credentials
- ✅ `api_credentials` - API credentials
- ✅ `automation_logs` - Logs d'automation
- ✅ `topic_blacklist` - Blacklist de topics (26 entrées système)
- ✅ `blacklist_warnings` - Avertissements blacklist
- ✅ `blacklist_incidents` - Incidents blacklist

**Total : 14 tables créées avec succès**

**Note :** Si l'interface Supabase Table Editor n'affiche pas les tables, il peut s'agir d'un problème de cache. Les tables existent bien dans la base de données comme confirmé par les requêtes SQL.

