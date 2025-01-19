const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rang',
  description: 'Affiche le tableau des rangs et l\'XP nécessaire',
  async execute(message, args, db) {
    try {
      const ranks = await db.getAllRanks();

      const embed = new EmbedBuilder()
        .setColor('#1E90FF')
        .setTitle('🏅 La Légende du Far West 🏅')
        .setDescription('Gravissez les échelons et inscrivez votre nom dans l\'histoire de l\'Ouest !')
        .addFields(
          ranks.map((rank, index) => ({
            name: `\n${rank.emoji} __**${rank.name.toUpperCase()}**__`,
            value: `**XP requis:** ${rank.xp}\n${index < ranks.length - 1 ? `**Prochain palier:** ${ranks[index + 1].xp - rank.xp} XP` : '**Rang maximal atteint ! Vous êtes une légende vivante !**'}\n`,
            inline: false
          }))
        )
        .setFooter({ text: '🤠 Que votre légende résonne à travers les plaines, cowboy !' })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la récupération des rangs:', error);
      await message.reply("Une erreur s'est produite lors de la récupération des données de rang.");
    }
  },
};
