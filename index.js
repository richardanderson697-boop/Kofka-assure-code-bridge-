
async function startBridge() {
  try {
    // HEALTH CHECK: This will tell us if the variable is loading
    console.log("Internal Check: ", process.env.Assure_Code_Key ? "✅ Key loaded from Railway" : "❌ Key NOT found in Railway Variables");

    const response = await fetch("https://assurecodes.com/api/internal/workspaces", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-Internal-API-Key": process.env.Assure_Code_Key // Must match Railway exactly
      }
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("🚀 Connection Success! Workspaces:", data);
    } else {
      const text = await response.text();
      console.error("⚠️ Connection Blocked. Received HTML instead of Data.");
      console.log("First 50 chars of response:", text.substring(0, 50));
    }
  } catch (error) {
    console.error("💥 Critical Bridge Error:", error.message);
  }
}

startBridge();
