# Lucide - Assistant IA Overlay

Lucide est un assistant IA alimenté par l'intelligence artificielle, construit avec Electron, React et TailwindCSS. Il fonctionne comme un overlay transparent qui peut analyser des captures d'écran et fournir des solutions.

## 🚀 Fonctionnalités

- **📸 Capture d'écran intelligente** : Analyse automatique des images avec GPT-4o Vision
- **🎤 Reconnaissance vocale** : Transcription audio avec Whisper et analyse IA
- **💻 Génération de solutions** : Solutions détaillées basées sur l'analyse
- **🔧 Débogage assisté** : Aide au débogage avec captures supplémentaires
- **⌨️ Raccourcis clavier** : Contrôle rapide de l'application
- **🌐 Interface française** : Interface utilisateur entièrement traduite

## 🛠️ Technologies

- **Electron** : Application desktop cross-platform
- **React** : Interface utilisateur moderne
- **TypeScript** : Typage statique pour la robustesse
- **TailwindCSS** : Styling utilitaire
- **OpenAI GPT-4o** : Modèle IA avancé
- **Whisper** : Reconnaissance vocale
- **Vite** : Build tool rapide

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Clé API OpenAI** (gratuite avec limites)

## 🚀 Installation

1. **Cloner le repository**
   ```bash
   git clone <votre-repo-url>
   cd lucide_final
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'API**
   ```bash
   cp .env.example .env
   ```
   
   Éditez le fichier `.env` et ajoutez votre clé API OpenAI :
   ```env
   OPENAI_API_KEY=votre_clé_api_openai_ici
   LUCIDE_MODEL=gpt-4o
   NODE_ENV=development
   ```

4. **Lancer l'application**
   ```bash
   npm run dev
   ```

## 🎯 Utilisation

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| **⌘ + B** | Afficher/Masquer la fenêtre |
| **⌘ + H** | Prendre une capture d'écran |
| **⌘ + ↵** | Générer une solution |
| **⌘ + R** | Recommencer |
| **Escape** | Fermer la vue actuelle |
| **⌘ + ←/→** | Déplacer la fenêtre horizontalement |

### Workflow typique

1. **Capture d'écran** : Utilisez ⌘ + H pour capturer un problème
2. **Analyse automatique** : L'IA analyse l'image et extrait le contexte
3. **Génération de solution** : Appuyez sur ⌘ + ↵ pour obtenir une solution
4. **Débogage** : Ajoutez des captures supplémentaires si nécessaire
5. **Enregistrement vocal** : Utilisez le bouton microphone pour poser des questions

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `OPENAI_API_KEY` | Clé API OpenAI | Requis |
| `LUCIDE_MODEL` | Modèle OpenAI à utiliser | `gpt-4o` |
| `NODE_ENV` | Environnement | `development` |

### Obtenir une clé API OpenAI

1. Visitez [OpenAI Platform](https://platform.openai.com/api-keys)
2. Créez un compte ou connectez-vous
3. Générez une nouvelle clé API
4. Copiez la clé dans votre fichier `.env`

## 📁 Structure du projet

```
lucide_final/
├── electron/              # Processus principal Electron
│   ├── LLMHelper.ts      # Intégration OpenAI
│   ├── ProcessingHelper.ts
│   ├── ScreenshotHelper.ts
│   └── ...
├── src/                   # Interface React
│   ├── components/        # Composants réutilisables
│   ├── _pages/           # Pages principales
│   └── types/            # Définitions TypeScript
├── assets/               # Icônes et ressources
├── .env                  # Variables d'environnement
└── package.json          # Configuration npm
```

## 🧪 Tests

### Test de connectivité API
```bash
node test-api.js
```

### Test de l'application
```bash
npm run dev
```

## 🚀 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance l'application en mode développement |
| `npm run build` | Construit l'application pour la production |
| `npm run dist` | Crée un package distributable |

## 🔍 Dépannage

### Erreurs courantes

1. **"API key not valid"**
   - Vérifiez que votre clé API OpenAI est correcte
   - Assurez-vous que le fichier `.env` est bien configuré

2. **"Port already in use"**
   - Changez le port dans `vite.config.ts` ou `package.json`
   - Fermez les autres instances de l'application

3. **"Module not found"**
   - Exécutez `npm install` pour réinstaller les dépendances
   - Vérifiez que Node.js est à jour

### Logs de débogage

L'application affiche des logs détaillés dans la console. Surveillez :
- Les erreurs de connectivité API
- Les erreurs de capture d'écran
- Les erreurs de traitement audio

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence Apache-2.0. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **OpenAI** pour GPT-4o et Whisper
- **Electron** pour le framework desktop
- **React** pour l'interface utilisateur
- **TailwindCSS** pour le styling

---

**Lucide** - Votre assistant IA personnel pour résoudre tous vos problèmes ! 🚀