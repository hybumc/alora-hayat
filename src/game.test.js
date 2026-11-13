import test from "node:test";
import assert from "node:assert/strict";
import { advanceYear, canDo, chooseEvent, createLife, doActivity, getAgeEvent, isValidLife, loadLife, saveLife, SAVE_KEY } from "./game.js";

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
