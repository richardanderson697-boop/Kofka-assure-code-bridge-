
async function startBridge() {
  const domain = "https://spec-swiftly--richardanders21.replit.app";
  // Try changing this to "/" just to see the connection go GREEN
  const path = "/api/internal/workspaces"; 
  
  try {
    console.log(`📡 Connecting to: ${domain}${path}`);

    const response = await fetch(`${domain}${path}`, {
      method: "GET",
      headers: {
        "X-Internal-API-Key": process.env.Assure_Code_Key 
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.status === 200) {
      console.log("🚀 SUCCESS! The Bridge is officially Open.");
    } else if (response.status === 404) {
      console.log("❌ Connection worked, but the PATH is wrong. Check your Replit code.");
    }
  } catch (error) {
    console.error("💥 Network Error:", error.message);
  }
}

startBridge();
