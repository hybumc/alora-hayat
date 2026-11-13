import { canDo, chooseEvent, createLife, doActivity, isValidLife, loadLife, saveLife, advanceYear } from "./game.js";
import "./style.css";

const app = document.querySelector("#app");
let life = null;
let tab = "life";
let notice = "";
let modalError = "";
let importInput = null;

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
  ["life", "⌂", "Hayatım"], ["education", "✎", "Eğitim"], ["career", "↗", "Kariyer"],
  ["bank", "◈", "Banka"], ["relations", "♡", "İlişkiler"], ["social", "◎", "Sosyal"],
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
        <div class="money-foot"><span>●</span> Sadece oyun içi sanal para</div>
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

function educationPage() {
  const exam = life.education.exam || "Henüz sınava girilmedi";
  return `<div class="page-intro"><p class="eyebrow">ÖĞRENMEK BİR YOLCULUK</p><h1>Eğitim yolun</h1><p>Her yıl öğrendiklerinle geleceğine yeni seçenekler ekle.</p></div>
    <div class="education-feature"><span class="feature-art">🎓</span><div><p class="eyebrow">ŞU ANKİ AŞAMAN</p><h2>${esc(life.education.stage)}</h2><p>${life.education.grade ? `${life.education.grade}. sınıf` : "Yeni bir başlangıç"}</p></div><div class="education-age"><b>${life.age}</b><small>yaş</small></div></div>
    <div class="education-grid">
      ${[
        ["🎒", "İlkokul", "7 yaşında başlar", 7],
        ["📘", "Ortaokul", "12 yaşında sınav ve geçiş", 12],
        ["🏫", "Lise", "15 yaşında okul tercihi", 15],
        ["✍️", "YKS", "17 yaşında hazırlık, 18 yaşında tercih", 17],
        ["🎓", "Üniversite", "Tercih ve yerleştirme sonuçları", 18],
      ].map(([icon, title, text, age]) => `<article class="education-step ${life.age >= age ? "step-reached" : ""}"><span>${icon}</span><div><b>${title}</b><small>${text}</small></div><i>${life.age >= age ? "✓" : `${age}+`}</i></article>`).join("")}
    </div>
    <div class="panel-card exam-card"><div class="panel-title"><span class="panel-icon lavender">✎</span><div><p class="eyebrow">SINAV KARNEN</p><h3>${esc(exam)}</h3></div></div>
      <p>Okul dönüm noktalarında sınav ve tercih soruları karşına çıkar. Üniversite tercih başarısı zekâ ve hazırlık durumuna göre belirlenir.</p>
      <button class="secondary-button" data-action="study">📚 Ders çalış <span>+ zekâ, + disiplin</span></button>
    </div>`;
}

function careerPage() {
  const eligible = canDo(life, "job");
  const canPromote = life.age >= 18 && life.career.job === "Yarı zamanlı iş";
  const workAction = canPromote ? "fullTime" : "work";
  const workLabel = canPromote ? "Tam zamanlı işe geç →" : life.career.job ? "İşin var" : eligible ? "İşe başla →" : "16 yaşında açılır";
  return `<div class="page-intro"><p class="eyebrow">EMEĞİNLE KURDUĞUN GELECEK</p><h1>Kariyerin</h1><p>Deneyim kazandıkça yıllık gelirin artar. Eğitim ve çalışma hayatını birlikte şekillendir.</p></div>
    <div class="career-hero"><div><p class="eyebrow">ŞU ANKİ İŞİN</p><h2>${esc(life.career.job || "Henüz bir işin yok")}</h2><p>${life.career.job ? `${life.career.experience} yıl deneyim` : eligible ? "İlk işine başlamak için hazır olabilirsin." : "İş etkinlikleri 16 yaşında açılır."}</p></div><div class="salary-box"><small>Yıllık gelir</small><b>${money(life.career.salary)}</b></div></div>
    <div class="career-grid">
      <article class="career-card"><span>🌱</span><p class="eyebrow">İLK ADIM</p><h3>${life.age < 18 ? "Yarı zamanlı iş" : "Kariyerini ilerlet"}</h3><p>${life.age < 18 ? "16 yaşından itibaren okul ile birlikte çalışabilirsin." : canPromote ? "18 yaşından itibaren tam zamanlı çalışmaya geçebilirsin." : "Yıllık gelir ve deneyim kazan."}</p><button class="primary-button" data-action="${workAction}" ${!eligible || (life.career.job && !canPromote) ? "disabled" : ""}>${workLabel}</button></article>
      <article class="career-card"><span>📚</span><p class="eyebrow">KENDİNE YATIRIM</p><h3>Becerilerini geliştir</h3><p>Ders çalışarak zekânı ve disiplinini güçlendir. Sınavlarda işine yarar.</p><button class="secondary-button" data-action="study">Ders çalış →</button></article>
    </div>
    <div class="panel-card progression-card"><div class="panel-title"><span class="panel-icon peach">↗</span><div><p class="eyebrow">KARİYER YOLCULUĞU</p><h3>Deneyim ve gelir</h3></div></div><p>Çalıştığın her yıl deneyimin artar. Üç yılda bir düzenli zam alırsın. İş gelirleri yılda bir kez yaş atlayınca hesabına eklenir.</p><div class="career-metrics"><span><small>Deneyim</small><b>${life.career.experience} yıl</b></span><span><small>Bir sonraki zam</small><b>${life.career.job ? `${3 - life.career.experience % 3} yıl` : "İşe başlayınca"}</b></span></div></div>`;
}

