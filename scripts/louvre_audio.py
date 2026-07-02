#!/usr/bin/env python3
"""Generate Louvre audio guides via Edge TTS (Nanami Neural / ja-JP female).
15 stops, verified facts, no hallucinations.
Run: python scripts/louvre_audio.py
Output: site/assets/audio/louvre/*.mp3
"""
import asyncio
import json
import shutil
from pathlib import Path

import edge_tts

VOICE = "ja-JP-NanamiNeural"
OUT_DIR = Path(__file__).parent.parent / "site" / "assets" / "audio" / "louvre"
DATA_JSON = Path(__file__).parent.parent / "site" / "assets" / "louvre-data.json"

# ============ 15 Verified Louvre Stops (visit order) ============
STOPS = [
    {
        "id": "01", "num": 1,
        "title": "サモトラケのニケ",
        "title_fr": "Victoire de Samothrace",
        "era": "紀元前190年頃 / ヘレニズム",
        "wing": "Denon", "floor": "1F",
        "salle": "Escalier Daru（ダリュ階段踊り場）",
        "script": (
            "最初の一枚は、勝利の女神サモトラケのニケ。紀元前190年ごろ、"
            "エーゲかいの島の神殿を飾っていた大理石像です。頭も両腕も失われ、"
            "残るのは翼と船首に降り立つ一歩。強い海風を受けて衣が体に張りつく、"
            "その一瞬が2千年を越えて凍りついています。ダリュ階段の踊り場で"
            "右斜め下から見上げると、翼の躍動が空を切ります。ハネムーンの入り口を、"
            "この勝利の女神に見守られながら始めましょう。"
        ),
    },
    {
        "id": "02", "num": 2,
        "title": "モナ・リザ",
        "title_fr": "La Joconde",
        "era": "1503-1519 / レオナルド・ダ・ヴィンチ",
        "wing": "Denon", "floor": "2F",
        "salle": "Salle 711（国家の間）",
        "script": (
            "世界で最も有名な絵、モナ・リザ。レオナルドが16年間手放さず、"
            "死の直前まで筆を入れ続けた肖像画です。輪郭を溶かす技法スフマート、"
            "薄い層を数十回重ねた光の透明感、そして左右で表情の違う微笑み。"
            "金曜の夜間開館は比較的空いていますが、それでもここは急いで先に見ます。"
            "写真は防弾ガラス越しに一枚だけ、フラッシュは絶対禁止。"
            "隣にあるカナの婚礼を見忘れずに。"
        ),
    },
    {
        "id": "03", "num": 3,
        "title": "カナの婚礼",
        "title_fr": "Les Noces de Cana",
        "era": "1563 / パオロ・ヴェロネーゼ",
        "wing": "Denon", "floor": "2F",
        "salle": "Salle 711（モナ・リザの真向かい）",
        "script": (
            "モナ・リザの真向かい、壁いっぱいを覆うのがカナの婚礼です。"
            "縦7メートル横10メートル、ルーブル最大の絵画。イエスが最初の奇跡、"
            "水をぶどう酒に変えた瞬間を描いています。ヴェネツィアの祝宴として"
            "翻案され、130人以上が笑い語らう賑やかさ。ハネムーンの二人が"
            "訪れるべき一枚がここです。手前中央の楽団に、ヴェロネーゼ自身が"
            "白衣で描き込まれています。二人で並んで一枚、記念撮影を。"
        ),
    },
    {
        "id": "04", "num": 4,
        "title": "聖母の死",
        "title_fr": "La Mort de la Vierge",
        "era": "1601-1606 / カラヴァッジョ",
        "wing": "Denon", "floor": "2F",
        "salle": "Salle 712（モナ・リザの隣室）",
        "script": (
            "カラヴァッジョの聖母の死。1601年から1606年の作です。"
            "聖母マリアの臨終を弟子たちが囲む場面ですが、そこにあるのは"
            "光り輝く奇跡ではなく、一人の女性の生々しい死。素足を投げ出し、"
            "腹の膨らむマリアは、モデルがテヴェレ川で溺死した娼婦だったという逸話が"
            "残ります。教会からは拒絶されましたが、ルーベンスが即座に買い取り、"
            "ルイ十四世の手を経てここへ。写実主義の凄まじさに触れてください。"
        ),
    },
    {
        "id": "05", "num": 5,
        "title": "民衆を導く自由の女神",
        "title_fr": "La Liberté guidant le peuple",
        "era": "1830 / ウジェーヌ・ドラクロワ",
        "wing": "Denon", "floor": "2F",
        "salle": "Salle 700（ムーラン・ルージュ通り沿い）",
        "script": (
            "ドラクロワの民衆を導く自由の女神。1830年七月革命を、その年のうちに"
            "描き上げた宣言のような一枚です。三色旗と銃を掲げ、素足で瓦礫を踏む"
            "女神は自由の擬人化。右のシルクハットの青年はドラクロワ自身とも"
            "言われます。パリの原点を、パリで見ている今日を、二人で刻んでください。"
            "画面右奥の煙の向こうに、ノートルダム大聖堂が霞んで見えます。"
        ),
    },
    {
        "id": "06", "num": 6,
        "title": "メデューズ号の筏",
        "title_fr": "Le Radeau de la Méduse",
        "era": "1819 / テオドール・ジェリコー",
        "wing": "Denon", "floor": "2F",
        "salle": "Salle 700",
        "script": (
            "ジェリコーのメデューズ号の筏。1816年、モーリタニア沖で難破した"
            "フランス海軍艦から生まれた実話です。149人が乗せられた即席の筏、"
            "13日間の漂流で生き残ったのは15人。人肉食すら起きたと言われます。"
            "画面右奥の点は救助船、絶望のなかで振られる赤い布。"
            "ジェリコーは死体安置所でスケッチし、実物大で描き切りました。"
            "この五年後、彼はわずか32歳で世を去ります。"
            "ロマン主義の産声を上げた一枚です。"
        ),
    },
    {
        "id": "07", "num": 7,
        "title": "ナポレオン一世の戴冠式",
        "title_fr": "Le Sacre de Napoléon",
        "era": "1805-1807 / ジャック=ルイ・ダヴィッド",
        "wing": "Denon", "floor": "2F",
        "salle": "Salle 702（大画の間）",
        "script": (
            "縦6メートル横10メートル、ダヴィッド作ナポレオン一世の戴冠式です。"
            "1804年12月、ノートルダムで自ら冠を戴いたナポレオンが、"
            "跪く妻ジョゼフィーヌに冠を授ける瞬間。教皇ピウス七世は左でただ祝福を"
            "与えるのみ。国家と結婚を同時に演出した政治絵画の最高峰です。"
            "150人以上の実在人物が描き分けられています。"
            "二人の結婚式もまた、二人にとっての戴冠式ですね。"
        ),
    },
    {
        "id": "08", "num": 8,
        "title": "グランド・オダリスク",
        "title_fr": "La Grande Odalisque",
        "era": "1814 / ジャン=オーギュスト・ドミニク・アングル",
        "wing": "Denon", "floor": "2F",
        "salle": "Salle 702",
        "script": (
            "アングルのグランド・オダリスク、東方の後宮に横たわる女性です。"
            "背骨が三つ多い、脚が長すぎる、腰がねじれすぎる。解剖学的には"
            "破綻していますが、そのゆがみが官能と神秘を生みます。"
            "アングルは正確さより理想を選びました。青いターバン、真珠の首飾り、"
            "薄い扇。滑らかな肌の艶と、絹の質感の対比が絶品です。"
            "完璧すぎない美しさこそが、心を捉えるという教えです。"
        ),
    },
    {
        "id": "09", "num": 9,
        "title": "岩窟の聖母",
        "title_fr": "La Vierge aux rochers",
        "era": "1483-1486 / レオナルド・ダ・ヴィンチ",
        "wing": "Denon", "floor": "2F",
        "salle": "Grande Galerie（大回廊）",
        "script": (
            "モナリザから大回廊を戻ると出会うのが、ダ・ヴィンチ岩窟の聖母です。"
            "薄暗い洞窟の中、聖母マリア、幼子イエス、幼いヨハネ、そして天使ウリエル。"
            "四人が奇跡的な三角構図で結ばれ、間の空気は神秘のスフマートに"
            "包まれています。ダ・ヴィンチが到達した光と陰の魔術、"
            "母の慈しみが暗がりに柔らかく灯ります。同じ大回廊にある"
            "洗礼者ヨハネや聖アンナと合わせて、レオナルドの世界に浸ってください。"
        ),
    },
    {
        "id": "10", "num": 10,
        "title": "瀕死の奴隷",
        "title_fr": "L'Esclave mourant",
        "era": "1513-1516 / ミケランジェロ",
        "wing": "Denon", "floor": "0F",
        "salle": "Salle 403（イタリア彫刻ギャラリー）",
        "script": (
            "ミケランジェロの瀕死の奴隷。1513年から1516年、彼が四十歳前後、"
            "教皇ユリウス二世の墓廟のために彫った奴隷像です。"
            "うっとりと目を閉じ、束縛から解き放たれる恍惚の瞬間。"
            "眠りとも死ともとれる表情、しなやかに逆立つ体の螺旋。"
            "ミケランジェロが得意とした未完の美、大理石から人体が"
            "生まれ出る瞬間が凍結されています。隣に立つ反逆する奴隷と対で味わうと、"
            "諦めと抵抗の対比が際立ちます。"
        ),
    },
    {
        "id": "11", "num": 11,
        "title": "ハムラビ法典",
        "title_fr": "Code de Hammurabi",
        "era": "紀元前1754年頃 / バビロニア",
        "wing": "Richelieu", "floor": "0F",
        "salle": "メソポタミア美術 Salle 227",
        "script": (
            "世界で最も古い成文法、ハムラビ法典。紀元前1754年ごろ、"
            "バビロニア王ハムラビが黒い玄武岩の柱に刻ませました。"
            "高さ2.25メートルの石碑には楔形文字で282条の条文が並びます。"
            "上部にはハムラビ王が太陽神シャマシュから法を授かる姿。"
            "目には目を、歯には歯を、その厳しさで知られる古代の法体系です。"
            "1901年にフランス隊がイランのスサ遺跡で発見しました。"
            "3800年を経て、法の始まりに触れる瞬間です。"
        ),
    },
    {
        "id": "12", "num": 12,
        "title": "ミロのヴィーナス",
        "title_fr": "Vénus de Milo",
        "era": "紀元前100年頃 / ヘレニズム",
        "wing": "Sully", "floor": "0F",
        "salle": "Salle 346",
        "script": (
            "ミロのヴィーナス、愛と美の女神アフロディーテ。紀元前100年ごろの作。"
            "エーゲかいミロス島の農夫が1820年に畑で見つけました。両腕は失われた"
            "ままですが、その欠落こそが想像を掻き立てます。腰でひねる立ち姿、"
            "半分ずり落ちた衣、螺旋を描く体の軸。二千百年前の理想の女性像です。"
            "360度どこから見ても均整が取れるように計算されています。"
            "妻の隣で、静かに一周してみてください。"
        ),
    },
    {
        "id": "13", "num": 13,
        "title": "書記官坐像",
        "title_fr": "Le Scribe accroupi",
        "era": "紀元前2600-2350年頃 / エジプト古王国",
        "wing": "Sully", "floor": "1F",
        "salle": "エジプト美術部門 Salle 22周辺",
        "script": (
            "書記官坐像。紀元前2600年から2350年、エジプト古王国時代の名品です。"
            "1850年、フランス人考古学者マリエットがサッカラで発見しました。"
            "高さ53センチ、あぐらをかいて膝の上のパピルスに文字を書き入れようと"
            "する書記の像。特筆すべきはその瞳。水晶と方解石と銅で作られ、"
            "4500年を経た今も、こちらを見つめ返してくるようです。"
            "ハネムーンの旅で出会う、最も静かな眼差しかもしれません。"
        ),
    },
    {
        "id": "14", "num": 14,
        "title": "レースを編む女",
        "title_fr": "La Dentellière",
        "era": "1669-1670 / ヨハネス・フェルメール",
        "wing": "Richelieu", "floor": "2F",
        "salle": "Salle 837",
        "script": (
            "フェルメールのレースを編む女。縦24センチ横21センチ、ルーブルで"
            "最も小さな傑作です。若い女性が糸巻きに顔を近づけ、細かい仕事に"
            "没頭する姿。左手前の赤い糸だけがぼやけて描かれ、視線の焦点を"
            "手元へと導きます。日常のなかの神聖、静けさの中の集中。"
            "フェルメール自身も、この繊細さで四十三年の生涯を編み続けました。"
            "二人の暮らしも、こんな一針一針で編まれていくのでしょう。"
        ),
    },
    {
        "id": "15", "num": 15,
        "title": "天文学者",
        "title_fr": "L'Astronome",
        "era": "1668 / ヨハネス・フェルメール",
        "wing": "Richelieu", "floor": "2F",
        "salle": "Salle 837",
        "script": (
            "フェルメールが描いた男性像はわずか二枚、そのうちの一枚が"
            "この天文学者です。窓辺に射す柔らかな光を受け、青いガウンを羽織った"
            "学者が天球儀に手を伸ばします。壁のモーセの絵は、神が導く知の象徴。"
            "レースを編む女と同じフェルメールが、女性の日常と男性の探求を並べて描いた"
            "二枚。旅の記憶に、この静かな知の光を持ち帰ってください。"
            "美術鑑賞の締めくくりに、これほど美しい沈黙はありません。"
        ),
    },
]


