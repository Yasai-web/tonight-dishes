"use strict";

/* ============================================================
 * 今夜なに食べる？ ―― 夕ごはん献立決めアプリ
 * 素の HTML / CSS / JS のみ。ビルド不要。
 * ============================================================ */

/* 気分チップの推奨並び順（CSV に登場したものだけ表示） */
const MOOD_ORDER = [
  "がっつり", "さっぱり", "鍋でラク", "中華",
  "子どもが喜ぶ", "早く完結", "夏向け",
];

/* CSV 読込失敗時に使うフォールバック既定データ（5章の25品） */
const FALLBACK_DISHES = [
  { name: "親子丼", category: "鶏", moods: ["子どもが喜ぶ", "早く完結"], ingredients: ["鶏もも肉", "卵", "玉ねぎ", "めんつゆ", "ごはん"], note: "" },
  { name: "サラダチキン", category: "鶏", moods: ["さっぱり"], ingredients: ["鶏むね肉", "塩", "こしょう"], note: "" },
  { name: "手羽元の鍋", category: "鶏", moods: ["鍋でラク"], ingredients: ["鶏手羽元", "白菜", "長ねぎ", "豆腐", "きのこ"], note: "" },
  { name: "グラタン", category: "鶏", moods: ["子どもが喜ぶ"], ingredients: ["鶏もも肉", "マカロニ", "牛乳", "玉ねぎ", "チーズ"], note: "" },
  { name: "生姜焼き", category: "肉", moods: ["がっつり", "夏向け"], ingredients: ["豚ロース", "生姜", "玉ねぎ", "醤油", "みりん"], note: "" },
  { name: "回鍋肉", category: "肉", moods: ["中華"], ingredients: ["豚バラ肉", "キャベツ", "ピーマン", "豆板醤", "甜麺醤"], note: "" },
  { name: "もつ鍋風 豚肉鍋", category: "肉", moods: ["鍋でラク"], ingredients: ["豚バラ肉", "キャベツ", "にら", "豆腐", "にんにく"], note: "" },
  { name: "肉じゃが", category: "肉", moods: ["子どもが喜ぶ"], ingredients: ["牛肉", "じゃがいも", "玉ねぎ", "にんじん", "醤油"], note: "" },
  { name: "すき焼き", category: "肉", moods: ["がっつり", "鍋でラク"], ingredients: ["牛肉", "長ねぎ", "春菊", "豆腐", "しらたき"], note: "" },
  { name: "青椒肉絲", category: "肉", moods: ["中華"], ingredients: ["豚肉", "ピーマン", "たけのこ", "オイスターソース", "醤油"], note: "" },
  { name: "ジンギスカン", category: "肉", moods: ["がっつり"], ingredients: ["ラム肉", "もやし", "玉ねぎ", "キャベツ", "ピーマン"], note: "" },
  { name: "ハンバーグ", category: "ひき肉", moods: ["がっつり", "子どもが喜ぶ"], ingredients: ["合いびき肉", "玉ねぎ", "パン粉", "卵", "ケチャップ"], note: "" },
  { name: "餃子", category: "ひき肉", moods: ["中華", "子どもが喜ぶ"], ingredients: ["豚ひき肉", "キャベツ", "にら", "にんにく", "餃子の皮"], note: "" },
  { name: "ミートソース", category: "ひき肉", moods: ["子どもが喜ぶ"], ingredients: ["合いびき肉", "玉ねぎ", "トマト缶", "にんにく", "パスタ"], note: "" },
  { name: "焼き魚（鮭・あじ・ほっけ）", category: "魚", moods: ["さっぱり"], ingredients: ["切り身魚", "塩", "大根おろし"], note: "" },
  { name: "さばの味噌煮", category: "魚", moods: ["さっぱり"], ingredients: ["さば", "味噌", "生姜", "砂糖", "みりん"], note: "" },
  { name: "麻婆豆腐", category: "豆腐", moods: ["中華"], ingredients: ["豆腐", "豚ひき肉", "長ねぎ", "豆板醤", "甜麺醤"], note: "" },
  { name: "肉豆腐", category: "豆腐", moods: ["さっぱり", "鍋でラク"], ingredients: ["豆腐", "牛肉", "長ねぎ", "醤油", "砂糖"], note: "" },
  { name: "チャーハン", category: "主食", moods: ["早く完結"], ingredients: ["ごはん", "卵", "長ねぎ", "ハム", "醤油"], note: "" },
  { name: "パスタ", category: "主食", moods: ["早く完結"], ingredients: ["パスタ", "にんにく", "オリーブオイル", "ベーコン", "玉ねぎ"], note: "" },
  { name: "焼きそば", category: "主食", moods: ["早く完結", "夏向け"], ingredients: ["焼きそば麺", "豚バラ肉", "キャベツ", "にんじん", "ソース"], note: "" },
  { name: "うどん", category: "主食", moods: ["早く完結"], ingredients: ["うどん", "めんつゆ", "長ねぎ", "油揚げ", "卵"], note: "" },
  { name: "オムライス", category: "主食", moods: ["子どもが喜ぶ", "早く完結"], ingredients: ["ごはん", "卵", "鶏肉", "玉ねぎ", "ケチャップ"], note: "" },
  { name: "お好み焼き", category: "主食", moods: ["子どもが喜ぶ", "夏向け"], ingredients: ["小麦粉", "キャベツ", "卵", "豚バラ肉", "ソース"], note: "" },
  { name: "冷やしラーメン", category: "主食", moods: ["さっぱり", "早く完結", "夏向け"], ingredients: ["中華麺", "きゅうり", "ハム", "卵", "トマト"], note: "" },
];

