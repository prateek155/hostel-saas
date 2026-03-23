import axios from "axios";

const sendWhatsApp = async (phone, message) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WA_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: message
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WA_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error(
      "WhatsApp send failed:",
      error.response?.data || error.message
    );
  }
};

export default sendWhatsApp;
