const ROLES = {
  IMMIGRE: '🗺| Immigré',
  RESIDENT: '🏠| Résident',
  RP_VOCAL: '🎙 | RP vocal'
};

module.exports = {
  execute: async (message) => {
    if (message.author.bot) return;

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Veuillez mentionner un membre valide pour accepter la candidature.');
    }

    const roles = {};
    for (const [key, roleName] of Object.entries(ROLES)) {
      roles[key] = message.guild.roles.cache.find((role) => role.name === roleName);
      if (!roles[key]) {
        return message.reply(`Le rôle "${roleName}" est introuvable sur ce serveur.`);
      }
    }

    try {
      if (member.roles.cache.has(roles.IMMIGRE.id)) {
        await member.roles.remove(roles.IMMIGRE);
      }
      await member.roles.add([roles.RESIDENT, roles.RP_VOCAL]);

      await member.send(getWelcomeMessage(message.guild.name));

      await message.channel.send(
        `Une candidature a été acceptée et les rôles \`${ROLES.RESIDENT}\` et \`${ROLES.RP_VOCAL}\` ont été attribués. :white_check_mark:`
      );
    } catch (error) {
      console.error('Erreur lors de l\'attribution des rôles:', error);
      return message.reply("Une erreur est survenue lors de l'attribution des rôles.");
    }

    try {
      await message.delete();
      console.log(`Le message de la commande '-accepter' a été supprimé avec succès.`);
    } catch (error) {
      console.error('Erreur lors de la suppression du message :', error);
    }
  },
};

function getWelcomeMessage(guildName) {
  return `Bonjour,

Vous venez d'être accepté dans le serveur ! :grin: 
Félicitations à vous ! :partying_face: 

:page_with_curl:  - Vous pouvez dès à présent faire le tour des catégories pour prendre en compte tout son contenu. 

:money_with_wings:  - Familiarisez-vous avec le bot dans la catégorie Compte et faites un !money dans le premier salon pour ouvrir votre compte en banque.

Si vous avez des questions, nous restons bien entendu disponibles, soit via un ticket si vous êtes timides, soit directement dans le salon discussion :smile: 

Nous sommes tous là pour vous répondre.

:warning: Pour votre première session, pensez à vous rendre au bureau des shérifs afin de vous faire recenser. 
Passez ensuite à l'écurie ou au ranch pour recenser votre cheval. :warning: 

A bientôt en RP sur **${guildName}**.`;
}
