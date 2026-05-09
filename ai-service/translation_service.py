from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def translate_text(text, target="English"):

    try:
        if not text or not text.strip():
            return ""

        if target.lower() == "english":
            latin_ratio = sum(1 for c in text if c.isascii() and c.isalpha()) / max(len(text), 1)
            if latin_ratio > 0.85:
                print("⚠️ Text already appears to be English, skipping translation")
                return text.strip()

        print(f"🌐 Translating to {target}: {text[:80]}")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a professional translator. "
                        f"Translate the following text into {target}. "
                        f"Return only the translated text — no explanations, "
                        f"no notes, no quotation marks."
                    )
                },
                {
                    "role": "user",
                    "content": text.strip()
                }
            ],
            temperature=0.3,
            max_tokens=1024, 
        )

        result = response.choices[0].message.content.strip()
        print(f"✅ Translated: {result[:100]}")
        return result

    except Exception as e:
        print(f"❌ Translation error: {e}")
        return ""