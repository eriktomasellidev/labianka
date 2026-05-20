// El número de WhatsApp proporcionado por el usuario
const WHATSAPP_NUMBER = '5493512022613';

export const generateWhatsAppLink = (cartItems, total) => {
  let message = `¡Hola La Bianka! 🌸\nMe gustaría realizar el siguiente pedido:\n\n`;

  cartItems.forEach((item) => {
    let variantInfo = '';
    if (item.selectedSize || item.selectedColor) {
      const parts = [];
      if (item.selectedSize) parts.push(`Talle: ${item.selectedSize}`);
      if (item.selectedColor) parts.push(`Color: ${item.selectedColor}`);
      variantInfo = ` (${parts.join(', ')})`;
    }
    message += `- ${item.quantity}x ${item.name}${variantInfo} ($${item.price * item.quantity})\n`;
  });

  message += `\n*Total estimado: $${total}*\n\n`;
  message += `Por favor indíquenme cómo coordinamos el pago y la entrega. ¡Muchas gracias! ✨`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};
