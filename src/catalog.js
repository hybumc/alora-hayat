export const activityCompanions = [
  { id: "solo", label: "tek başına", members: [], minAge: 0, costFactor: 0 },
  { id: "family", label: "ailenle", members: ["mother", "father"], minAge: 0, costFactor: 0.2 },
  { id: "sibling", label: "kardeşinle", members: ["sibling"], minAge: 0, costFactor: 0.15 },
  { id: "friends", label: "arkadaşlarınla", members: [], minAge: 7, costFactor: 0.35 },
  { id: "partner", label: "sevgilinle", members: [], minAge: 16, costFactor: 0.3, requiresPartner: true },
];

export const activityBlueprints = [
  { id: "film", category: "Eğlence", action: "film izle", cost: 180, minAge: 5, effect: { happiness: 5 }, places: ["Atlas Sineması", "Kent Sineması", "Sahil Açık Hava Sineması", "Yıldız AVM Sineması", "Pera Sanat Sineması", "Mahalle Sinema Kulübü", "Göl Kenarı Film Gecesi", "Nostalji Sineması", "Çocuk Film Atölyesi", "Bağımsız Film Festivali"] },
  { id: "kahvalti", category: "Yeme içme", action: "kahvaltı et", cost: 130, minAge: 0, effect: { happiness: 4, health: 1 }, places: ["Simitçi Kahvaltı Salonu", "Bahçe Sofrası", "Deniz Kenarı Kafe", "Köy Kahvaltı Evi", "Fırın Kahvaltı Köşesi", "Aile Lokantası", "Çarşı Kahvaltıcısı", "Göl Manzaralı Kafe", "Pazar Yeri Büfesi", "Yol Üstü Dinlenme Tesisi"] },
  { id: "aksam-yemegi", category: "Yeme içme", action: "akşam yemeği ye", cost: 260, minAge: 0, effect: { happiness: 5, social: 1 }, places: ["Aile Lokantası", "Ev Yemeği Restoranı", "Sahil Balıkçısı", "Köşe Pidecisi", "Esnaf Sofrası", "Bahçe Restoranı", "Çarşı Mantıcısı", "Anadolu Mutfağı", "Şehir Terası", "Mahalle Kebapçısı"] },
  { id: "tatli", category: "Yeme içme", action: "tatlı tadımı yap", cost: 95, minAge: 3, effect: { happiness: 4 }, places: ["Mahalle Pastanesi", "Dondurma Durağı", "Çikolata Atölyesi", "Sütlü Tatlıcı", "Meyveli Tatlı Evi", "Sahil Dondurmacısı", "Fırın Tatlı Tezgâhı", "Geleneksel Şerbetçi", "Küçük Kafe", "Tatlı Festivali"] },
  { id: "muzik", category: "Eğlence", action: "canlı müzik dinle", cost: 380, minAge: 7, effect: { happiness: 5, social: 2 }, places: ["Şehir Konser Salonu", "Park Sahnesi", "Gençlik Merkezi", "Sahil Müzik Sahnesi", "Akustik Kafe", "Açık Hava Amfisi", "Mahalle Kültür Evi", "Caz Kulübü", "Müzik Festivali", "Belediye Konser Alanı"] },
  { id: "tiyatro", category: "Eğlence", action: "oyun izle", cost: 240, minAge: 5, effect: { intelligence: 2, happiness: 4 }, places: ["Şehir Tiyatrosu", "Çocuk Tiyatrosu", "Kukla Sahnesi", "Belediye Sahnesi", "Küçük Bağımsız Tiyatro", "Açık Hava Sahnesi", "Okul Gösteri Salonu", "Tarihi Sahne", "Gezici Tiyatro", "Müzikal Salonu"] },
  { id: "muzeler", category: "Kültür", action: "sergi gez", cost: 110, minAge: 5, effect: { intelligence: 4, happiness: 1 }, places: ["Kent Müzesi", "Bilim Merkezi", "Arkeoloji Müzesi", "Doğa Tarihi Müzesi", "Sanat Galerisi", "Denizcilik Müzesi", "Çocuk Keşif Müzesi", "Fotoğraf Sergisi", "Tarih Evi", "Gezici Bilim Sergisi"] },
  { id: "bowling", category: "Eğlence", action: "bowling oyna", cost: 220, minAge: 7, effect: { happiness: 4, social: 2 }, places: ["Çarşı Bowling Salonu", "Liman Eğlence Merkezi", "Gençlik Bowling Kulübü", "AVM Bowling Pisti", "Mahalle Spor Merkezi", "Aile Eğlence Salonu", "Üniversite Bowling Kulübü", "Yenişehir Bowling", "Sahil Eğlence Alanı", "Şampiyonlar Bowling Salonu"] },
  { id: "paten", category: "Spor", action: "paten kay", cost: 160, minAge: 6, effect: { health: 4, happiness: 2 }, places: ["Sahil Paten Yolu", "Kapalı Buz Pisti", "Şehir Parkı", "Gençlik Spor Merkezi", "Belediye Buz Salonu", "Göl Çevresi Parkuru", "Kapalı Paten Pisti", "Okul Spor Alanı", "Kıyı Yürüyüş Yolu", "Aile Spor Bahçesi"] },
  { id: "yuzme", category: "Spor", action: "yüzmeye git", cost: 190, minAge: 4, effect: { health: 5, happiness: 2 }, places: ["Belediye Yüzme Havuzu", "Sahil Plajı", "Kapalı Olimpik Havuz", "Aile Su Parkı", "Spor Kulübü Havuzu", "Göl Yüzme Alanı", "Termal Havuz", "Okul Havuzu", "Sahil Spor Tesisi", "Yüzme Akademisi"] },
  { id: "dogayuruyusu", category: "Spor", action: "doğa yürüyüşü yap", cost: 70, minAge: 5, effect: { health: 5, happiness: 3 }, places: ["Kent Ormanı", "Göl Yolu", "Sahil Patikası", "Dağ Milli Parkı", "Botanik Bahçesi", "Köy Yolu", "Orman Gözlem Parkuru", "Şehir Korusu", "Kanyon Yürüyüş Yolu", "Doğa Koruma Alanı"] },
  { id: "piknik", category: "Gezi", action: "piknik yap", cost: 140, minAge: 0, effect: { happiness: 5, social: 2 }, places: ["Çınarlı Kent Parkı", "Göl Kenarı", "Sahil Çayırı", "Botanik Bahçesi", "Orman Mesire Alanı", "Tarihi Koruluk", "Şelale Piknik Alanı", "Köy Bahçesi", "Şehir Korusu", "Dağ Mesire Yeri"] },
  { id: "lunapark", category: "Eğlence", action: "eğlence parkına git", cost: 330, minAge: 5, effect: { happiness: 7 }, places: ["Renkli Lunapark", "Sahil Eğlence Parkı", "Mini Tema Parkı", "Bilim ve Oyun Parkı", "Masal Bahçesi", "Dönme Dolap Alanı", "Su Eğlence Parkı", "Gezici Panayır", "Aile Macera Parkı", "Şehir Festival Alanı"] },
  { id: "kitap", category: "Kültür", action: "kitap seç ve oku", cost: 80, minAge: 4, effect: { intelligence: 4, happiness: 1 }, places: ["Mahalle Kütüphanesi", "Sahaflar Çarşısı", "Çocuk Kitaplığı", "Üniversite Kütüphanesi", "Gezici Kitap Otobüsü", "Kitap Fuarı", "Okul Kütüphanesi", "Bağımsız Kitabevi", "Şehir Arşivi", "Kıyı Okuma Evi"] },
  { id: "kodlama", category: "Öğrenme", action: "kodlama atölyesine katıl", cost: 210, minAge: 8, effect: { intelligence: 5, discipline: 2 }, places: ["Gençlik Kodlama Evi", "Belediye Bilim Merkezi", "Okul Teknoloji Kulübü", "Üniversite Atölyesi", "Çocuk Bilim Laboratuvarı", "Mahalle Maker Alanı", "Dijital Tasarım Stüdyosu", "Robotik Kulübü", "Teknoloji Kütüphanesi", "Yazılım Kampı"] },
  { id: "resim", category: "Hobi", action: "resim atölyesine katıl", cost: 170, minAge: 5, effect: { happiness: 3, intelligence: 2 }, places: ["Belediye Resim Atölyesi", "Sanat Evi", "Çocuk Boyama Stüdyosu", "Açık Hava Resim Alanı", "Mahalle Kültür Merkezi", "Üniversite Sanat Kulübü", "Seramik ve Resim Evi", "Gençlik Sanat Odası", "Doğa Çizim Atölyesi", "Galeri Eğitim Salonu"] },
  { id: "seramik", category: "Hobi", action: "seramik yapımını dene", cost: 230, minAge: 7, effect: { happiness: 4, discipline: 2 }, places: ["Çamur Sanat Atölyesi", "Belediye El Sanatları Evi", "Usta Seramikçi", "Mahalle Üretim Stüdyosu", "Sanat Akademisi", "Çocuk Seramik Sınıfı", "Kıyı Çömlek Evi", "Tasarım Atölyesi", "Geleneksel El Sanatları Merkezi", "Açık Atölye Günü"] },
  { id: "yemek-kursu", category: "Öğrenme", action: "yemek kursuna katıl", cost: 290, minAge: 10, effect: { intelligence: 2, discipline: 3, happiness: 2 }, places: ["Belediye Aşçılık Mutfağı", "Mahalle Yemek Atölyesi", "Gençlik Merkezi Mutfağı", "Geleneksel Mutfak Okulu", "Aile Tarifleri Atölyesi", "Üniversite Gastronomi Kulübü", "Fırıncılık Sınıfı", "Dünya Mutfağı Stüdyosu", "Sağlıklı Beslenme Atölyesi", "Açık Mutfak Günü"] },
  { id: "dans", category: "Spor", action: "dans dersine katıl", cost: 200, minAge: 6, effect: { health: 3, happiness: 4, social: 1 }, places: ["Gençlik Dans Stüdyosu", "Belediye Halk Dansları", "Sahil Dans Okulu", "Okul Dans Kulübü", "Modern Dans Salonu", "Mahalle Kültür Evi", "Üniversite Dans Grubu", "Açık Hava Dans Alanı", "Bale Stüdyosu", "Ritim Atölyesi"] },
  { id: "futbol", category: "Spor", action: "futbol maçı oyna", cost: 100, minAge: 6, effect: { health: 5, social: 2 }, places: ["Mahalle Halı Sahası", "Belediye Spor Sahası", "Okul Futbol Sahası", "Gençlik Merkezi", "Kent Parkı Sahası", "Sahil Spor Alanı", "Amatör Kulüp Tesisi", "Üniversite Sahası", "Köy Futbol Alanı", "Kapalı Spor Salonu"] },
];

