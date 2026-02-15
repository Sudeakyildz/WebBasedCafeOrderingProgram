# Asil Kafe – Web Tabanlı Sipariş Sistemi

QR kod ile menü açıp sipariş verebileceğiniz kafe sipariş uygulaması.

## Teknolojiler

- **Backend:** Node.js, Express
- **Veritabanı:** MySQL (isteğe bağlı; yoksa siparişler konsola yazılır)
- **Frontend:** React (Vite), HTML, CSS, JavaScript

## Kurulum

```bash
git clone https://github.com/Sudeakyildz/WebBasedCafeOrderingProgram.git
cd WebBasedCafeOrderingProgram
npm install
npm run build:client   # React frontend'i derler (ilk seferde)
npm start
```

- **Menü:** http://localhost:3000  
- **QR için adres:** http://localhost:3000/qr-info  

## MySQL (isteğe bağlı)

Siparişleri veritabanına kaydetmek için:

1. MySQL kurun ve çalıştırın.
2. `mysql -u root -p < database.sql` ile veritabanı ve tabloları oluşturun.
3. `.env.example` dosyasını `.env` olarak kopyalayıp `DB_USER`, `DB_PASSWORD` ayarlayın.
4. Sunucuyu yeniden başlatın.

## QR Kod

Müşteriler masadaki QR kodu okutunca menü açılır. Telefon ve sunucu **aynı WiFi** ağında olmalı.  
`/qr-info` sayfasında telefondan açılacak adres gösterilir; bu adresi QR koda çevirip kullanın.

## Lisans

MIT
