#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration de Lucide
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration Lucide...\n');

// Vérifier les fichiers essentiels
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'electron/main.ts',
  'electron/preload.ts',
  'electron/ipcHandlers.ts',
  'src/main.tsx',
  'src/App.tsx',
  'index.html'
];

console.log('📁 Vérification des fichiers essentiels:');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['electron', 'react', 'vite', '@vitejs/plugin-react'];
  const requiredDevDeps = ['typescript', '@types/react', '@types/node'];
  
  requiredDeps.forEach(dep => {
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`  ${hasDep ? '✅' : '❌'} ${dep}`);
  });
  
  requiredDevDeps.forEach(dep => {
    const hasDep = packageJson.devDependencies && packageJson.devDependencies[dep];
    console.log(`  ${hasDep ? '✅' : '❌'} ${dep} (dev)`);
  });
} catch (error) {
  console.log('  ❌ Erreur lors de la lecture de package.json');
}

// Vérifier la configuration Vite
console.log('\n⚙️ Vérification de la configuration Vite:');
try {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  const hasReactPlugin = viteConfig.includes('@vitejs/plugin-react');
  const hasElectronPlugin = viteConfig.includes('vite-plugin-electron');
  console.log(`  ${hasReactPlugin ? '✅' : '❌'} Plugin React configuré`);
  console.log(`  ${hasElectronPlugin ? '✅' : '❌'} Plugin Electron configuré`);
} catch (error) {
  console.log('  ❌ Erreur lors de la lecture de vite.config.ts');
}

// Vérifier les variables d'environnement
console.log('\n🔑 Vérification des variables d\'environnement:');
const envFile = '.env';
const envExampleFile = 'env.example';
console.log(`  ${fs.existsSync(envFile) ? '✅' : '⚠️ '} Fichier .env ${fs.existsSync(envFile) ? 'présent' : 'manquant'}`);
console.log(`  ${fs.existsSync(envExampleFile) ? '✅' : '❌'} Fichier env.example présent`);

// Instructions finales
console.log('\n📋 Instructions:');
if (!fs.existsSync(envFile)) {
  console.log('  1. Créez un fichier .env basé sur env.example');
  console.log('  2. Ajoutez votre clé API OpenAI/Gemini');
}
console.log('  3. Exécutez: npm run dev');
console.log('  4. Utilisez ⌘ + B pour afficher/masquer la fenêtre');

console.log('\n✨ Vérification terminée!');

