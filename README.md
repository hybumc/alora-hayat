# Alora Hayat

Türkçe, tek oyunculu bir yaşam simülasyonu. Adını, soyadını ve doğum tarihini girerek bebeklikten başla; her yıl **Yaş Atla** seçeneğiyle eğitim, aile, ilişkiler, iş ve ekonomi kararları ver. Oyun ilerlemesi cihazında otomatik kaydedilir.

## Oynanış

- **1.000 etkinlik seçeneği:** 20 etkinlik türünü 10 farklı mekân ve 5 eşlikçi seçeneğiyle ara, yaşına ve bakiyene uygun olanlara katıl.
- **Aile:** Anne, baba ve kardeşlerinle sohbet et, birlikte vakit geçir, hediye al, ebeveynlerinden destek iste veya ailene para gönder. Birlikte zaman geçirmek yaşı ilerletmez.
- **Eğitim:** 7 yaşında ilkokula başlama seçimi, okul yazılıları, ortaokul değerlendirmesi, LGS puanı ve lise tercihleri, YKS sonucu ve puanına uygun üniversite bölümleri.
- **Kariyer:** Eğitim, yaş, beceri ve ehliyet koşullarına bağlı 25 meslek; belediye kadroları için kamu sınavı. Ücretler aylık gösterilir ve yaş atlayınca yıllık maaş geliri eklenir.
- **Sosyal medya:** Paylaşımlar görüntülenme, beğeni ve takipçi kazandırır. İçerik geliri için en az 5.000 takipçi gerekir; büyüme zordur.
- **Ekonomi:** Banka ve harcama yönetimi, 18+ kredi ve faiz, fiyatı her yıl değişen hisse senetleri, yarışmalar ve giderleri gelirini aşarsa iflas edebilen işletmeler.
- **İlişkiler ve yetişkin etkinlikleri:** Romantik ilişki 16+, iş 16+, kredi/borsa/şirket ve şans oyunu 18+ yaşında açılır. Yaş sınırları eylem anında da doğrulanır.

Oyun içindeki para yalnızca simülasyon bakiyesidir; gerçek para değildir ve gerçek paraya dönüştürülemez. Bu bilgilendirme oyunun **Ayarlar** ekranında gösterilir.

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

Sosyal medya 13+, romantik ilişki etkinlikleri 16+, iş 16+, ehliyet, kredi, borsa, şirket kurma ve şans oyunu 18+ yaşında açılır. Yetişkin etkinlikleri ve sınavlar uygun yaşa gelmeden kullanılamaz.
