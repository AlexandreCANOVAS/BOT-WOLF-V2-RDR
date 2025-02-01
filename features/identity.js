const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  sendMessage: async (client) => {
    try {
      const channel = client.channels.cache.get('1335274571259052153');
      if (!channel) throw new Error('Salon de cartes non trouvé');

      const button = new ButtonBuilder()
        .setCustomId('open_identity_form')
        .setLabel('📝 Créer mon ID')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🪪');

      const row = new ActionRowBuilder().addComponents(button);

      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('🎉 Création de Carte d\'Identité Virtuelle 🎉')
        .setDescription('Bienvenue dans le processus de création de votre carte d\'identité virtuelle !')
        .addFields(
          { name: '📋 Comment ça marche ?', value: 'Cliquez sur le bouton ci-dessous pour commencer. Vous serez guidé à travers un formulaire simple et rapide.' },
          { name: '🔒 Sécurité', value: 'Vos informations sont traitées de manière confidentielle et sécurisée.' },
          { name: '📸 Photo', value: 'N\'oubliez pas de préparer une photo pour votre carte d\'identité !' }
        )
        .setFooter({ text: 'Créez votre identité virtuelle dès maintenant !', iconURL: 'https://i.imgur.com/4ZvJ9Nl.png' })
        .setTimestamp();

      await channel.send({
        embeds: [embed],
        components: [row]
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message de carte d\'identité:', error);
    }
  },

  handleButton: async (interaction) => {
    const modal = new ModalBuilder()
      .setCustomId('identity_form')
      .setTitle('Formulaire de Carte d\'Identité');

    const nomInput = new TextInputBuilder()
      .setCustomId('nom')
      .setLabel('Quel est votre nom ?')
      .setStyle(TextInputStyle.Short);

    const prenomInput = new TextInputBuilder()
      .setCustomId('prenom')
      .setLabel('Quel est votre prénom ?')
      .setStyle(TextInputStyle.Short);

    const ageInput = new TextInputBuilder()
      .setCustomId('age')
      .setLabel('Quel est votre âge ?')
      .setStyle(TextInputStyle.Short);

    const nationaliteInput = new TextInputBuilder()
      .setCustomId('nationalite')
      .setLabel('Quelle est votre nationalité ?')
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nomInput),
      new ActionRowBuilder().addComponents(prenomInput),
      new ActionRowBuilder().addComponents(ageInput),
      new ActionRowBuilder().addComponents(nationaliteInput)
    );

    await interaction.showModal(modal);
  },

  handleModal: async (interaction) => {
    const nom = interaction.fields.getTextInputValue('nom');
    const prenom = interaction.fields.getTextInputValue('prenom');
    const age = interaction.fields.getTextInputValue('age');
    const nationalite = interaction.fields.getTextInputValue('nationalite');

    await interaction.reply({
      content: "Formulaire reçu ! Veuillez maintenant envoyer une photo pour votre carte d'identité (vous avez 60 secondes).",
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id && m.attachments.size > 0;
    try {
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      const photoMessage = collected.first();
      const attachment = photoMessage.attachments.first();

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`📇 CARTE D'IDENTITÉ VIRTUELLE - ${prenom.toUpperCase()}`)
        .setAuthor({ 
          name: `${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL() 
        })
        .setThumbnail(attachment.url)
        .addFields(
          { 
            name: '🔖 Identité complète', 
            value: `**Nom :** ${nom}\n**Prénom :** ${prenom}\n**Âge :** ${age} ans`,
            inline: false 
          },
          { 
            name: '🌍 Nationalité', 
            value: `🏳️ ${nationalite}`,
            inline: true 
          },
          { 
            name: '📅 Date de création', 
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: true 
          }
        )
        .setFooter({ 
          text: 'Carte sécurisée - Validité permanente', 
          iconURL: 'https://i.imgur.com/4ZvJ9Nl.png' 
        });

      await interaction.followUp({ 
        content: "Voici votre carte d'identité virtuelle :",
        embeds: [embed], 
        ephemeral: true 
      });

      try {
        await interaction.user.send({
          content: "Voici votre carte d'identité virtuelle :",
          embeds: [embed]
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi du MP :", error);
        await interaction.followUp({
          content: "Impossible de vous envoyer votre carte d'identité en message privé. Vérifiez que vous acceptez les messages privés du serveur.",
          ephemeral: true
        });
      }

      const recensementChannel = interaction.client.channels.cache.get('1335230189139005503');
      if (recensementChannel) {
        await recensementChannel.send({ 
          content: `Nouvelle carte d'identité créée par ${interaction.user.tag}`,
          embeds: [embed] 
        });
      } else {
        console.error("Le salon de recensement n'a pas été trouvé.");
      }

      // Suppression de la photo
      if (photoMessage.deletable) {
        await photoMessage.delete();
      }

    } catch (error) {
      console.error('Erreur lors de la création de la carte d\'identité:', error);
      const embedSansPhoto = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`📇 CARTE D'IDENTITÉ VIRTUELLE - ${prenom.toUpperCase()}`)
        .setAuthor({ 
          name: `${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL() 
        })
        .addFields(
          { 
            name: '🔖 Identité complète', 
            value: `**Nom :** ${nom}\n**Prénom :** ${prenom}\n**Âge :** ${age} ans`,
            inline: false 
          },
          { 
            name: '🌍 Nationalité', 
            value: `🏳️ ${nationalite}`,
            inline: true 
          },
          { 
            name: '📅 Date de création', 
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: true 
          }
        )
        .setFooter({ 
          text: 'Carte sécurisée - Validité permanente', 
          iconURL: 'https://i.imgur.com/4ZvJ9Nl.png' 
        });

      await interaction.followUp({
        content: "Vous n'avez pas envoyé de photo dans le temps imparti. Voici votre carte d'identité sans photo :",
        embeds: [embedSansPhoto],
        ephemeral: true
      });

      try {
        await interaction.user.send({
          content: "Voici votre carte d'identité virtuelle (sans photo) :",
          embeds: [embedSansPhoto]
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi du MP :", error);
        await interaction.followUp({
          content: "Impossible de vous envoyer votre carte d'identité en message privé. Vérifiez que vous acceptez les messages privés du serveur.",
          ephemeral: true
        });
      }

      const recensementChannel = interaction.client.channels.cache.get('1335230189139005503');
      if (recensementChannel) {
        await recensementChannel.send({ 
          content: `Nouvelle carte d'identité créée par ${interaction.user.tag} (sans photo)`,
          embeds: [embedSansPhoto] 
        });
      } else {
        console.error("Le salon de recensement n'a pas été trouvé.");
      }
    }
  },
};
