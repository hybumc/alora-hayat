import {
  activityBlueprints, activityCompanions, activityTotal, businessSectors, contestTypes,
  ageEventBank, familyGifts, familyNamePools, getActivityCatalog, professions, stockMarket, universityPrograms,
} from "./catalog.js";

export const SAVE_KEY = "alora-hayat-save-v1";

export const initialStats = () => ({
  health: 78,
  happiness: 72,
  intelligence: 52,
  discipline: 50,
  social: 45,
});

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function createFamily(excludeName = "") {
  const usedNames = excludeName ? [excludeName.toLocaleLowerCase("tr-TR")] : [];
  const nameFrom = (pool) => {
    const available = pool.filter((name) => !usedNames.includes(name.toLocaleLowerCase("tr-TR")));
    const name = randomItem(available.length ? available : pool);
    usedNames.push(name.toLocaleLowerCase("tr-TR"));
    return name;
  };
  const members = [
    { id: "mother", role: "Anne", name: nameFrom(familyNamePools.mother), age: randomInt(28, 42), closeness: 68, sentMoney: 0 },
    { id: "father", role: "Baba", name: nameFrom(familyNamePools.father), age: randomInt(29, 44), closeness: 65, sentMoney: 0 },
  ];
  const siblingCount = randomInt(1, 2);
  for (let index = 0; index < siblingCount; index += 1) {
    members.push({
      id: index === 0 ? "sibling" : `sibling-${index + 1}`,
      role: index === 0 ? "Kardeş" : `${index + 1}. kardeş`,
      name: nameFrom(familyNamePools.sibling),
      age: randomInt(0, 8),
      closeness: randomInt(48, 65),
      sentMoney: 0,
    });
  }
  return { members, sharedMoments: 0 };
}

function universityDuration(life) {
  return universityPrograms.find((program) => program.name === life.education.program)?.duration || 4;
}

function createFinance() {
  return {
    loan: null,
    stocks: stockMarket.map((stock) => ({ symbol: stock.symbol, price: stock.initialPrice, owned: 0, lastChange: 0 })),
    business: null,
    contestWins: 0,
    contestEntries: 0,
  };
}

export function migrateLife(life) {
  if (!life || typeof life !== "object") return life;
  if (life.version === 1) {
    life.version = 2;
    life.family = life.family || createFamily(life.firstName);
    life.education = {
      ...life.education,
      exams: life.education?.exams || [],
      schoolPlacement: life.education?.schoolPlacement || null,
      lgsScore: life.education?.lgsScore ?? null,
      yksScore: life.education?.yksScore ?? null,
      program: life.education?.program || null,
    };
    const oldSalary = Number(life.career?.salary || 0);
    life.career = {
      ...life.career,
      salary: oldSalary > 0 ? oldSalary * 30 : 0,
      professionId: life.career?.professionId || null,
      license: life.career?.license || { status: "Alınmadı", score: null },
    };
    life.socialMedia = life.socialMedia || { followers: 0, views: 0, likes: 0, posts: 0, incomeMonthly: 0 };
    life.finance = life.finance || createFinance();
    life.activitiesCompleted = life.activitiesCompleted || 0;
    if (typeof life.lastEvent === "string") life.lastEvent = { message: life.lastEvent };
    const cleanLegacyText = (text) => String(text)
      .replace(/sanal TL/g, "₺")
      .replace(/Bu yalnızca oyun içi paradır\.?/g, "")
      .trim();
    life.feed = (life.feed || []).map((item) => ({ ...item, text: cleanLegacyText(item.text) }));
    if (life.lastEvent?.message) life.lastEvent.message = cleanLegacyText(life.lastEvent.message);
  }
  return life;
}

