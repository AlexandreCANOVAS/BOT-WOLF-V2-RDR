const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'userXp.sqlite');

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erreur lors de la connexion à la base de données:', err.message);
        return reject(err);
      }
      console.log('Connecté à la base de données SQLite.');
      
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Users (
          user_id TEXT PRIMARY KEY,
          xp INTEGER NOT NULL DEFAULT 0,
          current_rank TEXT NOT NULL DEFAULT 'Vagabond'
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Ranks (
          name TEXT PRIMARY KEY,
          xp INTEGER NOT NULL,
          emoji TEXT NOT NULL,
          color TEXT NOT NULL
        )`);

        const ranks = [
          { name: "Vagabond", xp: 0, emoji: "🌱", color: "#3498db" },
          { name: "Débrouillard", xp: 100, emoji: "🔧", color: "#2ecc71" },
          { name: "Cow-Boy", xp: 250, emoji: "🤠", color: "#e67e22" },
          { name: "Justicier", xp: 500, emoji: "⚖️", color: "#9b59b6" },
          { name: "Vétéran", xp: 1000, emoji: "🎖️", color: "#34495e" },
          { name: "Seigneur des frontières", xp: 2000, emoji: "🏞️", color: "#16a085" },
          { name: "Pistolero", xp: 3500, emoji: "🔫", color: "#c0392b" },
          { name: "Régent des Plaines", xp: 5000, emoji: "👑", color: "#f1c40f" },
          { name: "Légende de l'Ouest", xp: 7500, emoji: "🌟", color: "#8e44ad" },
          { name: "Mythe Vivant", xp: 10000, emoji: "🏆", color: "#e74c3c" }
        ];

        const insertRank = db.prepare("INSERT OR REPLACE INTO Ranks (name, xp, emoji, color) VALUES (?, ?, ?, ?)");
        ranks.forEach(rank => {
          insertRank.run(rank.name, rank.xp, rank.emoji, rank.color);
        });
        insertRank.finalize();
      });

      resolve({
        getUser: (userId) => {
          return new Promise((resolve, reject) => {
            db.get('SELECT * FROM Users WHERE user_id = ?', [userId], (err, row) => {
              if (err) return reject(err);
              resolve(row);
            });
          });
        },
        insertUser: (userId, xp, currentRank) => {
          return new Promise((resolve, reject) => {
            db.run('INSERT OR REPLACE INTO Users (user_id, xp, current_rank) VALUES (?, ?, ?)', [userId, xp, currentRank], function(err) {
              if (err) return reject(err);
              resolve(this.lastID);
            });
          });
        },
        getAllRanks: () => {
          return new Promise((resolve, reject) => {
            db.all('SELECT * FROM Ranks ORDER BY xp ASC', [], (err, rows) => {
              if (err) return reject(err);
              resolve(rows);
            });
          });
        },
        close: () => {
          return new Promise((resolve, reject) => {
            db.close((err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        }
      });
    });
  });
}

module.exports = { init: initDatabase };
