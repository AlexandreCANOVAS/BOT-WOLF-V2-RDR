const { init } = require('./database.js');

async function testDatabase() {
  let db;
  try {
    db = await init();
    
    // Test d'insertion d'un utilisateur
    const userId = '123456789';
    const xp = 100;
    const currentRank = 'Débrouillard';
    
    await db.insertUser(userId, xp, currentRank);
    console.log(`Utilisateur inséré avec succès`);
    
    // Test de récupération d'un utilisateur
    const user = await db.getUser(userId);
    console.log('Utilisateur récupéré:', user);
    
    // Test de récupération de tous les rangs
    const ranks = await db.getAllRanks();
    console.log('Tous les rangs:', ranks);
    
  } catch (error) {
    console.error('Erreur lors des tests:', error);
  } finally {
    // Fermeture de la connexion à la base de données
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Erreur lors de la fermeture de la base de données', err);
        } else {
          console.log('Connexion à la base de données fermée');
        }
      });
    }
  }
}

// Exécution des tests
testDatabase();
