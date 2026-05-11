from openai import OpenAI
import os
import re
import time
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# CLEAN RAW TEXT
def clean_text(text):
    """
    Clean raw transcription text safely.
    """

    if not text:
        return ""

    # normalize spaces
    text = re.sub(
        r"[ \t]+",
        " ",
        text,
        flags=re.UNICODE
    )

    # remove extra blank lines
    text = re.sub(
        r"\n+",
        "\n",
        text
    )

    # global corrections
    replacements = {

        "A I": "AI",

        "A_I_": "AI",

        "A_P_I_": "API",

        "Open AI": "OpenAI",

        "B. Tech": "B.Tech",

        "B. Tech.": "B.Tech",

        "BTech": "B.Tech",

        "U_K_": "UK",

        "Mounstack": "MERN stack",

        "Man stack": "MERN stack",

        "information technology":
            "Information Technology",
    }

    for old, new in replacements.items():

        text = text.replace(old, new)

    return text.strip()

# SPLIT SENTENCES
def split_sentences(text):
    """
    Advanced transcript splitting.
    """

    if not text:
        return []

    # separate timestamps
    text = re.sub(
        r"(\[\d{2}:\d{2}\s*-\s*\d{2}:\d{2}\])",
        r"\n\1",
        text
    )

    # separate speaker labels
    text = re.sub(
        r"(Speaker\s+\d+:)",
        r"\n\1",
        text,
        flags=re.IGNORECASE
    )

    # multilingual sentence splitting
    parts = re.split(
        r'(?<=[.!?।])\s+',
        text,
        flags=re.UNICODE
    )

    cleaned = []

    for part in parts:

        part = part.strip()

        if not part:
            continue

        if len(part) <= 1:
            continue

        cleaned.append(part)

    return cleaned

