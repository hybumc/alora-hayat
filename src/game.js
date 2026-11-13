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
    businesses: [],
    transactions: [],
    savingsRate: 0.035,
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
  if (life.version === 2) {
    const businesses = Array.isArray(life.finance?.businesses) ? life.finance.businesses : [];
    if (life.finance?.business && !businesses.some((item) => item.name === life.finance.business.name)) {
      businesses.push({ ...life.finance.business, id: `company-${businesses.length + 1}` });
    }
    life.finance = {
      ...createFinance(),
      ...life.finance,
      businesses: businesses.map((item, index) => ({
        ...item,
        id: item.id || `company-${index + 1}`,
        product: item.product || item.sector,
      })),
      transactions: Array.isArray(life.finance?.transactions) ? life.finance.transactions : [],
      savingsRate: Number.isFinite(life.finance?.savingsRate) ? life.finance.savingsRate : 0.035,
    };
    life.finance.business = life.finance.businesses[life.finance.businesses.length - 1] || null;
    life.education = {
      ...life.education,
      schoolAverage: Number.isFinite(life.education.schoolAverage) ? life.education.schoolAverage : 65,
      mockExams: Array.isArray(life.education.mockExams) ? life.education.mockExams : [],
      pendingExam: life.education.pendingExam || null,
    };
    life.relationship = life.relationship ? {
      ...life.relationship,
      sharedMoments: Number.isInteger(life.relationship.sharedMoments) ? life.relationship.sharedMoments : 0,
      gifts: Number.isInteger(life.relationship.gifts) ? life.relationship.gifts : 0,
      lastAction: life.relationship.lastAction || null,
      actionsThisAge: Number.isInteger(life.relationship.actionsThisAge) ? life.relationship.actionsThisAge : 0,
      actionAge: Number.isInteger(life.relationship.actionAge) ? life.relationship.actionAge : life.age,
    } : null;
    life.socialMedia = {
      ...life.socialMedia,
      postsThisAge: Number.isInteger(life.socialMedia?.postsThisAge) ? life.socialMedia.postsThisAge : 0,
      lastPostAge: Number.isInteger(life.socialMedia?.lastPostAge) ? life.socialMedia.lastPostAge : null,
    };
    life.version = 3;
  }
  return life;
}

export function isValidLife(life) {
  const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const integer = (value) => Number.isInteger(value) && value >= 0;
  const finite = (value) => Number.isFinite(value) && value >= 0;
  if (!record(life) || life.version !== 3 || typeof life.name !== "string" ||
      typeof life.firstName !== "string" || typeof life.lastName !== "string" ||
      typeof life.birthDate !== "string" || !integer(life.age) || !finite(life.money) || !finite(life.bank)) return false;
  if (!record(life.stats) || !["health", "happiness", "intelligence", "discipline", "social"].every(
    (key) => Number.isFinite(life.stats[key]) && life.stats[key] >= 0 && life.stats[key] <= 100,
  )) return false;
  if (!record(life.education) || typeof life.education.stage !== "string" || !integer(life.education.grade) ||
      !Number.isFinite(life.education.schoolAverage) || life.education.schoolAverage < 0 || life.education.schoolAverage > 100 ||
      !Array.isArray(life.education.mockExams) ||
      !(life.education.pendingExam === null || (record(life.education.pendingExam) &&
        typeof life.education.pendingExam.type === "string" && Array.isArray(life.education.pendingExam.questions) &&
        life.education.pendingExam.questions.length === 3)) ||
      !record(life.career) || !(life.career.job === null || typeof life.career.job === "string") ||
      !finite(life.career.salary) || !integer(life.career.experience) ||
      !record(life.career.license) || typeof life.career.license.status !== "string" ||
      !(life.career.license.score === null || (Number.isFinite(life.career.license.score) &&
        life.career.license.score >= 0 && life.career.license.score <= 100))) return false;
  if (life.relationship !== null && (!record(life.relationship) || typeof life.relationship.name !== "string" ||
      !integer(life.relationship.years) || !Number.isFinite(life.relationship.closeness) ||
      life.relationship.closeness < 0 || life.relationship.closeness > 100 ||
      !integer(life.relationship.sharedMoments) || !integer(life.relationship.gifts))) return false;
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
      !integer(life.socialMedia.postsThisAge) ||
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
      !Array.isArray(life.finance.businesses) ||
      !life.finance.businesses.every((business) => record(business) && typeof business.id === "string" &&
        typeof business.name === "string" && typeof business.sector === "string" && typeof business.product === "string" &&
        finite(business.monthlyRevenue) && finite(business.monthlyCost) && integer(business.months) &&
        integer(business.lossYears) && typeof business.closed === "boolean" && typeof business.bankrupt === "boolean") ||
      !Array.isArray(life.finance.transactions) ||
      !Number.isFinite(life.finance.savingsRate) || life.finance.savingsRate < 0 || life.finance.savingsRate > 0.2 ||
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
    version: 3,
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
      schoolAverage: 65, mockExams: [], pendingExam: null,
    },
    career: { job: null, salary: 0, experience: 0, professionId: null, license: { status: "Alınmadı", score: null } },
    family: createFamily(firstName.trim()),
    socialMedia: { followers: 0, views: 0, likes: 0, posts: 0, incomeMonthly: 0, postsThisAge: 0, lastPostAge: null },
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

