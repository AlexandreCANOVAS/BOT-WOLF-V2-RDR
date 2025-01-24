const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'logs',
  execute(client) {
    const logChannel = client.channels.cache.find(channel => channel.name === 'logs');
    if (!logChannel) return console.log('Canal de logs non trouvé');

    const createEmbed = (title, color, description, fields = []) => {
      const embed = new EmbedBuilder()
        .setTitle(`🔍 ${title}`.slice(0, 256))
        .setColor(color)
        .setDescription(description.slice(0, 4096))
        .setFooter({ 
          text: 'Système de Surveillance du Serveur', 
          iconURL: client.user.displayAvatarURL() 
        })
        .setTimestamp();

      const safeFields = fields.map(field => ({
        name: (field.name || 'Champ').slice(0, 256),
        value: (field.value || '-').toString().slice(0, 1024),
        inline: !!field.inline
      }));

      if (safeFields.length > 0) {
        embed.addFields(safeFields);
      }

      return embed;
    };

    client.on('channelCreate', channel => {
      const embed = createEmbed('Nouveau Canal Créé', '#00FF00', `Un nouveau canal a été ajouté au serveur : ${channel}.`, [
        { name: '📛 Nom', value: channel.name, inline: true },
        { name: '🏷️ Type', value: channel.type, inline: true },
        { name: '🆔 ID', value: channel.id, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('channelDelete', channel => {
      const embed = createEmbed('Canal Supprimé', '#FF0000', 'Un canal a été supprimé du serveur.', [
        { name: '📛 Nom', value: channel.name, inline: true },
        { name: '🏷️ Type', value: channel.type, inline: true },
        { name: '🆔 ID', value: channel.id, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('guildMemberAdd', member => {
      const embed = createEmbed('Nouveau Membre', '#00FF00', `${member.user.tag} a rejoint le serveur.`, [
        { name: '👤 Membre', value: member.user.tag, inline: true },
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '📅 Compte créé le', value: `<t:${Math.floor(member.user.createdAt / 1000)}:F>`, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('guildMemberRemove', member => {
      const embed = createEmbed('Membre Parti', '#FF0000', `${member.user.tag} a quitté le serveur.`, [
        { name: '👤 Membre', value: member.user.tag, inline: true },
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '📅 A rejoint le', value: `<t:${Math.floor(member.joinedAt / 1000)}:F>`, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('messageDelete', message => {
      if (message.author.bot) return;
      const embed = createEmbed('Message Supprimé', '#FF0000', `Un message a été supprimé dans ${message.channel}.`, [
        { name: '👤 Auteur', value: message.author.tag, inline: true },
        { name: '📍 Salon', value: `#${message.channel.name}`, inline: true },
        { name: '💬 Contenu', value: message.content.substring(0, 1000) || 'Contenu vide' }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('messageUpdate', (oldMessage, newMessage) => {
      if (oldMessage.author.bot) return;
      if (oldMessage.content === newMessage.content) return;
      
      const highlightDifferences = (oldContent, newContent) => {
        let oldHighlighted = oldContent;
        let newHighlighted = newContent;
        
        const words = oldContent.split(' ');
        words.forEach(word => {
          if (!newContent.includes(word)) {
            oldHighlighted = oldHighlighted.replace(word, `**[${word}]**`);
          }
        });
        
        const newWords = newContent.split(' ');
        newWords.forEach(word => {
          if (!oldContent.includes(word)) {
            newHighlighted = newHighlighted.replace(word, `**[${word}]**`);
          }
        });
        
        return [oldHighlighted, newHighlighted];
      };
      
      const [oldFormatted, newFormatted] = highlightDifferences(oldMessage.content, newMessage.content);
      
      const embed = createEmbed('Message Modifié', '#FFFF00', `Un message a été modifié dans ${oldMessage.channel}.`, [
        { name: '👤 Auteur', value: oldMessage.author.tag, inline: true },
        { name: '📍 Salon', value: `#${oldMessage.channel.name}`, inline: true },
        { name: '📜 Ancien contenu', value: oldFormatted.substring(0, 1024) || 'Contenu vide' },
        { name: '📝 Nouveau contenu', value: newFormatted.substring(0, 1024) || 'Contenu vide' }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('roleCreate', role => {
      const embed = createEmbed('Nouveau Rôle Créé', '#00FF00', 'Un nouveau rôle a été créé sur le serveur.', [
        { name: '📛 Nom', value: role.name, inline: true },
        { name: '🆔 ID', value: role.id, inline: true },
        { name: '🎨 Couleur', value: role.hexColor, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });

    client.on('roleDelete', role => {
      const embed = createEmbed('Rôle Supprimé', '#FF0000', 'Un rôle a été supprimé du serveur.', [
        { name: '📛 Nom', value: role.name, inline: true },
        { name: '🆔 ID', value: role.id, inline: true },
        { name: '🎨 Couleur', value: role.hexColor, inline: true }
      ]);
      logChannel.send({ embeds: [embed] });
    });
  }
};
