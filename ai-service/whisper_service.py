# whisper_service.py

from openai import OpenAI
import os
import re
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def clean_text(text):
    """
    Clean transcription text.
    """

    # remove extra spaces
    text = re.sub(r"\s+", " ", text)

    # fix broken tech words
    text = text.replace("A I", "AI")
    text = text.replace("A_I_", "AI")
    text = text.replace("B. Tech", "BTech")
    text = text.replace("B. Tech.", "BTech")
    text = text.replace("information technology", "Information Technology")

    # remove repeated words
    text = re.sub(r"\b(\w+)( \1\b)+", r"\1", text)

    return text.strip()


def split_sentences(text):
    """
    Better sentence splitting.
    """

    parts = re.split(r'(?<=[.!?])\s+', text)

    cleaned = []

    for part in parts:

        part = part.strip()

        if not part:
            continue

        if len(part) <= 2:
            continue

        cleaned.append(part)

    return cleaned


def extract_speaker(seg):
    """
    Robustly extract speaker label from a segment.
    Tries multiple known field names used by OpenAI diarization.
    """

    # Try common attribute names
    for field in ("speaker", "speaker_id", "speaker_label", "spk", "spk_id"):
        value = getattr(seg, field, None)
        if value is not None:
            return str(value).strip()

    # Try dict-style access (in case seg is a dict or dict-like)
    if hasattr(seg, "__getitem__"):
        for key in ("speaker", "speaker_id", "speaker_label", "spk", "spk_id"):
            try:
                value = seg[key]
                if value is not None:
                    return str(value).strip()
            except (KeyError, TypeError):
                pass

    # Try seg.get() for dict-like objects
    if hasattr(seg, "get"):
        for key in ("speaker", "speaker_id", "speaker_label", "spk", "spk_id"):
            value = seg.get(key)
            if value is not None:
                return str(value).strip()

    return "UNKNOWN"


def transcribe_audio(file_path, speaker_map=None, next_id=1):

    try:

        # =====================================
        # INIT
        # =====================================

        if speaker_map is None:
            speaker_map = {}

        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return "", speaker_map, next_id

        file_size = os.path.getsize(file_path)

        if file_size < 500:
            print(f"⚠️ Audio too small: {file_size}")
            return "", speaker_map, next_id

        print(f"🎤 Processing audio: {file_size} bytes")

        # =====================================
        # OPENAI TRANSCRIPTION
        # =====================================

        with open(file_path, "rb") as audio:

            response = client.audio.transcriptions.create(

                model="gpt-4o-transcribe-diarize",

                file=(
                    os.path.basename(file_path),
                    audio,
                    "audio/wav"
                ),

                response_format="diarized_json",

                chunking_strategy="auto",
            )

        # =====================================
        # DEBUG: inspect raw response structure
        # =====================================

        print("\n🔍 DEBUG — raw response type:", type(response))

        segments = None

        # Try .segments attribute first
        if hasattr(response, "segments") and response.segments:
            segments = response.segments
            print(f"✅ Found {len(segments)} segments via .segments")

        # Fallback: dict-style
        elif hasattr(response, "get") and response.get("segments"):
            segments = response["segments"]
            print(f"✅ Found {len(segments)} segments via dict key")

        if not segments:
            print("⚠️ No segments found in response")
            print("   Raw response dump:", vars(response) if hasattr(response, "__dict__") else response)
            return "", speaker_map, next_id

        # Print first segment to understand its structure
        first_seg = segments[0]
        print("\n🔍 DEBUG — first segment type:", type(first_seg))
        if hasattr(first_seg, "__dict__"):
            print("   First segment fields:", vars(first_seg))
        elif hasattr(first_seg, "keys"):
            print("   First segment keys:", list(first_seg.keys()))

        # =====================================
        # BUILD TRANSCRIPT
        # =====================================

        # Collect all (stable_speaker_id, sentence) pairs first
        entries = []

        for seg in segments:

            raw_speaker = extract_speaker(seg)

            text = ""
            if hasattr(seg, "text"):
                text = seg.text or ""
            elif hasattr(seg, "get"):
                text = seg.get("text", "") or ""

            text = text.strip()

            if not text:
                continue

            # Clean text
            text = clean_text(text)

            if not text:
                continue

            # Assign stable speaker ID
            if raw_speaker not in speaker_map:
                speaker_map[raw_speaker] = next_id
                next_id += 1

            stable_speaker_id = speaker_map[raw_speaker]

            # Split into sentences
            sentences = split_sentences(text)

            for sentence in sentences:

                sentence = sentence.strip()

                if not sentence or len(sentence) < 3:
                    continue

                entries.append((stable_speaker_id, sentence))

        # =====================================
        # FORMAT OUTPUT
        # Goal:
        #   Speaker 1: Hello there.
        #   Speaker 1: How are you?
        #
        #   Speaker 2: I am doing well.
        #
        #   Speaker 1: Great!
        # =====================================

        lines = []
        previous_speaker_id = None

        for stable_speaker_id, sentence in entries:

            # Add a blank line whenever the speaker changes
            if previous_speaker_id is not None and stable_speaker_id != previous_speaker_id:
                lines.append("")

            lines.append(f"Speaker {stable_speaker_id}: {sentence}")

            previous_speaker_id = stable_speaker_id

        # =====================================
        # FINAL OUTPUT
        # =====================================

        transcript = "\n".join(lines)

        print("\n✅ FINAL TRANSCRIPT:\n")
        print(transcript[:2000])

        return transcript, speaker_map, next_id

    except Exception as e:

        print(f"❌ Transcription error: {e}")
        import traceback
        traceback.print_exc()

        return "", speaker_map, next_id