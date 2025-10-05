#!/usr/bin/env python3
"""
Interactive Gemini Chat Console
İnteraktif Gemini konsol uygulaması
"""

import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

class GeminiChat:
    def __init__(self, model_name: str = "gemini-pro"):
        """GeminiChat'i başlat"""
        self.model_name = model_name
        self.model = None
        self.chat = None
        
    def initialize(self):
        """API client'ı başlat"""
        # Her iki environment variable'ı da kontrol et
        api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        
        if not api_key or api_key == 'your-api-key-here':
            print("❌ HATA: Geçerli bir API key bulunamadı!")
            print("Lütfen .env dosyasını düzenleyip API key'inizi ekleyin.")
            print("API key almak için: https://makersuite.google.com/app/apikey")
            sys.exit(1)
        
        # API'yi yapılandır
        genai.configure(api_key=api_key)
        
        # Model'i başlat
        self.model = genai.GenerativeModel(self.model_name)
        
        # Chat session başlat
        self.chat = self.model.start_chat(history=[])
        
    def send_message(self, user_message: str) -> dict:
        """Kullanıcı mesajına yanıt ver"""
        try:
            # Mesaj gönder (history otomatik korunur)
            response = self.chat.send_message(user_message)
            
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
    
    def clear_history(self):
        """Conversation history'yi temizle"""
        self.chat = self.model.start_chat(history=[])
        print("✅ Conversation history temizlendi")
    
    def get_history_count(self) -> int:
        """Conversation history'deki mesaj sayısı"""
        return len(self.chat.history)
    
    def show_history(self):
        """History'yi göster"""
        if not self.chat.history:
            print("📝 History boş")
            return
        
        print("\n📝 Conversation History:")
        print("=" * 50)
        for i, msg in enumerate(self.chat.history, 1):
            role = msg.role.upper()
            text = msg.parts[0].text
            # İlk 100 karakteri göster
            preview = text[:100] + "..." if len(text) > 100 else text
            print(f"{i}. {role}: {preview}")
        print("=" * 50)

def print_header():
    """Başlık yazdır"""
    print("\n" + "=" * 60)
    print("🌟 Google Gemini - Interactive Chat Console")
    print("=" * 60)
    print("")
    print("Komutlar:")
    print("  /help    - Yardım")
    print("  /clear   - Conversation history'yi temizle")
    print("  /history - Conversation history'yi göster")
    print("  /count   - Mesaj sayısını göster")
    print("  /quit    - Çıkış")
    print("")
    print("Bir şey sormak için yazmaya başlayın...")
    print("=" * 60)
    print("")

def main():
    """Ana fonksiyon"""
    # GeminiChat'i başlat
    chat = GeminiChat()
    chat.initialize()
    
    # Başlık yazdır
    print_header()
    
    # Ana loop
    while True:
        try:
            # Kullanıcı input'u al
            user_input = input("Sen: ").strip()
            
            # Boş input kontrolü
            if not user_input:
                continue
            
            # Komut kontrolü
            if user_input.startswith('/'):
                command = user_input.lower()
                
                if command == '/quit':
                    print("\n👋 Görüşmek üzere!")
                    print(f"📊 Toplam mesaj sayısı: {chat.get_history_count()}")
                    break
                    
                elif command == '/clear':
                    chat.clear_history()
                    
                elif command == '/history':
                    chat.show_history()
                    
                elif command == '/count':
                    count = chat.get_history_count()
                    print(f"📝 Conversation history: {count} mesaj")
                    
                elif command == '/help':
                    print_header()
                    
                else:
                    print("❌ Bilinmeyen komut. /help ile yardım alabilirsiniz.")
                
                continue
            
            # Gemini'ye sor
            print("🌟 Gemini: ", end="", flush=True)
            
            result = chat.send_message(user_input)
            
            if result['success']:
                # Yanıtı yazdır
                print(result['text'])
            else:
                print(f"\n❌ Hata: {result['error']}")
            
            print("")
            
        except KeyboardInterrupt:
            print("\n\n👋 Görüşmek üzere!")
            print(f"📊 Toplam mesaj sayısı: {chat.get_history_count()}")
            break
            
        except EOFError:
            break

if __name__ == "__main__":
    main()
