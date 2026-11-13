import {
  activityCount, applyForCareer, canDo, careerRequirement, chooseEvent, chooseUniversityProgram,
  closeBusiness, createLife, doActivity, enterContest, getActivityOptions, isValidLife, leaveCareer,
  loadLife, manageLoan, migrateLife, performFamilyAction, saveLife, startBusiness, takeExam, tradeStock, advanceYear,
} from "./game.js";
import { businessSectors, contestTypes, familyGifts, professions, stockMarket, universityPrograms } from "./catalog.js";
import "./style.css";

const app = document.querySelector("#app");
let life = null;
let tab = "life";
let notice = "";
let modalError = "";
let importInput = null;
let activityQuery = "";
let activityCategory = "Tümü";
let activityPage = 0;
let careerQuery = "";
let careerPageIndex = 0;
let marketTab = "stocks";

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));
const money = (value) => `${Number(value || 0).toLocaleString("tr-TR")} ₺`;
const dateText = (date) => new Date(`${date}T00:00:00`).toLocaleDateString("tr-TR", {
  day: "numeric", month: "long", year: "numeric",
});
const statLabel = {
  health: "Sağlık", happiness: "Mutluluk", intelligence: "Zekâ",
  discipline: "Disiplin", social: "Sosyallik",
};
const navItems = [
  ["life", "⌂", "Hayatım"], ["activities", "✧", "Etkinlikler"], ["family", "⌂", "Ailem"],
  ["education", "✎", "Eğitim"], ["career", "↗", "Kariyer"], ["bank", "◈", "Banka"],
  ["market", "▥", "Ekonomi"], ["relations", "♡", "İlişkiler"], ["social", "◎", "Sosyal"],
  ["settings", "⚙", "Ayarlar"],
];

function persist() {
  if (!life) return;
  try {
    saveLife(life);
  } catch {
    notice = "Kayıt yapılamadı. Cihazında yeterli boş alan olduğundan emin ol.";
  }
}

function flash(text) {
  notice = text;
  render();
}

function setupView() {
  return `
    <main class="welcome">
      <div class="welcome-art" aria-hidden="true">
        <span class="orbit orbit-one"></span><span class="orbit orbit-two"></span>
        <span class="sun">✿</span><span class="art-caption">her yaşta<br>yeni bir başlangıç</span>
      </div>
      <section class="welcome-copy">
        <div class="brand"><span class="brand-mark">✿</span><span>ALORA <b>HAYAT</b></span></div>
        <p class="eyebrow">KENDİ HİKÂYEN, KENDİ SEÇİMLERİN</p>
        <h1>Bir hayat,<br><em>bin ihtimal.</em></h1>
        <p class="welcome-text">Dünyaya bir bebek olarak gözlerini aç. Her yıl büyü, seçimlerini yap ve sana ait bir hayat kur.</p>
        <form id="start-form" class="start-form">
          <label>Ad<input name="firstName" required maxlength="24" autocomplete="given-name" placeholder="Adın" /></label>
          <label>Soyad<input name="lastName" required maxlength="30" autocomplete="family-name" placeholder="Soyadın" /></label>
          <label class="date-label">Doğum tarihi<input name="birthDate" type="date" required max="${new Date().toISOString().slice(0, 10)}" /></label>
          <button class="primary-button start-button" type="submit">Hayata başla <span>→</span></button>
          <p class="form-error">${esc(notice)}</p>
        </form>
        <p class="privacy-note"><span>◉</span> Hikâyen bu cihazda saklanır. İnternete gönderilmez.</p>
      </section>
    </main>`;
}

function statCard(key) {
  const value = life.stats[key];
  return `<div class="stat-card">
    <div class="stat-top"><span>${statLabel[key]}</span><b>${value}<small>/100</small></b></div>
    <div class="stat-track"><span style="width:${value}%"></span></div>
  </div>`;
}

