const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leaderboard',
  description: 'Affiche le classement des légendes du Far West',
  async execute(message, args, db) {
    try {
      const allUsers = await db.getAllUsers();
      allUsers.sort((a, b) => b.xp - a.xp);
      
      const embed = new EmbedBuilder()
        .setColor('#B8860B')
        .setTitle('🌟 Les Légendes Vivantes du Far West 🌟')
        .setDescription('Les 10 pionniers dont les exploits résonnent à travers les plaines')
        .setFooter({ text: '🤠 Que vos noms soient gravés dans l\'histoire de l\'Ouest, intrépides aventuriers !' })
        .setTimestamp();

      const medals = ['🥇', '🥈', '🥉'];
      let leaderboardText = '';
      
      for (let i = 0; i < Math.min(allUsers.length, 10); i++) {
        const user = allUsers[i];
        const member = await message.guild.members.fetch(user.user_id).catch(() => null);
        const username = member ? member.user.username : 'Pionnier Mystérieux';
        const rank = user.current_rank;
        const rankEmoji = getRankEmoji(rank);
        
        const position = i < 3 ? medals[i] : `${i + 1}.`;
        const userInfo = `${rankEmoji} **${rank}**\nXP: \`${user.xp}\``;
        
        let formattedUsername = username;
        if (i < 3) {
          formattedUsername = `**${username}**`;
        }
        
        leaderboardText += `${position} ${formattedUsername}\n${userInfo}\n${'─'.repeat(20)}\n\n`;
      }

      embed.addFields({ name: '\u200b\n🏆 TABLEAU D\'HONNEUR 🏆\n\u200b', value: leaderboardText });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la création du classement:', error);
      message.reply('Une erreur est survenue lors de la création du classement. Les bandits ont peut-être volé nos registres !');
    }
  },
};

function getRankEmoji(rank) {
  const rankEmojis = {
    "Vagabond": "🌱",
    "Débrouillard": "🔧",
    "Cow-Boy": "🤠",
    "Justicier": "⚖️",
    "Vétéran": "🎖️",
    "Seigneur des frontières": "🏞️",
    "Pistolero": "🔫",
    "Régent des Plaines": "👑",
    "Légende de l'Ouest": "🌟",
    "Mythe Vivant": "🏆"
  };
  return rankEmojis[rank] || "🔹";
}
