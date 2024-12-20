const { EmbedBuilder } = require('discord.js');  // Importation d'EmbedBuilder

module.exports.sendMessage = (client) => {
  const channelId = '1317678211987013672';  // Remplace par l'ID du salon où tu veux envoyer le message
  const channel = client.channels.cache.get(channelId);

  if (channel) {
    // Créer un embed plus esthétique
    const embed = new EmbedBuilder()
      .setColor(0x3498db)  // Un joli bleu pour le fond
      .setTitle('✨ Recevez votre rôle 📝 | RP écrit ! ✨')
      .setDescription('Cliquez sur la réaction ci-dessous pour recevoir le rôle **📝 | RP écrit** et accéder à tout le contenu écrit RP !')
      .addFields(
        { name: 'Pourquoi ce rôle ?', value: 'Obtenez ce rôle pour participer aux discussions RP écrites et améliorer l\'immersion de notre serveur !' },
        { name: 'Instructions :', value: '1️⃣ Cliquez sur la réaction 📝 sous ce message pour obtenir le rôle.\n2️⃣ Profitez de tout le contenu RP écrit disponible !' },
      )
      .setFooter({ text: 'Nous avons hâte de vous voir RP avec nous !' })
      .setTimestamp();  // Ajoute la date/heure du message pour plus de dynamique

    // Envoyer l'embed et ajouter la réaction
    channel.send({ embeds: [embed] })
      .then((message) => {
        message.react('📝');  // Ajoute la réaction 📝 sous le message
      })
      .catch(console.error);
  } else {
    console.log('Le salon spécifié n\'a pas été trouvé.');
  }
}; 