export function isValidLife(life) {
  const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const integer = (value) => Number.isInteger(value) && value >= 0;
  const finite = (value) => Number.isFinite(value) && value >= 0;
  if (!record(life) || life.version !== 2 || typeof life.name !== "string" ||
      typeof life.firstName !== "string" || typeof life.lastName !== "string" ||
      typeof life.birthDate !== "string" || !integer(life.age) || !finite(life.money) || !finite(life.bank)) return false;
  if (!record(life.stats) || !["health", "happiness", "intelligence", "discipline", "social"].every(
    (key) => Number.isFinite(life.stats[key]) && life.stats[key] >= 0 && life.stats[key] <= 100,
  )) return false;
  if (!record(life.education) || typeof life.education.stage !== "string" || !integer(life.education.grade) ||
      !record(life.career) || !(life.career.job === null || typeof life.career.job === "string") ||
      !finite(life.career.salary) || !integer(life.career.experience) ||
      !record(life.career.license) || typeof life.career.license.status !== "string" ||
      !(life.career.license.score === null || (Number.isFinite(life.career.license.score) &&
        life.career.license.score >= 0 && life.career.license.score <= 100))) return false;
  if (life.relationship !== null && (!record(life.relationship) || typeof life.relationship.name !== "string" ||
      !integer(life.relationship.years) || !Number.isFinite(life.relationship.closeness) ||
      life.relationship.closeness < 0 || life.relationship.closeness > 100)) return false;
  if (!record(life.family) || !integer(life.family.sharedMoments) || !Array.isArray(life.family.members) ||
      !life.family.members.some((member) => member.id === "mother") ||
      !life.family.members.some((member) => member.id === "father") ||
      !life.family.members.some((member) => member.id === "sibling") ||
      !life.family.members.every((member) => record(member) && typeof member.name === "string" &&
        typeof member.role === "string" && integer(member.age) && Number.isFinite(member.closeness) &&
        member.closeness >= 0 && member.closeness <= 100 && finite(member.sentMoney))) return false;
  if (!Array.isArray(life.education.exams) ||
      !record(life.socialMedia) || !finite(life.socialMedia.followers) || !finite(life.socialMedia.views) ||
      !finite(life.socialMedia.likes) || !finite(life.socialMedia.posts) || !finite(life.socialMedia.incomeMonthly) ||
      !record(life.finance) || !(life.finance.loan === null || (record(life.finance.loan) &&
        finite(life.finance.loan.balance) && Number.isFinite(life.finance.loan.interestRate) &&
        life.finance.loan.interestRate >= 0 && integer(life.finance.loan.years))) ||
      !Array.isArray(life.finance.stocks) ||
      !life.finance.stocks.every((stock) => record(stock) && typeof stock.symbol === "string" &&
        finite(stock.price) && finite(stock.owned) && Number.isFinite(stock.lastChange)) ||
      !(life.finance.business === null || (record(life.finance.business) &&
        typeof life.finance.business.name === "string" && typeof life.finance.business.sector === "string" &&
        finite(life.finance.business.monthlyRevenue) && finite(life.finance.business.monthlyCost) &&
        integer(life.finance.business.months) && integer(life.finance.business.lossYears) &&
        typeof life.finance.business.closed === "boolean" && typeof life.finance.business.bankrupt === "boolean")) ||
      !integer(life.finance.contestWins) || !integer(life.finance.contestEntries) ||
      !integer(life.activitiesCompleted)) return false;
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
    version: 2,
    name,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    birthDate,
    age: 0,
    money: 250,
    bank: 0,
    stats: initialStats(),
    education: {
      stage: "Okul öncesi", grade: 0, enrolled: null, exam: null, university: null,
      exams: [], schoolPlacement: null, lgsScore: null, yksScore: null, program: null,
    },
    career: { job: null, salary: 0, experience: 0, professionId: null, license: { status: "Alınmadı", score: null } },
    family: createFamily(firstName.trim()),
    socialMedia: { followers: 0, views: 0, likes: 0, posts: 0, incomeMonthly: 0 },
    finance: createFinance(),
    activitiesCompleted: 0,
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
  if (age >= 8 && age < 12 && !life.education.enrolled) return {
    title: age === 8 ? "Okula yeniden bakalım" : "Okula başlama zamanı",
    description: age === 8
      ? "Geçen yıl biraz daha beklemeyi seçtin. Şimdi ilkokula başlamaya ne dersin?"
      : `${age} yaşına geldin ve henüz okula başlamadın. Şimdi başlamak ister misin?`,
    options: [
      outcome("Evet, ilkokula başla", "🎒", { enrolled: true, intelligence: 4, happiness: 2 }),
      outcome("Bir yıl daha bekle", "🏡", { enrolled: false, happiness: 3 }),
    ],
  };
  if (age === 12 && !life.education.enrolled) return {
    title: "Eğitime yeniden başlama",
    description: "Okula daha önce başlamadın. Ortaokuldan devam edebilir veya açık öğretimi seçebilirsin.",
    options: [
      outcome("Ortaokula başlayıp sınavlara hazırlan", "📘", { enrolled: true, school: "Ortaokul", grade: 5, intelligence: 3 }),
      outcome("Açık öğretim yoluna başla", "📖", { enrolled: true, school: "Açık Öğretim", grade: 1 }),
    ],
  };
  if (age === 12) return {
    title: "Ortaokula geçiş",
    description: "İlkokul dönemin tamamlandı. Yıl sonu değerlendirmesine girebilir ya da daha sakin bir geçiş seçebilirsin.",
    options: [
      outcome("Derslerimi gözden geçirip değerlendirmeye gir", "📝", { exam: "middle" }),
      outcome("Sınav yerine okul etkinliklerine ağırlık ver", "🌤️", { exam: "middle-pass", happiness: 3 }),
    ],
  };
  if (age === 14) return {
    title: "LGS ve lise yolu",
    description: "Lise tercihlerini etkileyecek sınava girebilirsin. Puanın ve okul tercihlerin yerleşme sonucunu belirleyecek.",
    options: [
      outcome("LGS'ye gir, puanımı gör", "📝", { exam: "lgs" }),
      outcome("Sınava girmeden yerel okul tercih et", "🏫", { exam: "skip-lgs" }),
    ],
  };
  if (age === 15) {
    const score = life.education.lgsScore;
    const options = [];
    if (score === null || score >= 420) options.push(outcome("Fen lisesi tercih et", "🔬", { school: "Fen Lisesi" }));
    if (score === null || score >= 330) options.push(outcome("Anadolu lisesi tercih et", "🏫", { school: "Anadolu Lisesi" }));
    if (score === null || score >= 220) options.push(outcome("Meslek lisesi tercih et", "🛠️", { school: "Meslek Lisesi" }));
    options.push(outcome("Açık lise yolunu seç", "📖", { school: "Açık Lise" }));
    return {
      title: "Lise tercih sonuçları",
      description: score === null
        ? "LGS puanın olmadığı için yerel okul seçeneklerini değerlendirebilirsin."
        : `LGS puanın ${score}. Tercihlerine göre hangi okul türüne gideceğini seç.`,
      options,
    };
  }
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
      outcome("YKS'ye tekrar gir ve puanımı gör", "✍️", { university: "take", intelligence: 5 }),
      outcome("İşe başla", "💼", { university: "work", job: "Tam zamanlı çalışma" }),
      outcome("Mesleki bir beceri öğren", "🛠️", { university: "skill", discipline: 5 }),
    ],
  };
  const graduationAge = 18 + universityDuration(life);
  if (life.education.stage === "Üniversite" && age >= graduationAge) return {
    title: age === graduationAge ? "Mezuniyet zamanı" : "Eğitimine devam mı?",
    description: `${life.education.program || "Üniversite programında"} ${universityDuration(life)} yıllık eğitim süren tamamlandı. Mezun olabilir veya eğitimine devam edebilirsin.`,
    options: [
      outcome("Mezun ol ve kariyerime başla", "🎓", { graduate: true }),
      outcome("Bir yıl daha eğitimime devam et", "📚", { graduate: false, intelligence: 3 }),
    ],
  };
  if (age === 18) return {
    title: "Üniversite sınavı",
    description: "YKS'ye gerçekten girip puanını görebilir, bir yıl daha hazırlanabilir veya çalışmaya başlayabilirsin.",
    options: [
      outcome("YKS'ye gir ve sonucumu gör", "🎓", { university: "take" }),
      outcome("Bir yıl daha hazırlan", "📚", { university: "retry", intelligence: 4 }),
      outcome("İşe başla", "💼", { university: "work", job: "İş arıyor" }),
    ],
  };
  if (age >= 20 && !life.militaryDone) return {
    title: age === 20 ? "Askerlik kararı" : `${age} yaşında askerlik planı`,
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
  const event = randomItem(ageEventBank.filter((item) =>
    age >= item.range[0] && age <= item.range[1] &&
    !life.history.some((entry) => entry.event === item.title),
  ));
  if (event) {
    return {
      title: event.title,
      description: event.description,
      options: event.options.map(([text, effect]) => outcome(text, "✦", effect)),
    };
  }
  return {
    title: `${age}. yaşında yeni bir karar`,
    description: "Bu yıl önüne çıkan bir fırsatı değerlendirmek için hangi yönüne güveneceksin?",
    options: [
      outcome("Araştırıp plan yaparım", "🔎", { intelligence: 3, discipline: 2 }),
      outcome("Sevdiklerimden görüş alırım", "🫶", { social: 3, happiness: 1 }),
      outcome("Sağlığımı ve dengemi korurum", "🌿", { health: 3, happiness: 2 }),
    ],
  };
}

