export const SAVE_KEY = "alora-hayat-save-v1";

export const initialStats = () => ({
  health: 78,
  happiness: 72,
  intelligence: 52,
  discipline: 50,
  social: 45,
});

export function isValidLife(life) {
  const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const integer = (value) => Number.isInteger(value) && value >= 0;
  const finite = (value) => Number.isFinite(value) && value >= 0;
  if (!record(life) || life.version !== 1 || typeof life.name !== "string" ||
      typeof life.firstName !== "string" || typeof life.lastName !== "string" ||
      typeof life.birthDate !== "string" || !integer(life.age) || !finite(life.money) || !finite(life.bank)) return false;
  if (!record(life.stats) || !["health", "happiness", "intelligence", "discipline", "social"].every(
    (key) => Number.isFinite(life.stats[key]) && life.stats[key] >= 0 && life.stats[key] <= 100,
  )) return false;
  if (!record(life.education) || typeof life.education.stage !== "string" || !integer(life.education.grade) ||
      !record(life.career) || !(life.career.job === null || typeof life.career.job === "string") ||
      !finite(life.career.salary) || !integer(life.career.experience)) return false;
  if (life.relationship !== null && (!record(life.relationship) || typeof life.relationship.name !== "string" ||
      !integer(life.relationship.years) || !Number.isFinite(life.relationship.closeness) ||
      life.relationship.closeness < 0 || life.relationship.closeness > 100)) return false;
  if (!Array.isArray(life.feed) || !Array.isArray(life.history) ||
      !life.feed.every((item) => record(item) && integer(item.age) && typeof item.icon === "string" && typeof item.text === "string") ||
      !life.history.every((item) => record(item) && integer(item.age) && typeof item.event === "string" && typeof item.choice === "string")) return false;
  if (life.lastEvent?.pending) {
    const event = life.lastEvent.event;
    if (!record(event) || typeof event.title !== "string" || typeof event.description !== "string" ||
        !Array.isArray(event.options) || !event.options.every((option) => record(option) &&
          typeof option.text === "string" && typeof option.icon === "string" && record(option.effect))) return false;
  } else if (life.lastEvent !== null && (!record(life.lastEvent) || typeof life.lastEvent.message !== "string")) {
    return false;
  }
  return true;
}

export function createLife({ firstName, lastName, birthDate }) {
  const name = `${firstName.trim()} ${lastName.trim()}`.trim();
  if (!firstName.trim() || !lastName.trim() || !birthDate) {
    throw new Error("Ad, soyad ve doğum tarihi gerekli.");
  }
  const parsedDate = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
    throw new Error("Geçerli ve geçmiş bir doğum tarihi seç.");
  }
  return {
    version: 1,
    name,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    birthDate,
    age: 0,
    money: 250,
    bank: 0,
    stats: initialStats(),
    education: { stage: "Okul öncesi", grade: 0, enrolled: null, exam: null, university: null },
    career: { job: null, salary: 0, experience: 0 },
    relationship: null,
    military: "Henüz karar verilmedi",
    feed: [
      { age: 0, icon: "🌱", text: `${name} dünyaya geldi. Yepyeni bir hayat başladı.` },
    ],
    history: [],
    lastEvent: null,
    createdAt: new Date().toISOString(),
  };
}

export function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function outcome(text, icon, effect = {}) {
  return { text, icon, effect };
}

