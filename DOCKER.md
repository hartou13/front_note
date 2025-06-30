# Guide Docker pour front_note

Ce guide explique comment utiliser Docker et Docker Compose avec votre application Next.js.

## Prérequis

- Docker
- Docker Compose

## Structure des fichiers Docker

- `docker-compose.yml` : Configuration principale avec services de développement et production
- `Dockerfile` : Image optimisée pour la production
- `Dockerfile.dev` : Image pour le développement
- `.dockerignore` : Fichiers à ignorer lors de la construction de l'image

## Commandes utiles

### Développement

```bash
# Lancer l'application en mode développement
docker-compose up app-dev

# Lancer en arrière-plan
docker-compose up -d app-dev

# Voir les logs
docker-compose logs -f app-dev

# Arrêter le service
docker-compose down
```

### Production

```bash
# Lancer l'application en mode production
docker-compose --profile production up app-prod

# Lancer avec Nginx (proxy inverse)
docker-compose --profile production up

# Construire l'image de production
docker-compose --profile production build app-prod
```

### Commandes de maintenance

```bash
# Reconstruire les images
docker-compose build

# Supprimer les volumes
docker-compose down -v

# Nettoyer les images non utilisées
docker system prune -a
```

## Ports

- **3000** : Application en mode développement
- **3001** : Application en mode production
- **80/443** : Nginx (si utilisé)

## Variables d'environnement

Créez un fichier `.env.local` pour vos variables d'environnement locales :

```env
NODE_ENV=development
PORT=3000
# Ajoutez vos variables ici
```

## Volumes

- Les fichiers sources sont montés en temps réel en mode développement
- Les `node_modules` et `.next` sont persistés via des volumes Docker

## Conseils

1. **Performance** : Le mode développement utilise le hot reload pour un développement rapide
2. **Production** : L'image de production est multi-stage et optimisée pour la taille
3. **Sécurité** : L'application s'exécute avec un utilisateur non-root en production 