const examQuestions = {
  "Türkçe": [
    { prompt: "“Özenle” sözcüğünün yakın anlamlısı hangisidir?", choices: ["Dikkatlice", "Rastgele", "Hızlıca"], answer: 0 },
    { prompt: "“Kitaplar masanın üzerindeydi.” cümlesinde yüklem hangisidir?", choices: ["Kitaplar", "Masanın", "Üzerindeydi"], answer: 2 },
    { prompt: "Hangisi doğru yazılmıştır?", choices: ["Herşey", "Birçok", "Yanlız"], answer: 1 },
  ],
  "Matematik": [
    { prompt: "Bir ürün 240 TL iken %25 indirimle kaç TL olur?", choices: ["180", "200", "215"], answer: 0 },
    { prompt: "3x + 5 = 20 ise x kaçtır?", choices: ["3", "5", "8"], answer: 1 },
    { prompt: "Kenarları 6 ve 8 cm olan dikdörtgenin alanı kaç cm²?", choices: ["28", "42", "48"], answer: 2 },
  ],
  "Fen Bilimleri": [
    { prompt: "Suyun deniz seviyesinde kaynama sıcaklığı kaç °C'tir?", choices: ["90", "100", "110"], answer: 1 },
    { prompt: "Bitkiler fotosentez sırasında hangi gazı kullanır?", choices: ["Oksijen", "Azot", "Karbondioksit"], answer: 2 },
    { prompt: "Elektrik akımını ölçen araç hangisidir?", choices: ["Ampermetre", "Termometre", "Barometre"], answer: 0 },
  ],
  "Sosyal Bilgiler": [
    { prompt: "Türkiye Büyük Millet Meclisi hangi yıl açılmıştır?", choices: ["1919", "1920", "1923"], answer: 1 },
    { prompt: "Haritada yön bulmak için kullanılan temel araç hangisidir?", choices: ["Pusula", "Barometre", "Termometre"], answer: 0 },
    { prompt: "Yerel yönetimlerin başında hangi görevli bulunur?", choices: ["Vali", "Belediye başkanı", "Kaymakam"], answer: 1 },
  ],
  "İngilizce": [
    { prompt: "“I have lived here ___ 2020.” boşluğuna ne gelir?", choices: ["since", "for", "during"], answer: 0 },
    { prompt: "“Carefully” sözcüğünün anlamı nedir?", choices: ["Dikkatlice", "Cesurca", "Nadiren"], answer: 0 },
    { prompt: "“She ___ to school every day.” boşluğuna ne gelir?", choices: ["go", "goes", "going"], answer: 1 },
  ],
  "Genel Yetenek": [
    { prompt: "Dizi: 2, 6, 12, 20, ? Sıradaki sayı hangisi?", choices: ["28", "30", "32"], answer: 1 },
    { prompt: "Bir sınıfta 12 kız ve 8 erkek var. Öğrencilerin kaçta kaçı erkektir?", choices: ["2/5", "3/5", "1/2"], answer: 0 },
    { prompt: "Bir işi 4 kişi 6 günde bitiriyorsa aynı hızla 8 kişi kaç günde bitirir?", choices: ["2", "3", "4"], answer: 1 },
  ],
  "LGS": [
    { prompt: "Bir sayının 3 katının 7 eksiği 20'dir. Bu sayı kaçtır?", choices: ["7", "9", "11"], answer: 1 },
    { prompt: "DNA'nın hücrede bulunduğu temel yapı hangisidir?", choices: ["Çekirdek", "Ribozom", "Hücre zarı"], answer: 0 },
    { prompt: "“Özgürlük” sözcüğünün zıt anlamlısı hangisidir?", choices: ["Bağımsızlık", "Tutsaklık", "Seçim"], answer: 1 },
  ],
  "YKS": [
    { prompt: "f(x)=2x²−3x ise f(2) kaçtır?", choices: ["2", "4", "8"], answer: 0 },
    { prompt: "Bir maddenin pH değeri 2 ise bu madde için hangisi doğrudur?", choices: ["Asidiktir", "Nötrdür", "Baziktir"], answer: 0 },
    { prompt: "Bir üçgende iç açıların toplamı kaç derecedir?", choices: ["90", "180", "360"], answer: 1 },
  ],
  "Ehliyet": [
    { prompt: "Kontrolsüz kavşağa yaklaşırken ilk olarak ne yapılmalıdır?", choices: ["Hız artırılır", "Hız azaltılıp geçiş hakkı kontrol edilir", "Korna çalınıp devam edilir"], answer: 1 },
    { prompt: "Kırmızı ışıkta sürücünün davranışı ne olmalıdır?", choices: ["Durmak", "Yavaşlayıp geçmek", "Yalnızca korna çalmak"], answer: 0 },
    { prompt: "Emniyet kemeri kimler için kullanılmalıdır?", choices: ["Yalnızca sürücü", "Ön koltuktakiler", "Araçtaki herkes"], answer: 2 },
  ],
  "Kamu Bilgisi": [
    { prompt: "Kamu hizmetlerinde temel ilkelerden biri hangisidir?", choices: ["Eşitlik ve tarafsızlık", "Kişiye göre işlem", "Bilgiyi saklama"], answer: 0 },
    { prompt: "Bir vatandaşın başvurusu alındığında ne yapılmalıdır?", choices: ["Kayıt altına alıp süresinde yanıtlamak", "Yanıtsız bırakmak", "Sözlü olarak geri çevirmek"], answer: 0 },
    { prompt: "Kamu kaynakları nasıl kullanılmalıdır?", choices: ["Kişisel ihtiyaçlar için", "Amacına uygun ve hesap verebilir biçimde", "Kayıt tutulmadan"], answer: 1 },
  ],
};