export function getAgeEvent(life, age) {
  if (age === 1) return {
    title: "İlk adımlar",
    description: "Dünyayı keşfediyorsun. Ailen bu yıl en çok neye odaklansın?",
    options: [
      outcome("Bol bol oyun ve keşif", "🧸", { happiness: 9, social: 3 }),
      outcome("Kitaplar ve merak", "📚", { intelligence: 7, happiness: 2 }),
      outcome("Düzenli uyku ve sağlık", "🌙", { health: 8, discipline: 3 }),
    ],
  };
  if (age === 7) return {
    title: "Okul zamanı",
    description: "Yedi yaşına geldin. İlkokula başlamaya hazır mısın?",
    options: [
      outcome("Evet, okula başla", "🎒", { enrolled: true, intelligence: 5, happiness: 2 }),
      outcome("Bir yıl daha bekle", "🏡", { enrolled: false, happiness: 4 }),
    ],
  };
  if (age === 8 && !life.education.enrolled) return {
    title: "Okula yeniden bakalım",
    description: "Geçen yıl biraz daha beklemeyi seçtin. Şimdi ilkokula başlamaya ne dersin?",
    options: [
      outcome("Evet, ilkokula başla", "🎒", { enrolled: true, intelligence: 4, happiness: 2 }),
      outcome("Bir yıl daha bekle", "🏡", { enrolled: false, happiness: 3 }),
    ],
  };
  if (age === 12) return {
    title: "Ortaokula geçiş",
    description: "İlkokul dönemin tamamlandı. Sınava hazırlanıp yeni bir okula geçebilirsin.",
    options: [
      outcome("Düzenli çalış ve sınava gir", "📝", { exam: "middle", intelligence: 8, discipline: 5 }),
      outcome("Daha sakin bir okul yolu seç", "🌤️", { exam: "middle-pass", happiness: 5 }),
    ],
  };
  if (age === 15) return {
    title: "Lise tercihleri",
    description: "Lise dönemi başlıyor. Hangi yolu seçmek istersin?",
    options: [
      outcome("Akademik lise", "🏫", { school: "Akademik lise", intelligence: 6 }),
      outcome("Meslek lisesi", "🛠️", { school: "Meslek lisesi", discipline: 5 }),
      outcome("Açık lise", "📖", { school: "Açık lise", happiness: 2 }),
    ],
  };
  if (age === 17) return {
    title: "YKS hazırlığı",
    description: "Üniversite sınavına hazırlanmak için bir yılın var. Nasıl ilerleyelim?",
    options: [
      outcome("Yoğun çalış, deneme sınavlarına gir", "✍️", { yks: "prepared", intelligence: 12, discipline: 8, happiness: -4 }),
      outcome("Dengeli hazırlan", "⚖️", { yks: "balanced", intelligence: 6, happiness: 3 }),
      outcome("Üniversite yerine başka hedefler", "🧭", { yks: "skip", happiness: 5 }),
    ],
  };
  if (age === 19 && life.education.stage === "YKS hazırlığı") return {
    title: "YKS'ye tekrar hazırlan",
    description: "Bir yıl daha hazırlandın. Sınava tekrar girebilir veya başka bir yol seçebilirsin.",
    options: [
      outcome("Sınava tekrar gir ve tercih yap", "✍️", { university: "apply", intelligence: 5 }),
      outcome("İşe başla", "💼", { university: "work", job: "Tam zamanlı çalışma" }),
      outcome("Mesleki bir beceri öğren", "🛠️", { university: "skill", discipline: 5 }),
    ],
  };
  if (age === 18) return {
    title: "YKS sonuçları",
    description: "Sonuçların geldi. Sonraki adımın ne olsun?",
    options: [
      outcome("Üniversite tercihlerini yap", "🎓", { university: "apply" }),
      outcome("Bir yıl daha hazırlan", "📚", { university: "retry", intelligence: 4 }),
      outcome("İşe başla", "💼", { university: "work", job: "Tam zamanlı çalışma" }),
    ],
  };
  if (age === 20 && !life.militaryDone) return {
    title: "Askerlik kararı",
    description: "Askerlik planını belirleyebilirsin. Eğitim ve kariyer hedeflerini de düşün.",
    options: [
      outcome("Askerlik görevini tamamla", "🪖", { military: "Tamamlandı", discipline: 8, health: -3 }),
      outcome("Eğitim nedeniyle tecil ettir", "🎓", { military: "Eğitim nedeniyle tecilli", intelligence: 2 }),
      outcome("Şimdilik tecil ettir", "🗓️", { military: "Tecilli" }),
    ],
  };
  if (age === 25) return {
    title: "Yeni bir dönem",
    description: "Bir çeyrek asır geride kaldı. Önceliğin ne olsun?",
    options: [
      outcome("Kariyerimde yükselmek", "📈", { discipline: 5, happiness: 2 }),
      outcome("İlişkilerime ve kendime zaman ayırmak", "💛", { happiness: 8, social: 5 }),
      outcome("Yeni bir beceri öğrenmek", "💡", { intelligence: 6, discipline: 3 }),
    ],
  };
  if (age === 22 && life.education.stage === "Üniversite") return {
    title: "Mezuniyet zamanı",
    description: "Üniversite yılların sona eriyor. Şimdi hangi yola yönelmek istersin?",
    options: [
      outcome("Mezun ol ve kariyerime başla", "🎓", { graduate: true, job: "Üniversite mezunu" }),
      outcome("Bir süre daha eğitimime devam et", "📚", { graduate: false, intelligence: 3 }),
    ],
  };
  const season = age < 7
    ? {
      title: `${age}. yaşında keşif`,
      description: "Yeni yaşında çevreni ve dünyayı keşfetmeye devam ediyorsun. Bu yıl neye ağırlık verelim?",
      options: [
        outcome("Oyun ve yeni arkadaşlar", "🧸", { happiness: 5, social: 3 }),
        outcome("Hikâyeler ve merak", "📖", { intelligence: 4, happiness: 2 }),
        outcome("Dışarıda hareketli zaman", "🌿", { health: 4, happiness: 2 }),
      ],
    }
    : age < 15
      ? {
        title: `${age}. yaşında yeni şeyler`,
        description: "Okul ve arkadaşlıklar hayatının bir parçası. Bu yıl hangi yönünü geliştirmek istersin?",
        options: [
          outcome("Derslerime düzenli çalışmak", "📚", { intelligence: 4, discipline: 3 }),
          outcome("Arkadaşlarımla daha çok vakit geçirmek", "🫶", { social: 5, happiness: 3 }),
          outcome("Hobi ve sporla ilgilenmek", "⚽", { health: 3, happiness: 4 }),
        ],
      }
      : age < 18
        ? {
          title: `${age}. yaşında hedeflerin`,
          description: "Gençlik yıllarında okul, arkadaşlar ve gelecek planları arasında bir denge kur.",
          options: [
            outcome("Sınavlar ve gelecek planı", "✍️", { intelligence: 4, discipline: 4, happiness: -1 }),
            outcome("Kendime ve arkadaşlarıma zaman", "🎧", { social: 4, happiness: 4 }),
            outcome("Sağlıklı bir rutin", "🏃", { health: 4, discipline: 2 }),
          ],
        }
        : {
          title: `${age}. yaşında yeni bir yıl`,
          description: "Bu yıl hayatında hangi konuya daha çok yer açmak istersin?",
          options: [
            outcome("Sağlığıma özen göstermek", "🌿", { health: 4, happiness: 2 }),
            outcome("Yeni şeyler öğrenmek", "✨", { intelligence: 3, discipline: 2 }),
            outcome("Sevdiklerime vakit ayırmak", "🫶", { social: 4, happiness: 3 }),
          ],
        };
  return season;
}

