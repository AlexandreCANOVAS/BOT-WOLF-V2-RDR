const { EmbedBuilder } = require('discord.js');

const CHANNEL_ID = '1317678211987013672';
const ROLE_EMOJI = '📝';
const ROLE_NAME = '📝 | RP écrit';

module.exports = {
  sendMessage: async (client) => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) {
        throw new Error('Le salon spécifié n\'a pas été trouvé.');
      }

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`✨ Recevez votre rôle ${ROLE_NAME} ! ✨`)
        .setDescription(`Cliquez sur la réaction ci-dessous pour recevoir le rôle **${ROLE_NAME}** et accéder à tout le contenu écrit RP !`)
        .addFields(
          { name: 'Pourquoi ce rôle ?', value: 'Obtenez ce rôle pour participer aux discussions RP écrites et améliorer l\'immersion de notre serveur !' },
          { name: 'Instructions :', value: `1️⃣ Cliquez sur la réaction ${ROLE_EMOJI} sous ce message pour obtenir le rôle.\n2️⃣ Profitez de tout le contenu RP écrit disponible !` },
        )
        .setFooter({ text: 'Nous avons hâte de vous voir RP avec nous !' })
        .setTimestamp();

      const message = await channel.send({ embeds: [embed] });
      await message.react(ROLE_EMOJI);

      console.log(`Message de réaction de rôle envoyé avec succès dans le salon ${channel.name}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message de réaction de rôle:', error);
    }
  }
};
