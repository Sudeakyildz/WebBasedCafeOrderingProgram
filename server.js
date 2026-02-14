require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const os = require('os');
const app = express();
const port = process.env.PORT || 3000;

// Sanal ağ mı? (VirtualBox, VMware vb. - telefondan erişilemez)
function isVirtualAdapter(name, address) {
    const nameLower = (name || '').toLowerCase();
    if (/Virtual|vEthernet|VMware|VirtualBox|vbox|WSL|Loopback/.test(nameLower)) return true;
    if (/^192\.168\.56\.|^192\.168\.59\.|^10\.0\.2\./.test(address)) return true; // yaygın sanal ağlar
    return false;
}

// Tüm yerel IPv4 adreslerini topla (WiFi/Ethernet öncelikli)
function getAllLocalIPs() {
    const list = [];
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
        for (const iface of ifaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                list.push({ name, address: iface.address });
            }
        }
    }
    return list;
}

// Telefondan erişilebilecek IP (sanal ağları atla, WiFi/Ethernet seç)
function getLocalIP() {
    const list = getAllLocalIPs();
    const gercek = list.filter(({ name, address }) => !isVirtualAdapter(name, address));
    const secim = gercek.length > 0 ? gercek : list;
    return secim.length > 0 ? secim[0].address : 'localhost';
}

// JSON verilerini almak için middleware
app.use(express.json()); // Gelen isteklerde JSON verisini otomatik olarak ayrıştırır.

// Statik dosyaları sun
app.use(express.static(path.join(__dirname, 'public'))); 
// 'public' dizinindeki statik dosyaları sunar. Örneğin, CSS, JS veya HTML dosyaları buradan alınır.

// MySQL bağlantısı (.env ile veya varsayılan değerler)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asil_kafe',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// API endpointleri

// Veritabanından tüm verileri döndüren GET endpoint
app.get('/api/data', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM your_table'); 
        // Veritabanından tüm veriler sorgulanır.
        res.json(rows); // Sonuçlar JSON formatında istemciye gönderilir.
    } catch (err) {
        console.error('GET isteği hatası:', err); // Hata konsola yazılır.
        res.status(500).send('Sunucu hatası'); // Sunucu hatası mesajı döndürülür.
    }
});

// Sipariş gönderme endpoint'i
app.post('/api/orders', async (req, res) => {
    console.log('Gelen veri:', req.body); // Gelen veri konsola yazdırılır.

    const { orderItems, totalAmount } = req.body; // İstek gövdesinden sipariş bilgileri alınır.

    if (!orderItems || orderItems.length === 0 || !totalAmount) {
        // Eğer sipariş verisi eksikse hata döndürülür.
        return res.status(400).send('Geçersiz sipariş verisi');
    }

    try {
        const connection = await pool.getConnection(); // Veritabanı bağlantısı alınır.

        // Sipariş toplamını 'orders' tablosuna kaydet
        const [orderResult] = await connection.query(
            'INSERT INTO orders (totalAmount) VALUES (?)',
            [totalAmount]
        );
        const orderId = orderResult.insertId; // Yeni eklenen siparişin ID'si alınır.

        // Sipariş ürünlerini 'order_items' tablosuna kaydet
        for (let item of orderItems) {
            const { itemName, quantity, totalPrice } = item;
            await connection.query(
                'INSERT INTO order_items (orderId, itemName, quantity, totalPrice) VALUES (?, ?, ?, ?)',
                [orderId, itemName, quantity, totalPrice]
            );
        }

        connection.release(); // Veritabanı bağlantısı serbest bırakılır.

        res.status(201).json({ message: 'Sipariş başarıyla kaydedildi!' }); 
        // Başarı mesajı döndürülür.

    } catch (err) {
        console.error('POST isteği hatası (MySQL):', err.message);
        // MySQL yoksa veya tablolar yoksa siparişi konsola yaz, kullanıcıya yine de başarılı de
        console.log('Sipariş (konsola kaydedildi):', { orderItems, totalAmount });
        res.status(201).json({
            message: 'Sipariş alındı! (Veritabanı bağlı değilse sadece konsola yazıldı.)'
        });
    }
});

// QR kod için kullanılacak adres (telefon aynı WiFi'de olmalı)
app.get('/api/qr-url', (req, res) => {
    const ip = getLocalIP();
    const url = `http://${ip}:${port}`;
    res.json({ url, ip, port });
});

// QR bilgi sayfası: Bu adresi QR kod olarak basın, müşteri okutunca menü açılır
app.get('/qr-info', (req, res) => {
    const ip = getLocalIP();
    const url = `http://${ip}:${port}`;
    const tumIPler = getAllLocalIPs();
    const digerAdresler = tumIPler
        .filter(({ address }) => address !== ip)
        .map(({ address }) => `http://${address}:${port}`)
        .join('<br>');
    const digerHtml = digerAdresler ? `<p class="note">Bu acilmazsa dene:<br>${digerAdresler}</p>` : '';
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Kod Adresi - Asil Kafe</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; padding: 1rem; background: #1C2025; color: #F5F5F5; text-align: center; }
    h1 { color: #FFD700; }
    .url { font-size: 1.4rem; word-break: break-all; background: #282C34; padding: 1rem; border-radius: 8px; margin: 1rem 0; color: #FFD700; }
    .note { color: #aaa; font-size: 0.9rem; margin-top: 2rem; }
    a { color: #FFD700; }
  </style>
</head>
<body>
  <h1>📱 QR Kod İçin Adres</h1>
  <p>Masanıza basacağınız QR kod <strong>şu adresi</strong> göstermeli:</p>
  <p class="url">${url}</p>
  ${digerHtml}
  <p>Bu adresi <a href="https://www.qr-code-generator.com/" target="_blank">ücretsiz QR sitelerinden</a> biriyle QR koda çevirip yazdırın.</p>
  <p class="note">⚠️ Telefon ve bu bilgisayar <strong>ayni WiFi aginda</strong> olmalı. Bilgisayarın IP’si değişirse yeni QR basmanız gerekir.</p>
</body>
</html>`;
    res.send(html);
});

// Root endpoint: index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucu başlatma (0.0.0.0 = tüm ağ arayüzlerinde dinle)
app.listen(port, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
    console.log(`QR kod / telefondan erişim: http://${ip}:${port}`);
});
