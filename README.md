# 🎯 Habits Tracker

Une application mobile élégante pour suivre vos habitudes quotidiennes, développée avec React Native, Expo et TypeScript.

## 📱 Fonctionnalités

### ✅ Fonctionnalités principales
- **Gestion des habitudes** : Ajout, modification et suppression d'habitudes personnalisées
- **Suivi quotidien** : Marquer les habitudes comme complétées chaque jour
- **Icônes personnalisées** : Choix parmi 12 emojis pour représenter vos habitudes
- **Statistiques en temps réel** : Affichage du pourcentage de completion quotidien
- **Persistance des données** : Sauvegarde locale avec AsyncStorage
- **Notifications locales** : Rappels personnalisables pour chaque habitude
- **Interface moderne** : Design épuré avec mode clair/sombre
- **Vue historique** : Calendrier visuel montrant votre progression mensuelle

### 🎨 Interface utilisateur
- Design Material moderne avec animations fluides
- Mode sombre/clair adaptatif
- Navigation par onglets intuitive
- Feedback visuel pour toutes les interactions
- Interface responsive optimisée

## 🚀 Installation et configuration

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Un émulateur Android/iOS ou l'application Expo Go sur votre téléphone

### Étapes d'installation

1. **Cloner ou créer le projet**
```bash
npx create-expo-app habits-tracker --template
cd habits-tracker
```

2. **Installer les dépendances**
```bash
npm install expo-notifications react-native-safe-area-context @react-native-async-storage/async-storage @expo/vector-icons expo-constants expo-device
```

3. **Configuration TypeScript** (si pas déjà fait)
```bash
npm install --save-dev typescript @types/react @types/react-native
```

4. **Remplacer le contenu des fichiers**
- Remplacer le contenu de `App.tsx` par le code fourni
- Créer/modifier `app.json` avec la configuration fournie
- Créer `tsconfig.json` avec la configuration TypeScript

5. **Lancer l'application**
```bash
npx expo start
```

## 📱 Utilisation de l'application

### Écran principal
- **Vue d'ensemble** : Statistiques du jour avec barre de progression
- **Liste des habitudes** : Affichage de toutes vos habitudes avec leur statut
- **Action rapide** : Tap sur une habitude pour la marquer comme complétée
- **Bouton d'ajout** : Bouton flottant "+" pour ajouter une nouvelle habitude

### Ajout d'habitudes
1. Appuyer sur le bouton "+" en bas à droite
2. Saisir le nom de l'habitude
3. Choisir une icône parmi les emojis disponibles
4. Optionnellement, activer un rappel quotidien avec heure personnalisée
5. Valider avec "Ajouter"

### Gestion des rappels
- Les notifications locales rappellent vos habitudes à l'heure choisie
- Permission de notifications requise au premier lancement
- Répétition automatique tous les jours à la même heure

### Vue historique
- Calendrier mensuel avec code couleur :
  - **Vert** : Toutes les habitudes complétées (100%)
  - **Jaune** : Plus de 50% des habitudes complétées
  - **Orange** : Quelques habitudes complétées
  - **Gris** : Aucune habitude ou aucune complétée
- Compteur "X/Y" indiquant les habitudes complétées sur le total

### Mode sombre
- Basculement automatique entre mode clair et sombre
- Icône lune/soleil dans la barre de navigation
- Thème adaptatif pour un confort visuel optimal

## 🔧 Configuration avancée

### Personnalisation des icônes
Modifier le tableau `AVAILABLE_ICONS` dans `App.tsx` pour ajouter vos propres emojis :
```typescript
const AVAILABLE_ICONS = ['💪', '📚', '💧', '🏃', '🧘', '🥗', '😴', '🎯', 'votre-emoji'];
```

### Modification des couleurs
Personnaliser les thèmes `lightTheme` et `darkTheme` dans le code pour adapter les couleurs à votre charte graphique.

### Stockage de données
L'application utilise AsyncStorage par défaut. Pour une solution plus robuste, vous pouvez migrer vers expo-sqlite en :
1. Installant expo-sqlite
2. Remplaçant les fonctions de sauvegarde/chargement
3. Créant un schéma de base de données

## 📦 Structure du projet

```
habits-tracker/
├── App.tsx                 # Composant principal
├── app.json               # Configuration Expo
├── package.json           # Dépendances
├── tsconfig.json          # Configuration TypeScript
└── assets/               # Images et icônes
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

## 🚀 Déploiement

### Développement
```bash
npx expo start
```

### Build pour production
```bash
# Android
npx expo build:android

# iOS (nécessite un compte Apple Developer)
npx expo build:ios
```

### Publication sur les stores
```bash
# Expo Store
npx expo publish

# Google Play / App Store
npx expo build:android --type apk
npx expo build:ios --type archive
```

## 🔄 Extensions possibles

### Fonctionnalités bonus à implémenter
1. **Statistiques avancées** : Graphiques de progression hebdomadaire/mensuelle avec react-native-chart-kit
2. **Catégories d'habitudes** : Regroupement par santé, travail, loisirs, etc.
3. **Streaks** : Suivi des séries de jours consécutifs
4. **Export de données** : Sauvegarde en CSV ou JSON
5. **Synchronisation cloud** : Firebase ou autre service backend
6. **Widgets** : Affichage sur l'écran d'accueil (Android)
7. **Rappels intelligents** : Notifications contextuelles basées sur la localisation

### Améliorations techniques
- Migration vers expo-sqlite pour de meilleures performances
- Tests unitaires avec Jest et React Native Testing Library
- Intégration CI/CD avec GitHub Actions
- Monitoring des erreurs avec Sentry

## 🐛 Dépannage

### Problèmes courants

**Les notifications ne fonctionnent pas**
- Vérifier les permissions dans les paramètres de l'appareil
- S'assurer que l'application n'est pas en mode "Ne pas déranger"
- Redémarrer l'application

**Les données ne se sauvegardent pas**
- Vérifier les permissions de stockage
- Vider le cache de l'application
- Réinstaller l'application si nécessaire

**L'application plante au démarrage**
- Vérifier que toutes les dépendances sont installées
- Nettoyer le cache : `npx expo start --clear`
- Vérifier la version de Node.js (16+)

## 📄 Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Soumettre des pull requests
- Améliorer la documentation

---

Développé avec ❤️ en React Native et TypeScript
