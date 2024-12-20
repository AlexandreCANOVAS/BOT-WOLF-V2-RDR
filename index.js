require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const sessionCommand = require('./sessionCommand'); // Import de la commande session
const propositionSessionCommand = require('./propositionSessionCommand'); // Import de la commande proposition session
const lancementCommand = require('./lancementCommand.js');
const clotureCommand = require('./clotureCommand.js');
const voteTopServeur = require('./voteTopServeur');  // Importer la fonctionnalité de vote
const guildMemberEvents = require('../BOT-WOLF-V2-RDR/events/memberAddRemove.js');
const roleReaction = require('./roleReaction');
const acceptCommand = require('./accept'); // Import de la commande 'accepter' (dans le même répertoire)

const TOKEN = process.env.DISCORD_TOKEN; // Charge le token depuis les variables d'environnement
const PREFIX = '-'; // Préfixe pour les commandes

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,              // Permet d'interagir avec les serveurs
    GatewayIntentBits.GuildMessages,       // Permet de lire et répondre aux messages
    GatewayIntentBits.MessageContent,      // Permet de lire le contenu des messages
    GatewayIntentBits.GuildMembers,        // Permet de gérer les rôles et membres du serveur
    GatewayIntentBits.GuildMessageReactions  // Pour gérer les réactions
  ],
});

// Lors de la connexion du bot
client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  voteTopServeur.startRecurringMessages(client);  // Démarrer l'envoi récurrent des messages
  roleReaction.sendMessage(client);  // Envoie le message avec la réaction
});

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    if (user.bot) return;

    if (!reaction.message.guild) return;

    const member = await reaction.message.guild.members.fetch(user.id);

    if (!member) {
      console.log(`Membre introuvable pour l'utilisateur ${user.tag}`);
      return;
    }

    if (reaction.emoji.name === '📝') {
      const role = reaction.message.guild.roles.cache.find(r => r.name === '📝 | RP écrit');
      if (role) {
        await member.roles.add(role);
        console.log(`${user.tag} a reçu le rôle 📝 | RP écrit`);

        try {
          await member.send(`🎉 Bonjour ${user.username}, vous avez reçu le rôle **📝 | RP écrit** ! 🎉`);
          console.log(`Message privé envoyé à ${user.tag}`);
        } catch (error) {
          console.error(`Erreur lors de l'envoi du message privé à ${user.tag}:`, error);
        }
      } else {
        console.log("Le rôle '📝 | RP écrit' n'a pas été trouvé.");
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réaction :', error);
  }
});

client.on('guildMemberAdd', (member) => {
  guildMemberEvents.execute(member, 'add');
});

client.on('guildMemberRemove', (member) => {
  guildMemberEvents.execute(member, 'remove');
});

// Écoute des messages entrants
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(`${PREFIX}clôture`)) {
    await clotureCommand.execute(message);
  }

  if (message.content.startsWith(`${PREFIX}lancement`)) {
    await lancementCommand.execute(message);
  }

  if (message.content.startsWith(`${PREFIX}proposition session`)) {
    await propositionSessionCommand.execute(message);
  }

  // Commande acceptée
  if (message.content.startsWith(`${PREFIX}accepter`)) {
    await acceptCommand.execute(message); // Appelle la fonction de la commande 'accepter'
  }

  if (message.content.startsWith(`${PREFIX}session`)) {
    await sessionCommand.execute(message);
  }
});

// Connexion du bot
client.login(TOKEN);
