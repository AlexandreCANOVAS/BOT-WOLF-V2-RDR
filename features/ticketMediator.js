const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionsBitField, ChannelType, ButtonStyle } = require('discord.js');

const DEMANDE_SALON_ID = '1326606785561231380';
const CATEGORY_ID = '1326606585165778974'; // ID de la catégorie "🌐 | MEDIATEUR"
const STAFF_ROLE_ID = '1059787646051819540';

const createEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor('#6b3d22')
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'Red Dead Redemption 2 - Médiateur Assistance' });
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
          .setCustomId('create_mediateur_ticket')
          .setLabel('📩 Demander un médiateur')
          .setStyle(ButtonStyle.Primary)
      );

      const embed = createEmbed('🌵 BESOIN D\'UN MÉDIATEUR? 🌵', 
        `Vous êtes sur le point de demander l'assistance d'un médiateur.
        Un membre du staff viendra vous aider rapidement pour résoudre votre problème.
        
        📜 Pour ouvrir un ticket de médiation, appuyez sur le bouton ci-dessous. Vous pourrez discuter directement avec un médiateur.`
      );

      await demandeSalon.send({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message du ticket de médiation :', error);
    }
  },

  createTicket: async (interaction) => {
    const member = interaction.user;
  
    try {
      const category = await interaction.guild.channels.fetch(CATEGORY_ID);
      if (!category) {
        throw new Error("La catégorie '🌐 | MEDIATEUR' n'a pas été trouvée.");
      }
  
      const ticketChannel = await interaction.guild.channels.create({
        name: `mediation-${member.username}`,
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
          .setCustomId('close_mediateur_ticket')
          .setLabel('🚪 Fermer le ticket')
          .setStyle(ButtonStyle.Danger)
      );
  
      const ticketEmbed = createEmbed('🚨 Votre ticket de médiation a été ouvert ! 🚨',
        `Bienvenue dans votre *ticket de médiation*. Un médiateur arrivera pour vous aider dès que possible. 
        📅 En attendant, veuillez rester calme et expliquer votre situation.
        
        - Décrivez le problème que vous rencontrez.
        - Un médiateur vous contactera sous peu pour vous assister.`
      );
  
      await ticketChannel.send({
        content: `<@${member.id}> a ouvert un ticket de médiation. Un médiateur le rejoindra sous peu.`,
        embeds: [ticketEmbed],
        components: [closeTicketRow],
      });
  
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: `Votre ticket de médiation a été créé avec succès dans la catégorie '🌐 | MEDIATEUR'. Un médiateur vous répondra sous peu.`,
          ephemeral: true
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du ticket de médiation :', error);
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: "Une erreur est survenue lors de la création de votre ticket de médiation.",
          ephemeral: true
        });
      }
    }
  },
  

  closeTicket: async (interaction) => {
    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      if (interaction.isRepliable()) {
        return interaction.reply({
          content: "Désolé, vous n'avez pas la permission de fermer ce ticket de médiation.",
          ephemeral: true
        });
      }
      return;
    }

    try {
      const ticketChannel = interaction.channel;
      await ticketChannel.send({
        content: 'Le ticket de médiation a été fermé. Merci pour votre coopération.',
      });
      

      if (interaction.isRepliable()) {
        await interaction.reply({
          content: 'Le ticket de médiation a été fermé avec succès.',
          ephemeral: true
        });
        await ticketChannel.delete();
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture du ticket de médiation :', error);
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: "Une erreur est survenue lors de la fermeture du ticket de médiation.",
          ephemeral: true
        });
      }
    }
  }
};
