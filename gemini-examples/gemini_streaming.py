#!/usr/bin/env python3
"""
Gemini Streaming Example
Real-time streaming responses
"""

import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def check_and_configure_api():
    """API key'i kontrol et ve yapılandır"""
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    
    if not api_key or api_key == 'your-api-key-here':
        print("❌ HATA: Geçerli bir API key bulunamadı!")
        sys.exit(1)
    
    genai.configure(api_key=api_key)
    return api_key

def stream_generate(prompt: str, model_name: str = "gemini-pro"):
    """
    Streaming ile yanıt al (kelime kelime)
    """
    try:
        model = genai.GenerativeModel(model_name)
        
        print("🌟 Gemini (streaming): ", end="", flush=True)
        
        # Stream=True ile generate
        response = model.generate_content(prompt, stream=True)
        
        # Her chunk'ı yazdır
        for chunk in response:
            print(chunk.text, end="", flush=True)
        
        print("\n")  # Yeni satır
        
    except Exception as e:
        print(f"\n❌ Hata: {str(e)}")

def main():
    """Ana fonksiyon"""
    print("=" * 60)
    print("🌟 Google Gemini - Streaming Example")
    print("=" * 60)
    print("")
    
    # API'yi yapılandır
    api_key = check_and_configure_api()
    print("✅ API key yapılandırıldı")
    print("")
    
    # Örnek prompts
    prompts = [
        "Kısa bir hikaye yaz (3 paragraf).",
        "Python programlama dilinin tarihçesi nedir?",
        "Yapay zeka ve makine öğrenmesi arasındaki fark nedir?"
    ]
    
    for i, prompt in enumerate(prompts, 1):
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📝 Soru {i}: {prompt}")
        print("")
        
        stream_generate(prompt)
    
    print("=" * 60)
    print("✅ Tüm streaming örnekleri tamamlandı!")
    print("=" * 60)

if __name__ == "__main__":
    main()
