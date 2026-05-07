require("dotenv").config();

const express   = require("express");
const http      = require("http");
const { Server } = require("socket.io");
const axios     = require("axios");
const FormData  = require("form-data");
const cors      = require("cors");
const mongoose  = require("mongoose");

const app    = express();
const server = http.createServer(app);

// =====================
// MIDDLEWARE
// =====================
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// =====================
// ROUTES
// =====================
app.use("/api/auth", require("./routes/authRoutes"));

// =====================
// DB
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err.message));

// =====================
// SOCKET.IO
// =====================
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// =====================
// PER-USER STATE
// =====================
const userBuffers     = new Map(); // pending audio chunks
const processingLock  = new Map(); // flush mutex
const flushIntervals  = new Map(); // periodic flush handles
const transcriptStore = new Map(); // rolling transcript text
// session_id = socket.id (stable per meeting, reused across flushes)

// =====================
// CONNECTION
// =====================
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  userBuffers.set(socket.id, []);
  processingLock.set(socket.id, false);
  transcriptStore.set(socket.id, "");

  // ── START MEETING ──────────────────────────────────────────────
  socket.on("start-meeting", () => {
    console.log("🎙 Meeting started:", socket.id);

    // Reset state
    userBuffers.set(socket.id, []);
    transcriptStore.set(socket.id, "");
    processingLock.set(socket.id, false);

    // Clear any leftover interval from a previous meeting on same socket
    clearInterval(flushIntervals.get(socket.id));

    // Periodic flush every 6 s — fixed interval, never resets on chunks
    const interval = setInterval(() => flushAudio(socket), 6000);
    flushIntervals.set(socket.id, interval);

    console.log("⏱  Flush interval started (every 6 s)");
  });

  // ── AUDIO CHUNK ────────────────────────────────────────────────
  socket.on("audio-chunk", (chunk) => {
    try {
      if (!chunk) return;

      let buffer;
      if      (Buffer.isBuffer(chunk))       buffer = chunk;
      else if (chunk instanceof ArrayBuffer) buffer = Buffer.from(chunk);
      else if (chunk?.buffer)                buffer = Buffer.from(chunk.buffer);
      else { console.log("❌ Unknown chunk type"); return; }

      if (!buffer || buffer.length === 0) return;

      const buffers = userBuffers.get(socket.id) || [];
      buffers.push(buffer);
      userBuffers.set(socket.id, buffers);

      const total = buffers.reduce((s, b) => s + b.length, 0);
      console.log(`📦 Chunk: ${buffer.length}B | Buffer total: ${total}B`);

    } catch (err) {
      console.error("❌ Chunk error:", err.message);
    }
  });

  // ── END MEETING ────────────────────────────────────────────────
  socket.on("end-meeting", async () => {
    console.log("🛑 Meeting ended:", socket.id);

    // Stop periodic flush
    clearInterval(flushIntervals.get(socket.id));
    flushIntervals.delete(socket.id);

    // Final flush
    await flushAudio(socket);

    // Tell Flask to delete the session's temp files
    await endFlaskSession(socket.id);

    // Reset local state
    transcriptStore.set(socket.id, "");
  });

  // ── DISCONNECT ─────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    clearInterval(flushIntervals.get(socket.id));

    userBuffers.delete(socket.id);
    processingLock.delete(socket.id);
    flushIntervals.delete(socket.id);
    transcriptStore.delete(socket.id);
  });
});

// =====================
// FLUSH AUDIO
// =====================
async function flushAudio(socket) {
  const sid = socket.id;

  if (processingLock.get(sid)) {
    console.log("⏳ Already processing:", sid);
    return;
  }

  const buffers = userBuffers.get(sid) || [];
  if (buffers.length === 0) return;

  const totalBytes = buffers.reduce((s, b) => s + b.length, 0);
  if (totalBytes < 1000) {
    console.log(`⚠️  Buffer too small (${totalBytes}B), skipping`);
    return;
  }

  processingLock.set(sid, true);

  try {
    // Drain buffer immediately so new chunks aren't blocked
    const merged = Buffer.concat(buffers);
    userBuffers.set(sid, []);

    console.log(`🚀 Flushing ${merged.length}B → Flask`);

    const prevTranscript = transcriptStore.get(sid) || "";
    await processAudio(merged, socket, prevTranscript);

  } catch (err) {
    console.error("❌ Flush error:", err.message);
  } finally {
    processingLock.set(sid, false);
  }
}

// =====================
// PROCESS AUDIO  →  Flask
// =====================
async function processAudio(audioBuffer, socket, prevTranscript = "") {
  try {
    const form = new FormData();

    form.append("audio", audioBuffer, {
      filename    : "meeting.webm",
      contentType : "audio/webm",
    });

    // ── KEY FIX: send socket.id as session_id ──
    // Flask uses this to append chunks to the right growing .webm file
    // so the EBML/WebM header from chunk 1 is always present.
    form.append("session_id",      socket.id);
    form.append("prev_transcript", prevTranscript);

    const response = await axios.post(
      "http://127.0.0.1:8000/stream-audio",
      form,
      { headers: form.getHeaders(), timeout: 60000 }
    );

    const newText = response.data?.transcript || "";
    const summary = response.data?.summary    || "";

    console.log(`✅ Transcript: ${newText.slice(0, 80) || "(empty)"}`);

    if (!newText) {
      console.log("⚠️  Empty transcript, skipping emit");
      return;
    }

    // Accumulate rolling transcript
    const updated = prevTranscript
      ? prevTranscript + "\n" + newText
      : newText;
    transcriptStore.set(socket.id, updated);

    socket.emit("live-transcript", { text: newText });
    socket.emit("live-summary",    { summary });

  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      console.error("❌ Flask not running on port 8000");
    } else {
      console.error("❌ AI error:", err.response?.data || err.message);
    }
  }
}

// =====================
// TELL FLASK TO CLEAN UP SESSION FILES
// =====================
async function endFlaskSession(sessionId) {
  try {
    await axios.post("http://127.0.0.1:8000/end-session", { session_id: sessionId });
    console.log("🗑️  Flask session cleaned:", sessionId);
  } catch (err) {
    console.warn("⚠️  Could not clean Flask session:", err.message);
  }
}

// =====================
// START
// =====================
server.listen(5000, () => console.log("🚀 Node server on port 5000"));