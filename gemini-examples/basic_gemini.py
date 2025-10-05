#!/usr/bin/env python3
"""
Basic Google Gemini API Example
Basit Gemini API kullanımı örneği
"""

import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

def check_api_key():
    """API key'in varlığını kontrol et"""
    # Her iki environment variable'ı da kontrol et
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    
    if not api_key or api_key == 'your-api-key-here':
        print("❌ HATA: API key bulunamadı veya geçersiz!")
        print("")
        print("Lütfen .env dosyasını düzenleyip API key'inizi ekleyin:")
        print("  1. nano .env")
        print("  2. GEMINI_API_KEY=AIzaYour-actual-key-here")
        print("  3. Dosyayı kaydet ve çık")
        print("")
        print("API key almak için: https://makersuite.google.com/app/apikey")
        sys.exit(1)
    
    return api_key

def generate_text(prompt: str, model_name: str = "gemini-pro") -> dict:
    """
    Basit text generation
    
    Args:
        prompt: Kullanıcı mesajı
        model_name: Gemini model ismi
        
    Returns:
        {
            'success': bool,
            'text': str,
            'error': str | None
        }
    """
    try:
        # Model'i başlat
        model = genai.GenerativeModel(model_name)
        
        # Content generate et
        response = model.generate_content(prompt)
        
        return {
            'success': True,
            'text': response.text,
            'error': None
        }
        
    except Exception as e:
        return {
            'success': False,
            'text': None,
            'error': str(e)
        }

def main():
    """Ana fonksiyon"""
    print("=" * 50)
    print("🌟 Google Gemini API - Basit Örnek")
    print("=" * 50)
    print("")
    
    # API key kontrolü
    api_key = check_api_key()
    print("✅ API key bulundu:", api_key[:10] + "..." + api_key[-4:])
    
    # API'yi yapılandır
    genai.configure(api_key=api_key)
    print("")
    
    # Örnek sorular
    questions = [
        "Python nedir? Kısaca açıkla.",
        "Google Gemini API'nin avantajları nelerdir?",
        "Yapay zeka geleceği nasıl şekillendirecek?"
    ]
    
    # Her soru için API çağrısı yap
    for i, question in enumerate(questions, 1):
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📝 Soru {i}: {question}")
        print("")
        
        result = generate_text(question)
        
        if result['success']:
            print("🌟 Gemini:")
            print(result['text'])
        else:
            print(f"❌ Hata: {result['error']}")
        
        print("")
    
    print("=" * 50)
    print("✅ Tüm örnekler tamamlandı!")
    print("=" * 50)

if __name__ == "__main__":
    main()
