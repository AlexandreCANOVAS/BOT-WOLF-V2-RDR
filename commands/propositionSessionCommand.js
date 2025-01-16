const { EmbedBuilder } = require('discord.js');

const ROLE_NAME = '🏠| Résident';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

module.exports = {
  name: 'proposition session',
  description: 'Envoie un message automatique pour proposer une session avec une date et une heure spécifiées.',
  async execute(message) {
    try {
      const roleResident = message.guild.roles.cache.find(role => role.name === ROLE_NAME);
      if (!roleResident) {
        return message.reply(`Le rôle "${ROLE_NAME}" est introuvable sur ce serveur.`);
      }

      const [, , date, time] = message.content.trim().split(/\s+/);

      if (!date || !time) {
        return message.reply('Veuillez spécifier une date et une heure pour la session (ex : `-proposition session 2024-12-20 15:00`).');
      }

      if (!DATE_PATTERN.test(date)) {
        return message.reply('Le format de la date est invalide. Veuillez utiliser le format `yyyy-mm-dd`.');
      }

      if (!TIME_PATTERN.test(time)) {
        return message.reply('Le format de l\'heure est invalide. Veuillez utiliser le format `HH:MM` (24h).');
      }

      const fullDate = new Date(`${date}T${time}:00`);
      const timestamp = Math.floor(fullDate.getTime() / 1000);

      const sessionEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Proposition de Session')
        .setDescription(`Prochaine session le <t:${timestamp}:f>`)
        .addFields(
          { name: '✅ Présent', value: '\u200B', inline: true },
          { name: '❌ Absent', value: '\u200B', inline: true },
          { name: '❔ Peut-être', value: '\u200B', inline: true },
          { name: '⏳ En retard', value: '\u200B', inline: true }
        )
        .setFooter({ text: 'Merci de voter selon votre choix et modifier le vote si changement.' });

      const sentMessage = await message.channel.send({ content: `${roleResident}`, embeds: [sessionEmbed] });
      await sentMessage.react('✅');
      await sentMessage.react('❌');
      await sentMessage.react('❔');
      await sentMessage.react('⏳');

      
    } catch (error) {
      console.error('Erreur lors de la proposition de session:', error);
      await message.channel.send('Une erreur est survenue lors de l\'envoi du message de proposition de session.');
    }
  }
};