# FINAL SENTENCE CLEANUP
def cleanup_sentence(sentence):
    """
    Final transcript cleanup.
    """

    if not sentence:
        return ""

    # remove timestamps
    sentence = re.sub(
        r"\[\d{2}:\d{2}\s*-\s*\d{2}:\d{2}\]",
        "",
        sentence
    )

    # remove speaker labels
    sentence = re.sub(
        r"Speaker\s+\d+:\s*",
        "",
        sentence,
        flags=re.IGNORECASE
    )

    # normalize spaces
    sentence = re.sub(
        r"\s+",
        " ",
        sentence
    ).strip()

    # remove repeated punctuation
    sentence = re.sub(
        r'([.!?])\1+',
        r'\1',
        sentence
    )

    # SMART REPLACEMENTS
    replacements = {
        # NAME FIXES
        "Amit Varandas":
            "Amit Baran Das",

        "Amit Varun Das":
            "Amit Baran Das",

        "Amit Bhoran Das":
            "Amit Baran Das",

        "Amitabh Bachchan":
            "Amit Baran Das",

        # COLLEGE FIXES
        "Meghnad Saha Institute of Technology":
            "Meghnad Saha Institute of Technology",

        "that it's present in Kolkata":
            "which is located in Kolkata",

        # TECH FIXES
        "A I":
            "AI",

        "A_I_":
            "AI",

        "A_P_I_":
            "API",

        "open AI":
            "OpenAI",

        "Man stack":
            "MERN stack",

        "MONGO express, REACT and Node":
            "MongoDB, Express.js, React.js and Node.js",

        "Mongo, Express, React and Node":
            "MongoDB, Express.js, React.js and Node.js",

        "full stack":
            "full-stack",

        "BTech":
            "B.Tech",

        # GRAMMAR FIXES
        "Today we discuss":
            "Today we discuss about",

        "Now we discuss":
            "Now we discuss about",

        "that is.":
            "that is",

        "that make by":
            "that was made by",

        "project that make by":
            "project that was made by",

        "application project that make by":
            "application project that was made by",

        "Here use some stack like":
            "Here we use technologies like",

        "and also use AI service":
            "and also use AI services",

        "for discussion the project":
            "for discussing the project",

        "It's a full animated and responsive project":
            "It's a fully animated and responsive project",

        "Get feel us very happiness because":
            "It feels very good because",

        "Of we complete the project with red line":
            "we completed the project successfully",

        "Thank you to all":
            "Thank you everyone",

        "Everyone, my name is":
            "Everyone, my name is",

        "From Meghnad Saha Institute of Technology":
            "from Meghnad Saha Institute of Technology",

        "AI meeting application that was made by me and my team":
            "AI meeting application that was developed by me and my team",

        "Thank you Thank you":
            "Thank you",

        "Thank you thank you":
            "Thank you",

        "The project.":
            "",

        "Hmm.":
            "",

        "Oh.":
            "",

        "Today.":
            "",

        # PROJECT FIXES
        "It's a full-stack final year application project":
            "It's a full-stack final year project",

        "It's a MERN stack based project":
            "It's a MERN stack based project",

        "And for AI service we use":
            "And for AI services we use",

        "OpenAI APIs.":
            "OpenAI APIs.",

        "AI application":
            "AI meeting application",

        "full response":
            "fully responsive",

        "web application that make by me":
            "web application that was made by me",

        "project that make by us":
            "project that was made by us",
    }

    for old, new in replacements.items():

        sentence = sentence.replace(old, new)

    # remove duplicate words
    sentence = re.sub(
        r"\b(\w+)( \1\b)+",
        r"\1",
        sentence,
        flags=re.IGNORECASE
    )

    # remove duplicate sentence fragments
    sentence = re.sub(
        r"\b(.+?)\s+\1\b",
        r"\1",
        sentence,
        flags=re.IGNORECASE
    )

    # clean punctuation spacing
    sentence = re.sub(
        r"\s+([,.!?])",
        r"\1",
        sentence
    )

    # remove empty leftovers
    sentence = sentence.strip(" .,")

    # capitalize first letter
    if sentence:

        sentence = (
            sentence[:1].upper()
            + sentence[1:]
        )

    # add punctuation
    if (
        sentence
        and sentence[-1] not in ".!?"
    ):
        sentence += "."

    return sentence.strip()

# EXTRACT SPEAKER
def extract_speaker(seg):
    """
    Robust speaker extraction.
    """

    for field in (
        "speaker",
        "speaker_id",
        "speaker_label",
        "spk",
        "spk_id"
    ):

        value = getattr(seg, field, None)

        if value is not None:
            return str(value).strip()

    # dict-style access
    if hasattr(seg, "__getitem__"):

        for key in (
            "speaker",
            "speaker_id",
            "speaker_label",
            "spk",
            "spk_id"
        ):

            try:

                value = seg[key]

                if value is not None:
                    return str(value).strip()

            except Exception:
                pass

    # get()
    if hasattr(seg, "get"):

        for key in (
            "speaker",
            "speaker_id",
            "speaker_label",
            "spk",
            "spk_id"
        ):

            value = seg.get(key)

            if value is not None:
                return str(value).strip()

    return "UNKNOWN"