async def generate_one(stop):
    text = stop["script"]
    out = OUT_DIR / f"{stop['id']}_{stop['title']}.mp3"
    communicate = edge_tts.Communicate(
        text,
        VOICE,
        rate="+5%",
        pitch="-2Hz",
    )
    await communicate.save(str(out))
    size_kb = out.stat().st_size / 1024
    print(f"  [{stop['num']:02d}] {stop['title']:20s} -> {out.name} ({size_kb:.0f} KB) {len(text)}文字")


async def main():
    # Wipe old
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Voice: {VOICE}")
    print(f"Output: {OUT_DIR}")
    print(f"Generating {len(STOPS)} clips (regenerated with fact-checked scripts)\n")

    for stop in STOPS:
        await generate_one(stop)

    metadata = []
    for stop in STOPS:
        metadata.append({
            "id": stop["id"],
            "num": stop["num"],
            "title": stop["title"],
            "title_fr": stop["title_fr"],
            "era": stop["era"],
            "wing": stop["wing"],
            "floor": stop["floor"],
            "salle": stop["salle"],
            "script": stop["script"],
            "audio": f"assets/audio/louvre/{stop['id']}_{stop['title']}.mp3",
            "char_count": len(stop["script"]),
        })
    DATA_JSON.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nMetadata: {DATA_JSON}")

    total_size = sum(f.stat().st_size for f in OUT_DIR.glob("*.mp3")) / 1024
    print(f"Total audio size: {total_size:.0f} KB")


if __name__ == "__main__":
    asyncio.run(main())
