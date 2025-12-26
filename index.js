
async function startBridge() {
  // Try changing this path to match your Replit route exactly
  const path = "/api/internal/workspaces"; 
  const domain = "https://spec-swiftly--richardanders21.replit.app";
  
  try {
    console.log(`Checking Path: ${domain}${path}`);

    const response = await fetch(`${domain}${path}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-Internal-API-Key": process.env.Assure_Code_Key 
      }
    });

    console.log(`Result: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log("🚀 SUCCESS! Data received:", data);
    } else {
      console.log("❌ The path exists, but Replit said No (check your API key).");
    }
  } catch (error) {
    console.error("💥 Network Error:", error.message);
  }
}

startBridge();