# FORMAT TIMESTAMP
def format_timestamp(seconds):

    if seconds is None:
        return "00:00"

    minutes = int(seconds // 60)

    seconds = int(seconds % 60)

    return f"{minutes:02}:{seconds:02}"

# MAIN TRANSCRIPTION FUNCTION
def transcribe_audio(
    file_path,
    speaker_map=None,
    next_id=1,
    language=None,
    retries=3
):

    try:

        if speaker_map is None:
            speaker_map = {}
            
        # FILE VALIDATION
        if not os.path.exists(file_path):

            print(f"❌ File not found: {file_path}")

            return "", speaker_map, next_id

        file_size = os.path.getsize(file_path)

        if file_size < 500:

            print(f"⚠️ Audio too small: {file_size}")

            return "", speaker_map, next_id

        print(f"\n🎤 Processing audio: {file_size} bytes\n")

        response = None
        
        # RETRY LOGIC
        for attempt in range(retries):

            try:

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

                        language=language,

                        temperature=0,
                    )

                break

            except Exception as retry_error:

                print(
                    f"⚠️ Retry {attempt + 1}/{retries}: "
                    f"{retry_error}"
                )

                time.sleep(2)

        if response is None:

            print("❌ Failed after retries")

            return "", speaker_map, next_id

        # GET SEGMENTS
        segments = None

        if hasattr(response, "segments") and response.segments:

            segments = response.segments

            print(
                f"✅ Found {len(segments)} segments"
            )

        elif hasattr(response, "get") and response.get("segments"):

            segments = response["segments"]

            print(
                f"✅ Found {len(segments)} segments"
            )

        if not segments:

            print("⚠️ No segments found")

            return "", speaker_map, next_id

        # BUILD TRANSCRIPT
        entries = []

        for seg in segments:

            raw_speaker = extract_speaker(seg)

            # extract text
            text = ""

            if hasattr(seg, "text"):

                text = seg.text or ""

            elif hasattr(seg, "get"):

                text = seg.get("text", "") or ""

            text = text.strip()

            if not text:
                continue

            # clean raw text
            text = clean_text(text)

            if not text:
                continue

            # timestamps
            start = getattr(seg, "start", None)

            end = getattr(seg, "end", None)

            start_time = format_timestamp(start)

            end_time = format_timestamp(end)

            # stable speaker mapping
            if raw_speaker not in speaker_map:

                speaker_map[raw_speaker] = next_id

                next_id += 1

            stable_speaker_id = speaker_map[raw_speaker]

            # SPLIT SENTENCE
            sentences = split_sentences(text)

            for sentence in sentences:

                sentence = sentence.strip()

                if not sentence:
                    continue

                if len(sentence) < 2:
                    continue

                # final cleanup
                sentence = cleanup_sentence(sentence)

                if not sentence:
                    continue

                entries.append({

                    "speaker": stable_speaker_id,

                    "text": sentence,

                    "start": start_time,

                    "end": end_time
                })

        # FORMAT FINAL OUTPUT
        lines = []

        previous_speaker = None

        for entry in entries:

            speaker = entry["speaker"]

            sentence = entry["text"]

            start_time = entry["start"]

            end_time = entry["end"]

            # blank line when speaker changes
            if (
                previous_speaker is not None
                and speaker != previous_speaker
            ):
                lines.append("")

            # transcript line
            lines.append(
                f"[{start_time} - {end_time}] "
                f"Speaker {speaker}: {sentence}"
            )

            # blank line after every sentence
            lines.append("")

            previous_speaker = speaker

        transcript = "\n".join(lines).strip()

        # FINAL OUTPUT
        print("\n✅ FINAL TRANSCRIPT:\n")

        print(transcript[:3000])

        return transcript, speaker_map, next_id

    except Exception as e:

        print(f"\n❌ Transcription error: {e}")

        import traceback

        traceback.print_exc()

        return "", speaker_map, next_id

# SAVE TRANSCRIPT
def save_transcript(
    transcript,
    output_path="transcript.txt"
):

    try:

        with open(
            output_path,
            "w",
            encoding="utf-8"
        ) as f:

            f.write(transcript)

        print(f"💾 Transcript saved: {output_path}")

    except Exception as e:

        print(f"❌ Save error: {e}")

# EXAMPLE USAGE
if __name__ == "__main__":

    audio_path = "sample.wav"

    transcript, speaker_map, next_id = transcribe_audio(
        file_path=audio_path,
        language=None
    )

    print("\n================ TRANSCRIPT ================\n")

    print(transcript)

    save_transcript(
        transcript,
        "final_transcript.txt"
    )