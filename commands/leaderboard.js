const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leaderboard',
  description: 'Affiche le classement des utilisateurs',
  async execute(message, args, db) {
    try {
      const allUsers = await db.getAllUsers();
      allUsers.sort((a, b) => b.xp - a.xp);
      
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Classement des Légendes du Far West 🏆')
        .setDescription('Les 20 pionniers les plus redoutables de la frontière')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({ text: 'Que votre légende résonne à travers les plaines, cowboys !' })
        .setTimestamp();

      const medals = ['🥇', '🥈', '🥉'];
      
      for (let i = 0; i < Math.min(allUsers.length, 20); i++) {
        const user = allUsers[i];
        const member = await message.guild.members.fetch(user.user_id).catch(() => null);
        const username = member ? member.user.username : 'Pionnier Mystérieux';
        const rank = user.current_rank;
        const rankEmoji = getRankEmoji(rank);
        
        const position = i < 3 ? medals[i] : `${i + 1}.`;
        const userInfo = `${rankEmoji} **${rank}** | XP: \`${user.xp}\``;
        
        let formattedUsername = username;
        if (i < 3) {
          formattedUsername = `# ${username}`;
        }
        
        embed.addFields({
          name: `${position} ${formattedUsername}`,
          value: userInfo,
          inline: false
        });
      }

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
