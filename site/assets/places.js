/* ===== Honeymoon 2026 — Google Maps links on guide cards =====
   ローマ/パリ ガイドの各カード（観光スポット・レストラン・ジェラート）に
   Googleマップ検索リンクを自動付与する。
*/
(function () {
  function ready(fn){ if(document.readyState!=="loading"){fn();} else {document.addEventListener("DOMContentLoaded",fn);} }
  ready(function () {
    var path = (location.pathname.split("/").pop() || "").toLowerCase();
    var city = null;
    if (path.indexOf("roma") >= 0) city = "ローマ";
    else if (path.indexOf("paris") >= 0) city = "パリ";
    if (!city) return; // guide pages only

    /* link style (guides have their own CSS, so inject here) */
    var st = document.createElement("style");
    st.textContent = [
      ".maplink{display:inline-flex;align-items:center;gap:5px;margin-top:14px;",
      "font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:.06em;",
      "color:#8b2c1d;text-decoration:none;border:1px solid rgba(139,44,29,.4);",
      "padding:6px 11px;border-radius:4px;transition:background .15s,color .15s}",
      ".maplink:hover{background:#8b2c1d;color:#fff}"
    ].join("");
    document.head.appendChild(st);

    function buildQuery(name) {
      var clean = name
        .replace(/（[^）]*）/g, "")   // 全角カッコの注記を除去
        .replace(/\([^)]*\)/g, "")    // 半角カッコ
        .replace(/[＋+].*$/, "")       // 「A＋B」はAのみ
        .replace(/\s+/g, " ")
        .trim();
      if (!clean) clean = name.trim();
      return clean + " " + city;
    }

    var cards = document.querySelectorAll("article.card");
    cards.forEach(function (card) {
      if (card.querySelector(".maplink")) return;
      var h = card.querySelector(".body h4") || card.querySelector("h4");
      if (!h) return;
      var body = card.querySelector(".body") || card;
      var a = document.createElement("a");
      a.className = "maplink";
      a.target = "_blank";
      a.rel = "noopener";
      a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(buildQuery(h.textContent));
      a.innerHTML = "📍 Googleマップで開く";
      body.appendChild(a);
    });
  });
})();
