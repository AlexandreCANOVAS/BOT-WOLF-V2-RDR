require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { init } = require('./database.js');

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
const rangCommand = require('./commands/rangCommand');
const xpCommand = require('./commands/xpCommand');
const resetDbCommand = require('./commands/resetdb.js');
const resetUserCommand = require('./commands/resetUserCommand');
const getXpCommand = require('./commands/getXpCommand');
const leaderboardCommand = require('./commands/leaderboard');
const rankAttributeCommand = require('./commands/rankAttribute');



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
  client.commands.set('rang', rangCommand);
  client.commands.set('xp', xpCommand);
  client.commands.set('resetdb', resetDbCommand);
  client.commands.set('resetuser', resetUserCommand);
  client.commands.set('getxp', getXpCommand);
  client.commands.set('leaderboard', leaderboardCommand);
  client.commands.set('rankattribute', rankAttributeCommand);
}

async function startBot() {
  try {
    const db = await init();

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
      messageXp.execute(client, db);
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

    
    
    client.on('messageCreate', async (message) => {
      if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    
      const args = message.content.slice(PREFIX.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
    
      const command = client.commands.get(commandName);
      if (!command) return;
    
      try {
        let response;
        if (commandName === 'xp' || commandName === 'rang' || commandName === 'resetdb' || commandName === 'getxp' || commandName === 'leaderboard' || commandName === 'resetuser' || commandName === 'rankattribute') {
          response = await command.execute(message, args, db);
        } else {
          response = await command.execute(message, args);
        }
        
        if (response) {
          if (typeof response === 'string') {
            await message.channel.send({ content: response });
          } else if (typeof response === 'object') {
            if (response.embeds) {
              await message.channel.send({ embeds: response.embeds });
            } else if (response.content) {
              await message.channel.send({ content: response.content });
            } else {
              await message.channel.send({ content: JSON.stringify(response) });
            }
          }
        }
    
        if (message.deletable && !message.deleted) {
          setTimeout(() => {
            message.delete().catch(error => {
              console.error(`Erreur lors de la suppression du message de commande: ${error}`);
            });
          }, 500);
        }
      } catch (error) {
        console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
        await message.channel.send({ content: 'Une erreur est survenue lors de l\'exécution de la commande.' });
      }
    });
    
    
    


    // Gestion des déconnexions
    client.on('disconnect', (event) => {
      console.log('Bot déconnecté de Discord, tentative de reconnexion...');
      client.login(TOKEN).catch(error => {
        console.error('Erreur lors de la tentative de reconnexion:', error);
      });
    });

    // Gestion des erreurs de connexion
    client.on('error', error => {
      if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.error('Erreur de connexion, tentative de reconnexion dans 5 secondes...');
        setTimeout(() => {
          client.login(TOKEN).catch(error => {
            console.error('Erreur lors de la tentative de reconnexion:', error);
          });
        }, 5000);
      } else {
        console.error('Erreur du client Discord:', error);
      }
    });

    // Connexion du bot
    await client.login(TOKEN);
  } catch (error) {
    console.error('Erreur lors du démarrage du bot:', error);
  }
}

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

// Démarrage du bot
startBot();
