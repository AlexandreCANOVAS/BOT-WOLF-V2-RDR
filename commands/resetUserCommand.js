const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'resetuser',
  description: 'Réinitialise le rang, l\'XP et les rôles d\'XP d\'un utilisateur',
  async execute(message, args, db) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return { content: "Vous n'avez pas la permission d'utiliser cette commande." };
    }

    const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetUser) {
      return { content: "Veuillez mentionner un utilisateur valide ou fournir un ID valide." };
    }

    try {
      await db.resetUserData(targetUser.id);

      const xpRoleNames = ['Vagabond', 'Débrouillard', 'Cow-Boy', 'Justicier', 'Vétéran', 'Seigneur des frontières', 'Pistolero', 'Régent des Plaines', 'Légende de l\'Ouest', 'Mythe Vivant'];

      const rolesToRemove = targetUser.roles.cache.filter(role => xpRoleNames.includes(role.name));
      await targetUser.roles.remove(rolesToRemove);

      const vagabondRole = message.guild.roles.cache.find(role => role.name === 'Vagabond');
      if (vagabondRole) {
        await targetUser.roles.add(vagabondRole);
      }

      const embed = new EmbedBuilder()
      .setColor('#4B0082')  // Indigo profond pour un look plus moderne
      .setTitle('🔄 Réinitialisation Utilisateur')
      .setDescription(`Les données XP et les rôles d'XP de **${targetUser.user.username}** ont été réinitialisés avec succès.`)
      .addFields(
        { name: '👤 Utilisateur', value: `<@${targetUser.user.id}>`, inline: true },
        { name: '🎭 Nouveau rôle', value: '`Vagabond`', inline: true },
        { name: '📊 XP', value: '`0`', inline: true },
        { name: '🔨 Action', value: 'Réinitialisation XP et rôles', inline: false }
      )
      .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true, size: 128 }))
      .setFooter({ 
        text: `Réinitialisation effectuée par ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL({ dynamic: true, size: 16 })
      })
      .setTimestamp();
    
    return { embeds: [embed] };
    
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des données et rôles XP de l\'utilisateur:', error);
      return { content: "Une erreur est survenue lors de la réinitialisation des données et rôles XP de l'utilisateur." };
    }
  },
};
