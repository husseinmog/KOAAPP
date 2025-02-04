const axios = require("axios");
const { APIClient, SendEmailRequest } = require("customerio-node");
require("dotenv").config();

// const CUSTOMER_IO_TRACK_API_URL = "https://track.customer.io/api/v1/send/email";
const CUSTOMER_IO_API_URL = "https://api.customer.io/v1/send/email";

// const SITE_ID = process.env.CUSTOMER_IO_SITE_ID;
// const API_KEY = process.env.CUSTOMER_IO_API_KEY;
const APP_API_KEY = process.env.CUSTOMER_IO_APP_API_KEY;
const TRANSACTIONAL_MESSAGE_ID = process.env.TRANSACTIONAL_MESSAGE_ID;
const FROM_EMAIL = process.env.FROM_EMAIL;

const client = new APIClient(APP_API_KEY);

async function sendEmail(to, subject, body) {
  try {
    const request = new SendEmailRequest({
      transactional_message_id: TRANSACTIONAL_MESSAGE_ID, // Email template ID from Customer.io
      identifiers: { id: to }, // Unique user identifier (email or customer ID)
      to: to, // Recipient email
      from: FROM_EMAIL, // Sender's email
      subject: subject,
      body: body, // Email content
    });

    const response = await client.sendEmail(request);
    console.log("Email sent successfully:", response);
    return response;
  } catch (err) {
    console.error("Error sending email:", err.statusCode, err.message);
    throw new Error("Failed to send email");
  }
}
// Function to send an email via Customer.io
// async function sendEmail(to, subject, body) {
//   try {
//     const response = await axios.post(
//       CUSTOMER_IO_API_URL,
//       {
//         transactional_message_id: "2",
//         to: to,
//         subject: subject,
//         body: body,
//       },
//       {
//         auth: {
//           //   username: SITE_ID,
//           //   password: API_KEY,
//         },
//         headers: {
//           Authorization: `Bearer ${APP_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("Email sent successfully:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error sending email:",
//       error.response?.data || error.message
//     );
//     throw new Error("Failed to send email");
//   }
// }

module.exports = sendEmail;
