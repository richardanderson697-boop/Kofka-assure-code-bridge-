// This 'async' wrapper fixes the "await" syntax error
async function startBridge() {
  try {
    const response = await fetch("https://assurecodes.com/api/internal/workspaces", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-API-Key": process.env.Assure_Co_Key // Ensure this name matches Railway!
      }
    });

    // Check if the response is actually JSON before parsing
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Connected! Frameworks found:", data);
    } else {
      // This part captures the HTML if you get the "Unexpected token <" error again
      const text = await response.text();
      console.error("Expected JSON but got HTML. This usually means a 404 or Login page.");
      console.log("Server response begins with:", text.substring(0, 100));
    }
  } catch (error) {
    console.error("Bridge Connection Error:", error.message);
  }
}

startBridge();
