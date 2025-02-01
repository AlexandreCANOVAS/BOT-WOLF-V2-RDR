const { EmbedBuilder } = require('discord.js');

const CHANNEL_ID = '1335230190128730126';
const ROLE_EMOJI = '🏴‍☠️';
const ROLE_NAME = '🏴‍☠️ | Illégal';

module.exports = {
  sendMessage: async (client) => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) {
        throw new Error('Le salon spécifié n\'a pas été trouvé.');
      }

      const embed = new EmbedBuilder()
  .setColor(0x3498db)
  .setTitle(`🏴‍☠️ Obtenez votre rôle ${ROLE_NAME} ! 🏴‍☠️`)
  .setDescription(`Cliquez sur la réaction ci-dessous pour recevoir le rôle **${ROLE_NAME}** et accéder à toutes les activités illégales du serveur !`)
  .addFields(
    { name: 'Pourquoi ce rôle ?', value: 'Ce rôle vous permet de participer aux activités illégales du RP, ajoutant une dimension excitante à votre expérience sur le serveur !' },
    { name: 'Instructions :', value: `1️⃣ Cliquez sur la réaction ${ROLE_EMOJI} sous ce message pour obtenir le rôle.\n2️⃣ Plongez dans l'univers illégal et découvrez toutes les opportunités illicites !` },
  )
  .setFooter({ text: 'Rejoignez-nous dans l\'ombre... si vous l\'osez !' })
  .setTimestamp();


      const message = await channel.send({ embeds: [embed] });
      await message.react(ROLE_EMOJI);

      console.log(`Message de réaction de rôle envoyé avec succès dans le salon ${channel.name}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message de réaction de rôle:', error);
    }
  }
};
