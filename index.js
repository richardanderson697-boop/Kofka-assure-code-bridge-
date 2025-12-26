
async function startBridge() {
  const url = "https://spec-swiftly--richardanders21.replit.app/api/internal/workspaces";
  
  try {
    console.log("Internal Check: ✅ Key loaded from Railway");

    const response = await fetch(url, {
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
      console.error("⚠️ Connection Blocked. Replit returned an error.");
    }
  } catch (error) {
    console.error("💥 Bridge Error:", error.message);
  }
}

startBridge();
