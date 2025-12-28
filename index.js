
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'assure-code-bridge',
  brokers: [process.env.KAFKA_BROKERS || 'kafka.railway.internal:9092'],
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_SASL_USERNAME || 'kafka',
    password: process.env.KAFKA_SASL_PASSWORD
  },
  // Increased retry attempts for connection stability
  retry: {
    initialRetryTime: 1000,
    retries: 50 
  }
});

const consumer = kafka.consumer({ 
  groupId: process.env.KAFKA_GROUP_ID || 'assure-code-bridge'
});

const producer = kafka.producer();

async function startBridge() {
  const assureCodeUrl = process.env.ASSURE_CODE_URL || "https://spec-swiftly-richardanders21.replit.app";
  const assureCodeKey = process.env.Assure_Code_Key;
  
  // INFINITE LOOP: This prevents the bridge from ever fully "crashing"
  while (true) {
    try {
      console.log("🔗 Attempting to connect to Kafka...");
      await consumer.connect();
      await producer.connect();
      console.log("✅ Kafka Connected (Consumer + Producer)");

      await consumer.subscribe({ 
        topic: process.env.KAFKA_TOPIC || 'regulatory-events',
        fromBeginning: false 
      });

      console.log("👂 Listening for regulatory events...");
      
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = JSON.parse(message.value.toString());
            console.log("📨 Received event:", event.event_id);

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
              if (result.updatedSpecs || result.github_pr_url) {
                await producer.send({
                  topic: 'spec-updates',
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
                console.log("✅ Specs published to Kafka");
              }
            } else {
              console.error(`❌ API Error: ${response.status}`);
            }
          } catch (error) {
            console.error("⚠️ processing error:", error.message);
          }
        },
      });

      // Keep the connection alive
      await new Promise(() => {}); 

    } catch (error) {
      console.error("⏳ Kafka is unavailable. Retrying in 10 seconds...", error.message);
      // Wait before trying to reconnect
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// Graceful Shutdown
const shutdown = async () => {
  console.log('🛑 Shutting down...');
  try {
    await consumer.disconnect();
    await producer.disconnect();
  } catch (e) {}
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log("🚀 Starting Persistent Bridge...");
startBridge();