const ALL_LABEL = "すべて";

/* アプリ状態 */
const state = {
  dishes: [],        // 全料理
  moods: [],         // チップ一覧（「すべて」含む）
  selectedMood: ALL_LABEL,
  filtered: [],      // 現在の絞り込み結果
  lastPicked: null,  // 直前にルーレットで出した品（連続重複回避用）
  spinning: false,
};

/* DOM 参照 */
const els = {
  notice: document.getElementById("notice"),
  moods: document.getElementById("moods"),
  resultName: document.getElementById("resultName"),
  resultMeta: document.getElementById("resultMeta"),
  resultIngredients: document.getElementById("resultIngredients"),
  resultIngredientList: document.getElementById("resultIngredientList"),
  rouletteBtn: document.getElementById("rouletteBtn"),
  count: document.getElementById("count"),
  dishList: document.getElementById("dishList"),
};

/* ============================================================
 * CSV パース
 *  - BOM / 空行 / 末尾カンマ / 前後空白を許容
 *  - ダブルクオート囲み（"..."、"" によるエスケープ）に最低限対応
 * ============================================================ */
function parseCSV(text) {
  // BOM 除去
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++; // エスケープされたクオート
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch === "\r") {
      // CRLF / CR を吸収（次が \n ならそちらで行確定）
      if (text[i + 1] !== "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      }
    } else {
      field += ch;
    }
  }
  // 最終フィールド / 行
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/* パース結果（行配列）を料理オブジェクトへ変換 */
function rowsToDishes(rows) {
  if (!rows.length) return [];

  // ヘッダー位置を特定（name を含む先頭行）。トリムして比較。
  const header = rows[0].map((c) => c.trim());
  const idx = {
    name: header.indexOf("name"),
    category: header.indexOf("category"),
    moods: header.indexOf("moods"),
    ingredients: header.indexOf("ingredients"),
    note: header.indexOf("note"),
  };
  if (idx.name === -1) {
    throw new Error("CSV ヘッダーに name がありません");
  }

  const dishes = [];
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    // 完全な空行はスキップ
    if (cols.every((c) => c.trim() === "")) continue;

    const name = (cols[idx.name] || "").trim();
    if (!name) continue; // name 必須

    const category = idx.category >= 0 ? (cols[idx.category] || "").trim() : "";
    const moodsRaw = idx.moods >= 0 ? (cols[idx.moods] || "") : "";
    const ingredientsRaw = idx.ingredients >= 0 ? (cols[idx.ingredients] || "") : "";
    const note = idx.note >= 0 ? (cols[idx.note] || "").trim() : "";

    const moods = moodsRaw
      .split("|")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    // 材料も moods と同じく「|」区切り・前後トリム・空要素破棄
    const ingredients = ingredientsRaw
      .split("|")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    dishes.push({ name, category, moods, ingredients, note });
  }

  if (!dishes.length) {
    throw new Error("CSV に有効な料理行がありません");
  }
  return dishes;
}