function addFeed(life, icon, text) {
  life.feed.unshift({ age: life.age, icon, text });
  life.feed = life.feed.slice(0, 40);
}

function adjustBond(life, memberId, amount) {
  const member = life.family.members.find((item) => item.id === memberId);
  if (member) member.closeness = clamp(member.closeness + amount);
}

function educationRank(life) {
  const stage = life.education.stage;
  if (stage === "Üniversite mezunu") return 2;
  if (stage === "Üniversite") return 1;
  if (/Lise|YKS hazırlığı/.test(stage)) return 1;
  return 0;
}

export function careerRequirement(life, profession) {
  if (life.age < profession.minAge) return `${profession.minAge} yaşında açılır`;
  if (educationRank(life) < profession.education) return profession.education === 2 ? "Üniversite mezuniyeti gerekli" : "Lise eğitimi gerekli";
  if (life.stats.intelligence < profession.intelligence || life.stats.discipline < profession.discipline ||
      life.stats.health < (profession.health || 0) || life.stats.social < (profession.social || 0)) return "Beceri puanlarını geliştir";
  if (profession.license && life.career.license.status !== "Aldı") return "Ehliyet gerekli";
  return "";
}

export function getActivityOptions(life) {
  return getActivityCatalog(life);
}

export const activityCount = activityTotal;

