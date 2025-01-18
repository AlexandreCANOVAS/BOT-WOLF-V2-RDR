const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'logAnonymous',
  execute(client) {
    const logChannel = client.channels.cache.find(channel => channel.name === 'log-anonymous');
    if (!logChannel) return console.log('Canal log-anonymous non trouvé');

    client.on('anonymousMessage', (message, content) => {
      const embed = new EmbedBuilder()
        .setTitle('🕵️ Message Anonyme Détecté')
        .setColor('#1E90FF')
        .setDescription(`Un nouveau message anonyme a été envoyé dans le salon ${message.channel}.`)
        .addFields(
          { name: '📍 Salon', value: `#${message.channel.name}`, inline: true },
          { name: '🕰️ Heure', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '👤 Auteur', value: `||${message.author.tag}||`, inline: true },
          { name: '💬 Contenu du message', value: `\`\`\`${content.length > 1000 ? content.substring(0, 997) + '...' : content}\`\`\`` }
        )
        .setFooter({ 
          text: 'Système de Surveillance des Messages Anonymes', 
          iconURL: client.user.displayAvatarURL() 
        })
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    });
  }
};