function applyEffect(life, effect) {
  for (const key of ["health", "happiness", "intelligence", "discipline", "social"]) {
    if (effect[key]) life.stats[key] = clamp(life.stats[key] + effect[key]);
  }
  const education = life.education;
  if ("enrolled" in effect) {
    education.enrolled = effect.enrolled;
    education.stage = effect.enrolled ? "İlkokul" : "Okul öncesi";
    education.grade = 1;
  }
  if (effect.exam === "middle") {
    education.exam = "Ortaokul sınavı: başarılı";
    education.stage = "Ortaokul";
    education.grade = 5;
  } else if (effect.exam === "middle-pass") {
    education.exam = "Ortaokula geçiş";
    education.stage = "Ortaokul";
    education.grade = 5;
  }
  if (effect.school) {
    education.stage = effect.school;
    education.grade = 1;
  }
  if (effect.yks) {
    education.exam = effect.yks === "prepared" ? "YKS: hazırlandı" : effect.yks === "balanced" ? "YKS: dengeli hazırlandı" : "YKS: girilmedi";
  }
  if (effect.university === "apply") {
    const successChance = Math.min(0.92, 0.35 + life.stats.intelligence / 180 + (life.education.exam === "YKS: hazırlandı" ? 0.25 : 0));
    if (Math.random() < successChance) {
      education.university = "Üniversite öğrencisi";
      education.stage = "Üniversite";
      life.lastEvent = "Tercihlerinle bir üniversiteye yerleştin!";
    } else {
      education.university = "Yerleşemedi";
      life.lastEvent = "Bu yıl bir bölüme yerleşemedin. Dilersen sonraki yıl tekrar deneyebilirsin.";
    }
  } else if (effect.university === "retry") {
    education.exam = "YKS: tekrar hazırlanıyor";
    education.stage = "YKS hazırlığı";
  } else if (effect.university === "work") {
    life.career.job = effect.job;
    life.career.salary = 900;
  }
  if (effect.military) {
    life.military = effect.military;
    life.militaryDone = effect.military === "Tamamlandı";
  }
  if ("graduate" in effect) {
    if (effect.graduate) {
      education.stage = "Üniversite mezunu";
      life.career.job = effect.job;
      life.career.salary = 1600;
    } else {
      education.stage = "Üniversite";
    }
  }
  if (effect.job && !effect.university && !effect.graduate) {
    life.career.job = effect.job;
    life.career.salary = 900;
  }
}

