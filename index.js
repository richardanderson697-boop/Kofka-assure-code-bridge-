
// This 'async' wrapper fixes the "await" syntax error
async function startBridge() {
  try {
    const response = await fetch("https://assurecodes.com/api/internal/workspaces", {
      method: "GET",
      headers: {
        "Accept": "application/json", // Explicitly ask for JSON
        "X-Internal-API-Key": process.env.Assure_Co_Key // Matches your Railway Variable
      }
    });

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Connected! Frameworks found:", data);
    } else {
      // If we got HTML (starts with '<'), log the first bit to see what it is
      const text = await response.text();
      console.error("Expected JSON but got HTML. This often means a 404 or Auth error.");
      console.log("Response starts with:", text.substring(0, 100));
    }
  } catch (error) {
    console.error("Bridge Connection Error:", error.message);
  }
}

startBridge();
