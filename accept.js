module.exports = {
    execute: async (message) => {
      // On s'assure que le message n'est pas envoyé par un bot
      if (message.author.bot) return;
  
      const member = message.mentions.members.first();
  
      if (!member) {
        return message.reply('Veuillez mentionner un membre valide pour accepter la candidature.');
      }
  
      const roleImmigre = message.guild.roles.cache.find((role) => role.name === '🗺| Immigré');
      const roleResident = message.guild.roles.cache.find((role) => role.name === '🏠| Résident');
      const roleRPVocal = message.guild.roles.cache.find((role) => role.name === '🎙 | RP vocal');
  
      // Vérification des rôles existants sur le serveur
      if (!roleImmigre || !roleResident || !roleRPVocal) {
        return message.reply('Les rôles "immigré", "résident" ou "RP vocal" sont introuvables sur ce serveur.');
      }
  
      try {
        // Retirer le rôle "immigré" et attribuer les rôles "résident" et "RP vocal"
        if (member.roles.cache.has(roleImmigre.id)) {
          await member.roles.remove(roleImmigre);
        }
        await member.roles.add(roleResident);
        await member.roles.add(roleRPVocal);
  
        // Envoi d'un message privé à l'utilisateur concerné
        await member.send(
          `Bonjour, 
  
  Vous venez d'être accepté dans le serveur ! :grin: 
  Félicitations à vous ! :partying_face: 
  
  :page_with_curl:  - Vous pouvez dès à présent faire le tour des catégories pour prendre en compte tout son contenu. 
  
  :money_with_wings:  - Familiarisez-vous avec le bot dans la catégorie Compte et faites un !money dans le premier salon pour ouvrir votre compte en banque.
  
  Si vous avez des questions, nous restons bien entendu disponibles, soit via un ticket si vous êtes timides, soit directement dans le salon discussion :smile: 
  
  Nous sommes tous là pour vous répondre.
  
  :warning: Pour votre première session, pensez à vous rendre au bureau des shérifs afin de vous faire recenser. 
  Passez ensuite à l'écurie ou au ranch pour recenser votre cheval. :warning: 
  
  A bientôt en RP sur **${message.guild.name}**.`
        );
  
        // Confirmation dans le salon
        message.channel.send(
          `Une candidature a été acceptée et les rôles \`🏠 Résident\` et \`🎙 RP vocal\` ont été attribués. :white_check_mark:`
        );
      } catch (error) {
        console.error(error);
        message.reply("Une erreur est survenue lors de l'attribution des rôles.");
      }
  
      // Suppression du message contenant la commande après traitement
      try {
        await message.delete(); // Cette ligne supprime le message contenant la commande
        console.log(`Le message de la commande '-accepter' a été supprimé avec succès.`);
      } catch (error) {
        console.error('Erreur lors de la suppression du message :', error);
      }
    },
  };
  