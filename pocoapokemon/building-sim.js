(function() {
  'use strict';

  // === State ===
  var currentMode = 'town'; // 'town', 'room', or 'block'
  var gridCols = 15;
  var gridRows = 15;
  var gridState = []; // gridState[row][col] = null | { itemId, originRow, originCol, rotation }
  var undoStack = [];
  var selectedItem = null; // item object from BUILDING_SIM_ITEMS
  var currentRotation = 0; // 0, 90, 180, 270
  var deleteMode = false;
  var activeCategory = '';
  var searchQuery = '';
  var longPressTimer = null;

  // === 3D Block State ===
  var blockGrid = {};       // "x,y,z" -> { blockType, rotation }
  var blockBaseW = 5;
  var blockBaseD = 5;
  var blockMaxH = 70;
  var activeLayer = -1;     // -1 = show all
  var selectedBlock = null;
  var blockUndoStack = [];
  var mirrorMode = 0; // 0=OFF, 1=X軸, 2=Z軸, 3=両軸
  var isPainting = false;   // ドラッグ配置中
  var paintY = -1;          // ドラッグ中の配置高さ
  var paintUndoPushed = false; // ドラッグ開始時にundo1回だけ
  var viewRotation = 0; // 0,1,2,3 = 4方向（90°ずつ）
  var TILE_W = 40;
  var TILE_H = 20;
  var LAYER_H = 36;

  // === DOM refs ===
  var grid = document.getElementById('simGrid');
  var gridWrapper = document.getElementById('simGridWrapper');
  var paletteList = document.getElementById('simPaletteList');
  var paletteTabs = document.getElementById('simPaletteTabs');
  var searchInput = document.getElementById('simSearch');
  var gridSizeSelect = document.getElementById('simGridSize');
  var roomWInput = document.getElementById('simRoomW');
  var roomHInput = document.getElementById('simRoomH');
  var roomWLabel = document.getElementById('simRoomWLabel');
  var roomHLabel = document.getElementById('simRoomHLabel');
  var itemCountEl = document.getElementById('simItemCount');
  var usageEl = document.getElementById('simUsage');
  var furnitureStatusEl = document.getElementById('simFurnitureStatus');
  var deleteModeBtn = document.getElementById('simDeleteMode');
  var paletteEl = document.getElementById('simPalette');
  var resizeHandle = document.getElementById('simResizeHandle');
  var viewRotLBtn = document.getElementById('simViewRotL');
  var viewRotRBtn = document.getElementById('simViewRotR');
  var isoView = document.getElementById('simIsoView');
  var isoScene = document.getElementById('simIsoScene');
  var layerBar = document.getElementById('simLayerBar');
  var blockWInput = document.getElementById('simBlockW');
  var blockDInput = document.getElementById('simBlockD');
  var blockWLabel = document.getElementById('simBlockWLabel');
  var blockDLabel = document.getElementById('simBlockDLabel');

  // === Helpers ===
  function findItem(id) {
    for (var i = 0; i < BUILDING_SIM_ITEMS.length; i++) {
      if (BUILDING_SIM_ITEMS[i].id === id) return BUILDING_SIM_ITEMS[i];
    }
    return null;
  }

  function getEffectiveSize(item, rotation) {
    if (rotation === 90 || rotation === 270) {
      return { w: item.h, h: item.w };
    }
    return { w: item.w, h: item.h };
  }

  function getItemsForMode(mode) {
    if (mode === 'block') {
      return BUILDING_SIM_BLOCKS.map(function(b) {
        return { id: b.id, name: b.name, category: b.category, w: 1, h: 1, color: b.colorLeft, icon: b.icon, mode: 'block' };
      });
    }
    return BUILDING_SIM_ITEMS.filter(function(item) {
      return item.mode === mode || item.mode === 'both';
    });
  }

  function getCategoriesForMode(mode) {
    return BUILDING_SIM_CATEGORIES[mode] || [];
  }

  // === 3D Block Helpers ===
  function blockKey(x, y, z) { return x + ',' + y + ',' + z; }
  function parseBlockKey(k) { var p = k.split(','); return { x: +p[0], y: +p[1], z: +p[2] }; }
  function getBlock(x, y, z) { return blockGrid[blockKey(x, y, z)] || null; }
  function setBlock(x, y, z, data) { blockGrid[blockKey(x, y, z)] = data; }
  function delBlock(x, y, z) { delete blockGrid[blockKey(x, y, z)]; }

  function findBlock(id) {
    for (var i = 0; i < BUILDING_SIM_BLOCKS.length; i++) {
      if (BUILDING_SIM_BLOCKS[i].id === id) return BUILDING_SIM_BLOCKS[i];
    }
    return null;
  }

  function pushBlockUndo() {
    blockUndoStack.push(JSON.parse(JSON.stringify(blockGrid)));
    if (blockUndoStack.length > 50) blockUndoStack.shift();
  }
  function popBlockUndo() {
    if (blockUndoStack.length === 0) return;
    blockGrid = blockUndoStack.pop();
    renderBlockView();
    updateBlockStats();
    renderLayerButtons();
  }

  function hasBlocks() {
    return Object.keys(blockGrid).length > 0;
  }

  function clearBlocks() {
    // Auto-accept clear (confirm removed for preview compatibility)
    pushBlockUndo();
    blockGrid = {};
    renderBlockView();
    updateBlockStats();
    renderLayerButtons();
  }

  // ミラー位置を返す（配置元を含む全座標リスト）
  function getMirrorPositions(x, y, z) {
    var positions = [{ x: x, y: y, z: z }];
    if (mirrorMode === 0) return positions;
    var mx = blockBaseW - 1 - x;
    var mz = blockBaseD - 1 - z;
    if (mirrorMode === 1 || mirrorMode === 3) {
      // X軸ミラー（左右対称）
      if (mx !== x) positions.push({ x: mx, y: y, z: z });
    }
    if (mirrorMode === 2 || mirrorMode === 3) {
      // Z軸ミラー（前後対称）
      if (mz !== z) positions.push({ x: x, y: y, z: mz });
    }
    if (mirrorMode === 3) {
      // 対角ミラー
      if (mx !== x && mz !== z) positions.push({ x: mx, y: y, z: mz });
    }
    return positions;
  }

  function cycleMirrorMode() {
    mirrorMode = (mirrorMode + 1) % 4;
    var labels = ['OFF', '← →', '↑ ↓', '✦ 4方向'];
    var mirrorBtn = document.getElementById('simMirror');
    mirrorBtn.textContent = '🪞 ' + labels[mirrorMode];
    mirrorBtn.classList.toggle('active', mirrorMode > 0);
    renderBlockView(); // re-render to show mirror line
  }

  // === Grid State ===
  function initGrid(cols, rows) {
    gridCols = cols;
    gridRows = rows;
    gridState = [];
    for (var r = 0; r < rows; r++) {
      gridState[r] = [];
      for (var c = 0; c < cols; c++) {
        gridState[r][c] = null;
      }
    }
    undoStack = [];
  }

  function pushUndo() {
    undoStack.push(JSON.parse(JSON.stringify(gridState)));
    if (undoStack.length > 50) undoStack.shift();
  }

  function popUndo() {
    if (undoStack.length === 0) return;
    gridState = undoStack.pop();
    renderGrid();
    updateStats();
  }

  function canPlace(row, col, item, rotation) {
    var size = getEffectiveSize(item, rotation);
    if (row + size.h > gridRows || col + size.w > gridCols) return false;
    if (row < 0 || col < 0) return false;
    for (var r = row; r < row + size.h; r++) {
      for (var c = col; c < col + size.w; c++) {
        if (gridState[r][c] !== null) return false;
      }
    }
    return true;
  }

  function placeItem(row, col, item, rotation) {
    var size = getEffectiveSize(item, rotation);
    for (var r = row; r < row + size.h; r++) {
      for (var c = col; c < col + size.w; c++) {
        gridState[r][c] = { itemId: item.id, originRow: row, originCol: col, rotation: rotation };
      }
    }
  }

  function removeItemAt(row, col) {
    var cell = gridState[row][col];
    if (!cell) return;
    var item = findItem(cell.itemId);
    if (!item) return;
    var size = getEffectiveSize(item, cell.rotation);
    var oRow = cell.originRow;
    var oCol = cell.originCol;
    for (var r = oRow; r < oRow + size.h; r++) {
      for (var c = oCol; c < oCol + size.w; c++) {
        if (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
          gridState[r][c] = null;
        }
      }
    }
  }

  function hasItems() {
    for (var r = 0; r < gridRows; r++) {
      for (var c = 0; c < gridCols; c++) {
        if (gridState[r][c]) return true;
      }
    }
    return false;
  }

  function clearAll() {
    if (hasItems() && !confirm('すべてのアイテムを消去しますか？')) return;
    pushUndo();
    initGrid(gridCols, gridRows);
    renderGrid();
    updateStats();
  }

  // === Rendering ===
  function renderGrid() {
    grid.style.gridTemplateColumns = 'repeat(' + gridCols + ', 1fr)';
    grid.style.gridTemplateRows = 'repeat(' + gridRows + ', 1fr)';
    grid.innerHTML = '';

    // Track which origins we've rendered
    var rendered = {};

    for (var r = 0; r < gridRows; r++) {
      for (var c = 0; c < gridCols; c++) {
        var cell = document.createElement('div');
        cell.className = 'sim-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        var state = gridState[r][c];
        if (state) {
          var item = findItem(state.itemId);
          var isOrigin = (state.originRow === r && state.originCol === c);
          cell.classList.add('occupied');
          cell.style.backgroundColor = item ? item.color : '#999';

          if (isOrigin && item) {
            cell.textContent = item.icon;
            var size = getEffectiveSize(item, state.rotation);
            if (size.w > 1 || size.h > 1) {
              var label = document.createElement('span');
              label.className = 'item-label';
              label.textContent = item.name;
              cell.appendChild(label);
            }
          }
        }

        grid.appendChild(cell);
      }
    }
  }

  function showPreview(row, col) {
    clearPreview();
    if (!selectedItem) return;
    var size = getEffectiveSize(selectedItem, currentRotation);
    var valid = canPlace(row, col, selectedItem, currentRotation);

    for (var r = row; r < row + size.h && r < gridRows; r++) {
      for (var c = col; c < col + size.w && c < gridCols; c++) {
        if (r < 0 || c < 0) continue;
        var cellEl = grid.querySelector('[data-row="' + r + '"][data-col="' + c + '"]');
        if (cellEl) {
          cellEl.classList.add(valid ? 'preview-valid' : 'preview-invalid');
        }
      }
    }
  }

  function clearPreview() {
    var cells = grid.querySelectorAll('.preview-valid, .preview-invalid');
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('preview-valid', 'preview-invalid');
    }
  }

  // === Palette ===
  function renderPaletteTabs() {
    var cats = getCategoriesForMode(currentMode);
    paletteTabs.innerHTML = '';
    cats.forEach(function(cat, i) {
      var btn = document.createElement('button');
      btn.className = 'sim-palette-tab' + (i === 0 ? ' active' : '');
      btn.textContent = cat.icon + ' ' + cat.label;
      btn.dataset.category = cat.key;
      btn.addEventListener('click', function() {
        activeCategory = cat.key;
        var tabs = paletteTabs.querySelectorAll('.sim-palette-tab');
        for (var t = 0; t < tabs.length; t++) tabs[t].classList.remove('active');
        btn.classList.add('active');
        renderPaletteItems();
      });
      paletteTabs.appendChild(btn);
    });
    if (cats.length > 0) activeCategory = cats[0].key;
  }

  function renderPaletteItems() {
    var items = getItemsForMode(currentMode).filter(function(item) {
      if (item.category !== activeCategory) return false;
      if (searchQuery && item.name.indexOf(searchQuery) === -1) return false;
      return true;
    });

    paletteList.innerHTML = '';
    var currentSubcat = '';

    items.forEach(function(item) {
      // Subcategory group header
      if (item.subcategory && item.subcategory !== currentSubcat) {
        currentSubcat = item.subcategory;
        var groupEl = document.createElement('div');
        groupEl.className = 'sim-palette-group';
        groupEl.textContent = currentSubcat;
        paletteList.appendChild(groupEl);
      }

      var el = document.createElement('div');
      el.className = 'sim-palette-item';
      if (selectedItem && selectedItem.id === item.id) el.classList.add('selected');
      el.dataset.itemId = item.id;

      var swatch = document.createElement('div');
      swatch.className = 'sim-palette-swatch';

      if (currentMode === 'block') {
        var blockDef = findBlock(item.id);
        if (blockDef) {
          var imgURL = renderBlockPreview(blockDef);
          var img = document.createElement('img');
          img.src = imgURL;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          swatch.style.backgroundColor = 'transparent';
          swatch.appendChild(img);
        } else {
          swatch.style.backgroundColor = item.color;
          swatch.textContent = item.icon;
        }
      } else {
        swatch.style.backgroundColor = item.color;
        swatch.textContent = item.icon;
      }

      var info = document.createElement('div');
      info.className = 'sim-palette-info';

      var name = document.createElement('div');
      name.className = 'sim-palette-name';
      name.textContent = item.name;

      var sizeText = item.w + '×' + item.h;
      if (item.capacity) sizeText += ' (' + item.capacity + '匹)';
      var sizeEl = document.createElement('div');
      sizeEl.className = 'sim-palette-size';
      sizeEl.textContent = sizeText;

      info.appendChild(name);
      info.appendChild(sizeEl);
      el.appendChild(swatch);
      el.appendChild(info);

      el.addEventListener('click', function() {
        selectItem(item);
      });

      paletteList.appendChild(el);
    });
  }

  function selectItem(item) {
    if (currentMode === 'block') {
      // Block mode: select/deselect block type
      var blockDef = findBlock(item.id);
      if (selectedBlock && selectedBlock.id === item.id) {
        selectedBlock = null;
      } else {
        selectedBlock = blockDef;
        deleteMode = false;
        deleteModeBtn.classList.remove('active');
      }
      selectedItem = selectedBlock ? item : null;
    } else {
      if (selectedItem && selectedItem.id === item.id) {
        selectedItem = null;
        currentRotation = 0;
      } else {
        selectedItem = item;
        currentRotation = 0;
        deleteMode = false;
        deleteModeBtn.classList.remove('active');
      }
    }
    updatePaletteSelection();
  }

  function updatePaletteSelection() {
    var items = paletteList.querySelectorAll('.sim-palette-item');
    var activeId = (currentMode === 'block') ? (selectedBlock ? selectedBlock.id : null) : (selectedItem ? selectedItem.id : null);
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('selected', items[i].dataset.itemId === activeId);
    }
  }

  // === Stats ===
  function updateStats() {
    var occupied = 0;
    var total = gridRows * gridCols;
    var placements = {};
    var furnitureCount = 0;

    for (var r = 0; r < gridRows; r++) {
      for (var c = 0; c < gridCols; c++) {
        if (gridState[r][c]) {
          occupied++;
          var s = gridState[r][c];
          var key = s.originRow + '-' + s.originCol;
          if (!placements[key]) {
            placements[key] = true;
            var item = findItem(s.itemId);
            if (item && item.category === 'furniture') furnitureCount++;
          }
        }
      }
    }

    var itemCount = Object.keys(placements).length;
    itemCountEl.textContent = itemCount;
    usageEl.textContent = total > 0 ? Math.round(occupied / total * 100) : 0;

    if (currentMode === 'room') {
      furnitureStatusEl.style.display = 'inline';
      if (furnitureCount >= 3) {
        furnitureStatusEl.innerHTML = ' | <span class="furniture-ok">🎉 ポケモンが住めるよ！（家具' + furnitureCount + '個）</span>';
      } else {
        furnitureStatusEl.innerHTML = ' | 家具: ' + furnitureCount + '/3';
      }
    } else {
      furnitureStatusEl.style.display = 'none';
    }
  }

  // === Save / Load ===
  function getStorageKey() {
    return 'pocoapokemon-building-sim-' + currentMode;
  }

  function saveLayout() {
    var placements = [];
    var visited = {};
    for (var r = 0; r < gridRows; r++) {
      for (var c = 0; c < gridCols; c++) {
        var s = gridState[r][c];
        if (s) {
          var key = s.originRow + '-' + s.originCol;
          if (!visited[key]) {
            visited[key] = true;
            placements.push({ itemId: s.itemId, row: s.originRow, col: s.originCol, rotation: s.rotation });
          }
        }
      }
    }

    var data = {
      version: 1,
      mode: currentMode,
      cols: gridCols,
      rows: gridRows,
      placements: placements
    };

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
      alert('レイアウトを保存しました！（' + placements.length + '個のアイテム）');
    } catch (e) {
      alert('保存に失敗しました。ブラウザのストレージが一杯の可能性があります。');
    }
  }

  function loadLayout() {
    var raw = localStorage.getItem(getStorageKey());
    if (!raw) {
      alert('保存されたレイアウトがありません。');
      return;
    }

    try {
      var data = JSON.parse(raw);
      if (data.version !== 1) throw new Error('Unknown version');

      gridCols = data.cols;
      gridRows = data.rows;
      initGrid(gridCols, gridRows);

      // Update UI
      if (currentMode === 'town') {
        gridSizeSelect.value = String(gridCols);
      } else {
        roomWInput.value = String(gridCols);
        roomHInput.value = String(gridRows);
      }

      data.placements.forEach(function(p) {
        var item = findItem(p.itemId);
        if (item && canPlace(p.row, p.col, item, p.rotation)) {
          placeItem(p.row, p.col, item, p.rotation);
        }
      });

      renderGrid();
      updateStats();
      alert('レイアウトを読み込みました！（' + data.placements.length + '個のアイテム）');
    } catch (e) {
      alert('データの読み込みに失敗しました。');
    }
  }

  // === Texture Loader ===
  var textureCache = {};  // filename -> THREE.Texture | null (null = failed/not found)
  var textureLoader = null;
  var TEXTURE_PATH = 'textures/';

  function loadBlockTexture(filename, onLoad) {
    if (!filename) { onLoad(null); return; }
    if (textureCache[filename] !== undefined) { onLoad(textureCache[filename]); return; }
    if (!textureLoader) textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      TEXTURE_PATH + filename,
      function(tex) {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        textureCache[filename] = tex;
        onLoad(tex);
      },
      undefined,
      function() {
        // Texture not found — use fallback color
        textureCache[filename] = null;
        onLoad(null);
      }
    );
  }

  function getBlockMaterial(blockDef) {
    var colorInt = parseInt(blockDef.colorTop.replace('#', ''), 16);
    var matOpts = { color: 0xffffff };
    if (blockDef.transparent) { matOpts.opacity = 0.6; matOpts.transparent = true; }

    var texFile = blockDef.texture;
    var tex = texFile ? textureCache[texFile] : undefined;
    if (tex && tex.image) {
      matOpts.map = tex;
      return new THREE.MeshLambertMaterial(matOpts);
    }

    // Fallback to solid color
    matOpts.color = colorInt;
    return new THREE.MeshLambertMaterial(matOpts);
  }

  // Auto-assign texture filename from block ID if not explicitly set
  function ensureTextureNames() {
    for (var i = 0; i < BUILDING_SIM_BLOCKS.length; i++) {
      if (!BUILDING_SIM_BLOCKS[i].texture) {
        BUILDING_SIM_BLOCKS[i].texture = BUILDING_SIM_BLOCKS[i].id + '.png';
      }
    }
  }

  // Preload all textures, then re-render
  function preloadTextures(callback) {
    ensureTextureNames();
    var pending = 0;
    var seen = {};
    for (var i = 0; i < BUILDING_SIM_BLOCKS.length; i++) {
      var tex = BUILDING_SIM_BLOCKS[i].texture;
      if (tex && !seen[tex]) {
        seen[tex] = true;
        pending++;
        loadBlockTexture(tex, function() {
          pending--;
          if (pending === 0 && callback) callback();
        });
      }
    }
    if (pending === 0 && callback) callback();
  }

  // === Three.js WebGL Rendering ===
  var threeScene, threeCamera, threeRenderer;
  var camTheta = Math.PI / 4, camPhi = Math.PI / 4, camDist = 10;
  var camTarget = new THREE.Vector3(0, 0, 0);
  var camDragging = false, camDragStart = { x: 0, y: 0 };

  // Palette 3D preview (shared offscreen renderer)
  var previewRenderer = null;
  var previewScene = null;
  var previewCamera = null;
  var previewCache = {}; // blockId -> dataURL

  function initPreviewRenderer() {
    if (previewRenderer) return;
    previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    previewRenderer.setSize(64, 64);
    previewRenderer.setPixelRatio(2);

    previewScene = new THREE.Scene();
    var ambient = new THREE.AmbientLight(0xffffff, 0.6);
    previewScene.add(ambient);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 3, 1);
    previewScene.add(dirLight);

    previewCamera = new THREE.PerspectiveCamera(35, 1, 0.1, 10);
    previewCamera.position.set(1.8, 1.4, 1.8);
    previewCamera.lookAt(0, 0, 0);
  }

  function renderBlockPreview(blockDef) {
    if (previewCache[blockDef.id]) return previewCache[blockDef.id];
    initPreviewRenderer();

    // Clear previous meshes
    while (previewScene.children.length > 2) {
      previewScene.remove(previewScene.children[2]);
    }

    var shape = blockDef.shape || 'cube';
    var geometry = createBlockGeometry(shape);
    var material = getBlockMaterial(blockDef);
    var mesh = new THREE.Mesh(geometry, material);

    var edgesGeo = new THREE.EdgesGeometry(geometry);
    var edgesMat = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true });
    mesh.add(new THREE.LineSegments(edgesGeo, edgesMat));

    previewScene.add(mesh);
    previewRenderer.render(previewScene, previewCamera);

    var dataURL = previewRenderer.domElement.toDataURL();
    previewCache[blockDef.id] = dataURL;
    return dataURL;
  }

  function updateCameraPosition() {
    if (!threeCamera) return;
    threeCamera.position.set(
      camTarget.x + camDist * Math.sin(camPhi) * Math.cos(camTheta),
      camTarget.y + camDist * Math.cos(camPhi),
      camTarget.z + camDist * Math.sin(camPhi) * Math.sin(camTheta)
    );
    threeCamera.lookAt(camTarget);
  }
  var blockMeshes = {}; // "x,y,z" -> THREE.Mesh
  var groundMeshes = []; // ground plane meshes
  var ghostMesh = null;
  var raycaster, mouse;
  var threeInitialized = false;
  var threeAnimId = null;
  var groundPlane = null; // ground mesh for raycasting

  function getThemeBgColor() {
    var theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? 0x1e1e2e : 0xf0f0f5;
  }

  function initThree() {
    if (threeInitialized) return;

    // Clear any existing canvas
    var existingCanvas = isoView.querySelector('canvas');
    if (existingCanvas) existingCanvas.remove();

    // Scene
    threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(getThemeBgColor());

    // Lights
    var ambient = new THREE.AmbientLight(0xffffff, 0.6);
    threeScene.add(ambient);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    threeScene.add(dirLight);

    // Camera
    var w = isoView.clientWidth || 400;
    var h = isoView.clientHeight || 400;
    threeCamera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    threeCamera.position.set(blockBaseW * 0.8, blockBaseW * 0.8, blockBaseW * 0.8);
    threeCamera.lookAt(0, 0, 0);

    // Renderer - size to container
    threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeRenderer.setClearColor(getThemeBgColor());
    threeRenderer.domElement.style.width = '100%';
    threeRenderer.domElement.style.height = '100%';
    isoView.appendChild(threeRenderer.domElement);
    // Set actual pixel size from container
    w = isoView.clientWidth || 400;
    h = isoView.clientHeight || 400;
    threeRenderer.setSize(w, h, false);
    threeCamera.aspect = w / h;
    threeCamera.updateProjectionMatrix();

    // Camera orbit (self-implemented, no OrbitControls needed)
    updateCameraPosition();
    var canvas = threeRenderer.domElement;
    canvas.addEventListener('mousedown', function(e) {
      // Middle click, or right click = camera rotate
      if (e.button === 1 || e.button === 2) {
        camDragging = true; camDragStart = { x: e.clientX, y: e.clientY, theta: camTheta, phi: camPhi }; e.preventDefault();
      }
    });
    canvas.addEventListener('contextmenu', function(e) { /* handled separately */ });
    document.addEventListener('mousemove', function(e) {
      if (!camDragging) return;
      camTheta = camDragStart.theta - (e.clientX - camDragStart.x) * 0.01;
      camPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, camDragStart.phi - (e.clientY - camDragStart.y) * 0.01));
      updateCameraPosition();
    });
    document.addEventListener('mouseup', function() { camDragging = false; });
    canvas.addEventListener('wheel', function(e) {
      e.preventDefault();
      camDist = Math.max(3, Math.min(80, camDist + e.deltaY * 0.01));
      updateCameraPosition();
    }, { passive: false });
    // Touch orbit
    var touchStart = null;
    canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length === 2) { touchStart = { x: (e.touches[0].clientX + e.touches[1].clientX)/2, y: (e.touches[0].clientY + e.touches[1].clientY)/2, theta: camTheta, phi: camPhi }; }
    }, { passive: true });
    canvas.addEventListener('touchmove', function(e) {
      if (touchStart && e.touches.length === 2) {
        var mx = (e.touches[0].clientX + e.touches[1].clientX)/2;
        var my = (e.touches[0].clientY + e.touches[1].clientY)/2;
        camTheta = touchStart.theta - (mx - touchStart.x) * 0.01;
        camPhi = Math.max(0.1, Math.min(Math.PI/2-0.05, touchStart.phi - (my - touchStart.y) * 0.01));
        updateCameraPosition();
      }
    }, { passive: true });
    canvas.addEventListener('touchend', function() { touchStart = null; });

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Resize observer
    var resizeObserver = new ResizeObserver(function() {
      var cw = isoView.clientWidth || 400;
      var ch = isoView.clientHeight || 400;
      threeCamera.aspect = cw / ch;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(cw, ch, false);
    });
    resizeObserver.observe(isoView);
    // Store for cleanup
    isoView._resizeObserver = resizeObserver;

    // Event listeners on canvas
    threeRenderer.domElement.addEventListener('click', handleIsoClick);
    threeRenderer.domElement.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      handleIsoClick(e);
    });
    threeRenderer.domElement.addEventListener('mousemove', handleIsoHover);
    threeRenderer.domElement.addEventListener('mousedown', handleIsoMouseDown);
    document.addEventListener('mousemove', handleIsoPaintMove);
    document.addEventListener('mouseup', handleIsoPaintEnd);

    // Touch events for paint
    threeRenderer.domElement.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      var fakeEvent = { clientX: touch.clientX, clientY: touch.clientY, button: 0, target: threeRenderer.domElement, preventDefault: function(){} };
      handleIsoMouseDown(fakeEvent);
    }, { passive: true });
    threeRenderer.domElement.addEventListener('touchmove', function(e) {
      var touch = e.touches[0];
      handleIsoPaintMove({ clientX: touch.clientX, clientY: touch.clientY, touches: e.touches });
    }, { passive: true });
    threeRenderer.domElement.addEventListener('touchend', handleIsoPaintEnd);

    threeInitialized = true;

    // Animation loop
    function animate() {
      threeAnimId = requestAnimationFrame(animate);
      threeRenderer.render(threeScene, threeCamera);
    }
    animate();
  }

  function disposeThree() {
    if (!threeInitialized) return;
    if (threeAnimId) {
      cancelAnimationFrame(threeAnimId);
      threeAnimId = null;
    }
    if (isoView._resizeObserver) {
      isoView._resizeObserver.disconnect();
      delete isoView._resizeObserver;
    }
    if (threeRenderer) {
      threeRenderer.domElement.remove();
      threeRenderer.dispose();
      threeRenderer = null;
    }
    threeScene = null;
    threeCamera = null;
    // camera cleaned up
    blockMeshes = {};
    groundMeshes = [];
    ghostMesh = null;
    groundPlane = null;
    threeInitialized = false;
  }

  function renderBlockView() {
    if (!threeInitialized) return;

    // Remove all existing block meshes
    var keys = Object.keys(blockMeshes);
    for (var i = 0; i < keys.length; i++) {
      var m = blockMeshes[keys[i]];
      threeScene.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
      // Remove edge children
      for (var c = m.children.length - 1; c >= 0; c--) {
        var child = m.children[c];
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    }
    blockMeshes = {};

    // Remove ground meshes
    for (var g = 0; g < groundMeshes.length; g++) {
      threeScene.remove(groundMeshes[g]);
      if (groundMeshes[g].geometry) groundMeshes[g].geometry.dispose();
      if (groundMeshes[g].material) groundMeshes[g].material.dispose();
    }
    groundMeshes = [];
    groundPlane = null;

    // Remove ghost
    removeBlockGhost();

    // Create ground plane
    var groundGeo = new THREE.PlaneGeometry(blockBaseW, blockBaseD);
    var groundMat = new THREE.MeshLambertMaterial({ color: 0x444466, side: THREE.DoubleSide });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 0);
    ground.userData.isGround = true;
    threeScene.add(ground);
    groundMeshes.push(ground);
    groundPlane = ground;

    // Grid lines
    var gridMax = Math.max(blockBaseW, blockBaseD);
    var gridHelper = new THREE.GridHelper(gridMax, gridMax, 0x666688, 0x555577);
    gridHelper.position.set(0, 0.001, 0); // slightly above ground
    threeScene.add(gridHelper);
    groundMeshes.push(gridHelper);

    // Render blocks
    var bKeys = Object.keys(blockGrid);
    for (var bi = 0; bi < bKeys.length; bi++) {
      var p = parseBlockKey(bKeys[bi]);
      if (activeLayer >= 0 && p.y > activeLayer) continue;
      addBlockMesh(p.x, p.y, p.z, blockGrid[bKeys[bi]]);
    }

    // Update camera to fit grid — consider building height
    var maxY = 0;
    var bks = Object.keys(blockGrid);
    for (var bi2 = 0; bi2 < bks.length; bi2++) {
      var py = parseBlockKey(bks[bi2]).y;
      if (py > maxY) maxY = py;
    }
    camTarget.set(0, maxY / 2, 0);
    var gridSpan = Math.max(blockBaseW, blockBaseD);
    camDist = Math.max(gridSpan * 1.5 + 2, (maxY + 1) * 1.2);
    updateCameraPosition();

    // Update theme background
    if (threeRenderer) {
      threeRenderer.setClearColor(getThemeBgColor());
    }
    if (threeScene) {
      threeScene.background = new THREE.Color(getThemeBgColor());
    }
  }

  function createBlockGeometry(shape, blockH) {
    var h = blockH || 1;
    if (shape === 'cube' || !shape) {
      return new THREE.BoxGeometry(1, h, 1);
    }

    // All custom geometries use center origin: (-0.5,-0.5,-0.5) to (0.5,0.5,0.5)
    // matching BoxGeometry(1,1,1)
    var H = 0.5; // half size

    if (shape === 'slope') {
      // Wedge: full height at back (z=-H), zero at front (z=+H)
      var geo = new THREE.BufferGeometry();
      var verts = new Float32Array([
        // Bottom
        -H,-H,-H, H,-H,-H, H,-H,H,   -H,-H,-H, H,-H,H, -H,-H,H,
        // Back face (full height at z=-H)
        -H,-H,-H, -H,H,-H, H,H,-H,   -H,-H,-H, H,H,-H, H,-H,-H,
        // Slope surface (top-back to bottom-front)
        -H,H,-H, -H,-H,H, H,-H,H,    -H,H,-H, H,-H,H, H,H,-H,
        // Left triangle
        -H,-H,-H, -H,-H,H, -H,H,-H,
        // Right triangle
        H,-H,-H, H,H,-H, H,-H,H
      ]);
      geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      geo.computeVertexNormals();
      return geo;
    }

    if (shape === 'triangle') {
      // Triangular prism: peak at (0, H, z)
      var geo = new THREE.BufferGeometry();
      var verts = new Float32Array([
        // Front triangle (z=+H)
        -H,-H,H, H,-H,H, 0,H,H,
        // Back triangle (z=-H)
        -H,-H,-H, 0,H,-H, H,-H,-H,
        // Bottom
        -H,-H,-H, H,-H,-H, H,-H,H,   -H,-H,-H, H,-H,H, -H,-H,H,
        // Left slope
        -H,-H,-H, -H,-H,H, 0,H,H,    -H,-H,-H, 0,H,H, 0,H,-H,
        // Right slope
        H,-H,-H, 0,H,-H, 0,H,H,      H,-H,-H, 0,H,H, H,-H,H
      ]);
      geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      geo.computeVertexNormals();
      return geo;
    }

    if (shape === 'outcorner') {
      // Quarter pyramid
      var geo = new THREE.BufferGeometry();
      var verts = new Float32Array([
        // Bottom
        -H,-H,-H, H,-H,-H, H,-H,H,   -H,-H,-H, H,-H,H, -H,-H,H,
        // Back wall triangle
        -H,-H,-H, -H,H,-H, H,-H,-H,
        // Left wall triangle
        -H,-H,-H, -H,-H,H, -H,H,-H,
        // Slope face
        H,-H,-H, -H,H,-H, -H,-H,H,   H,-H,-H, -H,-H,H, H,-H,H
      ]);
      geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      geo.computeVertexNormals();
      return geo;
    }

    if (shape === 'incorner') {
      // 3/4 block (basically a full cube - simple enough)
      return new THREE.BoxGeometry(1, 1, 1);
    }

    // Default: cube
    return new THREE.BoxGeometry(1, 1, 1);
  }

  function addBlockMesh(x, y, z, data) {
    var blockDef = findBlock(data.blockType);
    if (!blockDef) return null;

    var shape = blockDef.shape || 'cube';
    var bh = blockDef.blockH || 1;
    var geometry = createBlockGeometry(shape, bh);

    var material = getBlockMaterial(blockDef);
    var mesh = new THREE.Mesh(geometry, material);

    // Position: grid (x,y,z) -> world. Tall blocks anchor at bottom.
    mesh.position.set(
      x - blockBaseW / 2 + 0.5,
      y + bh / 2,
      z - blockBaseD / 2 + 0.5
    );

    // Rotation
    mesh.rotation.y = (data.rotation || 0) * Math.PI / 2;

    // Store grid coords for raycasting lookup
    mesh.userData.gridX = x;
    mesh.userData.gridY = y;
    mesh.userData.gridZ = z;
    mesh.userData.isBlock = true;

    // Edges
    var edgesGeo = new THREE.EdgesGeometry(geometry);
    var edgesMat = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.15, transparent: true });
    var edges = new THREE.LineSegments(edgesGeo, edgesMat);
    mesh.add(edges);

    threeScene.add(mesh);
    blockMeshes[blockKey(x, y, z)] = mesh;
    return mesh;
  }

  function showBlockGhost(x, y, z) {
    removeBlockGhost();
    if (!selectedBlock || deleteMode) return;
    if (x < 0 || x >= blockBaseW || z < 0 || z >= blockBaseD || y < 0 || y >= blockMaxH) return;
    if (getBlock(x, y, z)) return;

    var blockDef = selectedBlock;
    var shape = blockDef.shape || 'cube';
    var geometry = createBlockGeometry(shape);
    var colorInt = parseInt(blockDef.colorTop.replace('#', ''), 16);
    var material = new THREE.MeshLambertMaterial({ color: colorInt, opacity: 0.3, transparent: true });
    ghostMesh = new THREE.Mesh(geometry, material);
    ghostMesh.position.set(
      x - blockBaseW / 2 + 0.5,
      y + 0.5,
      z - blockBaseD / 2 + 0.5
    );
    ghostMesh.userData.isGhost = true;
    threeScene.add(ghostMesh);
  }

  function removeBlockGhost() {
    if (ghostMesh) {
      threeScene.remove(ghostMesh);
      if (ghostMesh.geometry) ghostMesh.geometry.dispose();
      if (ghostMesh.material) ghostMesh.material.dispose();
      ghostMesh = null;
    }
  }

  // Convert face normal (THREE.Vector3) to grid offset
  function faceToAdjacent(normal) {
    var dx = 0, dy = 0, dz = 0;
    var ax = Math.abs(normal.x), ay = Math.abs(normal.y), az = Math.abs(normal.z);
    if (ax >= ay && ax >= az) {
      dx = normal.x > 0 ? 1 : -1;
    } else if (ay >= ax && ay >= az) {
      dy = normal.y > 0 ? 1 : -1;
    } else {
      dz = normal.z > 0 ? 1 : -1;
    }
    return { dx: dx, dy: dy, dz: dz };
  }

  // Get mouse position relative to canvas for raycasting
  function getMouseNDC(e) {
    if (!threeRenderer) return null;
    var canvas = threeRenderer.domElement;
    var rect = canvas.getBoundingClientRect();
    var cx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    var cy = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    return new THREE.Vector2(cx, cy);
  }

  // Perform raycast and return { type, gridX, gridY, gridZ } or null
  function raycastBlock(e) {
    var ndc = getMouseNDC(e);
    if (!ndc || !raycaster || !threeCamera || !threeScene) return null;
    raycaster.setFromCamera(ndc, threeCamera);

    // Collect all meshes (blocks + ground)
    var targets = [];
    var bKeys = Object.keys(blockMeshes);
    for (var i = 0; i < bKeys.length; i++) {
      targets.push(blockMeshes[bKeys[i]]);
    }
    if (groundPlane) targets.push(groundPlane);

    var intersects = raycaster.intersectObjects(targets, false);
    if (intersects.length === 0) return null;

    var hit = intersects[0];
    var obj = hit.object;

    if (obj.userData.isGround) {
      // Hit ground plane
      var gx = Math.floor(hit.point.x + blockBaseW / 2);
      var gz = Math.floor(hit.point.z + blockBaseD / 2);
      gx = Math.max(0, Math.min(blockBaseW - 1, gx));
      gz = Math.max(0, Math.min(blockBaseD - 1, gz));
      return { type: 'ground', gridX: gx, gridY: 0, gridZ: gz };
    }

    if (obj.userData.isBlock) {
      var bx = obj.userData.gridX;
      var by = obj.userData.gridY;
      var bz = obj.userData.gridZ;
      // Get face normal
      var normal = hit.face.normal.clone();
      // Transform normal from object space to world space
      normal.transformDirection(obj.matrixWorld);
      var adj = faceToAdjacent(normal);
      return {
        type: 'block',
        gridX: bx, gridY: by, gridZ: bz,
        adjX: bx + adj.dx, adjY: by + adj.dy, adjZ: bz + adj.dz
      };
    }

    return null;
  }

  // === Layer Controls ===
  function renderLayerButtons() {
    layerBar.innerHTML = '';
    var layerCounts = {};
    var maxY = 0;
    var keys = Object.keys(blockGrid);
    for (var i = 0; i < keys.length; i++) {
      var p = parseBlockKey(keys[i]);
      layerCounts[p.y] = (layerCounts[p.y] || 0) + 1;
      if (p.y > maxY) maxY = p.y;
    }

    var allBtn = document.createElement('button');
    allBtn.className = 'sim-layer-btn' + (activeLayer === -1 ? ' active' : '');
    allBtn.textContent = 'ALL';
    allBtn.addEventListener('click', function() { activeLayer = -1; renderBlockView(); renderLayerButtons(); });
    layerBar.appendChild(allBtn);

    var showLayers = Math.max(3, maxY + 2);
    for (var ly = 0; ly < showLayers && ly < blockMaxH; ly++) {
      (function(layer) {
        var btn = document.createElement('button');
        btn.className = 'sim-layer-btn' + (activeLayer === layer ? ' active' : '');
        var label = layer === 0 ? 'G' : layer + 'F';
        var cnt = layerCounts[layer] || 0;
        btn.textContent = label + (cnt ? '(' + cnt + ')' : '');
        btn.addEventListener('click', function() { activeLayer = layer; renderBlockView(); renderLayerButtons(); });
        layerBar.appendChild(btn);
      })(ly);
    }
  }

  // === Block Stats ===
  function updateBlockStats() {
    var count = 0;
    var maxY = 0;
    var keys = Object.keys(blockGrid);
    for (var i = 0; i < keys.length; i++) {
      var b = blockGrid[keys[i]];
      if (b.blockType !== '__occupied') count++;
      var p = parseBlockKey(keys[i]);
      if (p.y + 1 > maxY) maxY = p.y + 1;
    }
    document.getElementById('simStatsLabel').textContent = 'ブロック';
    document.getElementById('simStatsUnit').textContent = '個 | 高さ: ';
    document.getElementById('simStatsUnit2').textContent = '';
    itemCountEl.textContent = count;
    usageEl.textContent = maxY;
    furnitureStatusEl.style.display = 'none';
  }

  function resetStatsLabels() {
    document.getElementById('simStatsLabel').textContent = 'アイテム';
    document.getElementById('simStatsUnit').textContent = '個 | 使用率: ';
    document.getElementById('simStatsUnit2').textContent = '%';
  }

  // === Block Interaction ===
  // ブロック1個分の配置処理（ミラー対応）。changed=trueなら配置が発生
  function placeBlockAt(x, y, z) {
    if (x < 0 || x >= blockBaseW || z < 0 || z >= blockBaseD || y < 0 || y >= blockMaxH) return false;
    if (!selectedBlock || getBlock(x, y, z)) return false;
    var bh = selectedBlock.blockH || 1;
    // Check all vertical cells the block would occupy
    for (var dy = 0; dy < bh; dy++) {
      if (y + dy >= blockMaxH || getBlock(x, y + dy, z)) return false;
    }
    var positions = getMirrorPositions(x, y, z);
    var placed = false;
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      if (p.x < 0 || p.x >= blockBaseW || p.z < 0 || p.z >= blockBaseD || p.y < 0) continue;
      // Check all cells for this tall block at mirrored position
      var canPlace = true;
      for (var dy = 0; dy < bh; dy++) {
        if (p.y + dy >= blockMaxH || getBlock(p.x, p.y + dy, p.z)) { canPlace = false; break; }
      }
      if (!canPlace) continue;
      // Place the main block at bottom position
      setBlock(p.x, p.y, p.z, { blockType: selectedBlock.id, rotation: currentRotation });
      // Mark upper cells as occupied (reference to main block)
      for (var dy = 1; dy < bh; dy++) {
        setBlock(p.x, p.y + dy, p.z, { blockType: '__occupied', parentY: p.y });
      }
      placed = true;
    }
    return placed;
  }

  function handleIsoClick(e) {
    if (isPainting) return;
    var hit = raycastBlock(e);
    if (!hit) return;

    if (hit.type === 'ground') {
      if (deleteMode) return;
      if (!selectedBlock) return;
      pushBlockUndo();
      if (placeBlockAt(hit.gridX, 0, hit.gridZ)) {
        renderBlockView(); updateBlockStats(); renderLayerButtons();
      }
      return;
    }

    if (hit.type === 'block') {
      if (deleteMode || e.button === 2) {
        // If clicking an __occupied cell, redirect to parent
        var targetY = hit.gridY;
        var targetBlock = getBlock(hit.gridX, hit.gridY, hit.gridZ);
        if (targetBlock && targetBlock.blockType === '__occupied') {
          targetY = targetBlock.parentY;
        }
        var delPositions = getMirrorPositions(hit.gridX, targetY, hit.gridZ);
        pushBlockUndo();
        for (var d = 0; d < delPositions.length; d++) {
          var dp = delPositions[d];
          var blk = getBlock(dp.x, dp.y, dp.z);
          if (blk) {
            var bDef = findBlock(blk.blockType);
            var bh = (bDef && bDef.blockH) || 1;
            delBlock(dp.x, dp.y, dp.z);
            // Also delete occupied cells above
            for (var dy = 1; dy < bh; dy++) {
              delBlock(dp.x, dp.y + dy, dp.z);
            }
          }
        }
        renderBlockView(); updateBlockStats(); renderLayerButtons();
        return;
      }

      if (!selectedBlock) return;
      pushBlockUndo();
      if (placeBlockAt(hit.adjX, hit.adjY, hit.adjZ)) {
        renderBlockView(); updateBlockStats(); renderLayerButtons();
      }
    }
  }

  // === ドラッグ連続配置 ===
  function handleIsoMouseDown(e) {
    if (deleteMode || !selectedBlock) return;
    if (e.button === 2) return;

    var hit = raycastBlock(e);
    if (!hit) return;

    var targetY = -1;
    if (hit.type === 'ground') {
      targetY = 0;
    } else if (hit.type === 'block') {
      targetY = hit.adjY;
    }

    isPainting = true;
    paintY = targetY;
    paintUndoPushed = true; // handleIsoClick already pushed undo
  }

  function handleIsoPaintMove(e) {
    if (!isPainting || !selectedBlock || deleteMode) return;

    var clientX = e.clientX;
    var clientY = e.clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    var hit = raycastBlock({ clientX: clientX, clientY: clientY });
    if (!hit) return;

    var tx = -1, tz = -1, ty = paintY;

    if (hit.type === 'ground' && paintY === 0) {
      tx = hit.gridX;
      tz = hit.gridZ;
    } else if (hit.type === 'block') {
      if (hit.adjY !== paintY) return; // only same height
      tx = hit.adjX;
      tz = hit.adjZ;
      ty = hit.adjY;
    }

    if (tx < 0 || tz < 0) return;
    if (getBlock(tx, ty, tz)) return;

    if (placeBlockAt(tx, ty, tz)) {
      renderBlockView(); updateBlockStats(); renderLayerButtons();
    }
  }

  function handleIsoPaintEnd() {
    isPainting = false;
    paintY = -1;
    paintUndoPushed = false;
  }

  function handleIsoHover(e) {
    removeBlockGhost();
    if (!selectedBlock || deleteMode) return;

    var hit = raycastBlock(e);
    if (!hit) return;

    if (hit.type === 'ground') {
      showBlockGhost(hit.gridX, 0, hit.gridZ);
    } else if (hit.type === 'block') {
      showBlockGhost(hit.adjX, hit.adjY, hit.adjZ);
    }
  }

  // Block save/load
  function saveBlockLayout() {
    var blocks = [];
    var keys = Object.keys(blockGrid);
    for (var i = 0; i < keys.length; i++) {
      var p = parseBlockKey(keys[i]);
      blocks.push({ x: p.x, y: p.y, z: p.z, type: blockGrid[keys[i]].blockType, rotation: blockGrid[keys[i]].rotation });
    }
    var data = { version: 1, mode: 'block', baseW: blockBaseW, baseD: blockBaseD, blocks: blocks };
    try {
      localStorage.setItem('pocoapokemon-building-sim-block', JSON.stringify(data));
      alert('ブロック建築を保存しました！（' + blocks.length + '個）');
    } catch (e) { alert('保存に失敗しました。'); }
  }

  function loadBlockLayout() {
    var raw = localStorage.getItem('pocoapokemon-building-sim-block');
    if (!raw) { alert('保存されたブロック建築がありません。'); return; }
    try {
      var data = JSON.parse(raw);
      blockBaseW = data.baseW;
      blockBaseD = data.baseD;
      blockWInput.value = blockBaseW;
      blockDInput.value = blockBaseD;
      blockGrid = {};
      for (var i = 0; i < data.blocks.length; i++) {
        var b = data.blocks[i];
        setBlock(b.x, b.y, b.z, { blockType: b.type, rotation: b.rotation || 0 });
      }
      renderBlockView();
      updateBlockStats();
      renderLayerButtons();
      alert('ブロック建築を読み込みました！（' + data.blocks.length + '個）');
    } catch (e) { alert('読み込みに失敗しました。'); }
  }

  // === Blueprint Loading ===
  function showBlueprintDialog() {
    if (typeof BUILDING_SIM_BLUEPRINTS === 'undefined' || !BUILDING_SIM_BLUEPRINTS.length) {
      alert('ブループリントデータがありません。');
      return;
    }
    // Remove existing modal if any
    var existing = document.getElementById('blueprintModal');
    if (existing) existing.remove();

    // Create modal overlay
    var overlay = document.createElement('div');
    overlay.id = 'blueprintModal';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-card,#fff);border-radius:12px;padding:24px;max-width:480px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.3);';

    var title = document.createElement('h3');
    title.textContent = '📐 設計図を選択';
    title.style.cssText = 'margin:0 0 16px 0;font-size:18px;color:var(--text-primary,#333);';
    modal.appendChild(title);

    var list = document.createElement('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

    for (var i = 0; i < BUILDING_SIM_BLUEPRINTS.length; i++) {
      (function(idx) {
        var bp = BUILDING_SIM_BLUEPRINTS[idx];
        var card = document.createElement('button');
        card.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid var(--border-color,#ddd);border-radius:10px;background:var(--bg-primary,#f9f9f9);cursor:pointer;text-align:left;transition:all 0.15s;width:100%;';
        card.onmouseenter = function() { card.style.borderColor = 'var(--accent,#667eea)'; card.style.background = 'var(--bg-hover,#f0f0ff)'; };
        card.onmouseleave = function() { card.style.borderColor = 'var(--border-color,#ddd)'; card.style.background = 'var(--bg-primary,#f9f9f9)'; };

        var icon = document.createElement('span');
        icon.textContent = bp.icon;
        icon.style.cssText = 'font-size:32px;flex-shrink:0;';

        var info = document.createElement('div');
        info.style.cssText = 'flex:1;min-width:0;';

        var name = document.createElement('div');
        name.textContent = bp.name;
        name.style.cssText = 'font-size:15px;font-weight:700;color:var(--text-primary,#333);margin-bottom:4px;';

        var desc = document.createElement('div');
        desc.textContent = bp.desc || (bp.baseW + '×' + bp.baseD + ' / ' + bp.blocks.length + 'ブロック');
        desc.style.cssText = 'font-size:12px;color:var(--text-secondary,#888);line-height:1.5;';

        var meta = document.createElement('div');
        meta.textContent = bp.baseW + '×' + bp.baseD + ' | ' + bp.blocks.length + '個';
        meta.style.cssText = 'font-size:11px;color:var(--accent,#667eea);font-weight:600;margin-top:4px;';

        info.appendChild(name);
        info.appendChild(desc);
        info.appendChild(meta);
        card.appendChild(icon);
        card.appendChild(info);

        card.onclick = function() {
          overlay.remove();
          loadBlueprint(bp);
        };
        list.appendChild(card);
      })(i);
    }
    modal.appendChild(list);

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ 閉じる';
    closeBtn.style.cssText = 'display:block;margin:16px auto 0;padding:8px 24px;border:1px solid var(--border-color,#ddd);border-radius:8px;background:var(--bg-card,#fff);color:var(--text-secondary,#888);cursor:pointer;font-size:13px;';
    closeBtn.onclick = function() { overlay.remove(); };
    modal.appendChild(closeBtn);

    overlay.appendChild(modal);
    // Close on overlay click
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  function loadBlueprint(bp) {
    // Auto-accept blueprint load (confirm removed for preview compatibility)
    blockBaseW = bp.baseW;
    blockBaseD = bp.baseD;
    blockWInput.value = blockBaseW;
    blockDInput.value = blockBaseD;
    blockGrid = {};
    blockUndoStack = [];
    for (var i = 0; i < bp.blocks.length; i++) {
      var bl = bp.blocks[i];
      setBlock(bl.x, bl.y, bl.z, { blockType: bl.type, rotation: bl.rotation || 0 });
    }
    if (threeRenderer) {
      disposeThree();
      initThree();
    }
    renderBlockView();
    updateBlockStats();
    renderLayerButtons();
    // Alert removed for preview compatibility
    console.log(bp.icon + ' 「' + bp.name + '」を読み込みました！（' + bp.blocks.length + '個）');
  }

  // === Mode Switch ===
  function switchMode(mode) {
    if (mode === currentMode) return;

    // Check if current mode has content
    var currentHasContent = (currentMode === 'block') ? hasBlocks() : hasItems();
    // Auto-accept mode switch (confirm removed for preview compatibility)
    if (false) {
      return;
    }

    currentMode = mode;
    try { localStorage.setItem('pocoapokemon-building-sim-mode', mode); } catch(e) {}
    selectedItem = null;
    selectedBlock = null;
    currentRotation = 0;
    deleteMode = false;
    deleteModeBtn.classList.remove('active');

    // Update mode buttons
    var btns = document.querySelectorAll('.sim-mode-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].dataset.mode === mode);
    }

    // Hide all mode-specific controls
    gridSizeSelect.style.display = 'none';
    roomWInput.style.display = 'none';
    roomHInput.style.display = 'none';
    roomWLabel.style.display = 'none';
    roomHLabel.style.display = 'none';
    blockWInput.style.display = 'none';
    blockDInput.style.display = 'none';
    blockWLabel.style.display = 'none';
    blockDLabel.style.display = 'none';
    viewRotLBtn.style.display = 'none';
    viewRotRBtn.style.display = 'none';
    document.getElementById('simMirror').style.display = 'none';
    var bpBtn = document.getElementById('simBlueprint');
    if (bpBtn) bpBtn.style.display = 'none';
    gridWrapper.style.display = 'none';
    isoView.style.display = 'none';
    layerBar.style.display = 'none';

    // Dispose Three.js when leaving block mode
    if (mode !== 'block') {
      disposeThree();
    }

    if (mode === 'town') {
      gridSizeSelect.style.display = '';
      gridWrapper.style.display = '';
      var sz = parseInt(gridSizeSelect.value) || 15;
      initGrid(sz, sz);
      renderGrid();
      resetStatsLabels();
      updateStats();
    } else if (mode === 'room') {
      roomWInput.style.display = '';
      roomHInput.style.display = '';
      roomWLabel.style.display = '';
      roomHLabel.style.display = '';
      gridWrapper.style.display = '';
      var rw = parseInt(roomWInput.value) || 5;
      var rh = parseInt(roomHInput.value) || 5;
      initGrid(rw, rh);
      renderGrid();
      resetStatsLabels();
      updateStats();
    } else if (mode === 'block') {
      blockWInput.style.display = '';
      blockDInput.style.display = '';
      blockWLabel.style.display = '';
      blockDLabel.style.display = '';
      document.getElementById('simMirror').style.display = '';
      var bpBtn2 = document.getElementById('simBlueprint');
      if (bpBtn2) bpBtn2.style.display = '';
      mirrorMode = 0;
      isoView.style.display = '';
      layerBar.style.display = 'flex';
      blockBaseW = parseInt(blockWInput.value) || 5;
      blockBaseD = parseInt(blockDInput.value) || 5;
      blockGrid = {};
      blockUndoStack = [];
      activeLayer = -1;
      initThree();
      renderBlockView();
      updateBlockStats();
      renderLayerButtons();
      // Preload textures, then refresh visuals
      preloadTextures(function() {
        previewCache = {}; // Clear preview cache to regenerate with textures
        renderPaletteItems();
        renderBlockView();
      });
    }

    renderPaletteTabs();
    renderPaletteItems();
  }

  // === Grid Events ===
  function handleGridClick(e) {
    var cellEl = e.target.closest('.sim-cell');
    if (!cellEl) return;

    var row = parseInt(cellEl.dataset.row);
    var col = parseInt(cellEl.dataset.col);

    // Delete mode or right-click
    if (deleteMode || e.button === 2) {
      if (gridState[row][col]) {
        pushUndo();
        removeItemAt(row, col);
        renderGrid();
        updateStats();
      }
      return;
    }

    // Place item
    if (selectedItem) {
      if (canPlace(row, col, selectedItem, currentRotation)) {
        pushUndo();
        placeItem(row, col, selectedItem, currentRotation);
        renderGrid();
        updateStats();
      }
    }
  }

  function handleGridMouseover(e) {
    var cellEl = e.target.closest('.sim-cell');
    if (!cellEl) { clearPreview(); return; }
    var row = parseInt(cellEl.dataset.row);
    var col = parseInt(cellEl.dataset.col);
    showPreview(row, col);
  }

  function handleGridMouseout(e) {
    if (!e.relatedTarget || !grid.contains(e.relatedTarget)) {
      clearPreview();
    }
  }

  // === Touch Events (mobile) ===
  function handleTouchStart(e) {
    var cellEl = e.target.closest('.sim-cell');
    if (!cellEl) return;

    var row = parseInt(cellEl.dataset.row);
    var col = parseInt(cellEl.dataset.col);

    // Long press for delete
    if (gridState[row][col]) {
      longPressTimer = setTimeout(function() {
        longPressTimer = null;
        pushUndo();
        removeItemAt(row, col);
        renderGrid();
        updateStats();
      }, 500);
    }
  }

  function handleTouchEnd(e) {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;

      // Short tap = place
      var cellEl = e.target.closest('.sim-cell');
      if (!cellEl) return;
      var row = parseInt(cellEl.dataset.row);
      var col = parseInt(cellEl.dataset.col);

      if (deleteMode) {
        if (gridState[row][col]) {
          pushUndo();
          removeItemAt(row, col);
          renderGrid();
          updateStats();
        }
      } else if (selectedItem) {
        if (canPlace(row, col, selectedItem, currentRotation)) {
          pushUndo();
          placeItem(row, col, selectedItem, currentRotation);
          renderGrid();
          updateStats();
        }
      }
    }
  }

  function handleTouchMove() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  // === Keyboard ===
  function handleKeyDown(e) {
    // R = rotate
    if (e.key === 'r' || e.key === 'R') {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        rotateItem();
      }
    }
    // M = toggle mirror mode (block mode)
    if (currentMode === 'block' && !e.ctrlKey && !e.metaKey) {
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        cycleMirrorMode();
      }
      // Q/E rotate camera 90 degrees
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        camTheta -= Math.PI / 2;
        updateCameraPosition();
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        camTheta += Math.PI / 2;
        updateCameraPosition();
      }
    }
    // Ctrl+Z = undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (currentMode === 'block') popBlockUndo(); else popUndo();
    }
    // Escape = deselect
    if (e.key === 'Escape') {
      selectedItem = null;
      currentRotation = 0;
      deleteMode = false;
      deleteModeBtn.classList.remove('active');
      updatePaletteSelection();
      clearPreview();
    }
    // D = delete mode
    if (e.key === 'd' || e.key === 'D') {
      if (!e.ctrlKey && !e.metaKey) {
        toggleDeleteMode();
      }
    }
  }

  function rotateItem() {
    if (currentMode === 'block') {
      // 0→1→2→3→0 (4方向)
      currentRotation = (currentRotation + 1) % 4;
    } else {
      currentRotation = (currentRotation + 90) % 360;
    }
  }

  function toggleDeleteMode() {
    deleteMode = !deleteMode;
    deleteModeBtn.classList.toggle('active', deleteMode);
    if (deleteMode) {
      selectedItem = null;
      updatePaletteSelection();
    }
  }

  // === Init ===
  function init() {
    // Grid size change (town mode)
    gridSizeSelect.addEventListener('change', function() {
      var sz = parseInt(this.value) || 15;
      initGrid(sz, sz);
      renderGrid();
      updateStats();
    });

    // Room size change
    roomWInput.addEventListener('change', function() {
      var w = Math.max(2, Math.min(10, parseInt(this.value) || 5));
      this.value = w;
      initGrid(w, parseInt(roomHInput.value) || 5);
      renderGrid();
      updateStats();
    });
    roomHInput.addEventListener('change', function() {
      var h = Math.max(2, Math.min(9, parseInt(this.value) || 5));
      this.value = h;
      initGrid(parseInt(roomWInput.value) || 5, h);
      renderGrid();
      updateStats();
    });

    // Mode switch
    var modeBtns = document.querySelectorAll('.sim-mode-btn');
    for (var i = 0; i < modeBtns.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          switchMode(btn.dataset.mode);
        });
      })(modeBtns[i]);
    }

    // Block base size change
    blockWInput.addEventListener('change', function() {
      var w = Math.max(2, Math.min(10, parseInt(this.value) || 5));
      this.value = w;
      blockBaseW = w;
      blockGrid = {};
      blockUndoStack = [];
      if (threeCamera) {
        threeCamera.position.set(blockBaseW * 0.8, blockBaseW * 0.8, blockBaseW * 0.8);
        threeCamera.lookAt(0, 0, 0);
      }
      renderBlockView();
      updateBlockStats();
      renderLayerButtons();
    });
    blockDInput.addEventListener('change', function() {
      var d = Math.max(2, Math.min(10, parseInt(this.value) || 5));
      this.value = d;
      blockBaseD = d;
      blockGrid = {};
      blockUndoStack = [];
      if (threeCamera) {
        threeCamera.position.set(blockBaseW * 0.8, blockBaseW * 0.8, blockBaseW * 0.8);
        threeCamera.lookAt(0, 0, 0);
      }
      renderBlockView();
      updateBlockStats();
      renderLayerButtons();
    });

    // Buttons (mode-aware)
    document.getElementById('simRotate').addEventListener('click', rotateItem);
    document.getElementById('simUndo').addEventListener('click', function() {
      if (currentMode === 'block') popBlockUndo(); else popUndo();
    });
    document.getElementById('simDeleteMode').addEventListener('click', toggleDeleteMode);
    document.getElementById('simClear').addEventListener('click', function() {
      if (currentMode === 'block') clearBlocks(); else clearAll();
    });
    document.getElementById('simSave').addEventListener('click', function() {
      if (currentMode === 'block') saveBlockLayout(); else saveLayout();
    });
    document.getElementById('simLoad').addEventListener('click', function() {
      if (currentMode === 'block') loadBlockLayout(); else loadLayout();
    });
    var blueprintBtn = document.getElementById('simBlueprint');
    if (blueprintBtn) {
      blueprintBtn.addEventListener('click', function() {
        if (currentMode === 'block') showBlueprintDialog();
      });
    }

    // Grid events (2D modes)
    grid.addEventListener('click', handleGridClick);
    grid.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      handleGridClick(e);
    });
    grid.addEventListener('mouseover', handleGridMouseover);
    grid.addEventListener('mouseout', handleGridMouseout);

    // Touch events (2D)
    grid.addEventListener('touchstart', handleTouchStart, { passive: true });
    grid.addEventListener('touchend', handleTouchEnd);
    grid.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Mirror mode
    document.getElementById('simMirror').addEventListener('click', cycleMirrorMode);

    // Note: Iso/3D event listeners are attached in initThree() when block mode is entered.
    // OrbitControls replaces manual drag rotation and view rotation buttons.

    // Keyboard
    document.addEventListener('keydown', handleKeyDown);

    // Search
    searchInput.addEventListener('input', function() {
      searchQuery = this.value.trim();
      renderPaletteItems();
    });

    // Palette resize handle
    var resizeDragging = false;
    var resizeStartX = 0;
    var resizeStartW = 0;

    function onResizeStart(e) {
      e.preventDefault();
      resizeDragging = true;
      resizeStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      resizeStartW = paletteEl.offsetWidth;
      resizeHandle.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    function onResizeMove(e) {
      if (!resizeDragging) return;
      var clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      var delta = clientX - resizeStartX;
      var newW = Math.max(140, Math.min(450, resizeStartW + delta));
      paletteEl.style.width = newW + 'px';
      // Resize Three.js canvas if in block mode
      if (currentMode === 'block' && threeRenderer) {
        var isoRect = isoView.getBoundingClientRect();
        threeRenderer.setSize(isoRect.width, isoRect.height);
        if (threeCamera) { threeCamera.aspect = isoRect.width / isoRect.height; threeCamera.updateProjectionMatrix(); }
        renderThreeScene();
      }
    }
    function onResizeEnd() {
      if (!resizeDragging) return;
      resizeDragging = false;
      resizeHandle.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try { localStorage.setItem('pocoapokemon-building-sim-palette-w', paletteEl.style.width); } catch(e) {}
    }

    resizeHandle.addEventListener('mousedown', onResizeStart);
    resizeHandle.addEventListener('touchstart', onResizeStart, { passive: false });
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('touchmove', onResizeMove, { passive: false });
    document.addEventListener('mouseup', onResizeEnd);
    document.addEventListener('touchend', onResizeEnd);

    // Restore saved palette width
    try {
      var savedPW = localStorage.getItem('pocoapokemon-building-sim-palette-w');
      if (savedPW) paletteEl.style.width = savedPW;
    } catch(e) {}

    // Initial render - restore last used mode
    var savedMode = null;
    try { savedMode = localStorage.getItem('pocoapokemon-building-sim-mode'); } catch(e) {}
    if (savedMode && savedMode !== 'town' && (savedMode === 'room' || savedMode === 'block')) {
      // Temporarily set to 'town' so switchMode doesn't bail on same-mode check
      currentMode = 'town';
      initGrid(15, 15);
      switchMode(savedMode);
    } else {
      initGrid(15, 15);
      renderPaletteTabs();
      renderPaletteItems();
      renderGrid();
      updateStats();
    }

    // Public API for programmatic building
    window.buildingSimAPI = {
      setBlock: setBlock, getBlock: getBlock, delBlock: delBlock, findBlock: findBlock,
      renderBlockView: renderBlockView, updateBlockStats: updateBlockStats,
      renderLayerButtons: renderLayerButtons, pushUndo: pushBlockUndo,
      switchMode: switchMode, loadBlueprint: loadBlueprint
    };
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
