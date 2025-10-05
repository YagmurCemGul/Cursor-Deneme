#!/bin/bash
# Google Gemini Python Development Environment Setup Script
# Bu script otomatik olarak Python environment'ı kurar

set -e  # Hata durumunda dur

echo "🌟 Google Gemini Python Development Environment Setup"
echo "===================================================="
echo ""

# Python versiyonunu kontrol et
echo "📋 Python versiyonu kontrol ediliyor..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 bulunamadı!"
    echo "   Lütfen Python 3.9+ kurun: https://www.python.org/downloads/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "✅ Python $PYTHON_VERSION bulundu"
echo ""

# Python version check (3.9+)
MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [ "$MAJOR" -lt 3 ] || ([ "$MAJOR" -eq 3 ] && [ "$MINOR" -lt 9 ]); then
    echo "❌ Python 3.9 veya üzeri gerekli!"
    echo "   Mevcut: Python $PYTHON_VERSION"
    exit 1
fi

# Virtual environment oluştur
echo "📦 Virtual environment oluşturuluyor..."
if [ -d "venv" ]; then
    echo "⚠️  venv klasörü zaten mevcut, atlanıyor..."
else
    python3 -m venv venv
    echo "✅ Virtual environment oluşturuldu"
fi
echo ""

# Virtual environment'ı aktifleştir
echo "🔌 Virtual environment aktifleştiriliyor..."
source venv/bin/activate
echo "✅ Virtual environment aktif"
echo ""

# pip'i güncelle
echo "⬆️  pip güncelleniyor..."
pip install --upgrade pip -q
echo "✅ pip güncellendi"
echo ""

# Gerekli paketleri kur
echo "📦 Gerekli paketler kuruluyor..."
pip install -q google-generativeai python-dotenv pillow requests rich

# requirements.txt oluştur
pip freeze > requirements.txt
echo "✅ Paketler kuruldu"
echo ""

# .env dosyası oluştur (eğer yoksa)
if [ ! -f ".env" ]; then
    echo "📝 .env dosyası oluşturuluyor..."
    cat > .env << 'EOF'
# Google Gemini API Configuration
# Sadece birini ayarlayın (GOOGLE_API_KEY öncelikli)
GEMINI_API_KEY=your-api-key-here

# veya
# GOOGLE_API_KEY=your-api-key-here

# Model Settings
GEMINI_MODEL=gemini-pro
GEMINI_VISION_MODEL=gemini-pro-vision
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048

# Application Settings
DEBUG=True
LOG_LEVEL=INFO
EOF
    echo "✅ .env dosyası oluşturuldu"
    echo ""
    echo "⚠️  ÖNEMLI: .env dosyasını düzenleyip API key'inizi ekleyin!"
    echo "   Düzenlemek için: nano .env"
    echo "   API key almak için: https://makersuite.google.com/app/apikey"
else
    echo "ℹ️  .env dosyası zaten mevcut"
fi
echo ""

# .gitignore oluştur (eğer yoksa)
if [ ! -f ".gitignore" ]; then
    echo "📝 .gitignore oluşturuluyor..."
    cat > .gitignore << 'EOF'
# Environment
.env
venv/
env/
ENV/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so

# IDE
.vscode/
.idea/
*.swp
*.swo

# Images (örnek resimler hariç)
*.jpg
*.jpeg
*.png
!example_*.jpg
!example_*.png

# Logs
*.log
gemini_api.log

# OS
.DS_Store
Thumbs.db
EOF
    echo "✅ .gitignore oluşturuldu"
fi
echo ""

# Test scripti çalıştır
echo "🧪 Test ediliyor..."
python3 -c "import google.generativeai as genai; print('✅ google-generativeai başarıyla import edildi')"
python3 -c "from dotenv import load_dotenv; print('✅ python-dotenv başarıyla import edildi')"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Kurulum tamamlandı!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Sonraki adımlar:"
echo "1. .env dosyasını düzenle: nano .env"
echo "2. GEMINI_API_KEY değerini gerçek API key'inle değiştir"
echo "   API key almak için: https://makersuite.google.com/app/apikey"
echo "3. Örnek scripti çalıştır: python basic_gemini.py"
echo ""
echo "Virtual environment'ı aktifleştirmek için:"
echo "  source venv/bin/activate"
echo ""
echo "Yardım için: cat README.md"
echo ""