export function takeExam(life, type, subject = "") {
  const ageLimits = { written: 7, middle: 12, lgs: 14, yks: 18, license: 18, "civil-service": 18 };
  const minimumAge = ageLimits[type];
  if (minimumAge === undefined) throw new Error("Bu sınav bulunamadı.");
  if (life.age < minimumAge) throw new Error(`Bu sınava ${minimumAge} yaşında girebilirsin.`);
  if (type === "written" && !subject.trim()) throw new Error("Yazılı için bir ders seç.");
  if (life.education.exams.some((exam) => exam.age === life.age && exam.type === type &&
      (type !== "written" || exam.subject === subject))) {
    throw new Error("Bu sınava bu yaşında zaten girdin.");
  }
  if (type === "license" && life.career.license.status === "Aldı") {
    throw new Error("Ehliyet sınavını zaten başarıyla geçtin.");
  }
  const costs = { license: 1800, "civil-service": 250 };
  const fee = costs[type] || 0;
  if (life.money < fee) throw new Error(`Sınav ücreti için ${fee.toLocaleString("tr-TR")} ₺ gerekiyor.`);
  life.money -= fee;

  let score;
  let maxScore;
  let passScore;
  if (type === "lgs") {
    maxScore = 500;
    score = Math.min(maxScore, Math.round(life.stats.intelligence * 3 + life.stats.discipline * 1.6 + randomInt(20, 150)));
  } else if (type === "yks") {
    maxScore = 500;
    const preparation = life.education.exam === "YKS: hazırlandı" ? 45 : life.education.exam === "YKS: dengeli hazırlandı" ? 20 : 0;
    score = Math.min(maxScore, Math.round(life.stats.intelligence * 3.4 + life.stats.discipline * 1.35 + randomInt(20, 120) + preparation));
  } else if (type === "license") {
    maxScore = 100;
    passScore = 60;
    score = Math.min(maxScore, Math.round(life.stats.intelligence * 0.35 + life.stats.discipline * 0.35 + randomInt(5, 35)));
  } else if (type === "civil-service") {
    maxScore = 100;
    passScore = 65;
    score = Math.min(maxScore, Math.round(life.stats.intelligence * 0.4 + life.stats.discipline * 0.4 + randomInt(0, 25)));
  } else {
    maxScore = 100;
    passScore = 50;
    score = Math.min(maxScore, Math.round(life.stats.intelligence * 0.55 + life.stats.discipline * 0.35 + randomInt(0, 18)));
  }

  const passed = passScore === undefined ? null : score >= passScore;
  const result = { type, subject, age: life.age, score, maxScore, passed };
  life.education.exams.push(result);
  if (type === "middle") {
    life.education.stage = "Ortaokul";
    life.education.grade = 6;
    life.education.exam = `Ortaokul değerlendirmesi: ${score}/100`;
  } else if (type === "lgs") {
    life.education.lgsScore = score;
    life.education.exam = `LGS puanı: ${score}/500`;
  } else if (type === "yks") {
    life.education.yksScore = score;
    life.education.exam = `YKS puanı: ${score}/500`;
  } else if (type === "license") {
    life.career.license = { status: passed ? "Aldı" : "Başarısız", score };
  }
  const name = type === "written" ? `${subject} yazılısı` : {
    middle: "Ortaokul değerlendirmesi",
    lgs: "LGS",
    yks: "YKS",
    license: "Ehliyet teorik sınavı",
    "civil-service": "Kamu personeli sınavı",
  }[type];
  const message = `${name}: ${score}/${maxScore}${passed === null ? "" : passed ? " — başarılı" : " — başarısız"}.`;
  addFeed(life, type === "license" ? "🚗" : "📝", message);
  return { ...result, message };
}

export function chooseUniversityProgram(life, programId) {
  if (!Number.isInteger(life.education.yksScore)) throw new Error("Önce YKS'ye girip puanını görmelisin.");
  const program = universityPrograms.find((item) => item.id === programId);
  if (!program) throw new Error("Bu bölüm tercihi bulunamadı.");
  if (life.education.yksScore < program.score) {
    throw new Error(`${program.name} için en az ${program.score} puan gerekiyor; puanın ${life.education.yksScore}.`);
  }
  life.education.program = program.name;
  life.education.university = "Üniversite öğrencisi";
  life.education.stage = "Üniversite";
  life.education.grade = 1;
  const message = `${life.education.yksScore} puanla ${program.name} bölümüne yerleştin.`;
  addFeed(life, "🎓", message);
  return message;
}

export function closeBusiness(life) {
  const business = life.finance.business;
  if (!business || business.closed || business.bankrupt) throw new Error("Kapatılabilecek aktif bir şirketin yok.");
  business.closed = true;
  const message = `${business.name} şirketini kapattın. Kuruluş gideri geri alınmadı.`;
  addFeed(life, "🏢", message);
  return message;
}