export function advanceYear(life, choiceIndex) {
  if (life.lastEvent?.pending) {
    throw new Error("Önce bekleyen yaşam olayındaki seçimini yap.");
  }
  const nextAge = life.age + 1;
  life.age = nextAge;
  if (life.education.stage === "İlkokul" && nextAge >= 8 && nextAge <= 11) life.education.grade = nextAge - 6;
  if (life.education.stage === "Ortaokul" && nextAge >= 13 && nextAge <= 14) life.education.grade = nextAge - 7;
  if (["Akademik lise", "Meslek lisesi", "Açık lise"].includes(life.education.stage) && nextAge >= 16 && nextAge <= 18) life.education.grade = nextAge - 14;
  if (life.education.stage === "Üniversite" && nextAge < 22) life.education.grade = Math.max(1, nextAge - 18);
  if (life.career.job && life.career.salary > 0) {
    life.money += life.career.salary * 12;
    life.career.experience += 1;
    if (life.career.experience % 3 === 0) life.career.salary = Math.round(life.career.salary * 1.08);
  } else if (nextAge >= 16) {
    life.money += 250;
  } else {
    life.money += 40;
  }
  const event = getAgeEvent(life, nextAge);
  if (event) {
    const pick = Number.isInteger(choiceIndex) ? event.options[choiceIndex] : null;
    if (!pick) {
      life.lastEvent = { pending: true, age: nextAge, event };
      return life;
    }
    applyEffect(life, pick.effect);
    life.history.push({ age: nextAge, event: event.title, choice: pick.text });
    life.lastEvent = { message: `${event.title}: ${pick.text}.` };
  } else {
    if (nextAge > 0 && nextAge % 4 === 0) {
      life.stats.health = clamp(life.stats.health - 1);
      life.stats.happiness = clamp(life.stats.happiness + (life.relationship ? 1 : 0));
    }
    life.lastEvent = { message: `${nextAge}. yaşına girdin. ${life.career.job ? `Maaşından 12 aylık gelir eklendi.` : "Yıllık harçlığın hesabına eklendi."}` };
  }
  return life;
}

export function chooseEvent(life, choiceIndex) {
  const pending = life.lastEvent?.pending ? life.lastEvent : null;
  if (!pending) throw new Error("Yanıtlanacak bir yaşam olayı yok.");
  const choice = pending.event.options[choiceIndex];
  if (!choice) throw new Error("Geçersiz seçim.");
  applyEffect(life, choice.effect);
  life.history.push({ age: pending.age, event: pending.event.title, choice: choice.text });
  life.lastEvent = { message: `${pending.event.title}: ${choice.text}.` };
  life.feed.unshift({ age: pending.age, icon: choice.icon, text: life.lastEvent.message });
  life.feed = life.feed.slice(0, 40);
  return life;
}

export function canDo(life, activity) {
  const limits = { social: 13, date: 16, casino: 18, job: 16, work: 16, fullTime: 18 };
  return life.age >= (limits[activity] ?? 0);
}

