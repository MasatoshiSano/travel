/* ===== Honeymoon 2026 — shared nav/UX enhancements (no framework) =====
   - モバイル用ハンバーガーメニュー（全ページ共通・CSS2系統に依存しない）
   - 現在ページの active 表示
   - トップへ戻るフローティングボタン
   - favicon 注入（タブアイコン）
*/
(function () {
  function ready(fn){ if(document.readyState!=="loading"){fn();} else {document.addEventListener("DOMContentLoaded",fn);} }
  ready(function () {
    var nav = document.querySelector("nav.topnav");

    /* ---- 章ジャンプタブ(.chapnav)を topnav の実高さの直下に固定 ----
       ハンバーガー化でnavの高さが変わるため、レイアウト確定後にも再計測する */
    var chapnav = document.querySelector("nav.chapnav");
    if (nav && chapnav) {
      var setTop = function () { chapnav.style.top = nav.offsetHeight + "px"; };
      setTop();
      setTimeout(setTop, 0);
      window.addEventListener("load", setTop);
      window.addEventListener("resize", setTop);
    }

    /* ---- favicon (SVG data URI) ---- */
    if (!document.querySelector('link[rel="icon"]')) {
      var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>" +
        "<rect width='32' height='32' rx='7' fill='#8b2c1d'/>" +
        "<text x='16' y='22' font-size='15' text-anchor='middle' fill='#fbf8f3' " +
        "font-family='Georgia, serif' font-style='italic'>R</text></svg>";
      var ic = document.createElement("link");
      ic.rel = "icon";
      ic.href = "data:image/svg+xml," + encodeURIComponent(svg);
      document.head.appendChild(ic);
    }

    /* ---- inject shared styles once ---- */
    var css = document.createElement("style");
    css.textContent = [
      ".navtoggle{display:none;background:none;border:1px solid rgba(26,20,16,.25);color:#8b2c1d;",
      "font-size:18px;line-height:1;padding:6px 11px;border-radius:6px;cursor:pointer}",
      "nav.topnav a.active{color:#8b2c1d !important;font-weight:700;border-bottom:2px solid #8b2c1d}",
      "#backtop{position:fixed;right:18px;bottom:18px;z-index:1200;width:46px;height:46px;border-radius:50%;",
      "border:none;background:#8b2c1d;color:#fbf8f3;font-size:20px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.28);",
      "opacity:0;pointer-events:none;transition:opacity .25s, transform .25s;transform:translateY(8px)}",
      "#backtop.show{opacity:.92;pointer-events:auto;transform:translateY(0)}",
      "#backtop:hover{opacity:1}",
      "@media (max-width:760px){",
      "  nav.topnav{flex-direction:row !important;flex-wrap:wrap !important;justify-content:space-between !important;align-items:center !important;gap:8px !important}",
      "  nav.topnav .brand{flex:0 1 auto;margin:0 !important}",
      "  nav.topnav .navtoggle{display:inline-flex;order:2}",
      "  nav.topnav ul{display:none !important;width:100%;flex-direction:column !important;flex-wrap:nowrap !important;align-items:flex-start;",
      "    gap:2px !important;margin-top:10px;order:3}",
      "  nav.topnav.open ul{display:flex !important}",
      "  nav.topnav ul li{width:100%}",
      "  nav.topnav ul a{display:block;width:100%;padding:11px 4px;border-bottom:1px solid rgba(26,20,16,.08);font-size:13px}",
      "  nav.topnav a.active{border-bottom:1px solid rgba(26,20,16,.08)}",
      "}"
    ].join("");
    document.head.appendChild(css);

    /* ---- hamburger toggle ---- */
    if (nav) {
      var ul = nav.querySelector("ul");
      if (ul) {
        var btn = document.createElement("button");
        btn.className = "navtoggle";
        btn.setAttribute("aria-label", "メニュー");
        btn.setAttribute("aria-expanded", "false");
        btn.innerHTML = "☰";
        ul.parentNode.insertBefore(btn, ul);
        btn.addEventListener("click", function () {
          var open = nav.classList.toggle("open");
          btn.innerHTML = open ? "✕" : "☰";
          btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
        /* close after tapping a link (in-page or page nav) */
        ul.addEventListener("click", function (e) {
          if (e.target.tagName === "A") { nav.classList.remove("open"); btn.innerHTML = "☰"; btn.setAttribute("aria-expanded","false"); }
        });
      }

      /* ---- inject しおり link if missing ---- */
      if (ul && !ul.querySelector('a[href="shiori.html"]')) {
        var sli = document.createElement("li");
        sli.innerHTML = '<a href="shiori.html">しおり</a>';
        if (ul.firstChild && ul.firstChild.nextSibling) { ul.insertBefore(sli, ul.children[1] || null); } else { ul.appendChild(sli); }
      }

      /* ---- inject 費用(budget) link if missing ---- */
      if (ul && !ul.querySelector('a[href="budget.html"]')) {
        var bli = document.createElement("li");
        bli.innerHTML = '<a href="budget.html">費用</a>';
        ul.appendChild(bli);
      }

      /* ---- active link marking ---- */
      var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
      nav.querySelectorAll("ul a").forEach(function (a) {
        var href = (a.getAttribute("href") || "").toLowerCase();
        if (href === here || (here === "" && href === "index.html")) a.classList.add("active");
      });
    }

    /* ---- footer: add 費用 link + fix outdated "金額非掲載" note ---- */
    document.querySelectorAll("footer.site nav").forEach(function (fn) {
      if (!fn.querySelector('a[href="budget.html"]')) {
        var a = document.createElement("a"); a.href = "budget.html"; a.textContent = "費用"; fn.appendChild(a);
      }
    });
    document.querySelectorAll("footer.site .fine").forEach(function (el) {
      el.innerHTML = el.innerHTML
        .replace("機微情報（予約番号・金額）は非掲載", "予約番号(PNR)は非掲載")
        .replace("料金・予約番号は非掲載", "予約番号(PNR)は非掲載");
    });

    /* ---- back to top ---- */
    var top = document.createElement("button");
    top.id = "backtop";
    top.setAttribute("aria-label", "トップへ戻る");
    top.innerHTML = "↑";
    document.body.appendChild(top);
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    var onScroll = function () { if (window.scrollY > 520) top.classList.add("show"); else top.classList.remove("show"); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  });
})();
