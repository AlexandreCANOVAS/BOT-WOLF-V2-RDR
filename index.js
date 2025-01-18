require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

// Imports des commandes et fonctionnalités
const sessionCommand = require('./commands/sessionCommand');
const propositionSessionCommand = require('./commands/propositionSessionCommand');
const lancementCommand = require('./commands/lancementCommand');
const clotureCommand = require('./commands/clotureCommand');
const voteTopServeur = require('./features/voteTopServeur');
const guildMemberEvents = require('./events/memberAddRemove');
const roleReaction = require('./features/roleReaction');
const ticketHandler = require('./features/ticketHandler');
const telegramHandler = require('./features/telegramHandler');
const acceptCommand = require('./commands/accept');
const ticketMediator = require('./features/ticketMediator');
const anonymousMessageCommand = require('./commands/anonymousMessage');
const logs = require('./events/logs');
const logAnonymous = require('./events/logAnonymous');
const messageXp = require('./events/messageXp');

// Constantes
const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = '-';
const ROLES = {
  STAFF: '💎 | Staff',
  RP_ECRIT: '📝 | RP écrit',
  IMMIGRE: '🗺| Immigré',
  RESIDENT: '🏠| Résident',
  RP_VOCAL: '🎙 | RP vocal'
};

// Création du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();

// Initialisation des commandes
function initializeCommands() {
  client.commands.set('session', sessionCommand);
  client.commands.set('proposition', propositionSessionCommand);
  client.commands.set('clôture', clotureCommand);
  client.commands.set('lancement', lancementCommand);
  client.commands.set('accepter', acceptCommand);
  client.commands.set('anonymous', anonymousMessageCommand);
}

// Initialisation du bot
client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  initializeCommands();
  voteTopServeur.startRecurringMessages(client);
  roleReaction.sendMessage(client);
  ticketHandler.sendTicketMessage(client);
  telegramHandler.sendTelegramMessage(client);
  ticketMediator.sendTicketMessage(client);
  logs.execute(client);
  logAnonymous.execute(client);
  messageXp.execute(client);
});

// Gestion des interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  try {
    if (interaction.customId === 'create_ticket') {
      await ticketHandler.createTicket(interaction);
    } else if (interaction.customId === 'close_ticket') {
      await handleCloseTicket(interaction);
    } else if (interaction.customId === 'create_telegram_ticket') {
      await telegramHandler.handleTelegramTicketCreation(interaction);
    } else if (interaction.customId.startsWith('select_telegram_recipient_')) {
      await telegramHandler.createTelegramTicket(interaction);
    } else if (interaction.customId === 'close_telegram_ticket') {
      await telegramHandler.closeTelegramTicket(interaction);
    } else if (interaction.customId === 'create_mediateur_ticket') {
      await ticketMediator.createTicket(interaction);
    } else if (interaction.customId === 'close_mediateur_ticket') {
      await ticketMediator.closeTicket(interaction);
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de l\'interaction:', error);
    await interaction.reply({
      content: 'Une erreur est survenue lors du traitement de votre demande.',
      ephemeral: true
    });
  }
});

async function handleCloseTicket(interaction) {
  if (!interaction.member.roles.cache.some(role => role.name === ROLES.STAFF)) {
    return interaction.reply({
      content: "Désolé, vous n'avez pas la permission de fermer ce ticket.",
      ephemeral: true,
    });
  }

  await interaction.reply({
    content: "Le ticket va être fermé.",
    ephemeral: true,
  });

  try {
    const ticketChannel = interaction.channel;
    await ticketChannel.send("Ce ticket va maintenant être fermé. Si vous avez besoin d'aide supplémentaire, ouvrez un nouveau ticket.");
    await ticketChannel.delete();
  } catch (error) {
    console.error('Erreur lors de la fermeture du ticket :', error);
    await interaction.followUp({
      content: "Une erreur est survenue lors de la fermeture du ticket.",
      ephemeral: true,
    });
  }
}

// Gestion des réactions d'ajout de rôle
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot || !reaction.message.guild) return;

  try {
    await reaction.fetch();
    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member) return;

    if (reaction.emoji.name === '📝') {
      const role = reaction.message.guild.roles.cache.find(r => r.name === ROLES.RP_ECRIT);
      if (!role) return console.log(`Le rôle '${ROLES.RP_ECRIT}' n'a pas été trouvé.`);

      await member.roles.add(role);
      console.log(`${user.tag} a reçu le rôle ${ROLES.RP_ECRIT}`);

      try {
        await member.send(`🎉 Bonjour ${user.username}, vous avez reçu le rôle **${ROLES.RP_ECRIT}** ! Vous pouvez maintenant profiter du RP et on vous souhaite de vivre une expérience inoubliable !🎉`);
      } catch (error) {
        console.error(`Erreur lors de l'envoi du message privé à ${user.tag}:`, error);
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réaction :', error);
  }
});

// Gestion des membres entrant et sortant
client.on('guildMemberAdd', (member) => guildMemberEvents.execute(member, 'add'));
client.on('guildMemberRemove', (member) => guildMemberEvents.execute(member, 'remove'));

// Gestion des commandes
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
    
    // Suppression du message de commande après son exécution
    if (message.deletable) {
      try {
        await message.delete();
      } catch (deleteError) {
        console.error(`Erreur lors de la suppression du message de commande: ${deleteError}`);
      }
    }
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
    await message.channel.send('Une erreur est survenue lors de l\'exécution de la commande.');
  }
});


// Gestion des erreurs globales
client.on('error', error => {
  console.error('Erreur globale du client Discord:', error);
});

// Connexion du bot
client.login(TOKEN).catch(error => {
  console.error('Erreur lors de la connexion du bot:', error);
});
