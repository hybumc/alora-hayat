import test from "node:test";
import assert from "node:assert/strict";
import {
  activityCount, advanceYear, applyForCareer, canDo, chooseEvent, chooseUniversityProgram,
  createLife, doActivity, enterContest, getActivityOptions, getAgeEvent, isValidLife, loadLife,
  manageLoan, migrateLife, performFamilyAction, saveLife, startBusiness, takeExam, tradeStock, SAVE_KEY,
} from "./game.js";
import { universityPrograms } from "./catalog.js";

function fresh() {
  return createLife({ firstName: "Ada", lastName: "Yılmaz", birthDate: "2020-03-10" });
}

test("karakter bebek olarak başlar ve yaş atlama yaşını artırır", () => {
  const life = fresh();
  assert.equal(life.age, 0);
  advanceYear(life);
  assert.equal(life.age, 1);
  assert.equal(life.lastEvent.pending, true);
  chooseEvent(life, 0);
  assert.equal(life.stats.happiness, 81);
  assert.match(life.feed[0].text, /İlk adımlar/);
});

test("eğitim olayları ve yetişkin aktiviteleri doğru yaşlarda açılır", () => {
  const life = fresh();
  life.age = 6;
  advanceYear(life);
  assert.equal(life.lastEvent.event.title, "Okul zamanı");
  chooseEvent(life, 0);
  assert.equal(life.education.stage, "İlkokul");
  assert.equal(canDo(life, "date"), false);
  assert.equal(canDo(life, "casino"), false);
  life.age = 18;
  assert.equal(canDo(life, "date"), true);
  assert.equal(canDo(life, "casino"), true);
});

test("her yaş için bir seçim vardır ve okul ertelemesi yeniden sorulur", () => {
  const life = fresh();
  for (let age = 1; age <= 40; age += 1) {
    assert.ok(getAgeEvent(life, age), `${age}. yaş için yaşam olayı bulunmalı`);
  }
  life.age = 6;
  advanceYear(life);
  chooseEvent(life, 1);
  advanceYear(life);
  assert.equal(life.lastEvent.event.title, "Okula yeniden bakalım");
});

test("erken çocukluk soruları tekrarlanmaz ve okul ertelemesi her yıl yeniden sorulur", () => {
  const life = fresh();
  for (let age = 2; age <= 6; age += 1) {
    const event = getAgeEvent(life, age);
    assert.ok(!life.history.some((entry) => entry.event === event.title));
    life.history.push({ age, event: event.title, choice: event.options[0].text });
  }
  life.age = 6;
  advanceYear(life);
  chooseEvent(life, 1);
  advanceYear(life);
  chooseEvent(life, 1);
  advanceYear(life);
  assert.equal(life.lastEvent.event.title, "Okula başlama zamanı");
});

test("yaş sınırı kumar eyleminde doğrulanır ve para sanal cüzdandan düşer", () => {
  const life = fresh();
  life.age = 17;
  assert.throws(() => doActivity(life, "casino", { wager: 10 }), /en az 18/);
  life.age = 18;
  const before = life.money;
  doActivity(life, "casino", { wager: 10 });
  assert.ok(life.money === before - 10 || life.money === before + 10);
  assert.equal(life.bank, 0);
});

test("flört ve iş etkinlikleri yaş sınırının altında engellenir", () => {
  const life = fresh();
  life.age = 15;
  assert.throws(() => doActivity(life, "date"), /en az 16/);
  assert.throws(() => doActivity(life, "work"), /en az 16/);
  life.age = 16;
  assert.equal(canDo(life, "date"), true);
  doActivity(life, "work");
  assert.equal(life.career.job, "Yarı zamanlı iş");
  life.age = 18;
  assert.equal(canDo(life, "fullTime"), true);
  doActivity(life, "fullTime");
  assert.equal(life.career.job, "Tam zamanlı çalışma");
});

test("banka bakiyeleri arasında tutar aktarılır ve kayıt geri yüklenir", () => {
  const life = fresh();
  const storage = {
    value: null,
    setItem(key, value) { assert.equal(key, SAVE_KEY); this.value = value; },
    getItem(key) { assert.equal(key, SAVE_KEY); return this.value; },
  };
  doActivity(life, "deposit", { amount: 100 });
  assert.equal(life.money, 150);
  assert.equal(life.bank, 100);
  saveLife(life, storage);
  assert.deepEqual(loadLife(storage), life);
  assert.equal(isValidLife({ version: 1, name: "Eksik kayıt", age: 2 }), false);
});

test("yaş olayı yanıtlanmadan ikinci kez yaş atlanamaz", () => {
  const life = fresh();
  advanceYear(life);
  assert.throws(() => advanceYear(life), /Önce bekleyen/);
  chooseEvent(life, 1);
  advanceYear(life);
  assert.equal(life.age, 2);
});

test("1.000 etkinlik seçeneği aranabilir katalogdan harcama yapar ve yaş ilerletmez", () => {
  const life = fresh();
  life.age = 10;
  life.money = 1000;
  const options = getActivityOptions(life);
  assert.equal(activityCount, 1000);
  assert.equal(options.length, 1000);
  assert.equal(new Set(options.map((item) => item.id)).size, 1000);
  const activity = options.find((item) => !item.lockedReason && item.cost <= life.money);
  const age = life.age;
  const balance = life.money;
  doActivity(life, "catalog", { id: activity.id });
  assert.equal(life.age, age);
  assert.equal(life.money, balance - activity.cost);
  assert.equal(life.activitiesCompleted, 1);
});

