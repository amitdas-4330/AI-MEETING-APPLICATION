import "../styles/recorder.css";
import { useState, useRef, useEffect } from "react";
import socket from "../socket";

function Recorder({ setTranscript, setSummary, setLoading }) {

  const [recording, setRecording]       = useState(false);
  const [seconds, setSeconds]           = useState(0);
  const [audioSources, setAudioSources] = useState({ mic: false, screen: false });

  const mediaRecorderRef = useRef(null);
  const screenStreamRef  = useRef(null);
  const micStreamRef     = useRef(null);
  const audioContextRef  = useRef(null);
  const timerRef         = useRef(null);
  const chunkTimerRef    = useRef(null);

  // SOCKET LISTENERS
  useEffect(() => {
    const handleTranscript = (data) => {
      if (data?.text) {
        setTranscript((prev) => {
          if (!prev) return data.text;
          const last = prev.split("\n").slice(-1)[0];
          if (last === data.text) return prev;
          return prev + "\n" + data.text;
        });
      }
    };

    const handleSummary = (data) => {
      if (data?.summary) setSummary(data.summary);
    };

    socket.on("live-transcript", handleTranscript);
    socket.on("live-summary", handleSummary);

    return () => {
      socket.off("live-transcript", handleTranscript);
      socket.off("live-summary", handleSummary);
    };
  }, []);

  // CLEANUP HELPER
  const cleanup = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current?.state !== "closed") {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }

    clearInterval(timerRef.current);
    clearInterval(chunkTimerRef.current);
    timerRef.current     = null;
    chunkTimerRef.current = null;
  };

  // START RECORDING
  const startRecording = async () => {
    try {
      console.log("🎯 Requesting screen + tab audio...");

      // Screen / tab audio 
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation : false,   
          noiseSuppression : false,   
          autoGainControl  : false,   
          sampleRate       : 44100,
          channelCount     : 2,       
        },
      });

      screenStreamRef.current = screenStream;

      const screenAudioTracks = screenStream.getAudioTracks();
      console.log("🖥️ Screen audio tracks:", screenAudioTracks.length);

      if (screenAudioTracks.length === 0) {
        alert("❌ No tab audio detected.\nPlease share a Chrome TAB and enable 'Share tab audio'.");
        screenStream.getTracks().forEach((t) => t.stop());
        return;
      }

      // Log what constraints were actually applied by Chrome
      const appliedConstraints = screenAudioTracks[0].getSettings();
      console.log("🎛️ Tab audio settings:", appliedConstraints);

      // Microphone
      let micStream = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation : false,  
            noiseSuppression : false,
            autoGainControl  : false,
            sampleRate       : 44100,
          },
        });
        micStreamRef.current = micStream;
        console.log("🎤 Mic tracks:", micStream.getAudioTracks().length);
        setAudioSources({ mic: true, screen: true });
      } catch (micErr) {
        console.warn("⚠️ Mic unavailable, continuing with tab audio only:", micErr.message);
        setAudioSources({ mic: false, screen: true });
      }

      // Merge tab audio + mic via AudioContext
      const audioContext  = new AudioContext({ sampleRate: 44100 });
      audioContextRef.current = audioContext;
      const destination  = audioContext.createMediaStreamDestination();

      // Connect tab/screen audio (contains all Meet participants)
      const screenSource = audioContext.createMediaStreamSource(
        new MediaStream(screenAudioTracks)
      );
      screenSource.connect(destination);

      // Connect mic (your own voice as backup / for non-Meet scenarios)
      if (micStream) {
        const micSource = audioContext.createMediaStreamSource(micStream);
        micSource.connect(destination);
      }

      // Handle user stopping screen share manually 
      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => {
          console.log("🖥️ Screen share stopped by user");
          stopRecording();
        });
      }

      // MediaRecorder on merged audio stream 
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "";

      const recorder = new MediaRecorder(
        destination.stream,
        mimeType ? { mimeType } : {}
      );

      mediaRecorderRef.current = recorder;

      recorder.onstart = () =>
        console.log("🚀 Recording started | mimeType:", recorder.mimeType);

      recorder.onerror = (e) =>
        console.error("❌ Recorder error:", e.error);

      recorder.ondataavailable = (e) => {
        if (!e.data || e.data.size === 0) return;
        console.log("📦 Chunk:", e.data.size, "bytes");
        e.data.arrayBuffer().then((buf) =>
          socket.emit("audio-chunk", new Uint8Array(buf))
        );
      };

      recorder.start();

      // One chunk every 1500ms — no timeslice in start() to avoid duplicates
      chunkTimerRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
      }, 1500);

      // UI timer
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((p) => p + 1), 1000);

      setTranscript("");
      setSummary("");
      setRecording(true);
      setLoading(true);
      socket.emit("start-meeting");

      console.log("✅ Recording started");

    } catch (err) {
      console.error("❌ Capture error:", err);
      if (err.name === "NotAllowedError") {
        alert("Permission denied.\nAllow screen share and microphone access.");
      } else {
        alert(`Recording failed: ${err.message}`);
      }
      cleanup();
      setLoading(false);
    }
  };

  // STOP RECORDING
  const stopRecording = () => {
    try {
      console.log("🛑 Stopping...");
      cleanup();
      setRecording(false);
      setSeconds(0);
      setAudioSources({ mic: false, screen: false });
      socket.emit("end-meeting");
      console.log("✅ Stopped");
    } catch (err) {
      console.error("Stop error:", err);
    } finally {
      setLoading(false);
    }
  };

  // UNMOUNT CLEANUP
  useEffect(() => () => cleanup(), []);

  // FORMAT TIMER
  const formatTime = (s) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // UI
  return (
    <div className="recorder-container">
      <div className="recorder-card">

        <h2 className="recorder-title">🎙 AI Meeting Recorder</h2>

        <p className="recorder-subtitle">
          {recording ? "🔴 Live Meeting Running..." : "Start live AI meeting"}
        </p>

        <div className="status-bar">
          <div className="status-item">⏱ {formatTime(seconds)}</div>
          <div className={`status-item ${recording ? "active" : ""}`}>
            {recording ? "LIVE" : "IDLE"}
          </div>
        </div>

        {recording && (
          <div className="audio-sources">
            <span className={`source-badge ${audioSources.screen ? "on" : "off"}`}>
              🖥️ Tab Audio: {audioSources.screen ? "ON" : "OFF"}
            </span>
            <span className={`source-badge ${audioSources.mic ? "on" : "off"}`}>
              🎤 Mic: {audioSources.mic ? "ON" : "OFF"}
            </span>
          </div>
        )}

        <div className={`mic-circle ${recording ? "active" : ""}`}>🎤</div>

        <div className="button-group">
          {!recording ? (
            <button className="start-btn" onClick={startRecording}>
              ▶ Start Live Meeting
            </button>
          ) : (
            <button className="stop-btn" onClick={stopRecording}>
              ■ End Meeting
            </button>
          )}
        </div>

        {recording && (
          <p className="recorder-hint">
            💡 Make sure you shared the <strong>Chrome tab</strong> with Google Meet
            and checked <strong>"Share tab audio"</strong>
          </p>
        )}

      </div>
    </div>
  );
}

export default Recorder;