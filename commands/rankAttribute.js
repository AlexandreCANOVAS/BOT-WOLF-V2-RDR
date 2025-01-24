const { PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

const ranks = [
  { name: "Vagabond", xp: 0, emoji: "🌱", color: "#3498db" },
  { name: "Débrouillard", xp: 100, emoji: "🔧", color: "#2ecc71" },
  { name: "Cow-Boy", xp: 300, emoji: "🤠", color: "#e67e22" },
  { name: "Justicier", xp: 500, emoji: "⚖️", color: "#9b59b6" },
  { name: "Vétéran", xp: 1000, emoji: "🎖️", color: "#34495e" },
  { name: "Seigneur des frontières", xp: 2000, emoji: "🏞️", color: "#16a085" },
  { name: "Pistolero", xp: 3500, emoji: "🔫", color: "#c0392b" },
  { name: "Régent des Plaines", xp: 5000, emoji: "👑", color: "#f1c40f" },
  { name: "Légende de l'Ouest", xp: 10000, emoji: "🌟", color: "#8e44ad" },
  { name: "Mythe Vivant", xp: 20000, emoji: "🏆", color: "#e74c3c" }
];

module.exports = {
  name: 'rankattribute',
  description: 'Attribue un rang à un joueur (Admin seulement)',
  async execute(message, args, db) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    const members = await message.guild.members.fetch();
    const userOptions = members.map(member => ({
      label: member.user.username,
      value: member.id
    })).slice(0, 25);

    const userSelectMenu = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_user')
          .setPlaceholder('Sélectionnez un utilisateur')
          .addOptions(userOptions)
      );

    const initialReply = await message.reply({ content: "Sélectionnez un utilisateur :", components: [userSelectMenu] });

    const userFilter = i => i.customId === 'select_user' && i.user.id === message.author.id;
    const userCollector = initialReply.createMessageComponentCollector({ filter: userFilter, time: 60000 });

    userCollector.on('collect', async i => {
      await i.deferUpdate();
      const selectedUserId = i.values[0];
      const targetUser = await message.guild.members.fetch(selectedUserId);

      const rankSelectMenu = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_rank')
            .setPlaceholder('Sélectionnez un rang')
            .addOptions(ranks.map(rank => ({
              label: rank.name,
              description: `XP requis: ${rank.xp}`,
              value: rank.name,
              emoji: rank.emoji
            })))
        );

      await i.editReply({ content: `Sélectionnez un rang pour ${targetUser.user.username}:`, components: [rankSelectMenu] });

      const rankFilter = i => i.customId === 'select_rank' && i.user.id === message.author.id;
      const rankCollector = initialReply.createMessageComponentCollector({ filter: rankFilter, time: 60000 });

      rankCollector.on('collect', async i => {
        await i.deferUpdate();
        const selectedRank = ranks.find(rank => rank.name === i.values[0]);

        const xpInput = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('select_xp')
              .setPlaceholder('Sélectionnez les points XP')
              .addOptions(
                { label: 'XP du rang', value: 'rank_xp', description: `${selectedRank.xp} XP` },
                { label: 'XP personnalisé', value: 'custom_xp', description: 'Entrez une valeur personnalisée' }
              )
          );

        await i.editReply({ content: `Sélectionnez les points XP pour ${targetUser.user.username} (Rang: ${selectedRank.name}):`, components: [xpInput] });

        const xpFilter = i => i.customId === 'select_xp' && i.user.id === message.author.id;
        const xpCollector = initialReply.createMessageComponentCollector({ filter: xpFilter, time: 60000 });

        xpCollector.on('collect', async i => {
          await i.deferUpdate();
          let xp = selectedRank.xp;

          if (i.values[0] === 'custom_xp') {
            await i.editReply({ content: 'Veuillez entrer la valeur XP personnalisée :', components: [] });
            const xpMessageFilter = m => m.author.id === message.author.id && !isNaN(m.content);
            const xpMessage = await message.channel.awaitMessages({ filter: xpMessageFilter, max: 1, time: 30000 });
            
            if (xpMessage.size > 0) {
              xp = parseInt(xpMessage.first().content);
            } else {
              return i.editReply('Temps écoulé. Aucune valeur XP n\'a été fournie.');
            }
          }

          try {
            const userData = await db.getUser(targetUser.id);
            const oldRank = userData ? userData.current_rank : null;

            if (oldRank) {
              const oldRole = message.guild.roles.cache.find(r => r.name === oldRank);
              if (oldRole) {
                await targetUser.roles.remove(oldRole);
              }
            }

            let role = message.guild.roles.cache.find(r => r.name === selectedRank.name);
            if (!role) {
              role = await message.guild.roles.create({
                name: selectedRank.name,
                color: selectedRank.color,
                reason: 'Nouveau rang créé'
              });
            }
            await targetUser.roles.add(role);

            await db.insertUser(targetUser.id, xp, selectedRank.name);

            const embed = new EmbedBuilder()
              .setColor(selectedRank.color)
              .setTitle('Mise à jour de rang')
              .setDescription(`Le rang de ${targetUser.user.username} a été mis à jour.`)
              .addFields(
                { name: 'Nouveau rang', value: `${selectedRank.emoji} ${selectedRank.name}`, inline: true },
                { name: 'XP attribués', value: `${xp} XP`, inline: true }
              )
              .setTimestamp();

            await i.editReply({ content: ' ', embeds: [embed], components: [] });
          } catch (error) {
            console.error('Erreur lors de la mise à jour du rang:', error);
            await i.editReply({ content: "Une erreur est survenue lors de la mise à jour du rang.", components: [] });
          }
        });
      });
    });

    userCollector.on('end', collected => {
      if (collected.size === 0) {
        initialReply.edit({ content: 'Temps écoulé. Aucun utilisateur n\'a été sélectionné.', components: [] });
      }
    });
  },
};
