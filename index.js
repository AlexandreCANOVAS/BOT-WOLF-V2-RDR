require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

// -------------------------------------------------------------------------Import des commandes et fonctionnalités------------------------------------------------------------

const sessionCommand = require('./commands/sessionCommand');
const propositionSessionCommand = require('./commands/propositionSessionCommand');
const lancementCommand = require('./commands/lancementCommand');
const clotureCommand = require('./commands/clotureCommand');
const voteTopServeur = require('./features/voteTopServeur');
const guildMemberEvents = require('./events/memberAddRemove');
const roleReaction = require('./features/roleReaction');
const ticketHandler = require('./features/ticketHandler');
const acceptCommand = require('./commands/accept')

// ----------------------------------------------------------------------------------------------Constantes-----------------------------------------------------------------------------

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = '-';
const ROLES = {
  STAFF: '💎 | Staff',
  RP_ECRIT: '📝 | RP écrit',
  IMMIGRE: '🗺| Immigré',
  RESIDENT: '🏠| Résident',
  RP_VOCAL: '🎙 | RP vocal'
};

// -------------------------------------------------------------------------------------Création du client Discord--------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------------Initialisation des commandes----------------------------------------------------------------------------

function initializeCommands() {
  client.commands.set('session', sessionCommand);
  client.commands.set('proposition', propositionSessionCommand);
  client.commands.set('clôture', clotureCommand);
  client.commands.set('lancement', lancementCommand);
  client.commands.set('accepter', acceptCommand);

}

// -------------------------------------------------------------------------------Fonction d'initialisation du bot----------------------------------------------------------------------------

client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  initializeCommands();
  voteTopServeur.startRecurringMessages(client);
  roleReaction.sendMessage(client);
  ticketHandler.sendTicketMessage(client);
});

// --------------------------------------------------------------------------Gestion des interactions (boutons, réactions)-----------------------------------------------------------------------

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  try {
    if (interaction.customId === 'create_ticket') {
      await ticketHandler.createTicket(interaction);
    } else if (interaction.customId === 'close_ticket') {
      await handleCloseTicket(interaction);
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

// ---------------------------------------------------------------------------Gestion des réactions d'ajout de rôle---------------------------------------------------------------------

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

// ------------------------------------------------------------------------------Gestion des membres entrant et sortant------------------------------------------------------------------

client.on('guildMemberAdd', (member) => guildMemberEvents.execute(member, 'add'));
client.on('guildMemberRemove', (member) => guildMemberEvents.execute(member, 'remove'));

// ------------------------------------------------------------------------------------Gestion des commandes-------------------------------------------------------------------------------

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  try {
    await message.delete();
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
  }

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    if (commandName === 'proposition' && args[0] === 'session') {
      await propositionSessionCommand.execute(message);
    } else if (commandName === 'accepter') {
      await handleAcceptCommand(message);
    } else {
      await command.execute(message, args);
    }
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
    await message.channel.send('Une erreur est survenue lors de l\'exécution de la commande.');
  }
});

// --------------------------------------------------------------------------------Fonction pour gérer l'acceptation des candidatures-------------------------------------------------------------------------------------------------

async function handleAcceptCommand(message) {
  const member = message.mentions.members.first();
  if (!member) return message.reply('Veuillez mentionner un membre valide pour accepter la candidature.');

  const roleImmigre = message.guild.roles.cache.find((role) => role.name === ROLES.IMMIGRE);
  const roleResident = message.guild.roles.cache.find((role) => role.name === ROLES.RESIDENT);
  const roleRPVocal = message.guild.roles.cache.find((role) => role.name === ROLES.RP_VOCAL);

  if (!roleImmigre || !roleResident || !roleRPVocal) {
    return message.reply(`Les rôles "${ROLES.IMMIGRE}", "${ROLES.RESIDENT}" ou "${ROLES.RP_VOCAL}" sont introuvables sur ce serveur.`);
  }

  try {
    if (member.roles.cache.has(roleImmigre.id)) {
      await member.roles.remove(roleImmigre);
    }
    await member.roles.add([roleResident, roleRPVocal]);

    await member.send(
      `Bonjour ${member.user.username},\n\nVous avez été accepté dans le serveur et avez reçu les rôles \`${ROLES.RESIDENT}\` et \`${ROLES.RP_VOCAL}\` !\n\nBienvenue parmi nous et profitez pleinement de l'expérience RP !`
    );

    await message.channel.send(`Une candidature a été acceptée et les rôles \`${ROLES.RESIDENT}\` et \`${ROLES.RP_VOCAL}\` ont été attribués à ${member.user.tag}. :white_check_mark:`);
  } catch (error) {
    console.error('Erreur lors de l\'attribution des rôles:', error);
    await message.reply("Une erreur est survenue lors de l'attribution des rôles.");
  }
}

// ----------------------------------------------------------------------------------------Gestion des erreurs globales--------------------------------------------------------------------------------------------------------------

client.on('error', error => {
  console.error('Erreur globale du client Discord:', error);
});

// --------------------------------------------------------------------------------------------Connexion du bot------------------------------------------------------------------------------------------------------------------

client.login(TOKEN).catch(error => {
  console.error('Erreur lors de la connexion du bot:', error);
});
