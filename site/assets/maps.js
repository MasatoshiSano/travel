/* ===== Honeymoon 2026 maps — Leaflet + OpenStreetMap (no API key) ===== */
(function () {
  if (typeof L === "undefined") return;

  var TILE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  var ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  function baseTiles() { return L.tileLayer(TILE, { maxZoom: 19, attribution: ATTR }); }

  /* 観光ピン：ガイドのカード番号（N°）と一致 */
  function numIcon(n, paris) {
    return L.divIcon({
      className: "",
      html: '<div class="numpin' + (paris ? " paris" : "") + '">' + n + "</div>",
      iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14]
    });
  }
  /* お土産・宿などの絵文字ピン */
  function emojiIcon(emoji, bg) {
    return L.divIcon({
      className: "",
      html: '<div style="background:' + bg + ';width:26px;height:26px;line-height:24px;border-radius:50%;' +
            'text-align:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)">' + emoji + "</div>",
      iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14]
    });
  }
  function dotIcon(paris) {
    return L.divIcon({
      className: "",
      html: '<div class="numpin' + (paris ? " paris" : "") + '" style="width:16px;height:16px;line-height:16px;font-size:0">•</div>',
      iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -10]
    });
  }

  /* ===== ROME（番号 = roma.html のカード N° と一致）===== */
  var ROME = {
    sight: [
      { n: 1,  ll: [41.9050, 12.4547], t: "ヴァチカン美術館＋サン・ピエトロ大聖堂", d: "Day3 朝・要予約（Mybusツアー）" },
      { n: 2,  ll: [41.8902, 12.4922], t: "コロッセオ", d: "Day3 夕・ライトアップ" },
      { n: 3,  ll: [41.8986, 12.4769], t: "パンテオン", d: "Day3 17:00・要予約 €5" },
      { n: 4,  ll: [41.9009, 12.4833], t: "トレヴィの泉", d: "Day1 夜 / Day3 夜" },
      { n: 5,  ll: [41.8992, 12.4731], t: "ナヴォーナ広場", d: "Day3 15:30・ベルニーニの噴水" },
      { n: 7,  ll: [41.9031, 12.4663], t: "カステル・サンタンジェロ", d: "Day3 14:30・テヴェレ川沿い" },
      { n: 8,  ll: [41.8955, 12.4723], t: "カンポ・デ・フィオーリ", d: "Day3 16:30・花の市場広場" },
      { n: 9,  ll: [41.8893, 12.4690], t: "トラステヴェレ地区", d: "穴場・夜のカルボナーラ" },
      { n: 10, ll: [41.9219, 12.5006], t: "コッペデ地区", d: "穴場・幻想建築の一角" },
      { n: 11, ll: [41.8836, 12.4778], t: "マルタ騎士団の鍵穴", d: "穴場・鍵穴からサン・ピエトロ" },
      { n: 12, ll: [41.8847, 12.4797], t: "アランチ庭園", d: "穴場・オレンジ庭園の展望" },
      { n: 13, ll: [41.8895, 12.4977], t: "サン・クレメンテ教会", d: "穴場・地下に重なる古代遺跡" },
      { n: 14, ll: [41.8694, 12.4793], t: "チェントラーレ・モンテマルティーニ", d: "穴場・発電所跡の彫刻美術館" }
    ],
    shop: [
      { ll: [41.9072, 12.4628], t: "Castroni（カストローニ）", d: "Via Cola di Rienzo・ばらまき土産の老舗" },
      { ll: [41.9019, 12.4855], t: "ラ・リナシェンテ（トリトーネ店）", d: "屋上テラス＆デパ地下" },
      { ll: [41.9006, 12.4985], t: "スーパー Conad / Coop", d: "テルミニ周辺・パスタやBaci" }
    ],
    hotel: { ll: [41.9009, 12.5016], t: "Augusta Lucilla Palace", d: "宿・テルミニ駅 徒歩5分" },
    center: [41.9009, 12.4810], zoom: 13,
    note: "⑥ 青の洞窟（カプリ島）は日帰り遠征のため地図には出ません"
  };

  /* ===== PARIS（番号 = paris.html のカード N° と一致）===== */
  var PARIS = {
    sight: [
      { n: 1,  ll: [48.8606, 2.3376], t: "ルーブル美術館", d: "Day6・金曜ノクターン 16:00〜" },
      { n: 2,  ll: [48.8584, 2.2945], t: "エッフェル塔", d: "Day4 夜・スパークル 19:00" },
      { n: 3,  ll: [48.8738, 2.2950], t: "凱旋門＋シャンゼリゼ", d: "Day4 15:30・展望台" },
      { n: 6,  ll: [48.8530, 2.3499], t: "ノートルダム大聖堂", d: "2024年12月 再開・Day4/8 街ブラ" },
      { n: 7,  ll: [48.8709, 2.3645], t: "サン=マルタン運河", d: "Day8 9:30・ブランチ" },
      { n: 8,  ll: [48.8553, 2.3656], t: "マレ地区＆ヴォージュ広場", d: "Day4 / Day8・街ブラ" },
      { n: 9,  ll: [48.8607, 2.3522], t: "ポンピドゥーセンター", d: "Day8 12:00・現代美術" },
      { n: 10, ll: [48.8867, 2.3431], t: "モンマルトル＆サクレ・クール", d: "穴場・丘の上の聖堂" },
      { n: 11, ll: [48.8554, 2.3450], t: "サント・シャペル", d: "穴場・光のステンドグラス" },
      { n: 12, ll: [48.8635, 2.3275], t: "チュイルリー庭園", d: "穴場・ルーブル前の庭園" }
    ],
    shop: [
      { ll: [48.8709, 2.3300], t: "Monoprix（モノプリ）", d: "雑貨・ばらまき土産の定番" },
      { ll: [48.8585, 2.3550], t: "マリアージュ フレール（マレ本店）", d: "高級紅茶" },
      { ll: [48.8520, 2.3340], t: "シティファルマ（Citypharma）", d: "コスメ最安・サンジェルマン" },
      { ll: [48.8731, 2.3320], t: "ギャラリー・ラファイエット", d: "デパート・免税手続き" }
    ],
    hotel: { ll: [48.8838, 2.3322], t: "Timhotel Opéra Blanche Fontaine", d: "宿・9区 ブランシュ" },
    center: [48.8640, 2.3360], zoom: 13,
    note: "④ ヴェルサイユ・⑤ モン・サン・ミッシェルは郊外のため地図には出ません"
  };

  function renderCategorized(id, data, paris) {
    var el = document.getElementById(id);
    if (!el) return;
    var map = L.map(id, { scrollWheelZoom: false }).setView(data.center, data.zoom);
    baseTiles().addTo(map);

    var gSight = L.layerGroup(), gShop = L.layerGroup(), gHotel = L.layerGroup();
    var pts = [];

    data.sight.forEach(function (s) {
      pts.push(s.ll);
      L.marker(s.ll, { icon: numIcon(s.n, paris) })
        .bindPopup("<b>" + s.n + ". " + s.t + "</b>" + (s.d ? "<br>" + s.d : ""))
        .addTo(gSight);
    });
    data.shop.forEach(function (s) {
      pts.push(s.ll);
      L.marker(s.ll, { icon: emojiIcon("🛍", "#d98e2b") })
        .bindPopup("<b>🛍 " + s.t + "</b>" + (s.d ? "<br>" + s.d : ""))
        .addTo(gShop);
    });
    if (data.hotel) {
      pts.push(data.hotel.ll);
      L.marker(data.hotel.ll, { icon: emojiIcon("🏨", paris ? "#2d4a7c" : "#8b2c1d") })
        .bindPopup("<b>🏨 " + data.hotel.t + "</b><br>" + data.hotel.d)
        .addTo(gHotel);
    }

    gSight.addTo(map); gShop.addTo(map); gHotel.addTo(map);
    L.control.layers(null, {
      "🗺 観光スポット": gSight,
      "🛍 お土産": gShop,
      "🏨 宿": gHotel
    }, { collapsed: false, position: "topright" }).addTo(map);

    if (data.note) {
      var nc = L.control({ position: "bottomleft" });
      nc.onAdd = function () {
        var d = L.DomUtil.create("div");
        d.style.cssText = "background:rgba(255,255,255,.92);padding:4px 9px;border-radius:4px;" +
          "font-size:11px;color:#5a4a3a;box-shadow:0 1px 4px rgba(0,0,0,.25);max-width:240px";
        d.innerHTML = data.note;
        return d;
      };
      nc.addTo(map);
    }

    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.12));
  }

  function renderOverview(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var ROMA = [41.9028, 12.4964], PARISc = [48.8566, 2.3522], MSM = [48.6361, -1.5115];
    var map = L.map(id, { scrollWheelZoom: false }).setView([45.6, 6.5], 5);
    baseTiles().addTo(map);
    L.marker(ROMA, { icon: numIcon(1, false) }).addTo(map).bindPopup("<b>① ローマ</b><br>6/28〜7/1・3泊");
    L.marker(PARISc, { icon: numIcon(2, true) }).addTo(map).bindPopup("<b>② パリ</b><br>7/1〜7/5・4泊");
    L.marker(MSM, { icon: dotIcon(true) }).addTo(map).bindPopup("<b>モン・サン・ミッシェル</b><br>Day5・パリから日帰り");
    L.polyline([ROMA, PARISc], { color: "#8b2c1d", weight: 3, opacity: .7, dashArray: "2 9" }).addTo(map)
      .bindPopup("ITA AZ316 ローマ→パリ（7/1）");
    L.polyline([PARISc, MSM], { color: "#2d4a7c", weight: 2, opacity: .6, dashArray: "2 9" }).addTo(map);
    map.fitBounds(L.latLngBounds([ROMA, PARISc, MSM]).pad(0.2));
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderOverview("map-overview");
    renderCategorized("map-rome", ROME, false);
    renderCategorized("map-paris", PARIS, true);
  });
})();
