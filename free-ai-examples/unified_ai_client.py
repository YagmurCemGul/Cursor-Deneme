#!/usr/bin/env python3
"""
Unified AI Client - Tüm AI API'lerini tek arayüzle kullan
Supports: Gemini, OpenAI, Claude, Groq, Hugging Face, Ollama
"""

import os
import sys
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# AI Libraries - install: pip install google-generativeai openai anthropic groq requests
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    CLAUDE_AVAILABLE = True
except ImportError:
    CLAUDE_AVAILABLE = False

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

import requests

load_dotenv()

class UnifiedAI:
    """Tüm AI API'lerini tek arayüzle kullan"""
    
    def __init__(self):
        """Initialize all available AI clients"""
        self.available_providers = []
        
        # Gemini
        self.gemini_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if self.gemini_key and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini = genai.GenerativeModel('gemini-pro')
                self.available_providers.append('gemini')
            except Exception as e:
                print(f"⚠️  Gemini init failed: {e}")
        
        # OpenAI
        self.openai_key = os.getenv('OPENAI_API_KEY')
        if self.openai_key and OPENAI_AVAILABLE:
            try:
                self.openai = OpenAI(api_key=self.openai_key)
                self.available_providers.append('openai')
            except Exception as e:
                print(f"⚠️  OpenAI init failed: {e}")
        
        # Claude
        self.anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        if self.anthropic_key and CLAUDE_AVAILABLE:
            try:
                self.claude = anthropic.Anthropic(api_key=self.anthropic_key)
                self.available_providers.append('claude')
            except Exception as e:
                print(f"⚠️  Claude init failed: {e}")
        
        # Groq
        self.groq_key = os.getenv('GROQ_API_KEY')
        if self.groq_key and GROQ_AVAILABLE:
            try:
                self.groq = Groq(api_key=self.groq_key)
                self.available_providers.append('groq')
            except Exception as e:
                print(f"⚠️  Groq init failed: {e}")
        
        # Hugging Face
        self.hf_key = os.getenv('HUGGINGFACE_API_KEY')
        if self.hf_key:
            self.available_providers.append('huggingface')
        
        # Ollama (local)
        if self._check_ollama():
            self.available_providers.append('ollama')
    
    def _check_ollama(self) -> bool:
        """Check if Ollama is running"""
        try:
            response = requests.get('http://localhost:11434/api/tags', timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def generate(
        self, 
        prompt: str, 
        provider: str = "auto",
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Unified generate method
        
        Args:
            prompt: User prompt
            provider: 'auto', 'gemini', 'openai', 'claude', 'groq', 'huggingface', 'ollama'
            model: Specific model (optional)
            temperature: 0.0-1.0
            max_tokens: Maximum output length
            **kwargs: Additional parameters
            
        Returns:
            {
                'provider': str,
                'model': str,
                'text': str,
                'success': bool,
                'error': Optional[str]
            }
        """
        
        # Auto-select provider (prefer free)
        if provider == "auto":
            if 'gemini' in self.available_providers:
                provider = 'gemini'
            elif 'groq' in self.available_providers:
                provider = 'groq'
            elif 'ollama' in self.available_providers:
                provider = 'ollama'
            elif 'huggingface' in self.available_providers:
                provider = 'huggingface'
            elif 'openai' in self.available_providers:
                provider = 'openai'
            elif 'claude' in self.available_providers:
                provider = 'claude'
            else:
                return {
                    'provider': None,
                    'model': None,
                    'text': None,
                    'success': False,
                    'error': 'No AI provider available. Please configure API keys.'
                }
        
        # Check if provider is available
        if provider not in self.available_providers:
            return {
                'provider': provider,
                'model': None,
                'text': None,
                'success': False,
                'error': f'{provider} not available. Check API key or installation.'
            }
        
        # Generate
        try:
            if provider == "gemini":
                result = self._generate_gemini(prompt, temperature, max_tokens)
            elif provider == "openai":
                result = self._generate_openai(prompt, model or "gpt-3.5-turbo", temperature, max_tokens)
            elif provider == "claude":
                result = self._generate_claude(prompt, model or "claude-3-haiku-20240307", temperature, max_tokens)
            elif provider == "groq":
                result = self._generate_groq(prompt, model or "llama3-70b-8192", temperature, max_tokens)
            elif provider == "huggingface":
                result = self._generate_huggingface(prompt, model or "gpt2")
            elif provider == "ollama":
                result = self._generate_ollama(prompt, model or "llama3", temperature, max_tokens)
            else:
                return {
                    'provider': provider,
                    'model': None,
                    'text': None,
                    'success': False,
                    'error': f'Unknown provider: {provider}'
                }
            
            return result
            
        except Exception as e:
            return {
                'provider': provider,
                'model': model,
                'text': None,
                'success': False,
                'error': str(e)
            }
    
    def _generate_gemini(self, prompt: str, temperature: float, max_tokens: int) -> Dict:
        """Gemini generation"""
        response = self.gemini.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens
            )
        )
        return {
            'provider': 'gemini',
            'model': 'gemini-pro',
            'text': response.text,
            'success': True,
            'error': None
        }
    
    def _generate_openai(self, prompt: str, model: str, temperature: float, max_tokens: int) -> Dict:
        """OpenAI generation"""
        response = self.openai.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens
        )
        return {
            'provider': 'openai',
            'model': model,
            'text': response.choices[0].message.content,
            'success': True,
            'error': None
        }
    
    def _generate_claude(self, prompt: str, model: str, temperature: float, max_tokens: int) -> Dict:
        """Claude generation"""
        message = self.claude.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        return {
            'provider': 'claude',
            'model': model,
            'text': message.content[0].text,
            'success': True,
            'error': None
        }
    
    def _generate_groq(self, prompt: str, model: str, temperature: float, max_tokens: int) -> Dict:
        """Groq generation"""
        chat_completion = self.groq.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model,
            temperature=temperature,
            max_tokens=max_tokens
        )
        return {
            'provider': 'groq',
            'model': model,
            'text': chat_completion.choices[0].message.content,
            'success': True,
            'error': None
        }
    
    def _generate_huggingface(self, prompt: str, model: str) -> Dict:
        """Hugging Face generation"""
        API_URL = f"https://api-inference.huggingface.co/models/{model}"
        headers = {"Authorization": f"Bearer {self.hf_key}"}
        
        response = requests.post(API_URL, headers=headers, json={"inputs": prompt})
        result = response.json()
        
        if isinstance(result, list) and len(result) > 0:
            text = result[0].get('generated_text', str(result))
        elif isinstance(result, dict) and 'generated_text' in result:
            text = result['generated_text']
        else:
            text = str(result)
        
        return {
            'provider': 'huggingface',
            'model': model,
            'text': text,
            'success': True,
            'error': None
        }
    
    def _generate_ollama(self, prompt: str, model: str, temperature: float, max_tokens: int) -> Dict:
        """Ollama (local) generation"""
        response = requests.post('http://localhost:11434/api/generate', 
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
        )
        result = response.json()
        return {
            'provider': 'ollama',
            'model': model,
            'text': result.get('response', ''),
            'success': True,
            'error': None
        }
    
    def list_available(self) -> list:
        """List available providers"""
        return self.available_providers

# CLI Usage
def main():
    """Main CLI function"""
    print("=" * 60)
    print("🤖 Unified AI Client - All AI APIs in One Interface")
    print("=" * 60)
    print("")
    
    # Initialize
    ai = UnifiedAI()
    
    # Show available providers
    print("Available AI Providers:")
    for provider in ai.list_available():
        if provider in ['gemini', 'groq', 'ollama', 'huggingface']:
            badge = "🆓 FREE"
        else:
            badge = "💰 PAID"
        print(f"  {badge} {provider}")
    
    if not ai.available_providers:
        print("  ❌ No providers available!")
        print("")
        print("Please configure API keys in .env file:")
        print("  GEMINI_API_KEY=your-key")
        print("  GROQ_API_KEY=your-key")
        print("  etc.")
        sys.exit(1)
    
    print("")
    
    # Test prompt
    prompt = "Python nedir? Çok kısa açıkla (max 2 cümle)."
    
    # Test all available providers
    for provider in ai.available_providers:
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"Testing: {provider.upper()}")
        print("")
        
        result = ai.generate(prompt, provider=provider)
        
        if result['success']:
            print(f"✅ Success!")
            print(f"Model: {result['model']}")
            print(f"Response: {result['text'][:200]}...")
        else:
            print(f"❌ Failed: {result['error']}")
        
        print("")

if __name__ == "__main__":
    main()
