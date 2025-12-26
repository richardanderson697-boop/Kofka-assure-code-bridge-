// This runs 24/7 on Railway
const { Kafka } = require('kafkajs');
const axios = require('axios'); // To talk to Vercel

const kafka = new Kafka({
  clientId: 'railway-bridge-service',
  brokers: ['switchback.proxy.rlwy.net:58989'] // Use your verified truth
});

const consumer = kafka.consumer({ groupId: 'assure-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: ['regulatory-events'], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log("Real event captured, pushing to Vercel...");
      // This sends the REAL data to your Vercel frontend
      await axios.post('https://your-assure-code.vercel.app/api/webhook', {
        data: message.value.toString()
      });
    },
  });
};

run().catch(console.error);
// In your bridge's index.js
const response = await fetch("https://assurecodes.com/api/internal/workspaces", {
  method: "GET", // Or POST depending on the action
  headers: {
    "Content-Type": "application/json",
    "X-Internal-API-Key": process.env.Assure_Co... // Pulls your key from Railway Variables
  }
});
