const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

async function sendTicketMessage(channel) {
  // Créer un bouton moderne avec un style engageant
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Ouvrir un Ticket')
      .setStyle(ButtonStyle.Success) // Style vert pour indiquer une action positive
      .setEmoji('📩') // Emoji accrocheur
  );

  // Créer un embed moderne et immersif
  const embed = new EmbedBuilder()
    .setColor('#2ECC71') // Couleur verte moderne et agréable
    .setTitle('📨 Besoin d’aide ?')
    .setDescription(
      "Notre équipe est là pour répondre à toutes vos questions ou résoudre vos problèmes.\n\n" +
      "➡️ **Cliquez sur le bouton ci-dessous** pour ouvrir un ticket de support.\n" +
      "Nous vous répondrons dès que possible ! 😊"
    )
    .addFields(
      { name: '📋 Étapes simples', value: '1️⃣ Cliquez sur le bouton.\n2️⃣ Décrivez votre problème.\n3️⃣ Patientez, un membre du staff prendra contact avec vous.' },
     
    )
    
    .setFooter({
      text: 'Merci de faire confiance à notre équipe de support!',
     
    })
    .setTimestamp();

  // Envoi du message avec l'embed et le bouton
  await channel.send({
    embeds: [embed], // Message avec un embed immersif
    components: [row], // Envoi du bouton avec l'embed
  });
}

module.exports = { sendTicketMessage };
