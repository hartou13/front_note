// Script Node.js pour scanner la structure des dossiers au build time
// Ce fichier peut être exécuté pendant le build pour générer un fichier JSON
// contenant la structure complète de navigation

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'lib', 'navigation', 'routes.json');

// Pages à ignorer dans la navigation
const IGNORED_PAGES = [
  'layout.tsx',
  'layout.ts',
  'layout.js',
  'layout.jsx',
  'loading.tsx',
  'loading.ts',
  'loading.js',
  'loading.jsx',
  'error.tsx',
  'error.ts',
  'error.js',
  'error.jsx',
  'not-found.tsx',
  'not-found.ts',
  'not-found.js',
  'not-found.jsx',
  'globals.css',
  'favicon.ico'
];

// Dossiers à ignorer (Next.js conventions)
const IGNORED_DIRECTORIES = [
  '_components',
  '_lib',
  '_utils',
  'api' // Les routes API ne sont pas des pages navigables
];

function isPageFile(filename) {
  return /^page\.(tsx?|jsx?)$/.test(filename);
}

function isIgnoredDirectory(dirname) {
  return (
    dirname.startsWith('(') ||  // Route groups
    dirname.startsWith('_') ||   // Private folders
    dirname.startsWith('.') ||   // Hidden folders
    IGNORED_DIRECTORIES.includes(dirname)
  );
}

function scanDirectory(dirPath, routePath = '') {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const routes = [];

    for (const item of items) {
      if (item.isDirectory() && !isIgnoredDirectory(item.name)) {
        const childDirPath = path.join(dirPath, item.name);
        const childRoutePath = routePath + '/' + item.name;
        
        // Vérifier si ce dossier contient une page
        const childItems = fs.readdirSync(childDirPath, { withFileTypes: true });
        const hasPage = childItems.some(file => 
          file.isFile() && isPageFile(file.name)
        );

        const children = scanDirectory(childDirPath, childRoutePath);

        const route = {
          path: childRoutePath === '' ? '/' : childRoutePath,
          hasPage,
          directory: item.name,
          children: children.length > 0 ? children : undefined,
          isProtected: !['login', 'register', 'forgot-password'].includes(item.name)
        };

        routes.push(route);
      }
    }

    // Vérifier si le répertoire racine a une page
    if (routePath === '' && items.some(item => item.isFile() && isPageFile(item.name))) {
      routes.unshift({
        path: '/',
        hasPage: true,
        directory: 'root',
        isProtected: false
      });
    }

    return routes;
  } catch (error) {
    console.error(`Erreur lors du scan de ${dirPath}:`, error);
    return [];
  }
}

function generateRoutes() {
  console.log('🔍 Scan de la structure des dossiers...');
  
  if (!fs.existsSync(APP_DIR)) {
    console.error('❌ Le dossier src/app n\'existe pas');
    return;
  }

  const routes = scanDirectory(APP_DIR);
  
  const output = {
    generatedAt: new Date().toISOString(),
    routes
  };

  // Créer le dossier de sortie s'il n'existe pas
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Écrire le fichier JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log('✅ Structure générée dans:', OUTPUT_FILE);
  console.log('📊 Routes trouvées:', countRoutes(routes));
}

function countRoutes(routes) {
  let count = 0;
  for (const route of routes) {
    if (route.hasPage) count++;
    if (route.children) {
      count += countRoutes(route.children);
    }
  }
  return count;
}

// Exécuter si appelé directement
if (require.main === module) {
  generateRoutes();
}

module.exports = { generateRoutes, scanDirectory }; 