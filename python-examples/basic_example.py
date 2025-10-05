#!/usr/bin/env python3
"""
Basic OpenAI ChatGPT API Example
Basit ChatGPT API kullanımı örneği
"""

import os
import sys
from openai import OpenAI
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

def check_api_key():
    """API key'in varlığını kontrol et"""
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key or api_key == 'your-api-key-here':
        print("❌ HATA: API key bulunamadı veya geçersiz!")
        print("")
        print("Lütfen .env dosyasını düzenleyip OPENAI_API_KEY değerini ekleyin:")
        print("  1. nano .env")
        print("  2. OPENAI_API_KEY=sk-your-actual-key-here")
        print("  3. Dosyayı kaydet ve çık")
        print("")
        print("API key almak için: https://platform.openai.com/api-keys")
        sys.exit(1)
    
    return api_key

def chat_completion(prompt: str, model: str = "gpt-3.5-turbo") -> dict:
    """
    Basit chat completion
    
    Args:
        prompt: Kullanıcı mesajı
        model: OpenAI model ismi
        
    Returns:
        {
            'success': bool,
            'content': str,
            'error': str | None,
            'usage': dict | None
        }
    """
    try:
        # OpenAI client'ı başlat
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # API çağrısı
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Sen yardımcı bir asistansın."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Yanıtı döndür
        return {
            'success': True,
            'content': response.choices[0].message.content,
            'error': None,
            'usage': {
                'prompt_tokens': response.usage.prompt_tokens,
                'completion_tokens': response.usage.completion_tokens,
                'total_tokens': response.usage.total_tokens
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'content': None,
            'error': str(e),
            'usage': None
        }

def main():
    """Ana fonksiyon"""
    print("=" * 50)
    print("🤖 OpenAI ChatGPT API - Basit Örnek")
    print("=" * 50)
    print("")
    
    # API key kontrolü
    api_key = check_api_key()
    print("✅ API key bulundu:", api_key[:10] + "..." + api_key[-4:])
    print("")
    
    # Örnek sorular
    questions = [
        "Python nedir? Kısaca açıkla.",
        "API kullanmanın avantajları nelerdir?",
        "Yapay zeka nedir?"
    ]
    
    # Her soru için API çağrısı yap
    for i, question in enumerate(questions, 1):
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📝 Soru {i}: {question}")
        print("")
        
        result = chat_completion(question)
        
        if result['success']:
            print("🤖 Yanıt:")
            print(result['content'])
            print("")
            print(f"📊 Token kullanımı: {result['usage']['total_tokens']} tokens")
            print(f"   (Prompt: {result['usage']['prompt_tokens']}, Completion: {result['usage']['completion_tokens']})")
        else:
            print(f"❌ Hata: {result['error']}")
        
        print("")
    
    print("=" * 50)
    print("✅ Tüm örnekler tamamlandı!")
    print("=" * 50)

if __name__ == "__main__":
    main()
