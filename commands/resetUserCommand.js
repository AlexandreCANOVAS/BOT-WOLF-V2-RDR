module.exports = {
    name: 'resetuser',
    description: 'Réinitialise les données XP d\'un utilisateur spécifique',
    async execute(message, args, db) {
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
      }
  
      const userId = args[0];
      if (!userId) {
        return message.reply("Veuillez spécifier l'ID de l'utilisateur à réinitialiser.");
      }
  
      try {
        await db.resetUserData(userId);
        message.reply(`Les données de l'utilisateur ${userId} ont été réinitialisées.`);
      } catch (error) {
        console.error('Erreur lors de la réinitialisation des données utilisateur:', error);
        message.reply("Une erreur est survenue lors de la réinitialisation des données de l'utilisateur.");
      }
    },
  };
  