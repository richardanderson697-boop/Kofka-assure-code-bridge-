async function startBridge() {
  const url = "https://spec-swiftly--richardanders21.replit.app/api/internal/workspaces";
  
  try {
    console.log("Internal Check: ✅ Key loaded from Railway");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (RailwayBridge/1.0)",
        "X-Internal-API-Key": process.env.Assure_Code_Key 
      }
    });

    console.log(`Status Code: ${response.status} (${response.statusText})`);

    if (response.ok) {
      const data = await response.json();
      console.log("🚀 Connection Success!", data);
    } else {
      const errorText = await response.text();
      console.error("⚠️ Replit rejected the request.");
      console.log("Reason:", errorText.substring(0, 100));
    }
  } catch (error) {
    console.error("💥 Bridge Error:", error.message);
  }
}

startBridge();
