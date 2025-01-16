const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionsBitField, ChannelType, ButtonStyle } = require('discord.js');

const DEMANDE_SALON_ID = '1060474992346791986';
const CATEGORY_ID = '1060456188413747200';
const STAFF_ROLE_ID = '1059787646051819540';

const createEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor('#6b3d22')
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'Red Dead Redemption 2 - Staff Assistance' });
};

module.exports = {
  sendTicketMessage: async (client) => {
    try {
      const demandeSalon = await client.channels.fetch(DEMANDE_SALON_ID);
      if (!demandeSalon) {
        throw new Error('Le salon "『🛎』𝘋𝘦𝘮𝘢𝘯𝘥𝘦𝘴" n\'a pas été trouvé.');
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('📩 Ouvrir un ticket')
          .setStyle(ButtonStyle.Primary)
      );

      const embed = createEmbed('🌵 BESOIN D\'AIDE? 🌵', 
        `Vous êtes sur le point de demander de l'aide dans ce *Saloon*.
        Un membre du staff viendra vous assister rapidement, mais en attendant, faites attention aux rôdeurs qui rôdent dans les alentours... 💀
        
        📜 Pour ouvrir un ticket, appuyez sur le bouton ci-dessous. Vous pourrez discuter directement avec un membre du staff.`
      );

      await demandeSalon.send({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message du ticket :', error);
    }
  },

  createTicket: async (interaction) => {
    const member = interaction.user;

    try {
      const category = await interaction.guild.channels.fetch(CATEGORY_ID);
      if (!category) {
        throw new Error("La catégorie '🔔 | DEMANDE' n'a pas été trouvée.");
      }

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${member.username}`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: member.id,
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
          .setCustomId('close_ticket')
          .setLabel('🚪 Fermer le ticket')
          .setStyle(ButtonStyle.Danger)
      );

      const ticketEmbed = createEmbed('🚨 Votre ticket a été ouvert ! 🚨',
        `Bienvenue dans votre *ticket*. Un membre du staff arrivera pour vous prêter main forte dès que possible. 
        📅 En attendant, veuillez rester calme et ne pas perturber l'ordre du camp.
        
        - Vous pouvez poser vos questions ici.
        - Attendez que l'un de nos assistants arrive pour vous.`
      );

      await ticketChannel.send({
        content: `**${member.username}**, a ouvert un ticket. Un membre du staff le rejoindra sous peu.`,
        embeds: [ticketEmbed],
        components: [closeTicketRow],
      });

      if (interaction.isRepliable()) {
        await interaction.reply({
          content: `Votre ticket a été créé avec succès dans la catégorie '🔔 | DEMANDE'. Un membre du staff vous répondra sous peu.`,
          ephemeral: true
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du ticket :', error);
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: "Une erreur est survenue lors de la création de votre ticket.",
          ephemeral: true
        });
      }
    }
  },

  closeTicket: async (interaction) => {
    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      if (interaction.isRepliable()) {
        return interaction.reply({
          content: "Désolé, vous n'avez pas la permission de fermer ce ticket.",
          ephemeral: true
        });
      }
      return;
    }

    try {
      const ticketChannel = interaction.channel;
      await ticketChannel.send({
        content: 'Le ticket a été fermé. Merci pour votre patience.',
      });
      await ticketChannel.delete();

      if (interaction.isRepliable()) {
        await interaction.reply({
          content: 'Le ticket a été fermé avec succès.',
          ephemeral: true
        });
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture du ticket :', error);
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: "Une erreur est survenue lors de la fermeture du ticket.",
          ephemeral: true
        });
      }
    }
  }
};