export const activityTotal = activityBlueprints.length * 10 * activityCompanions.length;

export function getActivityCatalog(life) {
  return activityBlueprints.flatMap((blueprint) => blueprint.places.flatMap((place, placeIndex) =>
    activityCompanions.map((companion, companionIndex) => {
      const familyCost = Math.round(blueprint.cost * companion.costFactor);
      const placeCost = Math.round(blueprint.cost * placeIndex * 0.035);
      const availableAge = Math.max(blueprint.minAge, companion.minAge);
      let lockedReason = life.age < availableAge ? `${availableAge} yaşında açılır` : "";
      if (!lockedReason && companion.requiresPartner && !life.relationship) {
        lockedReason = "Önce bir ilişki kur";
      }
      return {
        id: `${blueprint.id}-${placeIndex}-${companion.id}`,
        title: `${place} · ${blueprint.action} · ${companion.label}`,
        category: blueprint.category,
        cost: blueprint.cost + familyCost + placeCost,
        minAge: availableAge,
        companion: companion.id,
        memberIds: companion.members,
        placeIndex,
        companionIndex,
        effect: blueprint.effect,
        lockedReason,
      };
    }),
  ));
}

export const familyGifts = [
  { id: "card", name: "El yapımı kart", cost: 35, icon: "💌", bond: 2 },
  { id: "chocolate", name: "Çikolata kutusu", cost: 90, icon: "🍫", bond: 3 },
  { id: "book", name: "Sevdiği bir kitap", cost: 160, icon: "📚", bond: 4 },
  { id: "flowers", name: "Bir demet çiçek", cost: 240, icon: "💐", bond: 5 },
  { id: "scarf", name: "Sıcak bir atkı", cost: 420, icon: "🧣", bond: 5 },
  { id: "headphones", name: "Kulaklık", cost: 720, icon: "🎧", bond: 6 },
  { id: "watch", name: "Kol saati", cost: 1350, icon: "⌚", bond: 7 },
  { id: "weekend", name: "Birlikte hafta sonu gezisi", cost: 2400, icon: "🧳", bond: 9 },
];

