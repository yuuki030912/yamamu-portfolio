/**
 * ぽこ あ ポケモン 建築シミュレーター アイテムデータ
 * カテゴリ: kit(建築キット), facility(施設), outdoor(自然・屋外), furniture(家具), parts(建築パーツ)
 * mode: "town"(街モード専用), "room"(室内モード専用), "both"(両方)
 */
var BUILDING_SIM_ITEMS = [

  // ===== カテゴリ1: 建築キット（街モード用） =====

  // はっぱ系
  { id: 'leaf-den', name: 'はっぱのおへや', category: 'kit', subcategory: 'はっぱ系', w: 3, h: 3, color: '#4caf50', icon: '🍃', mode: 'town', capacity: 1, texture: 'leaf-den.png' },
  { id: 'leaf-hut', name: 'はっぱのこや', category: 'kit', subcategory: 'はっぱ系', w: 4, h: 4, color: '#388e3c', icon: '🏠', mode: 'town', capacity: 1, texture: 'leaf-hut.png' },
  { id: 'leaf-cottage', name: 'はっぱのコテージ', category: 'kit', subcategory: 'はっぱ系', w: 5, h: 4, color: '#2e7d32', icon: '🏡', mode: 'town', capacity: 2, texture: 'leaf-cottage.png' },
  { id: 'leaf-house', name: 'はっぱのいえ', category: 'kit', subcategory: 'はっぱ系', w: 5, h: 5, color: '#1b5e20', icon: '🏘️', mode: 'town', capacity: 4, texture: 'leaf-house.png' },

  // いし系
  { id: 'stone-den', name: 'いしのおへや', category: 'kit', subcategory: 'いし系', w: 3, h: 3, color: '#78909c', icon: '🪨', mode: 'town', capacity: 1, texture: 'stone-den.png' },
  { id: 'stone-hut', name: 'いしのこや', category: 'kit', subcategory: 'いし系', w: 4, h: 4, color: '#607d8b', icon: '🏠', mode: 'town', capacity: 1, texture: 'stone-hut.png' },
  { id: 'stone-cottage', name: 'いしのコテージ', category: 'kit', subcategory: 'いし系', w: 5, h: 4, color: '#546e7a', icon: '🏡', mode: 'town', capacity: 2, texture: 'stone-cottage.png' },
  { id: 'stone-house', name: 'いしのいえ', category: 'kit', subcategory: 'いし系', w: 5, h: 5, color: '#455a64', icon: '🏘️', mode: 'town', capacity: 4, texture: 'stone-house.png' },

  // すな系
  { id: 'sand-den', name: 'すなのおへや', category: 'kit', subcategory: 'すな系', w: 3, h: 3, color: '#d4a574', icon: '🏜️', mode: 'town', capacity: 1, texture: 'sand-den.png' },
  { id: 'sand-hut', name: 'すなのこや', category: 'kit', subcategory: 'すな系', w: 4, h: 4, color: '#c49666', icon: '🏠', mode: 'town', capacity: 1, texture: 'sand-hut.png' },
  { id: 'sand-cottage', name: 'すなのコテージ', category: 'kit', subcategory: 'すな系', w: 5, h: 4, color: '#b48858', icon: '🏡', mode: 'town', capacity: 2, texture: 'sand-cottage.png' },
  { id: 'sand-house', name: 'すなのいえ', category: 'kit', subcategory: 'すな系', w: 5, h: 5, color: '#a47a4a', icon: '🏘️', mode: 'town', capacity: 4, texture: 'sand-house.png' },

  // とかい系
  { id: 'city-den', name: 'とかいのおへや', category: 'kit', subcategory: 'とかい系', w: 3, h: 3, color: '#5c6bc0', icon: '🏢', mode: 'town', capacity: 1, texture: 'city-den.png' },
  { id: 'city-hut', name: 'とかいのこや', category: 'kit', subcategory: 'とかい系', w: 4, h: 4, color: '#3f51b5', icon: '🏠', mode: 'town', capacity: 1, texture: 'city-hut.png' },
  { id: 'city-cottage', name: 'とかいのコテージ', category: 'kit', subcategory: 'とかい系', w: 5, h: 4, color: '#3949ab', icon: '🏡', mode: 'town', capacity: 2, texture: 'city-cottage.png' },
  { id: 'city-house', name: 'とかいのいえ', category: 'kit', subcategory: 'とかい系', w: 5, h: 5, color: '#303f9f', icon: '🏘️', mode: 'town', capacity: 4, texture: 'city-house.png' },

  // カラー系 - ピンク
  { id: 'pink-hut', name: 'ピンクのこや', category: 'kit', subcategory: 'カラー系', w: 4, h: 4, color: '#e91e63', icon: '🩷', mode: 'town', capacity: 1, texture: 'pink-hut.png' },
  { id: 'pink-cottage', name: 'ピンクのコテージ', category: 'kit', subcategory: 'カラー系', w: 5, h: 4, color: '#c2185b', icon: '🏡', mode: 'town', capacity: 2, texture: 'pink-cottage.png' },

  // カラー系 - オレンジ
  { id: 'orange-hut', name: 'オレンジのこや', category: 'kit', subcategory: 'カラー系', w: 4, h: 4, color: '#ff9800', icon: '🧡', mode: 'town', capacity: 1, texture: 'orange-hut.png' },
  { id: 'orange-cottage', name: 'オレンジのコテージ', category: 'kit', subcategory: 'カラー系', w: 5, h: 4, color: '#f57c00', icon: '🏡', mode: 'town', capacity: 2, texture: 'orange-cottage.png' },

  // カラー系 - グレー
  { id: 'gray-hut', name: 'グレーのこや', category: 'kit', subcategory: 'カラー系', w: 4, h: 4, color: '#9e9e9e', icon: '🩶', mode: 'town', capacity: 1, texture: 'gray-hut.png' },
  { id: 'gray-cottage', name: 'グレーのコテージ', category: 'kit', subcategory: 'カラー系', w: 5, h: 4, color: '#757575', icon: '🏡', mode: 'town', capacity: 2, texture: 'gray-cottage.png' },

  // カラー系 - イエロー
  { id: 'yellow-hut', name: 'イエローのこや', category: 'kit', subcategory: 'カラー系', w: 4, h: 4, color: '#fdd835', icon: '💛', mode: 'town', capacity: 1, texture: 'yellow-hut.png' },
  { id: 'yellow-cottage', name: 'イエローのコテージ', category: 'kit', subcategory: 'カラー系', w: 5, h: 4, color: '#f9a825', icon: '🏡', mode: 'town', capacity: 2, texture: 'yellow-cottage.png' },

  // 特殊な家
  { id: 'log-cabin', name: 'ログハウス', category: 'kit', subcategory: '特殊', w: 5, h: 5, color: '#795548', icon: '🪵', mode: 'town', capacity: 2, texture: 'log-cabin.png' },
  { id: 'pokeball-house', name: 'モンスターボールハウス', category: 'kit', subcategory: '特殊', w: 5, h: 5, color: '#f44336', icon: '🔴', mode: 'town', capacity: 2, texture: 'pokeball-house.png' },

  // ===== カテゴリ2: 施設（街モード用） =====

  // ポケモンセンター
  { id: 'pokecenter', name: 'ポケモンセンター', category: 'facility', subcategory: '公共施設', w: 6, h: 5, color: '#ef5350', icon: '🏥', mode: 'town', texture: 'pokecenter.png' },
  { id: 'pokemart', name: 'ポケマート', category: 'facility', subcategory: '公共施設', w: 4, h: 4, color: '#42a5f5', icon: '🏪', mode: 'town', texture: 'pokemart.png' },

  // 商業施設
  { id: 'small-office', name: 'スモールオフィス', category: 'facility', subcategory: '商業施設', w: 4, h: 3, color: '#78909c', icon: '🏢', mode: 'town', texture: 'small-office.png' },
  { id: 'stylish-cafe', name: 'スタイリッシュカフェ', category: 'facility', subcategory: '商業施設', w: 4, h: 4, color: '#8d6e63', icon: '☕', mode: 'town', texture: 'stylish-cafe.png' },

  // 発電施設
  { id: 'windmill', name: '風車', category: 'facility', subcategory: '発電施設', w: 3, h: 3, color: '#90a4ae', icon: '🌀', mode: 'town', texture: 'windmill.png' },
  { id: 'waterwheel', name: '水車', category: 'facility', subcategory: '発電施設', w: 3, h: 3, color: '#4fc3f7', icon: '💧', mode: 'town', texture: 'waterwheel.png' },
  { id: 'furnace-facility', name: '溶鉱炉（施設）', category: 'facility', subcategory: '発電施設', w: 2, h: 2, color: '#ff7043', icon: '🔥', mode: 'town', texture: 'furnace-facility.png' },
  { id: 'charging-station', name: 'じゅうでんき', category: 'facility', subcategory: '発電施設', w: 2, h: 2, color: '#ffeb3b', icon: '⚡', mode: 'town', texture: 'charging-station.png' },

  // 装飾施設
  { id: 'pikachu-fountain', name: 'ピカチュウ噴水', category: 'facility', subcategory: '装飾施設', w: 3, h: 3, color: '#ffc107', icon: '⛲', mode: 'town', texture: 'pikachu-fountain.png' },
  { id: 'relaxing-park', name: 'いやしの公園', category: 'facility', subcategory: '装飾施設', w: 5, h: 5, color: '#66bb6a', icon: '🌳', mode: 'town', texture: 'relaxing-park.png' },
  { id: 'concert-stage', name: 'コンサートステージ', category: 'facility', subcategory: '装飾施設', w: 6, h: 4, color: '#ab47bc', icon: '🎵', mode: 'town', texture: 'concert-stage.png' },
  { id: 'fountain-plaza', name: '噴水広場', category: 'facility', subcategory: '装飾施設', w: 4, h: 4, color: '#29b6f6', icon: '⛲', mode: 'town', texture: 'fountain-plaza.png' },
  { id: 'moonlight-statue', name: '月光の踊り像', category: 'facility', subcategory: '装飾施設', w: 2, h: 2, color: '#7e57c2', icon: '🌙', mode: 'town', texture: 'moonlight-statue.png' },

  // 伝説関連施設
  { id: 'flame-altar', name: 'ほのおの祭壇', category: 'facility', subcategory: '伝説施設', w: 4, h: 4, color: '#ff5722', icon: '🔥', mode: 'town', texture: 'flame-altar.png' },
  { id: 'abandoned-plant', name: 'はいきょの発電所', category: 'facility', subcategory: '伝説施設', w: 5, h: 5, color: '#ffd600', icon: '⚡', mode: 'town', texture: 'abandoned-plant.png' },
  { id: 'freezing-chambers', name: 'こおりつくやま', category: 'facility', subcategory: '伝説施設', w: 5, h: 5, color: '#4dd0e1', icon: '❄️', mode: 'town', texture: 'freezing-chambers.png' },
  { id: 'mysterious-mural', name: 'なぞのへきが', category: 'facility', subcategory: '伝説施設', w: 3, h: 3, color: '#a1887f', icon: '🗿', mode: 'town', texture: 'mysterious-mural.png' },

  // ===== カテゴリ3: 自然・屋外装飾（街モード用） =====

  { id: 'tree', name: '木', category: 'outdoor', subcategory: '自然', w: 1, h: 1, color: '#43a047', icon: '🌳', mode: 'town', texture: 'tree.png' },
  { id: 'big-tree', name: '大きな木', category: 'outdoor', subcategory: '自然', w: 2, h: 2, color: '#2e7d32', icon: '🌲', mode: 'town', texture: 'big-tree.png' },
  { id: 'flower', name: '花', category: 'outdoor', subcategory: '自然', w: 1, h: 1, color: '#ec407a', icon: '🌸', mode: 'town', texture: 'flower.png' },
  { id: 'flowerbed', name: '花壇', category: 'outdoor', subcategory: '自然', w: 1, h: 2, color: '#f06292', icon: '🌺', mode: 'town', texture: 'flowerbed.png' },
  { id: 'pond', name: '池', category: 'outdoor', subcategory: '自然', w: 2, h: 2, color: '#29b6f6', icon: '💧', mode: 'town', texture: 'pond.png' },
  { id: 'big-pond', name: '大きな池', category: 'outdoor', subcategory: '自然', w: 3, h: 3, color: '#0288d1', icon: '🌊', mode: 'town', texture: 'big-pond.png' },
  { id: 'rock', name: '岩', category: 'outdoor', subcategory: '自然', w: 1, h: 1, color: '#8d6e63', icon: '🪨', mode: 'town', texture: 'rock.png' },

  // 屋外装飾
  { id: 'outdoor-light', name: 'ライト', category: 'outdoor', subcategory: '装飾', w: 1, h: 1, color: '#fdd835', icon: '💡', mode: 'town', texture: 'outdoor-light.png' },
  { id: 'outdoor-bench', name: 'ベンチ', category: 'outdoor', subcategory: '装飾', w: 1, h: 2, color: '#8d6e63', icon: '🪑', mode: 'town', texture: 'outdoor-bench.png' },
  { id: 'outdoor-fence', name: 'フェンス', category: 'outdoor', subcategory: '装飾', w: 1, h: 1, color: '#a1887f', icon: '🧱', mode: 'town', texture: 'outdoor-fence.png' },
  { id: 'road', name: '道', category: 'outdoor', subcategory: '通路', w: 1, h: 1, color: '#bdbdbd', icon: '🛤️', mode: 'town', texture: 'road.png' },
  { id: 'stepping-stone', name: '飛び石', category: 'outdoor', subcategory: '通路', w: 1, h: 1, color: '#a1887f', icon: '⬜', mode: 'town', texture: 'stepping-stone.png' },
  { id: 'bridge', name: '橋', category: 'outdoor', subcategory: '通路', w: 2, h: 1, color: '#795548', icon: '🌉', mode: 'town', texture: 'bridge.png' },
  { id: 'wooden-path', name: '木の通路', category: 'outdoor', subcategory: '通路', w: 1, h: 1, color: '#a1887f', icon: '🟫', mode: 'town', texture: 'wooden-path.png' },

  // ===== カテゴリ4: 家具（室内モード用） =====

  // 収納
  { id: 'storage-box', name: '収納箱', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#8d6e63', icon: '📦', mode: 'room', texture: 'storage-box.png' },
  { id: 'big-storage-box', name: '大きな収納箱', category: 'furniture', subcategory: '収納', w: 2, h: 1, color: '#795548', icon: '📦', mode: 'room', texture: 'big-storage-box.png' },
  { id: 'plain-chest', name: 'シンプルチェスト', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#a1887f', icon: '🗄️', mode: 'room', texture: 'plain-chest.png' },
  { id: 'pokeball-chest', name: 'モンスターボールチェスト', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#ef5350', icon: '🔴', mode: 'room', texture: 'pokeball-chest.png' },
  { id: 'antique-chest', name: 'アンティークチェスト', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#6d4c41', icon: '🗄️', mode: 'room', texture: 'antique-chest.png' },
  { id: 'plain-closet', name: 'シンプルクローゼット', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#bcaaa4', icon: '🚪', mode: 'room', texture: 'plain-closet.png' },
  { id: 'antique-closet', name: 'アンティーククローゼット', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#5d4037', icon: '🚪', mode: 'room', texture: 'antique-closet.png' },
  { id: 'office-shelf', name: 'オフィスシェルフ', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#78909c', icon: '📚', mode: 'room', texture: 'office-shelf.png' },
  { id: 'office-cabinet', name: 'オフィスキャビネット', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#607d8b', icon: '🗄️', mode: 'room', texture: 'office-cabinet.png' },
  { id: 'office-locker', name: 'オフィスロッカー', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#546e7a', icon: '🔒', mode: 'room', texture: 'office-locker.png' },
  { id: 'gaming-fridge', name: 'ゲーミング冷蔵庫', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#00bcd4', icon: '🧊', mode: 'room', texture: 'gaming-fridge.png' },
  { id: 'berry-case', name: 'きのみケース', category: 'furniture', subcategory: '収納', w: 1, h: 1, color: '#e91e63', icon: '🫐', mode: 'room', texture: 'berry-case.png' },

  // テーブル
  { id: 'straw-table', name: 'わらのテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#d4a574', icon: '🪵', mode: 'room', texture: 'straw-table.png' },
  { id: 'log-table', name: '丸太テーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#8d6e63', icon: '🪵', mode: 'room', texture: 'log-table.png' },
  { id: 'side-table', name: 'サイドテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#a1887f', icon: '🪑', mode: 'room', texture: 'side-table.png' },
  { id: 'garden-table', name: 'ガーデンテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#66bb6a', icon: '🌿', mode: 'room', texture: 'garden-table.png' },
  { id: 'wooden-table', name: '木のテーブル', category: 'furniture', subcategory: 'テーブル', w: 2, h: 1, color: '#795548', icon: '🪵', mode: 'room', texture: 'wooden-table.png' },
  { id: 'counter', name: 'カウンター', category: 'furniture', subcategory: 'テーブル', w: 2, h: 1, color: '#6d4c41', icon: '🍽️', mode: 'room', texture: 'counter.png' },
  { id: 'kitchen-table', name: 'キッチンテーブル', category: 'furniture', subcategory: 'テーブル', w: 2, h: 1, color: '#bcaaa4', icon: '🍳', mode: 'room', texture: 'kitchen-table.png' },
  { id: 'plain-table', name: 'シンプルテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#d7ccc8', icon: '📐', mode: 'room', texture: 'plain-table.png' },
  { id: 'iron-table', name: '鉄のテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#78909c', icon: '🔩', mode: 'room', texture: 'iron-table.png' },
  { id: 'resort-table', name: 'リゾートテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#4fc3f7', icon: '🏖️', mode: 'room', texture: 'resort-table.png' },
  { id: 'antique-table', name: 'アンティークテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#5d4037', icon: '🏛️', mode: 'room', texture: 'antique-table.png' },
  { id: 'office-desk', name: 'オフィスデスク', category: 'furniture', subcategory: 'テーブル', w: 2, h: 1, color: '#78909c', icon: '💼', mode: 'room', texture: 'office-desk.png' },
  { id: 'study-desk', name: '勉強デスク', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#a1887f', icon: '📖', mode: 'room', texture: 'study-desk.png' },
  { id: 'cute-table', name: 'キュートテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#f48fb1', icon: '🩷', mode: 'room', texture: 'cute-table.png' },
  { id: 'chic-table', name: 'シックテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#455a64', icon: '✨', mode: 'room', texture: 'chic-table.png' },
  { id: 'luxury-table', name: 'ラグジュアリーテーブル', category: 'furniture', subcategory: 'テーブル', w: 2, h: 1, color: '#ffd54f', icon: '👑', mode: 'room', texture: 'luxury-table.png' },
  { id: 'pokeball-table', name: 'モンスターボールテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#ef5350', icon: '🔴', mode: 'room', texture: 'pokeball-table.png' },
  { id: 'berry-table', name: 'きのみテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#e91e63', icon: '🫐', mode: 'room', texture: 'berry-table.png' },
  { id: 'stone-table', name: '石のテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#9e9e9e', icon: '🪨', mode: 'room', texture: 'stone-table.png' },
  { id: 'pop-art-table', name: 'ポップアートテーブル', category: 'furniture', subcategory: 'テーブル', w: 1, h: 1, color: '#ff7043', icon: '🎨', mode: 'room', texture: 'pop-art-table.png' },
  { id: 'office-table', name: 'オフィステーブル', category: 'furniture', subcategory: 'テーブル', w: 2, h: 1, color: '#90a4ae', icon: '🖥️', mode: 'room', texture: 'office-table.png' },

  // 椅子・ソファ
  { id: 'straw-stool', name: 'わらスツール', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#d4a574', icon: '🪑', mode: 'room', texture: 'straw-stool.png' },
  { id: 'berry-chair', name: 'きのみチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#e91e63', icon: '🪑', mode: 'room', texture: 'berry-chair.png' },
  { id: 'simple-cushion', name: 'シンプルクッション', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#ffcc80', icon: '🛋️', mode: 'room', texture: 'simple-cushion.png' },
  { id: 'log-chair', name: '丸太チェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#8d6e63', icon: '🪑', mode: 'room', texture: 'log-chair.png' },
  { id: 'plain-stool', name: 'シンプルスツール', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#d7ccc8', icon: '🪑', mode: 'room', texture: 'plain-stool.png' },
  { id: 'wooden-stool', name: '木のスツール', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#a1887f', icon: '🪑', mode: 'room', texture: 'wooden-stool.png' },
  { id: 'iron-chair', name: '鉄のイス', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#78909c', icon: '🪑', mode: 'room', texture: 'iron-chair.png' },
  { id: 'resort-stool', name: 'リゾートスツール', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#4fc3f7', icon: '🏖️', mode: 'room', texture: 'resort-stool.png' },
  { id: 'resort-chair', name: 'リゾートチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#29b6f6', icon: '🪑', mode: 'room', texture: 'resort-chair.png' },
  { id: 'stylish-stool', name: 'スタイリッシュスツール', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#455a64', icon: '🪑', mode: 'room', texture: 'stylish-stool.png' },
  { id: 'plain-chair', name: 'シンプルチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#bcaaa4', icon: '🪑', mode: 'room', texture: 'plain-chair.png' },
  { id: 'chic-chair', name: 'シックチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#37474f', icon: '🪑', mode: 'room', texture: 'chic-chair.png' },
  { id: 'antique-chair', name: 'アンティークチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#5d4037', icon: '🪑', mode: 'room', texture: 'antique-chair.png' },
  { id: 'fancy-chair', name: 'ファンシーチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#ce93d8', icon: '🪑', mode: 'room', texture: 'fancy-chair.png' },
  { id: 'luxury-chair', name: 'ラグジュアリーチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#ffd54f', icon: '👑', mode: 'room', texture: 'luxury-chair.png' },
  { id: 'garden-chair', name: 'ガーデンチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#81c784', icon: '🌿', mode: 'room', texture: 'garden-chair.png' },
  { id: 'folding-chair', name: '折りたたみチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#90a4ae', icon: '🪑', mode: 'room', texture: 'folding-chair.png' },
  { id: 'office-chair', name: 'オフィスチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#546e7a', icon: '🪑', mode: 'room', texture: 'office-chair.png' },
  { id: 'cute-chair', name: 'キュートチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#f48fb1', icon: '🩷', mode: 'room', texture: 'cute-chair.png' },
  { id: 'pop-art-chair', name: 'ポップアートチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#ff7043', icon: '🎨', mode: 'room', texture: 'pop-art-chair.png' },
  { id: 'gaming-chair', name: 'ゲーミングチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#00bcd4', icon: '🎮', mode: 'room', texture: 'gaming-chair.png' },
  { id: 'spectator-chair', name: 'かんきゃくチェア', category: 'furniture', subcategory: '椅子', w: 1, h: 1, color: '#ef5350', icon: '🪑', mode: 'room', texture: 'spectator-chair.png' },

  // ソファ・ベンチ
  { id: 'box-sofa', name: 'ボックスソファ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#a1887f', icon: '🛋️', mode: 'room', texture: 'box-sofa.png' },
  { id: 'plain-sofa', name: 'シンプルソファ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#bcaaa4', icon: '🛋️', mode: 'room', texture: 'plain-sofa.png' },
  { id: 'resort-sofa', name: 'リゾートソファ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#4fc3f7', icon: '🛋️', mode: 'room', texture: 'resort-sofa.png' },
  { id: 'chic-sofa', name: 'シックソファ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#455a64', icon: '🛋️', mode: 'room', texture: 'chic-sofa.png' },
  { id: 'antique-sofa', name: 'アンティークソファ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#5d4037', icon: '🛋️', mode: 'room', texture: 'antique-sofa.png' },
  { id: 'luxury-sofa', name: 'ラグジュアリーソファ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#ffd54f', icon: '🛋️', mode: 'room', texture: 'luxury-sofa.png' },
  { id: 'cute-sofa', name: 'キュートソファ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#f48fb1', icon: '🛋️', mode: 'room', texture: 'cute-sofa.png' },
  { id: 'pop-art-sofa', name: 'ポップアートソファ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#ff7043', icon: '🛋️', mode: 'room', texture: 'pop-art-sofa.png' },
  { id: 'wooden-bench-room', name: '木のベンチ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#8d6e63', icon: '🪵', mode: 'room', texture: 'wooden-bench-room.png' },
  { id: 'stone-bench', name: '石のベンチ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#9e9e9e', icon: '🪨', mode: 'room', texture: 'stone-bench.png' },
  { id: 'iron-bench', name: '鉄のベンチ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#78909c', icon: '🔩', mode: 'room', texture: 'iron-bench.png' },
  { id: 'garden-bench', name: 'ガーデンベンチ', category: 'furniture', subcategory: 'ソファ', w: 2, h: 1, color: '#66bb6a', icon: '🌿', mode: 'room', texture: 'garden-bench.png' },

  // ベッド
  { id: 'log-bed', name: '丸太ベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#8d6e63', icon: '🛏️', mode: 'room', texture: 'log-bed.png' },
  { id: 'straw-bed', name: 'わらベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#d4a574', icon: '🛏️', mode: 'room', texture: 'straw-bed.png' },
  { id: 'mini-plain-bed', name: 'ミニシンプルベッド', category: 'furniture', subcategory: 'ベッド', w: 1, h: 1, color: '#d7ccc8', icon: '🛏️', mode: 'room', texture: 'mini-plain-bed.png' },
  { id: 'wooden-bed', name: '木のベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#795548', icon: '🛏️', mode: 'room', texture: 'wooden-bed.png' },
  { id: 'plain-bed', name: 'シンプルベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#bcaaa4', icon: '🛏️', mode: 'room', texture: 'plain-bed.png' },
  { id: 'iron-bed', name: '鉄のベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#78909c', icon: '🛏️', mode: 'room', texture: 'iron-bed.png' },
  { id: 'resort-bed', name: 'リゾートベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#4fc3f7', icon: '🛏️', mode: 'room', texture: 'resort-bed.png' },
  { id: 'resort-hammock', name: 'リゾートハンモック', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#29b6f6', icon: '🪢', mode: 'room', texture: 'resort-hammock.png' },
  { id: 'antique-bed', name: 'アンティークベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#5d4037', icon: '🛏️', mode: 'room', texture: 'antique-bed.png' },
  { id: 'guest-bed', name: 'きゃくしつベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#d7ccc8', icon: '🛏️', mode: 'room', texture: 'guest-bed.png' },
  { id: 'luxury-bed', name: 'ラグジュアリーベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#ffd54f', icon: '🛏️', mode: 'room', texture: 'luxury-bed.png' },
  { id: 'industrial-bed', name: 'インダストリアルベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#616161', icon: '🛏️', mode: 'room', texture: 'industrial-bed.png' },
  { id: 'cute-bed', name: 'キュートベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#f48fb1', icon: '🛏️', mode: 'room', texture: 'cute-bed.png' },
  { id: 'gaming-bed', name: 'ゲーミングベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#00bcd4', icon: '🎮', mode: 'room', texture: 'gaming-bed.png' },
  { id: 'pop-art-bed', name: 'ポップアートベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#ff7043', icon: '🎨', mode: 'room', texture: 'pop-art-bed.png' },
  { id: 'pokeball-bed', name: 'モンスターボールベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#ef5350', icon: '🔴', mode: 'room', texture: 'pokeball-bed.png' },
  { id: 'berry-bed', name: 'きのみベッド', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#e91e63', icon: '🫐', mode: 'room', texture: 'berry-bed.png' },
  { id: 'naptime-bed', name: 'おひるねベッド', category: 'furniture', subcategory: 'ベッド', w: 1, h: 1, color: '#ffe082', icon: '😴', mode: 'room', texture: 'naptime-bed.png' },
  { id: 'pokeball-sofa', name: 'モンスターボールソファ', category: 'furniture', subcategory: 'ベッド', w: 2, h: 1, color: '#ef5350', icon: '🛋️', mode: 'room', texture: 'pokeball-sofa.png' },
  { id: 'deck-chair', name: 'デッキチェア', category: 'furniture', subcategory: 'ベッド', w: 1, h: 1, color: '#a1887f', icon: '🏖️', mode: 'room', texture: 'deck-chair.png' },
  { id: 'beach-chair', name: 'ビーチチェア', category: 'furniture', subcategory: 'ベッド', w: 1, h: 1, color: '#29b6f6', icon: '⛱️', mode: 'room', texture: 'beach-chair.png' },

  // 装飾
  { id: 'wall-mirror', name: '壁掛けミラー', category: 'furniture', subcategory: '装飾', w: 1, h: 1, color: '#b0bec5', icon: '🪞', mode: 'room', texture: 'wall-mirror.png' },
  { id: 'large-mirror', name: '大きなミラー', category: 'furniture', subcategory: '装飾', w: 1, h: 1, color: '#90a4ae', icon: '🪞', mode: 'room', texture: 'large-mirror.png' },
  { id: 'antique-dresser', name: 'アンティークドレッサー', category: 'furniture', subcategory: '装飾', w: 1, h: 1, color: '#5d4037', icon: '💄', mode: 'room', texture: 'antique-dresser.png' },
  { id: 'luxury-dresser', name: 'ラグジュアリードレッサー', category: 'furniture', subcategory: '装飾', w: 1, h: 1, color: '#ffd54f', icon: '💄', mode: 'room', texture: 'luxury-dresser.png' },
  { id: 'cute-dresser', name: 'キュートドレッサー', category: 'furniture', subcategory: '装飾', w: 1, h: 1, color: '#f48fb1', icon: '💄', mode: 'room', texture: 'cute-dresser.png' },
  { id: 'flower-table', name: '花台', category: 'furniture', subcategory: '装飾', w: 1, h: 1, color: '#81c784', icon: '🌸', mode: 'room', texture: 'flower-table.png' },
  { id: 'flower-cushion', name: 'フラワークッション', category: 'furniture', subcategory: '装飾', w: 1, h: 1, color: '#f48fb1', icon: '🌺', mode: 'room', texture: 'flower-cushion.png' },
  { id: 'wiggly-mirror', name: 'プリンのミラー', category: 'furniture', subcategory: '装飾', w: 1, h: 1, color: '#f8bbd0', icon: '🩷', mode: 'room', texture: 'wiggly-mirror.png' },

  // 生活用品
  { id: 'craft-table', name: 'クラフト台', category: 'furniture', subcategory: '生活', w: 1, h: 1, color: '#a1887f', icon: '🔨', mode: 'room', texture: 'craft-table.png' },
  { id: 'furnace', name: '溶鉱炉', category: 'furniture', subcategory: '生活', w: 1, h: 1, color: '#ff7043', icon: '🔥', mode: 'room', texture: 'furnace.png' },
  { id: 'printer-3d', name: '3Dプリンター', category: 'furniture', subcategory: '生活', w: 1, h: 1, color: '#4fc3f7', icon: '🖨️', mode: 'room', texture: 'printer-3d.png' },
  { id: 'food-counter', name: 'フードカウンター', category: 'furniture', subcategory: '生活', w: 2, h: 1, color: '#ffcc80', icon: '🍽️', mode: 'room', texture: 'food-counter.png' },
  { id: 'exhibition-stand', name: '展示スタンド', category: 'furniture', subcategory: '生活', w: 1, h: 1, color: '#b0bec5', icon: '🏛️', mode: 'room', texture: 'exhibition-stand.png' },
  { id: 'push-cart', name: 'プッシュカート', category: 'furniture', subcategory: '生活', w: 1, h: 1, color: '#8d6e63', icon: '🛒', mode: 'room', texture: 'push-cart.png' },

  // ===== カテゴリ5: 建築パーツ（両モード用） =====

  // ドア
  { id: 'rustic-door', name: '素朴なドア', category: 'parts', subcategory: 'ドア', w: 1, h: 1, color: '#8d6e63', icon: '🚪', mode: 'both', texture: 'rustic-door.png' },
  { id: 'modern-door', name: 'モダンなドア', category: 'parts', subcategory: 'ドア', w: 1, h: 1, color: '#78909c', icon: '🚪', mode: 'both', texture: 'modern-door.png' },
  { id: 'iron-door', name: '鉄のドア', category: 'parts', subcategory: 'ドア', w: 1, h: 1, color: '#546e7a', icon: '🚪', mode: 'both', texture: 'iron-door.png' },
  { id: 'auto-doors', name: '自動ドア', category: 'parts', subcategory: 'ドア', w: 1, h: 1, color: '#42a5f5', icon: '🚪', mode: 'both', texture: 'auto-doors.png' },
  { id: 'large-wooden-door', name: '大きな木のドア', category: 'parts', subcategory: 'ドア', w: 1, h: 1, color: '#795548', icon: '🚪', mode: 'both', texture: 'large-wooden-door.png' },
  { id: 'wooden-gate', name: '木の門', category: 'parts', subcategory: 'ドア', w: 2, h: 1, color: '#6d4c41', icon: '⛩️', mode: 'both', texture: 'wooden-gate.png' },
  { id: 'iron-gate', name: '鉄の門', category: 'parts', subcategory: 'ドア', w: 2, h: 1, color: '#455a64', icon: '⛩️', mode: 'both', texture: 'iron-gate.png' },

  // 窓
  { id: 'glass-window', name: 'ガラス窓', category: 'parts', subcategory: '窓', w: 1, h: 1, color: '#80deea', icon: '🪟', mode: 'both', texture: 'glass-window.png' },
  { id: 'stained-glass', name: 'ステンドグラス窓', category: 'parts', subcategory: '窓', w: 1, h: 1, color: '#ce93d8', icon: '🪟', mode: 'both', texture: 'stained-glass.png' },
  { id: 'sash-window', name: '格子窓', category: 'parts', subcategory: '窓', w: 1, h: 1, color: '#a1887f', icon: '🪟', mode: 'both', texture: 'sash-window.png' },
  { id: 'hatch-window', name: 'ハッチ窓', category: 'parts', subcategory: '窓', w: 1, h: 1, color: '#90a4ae', icon: '🪟', mode: 'both', texture: 'hatch-window.png' },

  // 階段
  { id: 'wooden-steps', name: '木の階段', category: 'parts', subcategory: '階段', w: 1, h: 1, color: '#8d6e63', icon: '🪜', mode: 'both', texture: 'wooden-steps.png' },
  { id: 'stone-steps', name: '石の階段', category: 'parts', subcategory: '階段', w: 1, h: 1, color: '#9e9e9e', icon: '🪜', mode: 'both', texture: 'stone-steps.png' },
  { id: 'iron-steps', name: '鉄の階段', category: 'parts', subcategory: '階段', w: 1, h: 1, color: '#607d8b', icon: '🪜', mode: 'both', texture: 'iron-steps.png' },
  { id: 'brick-steps', name: 'レンガの階段', category: 'parts', subcategory: '階段', w: 1, h: 1, color: '#d84315', icon: '🪜', mode: 'both', texture: 'brick-steps.png' },
  { id: 'concrete-steps', name: 'コンクリートの階段', category: 'parts', subcategory: '階段', w: 1, h: 1, color: '#bdbdbd', icon: '🪜', mode: 'both', texture: 'concrete-steps.png' },
  { id: 'wooden-ladder', name: '木のはしご', category: 'parts', subcategory: '階段', w: 1, h: 1, color: '#a1887f', icon: '🪜', mode: 'both', texture: 'wooden-ladder.png' },
  { id: 'iron-ladder', name: '鉄のはしご', category: 'parts', subcategory: '階段', w: 1, h: 1, color: '#78909c', icon: '🪜', mode: 'both', texture: 'iron-ladder.png' },

  // フェンス・柵（建築パーツ）
  { id: 'wooden-fencing', name: '木のフェンス', category: 'parts', subcategory: 'フェンス', w: 1, h: 1, color: '#a1887f', icon: '🧱', mode: 'both', texture: 'wooden-fencing.png' },
  { id: 'metal-fencing', name: '金属フェンス', category: 'parts', subcategory: 'フェンス', w: 1, h: 1, color: '#78909c', icon: '🧱', mode: 'both', texture: 'metal-fencing.png' },
  { id: 'stone-fencing', name: '石のフェンス', category: 'parts', subcategory: 'フェンス', w: 1, h: 1, color: '#9e9e9e', icon: '🧱', mode: 'both', texture: 'stone-fencing.png' },
  { id: 'wooden-handrail', name: '木の手すり', category: 'parts', subcategory: 'フェンス', w: 1, h: 1, color: '#8d6e63', icon: '🔲', mode: 'both', texture: 'wooden-handrail.png' },
  { id: 'boat-railing', name: 'ボートの手すり', category: 'parts', subcategory: 'フェンス', w: 1, h: 1, color: '#4fc3f7', icon: '⚓', mode: 'both', texture: 'boat-railing.png' },

  // 柱・構造
  { id: 'sideways-log', name: '横丸太', category: 'parts', subcategory: '構造', w: 1, h: 1, color: '#795548', icon: '🪵', mode: 'both', texture: 'sideways-log.png' },
  { id: 'upright-log', name: '縦丸太', category: 'parts', subcategory: '構造', w: 1, h: 1, color: '#6d4c41', icon: '🪵', mode: 'both', texture: 'upright-log.png' },
  { id: 'iron-beam', name: '鉄骨', category: 'parts', subcategory: '構造', w: 1, h: 1, color: '#607d8b', icon: '🔩', mode: 'both', texture: 'iron-beam.png' },
  { id: 'iron-column', name: '鉄柱', category: 'parts', subcategory: '構造', w: 1, h: 1, color: '#546e7a', icon: '🔩', mode: 'both', texture: 'iron-column.png' },
  { id: 'round-pillar', name: '丸柱', category: 'parts', subcategory: '構造', w: 1, h: 1, color: '#d7ccc8', icon: '🏛️', mode: 'both', texture: 'round-pillar.png' },
  { id: 'extravagant-pillar', name: '豪華な柱', category: 'parts', subcategory: '構造', w: 1, h: 1, color: '#ffd54f', icon: '🏛️', mode: 'both', texture: 'extravagant-pillar.png' },

  // パイプ
  { id: 'iron-pipe-h', name: '鉄パイプ（横）', category: 'parts', subcategory: 'パイプ', w: 1, h: 1, color: '#78909c', icon: '➖', mode: 'both', texture: 'iron-pipe-h.png' },
  { id: 'iron-pipe-v', name: '鉄パイプ（縦）', category: 'parts', subcategory: 'パイプ', w: 1, h: 1, color: '#78909c', icon: '➕', mode: 'both', texture: 'iron-pipe-v.png' },
  { id: 'iron-pipe-curve', name: '鉄パイプ（カーブ）', category: 'parts', subcategory: 'パイプ', w: 1, h: 1, color: '#78909c', icon: '↪️', mode: 'both', texture: 'iron-pipe-curve.png' },
  { id: 'iron-pipe-t', name: '鉄パイプ（T字）', category: 'parts', subcategory: 'パイプ', w: 1, h: 1, color: '#78909c', icon: '⊥', mode: 'both', texture: 'iron-pipe-t.png' }
];

// カテゴリ定義
var BUILDING_SIM_CATEGORIES = {
  town: [
    { key: 'kit', label: '建築キット', icon: '🏠' },
    { key: 'facility', label: '施設', icon: '🏢' },
    { key: 'outdoor', label: '自然・屋外', icon: '🌳' },
    { key: 'parts', label: '建築パーツ', icon: '🔧' }
  ],
  room: [
    { key: 'furniture', label: '家具', icon: '🪑' },
    { key: 'parts', label: '建築パーツ', icon: '🔧' }
  ],
  block: [
    { key: 'block-basic', label: 'ブロック', icon: '🧱' },
    { key: 'block-fixture', label: '建具', icon: '🚪' },
    { key: 'block-roof', label: '屋根', icon: '🏠' },
    { key: 'block-deco', label: '装飾', icon: '✨' },
    { key: 'block-floor', label: '床', icon: '⬜' }
  ]
};

// ===== 3Dブロック建築モード用データ =====
// 全174種 + 18色ペイントシステム対応
// shape: 'cube'(default), 'slope', 'triangle', 'outcorner', 'incorner'
// paintable: true でペイント対応

var BUILDING_SIM_BLOCKS = [

  // ===== 壁ブロック（27種） =====
  { id: 'wall-wood', name: '木のカベ', category: 'block-wall', colorTop: '#a1887f', colorLeft: '#8d6e63', colorRight: '#6d4c41', icon: '🪵', paintable: true, texture: 'wall-wood.png' },
  { id: 'wall-wood-light', name: '木のカベ・ライト', category: 'block-wall', colorTop: '#d7ccc8', colorLeft: '#bcaaa4', colorRight: '#a1887f', icon: '🪵', paintable: true, texture: 'wall-wood-light.png' },
  { id: 'wall-painted', name: 'ペンキぬりのカベ', category: 'block-wall', colorTop: '#e8e0d8', colorLeft: '#d5cdc5', colorRight: '#c2bab2', icon: '🖌️', paintable: true, texture: 'wall-painted.png' },
  { id: 'wall-plaster', name: 'しっくいのカベ', category: 'block-wall', colorTop: '#f5f0eb', colorLeft: '#e8e0d5', colorRight: '#d5cdc0', icon: '⬜', paintable: true, texture: 'wall-plaster.png' },
  { id: 'wall-cloth', name: 'ぬののカベ', category: 'block-wall', colorTop: '#c8b8a8', colorLeft: '#b5a595', colorRight: '#a29282', icon: '🧵', paintable: true, texture: 'wall-cloth.png' },
  { id: 'wall-guestroom', name: 'きゃくしつのカベ', category: 'block-wall', colorTop: '#1a237e', colorLeft: '#0d1642', colorRight: '#080e2a', icon: '🚢', paintable: true, texture: 'wall-guestroom.png' },
  { id: 'wall-starry', name: 'ほしぞらのカベ', category: 'block-wall', colorTop: '#1a1a3e', colorLeft: '#12122a', colorRight: '#0a0a1a', icon: '⭐', paintable: false, texture: 'wall-starry.png' },
  { id: 'wall-leather', name: 'レザーのカベ', category: 'block-wall', colorTop: '#5d4037', colorLeft: '#4e342e', colorRight: '#3e2723', icon: '🛋️', paintable: true, texture: 'wall-leather.png' },
  { id: 'wall-modern', name: 'モダンなカベ', category: 'block-wall', colorTop: '#90a4ae', colorLeft: '#78909c', colorRight: '#607d8b', icon: '🏢', paintable: true, texture: 'wall-modern.png' },
  { id: 'wall-broken-tile', name: 'いしづみのカベ', category: 'block-wall', colorTop: '#b0bec5', colorLeft: '#90a4ae', colorRight: '#78909c', icon: '💎', paintable: true, texture: 'wall-broken-tile.png' },
  { id: 'wall-cobblestone', name: 'つみいしのカベ', category: 'block-wall', colorTop: '#a1998e', colorLeft: '#8d857a', colorRight: '#7a7266', icon: '🪨', paintable: true, texture: 'wall-cobblestone.png' },
  { id: 'wall-brick', name: 'レンガのカベ', category: 'block-wall', colorTop: '#ef9a9a', colorLeft: '#e57373', colorRight: '#c62828', icon: '🧱', paintable: true, texture: 'wall-brick.png' },
  { id: 'wall-stonebrick', name: 'いしレンガのカベ', category: 'block-wall', colorTop: '#bdbdbd', colorLeft: '#9e9e9e', colorRight: '#757575', icon: '🧱', paintable: true, texture: 'wall-stonebrick.png' },
  { id: 'wall-aged-stone', name: 'ふるびたいしカベ', category: 'block-wall', colorTop: '#a8a090', colorLeft: '#8d8578', colorRight: '#706860', icon: '🏚️', paintable: true, texture: 'wall-aged-stone.png' },
  { id: 'wall-aged-stone-pat', name: 'ふるびたいしカベ・がら', category: 'block-wall', colorTop: '#a0988a', colorLeft: '#8a8274', colorRight: '#746c5e', icon: '🔺', paintable: true, texture: 'wall-aged-stone-pat.png' },
  { id: 'wall-concrete', name: 'うちっぱなしのカベ', category: 'block-wall', colorTop: '#e0e0e0', colorLeft: '#bdbdbd', colorRight: '#9e9e9e', icon: '⬜', paintable: true, texture: 'wall-concrete.png' },
  { id: 'wall-rough', name: 'ざらざらカベ', category: 'block-wall', colorTop: '#d5cfc5', colorLeft: '#c2bcb2', colorRight: '#afa99f', icon: '⬜', paintable: true, texture: 'wall-rough.png' },
  { id: 'wall-striped', name: 'たてラインのカベ', category: 'block-wall', colorTop: '#b87333', colorLeft: '#a0622d', colorRight: '#885127', icon: '📏', paintable: true, texture: 'wall-striped.png' },
  { id: 'wall-bronze', name: 'ブロンズのカベ', category: 'block-wall', colorTop: '#cd7f32', colorLeft: '#b06c2a', colorRight: '#935922', icon: '🟤', paintable: false, texture: 'wall-bronze.png' },
  { id: 'wall-bronze-stylish', name: 'おしゃれなブロンズのカベ', category: 'block-wall', colorTop: '#d4943a', colorLeft: '#b87f30', colorRight: '#9c6a26', icon: '✨', paintable: false, texture: 'wall-bronze-stylish.png' },
  { id: 'wall-iron', name: 'てつのカベ', category: 'block-wall', colorTop: '#78909c', colorLeft: '#607d8b', colorRight: '#546e7a', icon: '⬛', paintable: false, texture: 'wall-iron.png' },
  { id: 'wall-iron-stylish', name: 'おしゃれなてつのカベ', category: 'block-wall', colorTop: '#8a9aa6', colorLeft: '#728892', colorRight: '#5a767e', icon: '✨', paintable: false, texture: 'wall-iron-stylish.png' },
  { id: 'wall-gold', name: 'おうごんのカベ', category: 'block-wall', colorTop: '#ffd700', colorLeft: '#e6c200', colorRight: '#ccad00', icon: '🥇', paintable: false, texture: 'wall-gold.png' },
  { id: 'wall-gold-stylish', name: 'おしゃれなおうごんのカベ', category: 'block-wall', colorTop: '#ffe033', colorLeft: '#f0d020', colorRight: '#e0c010', icon: '💎', paintable: false, texture: 'wall-gold-stylish.png' },
  { id: 'wall-crystal', name: 'クリスタルのカベ', category: 'block-wall', colorTop: '#b3e5fc', colorLeft: '#81d4fa', colorRight: '#4fc3f7', icon: '💎', paintable: false, transparent: true, texture: 'wall-crystal.png' },
  { id: 'wall-pokeball', name: 'モンスターボールのカベ', category: 'block-wall', colorTop: '#f5f5f5', colorLeft: '#e0e0e0', colorRight: '#c8c8c8', icon: '⚪', paintable: false, texture: 'wall-pokeball.png' },
  { id: 'wall-warning', name: 'キケンちたいのカベ', category: 'block-wall', colorTop: '#fdd835', colorLeft: '#f9a825', colorRight: '#f57f17', icon: '⚠️', paintable: false, texture: 'wall-warning.png' },

  // ===== 装飾壁（27パーツ） =====
  { id: 'deco-stylish-top', name: 'おしゃれカベ・うえ', category: 'block-decowall', colorTop: '#a1887f', colorLeft: '#8d6e63', colorRight: '#795548', icon: '🔲', paintable: true, texture: 'deco-stylish-top.png' },
  { id: 'deco-stylish-mid', name: 'おしゃれカベ・なか', category: 'block-decowall', colorTop: '#bcaaa4', colorLeft: '#a1887f', colorRight: '#8d6e63', icon: '🔲', paintable: true, texture: 'deco-stylish-mid.png' },
  { id: 'deco-stylish-btm', name: 'おしゃれカベ・した', category: 'block-decowall', colorTop: '#a1887f', colorLeft: '#8d6e63', colorRight: '#795548', icon: '🔲', paintable: true, texture: 'deco-stylish-btm.png' },
  { id: 'deco-antique-top', name: 'アンティークなカベ・うえ', category: 'block-decowall', colorTop: '#5d4037', colorLeft: '#4e342e', colorRight: '#3e2723', icon: '🪵', paintable: true, texture: 'deco-antique-top.png' },
  { id: 'deco-antique-mid', name: 'アンティークなカベ・なか', category: 'block-decowall', colorTop: '#6d4c41', colorLeft: '#5d4037', colorRight: '#4e342e', icon: '🪵', paintable: true, texture: 'deco-antique-mid.png' },
  { id: 'deco-antique-btm', name: 'アンティークなカベ・した', category: 'block-decowall', colorTop: '#5d4037', colorLeft: '#4e342e', colorRight: '#3e2723', icon: '🪵', paintable: true, texture: 'deco-antique-btm.png' },
  { id: 'deco-antique-light-top', name: 'ライトアンティーク・うえ', category: 'block-decowall', colorTop: '#d7ccc8', colorLeft: '#bcaaa4', colorRight: '#a1887f', icon: '✨', paintable: true, texture: 'deco-antique-light-top.png' },
  { id: 'deco-antique-light-mid', name: 'ライトアンティーク・なか', category: 'block-decowall', colorTop: '#e8ddd5', colorLeft: '#d7ccc8', colorRight: '#bcaaa4', icon: '✨', paintable: true, texture: 'deco-antique-light-mid.png' },
  { id: 'deco-antique-light-btm', name: 'ライトアンティーク・した', category: 'block-decowall', colorTop: '#d7ccc8', colorLeft: '#bcaaa4', colorRight: '#a1887f', icon: '✨', paintable: true, texture: 'deco-antique-light-btm.png' },
  { id: 'deco-wood-pillar-top', name: '木のはしら・うえ', category: 'block-decowall', colorTop: '#8d6e63', colorLeft: '#795548', colorRight: '#6d4c41', icon: '🪵', texture: 'deco-wood-pillar-top.png' },
  { id: 'deco-wood-pillar-mid', name: '木のはしら・なか', category: 'block-decowall', colorTop: '#8d6e63', colorLeft: '#795548', colorRight: '#6d4c41', icon: '🪵', texture: 'deco-wood-pillar-mid.png' },
  { id: 'deco-wood-pillar-btm', name: '木のはしら・した', category: 'block-decowall', colorTop: '#8d6e63', colorLeft: '#795548', colorRight: '#6d4c41', icon: '🪵', texture: 'deco-wood-pillar-btm.png' },
  { id: 'deco-brick-stylish-top', name: 'おしゃれレンガ・うえ', category: 'block-decowall', colorTop: '#ef9a9a', colorLeft: '#e57373', colorRight: '#c62828', icon: '🧱', paintable: true, texture: 'deco-brick-stylish-top.png' },
  { id: 'deco-brick-stylish-mid', name: 'おしゃれレンガ・なか', category: 'block-decowall', colorTop: '#ef9a9a', colorLeft: '#e57373', colorRight: '#c62828', icon: '🧱', paintable: true, texture: 'deco-brick-stylish-mid.png' },
  { id: 'deco-brick-stylish-btm', name: 'おしゃれレンガ・した', category: 'block-decowall', colorTop: '#ef9a9a', colorLeft: '#e57373', colorRight: '#c62828', icon: '🧱', paintable: true, texture: 'deco-brick-stylish-btm.png' },
  { id: 'deco-stone-pillar-top', name: 'いしのはしら・うえ', category: 'block-decowall', colorTop: '#9e9e9e', colorLeft: '#828282', colorRight: '#6e6e6e', icon: '🪨', texture: 'deco-stone-pillar-top.png' },
  { id: 'deco-stone-pillar-mid', name: 'いしのはしら・なか', category: 'block-decowall', colorTop: '#9e9e9e', colorLeft: '#828282', colorRight: '#6e6e6e', icon: '🪨', texture: 'deco-stone-pillar-mid.png' },
  { id: 'deco-stone-pillar-btm', name: 'いしのはしら・した', category: 'block-decowall', colorTop: '#9e9e9e', colorLeft: '#828282', colorRight: '#6e6e6e', icon: '🪨', texture: 'deco-stone-pillar-btm.png' },
  { id: 'deco-pop-top', name: 'ポップなカベ・うえ', category: 'block-decowall', colorTop: '#ff8a80', colorLeft: '#ff5252', colorRight: '#ff1744', icon: '🎨', paintable: true, texture: 'deco-pop-top.png' },
  { id: 'deco-pop-mid', name: 'ポップなカベ・なか', category: 'block-decowall', colorTop: '#b9f6ca', colorLeft: '#69f0ae', colorRight: '#00e676', icon: '🎨', paintable: true, texture: 'deco-pop-mid.png' },
  { id: 'deco-pop-btm', name: 'ポップなカベ・した', category: 'block-decowall', colorTop: '#82b1ff', colorLeft: '#448aff', colorRight: '#2979ff', icon: '🎨', paintable: true, texture: 'deco-pop-btm.png' },
  { id: 'deco-sweets-top', name: 'スイーツなカベ・うえ', category: 'block-decowall', colorTop: '#f8bbd0', colorLeft: '#f48fb1', colorRight: '#ec407a', icon: '🍰', paintable: true, texture: 'deco-sweets-top.png' },
  { id: 'deco-sweets-mid', name: 'スイーツなカベ・なか', category: 'block-decowall', colorTop: '#fff9c4', colorLeft: '#fff59d', colorRight: '#fff176', icon: '🍰', paintable: true, texture: 'deco-sweets-mid.png' },
  { id: 'deco-sweets-btm', name: 'スイーツなカベ・した', category: 'block-decowall', colorTop: '#b3e5fc', colorLeft: '#81d4fa', colorRight: '#4fc3f7', icon: '🍰', paintable: true, texture: 'deco-sweets-btm.png' },
  { id: 'deco-pokecenter-top', name: 'ポケセンのカベ・うえ', category: 'block-decowall', colorTop: '#ef5350', colorLeft: '#e53935', colorRight: '#c62828', icon: '⚕️', texture: 'deco-pokecenter-top.png' },
  { id: 'deco-pokecenter-mid', name: 'ポケセンのカベ・なか', category: 'block-decowall', colorTop: '#f5f5f5', colorLeft: '#eeeeee', colorRight: '#e0e0e0', icon: '⚕️', texture: 'deco-pokecenter-mid.png' },
  { id: 'deco-pokecenter-btm', name: 'ポケセンのカベ・した', category: 'block-decowall', colorTop: '#ef5350', colorLeft: '#e53935', colorRight: '#c62828', icon: '⚕️', texture: 'deco-pokecenter-btm.png' },

  // ===== 床ブロック（40種） =====
  { id: 'floor-wood', name: '木のゆか', category: 'block-floor', colorTop: '#a1887f', colorLeft: '#8d6e63', colorRight: '#795548', icon: '🪵', paintable: true, texture: 'floor-wood.png' },
  { id: 'floor-wood-diag', name: 'ななめの木のゆか', category: 'block-floor', colorTop: '#a1887f', colorLeft: '#8d6e63', colorRight: '#795548', icon: '🪵', paintable: true, texture: 'floor-wood-diag.png' },
  { id: 'floor-wood-cross', name: 'タテヨコの木のゆか', category: 'block-floor', colorTop: '#a1887f', colorLeft: '#8d6e63', colorRight: '#795548', icon: '🪵', paintable: true, texture: 'floor-wood-cross.png' },
  { id: 'floor-hardwood', name: 'かたい木のゆか', category: 'block-floor', colorTop: '#8d6e63', colorLeft: '#795548', colorRight: '#6d4c41', icon: '🪵', paintable: true, texture: 'floor-hardwood.png' },
  { id: 'floor-modern-carpet', name: 'モダンなカーペット', category: 'block-floor', colorTop: '#78909c', colorLeft: '#607d8b', colorRight: '#546e7a', icon: '🟦', paintable: true, texture: 'floor-modern-carpet.png' },
  { id: 'floor-woven-carpet', name: 'タイルカーペット', category: 'block-floor', colorTop: '#607d8b', colorLeft: '#546e7a', colorRight: '#455a64', icon: '🔲', paintable: true, texture: 'floor-woven-carpet.png' },
  { id: 'floor-fluffy', name: 'フカフカじゅうたん', category: 'block-floor', colorTop: '#e8ddd5', colorLeft: '#d5cdc5', colorRight: '#c2bdb5', icon: '☁️', paintable: true, texture: 'floor-fluffy.png' },
  { id: 'floor-soft-carpet', name: 'やわらかいカーペット', category: 'block-floor', colorTop: '#f0e8e0', colorLeft: '#e0d8d0', colorRight: '#d0c8c0', icon: '☁️', paintable: true, texture: 'floor-soft-carpet.png' },
  { id: 'floor-extravagant', name: 'ごうかなじゅうたん', category: 'block-floor', colorTop: '#880e4f', colorLeft: '#6a0a3e', colorRight: '#4a0730', icon: '👑', paintable: true, texture: 'floor-extravagant.png' },
  { id: 'floor-tatami', name: 'たたみ', category: 'block-floor', colorTop: '#a5d6a7', colorLeft: '#81c784', colorRight: '#689f6a', icon: '🟩', paintable: false, texture: 'floor-tatami.png' },
  { id: 'floor-felt', name: 'フェルトマット', category: 'block-floor', colorTop: '#c5cae9', colorLeft: '#9fa8da', colorRight: '#7986cb', icon: '🟪', paintable: true, texture: 'floor-felt.png' },
  { id: 'floor-grass', name: 'しばふのゆか', category: 'block-floor', colorTop: '#66bb6a', colorLeft: '#4caf50', colorRight: '#43a047', icon: '🌿', paintable: false, texture: 'floor-grass.png' },
  { id: 'floor-simple', name: 'シンプルなゆか', category: 'block-floor', colorTop: '#bdbdbd', colorLeft: '#9e9e9e', colorRight: '#828282', icon: '⬜', paintable: true, texture: 'floor-simple.png' },
  { id: 'floor-marble', name: 'だいりせき', category: 'block-floor', colorTop: '#f5f5f5', colorLeft: '#e0e0e0', colorRight: '#c8c8c8', icon: '🤍', paintable: false, texture: 'floor-marble.png' },
  { id: 'floor-stone', name: 'いしのゆか', category: 'block-floor', colorTop: '#9e9e9e', colorLeft: '#828282', colorRight: '#6e6e6e', icon: '🪨', paintable: true, texture: 'floor-stone.png' },
  { id: 'floor-lined-stone', name: 'いしラインのゆか', category: 'block-floor', colorTop: '#b0bec5', colorLeft: '#90a4ae', colorRight: '#78909c', icon: '🪨', paintable: true, texture: 'floor-lined-stone.png' },
  { id: 'floor-marble-dark', name: 'だいりせき・ダーク', category: 'block-floor', colorTop: '#5d4037', colorLeft: '#4e342e', colorRight: '#3e2723', icon: '🟤', paintable: false, texture: 'floor-marble-dark.png' },
  { id: 'floor-marble-light', name: 'だいりせき・ライト', category: 'block-floor', colorTop: '#e0e0e0', colorLeft: '#c8c8c8', colorRight: '#b0b0b0', icon: '⬜', paintable: false, texture: 'floor-marble-light.png' },
  { id: 'floor-aged-stone', name: 'ふるびたいしゆか', category: 'block-floor', colorTop: '#8d8578', colorLeft: '#7a7268', colorRight: '#675f58', icon: '🏚️', paintable: true, texture: 'floor-aged-stone.png' },
  { id: 'floor-square-tile', name: 'しかくタイル', category: 'block-floor', colorTop: '#e0e0e0', colorLeft: '#c8c8c8', colorRight: '#b0b0b0', icon: '⬜', paintable: true, texture: 'floor-square-tile.png' },
  { id: 'floor-stylish-tile', name: 'おしゃれタイル', category: 'block-floor', colorTop: '#e8e8e8', colorLeft: '#d0d0d0', colorRight: '#b8b8b8', icon: '✨', paintable: true, texture: 'floor-stylish-tile.png' },
  { id: 'floor-hex', name: 'ろっかくけいのゆか', category: 'block-floor', colorTop: '#b0bec5', colorLeft: '#90a4ae', colorRight: '#78909c', icon: '⬡', paintable: true, texture: 'floor-hex.png' },
  { id: 'floor-triangle-pat', name: 'さんかくもようのゆか', category: 'block-floor', colorTop: '#7c4dff', colorLeft: '#6839e0', colorRight: '#5425c1', icon: '🔺', paintable: false, texture: 'floor-triangle-pat.png' },
  { id: 'floor-ironplate', name: 'てっぱんのゆか', category: 'block-floor', colorTop: '#78909c', colorLeft: '#607d8b', colorRight: '#546e7a', icon: '⬛', paintable: false, texture: 'floor-ironplate.png' },
  { id: 'floor-iron-tile', name: 'てつのタイル', category: 'block-floor', colorTop: '#6e7b8a', colorLeft: '#5a6776', colorRight: '#465362', icon: '⬛', paintable: false, texture: 'floor-iron-tile.png' },
  { id: 'floor-neon', name: 'ネオンなゆか', category: 'block-floor', colorTop: '#e040fb', colorLeft: '#d500f9', colorRight: '#aa00ff', icon: '💜', paintable: false, texture: 'floor-neon.png' },
  { id: 'floor-cyber', name: 'サイバーなゆか', category: 'block-floor', colorTop: '#00e5ff', colorLeft: '#00b8d4', colorRight: '#0097a7', icon: '💠', paintable: false, texture: 'floor-cyber.png' },
  { id: 'floor-arch-tile', name: 'アーチタイル', category: 'block-floor', colorTop: '#ff8a65', colorLeft: '#ff7043', colorRight: '#f4511e', icon: '🟠', paintable: true, texture: 'floor-arch-tile.png' },
  { id: 'floor-stone-tile', name: 'いしのタイル', category: 'block-floor', colorTop: '#a0998e', colorLeft: '#8d867b', colorRight: '#7a7368', icon: '🪨', paintable: true, texture: 'floor-stone-tile.png' },
  { id: 'floor-rough-tile', name: 'ざらタイル', category: 'block-floor', colorTop: '#c8b8a8', colorLeft: '#b5a898', colorRight: '#a29888', icon: '⬜', paintable: true, texture: 'floor-rough-tile.png' },
  { id: 'floor-mosaic', name: 'モザイクタイル', category: 'block-floor', colorTop: '#64b5f6', colorLeft: '#42a5f5', colorRight: '#2196f3', icon: '🎨', paintable: true, texture: 'floor-mosaic.png' },
  { id: 'floor-brick', name: 'レンガのゆか', category: 'block-floor', colorTop: '#ef9a9a', colorLeft: '#e57373', colorRight: '#ef5350', icon: '🧱', paintable: true, texture: 'floor-brick.png' },
  { id: 'floor-fishscale', name: 'うろこタイル', category: 'block-floor', colorTop: '#80cbc4', colorLeft: '#4db6ac', colorRight: '#26a69a', icon: '🐟', paintable: true, texture: 'floor-fishscale.png' },
  { id: 'road-asphalt', name: 'アスファルトのみち', category: 'block-floor', colorTop: '#424242', colorLeft: '#373737', colorRight: '#2c2c2c', icon: '🛣️', paintable: false, texture: 'road-asphalt.png' },
  { id: 'road-lined-h', name: 'はくせんのみち・よこ', category: 'block-floor', colorTop: '#424242', colorLeft: '#373737', colorRight: '#2c2c2c', icon: '🛣️', paintable: false, texture: 'road-lined-h.png' },
  { id: 'road-lined-v', name: 'はくせんのみち・たて', category: 'block-floor', colorTop: '#424242', colorLeft: '#373737', colorRight: '#2c2c2c', icon: '🛣️', paintable: false, texture: 'road-lined-v.png' },
  { id: 'road-gray-circle', name: 'グレーなマルのゆか', category: 'block-floor', colorTop: '#757575', colorLeft: '#616161', colorRight: '#4d4d4d', icon: '⭕', paintable: false, texture: 'road-gray-circle.png' },

  // ===== 屋根（23パーツ） =====
  { id: 'roof-tile-slope', name: 'ななめのやねがわら', category: 'block-roof', colorTop: '#ef5350', colorLeft: '#e53935', colorRight: '#c62828', icon: '🔴', shape: 'slope', paintable: true, texture: 'roof-tile-slope.png' },
  { id: 'roof-tile-hip', name: 'でっぱりのやねがわら', category: 'block-roof', colorTop: '#ef5350', colorLeft: '#e53935', colorRight: '#c62828', icon: '📐', shape: 'outcorner', paintable: true, texture: 'roof-tile-hip.png' },
  { id: 'roof-tile-valley', name: 'ひっこみのやねがわら', category: 'block-roof', colorTop: '#ef5350', colorLeft: '#e53935', colorRight: '#c62828', icon: '🔻', shape: 'incorner', paintable: true, texture: 'roof-tile-valley.png' },
  { id: 'roof-tile-flat', name: 'たいらなやねがわら', category: 'block-roof', colorTop: '#ef5350', colorLeft: '#e53935', colorRight: '#c62828', icon: '🟥', paintable: true, texture: 'roof-tile-flat.png' },
  { id: 'roof-tile-deco', name: 'やねがわらのかざり', category: 'block-roof', colorTop: '#ef5350', colorLeft: '#e53935', colorRight: '#c62828', icon: '🏠', paintable: true, texture: 'roof-tile-deco.png' },
  { id: 'roof-tile-magikarp', name: 'コイキングのやねがわら', category: 'block-roof', colorTop: '#ffd700', colorLeft: '#e6c200', colorRight: '#ccad00', icon: '🐟', paintable: false, texture: 'roof-tile-magikarp.png' },
  { id: 'roof-stone-slope', name: 'ななめのいしやね', category: 'block-roof', colorTop: '#90a4ae', colorLeft: '#78909c', colorRight: '#607d8b', icon: '🩶', shape: 'slope', paintable: true, texture: 'roof-stone-slope.png' },
  { id: 'roof-stone-deco', name: 'いしやねのかざり', category: 'block-roof', colorTop: '#90a4ae', colorLeft: '#78909c', colorRight: '#607d8b', icon: '🏠', paintable: true, texture: 'roof-stone-deco.png' },
  { id: 'roof-stone-hip', name: 'でっぱりのいしやね', category: 'block-roof', colorTop: '#90a4ae', colorLeft: '#78909c', colorRight: '#607d8b', icon: '📐', shape: 'outcorner', paintable: true, texture: 'roof-stone-hip.png' },
  { id: 'roof-stone-valley', name: 'ひっこみのいしやね', category: 'block-roof', colorTop: '#90a4ae', colorLeft: '#78909c', colorRight: '#607d8b', icon: '🔻', shape: 'incorner', paintable: true, texture: 'roof-stone-valley.png' },
  { id: 'roof-stone-flat', name: 'たいらないしやね', category: 'block-roof', colorTop: '#90a4ae', colorLeft: '#78909c', colorRight: '#607d8b', icon: '⬜', paintable: true, texture: 'roof-stone-flat.png' },
  { id: 'roof-brick-slope', name: 'ななめのやねレンガ', category: 'block-roof', colorTop: '#ff8a65', colorLeft: '#ff7043', colorRight: '#f4511e', icon: '🟠', shape: 'slope', paintable: true, texture: 'roof-brick-slope.png' },
  { id: 'roof-brick-flat', name: 'たいらのやねレンガ', category: 'block-roof', colorTop: '#ff8a65', colorLeft: '#ff7043', colorRight: '#f4511e', icon: '🟧', paintable: true, texture: 'roof-brick-flat.png' },
  { id: 'roof-brick-tri', name: 'さんかくのやねレンガ', category: 'block-roof', colorTop: '#ff8a65', colorLeft: '#ff7043', colorRight: '#f4511e', icon: '🔺', shape: 'triangle', paintable: true, texture: 'roof-brick-tri.png' },
  { id: 'roof-brick-hip', name: 'でっぱりのやねレンガ', category: 'block-roof', colorTop: '#ff8a65', colorLeft: '#ff7043', colorRight: '#f4511e', icon: '📐', shape: 'outcorner', paintable: true, texture: 'roof-brick-hip.png' },
  { id: 'roof-brick-valley', name: 'ひっこみのやねレンガ', category: 'block-roof', colorTop: '#ff8a65', colorLeft: '#ff7043', colorRight: '#f4511e', icon: '🔻', shape: 'incorner', paintable: true, texture: 'roof-brick-valley.png' },
  { id: 'roof-brick-deco', name: 'やねレンガのかざり', category: 'block-roof', colorTop: '#ff8a65', colorLeft: '#ff7043', colorRight: '#f4511e', icon: '🏠', paintable: true, texture: 'roof-brick-deco.png' },
  { id: 'roof-tent-slope', name: 'ななめのテントやね', category: 'block-roof', colorTop: '#fff9c4', colorLeft: '#fff59d', colorRight: '#fff176', icon: '⛺', shape: 'slope', paintable: true, texture: 'roof-tent-slope.png' },
  { id: 'roof-tent-hip', name: 'でっぱりのテントやね', category: 'block-roof', colorTop: '#fff9c4', colorLeft: '#fff59d', colorRight: '#fff176', icon: '📐', shape: 'outcorner', paintable: true, texture: 'roof-tent-hip.png' },
  { id: 'roof-tent-valley', name: 'ひっこみのテントやね', category: 'block-roof', colorTop: '#fff9c4', colorLeft: '#fff59d', colorRight: '#fff176', icon: '🔻', shape: 'incorner', paintable: true, texture: 'roof-tent-valley.png' },
  { id: 'roof-tent-flat', name: 'たいらなテントやね', category: 'block-roof', colorTop: '#fff9c4', colorLeft: '#fff59d', colorRight: '#fff176', icon: '🟨', paintable: true, texture: 'roof-tent-flat.png' },
  { id: 'roof-fan', name: 'おうぎやね', category: 'block-roof', colorTop: '#78909c', colorLeft: '#607d8b', colorRight: '#546e7a', icon: '🏯', paintable: false, texture: 'roof-fan.png' },
  { id: 'roof-support', name: 'やねのささえ', category: 'block-roof', colorTop: '#8d6e63', colorLeft: '#795548', colorRight: '#6d4c41', icon: '🪵', texture: 'roof-support.png' },

  // ===== ドア（13種） =====
  { id: 'door-wood-large', name: 'おおきな木のドア', category: 'block-door', blockH: 2, colorTop: '#a1887f', colorLeft: '#6d4c41', colorRight: '#5d4037', icon: '🚪', paintable: true, texture: 'door-wood-large.png' },
  { id: 'door-wood-fence', name: '木のさくのトビラ', category: 'block-door', blockH: 2, colorTop: '#a1887f', colorLeft: '#8d6e63', colorRight: '#795548', icon: '🚪', paintable: true, texture: 'door-wood-fence.png' },
  { id: 'door-rustic', name: '木のクロスドア', category: 'block-door', blockH: 2, colorTop: '#8d6e63', colorLeft: '#795548', colorRight: '#6d4c41', icon: '🚪', paintable: true, texture: 'door-rustic.png' },
  { id: 'door-shutter', name: 'シャッター', category: 'block-door', blockH: 2, colorTop: '#78909c', colorLeft: '#607d8b', colorRight: '#546e7a', icon: '🔒', paintable: true, texture: 'door-shutter.png' },
  { id: 'door-simple', name: 'シンプルなドア', category: 'block-door', blockH: 2, colorTop: '#90a4ae', colorLeft: '#78909c', colorRight: '#607d8b', icon: '🚪', paintable: true, texture: 'door-simple.png' },
  { id: 'door-auto', name: 'じどうドア', category: 'block-door', blockH: 2, colorTop: '#b3e5fc', colorLeft: '#81d4fa', colorRight: '#4fc3f7', icon: '🚪', paintable: false, transparent: true, texture: 'door-auto.png' },
  { id: 'door-stylish', name: 'スタイリッシュなドア', category: 'block-door', blockH: 2, colorTop: '#b3e5fc', colorLeft: '#81d4fa', colorRight: '#4fc3f7', icon: '🚪', paintable: false, transparent: true, texture: 'door-stylish.png' },
  { id: 'door-smart', name: 'スマートなドア', category: 'block-door', blockH: 2, colorTop: '#e0e0e0', colorLeft: '#bdbdbd', colorRight: '#9e9e9e', icon: '🚪', paintable: true, texture: 'door-smart.png' },
  { id: 'door-iron', name: 'てつのドア', category: 'block-door', blockH: 2, colorTop: '#546e7a', colorLeft: '#455a64', colorRight: '#37474f', icon: '🚪', paintable: false, texture: 'door-iron.png' },
  { id: 'door-ship', name: 'ふねのドア', category: 'block-door', blockH: 2, colorTop: '#f5f5f5', colorLeft: '#e0e0e0', colorRight: '#c8c8c8', icon: '🚢', paintable: false, texture: 'door-ship.png' },
  { id: 'door-metal-fence', name: 'メタルなさくのトビラ', category: 'block-door', blockH: 2, colorTop: '#78909c', colorLeft: '#607d8b', colorRight: '#546e7a', icon: '🚪', paintable: false, texture: 'door-metal-fence.png' },
  { id: 'door-modern', name: 'モダンなドア', category: 'block-door', blockH: 2, colorTop: '#8d6e63', colorLeft: '#795548', colorRight: '#6d4c41', icon: '🚪', paintable: true, texture: 'door-modern.png' },
  { id: 'door-gate', name: 'もんトビラ', category: 'block-door', blockH: 2, colorTop: '#5d4037', colorLeft: '#4e342e', colorRight: '#3e2723', icon: '🚪', paintable: true, texture: 'door-gate.png' },

  // ===== 窓・カーテン（10種） =====
  { id: 'window-glass', name: 'ガラスまど', category: 'block-window', colorTop: '#b3e5fc', colorLeft: '#81d4fa', colorRight: '#4fc3f7', icon: '🪟', paintable: false, transparent: true, texture: 'window-glass.png' },
  { id: 'window-pane', name: 'まどガラス', category: 'block-window', colorTop: '#b3e5fc', colorLeft: '#81d4fa', colorRight: '#4fc3f7', icon: '🪟', paintable: false, transparent: true, texture: 'window-pane.png' },
  { id: 'window-sash', name: 'サッシまど', category: 'block-window', colorTop: '#bcaaa4', colorLeft: '#a1887f', colorRight: '#8d6e63', icon: '🪟', paintable: true, texture: 'window-sash.png' },
  { id: 'window-hatch', name: 'フタつきまど', category: 'block-window', colorTop: '#78909c', colorLeft: '#607d8b', colorRight: '#546e7a', icon: '🪟', paintable: true, texture: 'window-hatch.png' },
  { id: 'window-underground', name: 'じめんのフタ', category: 'block-window', colorTop: '#8d6e63', colorLeft: '#795548', colorRight: '#6d4c41', icon: '⬛', paintable: true, texture: 'window-underground.png' },
  { id: 'window-stained-top', name: 'ステンドグラス・うえ', category: 'block-window', colorTop: '#e040fb', colorLeft: '#d500f9', colorRight: '#aa00ff', icon: '🎨', paintable: false, transparent: true, texture: 'window-stained-top.png' },
  { id: 'window-stained-mid', name: 'ステンドグラス・まんなか', category: 'block-window', colorTop: '#ff5252', colorLeft: '#ff1744', colorRight: '#d50000', icon: '🎨', paintable: false, transparent: true, texture: 'window-stained-mid.png' },
  { id: 'window-stained-btm', name: 'ステンドグラス・した', category: 'block-window', colorTop: '#69f0ae', colorLeft: '#00e676', colorRight: '#00c853', icon: '🎨', paintable: false, transparent: true, texture: 'window-stained-btm.png' },
  { id: 'curtain-left', name: 'カーテン・ひだり', category: 'block-window', colorTop: '#e8ddd5', colorLeft: '#d5cdc5', colorRight: '#c2bdb5', icon: '🪟', paintable: true, texture: 'curtain-left.png' },
  { id: 'curtain-right', name: 'カーテン・みぎ', category: 'block-window', colorTop: '#e8ddd5', colorLeft: '#d5cdc5', colorRight: '#c2bdb5', icon: '🪟', paintable: true, texture: 'curtain-right.png' },

  // ===== 柄ブロック（19種） =====
  { id: 'print-polkadot', name: 'みずたまもよう', category: 'block-print', colorTop: '#ff8a80', colorLeft: '#ff5252', colorRight: '#ff1744', icon: '⚪', paintable: true, texture: 'print-polkadot.png' },
  { id: 'print-vstripe', name: 'たてストライプ', category: 'block-print', colorTop: '#ffe082', colorLeft: '#ffd54f', colorRight: '#ffca28', icon: '📏', paintable: true, texture: 'print-vstripe.png' },
  { id: 'print-hstripe', name: 'よこストライプ', category: 'block-print', colorTop: '#fff176', colorLeft: '#ffee58', colorRight: '#ffeb3b', icon: '📏', paintable: true, texture: 'print-hstripe.png' },
  { id: 'print-gingham', name: 'ギンガムチェック', category: 'block-print', colorTop: '#ef9a9a', colorLeft: '#e57373', colorRight: '#ef5350', icon: '🔲', paintable: true, texture: 'print-gingham.png' },
  { id: 'print-tartan', name: 'タータンチェック', category: 'block-print', colorTop: '#c62828', colorLeft: '#b71c1c', colorRight: '#a01515', icon: '🔲', paintable: true, texture: 'print-tartan.png' },
  { id: 'print-argyle', name: 'アーガイルチェック', category: 'block-print', colorTop: '#5c6bc0', colorLeft: '#3f51b5', colorRight: '#3949ab', icon: '🔷', paintable: true, texture: 'print-argyle.png' },
  { id: 'print-berry', name: 'きのみのもよう', category: 'block-print', colorTop: '#a5d6a7', colorLeft: '#81c784', colorRight: '#66bb6a', icon: '🫐', paintable: true, texture: 'print-berry.png' },
  { id: 'print-pokeball', name: 'モンスターボールがら', category: 'block-print', colorTop: '#ef5350', colorLeft: '#e53935', colorRight: '#c62828', icon: '⚪', paintable: true, texture: 'print-pokeball.png' },
  { id: 'print-pokeball-stylish', name: 'おしゃれボールがら', category: 'block-print', colorTop: '#5c6bc0', colorLeft: '#3f51b5', colorRight: '#3949ab', icon: '⚪', paintable: true, texture: 'print-pokeball-stylish.png' },
  { id: 'print-bubble', name: 'シャボンのもよう', category: 'block-print', colorTop: '#b3e5fc', colorLeft: '#81d4fa', colorRight: '#4fc3f7', icon: '🫧', paintable: true, texture: 'print-bubble.png' },
  { id: 'print-houndstooth', name: 'ちどりごうし', category: 'block-print', colorTop: '#212121', colorLeft: '#1a1a1a', colorRight: '#111111', icon: '🐦', paintable: true, texture: 'print-houndstooth.png' },
  { id: 'print-vine', name: 'からくさもよう', category: 'block-print', colorTop: '#2e7d32', colorLeft: '#1b5e20', colorRight: '#145215', icon: '🌿', paintable: true, texture: 'print-vine.png' },
  { id: 'print-swirl', name: 'うずまきもよう', category: 'block-print', colorTop: '#7e57c2', colorLeft: '#673ab7', colorRight: '#5e35b1', icon: '🌀', paintable: true, texture: 'print-swirl.png' },
  { id: 'print-winter', name: 'ふゆのもよう', category: 'block-print', colorTop: '#e3f2fd', colorLeft: '#bbdefb', colorRight: '#90caf9', icon: '❄️', paintable: true, texture: 'print-winter.png' },
  { id: 'print-zigzag', name: 'ギザギザもよう', category: 'block-print', colorTop: '#fdd835', colorLeft: '#fbc02d', colorRight: '#f9a825', icon: '⚡', paintable: true, texture: 'print-zigzag.png' },
  { id: 'print-leaf', name: 'はっぱもよう', category: 'block-print', colorTop: '#81c784', colorLeft: '#66bb6a', colorRight: '#4caf50', icon: '🍃', paintable: true, texture: 'print-leaf.png' },
  { id: 'print-flower', name: 'はなもよう', category: 'block-print', colorTop: '#f48fb1', colorLeft: '#ec407a', colorRight: '#e91e63', icon: '🌸', paintable: true, texture: 'print-flower.png' },
  { id: 'print-star', name: 'ほしのもよう', category: 'block-print', colorTop: '#1a237e', colorLeft: '#0d1a5e', colorRight: '#05103e', icon: '⭐', paintable: true, texture: 'print-star.png' },
  { id: 'print-curry', name: 'カレーもよう', category: 'block-print', colorTop: '#ff8f00', colorLeft: '#ff6f00', colorRight: '#e65100', icon: '🍛', paintable: true, texture: 'print-curry.png' },

  // ===== その他（6種） =====
  { id: 'misc-hay', name: 'つみあげわら', category: 'block-misc', colorTop: '#ffe082', colorLeft: '#ffd54f', colorRight: '#ffca28', icon: '🌾', paintable: false, texture: 'misc-hay.png' },
  { id: 'misc-ironplate', name: 'てっぱん', category: 'block-misc', colorTop: '#78909c', colorLeft: '#607d8b', colorRight: '#546e7a', icon: '⬛', paintable: false, texture: 'misc-ironplate.png' },
  { id: 'misc-cubelight', name: 'キューブライト', category: 'block-misc', colorTop: '#fff9c4', colorLeft: '#fff59d', colorRight: '#fff176', icon: '💡', paintable: false, texture: 'misc-cubelight.png' },
  { id: 'misc-foundation', name: 'いえのどだい', category: 'block-misc', colorTop: '#9e9e9e', colorLeft: '#828282', colorRight: '#6e6e6e', icon: '🏗️', paintable: false, texture: 'misc-foundation.png' },
  { id: 'misc-levee', name: 'ていぼう', category: 'block-misc', colorTop: '#bdbdbd', colorLeft: '#9e9e9e', colorRight: '#828282', icon: '🌊', paintable: false, texture: 'misc-levee.png' },
  { id: 'misc-scrap', name: 'スクラップ', category: 'block-misc', colorTop: '#8d6e63', colorLeft: '#6d4c41', colorRight: '#5d4037', icon: '♻️', paintable: false, texture: 'misc-scrap.png' }
];

// ===== ペイントカラー（18色） =====
var BUILDING_SIM_PAINT_COLORS = [
  { id: 'paint-white', name: 'しろ', color: '#f5f5f5', texture: 'paint-white.png' },
  { id: 'paint-red', name: 'あか', color: '#e53935', texture: 'paint-red.png' },
  { id: 'paint-blue', name: 'あお', color: '#1e88e5', texture: 'paint-blue.png' },
  { id: 'paint-yellow', name: 'きいろ', color: '#fdd835', texture: 'paint-yellow.png' },
  { id: 'paint-green', name: 'みどり', color: '#43a047', texture: 'paint-green.png' },
  { id: 'paint-aquamarine', name: 'アクアマリン', color: '#26a69a', texture: 'paint-aquamarine.png' },
  { id: 'paint-orange', name: 'オレンジ', color: '#fb8c00', texture: 'paint-orange.png' },
  { id: 'paint-purple', name: 'むらさき', color: '#8e24aa', texture: 'paint-purple.png' },
  { id: 'paint-brown', name: 'ちゃいろ', color: '#6d4c41', texture: 'paint-brown.png' },
  { id: 'paint-cyan', name: 'シアン', color: '#00acc1', texture: 'paint-cyan.png' },
  { id: 'paint-rose', name: 'ローズ', color: '#d81b60', texture: 'paint-rose.png' },
  { id: 'paint-lime', name: 'ライム', color: '#7cb342', texture: 'paint-lime.png' },
  { id: 'paint-beige', name: 'ベージュ', color: '#d7ccc8', texture: 'paint-beige.png' },
  { id: 'paint-plum', name: 'プラム', color: '#6a1b9a', texture: 'paint-plum.png' },
  { id: 'paint-navy', name: 'ネイビー', color: '#1a237e', texture: 'paint-navy.png' },
  { id: 'paint-black', name: 'くろ', color: '#212121', texture: 'paint-black.png' },
  { id: 'paint-gray', name: 'グレー', color: '#78909c', texture: 'paint-gray.png' },
  { id: 'paint-pink', name: 'ピンク', color: '#ec407a', texture: 'paint-pink.png' }
];

// カテゴリ定義更新
BUILDING_SIM_CATEGORIES.block = [
  { key: 'block-wall', label: '壁', icon: '🧱' },
  { key: 'block-decowall', label: '装飾壁', icon: '🏛️' },
  { key: 'block-floor', label: '床', icon: '⬜' },
  { key: 'block-roof', label: '屋根', icon: '🏠' },
  { key: 'block-door', label: 'ドア', icon: '🚪' },
  { key: 'block-window', label: '窓', icon: '🪟' },
  { key: 'block-print', label: '柄', icon: '🎨' },
  { key: 'block-misc', label: 'その他', icon: '🔧' }
];


// ===== ブループリント（設計図プリセット） =====
var BUILDING_SIM_BLUEPRINTS = (function() {

  function generateSpaceTimeTowerV2() {
    var b = [];
    var placed = {}; // dedup map
    function add(x, y, z, type, rot) {
      if (x < 0 || x >= 40 || z < 0 || z >= 20 || y < 0 || y >= 70) return;
      var key = x + ',' + y + ',' + z;
      if (placed[key]) return;
      placed[key] = true;
      b.push({ x: x, y: y, z: z, type: type, rotation: rot || 0 });
    }

    // === Material aliases ===
    var FR   = 'wall-bronze';
    var FRA  = 'wall-bronze-stylish';
    var FRG  = 'wall-gold';
    var FRGS = 'wall-gold-stylish';
    var SGL  = 'window-stained-btm';
    var SGM  = 'window-stained-mid';
    var SGH  = 'window-stained-top';
    var PIL  = 'deco-stone-pillar-mid';
    var PILB = 'deco-stone-pillar-btm';
    var PILT = 'deco-stone-pillar-top';
    var BW   = 'wall-painted';
    var BA   = 'wall-plaster';
    var BCB  = 'wall-cobblestone';
    var RSL  = 'roof-stone-slope';
    var RSH  = 'roof-stone-hip';
    var RSV  = 'roof-stone-valley';
    var RSF  = 'roof-stone-flat';
    var RBL  = 'roof-brick-slope';
    var FLM  = 'floor-marble';
    var FLML = 'floor-marble-light';
    var FLS  = 'floor-stone';
    var FLSL = 'floor-lined-stone';
    var CUB  = 'misc-cubelight';

    // === Layout constants ===
    var Lx = 12, Rx = 28, Cz = 10;          // tower centers
    var baseCx = 20, baseCz = Cz;            // base center
    var Ystart = 16, Yend = 60;              // tower Y range
    var maxHW = 7, innerHW = 2;              // tower half-widths

    var i, bx, bz, by, dd, ang, rot, x, y, z, dx, dz;

    // Helper: direction from angle for slope rotation
    function slopeRot(a) {
      if (a >= -0.785 && a < 0.785) return 1;   // +X
      if (a >= 0.785 && a < 2.356) return 2;     // +Z
      if (a >= -2.356 && a < -0.785) return 0;   // -Z
      return 3;                                    // -X
    }

    // ================================================================
    // ===== BASE: Gaudí Colonnade Platform (Y0-Y15) =====
    // Wide elliptical podium + open column colonnade (like the movie)
    // ================================================================

    // archAngles needed by DECORATIVE DETAILS section below
    var archAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2,
                      Math.PI / 4, 3 * Math.PI / 4, -Math.PI / 4, -3 * Math.PI / 4];

    // Helper: ellipse check  (bx, bz) inside ellipse with semi-axes (a, b)
    function inEllipse(px, pz, a, b) {
      var ex = (px - baseCx) / a, ez = (pz - baseCz) / b;
      return ex * ex + ez * ez;
    }

    // ===== LOWER PLATFORM (Y0-Y3): Wide elliptical base a=18 b=9 =====
    for (bx = 0; bx < 40; bx++) for (bz = 0; bz < 20; bz++) {
      var eOut = inEllipse(bx, bz, 18, 9);
      if (eOut > 1.0) continue;
      add(bx, 0, bz, FLS);    // ground stone
      add(bx, 1, bz, BA);     // wall-plaster body
      if (eOut >= 0.88) {
        add(bx, 2, bz, BCB);  // dark stone rim lip
        add(bx, 3, bz, BCB);  // dark stone rim wall (2 blocks tall)
      } else {
        add(bx, 2, bz, FLM);  // marble top surface
      }
    }

    // ===== UPPER PLATFORM (Y3-Y6): Raised inner ellipse a=14 b=7 =====
    for (bx = 0; bx < 40; bx++) for (bz = 0; bz < 20; bz++) {
      var eIn = inEllipse(bx, bz, 14, 7);
      if (eIn > 1.0) continue;
      add(bx, 3, bz, FLM);    // marble floor level
      add(bx, 4, bz, FLML);   // marble-light upper floor
      if (eIn >= 0.82) {
        // Rim parapet of upper platform
        add(bx, 5, bz, BA);   // wall-plaster parapet
        add(bx, 6, bz, BCB);  // dark cap
      }
    }

    // ===== COLONNADE (Y6-Y15): 12 organic columns on ellipse a=12 b=6 =====
    // Open colonnade — no walls between columns, just sky visible through
    var numBC = 12;
    for (i = 0; i < numBC; i++) {
      ang = i * (2 * Math.PI / numBC);
      var bcx = Math.round(baseCx + Math.cos(ang) * 12);
      var bcz = Math.round(baseCz + Math.sin(ang) * 6);
      if (bcx < 0 || bcx >= 40 || bcz < 0 || bcz >= 20) continue;

      // Inward neighbor block (1 unit closer to center) for 2×2 thick columns
      var inX = Math.round(baseCx + Math.cos(ang) * 11);
      var inZ = Math.round(baseCz + Math.sin(ang) * 5.5);

      // 2-wide column base for organic look
      for (by = 5; by <= 15; by++) {
        add(bcx, by, bcz, by === 5 ? PILB : by === 15 ? PILT : PIL);
        // Second block inward to make column thicker
        if (inX >= 0 && inX < 40 && inZ >= 0 && inZ < 20) {
          add(inX, by, inZ, by === 5 ? PILB : by === 15 ? PILT : PIL);
        }
      }
      // Finial on top (outer position only)
      add(bcx, 16, bcz, RSL, slopeRot(ang + Math.PI));
    }

    // ===== ARCH LINTELS (Y14): Connecting beams between adjacent columns =====
    for (i = 0; i < numBC; i++) {
      var ang1 = i * (2 * Math.PI / numBC);
      var ang2 = ((i + 1) % numBC) * (2 * Math.PI / numBC);
      var x1c = Math.round(baseCx + Math.cos(ang1) * 12);
      var z1c = Math.round(baseCz + Math.sin(ang1) * 6);
      var x2c = Math.round(baseCx + Math.cos(ang2) * 12);
      var z2c = Math.round(baseCz + Math.sin(ang2) * 6);
      var steps = Math.max(Math.abs(x2c - x1c), Math.abs(z2c - z1c));
      if (steps === 0) continue;
      for (var bs = 1; bs < steps; bs++) {
        var bxb = Math.round(x1c + (x2c - x1c) * bs / steps);
        var bzb = Math.round(z1c + (z2c - z1c) * bs / steps);
        if (bxb < 0 || bxb >= 40 || bzb < 0 || bzb >= 20) continue;
        add(bxb, 14, bzb, BA);  // arch lintel beam
      }
    }

    // ===== INNER RIM: Small stone caps between columns on upper parapet =====
    for (i = 0; i < 24; i++) {
      ang = i * (2 * Math.PI / 24);
      var ornX = Math.round(baseCx + Math.cos(ang) * 11);
      var ornZ = Math.round(baseCz + Math.sin(ang) * 5.5);
      if (ornX < 0 || ornX >= 40 || ornZ < 0 || ornZ >= 20) continue;
      add(ornX, 5, ornZ, BCB);  // dark stone rim caps (no pink ornaments)
    }

    // ===== TOWER LAUNCH PLATFORM (Y14-15) =====
    for (bx = Lx - 4; bx <= Rx + 4; bx++) for (bz = Cz - 4; bz <= Cz + 4; bz++) {
      if (bx >= 0 && bx < 40 && bz >= 0 && bz < 20) {
        add(bx, 14, bz, BA);   // wall-plaster (warm cream, matches base)
        add(bx, 15, bz, FLM);  // marble surface
      }
    }
    for (bx = Lx - 5; bx <= Rx + 5; bx++) {
      if (bx >= 0 && bx < 40) {
        add(bx, 14, Cz - 5, RSL, 0); add(bx, 14, Cz + 5, RSL, 2);
      }
    }
    for (bz = Cz - 4; bz <= Cz + 4; bz++) {
      if (bz >= 0 && bz < 20) {
        add(Lx - 5, 14, bz, RSL, 3); add(Rx + 5, 14, bz, RSL, 1);
      }
    }

    // ================================================================
    // ===== TWIN TOWERS (Y16-60) =====
    // ================================================================

    // Compute outer half-width profile: teardrop/harp shape
    var outerHW = [];
    for (y = 0; y <= 63; y++) {
      if (y < Ystart || y > Yend) { outerHW[y] = 0; continue; }
      var t = (y - Ystart) / (Yend - Ystart);
      // Teardrop: widest at ~35% height, using sin with exponent for asymmetry
      outerHW[y] = Math.max(1, Math.round(maxHW * Math.sin(Math.PI * Math.pow(t, 0.42))));
    }

    // Z-depth varies by distance from center
    function zDepth(adx, w) {
      if (w <= 2) return 1;
      var r = adx / w;
      return r <= 0.3 ? 3 : r <= 0.6 ? 2 : 1;
    }

    function buildTower(cx, isSpace, dir) {
      // dir: -1 = tower expands left (Space/left), +1 = expands right (Time/right)
      for (y = Ystart; y <= Yend; y++) {
        var ow = outerHW[y];
        if (!ow) continue;
        var t = (y - Ystart) / (Yend - Ystart);

        // Material progression by height
        var sg = (y <= Ystart + 10) ? SGL : (y <= Ystart + 30) ? SGM : SGH;
        var fr = (y <= Ystart + 14) ? FR : (y <= Ystart + 34) ? FRA : FRG;

        var iw = Math.min(innerHW, ow);
        var outerX = cx + (dir * ow);
        var innerX = cx - (dir * iw);
        var xMin = Math.min(outerX, innerX);
        var xMax = Math.max(outerX, innerX);

        for (x = xMin; x <= xMax; x++) {
          var zd = zDepth(Math.abs(x - cx), Math.max(ow, iw));
          var isOE = (x === outerX), isIE = (x === innerX);

          for (dz = -zd; dz <= zd; dz++) {
            var isEZ = (Math.abs(dz) === zd);

            if (isOE || isIE) {
              // Frame edges: bronze/gold walls with slope caps at z-edges
              if (isEZ && zd > 1) {
                var sR;
                if (isOE) sR = (dir < 0) ? ((dz < 0) ? 0 : 1) : ((dz < 0) ? 3 : 2);
                else sR = (dir > 0) ? ((dz < 0) ? 0 : 1) : ((dz < 0) ? 3 : 2);
                add(x, y, Cz + dz, RSL, sR);
              } else {
                add(x, y, Cz + dz, fr);
              }
            } else if (isEZ) {
              // Side faces: stained glass "strings" with gaps every 3 blocks
              if ((x - xMin) % 3 !== 0) {
                add(x, y, Cz + dz, sg);
              } else {
                // String column = frame material
                add(x, y, Cz + dz, fr);
              }
            }
          }
        }

        // Cap at narrowing points + base layer
        var nextOW = (y < Yend) ? (outerHW[y + 1] || 0) : 0;
        var prevOW = (y > 0) ? (outerHW[y - 1] || 0) : 0;
        if (nextOW < ow || prevOW < ow || y === Ystart) {
          for (var x2 = xMin; x2 <= xMax; x2++) {
            var zd2 = zDepth(Math.abs(x2 - cx), Math.max(ow, iw));
            add(x2, y, Cz - zd2, fr);
            add(x2, y, Cz + zd2, fr);
          }
        }

        // Slope cap at outer tip when narrowing
        if (nextOW < ow && ow > 1) {
          add(outerX, y, Cz, RSL, dir < 0 ? 3 : 1);
        }

        // Decorative horizontal bands every 8 layers
        if ((y - Ystart) % 8 === 0 && (xMax - xMin) > 2) {
          for (var x3 = xMin; x3 <= xMax; x3++) {
            var zd3 = zDepth(Math.abs(x3 - cx), Math.max(ow, iw));
            for (var dz3 = -zd3; dz3 <= zd3; dz3++) {
              add(x3, y, Cz + dz3, FRA);
            }
          }
        }

        // Rose window at ~2/3 height (Y44-48)
        if (y >= Ystart + 28 && y <= Ystart + 32 && ow >= 4) {
          var roseR = (y === Ystart + 30) ? 3 : (y === Ystart + 29 || y === Ystart + 31) ? 2 : 1;
          var zf = zDepth(0, ow);
          var rwCx = Math.floor((xMin + xMax) / 2);
          for (dx = -roseR; dx <= roseR; dx++) {
            if (rwCx + dx >= xMin && rwCx + dx <= xMax) {
              // Rose window: circular pattern of stained glass
              var roseDist = Math.sqrt(dx * dx + (y - Ystart - 30) * (y - Ystart - 30));
              if (roseDist <= roseR) {
                add(rwCx + dx, y, Cz - zf, isSpace ? SGH : SGM);
              }
            }
          }
          if (y === Ystart + 30) {
            add(rwCx, y, Cz - zf - 1, isSpace ? 'round-pillar' : 'extravagant-pillar');
          }
        }

        // Secondary rose window at ~1/3 height (Y26-30)
        if (y >= Ystart + 10 && y <= Ystart + 14 && ow >= 5) {
          var roseR2 = (y === Ystart + 12) ? 2 : 1;
          var zf2 = zDepth(0, ow);
          var rwCx2 = Math.floor((xMin + xMax) / 2);
          for (dx = -roseR2; dx <= roseR2; dx++) {
            if (rwCx2 + dx >= xMin && rwCx2 + dx <= xMax) {
              add(rwCx2 + dx, y, Cz - zf2, isSpace ? SGL : SGM);
            }
          }
        }
      }

      // === Tower Spire / Finial (Y61-65) ===
      var tipX = cx + (dir * 1);
      add(tipX, Yend + 1, Cz, FRG);
      add(tipX, Yend + 1, Cz - 1, FRG);
      add(tipX, Yend + 1, Cz + 1, FRG);
      add(tipX + dir, Yend + 1, Cz, FRG);
      add(tipX, Yend + 2, Cz, FRGS);
      add(tipX, Yend + 2, Cz - 1, RSL, 0);
      add(tipX, Yend + 2, Cz + 1, RSL, 2);
      add(tipX + dir, Yend + 2, Cz, RSL, dir < 0 ? 3 : 1);
      add(tipX - dir, Yend + 2, Cz, RSL, dir < 0 ? 1 : 3);
      add(tipX, Yend + 3, Cz, FRGS);
      add(tipX, Yend + 4, Cz, isSpace ? 'deco-sweets-top' : 'deco-pop-btm');
    }

    // Build both towers
    buildTower(Lx, true, -1);   // Space Tower (left, expands left)
    buildTower(Rx, false, +1);  // Time Tower (right, expands right)

    // ================================================================
    // ===== CENTRAL SCROLLWORK & PILLAR =====
    // ================================================================
    var midX = Math.floor((Lx + Rx) / 2);
    var innerL = Lx + innerHW;
    var innerR = Rx - innerHW;

    // Central vertical pillar
    for (y = Ystart; y <= 56; y++) {
      add(midX, y, Cz, PIL);
      // Spiral decoration around pillar
      var sd = y % 4;
      var sdx = (sd === 0) ? 1 : (sd === 2) ? -1 : 0;
      var sdz = (sd === 1) ? 1 : (sd === 3) ? -1 : 0;
      add(midX + sdx, y, Cz + sdz, RSL, sd);
    }

    // S-curve scrollwork between towers
    for (y = Ystart + 2; y <= 52; y++) {
      var lE = innerL + 1, rE = innerR - 1;
      if (lE >= rE) continue;
      var gap = rE - lE;

      // Horizontal bands every 10 layers
      if (y % 10 === 0) {
        for (x = lE; x <= rE; x++) add(x, y, Cz, FR);
      }

      // S-curve slope pattern
      var period = Math.floor((y - Ystart) / 8) % 2;
      var phase = (y - Ystart) % 8;
      if (phase >= 1 && phase <= 6) {
        var amp = Math.floor(gap / 3);
        var offset = Math.round(Math.sin(phase * 0.524) * amp);
        if (period === 0) {
          var sx = lE + Math.abs(offset);
          if (sx < midX) add(sx, y, Cz, RSL, offset > 0 ? 1 : 3);
        } else {
          var sx2 = rE - Math.abs(offset);
          if (sx2 > midX) add(sx2, y, Cz, RSL, offset > 0 ? 3 : 1);
        }
      }

      // Secondary scrollwork at Cz+1 and Cz-1 for depth
      if (phase === 3 || phase === 4) {
        add(midX - 1, y, Cz + 1, RSL, 3);
        add(midX + 1, y, Cz - 1, RSL, 1);
      }
    }

    // ================================================================
    // ===== MUSIC ROOM DOME (Y48-56) =====
    // ================================================================
    var domeY = 48;
    var domeR = 4;
    var domeCx = midX, domeCz = Cz;

    // Bridges from towers to dome
    for (x = innerL; x <= midX - domeR; x++) {
      add(x, domeY, Cz, FLS);
      add(x, domeY, Cz - 1, FLS);
      add(x, domeY, Cz + 1, FLS);
      // Railings
      add(x, domeY + 1, Cz - 1, FR);
      add(x, domeY + 1, Cz + 1, FR);
    }
    for (x = midX + domeR; x <= innerR; x++) {
      add(x, domeY, Cz, FLS);
      add(x, domeY, Cz - 1, FLS);
      add(x, domeY, Cz + 1, FLS);
      add(x, domeY + 1, Cz - 1, FR);
      add(x, domeY + 1, Cz + 1, FR);
    }

    // Dome floor
    for (dx = -domeR; dx <= domeR; dx++) for (dz = -domeR; dz <= domeR; dz++) {
      if (dx * dx + dz * dz <= domeR * domeR) {
        add(domeCx + dx, domeY, domeCz + dz, FLM);
      }
    }

    // Dome walls (Y49-51)
    for (by = domeY + 1; by <= domeY + 3; by++) {
      for (dx = -domeR; dx <= domeR; dx++) for (dz = -domeR; dz <= domeR; dz++) {
        var dd2 = Math.sqrt(dx * dx + dz * dz);
        if (dd2 <= domeR && dd2 >= domeR - 0.8) {
          // Gothic arched windows on each face
          var wAng = Math.atan2(dz, dx);
          var isWin = false;
          for (var wi = 0; wi < 4; wi++) {
            var wda = Math.abs(wAng - archAngles[wi]);
            if (wda > Math.PI) wda = 2 * Math.PI - wda;
            if (wda < 0.35 && by <= domeY + 2) isWin = true;
          }
          if (isWin) {
            add(domeCx + dx, by, domeCz + dz, SGH);
          } else {
            add(domeCx + dx, by, domeCz + dz, by === domeY + 1 ? BA : by === domeY + 3 ? PILT : BW);
          }
        }
      }
    }

    // Dome roof (slopes converging inward, Y52-54)
    for (dx = -domeR; dx <= domeR; dx++) for (dz = -domeR; dz <= domeR; dz++) {
      var dd3 = Math.sqrt(dx * dx + dz * dz);
      if (dd3 <= domeR) {
        var dAng = Math.atan2(dz, dx);
        if (dd3 >= domeR - 1.5) {
          add(domeCx + dx, domeY + 4, domeCz + dz, RSL, slopeRot(dAng));
        } else if (dd3 >= 1) {
          add(domeCx + dx, domeY + 5, domeCz + dz, RSL, slopeRot(dAng));
        } else {
          add(domeCx + dx, domeY + 5, domeCz + dz, RSF);
        }
      }
    }

    // Dome central spire
    add(domeCx, domeY + 6, domeCz, FRG);
    add(domeCx, domeY + 7, domeCz, FRGS);
    add(domeCx, domeY + 8, domeCz, 'deco-sweets-mid');

    // Light orbs on dome
    add(domeCx, domeY + 1, domeCz, CUB);
    add(domeCx, domeY + 2, domeCz, CUB);

    // ================================================================
    // ===== DECORATIVE DETAILS =====
    // ================================================================

    // Buttresses radiating from base (8 directions)
    for (i = 0; i < 8; i++) {
      ang = archAngles[i];
      for (var br = 15; br <= 19; br++) {
        var bpx = Math.round(baseCx + Math.cos(ang) * br);
        var bpz = Math.round(baseCz + Math.sin(ang) * br);
        if (bpx >= 0 && bpx < 40 && bpz >= 0 && bpz < 20) {
          for (by = 1; by <= 3; by++) add(bpx, by, bpz, BW);
          // Slope cap
          add(bpx, 4, bpz, RSL, slopeRot(ang));
        }
        // Flanking blocks for width
        var bpx2 = Math.round(baseCx + Math.cos(ang + 0.12) * br);
        var bpz2 = Math.round(baseCz + Math.sin(ang + 0.12) * br);
        if (bpx2 >= 0 && bpx2 < 40 && bpz2 >= 0 && bpz2 < 20) {
          for (by = 1; by <= 2; by++) add(bpx2, by, bpz2, BW);
        }
        var bpx3 = Math.round(baseCx + Math.cos(ang - 0.12) * br);
        var bpz3 = Math.round(baseCz + Math.sin(ang - 0.12) * br);
        if (bpx3 >= 0 && bpx3 < 40 && bpz3 >= 0 && bpz3 < 20) {
          for (by = 1; by <= 2; by++) add(bpx3, by, bpz3, BW);
        }
      }
    }

    // Cubelight lanterns along the platform edge
    for (x = Lx - 3; x <= Rx + 3; x += 3) {
      add(x, 16, Cz - 4, CUB);
      add(x, 16, Cz + 4, CUB);
    }

    return b;
  }

  return [{
    id: 'space-time-tower',
    name: '時空の塔 V17（ディアルガVSパルキア）',
    desc: '映画「ディアルガVSパルキアVSダークライ」の時空の塔。5段有機基部+コーナー尖塔6本+ハープ型ツインタワー+ミュージックルームドーム+スクロール装飾。全65層。',
    icon: '🏛️',
    baseW: 40,
    baseD: 20,
    blocks: generateSpaceTimeTowerV2()
  }];
})();