export function performFamilyAction(life, { action, memberId, amount, giftId } = {}) {
  const member = life.family.members.find((item) => item.id === memberId);
  if (!member) throw new Error("Aile üyesi bulunamadı.");
  let message;
  let icon = "🫶";
  if (action === "talk") {
    member.closeness = clamp(member.closeness + 2);
    life.stats.social = clamp(life.stats.social + 1);
    message = `${member.name} ile sohbet ettin. Aranızdaki bağ güçlendi.`;
  } else if (action === "time") {
    const cost = member.id.startsWith("sibling") ? 45 : 70;
    if (life.money < cost) throw new Error(`Birlikte etkinlik için ${cost} ₺ gerekiyor.`);
    life.money -= cost;
    member.closeness = clamp(member.closeness + 6);
    life.family.sharedMoments += 1;
    life.stats.happiness = clamp(life.stats.happiness + 3);
    message = `${member.name} ile güzel vakit geçirdin. Yaşın değişmedi.`;
    icon = "🎲";
  } else if (action === "gift") {
    const gift = familyGifts.find((item) => item.id === giftId);
    if (!gift) throw new Error("Hediye seçimi bulunamadı.");
    if (life.money < gift.cost) throw new Error(`${gift.name} için ${gift.cost} ₺ gerekiyor.`);
    life.money -= gift.cost;
    member.closeness = clamp(member.closeness + gift.bond);
    life.stats.happiness = clamp(life.stats.happiness + 2);
    message = `${member.name} için ${gift.name.toLocaleLowerCase("tr-TR")} aldın.`;
    icon = gift.icon;
  } else if (action === "sendMoney") {
    const transfer = Math.floor(Number(amount));
    if (!Number.isFinite(transfer) || transfer < 1 || transfer > life.money) {
      throw new Error("Göndereceğin tutar cüzdanındaki bakiyeyi aşamaz.");
    }
    life.money -= transfer;
    member.sentMoney += transfer;
    member.closeness = clamp(member.closeness + Math.min(8, Math.floor(transfer / 1000) + 1));
    message = `${member.name} için ${transfer.toLocaleString("tr-TR")} ₺ gönderdin.`;
    icon = "💸";
  } else if (action === "askMoney") {
    if (!["mother", "father"].includes(member.id)) throw new Error("Maddi destek yalnızca anne veya babadan istenebilir.");
    const accepted = Math.random() < 0.25 + member.closeness / 140;
    if (!accepted) {
      message = `${member.name} bu ay destek olamayacağını söyledi. Birlikte başka çözüm düşündünüz.`;
    } else {
      const support = randomInt(250, 900) + Math.round(member.closeness * 12);
      life.money += support;
      member.closeness = clamp(member.closeness + 1);
      message = `${member.name} sana ${support.toLocaleString("tr-TR")} ₺ destek oldu.`;
      icon = "🎁";
    }
  } else {
    throw new Error("Aile etkinliği bulunamadı.");
  }
  addFeed(life, icon, message);
  life.history.push({ age: life.age, event: "Aile", choice: message });
  return { message, icon };
}

export function enterContest(life, contestId) {
  const contest = contestTypes.find((item) => item.id === contestId);
  if (!contest) throw new Error("Yarışma bulunamadı.");
  if (life.age < contest.minAge) throw new Error(`Bu yarışmaya ${contest.minAge} yaşında katılabilirsin.`);
  if (life.money < contest.fee) throw new Error(`Katılım için ${contest.fee} ₺ gerekiyor.`);
  life.money -= contest.fee;
  life.finance.contestEntries += 1;
  const skill = life.stats[contest.stat];
  const difficulty = randomInt(44, 91);
  const result = Math.round(skill * 0.72 + life.stats.discipline * 0.28 + randomInt(0, 24));
  const won = result >= difficulty;
  const prize = won ? contest.prize : 0;
  if (won) {
    life.money += prize;
    life.finance.contestWins += 1;
  }
  const message = won
    ? `${contest.name}: ${result} puanla birinci oldun, ${prize.toLocaleString("tr-TR")} ₺ kazandın!`
    : `${contest.name}: ${result} puan aldın. Bu kez ödülü kazanamadın.`;
  addFeed(life, won ? "🏆" : "🎟️", message);
  return { won, score: result, prize, message };
}

export function manageLoan(life, action, amount) {
  if (life.age < 18) throw new Error("Kredi başvurusu 18 yaşında açılır.");
  const value = Math.floor(Number(amount));
  if (!Number.isFinite(value) || value < 1) throw new Error("Geçerli bir tutar gir.");
  if (action === "borrow") {
    const currentBalance = life.finance.loan?.balance || 0;
    const limit = 50000 + life.stats.discipline * 1000 + (life.career.salary ? life.career.salary * 2 : 0);
    if (currentBalance + value > limit) throw new Error(`Kredi limitin ${limit.toLocaleString("tr-TR")} ₺.`);
    life.finance.loan = life.finance.loan || { balance: 0, interestRate: 0.18, years: 0 };
    life.finance.loan.balance += value;
    life.money += value;
    const message = `${value.toLocaleString("tr-TR")} ₺ kredi hesabına geçti. Yıllık faiz oranı %18.`;
    addFeed(life, "🏦", message);
    return message;
  }
  if (action === "repay") {
    const loan = life.finance.loan;
    if (!loan?.balance) throw new Error("Ödenecek kredi borcun yok.");
    if (value > life.money) throw new Error("Ödeme cüzdanındaki bakiyeyi aşamaz.");
    const payment = Math.min(value, loan.balance);
    loan.balance -= payment;
    life.money -= payment;
    if (loan.balance === 0) life.finance.loan = null;
    const message = `${payment.toLocaleString("tr-TR")} ₺ kredi borcunu ödedin.`;
    addFeed(life, "🏦", message);
    return message;
  }
  throw new Error("Kredi işlemi bulunamadı.");
}

export function tradeStock(life, symbol, action, shares) {
  if (life.age < 18) throw new Error("Yatırım hesabı 18 yaşında açılır.");
  const quantity = Math.floor(Number(shares));
  const stock = life.finance.stocks.find((item) => item.symbol === symbol);
  const marketItem = stockMarket.find((item) => item.symbol === symbol);
  if (!stock || !marketItem || !Number.isFinite(quantity) || quantity < 1) throw new Error("Geçerli bir hisse ve adet seç.");
  if (action === "buy") {
    const cost = stock.price * quantity;
    if (cost > life.money) throw new Error(`Bu alım için ${cost.toLocaleString("tr-TR")} ₺ gerekiyor.`);
    life.money -= cost;
    stock.owned += quantity;
    const message = `${quantity} adet ${marketItem.name} hissesini ${cost.toLocaleString("tr-TR")} ₺ karşılığında aldın.`;
    addFeed(life, "📈", message);
    return message;
  }
  if (action === "sell") {
    if (quantity > stock.owned) throw new Error("Satmak istediğin kadar hissen yok.");
    const total = stock.price * quantity;
    stock.owned -= quantity;
    life.money += total;
    const message = `${quantity} adet ${marketItem.name} hissesini ${total.toLocaleString("tr-TR")} ₺ karşılığında sattın.`;
    addFeed(life, "📉", message);
    return message;
  }
  throw new Error("Hisse işlemi bulunamadı.");
}

