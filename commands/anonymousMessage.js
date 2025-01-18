const { WebhookClient, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'anonymous',
  description: 'Envoie un message anonyme dans le salon actuel',
  async execute(message, args) {
    try {
      if (message.deletable) {
        
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
    }

    if (args.length < 1) {
      const usageEmbed = new EmbedBuilder()
        .setColor('#36393f')
        .setTitle('🕵️ Message Anonyme')
        .setDescription('Envoyez des messages de manière confidentielle')
        .addFields(
          { name: '📝 Usage', value: '`-anonymous votre message secret`' },
          { name: '🔒 Exemple', value: '`-anonymous Ceci est un message confidentiel`' }
        )
        .setFooter({ 
          text: 'Votre identité restera secrète', 
          iconURL: 'https://th.bing.com/th/id/R.232d72d7596a49d7d67568cf2516351f?rik=2b6Ud9fLHsVZiA&riu=http%3a%2f%2ffc05.deviantart.net%2ffs70%2ff%2f2011%2f293%2f2%2f9%2fwe_are_anonymous_wallpaper_by_raz3-d4dedgm.jpg&ehk=BKKwUexhPGGOKndTaEe1i9X5PiXFInmBYNScWHXHnfE%3d&risl=&pid=ImgRaw&r=0' 
        })
        .setTimestamp();
      
      return message.channel.send({ embeds: [usageEmbed] });
    }

    const anonymousMessage = args.join(' ');
    let webhook;

    try {
      webhook = await message.channel.createWebhook({
        name: 'Message Anonyme',
        avatar: 'https://th.bing.com/th/id/R.232d72d7596a49d7d67568cf2516351f?rik=2b6Ud9fLHsVZiA&riu=http%3a%2f%2ffc05.deviantart.net%2ffs70%2ff%2f2011%2f293%2f2%2f9%2fwe_are_anonymous_wallpaper_by_raz3-d4dedgm.jpg&ehk=BKKwUexhPGGOKndTaEe1i9X5PiXFInmBYNScWHXHnfE%3d&risl=&pid=ImgRaw&r=0',
      });

      await webhook.send({
        content: anonymousMessage,
        username: 'Message Anonyme',
        avatarURL: 'https://th.bing.com/th/id/R.232d72d7596a49d7d67568cf2516351f?rik=2b6Ud9fLHsVZiA&riu=http%3a%2f%2ffc05.deviantart.net%2ffs70%2ff%2f2011%2f293%2f2%2f9%2fwe_are_anonymous_wallpaper_by_raz3-d4dedgm.jpg&ehk=BKKwUexhPGGOKndTaEe1i9X5PiXFInmBYNScWHXHnfE%3d&risl=&pid=ImgRaw&r=0',
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message anonyme:', error);
      await message.channel.send('Une erreur est survenue lors de l\'envoi du message anonyme.').catch(console.error);
    } finally {
      if (webhook) {
        try {
          await webhook.delete();
        } catch (error) {
          console.error('Erreur lors de la suppression du webhook:', error);
        }
      }
    }
  },
};