function bankPage() {
  const casino = canDo(life, "casino")
    ? `<div class="panel-card casino-card"><div class="panel-title"><span class="panel-icon lavender">🎲</span><div><p class="eyebrow">18+ · YALNIZCA SANAL PARA</p><h3>Şans oyunu</h3></div></div><p>Bahsini kaybedebilir veya aynı miktarı kazanabilirsin. Gerçek para, ödeme ve para çekme özelliği yoktur.</p><form class="casino-form" data-form="casino"><label>Bahis miktarı<input name="wager" type="number" min="1" max="${life.money}" required placeholder="Sanal TL" /></label><button class="primary-button" type="submit" ${life.money < 1 ? "disabled" : ""}>Oyna →</button></form></div>`
    : `<div class="locked-card"><span>🔒</span><div><b>Sanal şans oyunu 18 yaşında açılır</b><p>Gerçek para kullanılmaz; yalnızca oyun içi bakiyeyle oynanabilir.</p></div><small>${Math.max(0, 18 - life.age)} yıl kaldı</small></div>`;
  return `<div class="page-intro"><p class="eyebrow">KÜÇÜK BİRİKİMLER, BÜYÜK HAYALLER</p><h1>Bankan</h1><p>Gelirini ve harcamalarını yönet. Buradaki bütün bakiyeler yalnızca oyun içidir.</p></div>
    <div class="bank-total"><div><span class="panel-icon peach">◈</span><p class="eyebrow">TOPLAM BAKİYEN</p><h2>${money(life.money + life.bank)}</h2><small>Gerçek para değildir, dışarı aktarılamaz.</small></div><span class="bank-art">🏦</span></div>
    <div class="balance-grid"><div class="balance-panel"><small>◉ &nbsp; Cüzdan</small><b>${money(life.money)}</b><p>Harcamaya hazır sanal bakiye</p></div><div class="balance-panel"><small>◈ &nbsp; Birikim hesabı</small><b>${money(life.bank)}</b><p>Bankada tuttuğun sanal bakiye</p></div></div>
    <div class="transfer-grid">
      <form class="panel-card transfer-form" data-form="deposit"><div class="panel-title"><span class="panel-icon peach">↓</span><div><p class="eyebrow">BİRİKİM YAP</p><h3>Bankaya yatır</h3></div></div><label>Tutar (sanal TL)<input name="amount" type="number" min="1" max="${life.money}" required placeholder="Örn. 100" /></label><button class="primary-button" type="submit">Para yatır →</button></form>
      <form class="panel-card transfer-form" data-form="withdraw"><div class="panel-title"><span class="panel-icon lavender">↑</span><div><p class="eyebrow">PARANI KULLAN</p><h3>Cüzdana aktar</h3></div></div><label>Tutar (sanal TL)<input name="amount" type="number" min="1" max="${life.bank}" required placeholder="Örn. 50" /></label><button class="secondary-button" type="submit">Para çek →</button></form>
      <form class="panel-card transfer-form" data-form="spend"><div class="panel-title"><span class="panel-icon mint">✧</span><div><p class="eyebrow">KENDİNE BİR ŞEY AL</p><h3>Harcama yap</h3></div></div><label>Tutar (sanal TL)<input name="amount" type="number" min="1" max="${life.money}" required placeholder="Örn. 75" /></label><button class="secondary-button" type="submit">Harca →</button></form>
    </div>${casino}`;
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
  return `<div class="page-intro"><p class="eyebrow">ALORA AKIŞI</p><h1>Sosyal dünyan</h1><p>Yaşadığın güzel anları paylaş. Bu akış yalnızca senin oyun dünyana aittir.</p></div>
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
    <div class="disclaimer"><span>♡</span><p><b>Güvenli oyun alanı</b><br>Kumar etkinliği yalnızca 18 yaşından itibaren açılır ve sadece oyun içi sanal para kullanır. Gerçek para, ödeme veya para çekme özelliği bulunmaz.</p></div>`;
}

function render() {
  if (!life) {
    app.innerHTML = setupView();
    return;
  }
  const pages = {
    life: lifePage,
    education: educationPage,
    career: careerPage,
    bank: bankPage,
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
      const imported = JSON.parse(String(reader.result));
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
    case "exercise": perform("exercise"); break;
    case "study": perform("study"); break;
    case "work": perform("work"); break;
    case "date": perform("date"); break;
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
});

try {
  life = loadLife();
} catch {
  notice = "Kayıt dosyası okunamadı. Yeni bir hayat başlatabilirsin.";
}
render();
