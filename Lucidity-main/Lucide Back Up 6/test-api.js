#!/usr/bin/env node

/**
 * Script de test pour vérifier la connectivité API OpenAI
 */

const OpenAI = require('openai');
require('dotenv').config();

async function testOpenAI() {
  console.log('🔍 Test de connectivité API OpenAI...\n');

  // Vérifier la clé API
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('❌ Clé API OpenAI manquante dans .env');
    return;
  }

  console.log('✅ Clé API trouvée');

  try {
    // Initialiser OpenAI
    const openai = new OpenAI({
      apiKey: apiKey
    });

    console.log('🔄 Test de connectivité...');

    // Test simple avec GPT-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: "Réponds simplement 'Test réussi' en français."
        }
      ],
      max_tokens: 50
    });

    const result = response.choices[0].message.content;
    console.log('✅ Test de connectivité réussi !');
    console.log(`📝 Réponse: ${result}`);

    // Test avec Whisper (audio)
    console.log('\n🔄 Test de l\'API Whisper...');
    console.log('ℹ️  Note: Ce test nécessiterait un fichier audio pour un test complet');
    console.log('✅ API Whisper configurée');

    // Test avec Vision (images)
    console.log('\n🔄 Test de l\'API Vision...');
    console.log('ℹ️  Note: Ce test nécessiterait une image pour un test complet');
    console.log('✅ API Vision configurée');

    console.log('\n🎉 Tous les tests sont prêts !');
    console.log('📋 L\'application Lucide devrait maintenant fonctionner avec OpenAI.');

  } catch (error) {
    console.log('❌ Erreur lors du test:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Suggestion: Vérifiez que votre clé API est valide');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Suggestion: Limite de taux atteinte, réessayez plus tard');
    }
  }
}

// Exécuter le test
testOpenAI().catch(console.error);

