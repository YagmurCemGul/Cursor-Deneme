#!/usr/bin/env python3
"""
Interactive ChatGPT Console
İnteraktif ChatGPT konsol uygulaması
"""

import os
import sys
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict

# .env dosyasını yükle
load_dotenv()

class InteractiveChatBot:
    def __init__(self, model: str = "gpt-3.5-turbo"):
        """ChatBot'u başlat"""
        self.model = model
        self.messages: List[Dict[str, str]] = []
        self.client = None
        self.total_tokens = 0
        
    def initialize(self):
        """API client'ı başlat"""
        api_key = os.getenv('OPENAI_API_KEY')
        
        if not api_key or api_key == 'your-api-key-here':
            print("❌ HATA: Geçerli bir API key bulunamadı!")
            print("Lütfen .env dosyasını düzenleyip API key'inizi ekleyin.")
            sys.exit(1)
        
        self.client = OpenAI(api_key=api_key)
        
        # System prompt ekle
        self.messages.append({
            "role": "system",
            "content": "Sen yardımcı, arkadaş canlısı ve bilgili bir asistansın. Sorulara detaylı ve anlaşılır yanıtlar veriyorsun."
        })
        
    def chat(self, user_message: str) -> dict:
        """Kullanıcı mesajına yanıt ver"""
        # Kullanıcı mesajını ekle
        self.messages.append({"role": "user", "content": user_message})
        
        try:
            # API çağrısı
            response = self.client.chat.completions.create(
                model=self.model,
                messages=self.messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            # Yanıtı al
            assistant_message = response.choices[0].message.content
            
            # Conversation history'ye ekle
            self.messages.append({"role": "assistant", "content": assistant_message})
            
            # Token kullanımını güncelle
            self.total_tokens += response.usage.total_tokens
            
            return {
                'success': True,
                'content': assistant_message,
                'tokens': response.usage.total_tokens,
                'total_tokens': self.total_tokens
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'tokens': 0,
                'total_tokens': self.total_tokens
            }
    
    def clear_history(self):
        """Conversation history'yi temizle"""
        system_prompt = self.messages[0]
        self.messages = [system_prompt]
        self.total_tokens = 0
        print("✅ Conversation history temizlendi")
    
    def get_history_count(self) -> int:
        """Conversation history'deki mesaj sayısı"""
        return len(self.messages) - 1  # System prompt'u sayma

def print_header():
    """Başlık yazdır"""
    print("\n" + "=" * 60)
    print("🤖 OpenAI ChatGPT - Interactive Console")
    print("=" * 60)
    print("")
    print("Komutlar:")
    print("  /help    - Yardım")
    print("  /clear   - Conversation history'yi temizle")
    print("  /history - Mesaj sayısını göster")
    print("  /quit    - Çıkış")
    print("")
    print("Bir şey sormak için yazmaya başlayın...")
    print("=" * 60)
    print("")

def main():
    """Ana fonksiyon"""
    # ChatBot'u başlat
    bot = InteractiveChatBot()
    bot.initialize()
    
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
                    print(f"📊 Toplam token kullanımı: {bot.total_tokens}")
                    break
                    
                elif command == '/clear':
                    bot.clear_history()
                    
                elif command == '/history':
                    count = bot.get_history_count()
                    print(f"📝 Conversation history: {count} mesaj")
                    
                elif command == '/help':
                    print_header()
                    
                else:
                    print("❌ Bilinmeyen komut. /help ile yardım alabilirsiniz.")
                
                continue
            
            # ChatGPT'ye sor
            print("🤖 Bot: ", end="", flush=True)
            
            result = bot.chat(user_input)
            
            if result['success']:
                # Yanıtı yazdır
                print(result['content'])
                print(f"\n   [Tokens: {result['tokens']}, Total: {result['total_tokens']}]")
            else:
                print(f"\n❌ Hata: {result['error']}")
            
            print("")
            
        except KeyboardInterrupt:
            print("\n\n👋 Görüşmek üzere!")
            print(f"📊 Toplam token kullanımı: {bot.total_tokens}")
            break
            
        except EOFError:
            break

if __name__ == "__main__":
    main()