export const professions = [
  { id: "part-time", name: "Yarı zamanlı çalışan", minAge: 16, education: 0, salary: 12000, intelligence: 0, discipline: 0 },
  { id: "retail", name: "Mağaza satış danışmanı", minAge: 18, education: 1, salary: 24500, intelligence: 30, discipline: 35 },
  { id: "cafe", name: "Kafe çalışanı", minAge: 18, education: 1, salary: 25500, intelligence: 25, discipline: 35 },
  { id: "courier", name: "Kurye", minAge: 18, education: 0, salary: 29000, intelligence: 20, discipline: 35, license: true },
  { id: "cook", name: "Aşçı", minAge: 18, education: 1, salary: 35500, intelligence: 30, discipline: 45 },
  { id: "graphic", name: "Grafik tasarımcı", minAge: 18, education: 1, salary: 39000, intelligence: 55, discipline: 40 },
  { id: "electrician", name: "Elektrik teknisyeni", minAge: 18, education: 1, salary: 42000, intelligence: 45, discipline: 55 },
  { id: "driver", name: "Taksi şoförü", minAge: 21, education: 1, salary: 37500, intelligence: 30, discipline: 45, license: true },
  { id: "trainer", name: "Spor antrenörü", minAge: 20, education: 1, salary: 39000, intelligence: 35, discipline: 50, health: 65 },
  { id: "municipal-support", name: "Belediye destek personeli", minAge: 18, education: 1, salary: 28500, intelligence: 40, discipline: 45, exam: true },
  { id: "municipal-clerk", name: "Belediye memuru", minAge: 20, education: 1, salary: 36500, intelligence: 60, discipline: 60, exam: true },
  { id: "police", name: "Polis memuru", minAge: 21, education: 1, salary: 47500, intelligence: 55, discipline: 65, health: 70, exam: true },
  { id: "municipal-officer", name: "Zabıta memuru", minAge: 21, education: 1, salary: 41500, intelligence: 45, discipline: 65, health: 70, exam: true },
  { id: "accountant", name: "Muhasebeci", minAge: 22, education: 2, salary: 52000, intelligence: 65, discipline: 60 },
  { id: "teacher", name: "Öğretmen", minAge: 22, education: 2, salary: 53500, intelligence: 70, discipline: 65 },
  { id: "nurse", name: "Hemşire", minAge: 22, education: 2, salary: 56500, intelligence: 65, discipline: 65, health: 55 },
  { id: "engineer", name: "Mühendis", minAge: 22, education: 2, salary: 78000, intelligence: 75, discipline: 65 },
  { id: "developer", name: "Yazılım geliştirici", minAge: 22, education: 2, salary: 85000, intelligence: 75, discipline: 60 },
  { id: "architect", name: "Mimar", minAge: 22, education: 2, salary: 72000, intelligence: 72, discipline: 62 },
  { id: "journalist", name: "Gazeteci", minAge: 22, education: 2, salary: 56000, intelligence: 68, discipline: 55 },
  { id: "lawyer", name: "Avukat", minAge: 24, education: 2, salary: 92000, intelligence: 82, discipline: 72 },
  { id: "doctor", name: "Doktor", minAge: 26, education: 2, salary: 125000, intelligence: 88, discipline: 82, health: 55 },
  { id: "psychologist", name: "Psikolog", minAge: 23, education: 2, salary: 72000, intelligence: 75, discipline: 65, social: 65 },
  { id: "veterinarian", name: "Veteriner hekim", minAge: 24, education: 2, salary: 81000, intelligence: 78, discipline: 70 },
  { id: "researcher", name: "Araştırma görevlisi", minAge: 23, education: 2, salary: 62000, intelligence: 82, discipline: 75 },
];

export const contestTypes = [
  { id: "quiz", name: "Genel kültür yarışması", fee: 100, prize: 2500, stat: "intelligence", minAge: 10 },
  { id: "cooking", name: "Genç aşçılar yarışması", fee: 250, prize: 8000, stat: "discipline", minAge: 14 },
  { id: "football", name: "Mahalle futbol turnuvası", fee: 180, prize: 5000, stat: "health", minAge: 10 },
  { id: "art", name: "Şehir sanat yarışması", fee: 150, prize: 4500, stat: "intelligence", minAge: 8 },
  { id: "coding", name: "Kodlama maratonu", fee: 400, prize: 16000, stat: "intelligence", minAge: 14 },
  { id: "music", name: "Sesini duyur müzik yarışması", fee: 350, prize: 12000, stat: "social", minAge: 13 },
  { id: "startup", name: "Genç girişimci sunum günü", fee: 700, prize: 30000, stat: "discipline", minAge: 18 },
];

