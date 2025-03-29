const express = require("express");
const { WebSocketServer } = require("ws");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000; // Use Render’s dynamic port

let votes = { "1984": 0, "Brave New World": 0 };
let pollClosed = false;
let winner = null;

app.use(cors());
app.use(express.json());

// ✅ Add this to handle requests to the root URL
app.get("/", (req, res) => {
  res.send("Server is running on Render!");
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket Server should share the same HTTP server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ votes, pollClosed, winner }));

    ws.on("message", (message) => {
        const action = JSON.parse(message);
        
        if (action.type === "vote" && !pollClosed) {
            votes[action.vote]++;
        } else if (action.type === "stopPoll") {
            pollClosed = true;
            winner = votes["1984"] > votes["Brave New World"] ? "Brave New World" : "1984";
        }

        broadcast(JSON.stringify({ votes, pollClosed, winner }));
    });
});

function broadcast(data) {
    wss.clients.forEach(client => client.send(data));
}