const examAgeLimits = { written: 7, middle: 12, lgs: 14, yks: 18, license: 18, "civil-service": 18, mock: 10 };

export function beginExam(life, type, subject = "") {
  const minimumAge = examAgeLimits[type];
  if (minimumAge === undefined) throw new Error("Bu sınav bulunamadı.");
  if (life.age < minimumAge) throw new Error(`Bu sınava ${minimumAge} yaşında girebilirsin.`);
  if (life.education.pendingExam) throw new Error("Önce devam eden sınavını tamamla.");
  if (type === "written" && !examQuestions[subject]) throw new Error("Bu ders için sınav sorusu bulunamadı.");
  if (type === "mock" && life.age < 10) throw new Error("Deneme sınavları 10 yaşında açılır.");
  if (type === "mock" && life.education.mockExams.some((exam) => exam.age === life.age)) {
    throw new Error("Bu yaşında deneme sınavına zaten girdin. Yeni deneme için yaş atla.");
  }
  if (type === "license" && life.career.license.status === "Aldı") throw new Error("Ehliyet sınavını zaten başarıyla geçtin.");
  if (["written", "middle", "lgs", "yks", "license", "civil-service"].includes(type) &&
      life.education.exams.some((exam) => exam.age === life.age && exam.type === type &&
        (type !== "written" || exam.subject === subject))) {
    throw new Error("Bu sınava bu yaşında zaten girdin.");
  }
  const fee = type === "license" ? 1800 : type === "civil-service" ? 250 : 0;
  if (life.money < fee) throw new Error(`Sınav ücreti için ${fee.toLocaleString("tr-TR")} ₺ gerekiyor.`);
  if (fee) {
    life.money -= fee;
    recordTransaction(life, "expense", fee, type === "license" ? "Ehliyet sınavı ücreti" : "Kamu sınavı ücreti");
  }
  const questionSet = type === "written"
    ? examQuestions[subject]
    : type === "lgs"
      ? examQuestions.LGS
      : type === "yks"
        ? examQuestions.YKS
    : type === "license"
      ? examQuestions.Ehliyet
      : type === "civil-service"
        ? examQuestions["Kamu Bilgisi"]
        : type === "mock"
          ? examQuestions["Genel Yetenek"]
          : examQuestions.Matematik;
  life.education.pendingExam = {
    type,
    subject: type === "written" ? subject : type === "mock" ? "Genel Yetenek denemesi" : "",
    questions: questionSet.map(({ prompt, choices, answer }) => ({ prompt, choices, answer })),
  };
  return life.education.pendingExam;
}