export const stockMarket = [
  { symbol: "KIVILCIM", name: "Kıvılcım Teknoloji", initialPrice: 920 },
  { symbol: "MAVIDALGA", name: "Mavi Dalga Enerji", initialPrice: 680 },
  { symbol: "BEREKET", name: "Bereket Gıda", initialPrice: 410 },
  { symbol: "SEHIR", name: "Şehir Ulaşım", initialPrice: 550 },
  { symbol: "YARIN", name: "Yarın Sağlık", initialPrice: 760 },
];

export const businessSectors = [
  { id: "cafe", name: "Mahalle kafesi", setup: 18000, monthlyCost: 6500, monthlyRevenue: 9200 },
  { id: "shop", name: "Küçük tasarım dükkânı", setup: 26000, monthlyCost: 8200, monthlyRevenue: 11500 },
  { id: "delivery", name: "Yerel teslimat şirketi", setup: 35000, monthlyCost: 14500, monthlyRevenue: 19500 },
  { id: "studio", name: "Dijital tasarım stüdyosu", setup: 42000, monthlyCost: 9500, monthlyRevenue: 15800 },
  { id: "software", name: "Yazılım girişimi", setup: 65000, monthlyCost: 18000, monthlyRevenue: 29500 },
];

export const universityPrograms = [
  { id: "two-year", name: "Ön lisans programı", score: 190, duration: 2 },
  { id: "teaching", name: "Eğitim fakültesi", score: 305, duration: 4 },
  { id: "nursing", name: "Hemşirelik", score: 330, duration: 4 },
  { id: "engineering", name: "Mühendislik", score: 365, duration: 4 },
  { id: "law", name: "Hukuk", score: 400, duration: 4 },
  { id: "medicine", name: "Tıp", score: 445, duration: 6 },
];

export const familyNamePools = {
  mother: ["Aylin", "Zehra", "Nermin", "Elif", "Sibel", "Derya", "Gül", "Melek", "Figen", "Sevgi", "Yasemin", "Filiz"],
  father: ["Murat", "Cem", "Hakan", "Ali", "Tuncay", "Ömer", "Serkan", "Mehmet", "Erdem", "Levent", "Kemal", "Barış"],
  sibling: ["Ece", "Can", "Eylül", "Deniz", "Emir", "Defne", "Mert", "Duru", "Arda", "Lina", "Ada", "Eren", "Selin", "Bora"],
  partner: ["Ece", "Can", "Eylül", "Emir", "Defne", "Mert", "Duru", "Arda", "Lina", "Eren", "Selin", "Bora", "İpek", "Kerem", "Yağmur", "Efe", "Ceren", "Kaan", "Mina", "Umut", "Naz", "Baran", "Ela", "Deniz", "Sarp", "Lara", "Ozan", "Nehir", "Berk", "İdil"],
  friend: ["Ece", "Can", "Eylül", "Emir", "Defne", "Mert", "Duru", "Arda", "Lina", "Eren", "Selin", "Bora", "İpek", "Kerem", "Yağmur", "Efe"],
};

