# Alora Hayat

Türkçe, tek oyunculu bir yaşam simülasyonu. Bebeklikten başlayarak her yıl yaş atlar; eğitim, sınav, ilişki, iş, para ve gündelik etkinlikler seçimlerinle şekillenir. Bütün para oyun içi sanal paradır; gerçek para, çevrimiçi kumar veya para transferi yoktur.

## Windows uygulaması

Windows 10/11 x64 ve Node.js 20+ gerekir. `src/icon.svg` özgün ikon kaynağı, `assets/icon.ico` Windows uygulama ve kurulum simgesidir. Depo kökünde:

```powershell
npm.cmd install
npm.cmd run desktop:dist
```

Kurulum dosyası `release\Alora-Hayat-Setup-0.1.0-x64.exe` yolunda oluşturulur. NSIS sihirbazı kullanıcıya özel kurulum yapar, masaüstü ve Başlat menüsü kısayolları ekler; uygulama Windows **Ayarlar → Uygulamalar → Yüklü uygulamalar** listesinde görünür ve oradan kaldırılabilir. Oyun kayıtları kaldırma sırasında silinmez.

Geliştirme sırasında masaüstü uygulamasını `npm.cmd run desktop:dev`, tarayıcı arayüzünü `npm.cmd run dev` ile başlat. Oyun testleri `npm.cmd test`, web arayüzünün üretim derlemesi `npm.cmd run build` komutlarıyla çalışır.

## Kayıt ve yaş sınırları

Oyun ilerlemesi cihazda otomatik kaydedilir. Ayarlar ekranından kayıt dışa aktarılabilir, içe alınabilir veya sıfırlanabilir. Uygulamayı kaldırmadan önce kaydı dışa aktar; kaldırma işlemi kayıt verisini ayrıca silmez.

Sosyal medya 13+, romantik ilişki etkinlikleri 16+, iş 16+ (tam zamanlı çalışma 18+) ve sanal kumar 18+ yaşında açılır. Kumar yalnızca oyun içi sanal bakiye kullanır; gerçek parayla bağlantısı yoktur.