export function submitExam(life, answers) {
  const pending = life.education.pendingExam;
  if (!pending) throw new Error("Tamamlanacak bir sınav yok.");
  if (!Array.isArray(answers) || answers.length !== pending.questions.length ||
      answers.some((answer, index) => !Number.isInteger(Number(answer)) ||
        Number(answer) < 0 || Number(answer) >= pending.questions[index].choices.length)) {
    throw new Error("Devam etmek için üç sorunun da cevabını seç.");
  }
  const correct = answers.reduce((count, answer, index) =>
    count + (Number(answer) === pending.questions[index].answer ? 1 : 0), 0);
  const { type, subject } = pending;
  const maxScore = ["lgs", "yks"].includes(type) ? 500 : 100;
  const passScore = type === "license" ? 60 : type === "civil-service" ? 65 : 50;
  const studyBoost = type === "yks" && life.education.exam === "YKS: hazırlandı" ? 30
    : type === "yks" && life.education.exam === "YKS: dengeli hazırlandı" ? 15 : 0;
  const quizScore = Math.round((correct / pending.questions.length) * (maxScore * 0.72));
  const aptitude = type === "lgs" || type === "yks"
    ? life.stats.intelligence * 0.75 + life.stats.discipline * 0.55 + life.education.schoolAverage * 0.08
    : life.stats.intelligence * 0.35 + life.stats.discipline * 0.25 +
      (type === "written" || type === "mock" ? life.education.schoolAverage * 0.12 : 0);
  const score = Math.min(maxScore, Math.max(0, Math.round(quizScore + aptitude + studyBoost + randomInt(0, maxScore * 0.08))));
  const passed = score >= passScore;
  const result = { type, subject, age: life.age, score, maxScore, passed, correct, total: pending.questions.length };
  life.education.pendingExam = null;
  life.education.exams.push(result);
  if (type === "written" || type === "mock") {
    life.education.schoolAverage = Math.round((life.education.schoolAverage * 0.7 + score * 0.3) * 10) / 10;
    if (type === "mock") life.education.mockExams.push({ age: life.age, score, correct, total: pending.questions.length });
  }
  if (type === "lgs") life.education.lgsScore = score;
  if (type === "yks") life.education.yksScore = score;
  if (type === "license") life.career.license = { status: passed ? "Aldı" : "Başarısız", score };
  const examName = type === "written" ? `${subject} yazılısı`
    : type === "mock" ? "Deneme sınavı"
      : ({ middle: "Ortaokul değerlendirmesi", lgs: "LGS", yks: "YKS", license: "Ehliyet sınavı", "civil-service": "Kamu personeli sınavı" })[type];
  const message = `${examName}: ${score}/${maxScore} puan · ${correct}/${pending.questions.length} doğru${passed ? " · Başarılı" : ""}.`;
  addFeed(life, "📝", message);
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

export function closeBusiness(life, businessId = null) {
  const business = businessId
    ? life.finance.businesses.find((item) => item.id === businessId)
    : life.finance.businesses.find((item) => item.id === life.finance.business?.id) || life.finance.business;
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

export function performRelationshipAction(life, action, options = {}) {
  if (!canDo(life, "date")) throw new Error("İlişki etkinlikleri 16 yaşında açılır.");
  const relationship = life.relationship;
  if (!relationship) throw new Error("Önce biriyle tanışıp ilişki kurmalısın.");
  if (relationship.actionAge !== life.age) {
    relationship.actionAge = life.age;
    relationship.actionsThisAge = 0;
  }
  if (relationship.actionsThisAge >= 4) throw new Error("Bu yıl birlikte dört etkinlik yaptınız. Yeni planlar için yaş atlayabilirsin.");
  const plans = {
    conversation: { name: "Uzun bir sohbet", cost: 0, bond: 3, happiness: 2 },
    date: { name: "Birlikte akşam yemeği", cost: 450, bond: 6, happiness: 5 },
    apology: { name: "Gönül alma konuşması", cost: 80, bond: 5, happiness: 1 },
    celebration: { name: "Özel bir günü kutlama", cost: 900, bond: 9, happiness: 7 },
    trip: { name: "Hafta sonu gezisi", cost: 2400, bond: 12, happiness: 9 },
    family: { name: "Ailelerle tanışma", cost: 350, bond: 7, happiness: 4, minimumAge: 18 },
  };
  const plan = plans[action];
  if (!plan) throw new Error("Bu ilişki etkinliği bulunamadı.");
  if (plan.minimumAge && life.age < plan.minimumAge) throw new Error(`Bu etkinlik ${plan.minimumAge} yaşında açılır.`);
  if (life.money < plan.cost) throw new Error(`${plan.name} için ${plan.cost.toLocaleString("tr-TR")} ₺ gerekiyor.`);
  life.money -= plan.cost;
  relationship.closeness = clamp(relationship.closeness + plan.bond);
  relationship.sharedMoments += 1;
  relationship.actionsThisAge += 1;
  relationship.lastAction = action;
  life.stats.happiness = clamp(life.stats.happiness + plan.happiness);
  life.stats.social = clamp(life.stats.social + (action === "conversation" ? 1 : 0));
  if (action === "celebration") relationship.gifts += 1;
  if (plan.cost) recordTransaction(life, "expense", plan.cost, plan.name);
  const message = `${relationship.name} ile ${plan.name.toLocaleLowerCase("tr-TR")} yaptın. Yakınlığınız ${relationship.closeness}/100 oldu; yaşın değişmedi.`;
  addFeed(life, action === "trip" ? "🧳" : action === "family" ? "🏡" : "💞", message);
  life.history.push({ age: life.age, event: "İlişki", choice: plan.name });
  return message;
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
    recordTransaction(life, "credit", value, "Kredi kullanımı");
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
    recordTransaction(life, "expense", payment, "Kredi borcu ödemesi");
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
    recordTransaction(life, "expense", cost, `${quantity} adet ${marketItem.name} alımı`);
    const message = `${quantity} adet ${marketItem.name} hissesini ${cost.toLocaleString("tr-TR")} ₺ karşılığında aldın.`;
    addFeed(life, "📈", message);
    return message;
  }
  if (action === "sell") {
    if (quantity > stock.owned) throw new Error("Satmak istediğin kadar hissen yok.");
    const total = stock.price * quantity;
    stock.owned -= quantity;
    life.money += total;
    recordTransaction(life, "income", total, `${quantity} adet ${marketItem.name} satışı`);
    const message = `${quantity} adet ${marketItem.name} hissesini ${total.toLocaleString("tr-TR")} ₺ karşılığında sattın.`;
    addFeed(life, "📉", message);
    return message;
  }
  throw new Error("Hisse işlemi bulunamadı.");
}

function recordTransaction(life, type, amount, description) {
  life.finance.transactions.unshift({ age: life.age, type, amount, description });
  life.finance.transactions = life.finance.transactions.slice(0, 30);
}

export function startBusiness(life, sectorId, name) {
  if (life.age < 18) throw new Error("Şirket kurmak için en az 18 yaşında olmalısın.");
  const sector = businessSectors.find((item) => item.id === sectorId);
  const companyName = String(name || "").trim();
  if (!sector || companyName.length < 2 || companyName.length > 30) throw new Error("Şirket adı 2-30 karakter olmalı ve bir sektör seçmelisin.");
  if (life.money < sector.setup) throw new Error(`Şirketi kurmak için ${sector.setup.toLocaleString("tr-TR")} ₺ gerekiyor.`);
  life.money -= sector.setup;
  const skillMultiplier = 0.75 + life.stats.discipline / 250 + life.stats.social / 350;
  const business = {
    id: `company-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: companyName,
    sector: sector.name,
    product: sector.product,
    monthlyRevenue: Math.round(sector.monthlyRevenue * skillMultiplier),
    monthlyCost: sector.monthlyCost,
    months: 0,
    lossYears: 0,
    closed: false,
    bankrupt: false,
  };
  life.finance.businesses.push(business);
  life.finance.business = business;
  recordTransaction(life, "expense", sector.setup, `${companyName} şirket kuruluşu`);
  const message = `${companyName} şirketini kurdun. İlk yıl gelir-gider dengesini takip et.`;
  addFeed(life, "🏢", message);
  return message;
}

export function applyForCareer(life, professionId) {
  const profession = professions.find((item) => item.id === professionId);
  if (!profession) throw new Error("Meslek bulunamadı.");
  if (life.career.job) throw new Error("Yeni bir işe geçmeden önce mevcut işinden ayrılmalısın.");
  const requirement = careerRequirement(life, profession);
  if (requirement) throw new Error(requirement);
  if (profession.exam) {
    const result = life.education.exams.filter((exam) => exam.type === "civil-service").at(-1);
    if (!result) throw new Error("Önce Kariyer bölümünden kamu personeli sınavına gir.");
    if (!result.passed) throw new Error(`Kamu sınavındaki ${result.score}/100 puanın bu kadro için yeterli değil. Yeniden sınava hazırlan.`);
  } else if (Math.random() > Math.min(0.95, 0.55 + life.stats.discipline / 250)) {
    throw new Error("Görüşme olumlu geçmedi. Becerilerini geliştirip yeniden başvurabilirsin.");
  }
  life.career.job = profession.name;
  life.career.salary = profession.salary;
  life.career.professionId = profession.id;
  recordTransaction(life, "income", profession.salary, `${profession.name} işe giriş · aylık maaş`);
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
  for (const business of life.finance.businesses) {
    if (business.closed || business.bankrupt) continue;
    business.months += 12;
    const marketShift = randomInt(-40, 30) / 100;
    const annualProfit = (Math.round(business.monthlyRevenue * (1 + marketShift)) - business.monthlyCost) * 12;
    if (annualProfit >= 0) {
      life.money += annualProfit;
      business.lossYears = 0;
      if (annualProfit) recordTransaction(life, "income", annualProfit, `${business.name} yıllık net kazancı`);
    } else {
      life.money = Math.max(0, life.money + annualProfit);
      business.lossYears += 1;
      recordTransaction(life, "expense", -annualProfit, `${business.name} yıllık faaliyet zararı`);
      if (business.lossYears >= 2) business.bankrupt = true;
    }
  }
  const savingsInterest = Math.round(life.bank * life.finance.savingsRate);
  if (savingsInterest > 0) {
    life.bank += savingsInterest;
    recordTransaction(life, "interest", savingsInterest, "Birikim hesabı yıllık faizi");
  }
  const influenceIncome = life.socialMedia.incomeMonthly * 12;
  if (influenceIncome > 0) {
    life.money += influenceIncome;
    recordTransaction(life, "income", influenceIncome, "İçerik üreticisi yıllık geliri");
  }
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
    beginExam(life, "middle");
    messages.push("Ortaokul değerlendirmesi başladı; soruları yanıtla.");
  } else if (effect.exam === "middle-pass") {
    education.exam = "Ortaokula geçiş değerlendirmesi yapılmadı";
    education.stage = "Ortaokul";
    education.grade = 6;
  } else if (effect.exam === "lgs") {
    beginExam(life, "lgs");
    messages.push("LGS başladı; soruları yanıtla.");
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
    beginExam(life, "yks");
    messages.push("YKS başladı; soruları yanıtla.");
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
  life.socialMedia.postsThisAge = 0;
  if (life.relationship) {
    life.relationship.actionsThisAge = 0;
    life.relationship.actionAge = nextAge;
  }
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
    recordTransaction(life, "income", life.career.salary * 12, `${life.career.job} · 12 aylık maaş`);
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
    if (life.socialMedia.postsThisAge >= 3) {
      throw new Error("Bu yaşında üç video paylaştın. Yeni içerik hakkın yaş atlayınca yenilenir.");
    }
    const views = Math.max(10, Math.round(35 + Math.sqrt(life.socialMedia.followers) * 2.2 + life.stats.intelligence * 1.5 + randomInt(0, 180)));
    const likes = Math.max(1, Math.round(views * (0.012 + life.stats.social / 2500)));
    const viral = Math.random() < 0.008 + life.stats.social / 4000;
    const newFollowers = Math.max(0, Math.round(likes * 0.035) + randomInt(0, 2) + (viral ? randomInt(25, 180) : 0));
    life.socialMedia.posts += 1;
    life.socialMedia.postsThisAge += 1;
    life.socialMedia.lastPostAge = life.age;
    life.socialMedia.views += views;
    life.socialMedia.likes += likes;
    life.socialMedia.followers += newFollowers;
    life.socialMedia.incomeMonthly = life.socialMedia.followers >= 5000
      ? Math.min(50000, Math.floor(life.socialMedia.followers * (0.008 + life.stats.social / 8000)))
      : 0;
    life.stats.social = clamp(life.stats.social + 2);
    life.stats.happiness = clamp(life.stats.happiness + 1);
    result.message = `${options.text || "Bugün güzel bir anını"} Alora akışında paylaştın. ${views.toLocaleString("tr-TR")} görüntülenme, ${likes} beğeni${newFollowers ? ` ve ${newFollowers} yeni takipçi` : ""}.${viral ? " Paylaşımın beklenmedik biçimde yayıldı!" : ""}`;
    result.icon = "📱";
  } else if (activity === "date") {
    if (!life.relationship) {
      life.relationship = {
        name: options.name?.trim() || randomItem(familyNamePools.partner), status: "Birlikte", years: 0, closeness: 45,
        sharedMoments: 0, gifts: 0, actionsThisAge: 0, actionAge: life.age, lastAction: "Tanışma",
      };
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
    life.education.schoolAverage = Math.min(100, Math.round((life.education.schoolAverage + 0.7) * 10) / 10);
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
    if (activity === "deposit") recordTransaction(life, "deposit", amount, "Birikim hesabına aktarım");
    else recordTransaction(life, "withdraw", amount, "Birikim hesabından çekim");
    result.message = activity === "deposit" ? `${amount.toLocaleString("tr-TR")} ₺ bankaya yatırıldı.` : `${amount.toLocaleString("tr-TR")} ₺ hesabına aktarıldı.`;
    result.icon = "🏦";
  } else if (activity === "spend") {
    const amount = Math.floor(Number(options.amount));
    if (!Number.isFinite(amount) || amount < 1 || amount > life.money) throw new Error("Geçerli bir tutar gir; cüzdanındaki bakiyeyi aşma.");
    life.money -= amount;
    recordTransaction(life, "expense", amount, "Serbest harcama");
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

