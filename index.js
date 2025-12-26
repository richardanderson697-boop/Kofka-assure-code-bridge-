
async function startBridge() {
  try {
    // This confirms the bridge sees your Railway Variable
    console.log("Internal Check: ", process.env.Assure_Code_Key ? "✅ Key loaded from Railway" : "❌ Key NOT found in Railway Variables");

    const response = await fetch("https://spec-swiftly--richardanders21.rpl.co/api/internal/workspaces", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-Internal-API-Key": process.env.Assure_Code_Key 
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("🚀 Connection Success! Workspaces found:", data);
    } else {
      const text = await response.text();
      console.error("⚠️ Connection Blocked. Received HTML instead of Data.");
      console.log("Server response starts with:", text.substring(0, 50));
    }
  } catch (error) {
    console.error("💥 Bridge Error:", error.message);
  }
}

startBridge();
