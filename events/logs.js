const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'logs',
  execute(client) {
    const logChannel = client.channels.cache.find(channel => channel.name === 'logs');
    if (!logChannel) return console.log('Canal de logs non trouvé');

    const createEmbed = (title, color, description, fields = []) => {
      return new EmbedBuilder()
        .setTitle(`📝 ${title}`)
        .setColor(color)
        .setDescription(description)
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: 'Système de logs' });
    };

    client.on('channelCreate', channel => {
      const embed = createEmbed('Nouveau canal créé', '#00FF00', 'Un nouveau canal a été ajouté au serveur.', [
        { name: '📛 Nom', value: channel.name, inline: true },
        { name: '🏷️ Type', value: channel.type, inline: true },
        { name: '🆔 ID', value: channel.id, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('channelDelete', channel => {
      const embed = createEmbed('Canal supprimé', '#FF0000', 'Un canal a été supprimé du serveur.', [
        { name: '📛 Nom', value: channel.name, inline: true },
        { name: '🏷️ Type', value: channel.type, inline: true },
        { name: '🆔 ID', value: channel.id, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('guildMemberAdd', member => {
      const embed = createEmbed('Nouveau membre', '#00FF00', `${member.user.tag} a rejoint le serveur.`, [
        { name: '👤 Membre', value: member.user.tag, inline: true },
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '📅 Compte créé le', value: member.user.createdAt.toLocaleDateString(), inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('guildMemberRemove', member => {
      const embed = createEmbed('Membre parti', '#FF0000', `${member.user.tag} a quitté le serveur.`, [
        { name: '👤 Membre', value: member.user.tag, inline: true },
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '📅 A rejoint le', value: member.joinedAt.toLocaleDateString(), inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('guildBanAdd', ban => {
      const embed = createEmbed('Membre banni', '#FF0000', `${ban.user.tag} a été banni du serveur.`, [
        { name: '👤 Membre', value: ban.user.tag, inline: true },
        { name: '🆔 ID', value: ban.user.id, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('guildBanRemove', ban => {
      const embed = createEmbed('Membre débanni', '#00FF00', `${ban.user.tag} a été débanni du serveur.`, [
        { name: '👤 Membre', value: ban.user.tag, inline: true },
        { name: '🆔 ID', value: ban.user.id, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('messageDelete', message => {
      if (message.author.bot) return;
      const embed = createEmbed('Message supprimé', '#FF0000', 'Un message a été supprimé.', [
        { name: '👤 Auteur', value: message.author.tag, inline: true },
        { name: '📝 Contenu', value: message.content.substring(0, 1024), inline: false }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('messageUpdate', (oldMessage, newMessage) => {
      if (oldMessage.author.bot) return;
      if (oldMessage.content === newMessage.content) return;
      const embed = createEmbed('Message modifié', '#FFFF00', 'Un message a été modifié.', [
        { name: '👤 Auteur', value: oldMessage.author.tag, inline: true },
        { name: '📜 Ancien contenu', value: oldMessage.content.substring(0, 1024), inline: false },
        { name: '📝 Nouveau contenu', value: newMessage.content.substring(0, 1024), inline: false }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('roleCreate', role => {
      const embed = createEmbed('Nouveau rôle créé', '#00FF00', 'Un nouveau rôle a été créé sur le serveur.', [
        { name: '📛 Nom', value: role.name, inline: true },
        { name: '🆔 ID', value: role.id, inline: true },
        { name: '🎨 Couleur', value: role.hexColor, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('roleDelete', role => {
      const embed = createEmbed('Rôle supprimé', '#FF0000', 'Un rôle a été supprimé du serveur.', [
        { name: '📛 Nom', value: role.name, inline: true },
        { name: '🆔 ID', value: role.id, inline: true },
        { name: '🎨 Couleur', value: role.hexColor, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });
  }
};
