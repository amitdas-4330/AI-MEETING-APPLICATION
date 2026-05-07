from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_text(text):

    if not text or len(text.strip()) < 20:
        return ""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI meeting assistant.\n"
                        "Summarize the conversation into SHORT bullet points.\n\n"
                        "Rules:\n"
                        "- Do NOT repeat sentences\n"
                        "- Do NOT rewrite full transcript\n"
                        "- Extract only key decisions, actions, and important points\n"
                        "- Keep it concise (max 5–7 bullets)\n"
                        "- Each bullet must be very short\n"
                    )
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            temperature=0.2,
            max_tokens=150
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("❌ Summary error:", str(e))
        return ""