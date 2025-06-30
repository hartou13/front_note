#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const METADATA_FILE = 'src/lib/navigation/pageMetadata.ts';
const TEMPLATES_DIR = 'scripts/templates';

function showUsage() {
  console.log(`
🚀 Script d'ajout de route automatisé

Usage:
  node scripts/add-route.js <route-path> [options]

Exemples:
  node scripts/add-route.js /dashboard
  node scripts/add-route.js /admin/users --title "Gestion Utilisateurs" --icon "Users" --section "Administration"
  node scripts/add-route.js /settings/billing --title "Facturation" --icon "CreditCard" --section "Paramètres" --order 3

Options:
  --title       Titre affiché dans la navigation (défaut: généré depuis le path)
  --icon        Nom de l'icône Lucide React (défaut: Circle)
  --section     Section de navigation (défaut: Principal)
  --order       Ordre dans la section (défaut: 999)
  --protected   Route protégée par authentification (défaut: true)
  --template    Template à utiliser (page, api, layout)
  --help        Afficher cette aide
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showUsage();
    process.exit(0);
  }

  const routePath = args[0];
  const options = {
    title: null,
    icon: 'Circle',
    section: 'Principal',
    order: 999,
    protected: true,
    template: 'page'
  };

  for (let i = 1; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--title':
        options.title = value;
        break;
      case '--icon':
        options.icon = value;
        break;
      case '--section':
        options.section = value;
        break;
      case '--order':
        options.order = parseInt(value);
        break;
      case '--protected':
        options.protected = value.toLowerCase() === 'true';
        break;
      case '--template':
        options.template = value;
        break;
    }
  }

  return { routePath, options };
}

function generateTitle(routePath) {
  if (routePath === '/') return 'Accueil';
  
  const segments = routePath.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createPageFile(routePath, options) {
  const appDir = path.join(process.cwd(), 'src', 'app');
  const routeDir = path.join(appDir, routePath === '/' ? '' : routePath);
  
  // Créer le dossier si nécessaire
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const pageFile = path.join(routeDir, 'page.tsx');
  
  if (fs.existsSync(pageFile)) {
    console.log(`⚠️  Le fichier ${pageFile} existe déjà, ignoré.`);
    return false;
  }

  const title = options.title || generateTitle(routePath);
  const componentName = title.replace(/\s+/g, '') + 'Page';

  const pageContent = `'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../components/Layout/AppLayout';

export default function ${componentName}() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">${title}</h1>
          <p className="text-muted-foreground mt-1">
            Description de la page ${title.toLowerCase()}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-card-foreground">
            Contenu de la page ${title.toLowerCase()} à implémenter.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
`;

  fs.writeFileSync(pageFile, pageContent);
  console.log(`✅ Fichier créé: ${pageFile}`);
  return true;
}

function updateMetadata(routePath, options) {
  const metadataPath = path.join(process.cwd(), METADATA_FILE);
  
  if (!fs.existsSync(metadataPath)) {
    console.error(`❌ Fichier de métadonnées non trouvé: ${metadataPath}`);
    return false;
  }

  let content = fs.readFileSync(metadataPath, 'utf-8');
  
  // Vérifier si la route existe déjà
  if (content.includes(`'${routePath}':`)) {
    console.log(`⚠️  La route ${routePath} existe déjà dans les métadonnées, ignorée.`);
    return false;
  }

  const title = options.title || generateTitle(routePath);
  
  const newMetadata = `  '${routePath}': {
    title: '${title}',
    icon: '${options.icon}',
    order: ${options.order},
    section: '${options.section}',
    requiresAuth: ${options.protected},
  },`;

  // Trouver la position d'insertion (avant la fermeture de l'objet)
  const insertPosition = content.lastIndexOf('};');
  const updatedContent = content.slice(0, insertPosition) + newMetadata + '\n' + content.slice(insertPosition);

  fs.writeFileSync(metadataPath, updatedContent);
  console.log(`✅ Métadonnées mises à jour: ${routePath}`);
  return true;
}

function regenerateRoutes() {
  try {
    console.log('🔄 Régénération des routes...');
    execSync('npm run generate-routes', { stdio: 'inherit' });
    console.log('✅ Routes régénérées avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la régénération des routes:', error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Ajout automatique de route\n');

  const { routePath, options } = parseArgs();

  console.log(`Route: ${routePath}`);
  console.log(`Options:`, options);
  console.log('');

  let success = true;

  // 1. Créer le fichier de page
  success &= createPageFile(routePath, options);

  // 2. Mettre à jour les métadonnées
  success &= updateMetadata(routePath, options);

  // 3. Régénérer les routes
  success &= regenerateRoutes();

  if (success) {
    console.log('\n🎉 Route ajoutée avec succès !');
    console.log(`\n📋 Prochaines étapes:
1. Démarrer le serveur: npm run dev
2. Naviguer vers: http://localhost:3000${routePath}
3. La route apparaîtra automatiquement dans la sidebar
4. Personnaliser le contenu dans: src/app${routePath}/page.tsx`);
  } else {
    console.log('\n❌ Erreurs lors de l\'ajout de la route');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, parseArgs, createPageFile, updateMetadata, regenerateRoutes }; 