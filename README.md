# Front Note - Application de Gestion de Notes et Projets

Application Next.js moderne pour la gestion de notes et projets avec authentification, système de navigation automatisé et interface responsive.

## 🚀 Fonctionnalités

- **Authentification complète** : Connexion, déconnexion, gestion de profil
- **Gestion de projets** : CRUD complet avec système de couleurs et hiérarchie parent/enfant
- **Gestion de notes** : Notes liées aux projets avec filtrage et recherche
- **Navigation automatisée** : Système de routes auto-généré avec sidebar rétractable
- **Interface moderne** : Design responsive avec Tailwind CSS et thème sombre/clair
- **Gestion d'état** : TanStack Query pour les requêtes API et cache intelligent

## 📋 Prérequis

- Node.js 18+ 
- npm, yarn, pnpm ou bun
- Backend API fonctionnel (voir configuration ci-dessous)

## ⚙️ Configuration

### Variables d'environnement

Copiez le fichier `.env.example` vers `.env.local` et configurez les variables :

```bash
cp .env.example .env.local
```

**Variables disponibles :**

```env
# URL du backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend API

L'application nécessite un backend avec les endpoints suivants :

- `POST /auth/login` - Authentification
- `DELETE /auth/logout` - Déconnexion  
- `PUT /user` - Mise à jour profil
- `GET /project` - Liste des projets
- `POST /project` - Création projet
- `PUT /project/:id` - Modification projet
- `DELETE /project/:id` - Suppression projet
- `GET /note` - Liste des notes
- `POST /note` - Création note
- `PUT /note/:id` - Modification note
- `DELETE /note/:id` - Suppression note

## 🛠️ Installation et Démarrage

1. **Cloner le repository**
```bash
git clone <repository-url>
cd front_note
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env.local
# Modifier .env.local avec vos paramètres
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

5. **Ouvrir l'application**
Visitez [http://localhost:3000](http://localhost:3000)

## 🏗️ Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrage production
npm run start

# Linting
npm run lint

# Ajout automatique de routes
npm run add-route /ma-route --title "Ma Route" --icon "Star"

# Génération des routes
npm run generate-routes
```

## 📁 Structure du Projet

```
src/
├── app/                    # Pages Next.js App Router
│   ├── login/             # Page de connexion
│   ├── main/              # Tableau de bord
│   ├── profile/           # Profil utilisateur
│   ├── projects/          # Gestion des projets
│   └── notes/             # Gestion des notes
├── components/            # Composants React
│   ├── Layout/           # Layout et navigation
│   ├── UI/               # Composants UI réutilisables
│   ├── Projects/         # Composants projets
│   └── Notes/            # Composants notes
├── lib/                  # Utilitaires et configuration
│   ├── hooks/           # Hooks React personnalisés
│   ├── config/          # Configuration API
│   ├── navigation/      # Système de navigation
│   └── types/           # Types TypeScript
└── styles/              # Styles globaux
```

## 🎨 Système de Navigation

Le projet inclut un système de navigation automatisé :

### Ajout rapide de routes
```bash
npm run add-route /admin --title "Administration" --icon "Settings" --section "Admin"
```

### Configuration manuelle
Modifier `src/lib/navigation/pageMetadata.ts` puis :
```bash
npm run generate-routes
```

Voir [NAVIGATION.md](NAVIGATION.md) pour plus de détails.

## 🔧 Technologies Utilisées

- **Framework** : Next.js 15.3.3 avec App Router
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Gestion d'état** : TanStack Query v5
- **Icônes** : Lucide React
- **Build** : Turbopack
- **Linting** : ESLint + TypeScript

## 🌍 Déploiement

### Vercel (Recommandé)
```bash
npm run build
# Déployer sur Vercel Platform
```

### Autres plateformes
```bash
npm run build
npm run start
```

**Variables d'environnement de production :**
- `NEXT_PUBLIC_BACKEND_URL` : URL de votre API backend

## 📚 Documentation

- [Système de Navigation](NAVIGATION.md) - Guide complet du système de routes
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