export function startBusiness(life, sectorId, name) {
  if (life.age < 18) throw new Error("Şirket kurmak için en az 18 yaşında olmalısın.");
  if (life.finance.business && !life.finance.business.closed && !life.finance.business.bankrupt) {
    throw new Error("Aktif bir şirketin var. Önce kapat veya iflas sürecini tamamla.");
  }
  const sector = businessSectors.find((item) => item.id === sectorId);
  const companyName = String(name || "").trim();
  if (!sector || companyName.length < 2 || companyName.length > 30) throw new Error("Şirket adı 2-30 karakter olmalı ve bir sektör seçmelisin.");
  if (life.money < sector.setup) throw new Error(`Şirketi kurmak için ${sector.setup.toLocaleString("tr-TR")} ₺ gerekiyor.`);
  life.money -= sector.setup;
  const skillMultiplier = 0.75 + life.stats.discipline / 250 + life.stats.social / 350;
  life.finance.business = {
    name: companyName,
    sector: sector.name,
    monthlyRevenue: Math.round(sector.monthlyRevenue * skillMultiplier),
    monthlyCost: sector.monthlyCost,
    months: 0,
    lossYears: 0,
    closed: false,
    bankrupt: false,
  };
  const message = `${companyName} şirketini kurdun. İlk yıl gelir-gider dengesini takip et.`;
  addFeed(life, "🏢", message);
  return message;
}

export function applyForCareer(life, professionId) {
  const profession = professions.find((item) => item.id === professionId);
  if (!profession) throw new Error("Meslek bulunamadı.");
  const requirement = careerRequirement(life, profession);
  if (requirement) throw new Error(requirement);
  if (profession.exam) {
    const result = takeExam(life, "civil-service");
    if (!result.passed) throw new Error(`Kamu sınavında ${result.score}/100 aldın; en az 65 puan gerekiyor.`);
  } else if (Math.random() > Math.min(0.95, 0.55 + life.stats.discipline / 250)) {
    throw new Error("Görüşme olumlu geçmedi. Becerilerini geliştirip yeniden başvurabilirsin.");
  }
  life.career.job = profession.name;
  life.career.salary = profession.salary;
  life.career.professionId = profession.id;
  const message = `${profession.name} olarak işe alındın. Aylık maaşın ${profession.salary.toLocaleString("tr-TR")} ₺.`;
  addFeed(life, "💼", message);
  return message;
}

export function leaveCareer(life) {
  if (!life.career.job) throw new Error("Şu anda bir işin yok.");
  const previous = life.career.job;
  life.career.job = null;
  life.career.salary = 0;
  life.career.professionId = null;
  const message = `${previous} işinden ayrıldın.`;
  addFeed(life, "📤", message);
  return message;
}

function updateEconomyForYear(life) {
  for (const stock of life.finance.stocks) {
    const percent = randomInt(-35, 30);
    stock.lastChange = percent;
    stock.price = Math.max(20, Math.round(stock.price * (1 + percent / 100)));
  }
  const loan = life.finance.loan;
  if (loan?.balance > 0) {
    loan.balance = Math.round(loan.balance * (1 + loan.interestRate));
    loan.years += 1;
  }
  const business = life.finance.business;
  if (business && !business.closed && !business.bankrupt) {
    business.months += 12;
    const marketShift = randomInt(-40, 30) / 100;
    const annualProfit = (Math.round(business.monthlyRevenue * (1 + marketShift)) - business.monthlyCost) * 12;
    if (annualProfit >= 0) {
      life.money += annualProfit;
      business.lossYears = 0;
    } else {
      life.money = Math.max(0, life.money + annualProfit);
      business.lossYears += 1;
      if (business.lossYears >= 2) business.bankrupt = true;
    }
  }
  const influenceIncome = life.socialMedia.incomeMonthly * 12;
  if (influenceIncome > 0) life.money += influenceIncome;
  if (life.relationship) life.relationship.years += 1;
}

