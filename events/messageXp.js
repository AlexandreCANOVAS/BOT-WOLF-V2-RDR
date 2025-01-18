const { EmbedBuilder } = require('discord.js');

const XP_PER_MESSAGE = 10;
const RANKS = [
  { name: "Vagabond", xp: 0 },
  { name: "Débrouillard", xp: 100 },
  { name: "Cow-Boy", xp: 250 },
  { name: "Justicier", xp: 500 },
  { name: "Vétéran", xp: 1000 },
  { name: "Seigneur des frontières", xp: 2000 },
  { name: "Pistolero", xp: 3500 },
  { name: "Régent des Plaines", xp: 5000 },
  { name: "Légende de l'Ouest", xp: 7500 },
  { name: "Mythe Vivant", xp: 10000 }
];

let userXp = new Map();

module.exports = {
  name: 'messageXp',
  execute(client) {
    client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      const userId = message.author.id;
      const currentXp = userXp.get(userId) || 0;
      const newXp = currentXp + XP_PER_MESSAGE;
      userXp.set(userId, newXp);

      const oldRank = RANKS.filter(rank => rank.xp <= currentXp).pop();
      const newRank = RANKS.filter(rank => rank.xp <= newXp).pop();

      try {
        if (currentXp === 0) {
          const vagabondRole = message.guild.roles.cache.find(r => r.name === "Vagabond");
          if (vagabondRole) {
            await message.member.roles.add(vagabondRole);
            console.log(`Rôle Vagabond attribué à ${message.author.tag}`);
          } else {
            console.error("Le rôle Vagabond n'existe pas sur le serveur.");
          }
        }

        if (newRank.xp > oldRank.xp) {
          const oldRole = message.guild.roles.cache.find(r => r.name === oldRank.name);
          const newRole = message.guild.roles.cache.find(r => r.name === newRank.name);
          
          if (oldRole && newRole) {
            await message.member.roles.remove(oldRole);
            await message.member.roles.add(newRole);
            
            const embed = new EmbedBuilder()
              .setColor('#FFD700')
              .setTitle('Nouveau Rang Atteint!')
              .setDescription(`Félicitations, ${message.author}! Vous avez atteint le rang de **${newRank.name}**!`)
              .addFields(
                { name: 'XP Actuel', value: `${newXp}`, inline: true },
                { name: 'Prochain Rang', value: RANKS.find(rank => rank.xp > newXp) ? `${RANKS.find(rank => rank.xp > newXp).name} (${RANKS.find(rank => rank.xp > newXp).xp} XP)` : 'Rang Maximum Atteint!', inline: true }
              )
              .setTimestamp();

            await message.channel.send({ embeds: [embed] });
          } else {
            console.error(`Les rôles ${oldRank.name} ou ${newRank.name} n'existent pas sur le serveur.`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des rôles:', error);
      }
    });
  }
};
