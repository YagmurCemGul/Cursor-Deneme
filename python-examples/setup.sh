#!/bin/bash
# OpenAI Python Development Environment Setup Script
# Bu script otomatik olarak Python environment'ı kurar

set -e  # Hata durumunda dur

echo "🐍 OpenAI Python Development Environment Setup"
echo "=============================================="
echo ""

# Python versiyonunu kontrol et
echo "📋 Python versiyonu kontrol ediliyor..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 bulunamadı!"
    echo "   Lütfen Python 3.7+ kurun: https://www.python.org/downloads/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "✅ Python $PYTHON_VERSION bulundu"
echo ""

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
pip install -q openai python-dotenv requests rich

# requirements.txt oluştur
pip freeze > requirements.txt
echo "✅ Paketler kuruldu"
echo ""

# .env dosyası oluştur (eğer yoksa)
if [ ! -f ".env" ]; then
    echo "📝 .env dosyası oluşturuluyor..."
    cat > .env << 'EOF'
# OpenAI API Configuration
OPENAI_API_KEY=your-api-key-here

# Model Settings
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Application Settings
DEBUG=True
LOG_LEVEL=INFO
EOF
    echo "✅ .env dosyası oluşturuldu"
    echo ""
    echo "⚠️  ÖNEMLI: .env dosyasını düzenleyip API key'inizi ekleyin!"
    echo "   Düzenlemek için: nano .env"
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

# Logs
*.log
chatgpt_api.log

# OS
.DS_Store
Thumbs.db
EOF
    echo "✅ .gitignore oluşturuldu"
fi
echo ""

# Test scripti çalıştır
echo "🧪 Test ediliyor..."
python3 -c "import openai; print('✅ OpenAI library başarıyla import edildi')"
python3 -c "from dotenv import load_dotenv; print('✅ python-dotenv başarıyla import edildi')"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Kurulum tamamlandı!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Sonraki adımlar:"
echo "1. .env dosyasını düzenle: nano .env"
echo "2. OPENAI_API_KEY değerini gerçek API key'inle değiştir"
echo "3. Örnek scripti çalıştır: python basic_example.py"
echo ""
echo "Virtual environment'ı aktifleştirmek için:"
echo "  source venv/bin/activate"
echo ""
echo "Yardım için: cat README.md"
echo ""