function applyEffect(life, effect) {
  for (const key of ["health", "happiness", "intelligence", "discipline", "social"]) {
    if (effect[key]) life.stats[key] = clamp(life.stats[key] + effect[key]);
  }
  const education = life.education;
  const messages = [];
  if (typeof effect.money === "number") life.money = Math.max(0, life.money + effect.money);
  if ("enrolled" in effect) {
    education.enrolled = effect.enrolled;
    education.stage = effect.enrolled ? "İlkokul" : "Okul öncesi";
    education.grade = 1;
  }
  if (effect.exam === "middle") {
    messages.push(takeExam(life, "middle").message);
  } else if (effect.exam === "middle-pass") {
    education.exam = "Ortaokula geçiş değerlendirmesi yapılmadı";
    education.stage = "Ortaokul";
    education.grade = 6;
  } else if (effect.exam === "lgs") {
    messages.push(takeExam(life, "lgs").message);
  } else if (effect.exam === "skip-lgs") {
    education.schoolPlacement = "Yerel okul yerleşimi";
    education.stage = "Yerel okul yerleşimi";
    messages.push("LGS'ye girmeden yerel okul yerleşimi seçtin.");
  }
  if (effect.school) {
    education.stage = effect.school;
    education.grade = effect.grade || 1;
    education.schoolPlacement = effect.school;
  }
  if (effect.yks) {
    education.exam = effect.yks === "prepared" ? "YKS: hazırlandı" : effect.yks === "balanced" ? "YKS: dengeli hazırlandı" : "YKS: girilmedi";
  }
  if (effect.university === "take") {
    messages.push(takeExam(life, "yks").message);
  } else if (effect.university === "retry") {
    education.exam = "YKS: tekrar hazırlanıyor";
    education.stage = "YKS hazırlığı";
  } else if (effect.university === "work") {
    education.stage = "Lise mezunu";
    education.university = "Tercih yapılmadı";
    messages.push("Kariyer ekranından eğitim şartlarına uygun işlere başvurabilirsin.");
  }
  if (effect.military) {
    life.military = effect.military;
    life.militaryDone = effect.military === "Tamamlandı";
  }
  if ("graduate" in effect) {
    if (effect.graduate) {
      education.stage = "Üniversite mezunu";
    } else {
      education.stage = "Üniversite";
    }
  }
  return messages.join(" ");
}

