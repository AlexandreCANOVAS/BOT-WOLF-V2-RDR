const { EmbedBuilder } = require('discord.js');

function createProgressBar(current, max, size = 20) {
    const progress = Math.floor((current / max) * size);
    const emptyProgress = size - progress;
    
    const filledBar = '🟩'.repeat(progress);
    const emptyBar = '⬜'.repeat(emptyProgress);
    
    return `${filledBar}${emptyBar}`;
}

module.exports = {
    name: 'xp',
    description: 'Affiche votre rang actuel et votre progression',
    async execute(message, args, db) {
      try {
        const userId = message.author.id;

        const user = await db.getUser(userId);
        const currentXp = user ? user.xp : 0;
        const currentRankName = user ? user.current_rank : 'Vagabond';

        const ranks = await db.getAllRanks();

        const currentRank = ranks.find(rank => rank.name === currentRankName);
        const nextRank = ranks.find(rank => rank.xp > currentXp);

        const progressXp = currentXp - currentRank.xp;
        const totalXpForNextRank = nextRank ? nextRank.xp - currentRank.xp : 1;
        const progressPercentage = Math.floor((progressXp / totalXpForNextRank) * 100);
        const progressBar = createProgressBar(progressXp, totalXpForNextRank);

        const embed = new EmbedBuilder()
          .setColor(currentRank.color)
          .setTitle(`${currentRank.emoji} Aventure de ${message.author.username}`)
          .setDescription(`Votre légende grandit dans l'Ouest sauvage ! Vous êtes un **${currentRank.name}** avec **${currentXp} XP**`)
          .addFields(
            { name: '🏅 Rang actuel', value: `${currentRank.emoji} ${currentRank.name}`, inline: true },
            { name: '🎯 Prochain objectif', value: nextRank ? `${nextRank.emoji} ${nextRank.name}` : '🌠 Légende vivante', inline: true },
            { name: '🔮 XP restant', value: nextRank ? `${nextRank.xp - currentXp} XP` : 'Vous avez atteint le sommet!', inline: true },
            { name: '\u200B', value: '\u200B', inline: false },
            { name: '🌄 Votre chemin', value: `${progressBar} ${progressPercentage}%\n${progressXp}/${totalXpForNextRank} XP` }
          )
          .setFooter({ text: '🤠 Chevauchez vers la gloire, cowboy!' })
          .setTimestamp();

        await message.channel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Erreur lors de l\'exécution de la commande XP:', error);
        await message.reply("Une erreur s'est produite lors de la récupération de vos données XP.");
      }
    }
};
