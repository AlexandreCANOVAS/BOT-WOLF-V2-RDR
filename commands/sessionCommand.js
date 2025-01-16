const { EmbedBuilder } = require('discord.js');

const ROLE_NAME = '🏠| Résident';

module.exports = {
  name: 'session',
  description: 'Définit les règles du RP sans lancer la session.',
  async execute(message) {
    try {
      const roleResident = message.guild.roles.cache.find(role => role.name === ROLE_NAME);
      if (!roleResident) {
        return message.reply(`Le rôle "${ROLE_NAME}" est introuvable sur ce serveur.`);
      }

      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('📜 Règles de la session RP')
        .setDescription('La session va bientôt commencer ! Voici les règles à respecter pendant la session RP :')
        .addFields(
          { name: '🎭 Restez dans votre personnage', value: 'Évitez les discussions hors RP pendant la session.' },
          { name: '🤝 Respectez les autres joueurs', value: 'Soyez courtois et évitez les conflits personnels.' },
          { name: '🎬 Suivez le scénario', value: 'Respectez l\'histoire et les directives des modérateurs.' },
          { name: '⏱️ Soyez ponctuels', value: 'Arrivez à l\'heure pour le début de la session.' },
          { name: '📢 Utilisez le chat vocal', value: 'Communiquez principalement par voix pour plus d\'immersion.' },
          { name: '📢 Retirez vos cartes de compétences :name_badge: :map:', value: 'si pas respecté, warn ⚠️' },
          { name: '📢 Retirez la visée automatique :name_badge: :dart:', value: 'si pas respecté, warn ⚠️' },
          { name: '📢 Mettez la boussole :white_check_mark: :compass:', value: 'si pas respecté, warn ⚠️' },
          { name: '📢 Vérifiez que votre chat vocal est bien actif :white_check_mark: :microphone2:', value: 'si pas respecté, warn ⚠️' },
          { name: '📢 Retirez le nom au dessus des joueurs :name_badge: :video_game:', value: 'si pas respecté, warn ⚠️' }
          
        )
        .setFooter({ text: 'Bonne préparation à tous !' })
        .setTimestamp();

      await message.channel.send({ content: roleResident.toString(), embeds: [embed] });
      
    } catch (error) {
      console.error('Erreur lors de l\'affichage des règles de session:', error);
      await message.channel.send('Une erreur est survenue lors de l\'affichage des règles de session.');
    }
  }
};
