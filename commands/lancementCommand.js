const { EmbedBuilder } = require('discord.js');

const ROLE_NAME = '🏠| Résident';

module.exports = {
  name: 'lancement',
  description: 'Lance une session avec une mention du rôle Résident.',
  async execute(message) {
    try {
      const roleResident = message.guild.roles.cache.find(role => role.name === ROLE_NAME);
      if (!roleResident || !message.member.roles.cache.has(roleResident.id)) {
        return message.reply(`Vous devez avoir le rôle \`${ROLE_NAME}\` pour lancer une session.`);
      }

      global.sessionStartTime = Date.now();

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('🚀 Lancement de la session RP')
        .setDescription('La session RP commence maintenant !')
        .addFields(
          { name: '⏰ Heure de début', value: `<t:${Math.floor(Date.now() / 1000)}:F>` },
          { name: '🎭 Bon RP à tous !', value: 'Que l\'aventure commence !' }
        )
        .setFooter({ text: 'Session en cours' })
        .setTimestamp();

      await message.channel.send({ content: `<@&${roleResident.id}>`, embeds: [embed] });
      
    } catch (error) {
      console.error('Erreur lors du lancement de la session:', error);
      await message.channel.send("Une erreur est survenue lors du lancement de la session.");
    }
  }
};