test("aileyle etkinlik, hediye ve para gönderme yakınlığı artırır; yaş değişmez", () => {
  const life = fresh();
  const sibling = life.family.members.find((member) => member.id === "sibling");
  const age = life.age;
  performFamilyAction(life, { action: "time", memberId: sibling.id });
  assert.equal(life.family.sharedMoments, 1);
  assert.ok(sibling.closeness > 0);
  assert.equal(life.age, age);
  performFamilyAction(life, { action: "gift", memberId: "mother", giftId: "card" });
  performFamilyAction(life, { action: "sendMoney", memberId: "father", amount: 50 });
  assert.equal(life.family.members.find((member) => member.id === "father").sentMoney, 50);
  assert.equal(life.money, 120);
});

test("ilişki isimleri havuzdan seçilir, birlikte vakit yaş veya ilişki süresi eklemez", () => {
  const life = fresh();
  life.age = 16;
  const before = life.age;
  doActivity(life, "date");
  assert.equal(life.age, before);
  assert.equal(life.relationship.years, 0);
  doActivity(life, "date");
  assert.equal(life.age, before);
  assert.equal(life.relationship.years, 0);
  assert.ok(life.relationship.closeness > 45);
});

test("sınavlar puan ve sonuç kaydeder; üniversite ve aylık meslek şartları uygulanır", () => {
  const life = fresh();
  life.age = 14;
  life.stats.intelligence = 90;
  life.stats.discipline = 90;
  const lgs = takeExam(life, "lgs");
  assert.ok(lgs.score >= 0 && lgs.score <= 500);
  assert.equal(life.education.lgsScore, lgs.score);
  assert.throws(() => takeExam(life, "lgs"), /zaten girdin/);

  life.age = 18;
  life.education.exam = "YKS: hazırlandı";
  const yks = takeExam(life, "yks");
  assert.ok(yks.score >= 0 && yks.score <= 500);
  const program = universityPrograms.find((item) => item.score <= yks.score);
  assert.ok(program);
  chooseUniversityProgram(life, program.id);
  assert.equal(life.education.stage, "Üniversite");

  life.age = 26;
  life.education.stage = "Üniversite mezunu";
  life.stats.intelligence = 100;
  life.stats.discipline = 100;
  applyForCareer(life, "municipal-clerk");
  assert.equal(life.career.job, "Belediye memuru");
  assert.equal(life.career.salary, 36500);
});

test("sosyal medya metrikleri büyür ve aylık içerik geliri yaş atlayınca ödenir", () => {
  const life = fresh();
  life.age = 13;
  doActivity(life, "social", { text: "Yeni bir hobi denedim." });
  assert.equal(life.socialMedia.posts, 1);
  assert.ok(life.socialMedia.views > 0);
  assert.ok(life.socialMedia.likes > 0);

  life.age = 19;
  life.militaryDone = true;
  life.socialMedia.followers = 5000;
  life.socialMedia.incomeMonthly = 100;
  const before = life.money;
  advanceYear(life);
  assert.equal(life.money, before + 1450);
});

test("kredi, hisse alım-satımı ve yarışma katılımı bakiyeyi tutarlı yönetir", () => {
  const life = fresh();
  life.age = 18;
  life.money = 100000;
  manageLoan(life, "borrow", 5000);
  assert.equal(life.finance.loan.balance, 5000);
  const stock = life.finance.stocks[0];
  const purchasePrice = stock.price;
  tradeStock(life, stock.symbol, "buy", 1);
  assert.equal(stock.owned, 1);
  stock.price = 100;
  tradeStock(life, stock.symbol, "sell", 1);
  assert.equal(stock.owned, 0);
  assert.equal(life.money, 104180);
  manageLoan(life, "repay", 1000);
  assert.equal(life.money, 103180);
  assert.equal(life.finance.loan.balance, 4000);
  assert.ok(purchasePrice > 100);
  enterContest(life, "startup");
  assert.equal(life.finance.contestEntries, 1);
});

test("işletme iki yıl üst üste zarar ederse iflas eder", () => {
  const life = fresh();
  life.age = 29;
  life.money = 100000;
  startBusiness(life, "cafe", "Mahalle Kafesi");
  life.finance.business.monthlyRevenue = 0;
  life.finance.business.monthlyCost = 10000;
  for (let year = 0; year < 2; year += 1) {
    advanceYear(life);
    if (life.lastEvent?.pending) chooseEvent(life, 0);
  }
  assert.equal(life.finance.business.bankrupt, true);
  assert.equal(life.finance.business.lossYears, 2);
  life.money = 100000;
  startBusiness(life, "shop", "Yeni Dükkân");
  assert.equal(life.finance.business.name, "Yeni Dükkân");
});

test("eski sürüm kaydı yeni aile ve ekonomi alanlarına taşınır", () => {
  const legacy = fresh();
  legacy.version = 1;
  legacy.career.salary = 400;
  legacy.feed.push({ age: 18, icon: "🎲", text: "100 sanal TL kaybettin. Bu yalnızca oyun içi paradır." });
  delete legacy.family;
  delete legacy.socialMedia;
  delete legacy.finance;
  delete legacy.activitiesCompleted;
  delete legacy.education.exams;
  delete legacy.education.schoolPlacement;
  delete legacy.education.lgsScore;
  delete legacy.education.yksScore;
  delete legacy.education.program;
  delete legacy.career.professionId;
  delete legacy.career.license;
  const migrated = migrateLife(legacy);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.career.salary, 12000);
  assert.equal(migrated.feed.at(-1).text, "100 ₺ kaybettin.");
  assert.ok(isValidLife(migrated));
});
