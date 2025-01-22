const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'getxp',
  description: 'Affiche l\'XP et le rang d\'un joueur spécifique',
  async execute(message, args, db) {
    if (!args[0]) {
      return message.reply('Veuillez mentionner un utilisateur ou fournir son ID.');
    }

    let userId = args[0].replace(/[<@!>]/g, '');
    
    try {
      const user = await message.client.users.fetch(userId);
      const userData = await db.getUser(userId);

      if (!userData) {
        return message.reply('Cet utilisateur n\'a pas encore d\'XP enregistré.');
      }

      const allRanks = await db.getAllRanks();
      const currentRankIndex = allRanks.findIndex(rank => rank.name === userData.current_rank);
      const nextRank = allRanks[currentRankIndex + 1];
      const xpForNextRank = nextRank ? nextRank.xp - userData.xp : 0;

      const progressBar = createProgressBar(userData.xp, nextRank ? nextRank.xp : userData.xp);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🏆 Profil XP de ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '📊 Niveau', value: `${currentRankIndex + 1}`, inline: true },
          { name: '🔰 Rang actuel', value: `${userData.current_rank}`, inline: true },
          { name: '⭐ XP total', value: `${userData.xp}`, inline: true },
          { name: '📈 Progression', value: progressBar, inline: false },
          { name: '🔜 Prochain rang', value: nextRank ? `${nextRank.name} (${xpForNextRank} XP restants)` : 'Rang maximum atteint !', inline: false }
        )
        .setFooter({ text: '🌟 Continuez à participer pour gravir les échelons !' })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'XP:', error);
      message.reply('Une erreur est survenue lors de la récupération de l\'XP de cet utilisateur.');
    }
  },
};

function createProgressBar(currentXP, nextLevelXP) {
  const percentage = (currentXP / nextLevelXP) * 100;
  const progress = Math.round(percentage / 10);
  const emptyProgress = 10 - progress;

  const progressText = '🟩'.repeat(progress);
  const emptyProgressText = '⬜'.repeat(emptyProgress);
  
  return `${progressText}${emptyProgressText} ${percentage.toFixed(2)}%`;
}
