const { EmbedBuilder } = require('discord.js');

const ROLE_NAME = '🏠| Résident';

module.exports = {
  name: 'clôture',
  description: 'Clôture une session et affiche la durée.',
  async execute(message) {
    try {
      const roleResident = message.guild.roles.cache.find(role => role.name === ROLE_NAME);
      if (!roleResident || !message.member.roles.cache.has(roleResident.id)) {
        return message.reply(`Vous devez avoir le rôle \`${ROLE_NAME}\` pour clôturer une session.`);
      }

      if (!global.sessionStartTime) {
        return message.reply("Aucune session n'a été lancée.");
      }

      const durationMs = Date.now() - global.sessionStartTime;
      const durationString = formatDuration(durationMs);

      const embed = new EmbedBuilder()
  .setColor('#FF0000')
  .setTitle('FIN DE SESSION')
  .setDescription(`Durée de la session : **${durationString}**`)
  .addFields(
    { name: '\u200B', value: 'Veuillez terminer vos scènes en cours. ❤️' },
    { name: '\u200B', value: 'Merci d\'avoir été présent ! On se retrouve vite demain ou derrière vos claviers ! 📝' }
  )
  .setTimestamp();


      await message.channel.send({ content: `<@&${roleResident.id}>`, embeds: [embed] });
      

      delete global.sessionStartTime;
    } catch (error) {
      console.error('Erreur lors de la clôture de la session:', error);
      await message.channel.send("Une erreur est survenue lors de la clôture de la session.");
    }
  }
};

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}
