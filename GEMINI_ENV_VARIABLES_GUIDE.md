# 🔐 Google Gemini API - Environment Variables Kurulum Rehberi

## 📋 İçindekiler
- [Environment Variable Nedir?](#environment-variable-nedir)
- [Hangisi Kullanılmalı?](#hangisi-kullanılmalı)
- [Linux/macOS Kurulumu](#linuxmacos-kurulumu)
- [Windows Kurulumu](#windows-kurulumu)
- [Python ile Kullanım](#python-ile-kullanım)
- [Doğrulama](#doğrulama)
- [Güvenlik](#güvenlik)

---

## 🤔 Environment Variable Nedir?

Environment variables (ortam değişkenleri), işletim sisteminde saklanan değerlerdir. API key'ler gibi hassas bilgileri kod içine yazmadan güvenli şekilde saklamanızı sağlar.

### Avantajları:
- ✅ Güvenlik: API key'ler kod dışında
- ✅ Taşınabilirlik: Farklı ortamlarda farklı değerler
- ✅ Git: Kod paylaşırken API key paylaşılmaz
- ✅ Kolay yönetim: Tek bir yerde değişiklik

---

## 🎯 Hangisi Kullanılmalı?

Google Gemini API **iki farklı** environment variable'ı destekler:

```bash
GEMINI_API_KEY      # Gemini'ye özel
GOOGLE_API_KEY      # Genel Google API'ler için
```

### ⚠️ ÖNEMLİ KURAL:
- **Her ikisi de ayarlanırsa `GOOGLE_API_KEY` öncelikli olur!**
- **Sadece birini ayarlamanız önerilir**

### Önerilen:
```bash
# Sadece Gemini kullanıyorsanız
export GEMINI_API_KEY="AIzaYourKey..."

# Diğer Google API'leri de kullanıyorsanız
export GOOGLE_API_KEY="AIzaYourKey..."
```

---

## 🐧 Linux/macOS Kurulumu

### Option 1: Geçici (Sadece Mevcut Terminal)

```bash
# Tek session için
export GEMINI_API_KEY="AIzaYourActualAPIKeyHere"

# Kontrol et
echo $GEMINI_API_KEY
```

**Dezavantaj**: Terminal kapanınca kaybolur.

---

### Option 2: Kalıcı (User Level - Önerilen)

#### Bash Kullanıyorsanız:

```bash
# .bashrc dosyasını düzenle
nano ~/.bashrc

# Dosyanın sonuna ekle:
export GEMINI_API_KEY="AIzaYourActualAPIKeyHere"

# Kaydet ve çık (Ctrl+O, Enter, Ctrl+X)

# Dosyayı yükle
source ~/.bashrc

# Kontrol et
echo $GEMINI_API_KEY
```

#### Zsh Kullanıyorsanız (macOS Catalina+):

```bash
# .zshrc dosyasını düzenle
nano ~/.zshrc

# Dosyanın sonuna ekle:
export GEMINI_API_KEY="AIzaYourActualAPIKeyHere"

# Kaydet ve çık

# Dosyayı yükle
source ~/.zshrc

# Kontrol et
echo $GEMINI_API_KEY
```

---

### Option 3: .env Dosyası (Proje Bazlı - En Önerilen)

```bash
# Proje klasöründe .env dosyası oluştur
cd your-project
nano .env

# İçeriği:
GEMINI_API_KEY=AIzaYourActualAPIKeyHere

# .gitignore'a ekle
echo ".env" >> .gitignore

# Python'da kullan (python-dotenv ile)
pip install python-dotenv
```

**Python kodu:**
```python
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
```

---

### macOS için Ek Notlar

#### GUI Yöntemi (macOS):

```bash
# launchd.conf kullanımı (eski macOS)
# Artık önerilmiyor

# Önerilen: .zshrc veya .env dosyası kullan
```

#### Xcode Command Line Tools:

```bash
# Eğer yoksa yükle
xcode-select --install
```

---

## 🪟 Windows Kurulumu

### Option 1: PowerShell (Geçici)

```powershell
# Tek session için
$env:GEMINI_API_KEY="AIzaYourActualAPIKeyHere"

# Kontrol et
echo $env:GEMINI_API_KEY
```

---

### Option 2: PowerShell (Kalıcı - User Level)

```powershell
# User level (önerilen)
[System.Environment]::SetEnvironmentVariable(
    'GEMINI_API_KEY', 
    'AIzaYourActualAPIKeyHere', 
    'User'
)

# Kontrol et (yeni PowerShell penceresi aç)
echo $env:GEMINI_API_KEY
```

---

### Option 3: PowerShell (System Level - Admin Gerekir)

```powershell
# Administrator olarak PowerShell aç

# System level
[System.Environment]::SetEnvironmentVariable(
    'GEMINI_API_KEY', 
    'AIzaYourActualAPIKeyHere', 
    'Machine'
)
```

---

### Option 4: Command Prompt (cmd)

```cmd
# Geçici
set GEMINI_API_KEY=AIzaYourActualAPIKeyHere

# Kalıcı (User level)
setx GEMINI_API_KEY "AIzaYourActualAPIKeyHere"

# Kontrol et (yeni cmd penceresi aç)
echo %GEMINI_API_KEY%
```

**⚠️ Not**: `setx` komutu yeni terminallerde geçerli olur.

---

### Option 5: Windows GUI (En Kolay)

#### Adım Adım:

1. **Windows tuşu + R** → `sysdm.cpl` yazın
2. **Advanced** sekmesine gidin
3. **Environment Variables** butonuna tıklayın
4. **User variables** bölümünde **New** butonuna tıklayın
5. Değerleri girin:
   - **Variable name**: `GEMINI_API_KEY`
   - **Variable value**: `AIzaYourActualAPIKeyHere`
6. **OK** → **OK** → **OK**
7. Yeni terminal açın ve test edin

#### Alternatif (Windows Search ile):

1. **Windows tuşu** → "environment" ara
2. **Edit the system environment variables** seç
3. **Environment Variables** butonuna tıkla
4. Yukarıdaki 4-7 adımları takip et

---

### Option 6: .env Dosyası (Windows için de)

```powershell
# Proje klasöründe
cd your-project
notepad .env

# İçeriği:
GEMINI_API_KEY=AIzaYourActualAPIKeyHere

# Kaydet ve kapat

# Python'da kullan
pip install python-dotenv
```

---

## 🐍 Python ile Kullanım

### Method 1: os.getenv() (Built-in)

```python
import os

# Otomatik olarak environment variable'ı okur
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    api_key = os.getenv('GOOGLE_API_KEY')  # Alternatif

if not api_key:
    raise ValueError("API key bulunamadı!")

print(f"API Key: {api_key[:10]}...")
```

---

### Method 2: python-dotenv (Önerilen)

```python
from dotenv import load_dotenv
import os

# .env dosyasını yükle
load_dotenv()

# Environment variable'ı oku
api_key = os.getenv('GEMINI_API_KEY')

print(f"API Key: {api_key}")
```

**.env dosyası:**
```env
GEMINI_API_KEY=AIzaYourActualAPIKeyHere
```

---

### Method 3: Gemini SDK (Otomatik)

```python
import google.generativeai as genai
import os

# SDK otomatik olarak GEMINI_API_KEY veya GOOGLE_API_KEY'i arar
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Alternatif (otomatik arama)
# genai.configure()  # Otomatik olarak env variable'ı bulur
```

---

## ✅ Doğrulama

### Linux/macOS:

```bash
# Terminal'de kontrol et
echo $GEMINI_API_KEY

# Python ile kontrol et
python3 -c "import os; print(os.getenv('GEMINI_API_KEY'))"

# Değer görüyorsanız ✅ başarılı
# None görüyorsanız ❌ ayarlanmamış
```

---

### Windows (PowerShell):

```powershell
# PowerShell'de kontrol et
echo $env:GEMINI_API_KEY

# Python ile kontrol et
python -c "import os; print(os.getenv('GEMINI_API_KEY'))"
```

---

### Windows (cmd):

```cmd
# cmd'de kontrol et
echo %GEMINI_API_KEY%

# Python ile kontrol et
python -c "import os; print(os.getenv('GEMINI_API_KEY'))"
```

---

### Python Script ile Test:

```python
#!/usr/bin/env python3
"""
Environment Variable Test Script
"""

import os
import sys

def test_env_variables():
    """Environment variables'ı test et"""
    
    print("=" * 50)
    print("🧪 Environment Variables Test")
    print("=" * 50)
    print("")
    
    # GEMINI_API_KEY kontrolü
    gemini_key = os.getenv('GEMINI_API_KEY')
    if gemini_key:
        print(f"✅ GEMINI_API_KEY: {gemini_key[:10]}...{gemini_key[-4:]}")
    else:
        print("❌ GEMINI_API_KEY: Bulunamadı")
    
    # GOOGLE_API_KEY kontrolü
    google_key = os.getenv('GOOGLE_API_KEY')
    if google_key:
        print(f"✅ GOOGLE_API_KEY: {google_key[:10]}...{google_key[-4:]}")
    else:
        print("❌ GOOGLE_API_KEY: Bulunamadı")
    
    print("")
    
    # Sonuç
    if gemini_key or google_key:
        print("✅ En az bir API key bulundu!")
        if gemini_key and google_key:
            print("⚠️  Her ikisi de ayarlı, GOOGLE_API_KEY öncelikli olacak!")
        return True
    else:
        print("❌ Hiç API key bulunamadı!")
        print("")
        print("Çözüm:")
        print("  Linux/macOS: export GEMINI_API_KEY='your-key'")
        print("  Windows:     set GEMINI_API_KEY=your-key")
        print("  veya .env dosyası oluştur")
        return False

if __name__ == "__main__":
    success = test_env_variables()
    sys.exit(0 if success else 1)
```

**Çalıştır:**
```bash
python test_env.py
```

---

## 🔒 Güvenlik

### ✅ YAPILMASI GEREKENLER:

1. **Environment variables kullan**
   ```python
   api_key = os.getenv('GEMINI_API_KEY')  # ✅
   ```

2. **.env dosyasını .gitignore'a ekle**
   ```bash
   echo ".env" >> .gitignore
   ```

3. **API key'i maskelenmemiş gösterme**
   ```python
   print(f"Key: {key[:10]}...{key[-4:]}")  # ✅
   print(f"Key: {key}")  # ❌
   ```

4. **Farklı ortamlar için farklı key'ler**
   - Development: Test API key
   - Production: Production API key

---

### ❌ YAPILMAMASI GEREKENLER:

1. **Hardcoded API keys**
   ```python
   api_key = "AIzaYour..."  # ❌ ASLA!
   ```

2. **Git'e API key commit'lemek**
   ```bash
   git add .env  # ❌ YAPMAYIN!
   ```

3. **API key'i loglara yazdırmak**
   ```python
   logging.info(f"API Key: {api_key}")  # ❌
   ```

4. **Public repo'larda API key**
   - GitHub public repo'da .env varsa → HEMEN SİL
   - API key'i revoke et
   - Yeni key oluştur

---

## 🔄 API Key'i Değiştirme

### Linux/macOS:

```bash
# Yeni key ile değiştir
nano ~/.bashrc  # veya ~/.zshrc

# Satırı bul ve değiştir:
export GEMINI_API_KEY="YeniAPIKeyBuraya"

# Kaydet ve yükle
source ~/.bashrc
```

---

### Windows:

#### PowerShell:
```powershell
[System.Environment]::SetEnvironmentVariable(
    'GEMINI_API_KEY', 
    'YeniAPIKeyBuraya', 
    'User'
)
```

#### GUI:
1. Windows tuşu → "environment" ara
2. Variable'ı bul
3. Edit → Yeni key gir → OK

---

## 🆚 Karşılaştırma Tablosu

| Yöntem | Kalıcı | Kolay | Güvenli | Taşınabilir |
|--------|--------|-------|---------|-------------|
| Geçici export | ❌ | ✅ | ⚠️ | ❌ |
| .bashrc/.zshrc | ✅ | ⚠️ | ✅ | ❌ |
| .env dosyası | ✅ | ✅ | ✅✅ | ✅✅ |
| Windows GUI | ✅ | ✅ | ✅ | ❌ |
| setx | ✅ | ⚠️ | ✅ | ❌ |

**Önerilen**: `.env` dosyası + `python-dotenv`

---

## 📚 Özet

### Hızlı Kurulum (5 Dakika):

```bash
# 1. Proje klasörü oluştur
mkdir my-gemini-project && cd my-gemini-project

# 2. Virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Paketleri kur
pip install google-generativeai python-dotenv

# 4. .env dosyası oluştur
echo "GEMINI_API_KEY=your-key-here" > .env
echo ".env" > .gitignore

# 5. Test et
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('GEMINI_API_KEY'))"
```

**✅ API key görüyorsanız hazırsınız!**

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05  
**Platforms**: Linux, macOS, Windows