function shell(content) {
  const hasPending = Boolean(life.lastEvent?.pending);
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand side-brand" href="#" data-nav="life"><span class="brand-mark">✿</span><span>ALORA <b>HAYAT</b></span></a>
        <p class="side-label">HİKÂYEN</p>
        <nav class="side-nav">${navItems.map(([id, icon, label]) => `
          <button class="nav-link ${tab === id ? "active" : ""}" data-nav="${id}">
            <span class="nav-icon">${icon}</span>${label}${id === "settings" ? "" : ""}
          </button>`).join("")}</nav>
        <div class="sidebar-bottom">
          <div class="save-state"><span class="save-dot"></span><span>Bu cihazda kayıtlı</span></div>
          <div class="mini-profile"><div class="avatar">${esc(life.firstName.slice(0, 1).toLocaleUpperCase("tr-TR"))}</div><div><b>${esc(life.name)}</b><small>${life.age} yaşında</small></div></div>
        </div>
      </aside>
      <main class="main-area">
        <header class="topbar">
          <div class="crumb"><span>ALORA HAYAT</span><i>/</i><b>${navItems.find(([id]) => id === tab)?.[2] || "Hayatım"}</b></div>
          <div class="top-actions">
            <span class="today-chip"><span>✦</span> ${life.age}. yaş</span>
            <button class="primary-button age-button" data-action="age" ${hasPending ? "disabled" : ""}>Yaş Atla <span>→</span></button>
          </div>
        </header>
        ${notice ? `<div class="notice" role="status"><span>✦</span>${esc(notice)}<button aria-label="Bildirimi kapat" data-action="clear-notice">×</button></div>` : ""}
        <div class="page-content">${content}</div>
        <footer class="footer"><span>Alora Hayat <i>·</i> Her seçim bir iz bırakır.</span><span>Otomatik kayıt açık</span></footer>
      </main>
      ${hasPending ? eventDialog() : ""}
    </div>`;
}

function eventDialog() {
  const { event } = life.lastEvent;
  return `<div class="modal-backdrop"><section class="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-title">
    <div class="modal-spark">✦</div><p class="eyebrow">HAYATINDA YENİ BİR SAYFA</p>
    <h2 id="event-title">${esc(event.title)}</h2><p class="modal-description">${esc(event.description)}</p>
    <div class="event-options">${event.options.map((option, index) => `
      <button class="event-option" data-choice="${index}">
        <span class="option-icon">${option.icon}</span><span>${esc(option.text)}</span><b>→</b>
      </button>`).join("")}</div>
    ${modalError ? `<p class="modal-error">${esc(modalError)}</p>` : ""}
  </section></div>`;
}

function lifePage() {
  const stats = ["health", "happiness", "intelligence", "discipline", "social"].map(statCard).join("");
  return `
    <section class="hero-card">
      <div class="hero-copy"><p class="eyebrow">SENİN HİKÂYEN, SENİN YOLUN</p>
        <h1>Merhaba, ${esc(life.firstName)}<span>.</span></h1>
        <p>${life.age === 0 ? "Hayatın daha yeni başladı. Her yıl yeni bir seçim seni bekliyor." : `${life.age}. yaşındasın. Hikâyende yeni bir yıl, yeni bir ihtimal.`}</p>
        <button class="hero-age-button" data-action="age" ${life.lastEvent?.pending ? "disabled" : ""}>Bir sonraki yaşa geç <span>→</span></button>
      </div>
      <div class="hero-illustration" aria-hidden="true">
        <div class="hero-circle"></div><span class="hero-flower">✿</span><span class="hero-star star-a">✦</span>
        <span class="hero-star star-b">✧</span><span class="hero-leaf">⌁</span>
        <div class="age-bubble"><b>${life.age}</b><span>yaş</span></div>
      </div>
      <div class="hero-bottom"><span>✿</span> ${life.education.stage} <i>·</i> ${life.career.job ? esc(life.career.job) : "Yeni bir başlangıç"}</div>
    </section>
    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">BUGÜN NASILSIN?</p><h2>Hayat göstergelerin</h2></div><span class="soft-label">Zamanla değişir</span></div>
      <div class="stats-grid">${stats}</div>
    </section>
    <section class="profile-strip">
      <div class="profile-heading"><span class="avatar profile-avatar">${esc(life.firstName.slice(0, 1).toLocaleUpperCase("tr-TR"))}</span><div><p class="eyebrow">KARAKTER PROFİLİ</p><h3>${esc(life.name)}</h3></div></div>
      <div class="profile-fact"><small>Doğum tarihi</small><b>${esc(dateText(life.birthDate))}</b></div>
      <div class="profile-fact"><small>Yaş</small><b>${life.age}</b></div>
      <div class="profile-fact"><small>Eğitim</small><b>${esc(life.education.stage)}</b></div>
      <div class="profile-fact"><small>İlişki</small><b>${life.relationship ? esc(life.relationship.name) : "Bekâr"}</b></div>
      <div class="profile-fact"><small>Askerlik</small><b>${esc(life.military)}</b></div>
    </section>
    <section class="lower-grid">
      <div class="panel-card money-card">
        <div class="panel-title"><span class="panel-icon peach">◈</span><div><p class="eyebrow">CEBİNDEKİLER</p><h3>Para durumu</h3></div><button class="text-link" data-nav="bank">Bankaya git →</button></div>
        <div class="balance-row"><div><small>Cüzdan</small><b>${money(life.money)}</b></div><div><small>Banka</small><b>${money(life.bank)}</b></div></div>
        <div class="money-foot"><span>●</span> Biriktirip farklı etkinliklerde kullan</div>
      </div>
      <div class="panel-card next-card">
        <div class="panel-title"><span class="panel-icon lavender">✦</span><div><p class="eyebrow">BİR SONRAKİ ADIM</p><h3>${nextMilestone()}</h3></div></div>
        <p>${nextMilestoneText()}</p><button class="text-link" data-nav="education">Eğitim yoluna bak →</button>
      </div>
    </section>
    <section class="section-block activity-block">
      <div class="section-heading"><div><p class="eyebrow">KÜÇÜK ADIMLAR</p><h2>Bugün ne yapmak istersin?</h2></div></div>
      <div class="quick-actions">
        <button class="quick-action" data-action="exercise"><span>🏃</span><b>Hareket et</b><small>Sağlığını ve enerjini artır</small></button>
        <button class="quick-action" data-action="study"><span>📚</span><b>Bir şeyler öğren</b><small>Zekânı ve disiplinini geliştir</small></button>
        <button class="quick-action" data-nav="social" ${!canDo(life, "social") ? "disabled" : ""}><span>📱</span><b>Paylaşım yap</b><small>${canDo(life, "social") ? "Alora akışında sesini duyur" : "13 yaşında açılır"}</small></button>
      </div>
    </section>
    ${life.lastEvent?.message ? `<div class="last-event"><span>✧</span><p>${esc(life.lastEvent.message)}</p></div>` : ""}
    <section class="section-block feed-block"><div class="section-heading"><div><p class="eyebrow">HAYATINDAN KARELER</p><h2>Son yaşananlar</h2></div></div>
      <div class="feed-list">${life.feed.slice(0, 8).map(feedItem).join("")}</div>
    </section>`;
}

function nextMilestone() {
  if (life.age < 7) return "İlkokul kapıda";
  if (life.age < 12) return "Ortaokul yılları";
  if (life.age < 15) return "Lise yolculuğu";
  if (life.age < 18) return "YKS'ye hazırlan";
  if (!life.education.university && life.age < 22) return "Üniversite veya kariyer";
  return life.career.job || "Yeni hedefler belirle";
}

function nextMilestoneText() {
  if (life.age < 7) return "Yedi yaşında okul kararın seni bekliyor. O güne kadar merakını besle.";
  if (life.age < 12) return "Her yıl öğrendiklerin yeni kapılar açar. Eğitim yolculuğuna devam et.";
  if (life.age < 17) return "İlgi alanlarını keşfet, okul tercihini yap ve hedeflerini belirle.";
  if (life.age < 18) return "YKS hazırlığı için çalışma etkinliklerini kullan, sınav tercihini sen yap.";
  return "Eğitim, iş ve kişisel hedeflerin arasında kendi dengeni kur.";
}

function feedItem(item) {
  return `<article class="feed-item"><span class="feed-icon">${esc(item.icon)}</span><div><p>${esc(item.text)}</p><small>${item.age}. yaş</small></div><span class="feed-star">✧</span></article>`;
}

function activitiesPage() {
  const all = getActivityOptions(life);
  const categories = ["Tümü", ...new Set(all.map((item) => item.category))];
  const query = activityQuery.toLocaleLowerCase("tr-TR");
  const filtered = all.filter((item) => (activityCategory === "Tümü" || item.category === activityCategory) &&
    item.title.toLocaleLowerCase("tr-TR").includes(query));
  const pageSize = 12;
  activityPage = Math.min(activityPage, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const items = filtered.slice(activityPage * pageSize, (activityPage + 1) * pageSize);
  return `<div class="page-intro"><p class="eyebrow">HER GÜN YENİ BİR SEÇENEK</p><h1>Etkinlikler</h1><p>20 farklı etkinliği 10 mekân ve 5 eşlikçi seçeneğiyle keşfet: toplam ${activityCount.toLocaleString("tr-TR")} etkinlik seçeneği.</p></div>
    <div class="activity-tools"><form class="search-form" data-form="activity-search"><input name="query" value="${esc(activityQuery)}" placeholder="Etkinlik veya mekân ara" aria-label="Etkinlik veya mekân ara" /><button class="secondary-button" type="submit">Ara</button></form>
      <label class="filter-label">Tür<select id="activity-category">${categories.map((category) => `<option ${activityCategory === category ? "selected" : ""}>${esc(category)}</option>`).join("")}</select></label>
      <span class="soft-label">${filtered.length} sonuç · ${money(life.money)} cüzdanda</span>
    </div>
    <div class="activity-catalog">${items.map((item) => {
      const locked = Boolean(item.lockedReason) || life.money < item.cost;
      const reason = item.lockedReason || (life.money < item.cost ? "Bakiyen yetmiyor" : "");
      return `<article class="catalog-card"><div class="catalog-card-top"><span class="panel-icon lavender">✧</span><span class="soft-label">${esc(item.category)}</span></div><h3>${esc(item.title)}</h3><div class="catalog-card-bottom"><b>${money(item.cost)}</b><small>${reason ? esc(reason) : `${item.minAge}+ yaş`}</small></div><button class="primary-button" data-action="catalog" data-id="${esc(item.id)}" ${locked ? "disabled" : ""}>${locked ? reason ? "Kilitli" : "Bakiye yetersiz" : "Etkinliğe katıl →"}</button></article>`;
    }).join("") || `<div class="empty-state"><p>Bu aramayla eşleşen etkinlik yok.</p></div>`}</div>
    <div class="pagination"><button class="secondary-button" data-action="activity-page" data-page="${activityPage - 1}" ${activityPage === 0 ? "disabled" : ""}>← Önceki</button><span>${activityPage + 1} / ${pageCount}</span><button class="secondary-button" data-action="activity-page" data-page="${activityPage + 1}" ${activityPage + 1 >= pageCount ? "disabled" : ""}>Sonraki →</button></div>`;
}

function familyPage() {
  return `<div class="page-intro"><p class="eyebrow">EVİNDEKİLER, HER ZAMAN YANINDA</p><h1>Ailem</h1><p>Anne, baba ve kardeşlerinle konuş, birlikte vakit geçir, hediye al veya ihtiyaç olduğunda destek iste.</p></div>
    <div class="family-summary"><div><b>${life.family.members.length}</b><span>aile üyesi</span></div><div><b>${life.family.sharedMoments}</b><span>paylaşılan an</span></div><div><b>${money(life.family.members.reduce((total, member) => total + member.sentMoney, 0))}</b><span>aileye gönderilen</span></div></div>
    <div class="family-grid">${life.family.members.map((member) => `<article class="family-card"><span class="family-avatar">${member.id === "mother" ? "👩" : member.id === "father" ? "👨" : "🧒"}</span><p class="eyebrow">${esc(member.role)} · ${member.age} yaş</p><h2>${esc(member.name)}</h2><div class="relationship-meter"><span style="width:${member.closeness}%"></span></div><small>Yakınlık ${member.closeness}/100 · Gönderilen ${money(member.sentMoney)}</small>
      <div class="family-actions"><button class="secondary-button" data-action="family-talk" data-member="${member.id}">Sohbet et</button><button class="secondary-button" data-action="family-time" data-member="${member.id}">Birlikte vakit geçir</button>${["mother", "father"].includes(member.id) ? `<button class="text-link" data-action="family-ask" data-member="${member.id}">Destek iste</button>` : ""}</div>
      <div class="gift-row"><select id="gift-${member.id}" aria-label="${esc(member.name)} için hediye">${familyGifts.map((gift) => `<option value="${gift.id}">${gift.icon} ${esc(gift.name)} · ${money(gift.cost)}</option>`).join("")}</select><button class="primary-button" data-action="family-gift" data-member="${member.id}">Hediye et</button></div>
    </article>`).join("")}</div>
    <form class="panel-card transfer-form family-transfer" data-form="family-send"><div class="panel-title"><span class="panel-icon peach">💸</span><div><p class="eyebrow">AİLENE DESTEK OL</p><h3>Para gönder</h3></div></div><p>Gönderdiğin tutar aile üyesinin kaydında birikir ve cüzdanından düşer.</p><div class="inline-form"><label>Aile üyesi<select name="memberId">${life.family.members.map((member) => `<option value="${member.id}">${esc(member.role)} · ${esc(member.name)}</option>`).join("")}</select></label><label>Tutar<input name="amount" type="number" min="1" max="${life.money}" required placeholder="Örn. 500" /></label><button class="primary-button" type="submit">Gönder →</button></div></form>`;
}

function marketPage() {
  const tabs = [["stocks", "Borsa"], ["business", "Şirket"], ["contests", "Yarışmalar"]];
  const tabBar = `<div class="market-tabs">${tabs.map(([id, label]) => `<button class="${marketTab === id ? "active" : ""}" data-market-tab="${id}">${label}</button>`).join("")}</div>`;
  const businessForm = `<form class="panel-card business-form" data-form="business"><div class="panel-title"><span class="panel-icon mint">🏢</span><div><p class="eyebrow">GİRİŞİMİNİ KUR</p><h3>Yeni bir şirket başlat</h3></div></div><label>Şirket adı<input name="name" required minlength="2" maxlength="30" placeholder="Örn. Mahalle Fırını" /></label><label>Sektör<select name="sector">${businessSectors.map((sector) => `<option value="${sector.id}">${esc(sector.name)} · kuruluş ${money(sector.setup)}</option>`).join("")}</select></label><button class="primary-button" type="submit">Şirketi kur →</button></form>`;
  let content = "";
  if (marketTab === "stocks") {
    content = life.age < 18
      ? `<div class="locked-card"><span>🔒</span><div><b>Borsa 18 yaşında açılır</b><p>Yatırım hesabı ve alım-satım işlemleri erişilebilir olduğunda burada görünür.</p></div><small>${18 - life.age} yıl kaldı</small></div>`
      : `<div class="stock-grid">${life.finance.stocks.map((stock) => {
        const instrument = stockMarket.find((item) => item.symbol === stock.symbol);
        const change = stock.lastChange > 0 ? `+${stock.lastChange}` : stock.lastChange;
        return `<article class="stock-card"><div class="stock-heading"><div><p class="eyebrow">${esc(stock.symbol)}</p><h3>${esc(instrument.name)}</h3></div><span class="stock-change ${stock.lastChange < 0 ? "negative" : ""}">${change}%</span></div><b class="stock-price">${money(stock.price)}</b><small>${stock.owned} adet hissesi portföyünde</small>
          <form class="stock-form" data-form="stock"><input type="hidden" name="symbol" value="${esc(stock.symbol)}" /><label>Adet<input name="shares" type="number" min="1" value="1" required /></label><button class="primary-button" name="trade" value="buy" type="submit">Al</button><button class="secondary-button" name="trade" value="sell" type="submit" ${stock.owned < 1 ? "disabled" : ""}>Sat</button></form>
        </article>`;
      }).join("")}</div><p class="market-note">Fiyatlar her yaş atlayışında değişir; kazanç garantisi yoktur. Değer düşerse yatırımının bir kısmını veya tamamını kaybedebilirsin.</p>`;
  } else if (marketTab === "business") {
    const business = life.finance.business;
    content = life.age < 18
      ? `<div class="locked-card"><span>🔒</span><div><b>Şirket kurmak 18 yaşında açılır</b><p>Kuruluş sermayeni ve işletme giderlerini planlayabilirsin.</p></div><small>${18 - life.age} yıl kaldı</small></div>`
      : business && !business.closed && !business.bankrupt
        ? `<div class="business-card"><p class="eyebrow">İŞLETMEN</p><h2>${esc(business.name)}</h2><p>${esc(business.sector)} · ${business.months} ay faaliyette</p><div class="career-metrics"><span><small>Aylık gelir</small><b>${money(business.monthlyRevenue)}</b></span><span><small>Aylık gider</small><b>${money(business.monthlyCost)}</b></span><span><small>Aylık net</small><b>${money(business.monthlyRevenue - business.monthlyCost)}</b></span></div><button class="danger-button" data-action="business-close">Şirketi kapat</button></div>`
        : business?.bankrupt
          ? `<div class="empty-state"><span>🏚️</span><p>${esc(business.name)} şirketi iki yıl üst üste giderlerini karşılayamadığı için iflas etti. Birikimini toparlayıp yeni bir girişim deneyebilirsin.</p></div>${businessForm}`
          : businessForm;
  } else {
    content = `<div class="contest-grid">${contestTypes.map((contest) => `<article class="contest-card"><span>🏆</span><p class="eyebrow">${contest.minAge}+ yaş</p><h3>${esc(contest.name)}</h3><p>Katılım ${money(contest.fee)} · Ödül ${money(contest.prize)}</p><button class="primary-button" data-action="contest" data-contest="${contest.id}" ${life.age < contest.minAge || life.money < contest.fee ? "disabled" : ""}>${life.age < contest.minAge ? `${contest.minAge} yaşında açılır` : life.money < contest.fee ? "Bakiye yetersiz" : "Katıl →"}</button></article>`).join("")}</div><div class="note-card"><span>🏅</span><p><b>${life.finance.contestWins} yarışma zaferi</b><br>Bugüne kadar ${life.finance.contestEntries} yarışmaya katıldın. Sonuç, becerilerin ve rakiplerin performansına bağlıdır.</p></div>`;
  }
  return `<div class="page-intro"><p class="eyebrow">BİRİKİM, RİSK VE GİRİŞİM</p><h1>Ekonomi</h1><p>Borsada alım-satım yap, işletme kur veya yeteneklerini yarışmalarda dene. Piyasa her yaş atladığında hareket eder.</p></div>${tabBar}${content}`;
}

function educationPage() {
  const exam = life.education.exam || "Henüz sınava girilmedi";
  const examRows = life.education.exams.slice().reverse().map((item) =>
    `<article class="exam-row"><span>${item.type === "yks" ? "🎓" : item.type === "license" ? "🚗" : "📝"}</span><div><b>${esc(item.type === "written" ? `${item.subject} yazılısı` : item.type.toLocaleUpperCase("tr-TR"))}</b><small>${item.age}. yaş</small></div><strong>${item.score}/${item.maxScore}${item.passed === null ? "" : item.passed ? " · Geçti" : " · Tekrar gerekli"}</strong></article>`,
  ).join("");
  const programs = life.education.yksScore === null ? "" : `<section class="section-block"><div class="section-heading"><div><p class="eyebrow">YKS TERCİHİ</p><h2>${life.education.program ? esc(life.education.program) : `${life.education.yksScore} puanla tercih yap`}</h2></div></div>
    ${life.education.program ? `<div class="note-card"><span>🎓</span><p>${esc(life.education.program)} bölümüne yerleştin. Üniversite mezuniyetinden sonra lisans isteyen mesleklere başvurabilirsin.</p></div>` :
      `<div class="education-grid">${universityPrograms.map((program) => `<article class="education-step ${life.education.yksScore >= program.score ? "step-reached" : ""}"><span>🎓</span><div><b>${esc(program.name)}</b><small>Taban puan ${program.score}</small></div><button class="text-link" data-action="university" data-program="${program.id}" ${life.education.yksScore < program.score ? "disabled" : ""}>${life.education.yksScore >= program.score ? "Tercih et →" : "Puan yetmiyor"}</button></article>`).join("")}</div>`}
    </section>`;
  return `<div class="page-intro"><p class="eyebrow">ÖĞRENMEK BİR YOLCULUK</p><h1>Eğitim yolun</h1><p>Yazılılara, LGS'ye ve YKS'ye gerçekten gir; sonuçların okul ve bölüm seçeneklerini belirlesin.</p></div>
    <div class="education-feature"><span class="feature-art">🎓</span><div><p class="eyebrow">ŞU ANKİ AŞAMAN</p><h2>${esc(life.education.stage)}</h2><p>${life.education.grade ? `${life.education.grade}. sınıf` : "Yeni bir başlangıç"}${life.education.schoolPlacement ? ` · ${esc(life.education.schoolPlacement)}` : ""}</p></div><div class="education-age"><b>${life.age}</b><small>yaş</small></div></div>
    <div class="education-grid">
      ${[
        ["🎒", "İlkokul", "7 yaşında başlar", 7],
        ["📘", "Ortaokul", "12 yaşında değerlendirme", 12],
        ["🏫", "LGS ve lise", "14 yaş sınavı, 15 yaş tercihi", 14],
        ["✍️", "YKS", "17 yaşında hazırlık, 18 yaşında sınav", 17],
        ["🎓", "Üniversite", "Puanına uygun program seç", 18],
      ].map(([icon, title, text, age]) => `<article class="education-step ${life.age >= age ? "step-reached" : ""}"><span>${icon}</span><div><b>${title}</b><small>${text}</small></div><i>${life.age >= age ? "✓" : `${age}+`}</i></article>`).join("")}
    </div>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">SINAV SONUÇLARI</p><h2>${esc(exam)}</h2></div></div>
      <div class="score-grid"><div class="balance-panel"><small>LGS puanı</small><b>${life.education.lgsScore === null ? "—" : `${life.education.lgsScore}/500`}</b><p>Okul tercihini etkiler</p></div><div class="balance-panel"><small>YKS puanı</small><b>${life.education.yksScore === null ? "—" : `${life.education.yksScore}/500`}</b><p>Üniversite programlarını açar</p></div></div>
    </section>
    ${life.age >= 7 ? `<form class="panel-card exam-card" data-form="written"><div class="panel-title"><span class="panel-icon lavender">✎</span><div><p class="eyebrow">OKUL YAZILISI</p><h3>Bir dersten sınava gir</h3></div></div><p>Hazırlığın ve beceri puanların sonucunu etkiler. Aynı dersten aynı yaşta bir kez sınava girebilirsin.</p><div class="inline-form"><label>Ders<select name="subject"><option>Türkçe</option><option>Matematik</option><option>Fen Bilimleri</option><option>Sosyal Bilgiler</option><option>İngilizce</option></select></label><button class="primary-button" type="submit">Yazılıya gir →</button></div><button class="secondary-button" type="button" data-action="study">📚 Önce ders çalış</button></form>` :
      `<div class="locked-card"><span>🔒</span><div><b>Okul yazılıları 7 yaşında açılır</b><p>Yaş atladıkça farklı derslerden sınava girebilirsin.</p></div></div>`}
    ${programs}
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">SINAV GEÇMİŞİ</p><h2>Girdiğin sınavlar</h2></div></div><div class="exam-list">${examRows || `<div class="empty-state"><span>✧</span><p>Henüz sınav sonucu yok. İlk yazılına 7 yaşında girebilirsin.</p></div>`}</div></section>`;
}

