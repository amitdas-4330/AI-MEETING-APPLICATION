# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import tempfile
import threading

from whisper_service import transcribe_audio
from summary_service import summarize_text

app = Flask(__name__)
CORS(app)

WAV_BYTES_PER_SECOND = 32_000
WAV_HEADER_SIZE      = 44

sessions      = {}
sessions_lock = threading.Lock()


# =========================================================
# SESSION
# =========================================================

def get_session(session_id):

    with sessions_lock:

        if session_id not in sessions:

            tmp = tempfile.gettempdir()

            sessions[session_id] = {

                "webm_path":
                    os.path.join(
                        tmp,
                        f"sess_{session_id}.webm"
                    ),

                "full_wav_path":
                    os.path.join(
                        tmp,
                        f"sess_{session_id}_full.wav"
                    ),

                "prev_pcm_bytes": 0,

                # stable speaker mapping
                "speaker_map": {},

                "next_speaker_id": 1,

                "lock": threading.Lock(),
            }

        return sessions[session_id]


# =========================================================
# CLEANUP
# =========================================================

def cleanup_session(session_id):

    with sessions_lock:
        sess = sessions.pop(session_id, None)

    if sess:

        for path in [
            sess["webm_path"],
            sess["full_wav_path"]
        ]:

            try:
                if os.path.exists(path):
                    os.remove(path)
                    print(f"🗑️ Removed: {path}")

            except Exception:
                pass


# =========================================================
# FFMPEG
# =========================================================

def run_ffmpeg(args):

    result = subprocess.run(
        ["ffmpeg", "-y"] + args,
        capture_output=True,
        text=True
    )

    return result.returncode, result.stderr


# =========================================================
# STREAM AUDIO
# =========================================================

@app.route("/stream-audio", methods=["POST"])
def stream_audio():

    audio = request.files.get("audio")

    session_id = request.form.get(
        "session_id",
        "default"
    )

    prev_transcript = request.form.get(
        "prev_transcript",
        ""
    )

    if not audio:
        return jsonify({
            "transcript": "",
            "summary": "",
            "error": "No audio"
        }), 400

    sess = get_session(session_id)

    with sess["lock"]:

        try:

            # =================================================
            # APPEND WEBM CHUNK
            # =================================================

            chunk_data = audio.read()

            print(
                f"📥 [{session_id[:8]}] "
                f"chunk={len(chunk_data)}B"
            )

            with open(sess["webm_path"], "ab") as f:
                f.write(chunk_data)

            # =================================================
            # FULL WEBM -> FULL WAV
            # =================================================

            rc, stderr = run_ffmpeg([

                "-fflags", "+genpts+igndts",

                "-i",
                sess["webm_path"],

                "-vn",

                "-ar", "16000",

                "-ac", "1",

                "-c:a", "pcm_s16le",

                sess["full_wav_path"],
            ])

            if rc != 0:
                print(f"⚠️ ffmpeg decode error: {stderr[-200:]}")

            if not os.path.exists(sess["full_wav_path"]):
                return jsonify({
                    "transcript": "",
                    "summary": ""
                })

            # =================================================
            # CALCULATE NEW AUDIO
            # =================================================

            wav_size = os.path.getsize(
                sess["full_wav_path"]
            )

            total_pcm = max(
                wav_size - WAV_HEADER_SIZE,
                0
            )

            prev_pcm = sess["prev_pcm_bytes"]

            new_pcm = total_pcm - prev_pcm

            prev_secs = prev_pcm / WAV_BYTES_PER_SECOND

            new_secs = new_pcm / WAV_BYTES_PER_SECOND

            total_secs = total_pcm / WAV_BYTES_PER_SECOND

            print(
                f"⏱ [{session_id[:8]}] "
                f"total={total_secs:.1f}s "
                f"new={new_secs:.1f}s"
            )

            if new_secs < 1.0:

                print(
                    f"⚠️ [{session_id[:8]}] "
                    f"Less than 1 second audio"
                )

                return jsonify({
                    "transcript": "",
                    "summary": ""
                })

            # =================================================
            # CREATE NEW AUDIO SLICE
            # =================================================

            tmp = tempfile.gettempdir()

            slice_path = os.path.join(
                tmp,
                f"slice_{session_id[:8]}_{int(prev_secs)}.wav"
            )

            rc, stderr = run_ffmpeg([

                "-i",
                sess["full_wav_path"],

                "-ss",
                f"{prev_secs:.6f}",

                "-t",
                f"{new_secs:.6f}",

                "-c:a",
                "copy",

                slice_path,
            ])

            if rc != 0:
                print(f"⚠️ ffmpeg slice error: {stderr[-200:]}")

            if (
                not os.path.exists(slice_path)
                or os.path.getsize(slice_path) < 500
            ):

                print(
                    f"⚠️ [{session_id[:8]}] "
                    f"Slice too small"
                )

                return jsonify({
                    "transcript": "",
                    "summary": ""
                })

            print(
                f"🆕 [{session_id[:8]}] "
                f"slice={os.path.getsize(slice_path)}B"
            )

            # update processed pcm
            sess["prev_pcm_bytes"] = total_pcm

            # =================================================
            # TRANSCRIBE WITH DIARIZATION
            # =================================================

            transcript, updated_map, next_id = transcribe_audio(

                slice_path,

                sess["speaker_map"],

                sess["next_speaker_id"]
            )

            sess["speaker_map"] = updated_map

            sess["next_speaker_id"] = next_id

            print(
                f"📝 [{session_id[:8]}]\n"
                f"{transcript[:300] if transcript else '(empty)'}"
            )

            # remove slice
            try:
                os.remove(slice_path)
            except Exception:
                pass

            if not transcript.strip():
                return jsonify({
                    "transcript": "",
                    "summary": ""
                })

            # =================================================
            # SUMMARY
            # =================================================

            full_context = (

                (prev_transcript + "\n" + transcript).strip()

                if prev_transcript

                else transcript
            )

            summary = summarize_text(full_context)

            # =================================================
            # RESPONSE
            # =================================================

            return jsonify({

                "transcript":
                    transcript.strip(),

                "summary":
                    summary,
            })

        except Exception as e:

            print(f"🔥 [{session_id[:8]}] {e}")

            import traceback
            traceback.print_exc()

            return jsonify({
                "transcript": "",
                "summary": "",
                "error": str(e)
            })


# =========================================================
# END SESSION
# =========================================================

@app.route("/end-session", methods=["POST"])
def end_session():

    data = request.get_json(silent=True) or {}

    session_id = data.get("session_id", "")

    if session_id:

        cleanup_session(session_id)

        print(
            f"✅ Session cleaned: "
            f"{session_id[:8]}"
        )

    return jsonify({
        "ok": True
    })


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        port=8000,
        debug=True,
        threaded=True
    )