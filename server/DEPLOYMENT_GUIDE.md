# 🚀 Dash Goal Server - Deployment Rehberi

## Adım 1: GitHub'a Yükle

1. **GitHub'da yeni repository oluştur:**
   - GitHub.com'a git
   - "New repository" tıkla
   - İsim: `dashgoal-server`
   - Public veya Private seç
   - "Create repository" tıkla

2. **Terminal'de (PowerShell) şu komutları çalıştır:**

```powershell
cd C:\Users\User\Desktop\uygulamacık\server
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SENIN_KULLANICI_ADIN/dashgoal-server.git
git push -u origin main
```

**ÖNEMLİ:** `SENIN_KULLANICI_ADIN` yerine kendi GitHub kullanıcı adını yaz!

---

## Adım 2: Render.com'da Deploy Et

1. **Render.com'a git:** https://render.com
2. **Sign Up / Log In** (GitHub ile giriş yapabilirsin)
3. **Dashboard'da "New +" tıkla → "Web Service"**
4. **GitHub repository'ni bağla:**
   - "Connect a repository" tıkla
   - `dashgoal-server` repo'sunu seç
5. **Ayarları yap:**
   - **Name:** `dashgoal-server` (veya istediğin isim)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
6. **"Create Web Service" tıkla**
7. **Bekle** (3-5 dakika deploy olacak)
8. **URL'i kopyala** (üstte görünecek, örn: `https://dashgoal-server.onrender.com`)

---

## Adım 3: Oyunu Güncelle

1. **`network.js` dosyasını aç**
2. **3. satırdaki URL'i değiştir:**

```javascript
// ÖNCE:
const SERVER_URL = 'http://localhost:3000';

// SONRA (Render URL'inle değiştir):
const SERVER_URL = 'https://dashgoal-server.onrender.com';
```

3. **Kaydet ve sayfayı yenile!**

---

## ✅ Test Et

1. Bir tarayıcıda "Oda Oluştur"
2. Başka bir tarayıcıda (veya telefonda) kodu gir ve "Katıl"
3. Oyun başlasın! ⚽

---

## 🐛 Sorun Çözme

**"Sunucuya bağlanılamadı" hatası:**
- Render.com'da servis çalışıyor mu kontrol et
- URL'i doğru yazdın mı kontrol et
- Render free tier ilk istekte 30-60 saniye uyanma süresi olabilir (ilk bağlantıda bekle)

**Oyun hala yavaş:**
- Render free tier bazen yavaş olabilir
- Alternatif: Glitch.com veya Railway.app dene
