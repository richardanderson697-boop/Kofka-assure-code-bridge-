
const { Kafka } = require('kafkajs');

// Initialize Kafka with both Consumer and Producer
const kafka = new Kafka({
  clientId: 'assure-code-bridge',
  brokers: [process.env.KAFKA_BROKERS || 'kafka.railway.internal:9092'],
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_SASL_USERNAME || 'kafka',
    password: process.env.KAFKA_SASL_PASSWORD
  },
});

const consumer = kafka.consumer({ 
  groupId: process.env.KAFKA_GROUP_ID || 'assure-code-bridge'
});

const producer = kafka.producer();

async function startBridge() {
  const assureCodeUrl = process.env.ASSURE_CODE_URL || "https://spec-swiftly-richardanders21.replit.app";
  const assureCodeKey = process.env.Assure_Code_Key;
  
  try {
    // Connect both consumer and producer
    console.log("🔗 Connecting to Kafka...");
    await consumer.connect();
    await producer.connect();
    console.log("✅ Kafka Connected (Consumer + Producer)");

    console.log("📡 Subscribing to regulatory-events topic...");
    await consumer.subscribe({ 
      topic: process.env.KAFKA_TOPIC || 'regulatory-events',
      fromBeginning: false 
    });

    console.log("👂 Listening for regulatory events...");
    
    // Keep running forever, consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log("📨 Received regulatory event:", event.event_id);

          // Forward to ASSURE-CODE
          console.log("➡️  Forwarding to ASSURE-CODE...");
          const response = await fetch(`${assureCodeUrl}/api/webhook/regulatory-event`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Internal-API-Key": assureCodeKey
            },
            body: JSON.stringify(event)
          });

          if (response.ok) {
            const result = await response.json();
            console.log("✅ Event processed by ASSURE-CODE");

            // If ASSURE-CODE returned updated specs, publish back to Kafka
            if (result.updatedSpecs || result.github_pr_url) {
              console.log("📤 Publishing updated specs back to Kafka...");
              
              await producer.send({
                topic: 'spec-updates', // New topic for spec updates
                messages: [{
                  key: event.event_id,
                  value: JSON.stringify({
                    event_id: event.event_id,
                    workspace_id: result.workspace_id,
                    updated_specs: result.updatedSpecs,
                    github_pr_url: result.github_pr_url,
                    timestamp: new Date().toISOString()
                  })
                }]
              });
              
              console.log("✅ Specs published to Kafka (spec-updates topic)");
            }
          } else {
            console.error(`❌ ASSURE-CODE Error: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error("💥 Message processing error:", error.message);
        }
      },
    });

  } catch (error) {
    console.error("💥 Bridge Failure:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await consumer.disconnect();
  await producer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await consumer.disconnect();
  await producer.disconnect();
  process.exit(0);
});

console.log("🚀 Starting Bidirectional ASSURE-CODE Bridge...");
startBridge();