export const ageEventBank = [
  { range: [2, 6], title: "Oyuncak paylaşımı", description: "Kardeşin en sevdiğin oyuncağı izinsiz aldı. Nasıl davranırsın?", options: [["Sakin sakin geri isterim", { social: 3, discipline: 2 }], ["Birlikte oynayalım derim", { happiness: 4, social: 4 }], ["Anneme anlatırım", { happiness: 1, discipline: 1 }]] },
  { range: [2, 6], title: "Duvara çizdiğin resim", description: "Salon duvarına rengârenk bir resim yaptın. Baban görünce ne dersin?", options: [["Doğruyu söyleyip yardım ederim", { discipline: 3, happiness: 1 }], ["Resmi çerçeveletmeyi öneririm", { intelligence: 2, happiness: 3 }], ["Özür dileyip temizlemeye yardım ederim", { discipline: 4, social: 1 }]] },
  { range: [2, 6], title: "Kırılan oyuncak", description: "Kardeşinle oynarken oyuncağın kırıldı. Önce ne yaparsın?", options: [["Birlikte tamir etmeyi denerim", { intelligence: 3, social: 3 }], ["Üzüldüğümü söylerim", { happiness: 1, social: 2 }], ["Yenisini almak için biriktiririm", { discipline: 3, intelligence: 1, money: -15 }]] },
  { range: [2, 6], title: "Parkta yeni bir arkadaş", description: "Parkta bir çocuk tek başına oturuyor. Oyununa katılmak ister misin?", options: [["Yanına gidip tanışırım", { social: 5, happiness: 3 }], ["Önce birlikte salıncağa binmeyi öneririm", { social: 3, health: 1 }], ["Ailemle kalıp onu oyuna çağırırım", { social: 2, happiness: 2 }]] },
  { range: [2, 6], title: "Yemek masasında küçük kaza", description: "Bardağı devirip masayı ıslattın. Ne yaparsın?", options: [["Peçete alıp temizlerim", { discipline: 3 }], ["Kardeşimden yardım isterim", { social: 2, discipline: 2 }], ["Özür diler, dikkatli olmaya çalışırım", { discipline: 2, happiness: 1 }]] },
  { range: [2, 6], title: "Sana karışan biri", description: "Bir çocuk oyunun kuralına sürekli karışıyor ve seni dinlemiyor. Ne yaparsın?", options: [["Sakin biçimde kendi fikrimi söylerim", { social: 4, discipline: 2 }], ["Sırayla karar vermeyi öneririm", { social: 5, intelligence: 1 }], ["Bir büyüğümden arabuluculuk isterim", { discipline: 2, happiness: 1 }]] },
  { range: [2, 6], title: "Kardeşine yardım", description: "Kardeşin ayakkabısını bağlayamıyor ve acele ediyor. Nasıl yardım edersin?", options: [["Birlikte yavaşça deneriz", { social: 4, discipline: 2 }], ["Ona nasıl yapılacağını gösteririm", { intelligence: 2, social: 3 }], ["Bir yetişkinden yardım isteriz", { happiness: 2, social: 1 }]] },
  { range: [2, 6], title: "Uyku öncesi hikâye", description: "Bu akşam hikâyeyi sen seçebilirsin. Hangisini istersin?", options: [["Meraklı bir gezginin hikâyesi", { intelligence: 3, happiness: 2 }], ["Kardeşimle ortak bir hikâye uydurmak", { social: 4, happiness: 3 }], ["Ailemin çocukluk anılarını dinlemek", { social: 3, intelligence: 2 }]] },
  { range: [7, 11], title: "Sınıfta haksızlık", description: "Bir arkadaşın, yapmadığın bir şey için seni suçladı. Nasıl karşılık verirsin?", options: [["Sakin biçimde ne olduğunu anlatırım", { discipline: 3, social: 3 }], ["Öğretmenden ikimizi de dinlemesini isterim", { intelligence: 2, discipline: 2 }], ["Öfkelensem de biraz sakinleşince konuşurum", { health: 1, discipline: 2 }]] },
  { range: [7, 11], title: "Sınavdan önce yardım", description: "Arkadaşın yazılıdan önce senden cevapları istiyor. Ne yapacaksın?", options: [["Birlikte konu çalışmayı öneririm", { intelligence: 3, social: 3 }], ["Cevapları vermem ama notlarımı paylaşırım", { discipline: 3, social: 1 }], ["Kendi çalışmama odaklanırım", { intelligence: 2, discipline: 2 }]] },
  { range: [7, 11], title: "Takım seçimi", description: "Takım kaptanı en yakın arkadaşlarını seçiyor, seni sona bırakıyor. Ne yaparsın?", options: [["Yine de oyuna katılıp elimden geleni yaparım", { health: 2, discipline: 2 }], ["Başka bir takım kurmayı öneririm", { social: 3, intelligence: 1 }], ["Kaptanla nedenini konuşurum", { social: 3, discipline: 1 }]] },
  { range: [7, 11], title: "Kayıp harçlık", description: "Haftalık harçlığının bir kısmını bulamıyorsun. Nasıl çözersin?", options: [["Harcamalarımı gözden geçiririm", { discipline: 4 }], ["Ailemden borç ister, geri ödeme planı yaparım", { social: 2, money: -20 }], ["Bu hafta masraflarımı azaltırım", { discipline: 3, happiness: -1 }]] },
  { range: [7, 11], title: "Kardeşinin sırrı", description: "Kardeşin bir konuda zorbalığa uğradığını ve kimseye söylemediğini anlattı. Ne yaparsın?", options: [["Yanında olur, güvendiğimiz bir yetişkine birlikte giderim", { social: 4, discipline: 3 }], ["Önce onu dikkatlice dinlerim", { social: 4, happiness: 2 }], ["Sorunu tek başıma çözmeye çalışırım", { discipline: 1, health: -1 }]] },
  { range: [7, 11], title: "Yanlışlıkla kırılan vazo", description: "Top oynarken evdeki vazoyu kırdın; kimse görmedi. Ne yapacaksın?", options: [["Hemen doğruyu söylerim", { discipline: 4, happiness: -1 }], ["Önce parçaları güvenli biçimde toplar, sonra anlatırım", { discipline: 3, social: 1 }], ["Kardeşimle birlikte özür dileriz", { social: 2, discipline: 2 }]] },
  { range: [7, 11], title: "Grup ödevi", description: "Grubundaki biri hiç çalışmıyor ama aynı notu alacak. Ne yaparsın?", options: [["İşleri adil biçimde bölüştürmeyi öneririm", { discipline: 3, social: 3 }], ["Öğretmene durumu saygılı biçimde anlatırım", { intelligence: 2, discipline: 2 }], ["Grubun eksiğini tamamlayıp sonra konuşurum", { intelligence: 2, happiness: -1 }]] },
  { range: [7, 11], title: "Yağmurlu gün planı", description: "Ailece yapılacak gezi yağmur yüzünden iptal oldu. Yeni planın ne?", options: [["Evde aile oyunları düzenlerim", { happiness: 4, social: 3 }], ["Kardeşimle bir şeyler üretirim", { intelligence: 2, social: 3 }], ["Kütüphaneye gitmeyi öneririm", { intelligence: 3, happiness: 1 }]] },
  { range: [12, 16], title: "Arkadaş baskısı", description: "Arkadaşların, istemediğin bir şakaya katılman için ısrar ediyor. Ne yaparsın?", options: [["Hayır der, nedenini açıkça söylerim", { discipline: 4, social: 2 }], ["Konuyu değiştirip gruptan uzaklaşırım", { health: 1, discipline: 2 }], ["Güvendiğim bir arkadaşla konuşurum", { social: 3, happiness: 2 }]] },
  { range: [12, 16], title: "Sınavda kopya teklifi", description: "Sınav sırasında yan sıradaki öğrenci kopya vermeyi teklif ediyor. Kararın ne?", options: [["Reddeder, kendi bilgimle devam ederim", { discipline: 4, intelligence: 1 }], ["Öğretmenden oturma düzenini değiştirmesini isterim", { social: 2, discipline: 2 }], ["Teklifin dikkatimi dağıtmasına izin vermem", { intelligence: 2, health: 1 }]] },
  { range: [12, 16], title: "Birine haksızlık edildi", description: "Sınıfta bir arkadaşınla alay ediliyor. Müdahale edersen sana da takılabilirler. Ne yaparsın?", options: [["Yanında durup güvenilir bir yetişkinden destek alırım", { social: 4, discipline: 3 }], ["Arkadaşımı yalnız bırakmayıp sonra onunla konuşurum", { social: 4, happiness: 1 }], ["Önce ortamı güvenli biçimde dağıtmaya çalışırım", { intelligence: 2, social: 2 }]] },
  { range: [12, 16], title: "Aile bütçesi konuşması", description: "İstediğin pahalı telefonu hemen alamayacağınızı öğrendin. Nasıl yaklaşırsın?", options: [["Birlikte bütçe ve birikim planı yaparım", { discipline: 3, social: 2 }], ["Bir kısmını kendi birikimimden karşılamayı teklif ederim", { discipline: 4, money: -100 }], ["Şimdilik daha uygun bir seçenek araştırırım", { intelligence: 3, happiness: -1 }]] },
  { range: [12, 16], title: "Sosyal medya paylaşımı", description: "Bir arkadaşının izni olmadan çekilmiş komik fotoğrafını paylaşmanı istiyorlar. Ne yaparsın?", options: [["Önce fotoğraftaki arkadaşa sorarım", { discipline: 3, social: 2 }], ["Paylaşmam ve arkadaşımın kararına saygı duyarım", { discipline: 4, happiness: 1 }], ["Fotoğrafı silip başka bir paylaşım öneririm", { intelligence: 1, social: 2 }]] },
  { range: [12, 16], title: "Meslek seçimi kaygısı", description: "Çevrendekiler tek bir mesleği seçmen için baskı yapıyor, ama henüz emin değilsin.", options: [["İlgi alanlarımı araştırırım", { intelligence: 3, happiness: 2 }], ["Rehber öğretmenle seçenekleri konuşurum", { social: 2, discipline: 2 }], ["Karar vermek için kendime zaman tanırım", { happiness: 3, discipline: 1 }]] },
  { range: [17, 20], title: "İlk işte hata", description: "İş yerinde önemli bir siparişi yanlış hazırladın ve müşteri bekliyor. Ne yaparsın?", options: [["Hemen sorumluluk alıp çözümü bildiririm", { discipline: 3, social: 2 }], ["Deneyimli bir çalışma arkadaşımdan destek isterim", { intelligence: 2, social: 3 }], ["Sorunun büyümemesi için doğru kişiye haber veririm", { discipline: 2, intelligence: 1 }]] },
  { range: [17, 20], title: "İlk maaş", description: "İlk düzenli maaşını aldın. Önce ne yapmayı seçersin?", options: [["Bir kısmını aile bütçesine katkı olarak veririm", { social: 3, discipline: 2, money: -500 }], ["Acil durum birikimi ayırırım", { discipline: 4 }], ["Kendime küçük bir hediye alırım", { happiness: 4, money: -300 }]] },
  { range: [17, 20], title: "Ehliyet sınavı", description: "Teorik ehliyet sınavından önce bir hafta kaldı. Hazırlığın nasıl?", options: [["Deneme sınavları ve düzenli tekrar", { intelligence: 3, discipline: 3 }], ["Eksik olduğum konulara odaklanırım", { intelligence: 3, happiness: 1 }], ["Dinlenme ve çalışma arasında denge kurarım", { health: 2, discipline: 1 }]] },
  { range: [17, 20], title: "Ev arkadaşı anlaşmazlığı", description: "Ev arkadaşın ortak faturaları zamanında ödemiyor. Ne yaparsın?", options: [["Sakin bir bütçe konuşması yaparım", { social: 3, discipline: 2 }], ["Ödeme takvimini birlikte düzenlerim", { intelligence: 2, discipline: 3 }], ["Önce neden zorlandığını anlamaya çalışırım", { social: 4, happiness: 1 }]] },
  { range: [17, 20], title: "Aileden destek isteği", description: "Ailenden biri bu ay maddi olarak zorlanıyor. Kendi bütçeni nasıl ayarlarsın?", options: [["İhtiyaçlarımı gözden geçirip destek olurum", { social: 3, money: -500 }], ["Ne kadar destek verebileceğimi açıkça konuşurum", { discipline: 3, social: 2 }], ["Birlikte başka çözümler ararım", { intelligence: 2, social: 2 }]] },
  { range: [21, 100], title: "Beklenmedik iş teklifi", description: "Daha iyi ücretli bir iş teklifi geldi ama yeni ekip ve düzen belirsiz. Nasıl ilerlersin?", options: [["Teklifin koşullarını dikkatlice karşılaştırırım", { intelligence: 3, discipline: 2 }], ["Güvendiğim kişilerden görüş alırım", { social: 3, happiness: 1 }], ["Değişime açık olup görüşmeye giderim", { discipline: 2, social: 2 }]] },
  { range: [21, 100], title: "Yaşlı bir akrabaya yardım", description: "Bir akrabanın randevuya gitmesi gerekiyor; işlerin de yoğun. Ne yaparsın?", options: [["Takvimimi düzenleyip yanında giderim", { social: 3, discipline: 2 }], ["Başka bir aile üyesiyle görev paylaşırım", { social: 4, intelligence: 1 }], ["Ulaşım ayarlayıp gün içinde ararım", { intelligence: 2, social: 2 }]] },
  { range: [21, 100], title: "Tasarruf mu yatırım mı?", description: "Kenara biraz para ayırdın. Yakın dönem masrafları da olabilir.", options: [["Önce acil durum birikimi oluştururum", { discipline: 4 }], ["Riskleri öğrenip küçük bir yatırım denerim", { intelligence: 3, discipline: 1 }], ["Borç varsa önce onu azaltırım", { discipline: 3, happiness: 1 }]] },
  { range: [21, 100], title: "İş arkadaşına sınır koymak", description: "Bir iş arkadaşın mesai dışında sürekli senden iş istiyor. Nasıl cevap verirsin?", options: [["Uygun çalışma sınırımı açıkça söylerim", { discipline: 3, social: 2 }], ["Öncelikleri yöneticimle netleştiririm", { intelligence: 2, discipline: 2 }], ["Yardım edebileceğim zamanı birlikte planlarım", { social: 3, happiness: 1 }]] },
  { range: [21, 100], title: "Küçük şirketin zor ayı", description: "Şirketinin giderleri bu ay gelirini aştı. İlk kararın ne?", options: [["Gereksiz masrafları ve nakit akışını incelerim", { intelligence: 3, discipline: 3 }], ["Müşterilere ulaşmak için yeni bir kampanya hazırlarım", { social: 3, discipline: 1 }], ["Gerekirse işi küçültüp zararı sınırlarım", { discipline: 4, happiness: -1 }]] },
  { range: [21, 100], title: "Ailede fikir ayrılığı", description: "Aile toplantısında herkes başka bir plan istiyor ve sesler yükseliyor. Ne yaparsın?", options: [["Herkesin ne istediğini sırayla dinlerim", { social: 4, discipline: 2 }], ["Ortak bir çözüm için seçenekleri yazarım", { intelligence: 3, social: 2 }], ["Biraz ara verip konuşmaya sonra devam etmeyi öneririm", { health: 1, social: 2 }]] },
  { range: [21, 100], title: "Taşınma kararı", description: "İşine daha yakın bir eve taşınabilirsin ama çevreni ve alışkanlıklarını geride bırakacaksın.", options: [["Masrafları ve ulaşımı karşılaştırırım", { intelligence: 3, discipline: 2 }], ["Yeni çevreyi görmek için evi ziyaret ederim", { social: 2, happiness: 2 }], ["Şimdilik taşınmayı erteleyip birikim yaparım", { discipline: 3 }]] },
  { range: [21, 100], title: "Sağlık kontrolü", description: "Uzun zamandır ertelediğin rutin kontrol için yoğun bir haftada randevu buldun.", options: [["Takvimimi düzenleyip randevuya giderim", { health: 4, discipline: 2 }], ["İşlerimi bitirince yeni tarih alırım", { discipline: 1, happiness: -1 }], ["Yakınımdan ulaşım için yardım isterim", { social: 2, health: 2 }]] },
  { range: [21, 100], title: "Apartman toplantısı", description: "Binada ortak alanın kullanımı konusunda komşular anlaşamıyor. Toplantıda söz alacak mısın?", options: [["Herkesin ihtiyacını dinleyip ortak saat öneririm", { social: 3, intelligence: 2 }], ["Somut bir kullanım çizelgesi hazırlarım", { discipline: 3, intelligence: 2 }], ["Taraf olmadan çözüm önerisini yönetime iletirim", { social: 2, discipline: 2 }]] },
  { range: [21, 100], title: "Beklenmedik masraf", description: "Evde önemli bir eşya bozuldu ve bu ayki bütçeni zorlayacak.", options: [["Önce tamir fiyatı alırım", { intelligence: 3, discipline: 2 }], ["Acil durum birikimimden karşılarım", { discipline: 3, money: -700 }], ["Uygun bir ikinci el seçenek araştırırım", { intelligence: 2, money: -250 }]] },
  { range: [21, 100], title: "Yakınının yeni işi", description: "Bir akraban küçük bir iş kurmak istiyor ve senden hem fikir hem zaman desteği bekliyor.", options: [["İş planını birlikte gözden geçiririm", { intelligence: 3, social: 2 }], ["Ayırabileceğim zamanı net söylerim", { discipline: 3, social: 1 }], ["Bütçemi aşmadan küçük bir katkı sunarım", { social: 3, money: -300 }]] },
  { range: [21, 100], title: "Mesleki eğitim fırsatı", description: "İşinde ilerlemene yardım edecek bir kurs açıldı; ücretli ve akşam saatlerinde.", options: [["Ücretini planlayıp kaydolurum", { intelligence: 3, discipline: 2, money: -450 }], ["Önce ücretsiz kaynaklarla konuyu denerim", { intelligence: 2, discipline: 2 }], ["Bu dönem dinlenmeye öncelik veririm", { health: 2, happiness: 2 }]] },
  { range: [21, 100], title: "Müşteri şikâyeti", description: "Bir müşteri, verdiğin hizmetteki hatayı sert bir dille anlattı. Nasıl karşılık verirsin?", options: [["Sözünü kesmeden dinleyip çözüm sunarım", { social: 3, discipline: 2 }], ["Kayıtları kontrol edip hatayı doğrularım", { intelligence: 3, discipline: 2 }], ["Önce sakinleşip sonra geri dönüş yaparım", { health: 1, discipline: 2 }]] },
  { range: [21, 100], title: "Aile ziyaretini planlamak", description: "Uzun süredir görüşmediğin bir akraban seni ziyarete çağırdı; yol ve konaklama masrafı var.", options: [["Bütçeye uygun bir tarih belirlerim", { social: 3, discipline: 2 }], ["Yol masrafını paylaşmayı öneririm", { intelligence: 2, social: 2 }], ["Şimdilik görüntülü konuşma ayarlarım", { social: 2, happiness: 1 }]] },
  { range: [21, 100], title: "Evde sorumluluk paylaşımı", description: "Ev işlerinin çoğu sana kalıyor. Ev halkıyla bunu nasıl konuşursun?", options: [["Görevleri birlikte listeleyip paylaşırım", { social: 3, discipline: 2 }], ["Önce kendi düzenimi ve beklentimi açıklarım", { discipline: 2, intelligence: 1 }], ["Herkesin yoğunluğunu sorup esnek plan yaparım", { social: 3, happiness: 1 }]] },
  { range: [21, 100], title: "Dinlenme izni", description: "Bir süredir fazla mesai yapıyorsun. Hafta sonu için ek iş teklifi geldi.", options: [["Dinlenmeyi seçip sağlığımı korurum", { health: 3, happiness: 2 }], ["Ücretini ve gerçek ihtiyacımı hesaplarım", { intelligence: 2, discipline: 2 }], ["Kısa süreli yardım edip sınırımı belirtirim", { social: 2, discipline: 2 }]] },
  { range: [21, 100], title: "Birikim hedefi", description: "Uzun vadeli bir hedef için her ay düzenli para ayırman gerekiyor.", options: [["Otomatik birikim miktarı belirlerim", { discipline: 4 }], ["Harcamalarımı bir ay boyunca izlerim", { intelligence: 3, discipline: 1 }], ["Hedefi küçültüp daha ulaşılabilir yaparım", { happiness: 2, discipline: 2 }]] },
  { range: [21, 100], title: "Ücretsiz gönüllülük", description: "Mahallendeki dayanışma grubu hafta sonu yardım etkinliği düzenliyor.", options: [["Bir vardiya için gönüllü olurum", { social: 3, happiness: 2 }], ["İhtiyaç listesini düzenlemeye yardım ederim", { intelligence: 2, discipline: 2 }], ["Zaman ayıramasam da gerekli malzemeyi bağışlarım", { social: 2, money: -120 }]] },
  { range: [21, 100], title: "Yeni yönetici", description: "Ekibine yeni bir yönetici geldi ve çalışma biçimini değiştirmek istiyor.", options: [["Beklentileri bire bir görüşmede sorarım", { social: 2, intelligence: 2 }], ["Yeni yöntemi deneyip sonuçları ölçerim", { discipline: 3, intelligence: 1 }], ["Ekibin kaygılarını yapıcı biçimde aktarırım", { social: 3, discipline: 2 }]] },
  { range: [21, 100], title: "Eski arkadaşla barışmak", description: "Yıllar önce yaşanan anlaşmazlıktan sonra eski bir arkadaşın sana mesaj attı.", options: [["Önce ne hissettiğimizi konuşurum", { social: 3, happiness: 2 }], ["Küçük bir buluşma öneririm", { social: 3, happiness: 1 }], ["Şu an hazır olmadığımı nazikçe söylerim", { discipline: 2, health: 1 }]] },
  { range: [21, 100], title: "Kiralama teklifi", description: "Ev sahibin kira artışı önerdi; bütçeni etkiliyor ama taşınmak da masraflı.", options: [["Sözleşmeyi ve piyasa koşullarını incelerim", { intelligence: 3, discipline: 2 }], ["Daha uygun koşul için sakin pazarlık yaparım", { social: 2, discipline: 2 }], ["Alternatif evlerin toplam maliyetini çıkarırım", { intelligence: 2, discipline: 2 }]] },
  { range: [21, 100], title: "Seyahat bütçesi", description: "Uzun zamandır istediğin gezi için erken rezervasyon fırsatı var.", options: [["Toplam bütçeyi hesaplayıp karar veririm", { intelligence: 2, discipline: 2 }], ["Daha kısa ve uygun bir gezi planlarım", { happiness: 2, discipline: 2 }], ["Birikim hedefimi bozmamak için beklerim", { discipline: 3 }]] },
  { range: [21, 100], title: "Ekip arkadaşına destek", description: "İş arkadaşın ailevi bir nedenle zorlanıyor ve iş yükü geçici olarak arttı.", options: [["İşleri adil biçimde yeniden planlarım", { social: 3, discipline: 2 }], ["Yardım edebileceğim süreyi açıkça söylerim", { discipline: 3, social: 1 }], ["Yöneticiden geçici destek isterim", { intelligence: 2, social: 2 }]] },
  { range: [21, 100], title: "Güvenli yatırım araştırması", description: "Bir tanıdığın hızlı kazanç vadeden yatırım önerdi ama ayrıntıları belirsiz.", options: [["Risk ve koşulları yazılı olarak araştırırım", { intelligence: 3, discipline: 2 }], ["Anlamadığım ürüne para yatırmam", { discipline: 3 }], ["Bağımsız bir uzmandan görüş alırım", { intelligence: 2, social: 1 }]] },
  { range: [21, 100], title: "Aile bütçesine katkı", description: "Ailenin ortak bir masrafı var. Kendi ihtiyaçlarını da gözeterek ne yaparsın?", options: [["Bütçeme uygun net bir katkı belirlerim", { social: 2, discipline: 2, money: -400 }], ["Önce giderleri birlikte gözden geçiririm", { intelligence: 2, social: 2 }], ["Bu ay katkı yapamayacağımı dürüstçe anlatırım", { discipline: 2, happiness: -1 }]] },
  { range: [21, 100], title: "Mahalle etkinliği", description: "Mahalledeki çocuklar için ücretsiz bir etkinlik düzenleniyor; organizasyona yardım edebilirsin.", options: [["Etkinlik akışını hazırlamaya katılırım", { discipline: 2, social: 2 }], ["Bir becerimi çocuklarla paylaşırım", { intelligence: 2, happiness: 2 }], ["Küçük bir malzeme desteği veririm", { social: 2, money: -100 }]] },
  { range: [21, 100], title: "Uzun vadeli hedef değişikliği", description: "Yıllardır peşinden gittiğin hedef artık seni eskisi kadar heyecanlandırmıyor.", options: [["Neden değiştiğini yazıp yeni hedef belirlerim", { intelligence: 3, discipline: 2 }], ["Güvendiğim biriyle açıkça konuşurum", { social: 3, happiness: 1 }], ["Bir süre ara verip kendime zaman tanırım", { health: 2, happiness: 2 }]] },
];
