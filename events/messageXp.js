const { EmbedBuilder } = require('discord.js');

const XP_PER_MESSAGE = 2;
const SPAM_THRESHOLD = 2;
const SPAM_TIME_WINDOW = 5000;
const COOLDOWN_PERIOD = 2000;

const userMessageCounts = new Map();
const userLastMessageTime = new Map();
const userWarnings = new Map();

function createProgressBar(current, max) {
  const percentage = Math.min(Math.max(current / max, 0), 1);
  const filled = Math.floor(percentage * 10);
  const empty = 10 - filled;
  return `[${'▰'.repeat(filled)}${'▱'.repeat(empty)}] ${Math.floor(percentage * 100)}%`;
}

module.exports = {
  name: 'messageXp',
  async execute(client, db) {
    const ranks = await db.getAllRanks();

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

      const userId = message.author.id;
      const now = Date.now();

      if (!userMessageCounts.has(userId)) {
        userMessageCounts.set(userId, []);
      }
      const userMessages = userMessageCounts.get(userId);
      userMessages.push(now);

      while (userMessages.length > 0 && userMessages[0] < now - SPAM_TIME_WINDOW) {
        userMessages.shift();
      }

      if (userMessages.length > SPAM_THRESHOLD) {
        if (!userWarnings.has(userId)) {
          userWarnings.set(userId, 1);
          const warningEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⚠️ Avertissement')
            .setDescription(`Attention, ${message.author} ! Vous envoyez des messages trop rapidement.`)
            .addFields(
              { name: 'Conséquence', value: 'Si vous continuez, votre rang et votre rôle XP seront réinitialisés.' },
              { name: 'Conseil', value: 'Veuillez ralentir le rythme de vos messages.' }
            )
            .setFooter({ text: 'Premier avertissement' })
            .setTimestamp();
          await message.reply({ embeds: [warningEmbed] });
          return;
        } else {
          const warnings = userWarnings.get(userId);
          if (warnings >= 2) {
            await db.resetUserData(userId);
            const vagabondRole = message.guild.roles.cache.find(r => r.name === "Vagabond");
            if (vagabondRole) {
              const userRoles = message.member.roles.cache;
              const nonXpRoles = userRoles.filter(role => 
                role.name !== vagabondRole.name && 
                !ranks.some(rank => rank.name === role.name)
              );
              nonXpRoles.set(vagabondRole.id, vagabondRole);
              await message.member.roles.set(nonXpRoles);
            }
            const resetEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('🚫 Réinitialisation')
              .setDescription(`${message.author}, votre rang et votre rôle XP ont été réinitialisés.`)
              .addFields(
                { name: 'Raison', value: 'Spam excessif détecté' },
                { name: 'Action', value: 'Votre progression XP a été remise à zéro et votre rôle a été réinitialisé à "Vagabond".' }
              )
              .setFooter({ text: 'Réinitialisation effectuée' })
              .setTimestamp();
            await message.reply({ embeds: [resetEmbed] });
            userWarnings.delete(userId);
            return;
          } else {
            userWarnings.set(userId, warnings + 1);
            const finalWarningEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('🚨 Dernier Avertissement')
              .setDescription(`${message.author}, ceci est votre dernier avertissement !`)
              .addFields(
                { name: 'Avertissement', value: 'Votre rang et votre rôle XP seront réinitialisés si vous continuez à spammer.' },
                { name: 'Conseil', value: 'Veuillez immédiatement cesser d\'envoyer des messages rapidement.' }
              )
              .setFooter({ text: 'Dernier avertissement avant réinitialisation' })
              .setTimestamp();
            await message.reply({ embeds: [finalWarningEmbed] });
            return;
          }
        }
      }

      const lastMessageTime = userLastMessageTime.get(userId) || 0;
      if (now - lastMessageTime < COOLDOWN_PERIOD) {
        return;
      }
      userLastMessageTime.set(userId, now);

      try {
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
        const maxRank = ranks[ranks.length - 1];

        let newRank = ranks.filter(rank => rank.xp <= newXp).pop();
        if (newXp >= maxRank.xp) {
          newRank = maxRank;
        }

        if (newRank.name !== currentRank) {
          const oldRole = message.guild.roles.cache.find(r => r.name === currentRank);
          const newRole = message.guild.roles.cache.find(r => r.name === newRank.name);
          
          if (oldRole && newRole) {
            await message.member.roles.remove(oldRole);
            await message.member.roles.add(newRole);
            
            await db.insertUser(userId, newXp, newRank.name);
            
            let progressBar, nextRankInfo;
            if (newRank === maxRank) {
              const xpSinceMaxRank = newXp - maxRank.xp;
              const nextMilestone = Math.ceil(newXp / 1000) * 1000;
              progressBar = createProgressBar(xpSinceMaxRank, nextMilestone - maxRank.xp);
              nextRankInfo = `🌠 Rang Maximum Atteint! Prochain palier: ${nextMilestone} XP`;
            } else {
              const nextRank = ranks.find(rank => rank.xp > newXp);
              progressBar = createProgressBar(newXp - newRank.xp, nextRank.xp - newRank.xp);
              nextRankInfo = `${nextRank.emoji} **${nextRank.name}** (${nextRank.xp} XP)`;
            }
            
            const embed = new EmbedBuilder()
              .setColor(newRank.color)
              .setTitle(`${newRank.emoji} ${newRank === maxRank ? 'Progression XP' : 'Nouveau Rang Atteint'}: ${newRank.name}`)
              .setDescription(`Félicitations, ${message.author}! ${newRank === maxRank ? 'Vous continuez à progresser au-delà du rang maximum!' : 'Vous avez gravi les échelons de l\'Ouest sauvage!'}`)
              .addFields(
                { name: 'Rang Actuel', value: `${newRank.emoji} **${newRank.name}**`, inline: true },
                { name: 'XP Total', value: `\`${newXp} XP\``, inline: true },
                { name: newRank === maxRank ? 'Prochain Palier' : 'Prochain Rang', value: nextRankInfo, inline: true },
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
            console.error(`Les rôles ${currentRank} ou ${newRank.name} n'existent pas sur le serveur.`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'XP:', error);
      }
    });
  }
};