export function doActivity(life, activity, options = {}) {
  if (!canDo(life, activity)) {
    const minAge = { social: 13, date: 16, casino: 18, job: 16, work: 16, fullTime: 18 }[activity];
    throw new Error(`Bu etkinlik için en az ${minAge} yaşında olmalısın.`);
  }
  const result = { message: "", icon: "✨" };
  if (activity === "social") {
    life.stats.social = clamp(life.stats.social + 2);
    life.stats.happiness = clamp(life.stats.happiness + 1);
    result.message = `${options.text || "Bugün güzel bir anını"} Alora akışında paylaştın.`;
    result.icon = "📱";
  } else if (activity === "date") {
    if (!life.relationship) {
      life.relationship = { name: options.name?.trim() || "Deniz", status: "Birlikte", years: 0, closeness: 55 };
      result.message = `${life.relationship.name} ile yeni bir ilişkiye başladın.`;
    } else {
      life.relationship.years += 1;
      life.relationship.closeness = clamp(life.relationship.closeness + 6);
      life.stats.happiness = clamp(life.stats.happiness + 3);
      result.message = `${life.relationship.name} ile güzel vakit geçirdin. İlişkiniz güçlendi.`;
    }
    result.icon = "💞";
  } else if (activity === "casino") {
    const wager = Math.floor(Number(options.wager));
    if (!Number.isFinite(wager) || wager < 1 || wager > life.money) throw new Error("Bahis miktarı mevcut sanal paran kadar ve en az 1 TL olmalı.");
    const won = Math.random() < 0.46;
    life.money += won ? wager : -wager;
    result.message = won ? `Şanslıydın! ${wager} sanal TL kazandın.` : `${wager} sanal TL kaybettin. Bu yalnızca oyun içi paradır.`;
    result.icon = won ? "🎲" : "🪙";
  } else if (activity === "work" || activity === "fullTime") {
    const promotion = activity === "fullTime" && life.career.job === "Yarı zamanlı iş";
    if (life.career.job && !promotion) throw new Error("Zaten bir işin var.");
    life.career.job = life.age < 18 ? "Yarı zamanlı iş" : activity === "fullTime" ? "Tam zamanlı çalışma" : "Yeni iş";
    life.career.salary = life.age < 18 ? 400 : 1100;
    result.message = promotion
      ? `Yarı zamanlı işinden tam zamanlı çalışmaya geçtin. Yıllık kazancın ${life.career.salary.toLocaleString("tr-TR")} sanal TL oldu.`
      : `${life.career.job} buldun. Yıllık kazancın ${life.career.salary.toLocaleString("tr-TR")} sanal TL.`;
    result.icon = "💼";
  } else if (activity === "study") {
    life.stats.intelligence = clamp(life.stats.intelligence + 5);
    life.stats.discipline = clamp(life.stats.discipline + 2);
    life.stats.happiness = clamp(life.stats.happiness - 1);
    result.message = "Düzenli çalıştın. Bilgin ve disiplinin arttı.";
    result.icon = "📚";
  } else if (activity === "exercise") {
    life.stats.health = clamp(life.stats.health + 5);
    life.stats.happiness = clamp(life.stats.happiness + 2);
    result.message = "Hareketli bir gün geçirdin. Kendini daha iyi hissediyorsun.";
    result.icon = "🏃";
  } else if (activity === "deposit" || activity === "withdraw") {
    const amount = Math.floor(Number(options.amount));
    const source = activity === "deposit" ? "money" : "bank";
    const target = activity === "deposit" ? "bank" : "money";
    if (!Number.isFinite(amount) || amount < 1 || amount > life[source]) throw new Error("Geçerli bir tutar gir; kullanılabilir bakiyeni aşma.");
    life[source] -= amount;
    life[target] += amount;
    result.message = activity === "deposit" ? `${amount.toLocaleString("tr-TR")} sanal TL bankaya yatırıldı.` : `${amount.toLocaleString("tr-TR")} sanal TL hesabına aktarıldı.`;
    result.icon = "🏦";
  } else if (activity === "spend") {
    const amount = Math.floor(Number(options.amount));
    if (!Number.isFinite(amount) || amount < 1 || amount > life.money) throw new Error("Geçerli bir tutar gir; cüzdanındaki sanal parayı aşma.");
    life.money -= amount;
    life.stats.happiness = clamp(life.stats.happiness + Math.min(5, Math.floor(amount / 100)));
    result.message = `${amount.toLocaleString("tr-TR")} sanal TL harcadın.`;
    result.icon = "🛍️";
  } else if (activity === "breakup") {
    if (!life.relationship) throw new Error("Şu anda bir ilişkin yok.");
    const name = life.relationship.name;
    life.relationship = null;
    life.stats.happiness = clamp(life.stats.happiness - 8);
    result.message = `${name} ile yollarınızı ayırdınız.`;
    result.icon = "💔";
  } else {
    throw new Error("Bu etkinlik tanınmıyor.");
  }
  life.feed.unshift({ age: life.age, icon: result.icon, text: result.message });
  life.feed = life.feed.slice(0, 40);
  return result;
}

export function saveLife(life, storage = globalThis.localStorage) {
  storage.setItem(SAVE_KEY, JSON.stringify(life));
}

export function loadLife(storage = globalThis.localStorage) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  const life = JSON.parse(raw);
  if (!isValidLife(life)) {
    throw new Error("Kayıt dosyası tanınmıyor veya bozuk.");
  }
  return life;
}

