const { EmbedBuilder } = require('discord.js');

const XP_PER_MESSAGE = 2;

function createProgressBar(current, max) {
  const percentage = Math.min(Math.max(current / max, 0), 1);
  const filled = Math.floor(percentage * 10);
  const empty = 10 - filled;
  return `[${'▰'.repeat(filled)}${'▱'.repeat(empty)}] ${Math.floor(percentage * 100)}%`;
}

module.exports = {
  name: 'messageXp',
  execute(client, db) {
    async function assignVagabondRole(member) {
      const vagabondRole = member.guild.roles.cache.find(r => r.name === "Vagabond");
      if (vagabondRole) {
        try {
          await member.roles.add(vagabondRole);
          console.log(`Rôle Vagabond attribué à ${member.user.tag}`);
        } catch (error) {
          console.error(`Erreur lors de l'attribution du rôle Vagabond à ${member.user.tag}:`, error);
        }
      } else {
        console.error("Le rôle Vagabond n'existe pas sur le serveur.");
      }
    }

    client.on('guildMemberAdd', async (member) => {
      await assignVagabondRole(member);
    });

    client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      try {
        const userId = message.author.id;
        let user = await db.getUser(userId);

        let currentXp = user ? user.xp : 0;
        let currentRank = user ? user.current_rank : 'Vagabond';
        const newXp = currentXp + XP_PER_MESSAGE;

        if (!user) {
          await db.insertUser(userId, newXp, currentRank);
          await assignVagabondRole(message.member);
        } else {
          await db.insertUser(userId, newXp, currentRank);
        }

        const ranks = await db.getAllRanks();

        const oldRank = ranks.filter(rank => rank.xp <= currentXp).pop();
        const newRank = ranks.filter(rank => rank.xp <= newXp).pop();

        if (newRank.name !== oldRank.name) {
          const oldRole = message.guild.roles.cache.find(r => r.name === oldRank.name);
          const newRole = message.guild.roles.cache.find(r => r.name === newRank.name);
          
          if (oldRole && newRole) {
            await message.member.roles.remove(oldRole);
            await message.member.roles.add(newRole);
            
            await db.insertUser(userId, newXp, newRank.name);
            
            const nextRank = ranks.find(rank => rank.xp > newXp);
            const progressBar = createProgressBar(newXp - newRank.xp, nextRank ? nextRank.xp - newRank.xp : 0);
            
            const embed = new EmbedBuilder()
              .setColor(newRank.color)
              .setTitle(`${newRank.emoji} Nouveau Rang Atteint: ${newRank.name}`)
              .setDescription(`Félicitations, ${message.author}! Vous avez gravi les échelons de l'Ouest sauvage!`)
              .addFields(
                { name: 'Rang Actuel', value: `${newRank.emoji} **${newRank.name}**`, inline: true },
                { name: 'XP Total', value: `\`${newXp} XP\``, inline: true },
                { name: 'Prochain Rang', value: nextRank ? `${nextRank.emoji} **${nextRank.name}** (${nextRank.xp} XP)` : '🌠 Rang Maximum Atteint!', inline: true },
                { name: 'Progression', value: progressBar }
              )
              .setFooter({ text: 'Continuez à explorer les plaines pour gagner plus d\'XP!' })
              .setTimestamp();

            const levelChannel = message.guild.channels.cache.find(channel => channel.name === "『🆙』𝘓𝘦𝘷𝘦𝘭");
            if (levelChannel) {
              await levelChannel.send({ content: `${message.author}`, embeds: [embed] });
            } else {
              console.error("Le salon 『🆙』𝘓𝘦𝘷𝘦𝘭 n'existe pas sur le serveur.");
              await message.channel.send({ content: `${message.author}`, embeds: [embed] });
            }
          } else {
            console.error(`Les rôles ${oldRank.name} ou ${newRank.name} n'existent pas sur le serveur.`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'XP:', error);
      }
    });
  }
};
