
const { Kafka } = require('kafkajs');

// 1. Initialize Kafka Producer
const kafka = new Kafka({
  clientId: 'replit-to-kafka-bridge',
  brokers: [process.env.KAFKA_BROKER], // e.g., 'your-broker:9092'
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_KEY,
    password: process.env.KAFKA_SECRET
  },
});

const producer = kafka.producer();

async function startBridge() {
  const replitUrl = "https://spec-swiftly--richardanders21.replit.app/api/internal/workspaces";
  
  try {
    console.log("Connecting to Kafka...");
    await producer.connect();
    console.log("✅ Kafka Connected");

    console.log("Fetching specs from Replit...");
    const response = await fetch(replitUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-Internal-API-Key": process.env.Assure_Code_Key 
      }
    });

    if (response.ok) {
      const workspaceData = await response.json();
      console.log("✅ Data received from Replit");

      // 2. Produce Message to Kafka
      await producer.send({
        topic: 'workspace-specs', // Ensure this topic exists in your Kafka
        messages: [
          { 
            key: 'workspace-update', 
            value: JSON.stringify(workspaceData) 
          }
        ],
      });

      console.log("🚀 SUCCESS: Specs pushed to Kafka Go!");
    } else {
      console.error(`❌ Replit Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("💥 Bridge Failure:", error.message);
  } finally {
    // Optional: Keep the bridge alive or disconnect
    // await producer.disconnect(); 
  }
}

startBridge();
