import axios from "axios";

export const sendWhatsappOTP = async ({
  phoneNumber,
  otpCode,
}) => {
  try {
    return await axios({
      url: `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      method: "POST",

      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API}`,
        "Content-Type": "application/json",
      },

      data: {
        messaging_product: "whatsapp",

        to: phoneNumber,

        type: "template",

        template: {
          name: "otp_verification",

          language: {
            code: "id",
          },

          components: [
            {
              type: "body",

              parameters: [
                {
                  type: "text",
                  text: otpCode,
                },
              ],
            },

            /**
             * REQUIRED FOR AUTH TEMPLATE
             */
            {
              type: "button",
              sub_type: "url",
              index: "0",

              parameters: [
                {
                  type: "text",
                  text: otpCode,
                },
              ],
            },
          ],
        },
      },
    });
  } catch (error) {
    console.error(
      "Whatsapp API Error:",
      error?.response?.data || error.message,
    );

    throw error;
  }
};