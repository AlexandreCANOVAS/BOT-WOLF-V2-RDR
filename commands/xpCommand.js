const { EmbedBuilder } = require('discord.js');

function createProgressBar(current, max, size = 20) {
    const progress = Math.min(Math.floor((current / max) * size), size);
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
        const maxRank = ranks[ranks.length - 1];
        const isMaxRank = currentRank.name === maxRank.name;

        let embed = new EmbedBuilder()
          .setColor(currentRank.color)
          .setTimestamp();

        if (isMaxRank) {
          embed
            .setTitle(`🌟 Légende de l'Ouest : ${message.author.username}`)
            .setDescription(`Félicitations, vous avez atteint le rang suprême de **${currentRank.name}** !`)
            .addFields(
              { name: '🏆 Rang Ultime', value: `${currentRank.emoji} ${currentRank.name}`, inline: true },
              { name: '🔥 XP Total', value: `${currentXp} XP`, inline: true },
              { name: '🌠 Statut', value: 'Légende Vivante', inline: true },
              { name: '\u200B', value: '\u200B' },
              { name: '🏜️ Votre Héritage', value: 'Votre nom résonne à travers les plaines de l\'Ouest. Votre légende continue de croître avec chaque nouvelle aventure !' }
            )
            .setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjlmdm1sMzEzN2t0ODQ4ZnR0cTM2ZmF2aW91MTNhcW9ldTJkOHFhMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1YeKAMmdGI4dEUU8Wk/giphy.gif')
            .setFooter({ text: '🤠 Votre légende s\'écrit encore, héros de l\'Ouest !' });
        } else {
          const nextRank = ranks.find(rank => rank.xp > currentXp);
          const progressXp = currentXp - currentRank.xp;
          const totalXpForNextRank = nextRank.xp - currentRank.xp;
          const progressPercentage = Math.floor((progressXp / totalXpForNextRank) * 100);
          const progressBar = createProgressBar(progressXp, totalXpForNextRank);

          embed
            .setTitle(`${currentRank.emoji} Aventure de ${message.author.username}`)
            .setDescription(`Votre légende grandit dans l'Ouest sauvage ! Vous êtes un **${currentRank.name}** avec **${currentXp} XP**`)
            .addFields(
              { name: '🏅 Rang actuel', value: `${currentRank.emoji} ${currentRank.name}`, inline: true },
              { name: '🎯 Prochain objectif', value: `${nextRank.emoji} ${nextRank.name}`, inline: true },
              { name: '🔮 XP restant', value: `${totalXpForNextRank - progressXp} XP`, inline: true },
              { name: '\u200B', value: '\u200B' },
              { name: '🌄 Votre chemin', value: `${progressBar} ${progressPercentage}%\n${progressXp}/${totalXpForNextRank} XP` }
            )
            .setFooter({ text: '🤠 Chevauchez vers la gloire, cowboy!' });
        }

        await message.author.send({ embeds: [embed] });
        return "Vos informations XP ont été envoyées en message privé.";
      } catch (error) {
        console.error('Erreur lors de l\'exécution de la commande XP:', error);
        return "Une erreur s'est produite lors de la récupération de vos données XP. Assurez-vous que vos messages privés sont ouverts.";
      }
    }
};