function careerPage() {
  const filtered = professions.filter((profession) => profession.name.toLocaleLowerCase("tr-TR").includes(careerQuery.toLocaleLowerCase("tr-TR")));
  const pageSize = 8;
  careerPageIndex = Math.min(careerPageIndex, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
  const entries = filtered.slice(careerPageIndex * pageSize, (careerPageIndex + 1) * pageSize).map((profession) => {
    const requirement = careerRequirement(life, profession);
    const details = [profession.education === 2 ? "Üniversite mezunu" : profession.education === 1 ? "Lise mezunu" : "Eğitim şartı yok",
      profession.exam ? "Kamu sınavı" : "", profession.license ? "Ehliyet" : ""].filter(Boolean).join(" · ");
    return `<article class="profession-card"><div><p class="eyebrow">${esc(details)}</p><h3>${esc(profession.name)}</h3><p>${requirement ? esc(requirement) : "Başvuru koşulları uygun"}</p></div><div class="profession-pay"><small>Aylık</small><b>${money(profession.salary)}</b><button class="primary-button" data-action="career-apply" data-profession="${profession.id}" ${requirement ? "disabled title=\"${esc(requirement)}\"" : ""}>${requirement ? "Henüz uygun değil" : "Başvur →"}</button></div></article>`;
  }).join("");
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  return `<div class="page-intro"><p class="eyebrow">EMEĞİNLE KURDUĞUN GELECEK</p><h1>Kariyerin</h1><p>Eğitimine ve becerilerine göre 25 farklı işe başvur. Kamu kadrolarında sınav sonucu gerekir.</p></div>
    <div class="career-hero"><div><p class="eyebrow">ŞU ANKİ İŞİN</p><h2>${esc(life.career.job || "Henüz bir işin yok")}</h2><p>${life.career.job ? `${life.career.experience} yıl deneyim` : canDo(life, "job") ? "Koşullarını karşıladığın işlere başvurabilirsin." : "İlk iş başvuruları 16 yaşında açılır."}</p></div><div class="salary-box"><small>Aylık maaş</small><b>${money(life.career.salary)}</b></div></div>
    <div class="panel-card progression-card"><div class="panel-title"><span class="panel-icon peach">↗</span><div><p class="eyebrow">KARİYER YOLCULUĞU</p><h3>${life.career.experience} yıl deneyim</h3></div></div><p>Maaşlar aylık gösterilir ve yaş atlayınca 12 aylık gelir hesabına eklenir. Her üç çalışma yılında zam alırsın.</p><div class="career-metrics"><span><small>Bir sonraki zam</small><b>${life.career.job ? `${3 - life.career.experience % 3} yıl` : "İşe başlayınca"}</b></span><span><small>Ehliyet</small><b>${esc(life.career.license.status)}${life.career.license.score === null ? "" : ` · ${life.career.license.score}/100`}</b></span><button class="secondary-button" data-action="license" ${life.age < 18 || life.career.license.status === "Aldı" ? "disabled" : ""}>${life.age < 18 ? "Ehliyet 18 yaşında açılır" : life.career.license.status === "Aldı" ? "Ehliyet alındı" : "Ehliyet sınavına gir · 1.800 ₺"}</button>${life.career.job ? `<button class="danger-button" data-action="leave-job">İşten ayrıl</button>` : ""}</div></div>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">MESLEKLER</p><h2>İş ilanları</h2></div><span class="soft-label">${filtered.length} meslek</span></div>
      <form class="search-form" data-form="career-search"><input name="query" value="${esc(careerQuery)}" placeholder="Meslek ara" aria-label="Meslek ara" /><button class="secondary-button" type="submit">Ara</button></form>
      <div class="profession-list">${entries || `<div class="empty-state"><p>Bu aramayla eşleşen meslek bulunamadı.</p></div>`}</div>
      <div class="pagination"><button class="secondary-button" data-action="career-page" data-page="${careerPageIndex - 1}" ${careerPageIndex === 0 ? "disabled" : ""}>← Önceki</button><span>${careerPageIndex + 1} / ${pageCount}</span><button class="secondary-button" data-action="career-page" data-page="${careerPageIndex + 1}" ${careerPageIndex + 1 >= pageCount ? "disabled" : ""}>Sonraki →</button></div>
    </section>`;
}

function bankPage() {
  const casino = canDo(life, "casino")
    ? `<div class="panel-card casino-card"><div class="panel-title"><span class="panel-icon lavender">🎲</span><div><p class="eyebrow">18+ · ŞANS OYUNU</p><h3>Şansını dene</h3></div></div><p>Bahsini kaybedebilir veya aynı miktarı kazanabilirsin. Sonucu seçtiğin bahis ve şans belirler.</p><form class="casino-form" data-form="casino"><label>Bahis miktarı<input name="wager" type="number" min="1" max="${life.money}" required placeholder="Tutar" /></label><button class="primary-button" type="submit" ${life.money < 1 ? "disabled" : ""}>Oyna →</button></form></div>`
    : `<div class="locked-card"><span>🔒</span><div><b>Şans oyunu 18 yaşında açılır</b><p>Bu etkinlik yaş sınırına kadar kilitli kalır.</p></div><small>${Math.max(0, 18 - life.age)} yıl kaldı</small></div>`;
  const loan = life.finance.loan;
  const loanPanel = life.age < 18
    ? `<div class="locked-card"><span>🔒</span><div><b>Kredi 18 yaşında açılır</b><p>Yetişkinlikte kredi çekip borcunu geri ödeyebilirsin.</p></div><small>${18 - life.age} yıl kaldı</small></div>`
    : `<section class="panel-card loan-card"><div class="panel-title"><span class="panel-icon lavender">🏦</span><div><p class="eyebrow">KREDİ HESABI</p><h3>${loan ? `Kalan borç ${money(loan.balance)}` : "Kredin yok"}</h3></div></div><p>${loan ? `Yıllık faiz %${Math.round(loan.interestRate * 100)} · ${loan.years} yıl geçti.` : "Ödeyebileceğin bir taksit planı belirle. Borca her yaş atlayışında faiz eklenir."}</p><div class="inline-form"><form data-form="loan-borrow"><label>Kredi tutarı<input name="amount" type="number" min="1" required placeholder="Örn. 10.000" /></label><button class="primary-button" type="submit">Kredi çek</button></form>${loan ? `<form data-form="loan-repay"><label>Ödeme tutarı<input name="amount" type="number" min="1" max="${life.money}" required placeholder="Örn. 2.000" /></label><button class="secondary-button" type="submit">Borç öde</button></form>` : ""}</div></section>`;
  return `<div class="page-intro"><p class="eyebrow">KÜÇÜK BİRİKİMLER, BÜYÜK HAYALLER</p><h1>Bankan</h1><p>Gelirini, birikimini ve harcamalarını yönet.</p></div>
    <div class="bank-total"><div><span class="panel-icon peach">◈</span><p class="eyebrow">TOPLAM BAKİYEN</p><h2>${money(life.money + life.bank)}</h2></div><span class="bank-art">🏦</span></div>
    <div class="balance-grid"><div class="balance-panel"><small>◉ &nbsp; Cüzdan</small><b>${money(life.money)}</b><p>Harcamaya hazır bakiye</p></div><div class="balance-panel"><small>◈ &nbsp; Birikim hesabı</small><b>${money(life.bank)}</b><p>Bankada tuttuğun birikim</p></div></div>
    <div class="transfer-grid">
      <form class="panel-card transfer-form" data-form="deposit"><div class="panel-title"><span class="panel-icon peach">↓</span><div><p class="eyebrow">BİRİKİM YAP</p><h3>Bankaya yatır</h3></div></div><label>Tutar<input name="amount" type="number" min="1" max="${life.money}" required placeholder="Örn. 100" /></label><button class="primary-button" type="submit">Para yatır →</button></form>
      <form class="panel-card transfer-form" data-form="withdraw"><div class="panel-title"><span class="panel-icon lavender">↑</span><div><p class="eyebrow">PARANI KULLAN</p><h3>Cüzdana aktar</h3></div></div><label>Tutar<input name="amount" type="number" min="1" max="${life.bank}" required placeholder="Örn. 50" /></label><button class="secondary-button" type="submit">Para çek →</button></form>
      <form class="panel-card transfer-form" data-form="spend"><div class="panel-title"><span class="panel-icon mint">✧</span><div><p class="eyebrow">KENDİNE BİR ŞEY AL</p><h3>Harcama yap</h3></div></div><label>Tutar<input name="amount" type="number" min="1" max="${life.money}" required placeholder="Örn. 75" /></label><button class="secondary-button" type="submit">Harca →</button></form>
    </div>${loanPanel}${casino}`;
}

function relationsPage() {
  const eligible = canDo(life, "date");
  return `<div class="page-intro"><p class="eyebrow">BAĞ KUR, PAYLAŞ, BÜYÜ</p><h1>İlişkilerin</h1><p>Arkadaşlık ve romantik ilişkiler zamanla şekillenir. Her bağa özen göstermek gerekir.</p></div>
    <div class="relationship-card ${life.relationship ? "has-relationship" : ""}">
      <span class="relationship-art">${life.relationship ? "💞" : "🫶"}</span>
      <p class="eyebrow">${life.relationship ? "HAYATINDAKİ KİŞİ" : "YENİ BAĞLAR KUR"}</p>
      <h2>${life.relationship ? esc(life.relationship.name) : "Hikâyen sana ait"}</h2>
      <p>${life.relationship ? `${life.relationship.years} yıldır birliktesiniz. Yakınlık: ${life.relationship.closeness}/100` : eligible ? "Hayatında henüz romantik bir ilişki yok. Hazır olduğunda yeni biriyle tanışabilirsin." : "Romantik ilişki etkinlikleri 16 yaşında açılır."}</p>
      ${life.relationship ? `<div class="relationship-meter"><span style="width:${life.relationship.closeness}%"></span></div><div class="relation-buttons"><button class="primary-button" data-action="date">Birlikte vakit geçir →</button><button class="secondary-button" data-action="breakup">Yolları ayır</button></div>` :
        `<form class="relation-form" data-form="date"><label>Tanışacağın kişinin adı<input name="name" maxlength="24" placeholder="İstersen boş bırak" /></label><button class="primary-button" type="submit" ${!eligible ? "disabled" : ""}>${eligible ? "Biriyle tanış →" : "16 yaşında açılır"}</button></form>`}
    </div>
    <div class="note-card"><span>♡</span><p><b>İlişkiler karşılıklı emek ister.</b><br>Birlikte vakit geçirmek yakınlığı artırır; seçimlerin mutluluğunu da etkiler.</p></div>`;
}

function socialPage() {
  const eligible = canDo(life, "social");
  const postTypes = [
    ["🌅", "Güzel bir gün", "Bugün kendime güzel bir gün hediye ettim."],
    ["📚", "Yeni öğrendiklerim", "Bugün yeni bir şey öğrendim, her gün biraz daha."],
    ["🎉", "Küçük bir kutlama", "Küçük başarılar da kutlamaya değer!"],
  ];
  return `<div class="page-intro"><p class="eyebrow">ALORA AKIŞI</p><h1>Sosyal dünyan</h1><p>Yaşadığın güzel anları paylaş; takipçi, görüntülenme ve beğeni kazan. Gelir için istikrarlı büyümen gerekir.</p></div>
    <div class="social-metrics"><div class="balance-panel"><small>Takipçi</small><b>${life.socialMedia.followers.toLocaleString("tr-TR")}</b><p>${life.socialMedia.posts} paylaşım</p></div><div class="balance-panel"><small>Toplam görüntülenme</small><b>${life.socialMedia.views.toLocaleString("tr-TR")}</b><p>${life.socialMedia.likes.toLocaleString("tr-TR")} beğeni</p></div><div class="balance-panel"><small>Aylık içerik geliri</small><b>${money(life.socialMedia.incomeMonthly)}</b><p>${life.socialMedia.followers >= 5000 ? "Yaş atlayınca yıllık gelirine eklenir" : "Gelir 5.000 takipçide açılır"}</p></div></div>
    ${eligible ? `<div class="post-card"><p class="eyebrow">BUGÜN NE PAYLAŞMAK İSTERSİN?</p><div class="post-choices">${postTypes.map(([icon, title, text]) => `<button data-post="${esc(text)}"><span>${icon}</span><b>${title}</b><small>Akışında paylaş →</small></button>`).join("")}</div></div>` :
      `<div class="locked-card"><span>🔒</span><div><b>Sosyal medya 13 yaşında açılır</b><p>O zamana kadar hayatının güzel anlarını yaşamaya devam et.</p></div><small>${13 - life.age} yıl kaldı</small></div>`}
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">YALNIZCA SENİN AKIŞIN</p><h2>Paylaşımların ve anıların</h2></div></div><div class="feed-list social-feed">${life.feed.filter((item) => item.icon === "📱").length ? life.feed.filter((item) => item.icon === "📱").map(feedItem).join("") : `<div class="empty-state"><span>✧</span><p>Henüz paylaşımın yok. Güzel bir anın olduğunda burada saklanır.</p></div>`}</div></section>`;
}

function settingsPage() {
  return `<div class="page-intro"><p class="eyebrow">SENİN OYUNUN, SENİN KONTROLÜN</p><h1>Ayarlar</h1><p>Kayıt dosyanı yönet ve uygulamayı istediğin gibi kullan.</p></div>
    <div class="settings-grid">
      <section class="panel-card setting-card"><div class="panel-title"><span class="panel-icon mint">✓</span><div><p class="eyebrow">OTOMATİK KAYIT</p><h3>İlerlemen güvende</h3></div></div><p>Her seçimin ve yaptığın etkinlik bu cihazda otomatik kaydedilir. Oyunu yeniden açtığında kaldığın yerden devam edersin.</p><button class="secondary-button" data-action="export">Kayıt dosyasını dışa aktar ↓</button><button class="secondary-button" data-action="import">Kayıt dosyasını içe aktar ↑</button><input id="import-file" type="file" accept="application/json,.json" hidden /></section>
      <section class="panel-card setting-card"><div class="panel-title"><span class="panel-icon peach">⚙</span><div><p class="eyebrow">OYUNU YÖNET</p><h3>Yeni bir başlangıç</h3></div></div><p>Mevcut hayatını sıfırlayabilir veya uygulamayı Windows ayarlarından kaldırabilirsin.</p><button class="danger-button" data-action="reset">Hayatımı sıfırla</button><div class="uninstall-note"><b>Uygulamayı kaldırmak için</b><p>Windows <b>Ayarlar → Uygulamalar → Yüklü uygulamalar</b> bölümünde “Alora Hayat”ı bulup Kaldır'ı seç. İlerleme kayıtları kaldırma işleminden sonra cihazda kalır; önce dışa aktarabilir veya oyundan sıfırlayabilirsin.</p></div></section>
    </div>
    <div class="disclaimer"><span>♡</span><p><b>Oyun içi bakiye bilgilendirmesi</b><br>Bu oyundaki tüm para sanaldır; gerçek para değildir, satın alınamaz ve gerçek paraya dönüştürülemez. Şans oyunu yalnızca 18 yaşından itibaren oyun içi bakiyeyle kullanılabilir.</p></div>`;
}

function render() {
  if (!life) {
    app.innerHTML = setupView();
    return;
  }
  const pages = {
    life: lifePage,
    activities: activitiesPage,
    family: familyPage,
    education: educationPage,
    career: careerPage,
    bank: bankPage,
    market: marketPage,
    relations: relationsPage,
    social: socialPage,
    settings: settingsPage,
  };
  app.innerHTML = shell(pages[tab]());
}

function doAge() {
  modalError = "";
  try {
    advanceYear(life);
    notice = "";
    persist();
  } catch (error) {
    notice = error.message;
  }
  render();
}

function perform(activity, options = {}) {
  try {
    const result = doActivity(life, activity, options);
    notice = result.message;
    persist();
  } catch (error) {
    notice = error.message;
  }
  render();
}

function commit(action) {
  try {
    notice = action();
    persist();
  } catch (error) {
    notice = error.message;
  }
  render();
}

function downloadSave() {
  const blob = new Blob([JSON.stringify(life, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `alora-hayat-${life.firstName.toLocaleLowerCase("tr-TR")}-kayit.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  flash("Kayıt dosyan indirildi.");
}

function importSave(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = migrateLife(JSON.parse(String(reader.result)));
      if (!isValidLife(imported)) {
        throw new Error("Bu dosya geçerli bir Alora Hayat kaydı değil.");
      }
      life = imported;
      persist();
      flash("Kayıt dosyan yüklendi.");
    } catch (error) {
      flash(error.message || "Kayıt dosyası okunamadı.");
    }
  };
  reader.onerror = () => flash("Dosya okunamadı.");
  reader.readAsText(file);
}

app.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  if (form.id === "start-form") {
    try {
      life = createLife({
        firstName: String(data.get("firstName") || ""),
        lastName: String(data.get("lastName") || ""),
        birthDate: String(data.get("birthDate") || ""),
      });
      tab = "life";
      notice = "";
      persist();
      render();
    } catch (error) {
      notice = error.message;
      render();
    }
    return;
  }
  const action = form.dataset.form;
  if (["deposit", "withdraw", "spend"].includes(action)) {
    perform(action, { amount: data.get("amount") });
  } else if (action === "date") {
    perform("date", { name: data.get("name") });
  } else if (action === "casino") {
    perform("casino", { wager: data.get("wager") });
  } else if (action === "family-send") {
    commit(() => performFamilyAction(life, {
      action: "sendMoney", memberId: data.get("memberId"), amount: data.get("amount"),
    }).message);
  } else if (action === "loan-borrow" || action === "loan-repay") {
    commit(() => manageLoan(life, action === "loan-borrow" ? "borrow" : "repay", data.get("amount")));
  } else if (action === "business") {
    commit(() => startBusiness(life, data.get("sector"), data.get("name")));
  } else if (action === "stock") {
    const trade = event.submitter?.value;
    commit(() => tradeStock(life, data.get("symbol"), trade, data.get("shares")));
  } else if (action === "written") {
    commit(() => takeExam(life, "written", String(data.get("subject") || "")).message);
  } else if (action === "activity-search") {
    activityQuery = String(data.get("query") || "").trim();
    activityPage = 0;
    render();
  } else if (action === "career-search") {
    careerQuery = String(data.get("query") || "").trim();
    careerPageIndex = 0;
    render();
  }
});

app.addEventListener("click", (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;
  if (target.dataset.nav) {
    tab = target.dataset.nav;
    notice = "";
    render();
    return;
  }
  if (target.dataset.marketTab) {
    marketTab = target.dataset.marketTab;
    render();
    return;
  }
  if (target.dataset.choice !== undefined) {
    try {
      chooseEvent(life, Number(target.dataset.choice));
      modalError = "";
      persist();
    } catch (error) {
      modalError = error.message;
    }
    render();
    return;
  }
  if (target.dataset.post) {
    perform("social", { text: target.dataset.post });
    return;
  }
  switch (target.dataset.action) {
    case "age": doAge(); break;
    case "catalog": perform("catalog", { id: target.dataset.id }); break;
    case "exercise": perform("exercise"); break;
    case "study": perform("study"); break;
    case "work": perform("work"); break;
    case "date": perform("date"); break;
    case "activity-page": activityPage = Number(target.dataset.page); render(); break;
    case "career-page": careerPageIndex = Number(target.dataset.page); render(); break;
    case "career-apply":
      commit(() => applyForCareer(life, target.dataset.profession));
      break;
    case "leave-job":
      commit(() => leaveCareer(life));
      break;
    case "license":
      commit(() => takeExam(life, "license").message);
      break;
    case "university":
      commit(() => chooseUniversityProgram(life, target.dataset.program));
      break;
    case "family-talk":
      commit(() => performFamilyAction(life, { action: "talk", memberId: target.dataset.member }).message);
      break;
    case "family-time":
      commit(() => performFamilyAction(life, { action: "time", memberId: target.dataset.member }).message);
      break;
    case "family-ask":
      commit(() => performFamilyAction(life, { action: "askMoney", memberId: target.dataset.member }).message);
      break;
    case "family-gift": {
      const giftId = document.getElementById(`gift-${target.dataset.member}`)?.value;
      commit(() => performFamilyAction(life, { action: "gift", memberId: target.dataset.member, giftId }).message);
      break;
    }
    case "contest":
      commit(() => enterContest(life, target.dataset.contest).message);
      break;
    case "business-close":
      commit(() => closeBusiness(life));
      break;
    case "breakup":
      if (window.confirm(`${life.relationship?.name || "Bu kişi"} ile yollarınızı ayırmak istiyor musun?`)) perform("breakup");
      break;
    case "clear-notice": notice = ""; render(); break;
    case "export": downloadSave(); break;
    case "import": importInput = app.querySelector("#import-file"); importInput?.click(); break;
    case "reset":
      if (window.confirm("Mevcut hayatın ve cihazdaki kayıt silinecek. Emin misin?")) {
        localStorage.removeItem("alora-hayat-save-v1");
        life = null;
        tab = "life";
        notice = "";
        render();
      }
      break;
    default: break;
  }
});

app.addEventListener("change", (event) => {
  if (event.target.id === "import-file" && event.target.files?.[0]) importSave(event.target.files[0]);
  if (event.target.id === "activity-category") {
    activityCategory = event.target.value;
    activityPage = 0;
    render();
  }
});

try {
  life = loadLife();
} catch {
  notice = "Kayıt dosyası okunamadı. Yeni bir hayat başlatabilirsin.";
}
render();