/* ============================================================
 * 気分チップ生成
 * ============================================================ */
function buildMoodList(dishes) {
  const present = new Set();
  dishes.forEach((d) => d.moods.forEach((m) => present.add(m)));

  const ordered = [];
  // 推奨順のうち登場したもの
  MOOD_ORDER.forEach((m) => {
    if (present.has(m)) {
      ordered.push(m);
      present.delete(m);
    }
  });
  // 推奨順に無い新タグは末尾へ（登場順は Set の挿入順）
  present.forEach((m) => ordered.push(m));

  return [ALL_LABEL, ...ordered];
}

function renderMoodChips() {
  els.moods.innerHTML = "";
  state.moods.forEach((mood) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = mood;
    chip.setAttribute("aria-pressed", String(mood === state.selectedMood));
    chip.addEventListener("click", () => selectMood(mood));
    els.moods.appendChild(chip);
  });
}

function selectMood(mood) {
  state.selectedMood = mood;
  // aria-pressed を更新
  Array.from(els.moods.children).forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.textContent === mood));
  });
  applyFilter();
}

/* ============================================================
 * 絞り込み
 * ============================================================ */
function applyFilter() {
  if (state.selectedMood === ALL_LABEL) {
    state.filtered = state.dishes.slice();
  } else {
    state.filtered = state.dishes.filter((d) =>
      d.moods.includes(state.selectedMood)
    );
  }
  renderCount();
  renderDishList();
  els.rouletteBtn.disabled = state.filtered.length === 0;
}

function renderCount() {
  els.count.textContent = `候補 ${state.filtered.length}品`;
}

function renderDishList() {
  els.dishList.innerHTML = "";
  state.filtered.forEach((dish, index) => {
    const li = document.createElement("li");
    li.className = "dish-row";

    // 上段：料理名ボタン（左）＋材料トグル（右）を横並び
    const top = document.createElement("div");
    top.className = "dish-row-top";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dish-item";

    const name = document.createElement("span");
    name.className = "dish-name";
    name.textContent = dish.name;

    const cat = document.createElement("span");
    cat.className = "dish-category";
    cat.textContent = dish.category || "";

    btn.appendChild(name);
    btn.appendChild(cat);
    btn.addEventListener("click", () => setResult(dish));

    top.appendChild(btn);
    li.appendChild(top);

    // 材料がある品だけ、右端にカートアイコンのトグルを付ける
    if (dish.ingredients && dish.ingredients.length) {
      const listId = `ingredients-${index}`;

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "ingredient-toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", listId);
      toggle.setAttribute("aria-label", "材料を開く");
      toggle.appendChild(cartIcon());

      const ul = document.createElement("ul");
      ul.className = "ingredient-list";
      ul.id = listId;
      ul.hidden = true;
      renderIngredientItems(ul, dish.ingredients);

      toggle.addEventListener("click", () => {
        const open = ul.hidden;
        ul.hidden = !open;
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "材料を閉じる" : "材料を開く");
      });

      top.appendChild(toggle);
      li.appendChild(ul);
    }

    els.dishList.appendChild(li);
  });
}

