import twilio from "twilio";

let client = null;

const getClient = () => {
  if (client) return client;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error(
      "SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE in .env",
    );
  }

  client = twilio(sid, token);
  return client;
};

/*
 Sends an OTP SMS. (+91XXXXXXXXXX).
 Throws on failure; controllers wrap in try/catch.
 */
export const sendOtpSms = async (phone, otp) => {
  const fromNumber = process.env.TWILIO_PHONE;
  if (!fromNumber) {
    throw new Error("TWILIO_PHONE is not set");
  }

  const message = await getClient().messages.create({
    body: `Your Smart Parking verification code is: ${otp}. Valid for 5 minutes.`,
    from: fromNumber,
    to: phone,
  });

  console.log(`[SMS] Sent to ${phone} | sid: ${message.sid}`);
  return message;
};