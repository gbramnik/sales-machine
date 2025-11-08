# 🚀 Sales Machine - Guide de Démarrage Rapide

## Tester l'Application Maintenant

L'application est déjà en cours d'exécution sur votre machine ! 

### 📍 URL d'Accès
```
http://localhost:5174
```

---

## 🎯 Ce Que Vous Pouvez Tester

### 1. **Page d'Accueil**
Vous verrez 3 boutons principaux :
- 🚀 **Onboarding Wizard** - Tester le flow d'onboarding complet
- 📊 **Dashboard** - Voir le dashboard de monitoring
- 🎨 **Design Components** - Explorer tous les composants

### 2. **Onboarding Wizard (5 Étapes)**

#### Étape 1 : Sélection d'Objectif
- Choisissez entre 3 objectifs de réunions mensuelles
- Cartes interactives avec hover et sélection
- Navigation clavier avec flèches

#### Étape 2 : Industrie & ICP
- Sélectionnez votre industrie parmi 20 options
- Recherche en temps réel
- Prévisualisation des recommandations ICP
- Paramètres avancés dépliables

#### Étape 3 : Vérification du Domaine
- Entrez votre domaine (ex: example.com)
- Cliquez "Check DNS Records"
- Voyez les résultats de vérification
- Instructions de configuration copiables

#### Étape 4 : Connexion Calendrier
- Choisissez Google ou Outlook
- Voyez l'état de connexion simulé
- Éditez les paramètres de disponibilité

#### Étape 5 : Revue & Lancement
- Revoyez toute la configuration
- Modifiez n'importe quelle étape en cliquant "Edit"
- Cochez les conditions d'utilisation
- Cliquez "Activate My AI Sales Rep"

### 3. **Dashboard de Monitoring**

#### Métriques Clés (4 Cartes)
- **Campaign Health** : Score 92 avec anneau de progression
- **Meetings This Week** : 12 réunions (+3 vs semaine dernière)
- **Active Prospects** : 247 prospects par stage
- **Review Queue** : 8 messages en attente

#### Pipeline Kanban
- 4 colonnes : Contacted, Engaged, Qualified, Meeting Booked
- Cartes de prospects cliquables
- Indicateurs VIP (couronne dorée)
- Scores de confiance colorés

#### AI Activity Stream
- Flux en temps réel avec indicateur "Live"
- Timeline des activités récentes
- Types : qualifié, répondu, réunion réservée, signalé

#### Alert Center
- Cliquez pour déplier/replier
- 3 types d'alertes avec actions
- Bouton dismiss pour supprimer

### 4. **Composants de Design**

Explorez tous les composants individuellement :

#### Health Score Card
- Score 92 avec anneau vert
- Tendance +5
- Cliquez "View Breakdown" pour voir les détails

#### Confidence Badges
- 4 badges avec différents scores
- Couleurs sémantiques : vert, ambre, rouge

#### VIP Indicators
- Icône, badge, et bannière
- Couronne dorée pour comptes VIP

#### Pipeline Kanban
- Cartes de prospects avec avatars
- Drag & drop (préparé pour Phase 2)

#### AI Activity Stream
- Flux avec timeline
- Animations d'entrée

#### Message Review Card
- Interface de révision complète
- Mode édition inline
- Actions : Approuver, Éditer, Rejeter

---

## 🎨 Éléments à Explorer

### Navigation Clavier
- **Tab** : Navigue entre éléments
- **Enter** : Active boutons/liens
- **Space** : Active checkboxes/radios
- **Arrow keys** : Navigation dans les grilles

### États Interactifs
- **Hover** : Survol avec effets de shadow et scale
- **Focus** : Contour bleu visible
- **Active** : États pressés
- **Disabled** : Grisé, non cliquable

### Animations
- **Fade-in** : Apparition douce (200ms)
- **Slide-down** : Glissement du haut (200ms)
- **Pulse** : Indicateur "Live" animé
- **Loading** : Spinners et états de chargement

---

## 📱 Test Responsive

### Desktop (1280px+)
```bash
# Taille normale de votre navigateur
# Tous les éléments s'affichent côte à côte
```

### Tablet (768px-1023px)
```bash
# Réduisez la fenêtre à ~900px
# Les métriques passent en grille 2x2
# Le pipeline devient scrollable horizontalement
```

### Mobile (<768px)
```bash
# Réduisez la fenêtre à ~400px
# Tout passe en colonne unique
# Les cartes s'empilent verticalement
```

---

## 🔍 Points d'Attention

### Données Mock
Toutes les données sont simulées pour la démonstration :
- Les scores et métriques sont statiques
- Les actions loggent dans la console (F12)
- Le "Live" stream est simulé

### Console du Navigateur
Ouvrez la console (F12) pour voir :
- Les clics sur prospects
- Les actions sur messages
- Les logs de navigation

### Performance
- Temps de chargement < 1s
- Animations fluides 60fps
- Pas de lag lors du scroll

---

## 🛠️ Commandes Utiles

### Redémarrer le Serveur
```bash
cd apps/web
npm run dev
```

### Voir les Erreurs
```bash
# Dans le terminal où tourne le serveur
# Les erreurs TypeScript s'affichent en rouge
```

### Changer le Port
```bash
# Si 5174 est occupé
# Vite choisira automatiquement le suivant (5175, 5176...)
```

---

## ✅ Checklist de Test

### Onboarding
- [ ] Sélectionner un objectif
- [ ] Chercher et sélectionner une industrie
- [ ] Entrer un domaine et vérifier
- [ ] Connecter un calendrier
- [ ] Revenir en arrière (Back)
- [ ] Éditer depuis la revue
- [ ] Activer l'AI Sales Rep

### Dashboard
- [ ] Voir les 4 métriques
- [ ] Cliquer "View Breakdown" sur Health Score
- [ ] Cliquer sur une carte de prospect
- [ ] Scroller dans l'Activity Stream
- [ ] Déplier/replier Alert Center
- [ ] Dismiss une alerte

### Composants
- [ ] Tester tous les badges
- [ ] Voir les différents placements VIP
- [ ] Approuver/Éditer/Rejeter un message
- [ ] Naviguer au clavier

---

## 🎉 Résultat Attendu

Vous devriez voir :
1. ✅ Une interface moderne et professionnelle
2. ✅ Des animations fluides
3. ✅ Des couleurs cohérentes (bleu, vert, ambre, rouge, or)
4. ✅ Des icônes claires (Lucide React)
5. ✅ Des interactions réactives
6. ✅ Une navigation intuitive

---

## 📞 Support

Si quelque chose ne fonctionne pas :
1. Vérifiez que le serveur tourne (terminal)
2. Rafraîchissez la page (Cmd+R / Ctrl+R)
3. Videz le cache (Cmd+Shift+R / Ctrl+Shift+R)
4. Consultez la console (F12)

---

**Bon test ! 🚀**







