// This wrapper function tells Node.js to allow 'await'
async function syncWithReplit() {
  try {
    console.log("Attempting to connect to Assure Code...");

    const response = await fetch("https://assurecodes.com/api/internal/workspaces", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // This pulls the key you just added to Railway Variables
        "X-Internal-API-Key": process.env.Assure_Co_Key 
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Handshake Successful! Data received:", data);
    } else {
      console.error("Handshake Failed. Status:", response.status);
    }
  } catch (error) {
    console.error("Connection Error:", error.message);
  }
}

// This line actually starts the process
syncWithReplit();
