const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rang',
  description: 'Affiche le tableau des rangs et l\'XP nécessaire',
  async execute(message, args, db) {
    try {
      const ranks = await db.getAllRanks();
      console.log('Rangs récupérés:', ranks);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🌟 La Grande Épopée du Far West 🌟')
        .setDescription('Tracez votre chemin à travers les plaines sauvages et devenez une légende vivante !')
        .setThumbnail('https://i.imgur.com/rVVeIZP.png')
        .addFields(
          { name: '\u200B', value: '🏆 __**Tableau des Rangs**__ 🏆' },
          ...ranks.map((rank, index) => ({
            name: `${rank.emoji} **${rank.name}**`,
            value: `> XP requis: **${rank.xp}**\n> ${index < ranks.length - 1 ? `Prochain palier: *${ranks[index + 1].xp - rank.xp} XP*` : '🎖️ *Rang suprême atteint !*'}`,
            inline: false
          }))
        )
        
        .setFooter({ text: '🤠 Que votre légende résonne à travers les canyons, intrépide aventurier !' })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la récupération des rangs:', error);
      await message.reply("Une erreur s'est produite lors de la récupération des données de rang.");
    }
  },
};
