# Alora Hayat

Türkçe, tek oyunculu bir yaşam simülasyonu. Adını, soyadını ve doğum tarihini girerek bebeklikten başla; her yıl **Yaş Atla** seçeneğiyle eğitim, aile, ilişkiler, iş ve ekonomi kararları ver. Oyun ilerlemesi cihazında otomatik kaydedilir.

## Oynanış

- **1.000 etkinlik seçeneği:** 20 etkinlik türünü 10 farklı mekân ve 5 eşlikçi seçeneğiyle ara, yaşına ve bakiyene uygun olanlara katıl.
- **Aile:** Anne, baba ve kardeşlerinle sohbet et, birlikte vakit geçir, hediye al, ebeveynlerinden destek iste veya ailene para gönder. Birlikte zaman geçirmek yaşı ilerletmez.
- **Eğitim:** 7 yaşında ilkokula başla; yazılı, deneme, LGS ve YKS sınavlarında üç soruyu yanıtla. Okul ortalaman ve becerilerin sınav puanını, lise ve üniversite tercihlerini etkiler. Ehliyet ve kamu sınavları da oynanabilir.
- **Kariyer:** Eğitim, yaş, beceri ve ehliyet koşullarına bağlı 40 meslek; kamu kadroları için en az 65 puanlı gerçek bir sınav. İlanlarda aylık maaş ve başvuru koşulları görünür.
- **Sosyal medya:** Video paylaşımları izlenme, beğeni ve takipçi kazandırır. Yaş başına üç video sınırı ve aylık gelir üst sınırı bulunur; tekrar tıklayarak para üretilemez.
- **Ekonomi:** Banka hesap hareketleri ve birikime yıllık faiz; 18+ kredi, hisse senedi, yarışmalar ve aynı anda işletilebilen çoklu şirketler. Her şirketin ürününü, aylık gelirini ve giderini takip et.
- **İlişkiler ve yetişkin etkinlikleri:** Sohbet, akşam yemeği, gönül alma, özel gün, gezi ve ailelerle tanışma gibi ilişki etkinlikleri. Her yaşta ortak etkinlik sınırı var; romantik ilişki 16+, yetişkin etkinlikleri 18+ yaşında açılır.
- **Arayüz:** Baştan yenilenmiş koyu petrol yeşili ve mint temalı tasarım, güncellenmiş ikonlar, hareketler ve isteğe bağlı düğme sesleri.

Oyun içindeki para yalnızca simülasyon bakiyesidir; gerçek para değildir ve gerçek paraya dönüştürülemez. Bu bilgilendirme oyunun **Ayarlar** ekranında gösterilir.

## Windows uygulaması

Windows 10/11 x64 ve Node.js 20+ gerekir. `src/icon.svg` özgün ikon kaynağı, `assets/icon.ico` Windows uygulama ve kurulum simgesidir. Depo kökünde:

```powershell
npm.cmd install
npm.cmd run desktop:dist
```

Kurulum dosyası `release\Alora-Hayat-Setup-1.0.0-x64.exe` yolunda oluşturulur. NSIS sihirbazı kullanıcıya özel kurulum yapar, masaüstü ve Başlat menüsü kısayolları ekler; uygulama Windows **Ayarlar → Uygulamalar → Yüklü uygulamalar** listesinde görünür ve oradan kaldırılabilir. Oyun kayıtları kaldırma sırasında silinmez.

## Güncelleme

v0.2.0 ve sonraki kurulu Windows sürümleri açılışta GitHub Releases sayfasında yeni sürüm arar. Yeni sürüm bulunduğunda uyarı görünür; **Ayarlar → Uygulama güncellemeleri** bölümünden isteğe bağlı olarak indirip kurabilirsin. Güncelleme kayıtlarını korur. Daha önce yüklenmiş v0.1.0 sürümünde otomatik güncelleme denetimi yoktur; bir defaya mahsus v0.2.0 kurulumunu [Releases](https://github.com/hybumc/alora-hayat/releases) sayfasından indirip kurduktan sonra sonraki sürümler otomatik bildirilebilir.

Geliştirme sırasında masaüstü uygulamasını `npm.cmd run desktop:dev`, tarayıcı arayüzünü `npm.cmd run dev` ile başlat. Oyun testleri `npm.cmd test`, web arayüzünün üretim derlemesi `npm.cmd run build` komutlarıyla çalışır.

## Kayıt ve yaş sınırları

Oyun ilerlemesi cihazda otomatik kaydedilir. Ayarlar ekranından kayıt dışa aktarılabilir, içe alınabilir veya sıfırlanabilir. Uygulamayı kaldırmadan önce kaydı dışa aktar; kaldırma işlemi kayıt verisini ayrıca silmez.

Sosyal medya 13+, romantik ilişki etkinlikleri 16+, iş 16+, ehliyet, kredi, borsa, şirket kurma ve şans oyunu 18+ yaşında açılır. Yetişkin etkinlikleri ve sınavlar uygun yaşa gelmeden kullanılamaz.

## Lisans

Alora Hayat, kişisel ve ticari olmayan kullanım için sınırlı izin veren özel bir lisansla dağıtılır. Kaynak kodunu veya varlıkları kopyalama, değiştirme, başka projelerde kullanma ya da yeniden dağıtma izni verilmez. Ayrıntılar ve izin koşulları için [`LICENSE`](LICENSE) dosyasına bakın. Üçüncü taraf bileşenler kendi lisanslarına tabidir.
