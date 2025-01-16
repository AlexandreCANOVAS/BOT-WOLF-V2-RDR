const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

const VOTE_URL = 'https://top-serveurs.net/rdr/vote/wolf-rp-v2';
const DEFAULT_IMAGE = 'https://top-serveurs.net/img/vote.png';
const CHANNEL_NAME = '『📢』𝘛𝘰𝘱-𝘴𝘦𝘳𝘷𝘦𝘶𝘳';
const ROLE_NAME = '🏠| Résident';

const getImageFromURL = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $("meta[property='og:image']").attr('content') || DEFAULT_IMAGE;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image du lien:', error);
    return DEFAULT_IMAGE;
  }
};

const createVoteEmbed = (imageURL) => {
  return new EmbedBuilder()
    .setColor('#FF4500')
    .setTitle('VOTE POUR TON TOP SERVEUR FAVORIS')
    .setDescription(
      `Vous pouvez voter pour soutenir le serveur et notre travail !\n\n` +
      `Plus nous avons de votes et plus nous avons de membres ! ❤️\n\n` +
      `Merci à vous ! 🥳\n\n` +
      `Lien pour voter : ${VOTE_URL}\n\n`
    )
    .setImage(imageURL)
    .setTimestamp();
};

const sendVoteMessage = async (client) => {
  try {
    const channel = client.channels.cache.find(ch => ch.name === CHANNEL_NAME);
    if (!channel) throw new Error(`Le salon "${CHANNEL_NAME}" n'a pas été trouvé.`);

    const role = channel.guild.roles.cache.find(r => r.name === ROLE_NAME);
    if (!role) throw new Error(`Le rôle "${ROLE_NAME}" n'a pas été trouvé.`);

    const imageURL = await getImageFromURL(VOTE_URL);
    const embed = createVoteEmbed(imageURL);

    const button = new ButtonBuilder()
      .setLabel('📋 Voter maintenant')
      .setStyle(ButtonStyle.Link)
      .setURL(VOTE_URL);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({
      content: `<@&${role.id}>`,
      embeds: [embed],
      components: [row],
      allowedMentions: { roles: [role.id] }
    });

    console.log(`Message envoyé dans le salon "${CHANNEL_NAME}".`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message de vote:', error);
  }
};

const startRecurringMessages = (client) => {
  const checkAndSendMessage = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 7 && currentHour < 22) {
      console.log('Envoi du message (entre 07h et 22h)');
      sendVoteMessage(client);
    } else {
      console.log('Pas d\'envoi de message entre 22h et 07h');
    }
  };

  checkAndSendMessage();
  setInterval(checkAndSendMessage, 2 * 60 * 60 * 1000);
};

module.exports = { sendVoteMessage, startRecurringMessages };