/* カートアイコン（インライン SVG） */
function cartIcon() {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const paths = [
    "M6 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M17 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M17 17h-11v-14h-2",
    "M6 5l14 1l-1 7h-13",
  ];
  paths.forEach((d) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    svg.appendChild(p);
  });
  return svg;
}

/* 材料の <li> 群を指定の <ul> に描画（共通） */
function renderIngredientItems(ul, ingredients) {
  ul.innerHTML = "";
  (ingredients || []).forEach((ing) => {
    const li = document.createElement("li");
    li.className = "ingredient-item";
    li.textContent = ing;
    ul.appendChild(li);
  });
}

/* ============================================================
 * 結果カード表示
 * ============================================================ */
function setResult(dish, withPop) {
  els.resultName.textContent = dish.name;

  els.resultMeta.innerHTML = "";
  const tags = [];
  if (dish.category) tags.push(dish.category);
  dish.moods.forEach((m) => tags.push(m));
  tags.forEach((t) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = t;
    els.resultMeta.appendChild(span);
  });

  // 材料（買い物確認用）。未記入なら材料エリアごと隠す
  renderIngredientItems(els.resultIngredientList, dish.ingredients);
  els.resultIngredients.hidden = !(dish.ingredients && dish.ingredients.length);

  state.lastPicked = dish;
  els.rouletteBtn.textContent = "もう一回ひく";

  if (withPop && !prefersReducedMotion()) {
    els.resultName.classList.remove("pop");
    // reflow を挟んでアニメ再生
    void els.resultName.offsetWidth;
    els.resultName.classList.add("pop");
  }
}

/* ============================================================
 * ルーレット
 * ============================================================ */
function prefersReducedMotion() {
  return window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* 候補から1品をランダム選択（直前と違うものを優先） */
function pickRandom() {
  const pool = state.filtered;
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  let candidates = pool;
  if (state.lastPicked) {
    const others = pool.filter((d) => d !== state.lastPicked);
    if (others.length > 0) candidates = others;
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function spin() {
  if (state.spinning) return;
  if (state.filtered.length === 0) return;

  const finalPick = pickRandom();
  if (!finalPick) return;

  // reduce motion 時は即時表示
  if (prefersReducedMotion()) {
    setResult(finalPick, false);
    return;
  }

  state.spinning = true;
  els.rouletteBtn.disabled = true;

  const pool = state.filtered;
  let delay = 50;        // 初速（ms）
  const maxDelay = 260;  // 減速の終点
  let timer;

  const tick = () => {
    // 表示用にランダムな名前をパッと出す
    const sample = pool[Math.floor(Math.random() * pool.length)];
    els.resultName.textContent = sample.name;
    els.resultMeta.innerHTML = "";
    els.resultIngredients.hidden = true;

    delay *= 1.18; // だんだん減速
    if (delay >= maxDelay) {
      // 確定
      setResult(finalPick, true);
      state.spinning = false;
      els.rouletteBtn.disabled = false;
      return;
    }
    timer = setTimeout(tick, delay);
  };

  tick();
  // timer は閉包内で管理（解放不要だが lint 回避で参照）
  void timer;
}

/* ============================================================
 * 起動
 * ============================================================ */
function init(dishes, usedFallback) {
  state.dishes = dishes;
  state.moods = buildMoodList(dishes);
  state.selectedMood = ALL_LABEL;
  state.lastPicked = null;

  if (usedFallback) {
    els.notice.hidden = false;
  }

  renderMoodChips();
  applyFilter();

  els.rouletteBtn.addEventListener("click", spin);
}

async function boot() {
  try {
    const res = await fetch("dishes.csv", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const dishes = rowsToDishes(parseCSV(text));
    init(dishes, false);
  } catch (err) {
    // 失敗しても白画面にせず既定データで動かす
    console.warn("dishes.csv を読み込めませんでした。既定データを使用します:", err);
    init(FALLBACK_DISHES.slice(), true);
  }
}

boot();
