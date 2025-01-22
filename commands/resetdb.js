const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'resetdb',
  description: 'Réinitialise la base de données',
  async execute(message, args, db) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return 'Vous n\'avez pas la permission d\'utiliser cette commande. Seuls les administrateurs peuvent réinitialiser la base de données.';
    }

    try {
      await db.resetDatabase();
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🔄 Réinitialisation de la base de données')
        .setDescription('La base de données a été réinitialisée avec succès.')
        .addFields(
          { name: 'Action effectuée par', value: message.author.tag },
          { name: 'Date et heure', value: new Date().toLocaleString() }
        )
        .setFooter({ text: 'Toutes les données ont été remises à zéro.' });

      return { embeds: [embed] };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la base de données:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Erreur de réinitialisation')
        .setDescription('Une erreur est survenue lors de la réinitialisation de la base de données.')
        .addFields(
          { name: 'Détails de l\'erreur', value: error.message || 'Erreur inconnue' }
        )
        .setFooter({ text: 'Veuillez contacter un administrateur pour résoudre ce problème.' });

      return { embeds: [errorEmbed] };
    }
  },
};
