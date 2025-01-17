const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionsBitField, ChannelType, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

const TELEGRAM_CHANNEL_ID = '1060457354501574706';
const TELEGRAM_CATEGORY_ID = '1060456399877972008';
const STAFF_ROLE_ID = '1059787646051819540';

const createEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor('#6b3d22')
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'Red Dead Redemption 2 - Télégramme' });
};

module.exports = {
  sendTelegramMessage: async (client) => {
    try {
      const telegramChannel = await client.channels.fetch(TELEGRAM_CHANNEL_ID);
      if (!telegramChannel) {
        throw new Error('Le salon "『📩』𝘛é𝘭é𝘨𝘳𝘢𝘮𝘮𝘦" n\'a pas été trouvé.');
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_telegram_ticket')
          .setLabel('📩 Créer un télégramme')
          .setStyle(ButtonStyle.Primary)
      );

      const embed = createEmbed('📨 BESOIN D\'UN TELEGRAMME? 📨', 
        `Vous êtes sur le point d'envoyer un télégramme.
        Cliquez sur le bouton ci-dessous pour sélectionner la personne à qui vous souhaitez parler.`
      );

      await telegramChannel.send({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message du télégramme :', error);
    }
  },

  handleTelegramTicketCreation: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      
      const guild = interaction.guild;
      const members = await guild.members.fetch();
      
      const options = members
        .filter(member => !member.user.bot)
        .map(member => ({
          label: member.user.username,
          value: member.id
        }));

      const optionChunks = [];
      for (let i = 0; i < options.length; i += 25) {
        optionChunks.push(options.slice(i, i + 25));
      }

      const rows = optionChunks.map((chunk, index) => 
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`select_telegram_recipient_${index}`)
            .setPlaceholder(`Destinataire (${index + 1}/${optionChunks.length})`)
            .addOptions(chunk)
        )
      );

      await interaction.editReply({
        content: 'Veuillez sélectionner la personne à qui vous souhaitez envoyer un télégramme :',
        components: rows,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('Erreur lors de la création du menu de sélection :', error);
      await interaction.editReply({
        content: 'Une erreur est survenue lors de la création du menu de sélection.',
        flags: MessageFlags.Ephemeral
      });
    }
  },

  createTelegramTicket: async (interaction) => {
    const member = interaction.user;
    const targetUserId = interaction.values[0];
  
    try {
      const category = await interaction.guild.channels.fetch(TELEGRAM_CATEGORY_ID);
      if (!category) {
        throw new Error("La catégorie '📨 | TELEGRAMME' n'a pas été trouvée.");
      }
  
      const recipient = await interaction.guild.members.fetch(targetUserId);
      const ticketChannel = await interaction.guild.channels.create({
        name: `telegram-${member.username}-${recipient.user.username}`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: member.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: targetUserId,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: STAFF_ROLE_ID,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
  
      const closeTicketRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_telegram_ticket')
          .setLabel('🚪 Fermer le télégramme')
          .setStyle(ButtonStyle.Danger)
      );
  
      const ticketEmbed = createEmbed('🚨 Votre télégramme a été ouvert ! 🚨',
        `Bienvenue dans votre *télégramme*. Vous pouvez maintenant discuter avec ${recipient.user.username}.
        📅 En attendant, veuillez rester respectueux et courtois.`
      );
  
      await ticketChannel.send({
        content: `<@${member.id}> a ouvert un télégramme avec <@${recipient.id}>.\n\nBienvenue dans votre télégramme !`,
        embeds: [ticketEmbed],
        components: [closeTicketRow],
      });
  
      await interaction.reply({
        content: `Votre télégramme a été créé avec succès dans la catégorie '📨 | TELEGRAMME'.`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du télégramme :', error);
      await interaction.followUp({
        content: "Une erreur est survenue lors de la création de votre télégramme.",
        flags: MessageFlags.Ephemeral
      });
    }
  },
  

  closeTelegramTicket: async (interaction) => {
    try {
      await interaction.deferUpdate();
  
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.followUp({
          content: "Désolé, vous n'avez pas la permission de fermer ce télégramme.",
          ephemeral: true
        });
      }
  
      const ticketChannel = interaction.channel;
      if (!ticketChannel) {
        return interaction.followUp({
          content: "Le canal du télégramme n'existe plus.",
          ephemeral: true
        });
      }
  
      await ticketChannel.delete();
    } catch (error) {
      console.error('Erreur lors de la fermeture du télégramme :', error);
      await interaction.followUp({
        content: "Une erreur est survenue lors de la fermeture du télégramme.",
        ephemeral: true
      });
    }
  }
};
