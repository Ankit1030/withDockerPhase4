// utils/twilio.js

const twilio = require("twilio");
const Setting = require("../models/settings"); // Adjust the path according to your project structure

async function sendSms(receiverNumber,message) {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      throw new Error("Twilio settings not found in the database");
    }

    const { twilioSid, twilioAuthToken, twilioNumber } = setting;

    const client = twilio(twilioSid, twilioAuthToken);

    const messageInstance = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: receiverNumber,
    });

    console.log(`Message sent to ${receiverNumber}`);
    return messageInstance;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    throw error;
  }
}

module.exports = {
  sendSms,
};