export function advanceYear(life, choiceIndex) {
  if (life.lastEvent?.pending) {
    throw new Error("Önce bekleyen yaşam olayındaki seçimini yap.");
  }
  const nextAge = life.age + 1;
  life.age = nextAge;
  for (const member of life.family.members) member.age += 1;
  if (life.education.stage === "İlkokul" && nextAge >= 8 && nextAge <= 10) life.education.grade = nextAge - 6;
  if (life.education.stage === "İlkokul" && nextAge >= 11) {
    life.education.stage = "Ortaokul";
    life.education.grade = 5;
  }
  if (life.education.stage === "Ortaokul" && nextAge >= 12 && nextAge <= 14) life.education.grade = nextAge - 6;
  if (["Fen Lisesi", "Anadolu Lisesi", "Meslek Lisesi", "Açık Lise"].includes(life.education.stage) && nextAge >= 16 && nextAge <= 18) life.education.grade = nextAge - 14;
  if (life.education.stage === "Üniversite" && nextAge < 18 + universityDuration(life)) {
    life.education.grade = Math.max(1, nextAge - 18);
  }
  if (life.career.job && life.career.salary > 0) {
    life.money += life.career.salary * 12;
    life.career.experience += 1;
    if (life.career.experience % 3 === 0) life.career.salary = Math.round(life.career.salary * 1.08);
  } else if (nextAge >= 16) {
    life.money += 250;
  } else {
    life.money += 40;
  }
  updateEconomyForYear(life);
  const event = getAgeEvent(life, nextAge);
  if (event) {
    const pick = Number.isInteger(choiceIndex) ? event.options[choiceIndex] : null;
    if (!pick) {
      life.lastEvent = { pending: true, age: nextAge, event };
      return life;
    }
    const outcomeMessage = applyEffect(life, pick.effect);
    life.history.push({ age: nextAge, event: event.title, choice: pick.text });
    life.lastEvent = { message: `${event.title}: ${pick.text}.${outcomeMessage ? ` ${outcomeMessage}` : ""}` };
    addFeed(life, pick.icon, life.lastEvent.message);
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
  const outcomeMessage = applyEffect(life, choice.effect);
  life.history.push({ age: pending.age, event: pending.event.title, choice: choice.text });
  life.lastEvent = { message: `${pending.event.title}: ${choice.text}.${outcomeMessage ? ` ${outcomeMessage}` : ""}` };
  addFeed(life, choice.icon, life.lastEvent.message);
  return life;
}

export function canDo(life, activity) {
  const limits = { social: 13, date: 16, casino: 18, job: 16, work: 16, fullTime: 18, market: 18, loan: 18, business: 18 };
  return life.age >= (limits[activity] ?? 0);
}

export function doActivity(life, activity, options = {}) {
  if (!canDo(life, activity)) {
    const minAge = { social: 13, date: 16, casino: 18, job: 16, work: 16, fullTime: 18 }[activity];
    throw new Error(`Bu etkinlik için en az ${minAge} yaşında olmalısın.`);
  }
  const result = { message: "", icon: "✨" };
  if (activity === "catalog") {
    const item = getActivityCatalog(life).find((entry) => entry.id === options.id);
    if (!item) throw new Error("Etkinlik bulunamadı.");
    if (item.lockedReason) throw new Error(item.lockedReason);
    if (life.money < item.cost) throw new Error(`${item.title} için ${item.cost.toLocaleString("tr-TR")} ₺ gerekiyor.`);
    life.money -= item.cost;
    for (const [key, change] of Object.entries(item.effect)) {
      if (key in life.stats) life.stats[key] = clamp(life.stats[key] + change);
    }
    if (item.companion === "partner" && life.relationship) {
      life.relationship.closeness = clamp(life.relationship.closeness + 3);
    }
    if (item.companion === "family") {
      adjustBond(life, "mother", 1);
      adjustBond(life, "father", 1);
    } else if (item.companion === "sibling") {
      adjustBond(life, "sibling", 2);
    }
    result.message = `${item.title} etkinliğine katıldın. ${item.cost.toLocaleString("tr-TR")} ₺ harcadın.`;
    result.icon = "✨";
  } else if (activity === "social") {
    const views = Math.max(10, Math.round(35 + life.socialMedia.followers * 0.08 + life.stats.intelligence * 1.5 + randomInt(0, 180)));
    const likes = Math.max(1, Math.round(views * (0.012 + life.stats.social / 2500)));
    const viral = Math.random() < 0.015 + life.stats.social / 2000;
    const newFollowers = Math.max(0, Math.round(likes * 0.05) + randomInt(0, 4) + (viral ? randomInt(100, 550) : 0));
    life.socialMedia.posts += 1;
    life.socialMedia.views += views;
    life.socialMedia.likes += likes;
    life.socialMedia.followers += newFollowers;
    life.socialMedia.incomeMonthly = life.socialMedia.followers >= 5000
      ? Math.floor(life.socialMedia.followers * (0.02 + life.stats.social / 5000))
      : 0;
    life.stats.social = clamp(life.stats.social + 2);
    life.stats.happiness = clamp(life.stats.happiness + 1);
    result.message = `${options.text || "Bugün güzel bir anını"} Alora akışında paylaştın. ${views.toLocaleString("tr-TR")} görüntülenme, ${likes} beğeni${newFollowers ? ` ve ${newFollowers} yeni takipçi` : ""}.${viral ? " Paylaşımın beklenmedik biçimde yayıldı!" : ""}`;
    result.icon = "📱";
  } else if (activity === "date") {
    if (!life.relationship) {
      life.relationship = { name: options.name?.trim() || randomItem(familyNamePools.partner), status: "Birlikte", years: 0, closeness: 45 };
      result.message = `${life.relationship.name} ile yeni bir ilişkiye başladın.`;
    } else {
      life.relationship.closeness = clamp(life.relationship.closeness + 6);
      life.stats.happiness = clamp(life.stats.happiness + 3);
      result.message = `${life.relationship.name} ile güzel vakit geçirdin. İlişkiniz güçlendi; yaşın değişmedi.`;
    }
    result.icon = "💞";
  } else if (activity === "casino") {
    const wager = Math.floor(Number(options.wager));
    if (!Number.isFinite(wager) || wager < 1 || wager > life.money) throw new Error("Bahis miktarı cüzdanındaki bakiyeyi aşamaz.");
    const won = Math.random() < 0.46;
    life.money += won ? wager : -wager;
    result.message = won ? `Şanslıydın! ${wager.toLocaleString("tr-TR")} ₺ kazandın.` : `${wager.toLocaleString("tr-TR")} ₺ kaybettin.`;
    result.icon = won ? "🎲" : "🪙";
  } else if (activity === "work" || activity === "fullTime") {
    const promotion = activity === "fullTime" && life.career.job === "Yarı zamanlı iş";
    if (life.career.job && !promotion) throw new Error("Zaten bir işin var.");
    life.career.job = life.age < 18 ? "Yarı zamanlı iş" : activity === "fullTime" ? "Tam zamanlı çalışma" : "Yeni iş";
    life.career.salary = life.age < 18 ? 12000 : 32000;
    result.message = promotion
      ? `Yarı zamanlı işinden tam zamanlı çalışmaya geçtin. Aylık maaşın ${life.career.salary.toLocaleString("tr-TR")} ₺ oldu.`
      : `${life.career.job} buldun. Aylık maaşın ${life.career.salary.toLocaleString("tr-TR")} ₺.`;
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
    result.message = activity === "deposit" ? `${amount.toLocaleString("tr-TR")} ₺ bankaya yatırıldı.` : `${amount.toLocaleString("tr-TR")} ₺ hesabına aktarıldı.`;
    result.icon = "🏦";
  } else if (activity === "spend") {
    const amount = Math.floor(Number(options.amount));
    if (!Number.isFinite(amount) || amount < 1 || amount > life.money) throw new Error("Geçerli bir tutar gir; cüzdanındaki bakiyeyi aşma.");
    life.money -= amount;
    life.stats.happiness = clamp(life.stats.happiness + Math.min(5, Math.floor(amount / 100)));
    result.message = `${amount.toLocaleString("tr-TR")} ₺ harcadın.`;
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
  life.activitiesCompleted += 1;
  addFeed(life, result.icon, result.message);
  return result;
}

export function saveLife(life, storage = globalThis.localStorage) {
  if (!isValidLife(life)) throw new Error("Geçerli bir hayat kaydı olmadan kayıt yapılamaz.");
  storage.setItem(SAVE_KEY, JSON.stringify(life));
}

export function loadLife(storage = globalThis.localStorage) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  const life = migrateLife(JSON.parse(raw));
  if (!isValidLife(life)) {
    throw new Error("Kayıt dosyası tanınmıyor veya bozuk.");
  }
  return life;
}

