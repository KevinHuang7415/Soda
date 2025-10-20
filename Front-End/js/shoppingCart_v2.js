// ================================
// shoppingCart.js (API 版本)
// 支援從後端 API 動態讀取商品資訊
// ================================

// --- 配置設定 ---
const API_BASE_URL = 'https://localhost:7085/api';
let productsCache = null; // 快取商品資料
let productNamesCache = null; // 快取商品名稱列表
let productSizesCache = {}; // 快取每個商品的規格列表

// --- 動態插入購物車 HTML 結構 ---
function injectshoppingCartHTML() {
    const html = `
    <div class="shoppingCart is-hidden" id="shoppingCart">
        <div class="cart">
            <div class="cart-title-box">
                <div class="cart-tabs">
                    <div class="cart-tab active" id="cart-tab" title="購物車">
                        <img src="./images/icon/8666616_shopping_cart_icon.svg" alt="購物車" style="width: 30px; height: 30px; cursor: pointer;">
                    </div>
                    <div class="cart-tab" id="favorite-tab" title="我的最愛">
                        <img src="./images/icon/3643770_favorite_heart_like_likes_love_icon.svg" alt="我的最愛" style="width: 30px; height: 30px; cursor: pointer;">
                    </div>
                </div>
                <div class="btn close-btn closeCart-btn" id="closeCart-btn">
                    <img class="close-btn-img" src="./images/icon/211651_close_round_icon.svg" alt="close">
                </div>
            </div>
            
            <!-- 購物車內容 -->
            <div id="cart-view" class="cart-view active">
                <div id="cart-items"></div>
                <div class="subtotal">
                    <p>小計</p>
                    <div class="subtotal-sum" id="subtotal-sum">$0</div>
                </div>
                <div class="btn btn-l payment-btn">結帳</div>
            </div>
            
            <!-- 我的最愛內容 -->
            <div id="favorite-view" class="cart-view">
                <div id="favorite-items"></div>
                <div class="favorite-info">
                    <p style="text-align: center; color: var(--main-gray); font-size: 14px; margin-top: 20px;">
                        點擊「加入購物車」按鈕將商品加入購物車
                    </p>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML("afterbegin", html);
}

// ==============================
// API 相關函數
// ==============================

// --- 從 API 獲取所有商品資訊 ---
async function fetchProducts() {
    if (productsCache) {
        return productsCache; // 使用快取
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Products`);
        if (!response.ok) throw new Error('無法獲取商品資料');

        const products = await response.json();
        productsCache = products; // 快取結果
        return products;
    } catch (error) {
        console.error('獲取商品資料失敗:', error);
        return getFallbackProducts(); // 使用備用資料
    }
}

// --- 根據商品 ID 和規格獲取商品資訊 ---
async function getProductInfo(productId, size) {
    const products = await fetchProducts();

    // 從 API 返回的商品列表中找到對應的商品
    const product = products.find(p => p.id === productId && p.size === size);

    if (product) {
        return {
            id: product.id,
            name: product.name,
            size: product.size,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock
        };
    }

    return null;
}

// --- 備用商品資料（API 失敗時使用）---
function getFallbackProducts() {
    return [
        { id: 1, name: '檸檬能量飲', size: '6', price: 199, imageUrl: './images/lemon-lime_mockup.png', stock: 100 },
        { id: 2, name: '檸檬能量飲', size: '24', price: 499, imageUrl: './images/lemon-lime_mockup.png', stock: 100 },
        { id: 3, name: '葡萄能量飲', size: '6', price: 199, imageUrl: './images/grape_mockup.png', stock: 100 },
        { id: 4, name: '葡萄能量飲', size: '24', price: 499, imageUrl: './images/grape_mockup.png', stock: 100 },
        { id: 5, name: '草莓能量飲', size: '6', price: 199, imageUrl: './images/strawberry-lemonade_mockup.png', stock: 100 },
        { id: 6, name: '草莓能量飲', size: '24', price: 499, imageUrl: './images/strawberry-lemonade_mockup.png', stock: 100 }
    ];
}

// --- 獲取商品背景顏色（根據名稱）---
function getProductBackground(productName) {
    const bgMap = {
        '檸檬能量飲': 'var(--product-green-light)',
        '葡萄能量飲': 'var(--product-purple-light)',
        '草莓能量飲': 'var(--product-pink-light)'
    };
    return bgMap[productName] || 'var(--main-gray-light)';
}

// ==============================
// 購物車核心功能
// ==============================

// --- 初始化購物車和我的最愛 ---
if (!sessionStorage.getItem('cart')) {
    sessionStorage.setItem('cart', JSON.stringify([]));
}
if (!sessionStorage.getItem('favorites')) {
    sessionStorage.setItem('favorites', JSON.stringify([]));
}

// --- 獲取所有商品名稱（去重）---
async function getProductNames() {
    if (productNamesCache) {
        return productNamesCache; // 使用快取
    }

    const products = await fetchProducts();
    const uniqueNames = [...new Set(products.map(p => p.name))];
    productNamesCache = uniqueNames; // 快取結果
    return uniqueNames;
}

// --- 獲取指定商品名稱的所有規格 ---
async function getProductSizes(productName) {
    if (productSizesCache[productName]) {
        return productSizesCache[productName]; // 使用快取
    }

    const products = await fetchProducts();
    const sizes = products
        .filter(p => p.name === productName)
        .map(p => p.size);
    const uniqueSizes = [...new Set(sizes)]; // 去重
    productSizesCache[productName] = uniqueSizes; // 快取結果
    return uniqueSizes;
}

// --- 預先載入所有商品的名稱和規格（優化效能）---
async function preloadProductData() {
    const products = await fetchProducts();

    // 預先快取所有商品名稱
    productNamesCache = [...new Set(products.map(p => p.name))];

    // 預先快取所有商品的規格
    productNamesCache.forEach(name => {
        const sizes = products
            .filter(p => p.name === name)
            .map(p => p.size);
        productSizesCache[name] = [...new Set(sizes)];
    });
}

// --- 建立我的最愛項目（和購物車一樣的樣式，多了加入購物車按鈕）---
function createFavoriteItemBox(favItem) {
    const { productId, name, size, price, imageUrl } = favItem;
    const qty = favItem.qty || 1; // 如果沒有 qty，預設為 1
    const bg = getProductBackground(name);

    // 使用快取資料（已在初始化時載入）
    const productNames = productNamesCache || [name];
    const productSizes = productSizesCache[name] || [size];

    // 圖片路徑映射（fallback）
    const imageMap = {
        '檸檬能量飲': './images/lemon-lime_mockup.png',
        '葡萄能量飲': './images/grape_mockup.png',
        '草莓能量飲': './images/strawberry-lemonade_mockup.png'
    };
    
    // 確保圖片路徑有效
    const validImageUrl = imageUrl || imageMap[name] || './images/lemon-lime_mockup.png';

    const box = document.createElement('div');
    box.className = 'item-box favorite-item';
    box.dataset.productId = productId;

    // 生成商品名稱選項
    const nameOptions = productNames.map(pName =>
        `<option value="${pName}"${pName === name ? ' selected' : ''}>${pName}</option>`
    ).join('');

    // 生成規格選項（只顯示數字）
    const sizeOptions = productSizes.map(pSize =>
        `<option value="${pSize}"${pSize === size ? ' selected' : ''}>${pSize}</option>`
    ).join('');

    box.innerHTML = `
        <div class="cart-item-img" style="background-color:${bg}">
            <h2>${size}</h2>
            <a href="/products/${productId}" target="_blank">
                <img src="${validImageUrl}" alt="${name}" onerror="this.src='${imageMap[name] || './images/lemon-lime_mockup.png'}'">     
            </a>
        </div>
        <div class="cart-item-info">
            <div class="cart-item-sel-box">
                <div class="cart-item-form-box">
                    <select class="sel-opt cart-item-name">
                        ${nameOptions}
                    </select>
                    <select class="sel-opt cart-item-size">
                        ${sizeOptions}
                    </select>
                </div>
                <div class="btn close-btn item-close-btn">
                    <img class="close-btn-img" src="./images/icon/211651_close_round_icon.svg" alt="remove">
                </div>
            </div>
            <div class="cart-item-cout-box">
                <div class="cart-item-cout">
                    <ul>
                        <li class="cout-btn subtraction"><img src="./images/icon/211863_minus_round_icon.svg" alt="-"></li>
                        <li><input type="number" class="cart-item-nmb" value="${qty}" min="1"></li>
                        <li class="cout-btn Addition"><img src="./images/icon/211877_plus_round_icon.svg" alt="+"></li>
                    </ul>
                    <div class="cart-item-sum">
                        $<span class="cart-item-price">${price}</span> x
                        <span class="cart-item-qty-display">${qty}</span>
                    </div>
                </div>
                <button class="btn-s add-to-cart-from-fav">
                    加入購物車
                </button>
            </div>
        </div>
    `;
    return box;
}

// --- 建立商品項目 ---
function createItemBox(cartItem) {
    const { productId, name, size, qty, price, imageUrl } = cartItem;
    const bg = getProductBackground(name);

    // 使用快取資料（已在初始化時載入）
    const productNames = productNamesCache || [name];
    const productSizes = productSizesCache[name] || [size];

    // 圖片路徑映射（fallback）
    const imageMap = {
        '檸檬能量飲': './images/lemon-lime_mockup.png',
        '葡萄能量飲': './images/grape_mockup.png',
        '草莓能量飲': './images/strawberry-lemonade_mockup.png'
    };
    
    // 確保圖片路徑有效
    const validImageUrl = imageUrl || imageMap[name] || './images/lemon-lime_mockup.png';

    const box = document.createElement('div');
    box.className = 'item-box';
    box.dataset.productId = productId; // 儲存商品 ID

    // 生成商品名稱選項
    const nameOptions = productNames.map(pName =>
        `<option value="${pName}"${pName === name ? ' selected' : ''}>${pName}</option>`
    ).join('');

    // 生成規格選項（只顯示數字）
    const sizeOptions = productSizes.map(pSize =>
        `<option value="${pSize}"${pSize === size ? ' selected' : ''}>${pSize}</option>`
    ).join('');

    box.innerHTML = `
        <div class="cart-item-img" style="background-color:${bg}">
            <h2>${size}</h2>
            <a href="/products/${productId}" target="_blank">
                <img src="${validImageUrl}" alt="${name}" onerror="this.src='${imageMap[name] || './images/lemon-lime_mockup.png'}'">     
            </a>
        </div>
        <div class="cart-item-info">
            <div class="cart-item-sel-box">
                <div class="cart-item-form-box">
                    <select class="sel-opt cart-item-name">
                        ${nameOptions}
                    </select>
                    <select class="sel-opt cart-item-size">
                        ${sizeOptions}
                    </select>
                </div>
                <div class="btn close-btn item-close-btn">
                    <img class="close-btn-img" src="./images/icon/211651_close_round_icon.svg" alt="remove">
                </div>
            </div>
            <div class="cart-item-cout">
                <ul>
                    <li class="cout-btn subtraction"><img src="./images/icon/211863_minus_round_icon.svg" alt="-"></li>
                    <li><input type="number" class="cart-item-nmb" value="${qty}" min="0"></li>
                    <li class="cout-btn Addition"><img src="./images/icon/211877_plus_round_icon.svg" alt="+"></li>
                </ul>
                <div class="cart-item-sum">
                    $<span class="cart-item-price">${price}</span> x
                    <span class="cart-item-qty-display">${qty}</span>
                </div>
            </div>
        </div>
    `;
    return box;
}

// --- 更新小計 ---
function updateSubtotal() {
    let total = 0;
    document.querySelectorAll('.item-box').forEach(box => {
        const price = parseInt(box.querySelector('.cart-item-price').textContent);
        const qty = parseInt(box.querySelector('.cart-item-nmb').value);
        total += price * qty;
    });
    document.getElementById('subtotal-sum').textContent = `$${total}`;
}

// --- 綁定我的最愛項目事件 ---
function bindFavoriteItemEvents(box) {
    const minus = box.querySelector('.subtraction');
    const plus = box.querySelector('.Addition');
    const qtyInput = box.querySelector('.cart-item-nmb');
    const qtyDisplay = box.querySelector('.cart-item-qty-display');
    const closeBtn = box.querySelector('.item-close-btn');
    const nameSel = box.querySelector('.cart-item-name');
    const sizeSel = box.querySelector('.cart-item-size');
    const addToCartBtn = box.querySelector('.add-to-cart-from-fav');
    const productId = box.dataset.productId;

    // 數量減少
    minus.addEventListener('click', () => {
        if (qtyInput.value > 1) {
            qtyInput.value--;
            qtyDisplay.textContent = qtyInput.value;
            updateFavoriteItemQty(productId, parseInt(qtyInput.value));
        }
    });

    // 數量增加
    plus.addEventListener('click', () => {
        qtyInput.value++;
        qtyDisplay.textContent = qtyInput.value;
        updateFavoriteItemQty(productId, parseInt(qtyInput.value));
    });

    // 數量輸入變化（change 事件：失去焦點時觸發）
    qtyInput.addEventListener('change', () => {
        const newQty = parseInt(qtyInput.value) || 1;
        if (newQty < 1) {
            qtyInput.value = 1;
        }
        qtyDisplay.textContent = qtyInput.value;
        updateFavoriteItemQty(productId, parseInt(qtyInput.value));
    });

    // 數量輸入即時更新顯示（input 事件：輸入時立即觸發）
    qtyInput.addEventListener('input', () => {
        const newQty = parseInt(qtyInput.value) || 1;
        qtyDisplay.textContent = newQty;
    });

    // 商品名稱變更
    nameSel.addEventListener('change', async () => {
        const newName = nameSel.value;
        const newSize = sizeSel.value;
        await updateFavoriteItemProduct(box, productId, newName, newSize, parseInt(qtyInput.value));
    });

    // 規格變更
    sizeSel.addEventListener('change', async () => {
        const newName = nameSel.value;
        const newSize = sizeSel.value;
        await updateFavoriteItemProduct(box, productId, newName, newSize, parseInt(qtyInput.value));
    });

    // 移除最愛
    closeBtn.addEventListener('click', () => {
        removeFavoriteItem(productId);
        box.remove();
    });

    // 加入購物車（使用當前調整好的數量和規格）
    addToCartBtn.addEventListener('click', async () => {
        const currentName = nameSel.value;
        const currentSize = sizeSel.value;
        const currentQty = parseInt(qtyInput.value);

        // 獲取當前選擇的商品 ID
        const products = productsCache || [];
        const product = products.find(p => p.name === currentName && p.size === currentSize);
        const currentProductId = product ? product.id : parseInt(productId);

        // 加入購物車
        await addToCart(currentProductId, currentName, currentSize, currentQty);

        // 從我的最愛中移除該商品
        removeFavoriteItem(productId);
        box.remove();

        // 切換到購物車 Tab
        switchTab('cart');
    });
}

// --- 綁定單筆商品事件 ---
function bindItemEvents(box) {
    const minus = box.querySelector('.subtraction');
    const plus = box.querySelector('.Addition');
    const qtyInput = box.querySelector('.cart-item-nmb');
    const qtyDisplay = box.querySelector('.cart-item-qty-display');
    const closeBtn = box.querySelector('.item-close-btn');
    const nameSel = box.querySelector('.cart-item-name');
    const sizeSel = box.querySelector('.cart-item-size');
    const productId = box.dataset.productId;

    minus.addEventListener('click', () => {
        if (qtyInput.value > 0) {
            qtyInput.value--;
            qtyDisplay.textContent = qtyInput.value; // 立即更新顯示
            updateCartItemQty(productId, parseInt(qtyInput.value));
        }
    });

    plus.addEventListener('click', () => {
        qtyInput.value++;
        qtyDisplay.textContent = qtyInput.value; // 立即更新顯示
        updateCartItemQty(productId, parseInt(qtyInput.value));
    });

    qtyInput.addEventListener('change', () => {
        const newQty = parseInt(qtyInput.value) || 0;
        qtyDisplay.textContent = newQty; // 立即更新顯示
        updateCartItemQty(productId, newQty);
    });

    // 即時更新顯示（當輸入時）
    qtyInput.addEventListener('input', () => {
        const newQty = parseInt(qtyInput.value) || 0;
        qtyDisplay.textContent = newQty; // 即時更新顯示
    });

    closeBtn.addEventListener('click', () => {
        removeCartItem(productId);
        box.remove();
        updateSubtotal();
    });

    // 當選擇商品名稱時
    nameSel.addEventListener('change', async () => {
        const newName = nameSel.value;
        const currentSize = sizeSel.value;

        // 從快取獲取規格（已預先載入）
        const newSizes = productSizesCache[newName] || [currentSize];
        sizeSel.innerHTML = newSizes.map(s =>
            `<option value="${s}">${s} x 355ml</option>`
        ).join('');

        // 如果當前規格不存在於新商品中，選擇第一個規格
        if (!newSizes.includes(currentSize)) {
            sizeSel.value = newSizes[0];
        }

        // 更新商品資訊
        await updateItemProduct(box, newName, sizeSel.value);
    });

    // 當選擇規格時
    sizeSel.addEventListener('change', async () => {
        const currentName = nameSel.value;
        const newSize = sizeSel.value;

        // 更新商品資訊
        await updateItemProduct(box, currentName, newSize);
    });
}

// --- 更新商品項目（當選項改變時）---
async function updateItemProduct(box, newName, newSize) {
    const qtyInput = box.querySelector('.cart-item-nmb');
    const priceDisplay = box.querySelector('.cart-item-price');
    const qtyDisplay = box.querySelector('.cart-item-qty-display');
    const img = box.querySelector('.cart-item-img img');
    const imgWrap = box.querySelector('.cart-item-img');
    const sizeLabel = box.querySelector('.cart-item-img h2');
    const oldProductId = parseInt(box.dataset.productId);

    // 從 API 獲取新商品資訊
    const products = await fetchProducts();
    const newProduct = products.find(p => p.name === newName && p.size === newSize);

    if (newProduct) {
        // 圖片路徑映射（fallback）
        const imageMap = {
            '檸檬能量飲': './images/lemon-lime_mockup.png',
            '葡萄能量飲': './images/grape_mockup.png',
            '草莓能量飲': './images/strawberry-lemonade_mockup.png'
        };

        // 確保圖片路徑有效
        const imageUrl = newProduct.imageUrl || imageMap[newProduct.name] || './images/lemon-lime_mockup.png';

        // 更新顯示
        img.src = imageUrl;
        img.alt = newProduct.name;
        img.onerror = function() {
            // 如果圖片載入失敗，使用備用圖片
            this.src = imageMap[newProduct.name] || './images/lemon-lime_mockup.png';
            console.warn(`圖片載入失敗，使用備用圖片: ${newProduct.name}`);
        };
        imgWrap.style.backgroundColor = getProductBackground(newProduct.name);
        sizeLabel.textContent = newProduct.size;
        priceDisplay.textContent = newProduct.price;
        qtyDisplay.textContent = qtyInput.value;
        box.dataset.productId = newProduct.id;

        // 更新 sessionStorage
        let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.productId === oldProductId);

        if (itemIndex !== -1) {
            cart[itemIndex] = {
                productId: newProduct.id,
                name: newProduct.name,
                size: newProduct.size,
                qty: parseInt(qtyInput.value),
                price: newProduct.price,
                imageUrl: imageUrl
            };
            sessionStorage.setItem('cart', JSON.stringify(cart));
        }

        // 更新小計
        updateSubtotal();
        
        console.log(`已更新商品: ${newProduct.name} ${newProduct.size}`, {
            imageUrl: imageUrl,
            price: newProduct.price,
            productId: newProduct.id
        });
    } else {
        console.error(`找不到商品: ${newName} ${newSize}`);
    }
}

// --- 更新購物車中的商品數量（優化版：只更新 sessionStorage 和小計）---
function updateCartItemQty(productId, newQty) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.productId === parseInt(productId));

    if (itemIndex !== -1) {
        if (newQty <= 0) {
            // 數量為 0 時，刪除商品並重新渲染
            cart.splice(itemIndex, 1);
            sessionStorage.setItem('cart', JSON.stringify(cart));
            refreshCart(); // 需要重新渲染以移除該項目
        } else {
            // 只更新數量，不重新渲染（顯示已在事件中更新）
            cart[itemIndex].qty = newQty;
            sessionStorage.setItem('cart', JSON.stringify(cart));
            updateSubtotal(); // 只更新小計
        }
    }
}

// --- 從購物車移除商品 ---
function removeCartItem(productId) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.productId !== parseInt(productId));
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

// --- 從我的最愛移除商品 ---
function removeFavoriteItem(productId) {
    let favorites = JSON.parse(sessionStorage.getItem('favorites')) || [];
    favorites = favorites.filter(item => item.productId !== parseInt(productId));
    sessionStorage.setItem('favorites', JSON.stringify(favorites));
}

// --- 更新我的最愛商品數量 ---
function updateFavoriteItemQty(productId, newQty) {
    let favorites = JSON.parse(sessionStorage.getItem('favorites')) || [];
    const itemIndex = favorites.findIndex(item => item.productId === parseInt(productId));

    if (itemIndex !== -1) {
        favorites[itemIndex].qty = newQty;
        sessionStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

// --- 更新我的最愛商品資訊（當下拉選單變更時）---
async function updateFavoriteItemProduct(box, oldProductId, newName, newSize, newQty) {
    const products = productsCache || [];
    const newProduct = products.find(p => p.name === newName && p.size === newSize);

    if (!newProduct) {
        console.error('找不到商品');
        return;
    }

    // 獲取完整商品資訊
    let productInfo = await getProductInfo(newProduct.id, newSize);

    if (!productInfo) {
        // 離線模式：使用預設資料
        const priceMap = { '6': 199, '24': 499 };
        const imageMap = {
            '檸檬能量飲': './images/lemon-lime_mockup.png',
            '葡萄能量飲': './images/grape_mockup.png',
            '草莓能量飲': './images/strawberry-lemonade_mockup.png'
        };
        productInfo = {
            id: newProduct.id,
            name: newName,
            size: newSize,
            price: priceMap[newSize] || 199,
            imageUrl: imageMap[newName] || './images/lemon-lime_mockup.png'
        };
    }

    // 更新 sessionStorage
    let favorites = JSON.parse(sessionStorage.getItem('favorites')) || [];
    const itemIndex = favorites.findIndex(item => item.productId === parseInt(oldProductId));

    if (itemIndex !== -1) {
        favorites[itemIndex] = {
            productId: productInfo.id,
            name: productInfo.name,
            size: productInfo.size,
            qty: newQty,
            price: productInfo.price,
            imageUrl: productInfo.imageUrl
        };
        sessionStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // 更新 UI
    const bg = getProductBackground(newName);
    const priceSpan = box.querySelector('.cart-item-price');
    const imgDiv = box.querySelector('.cart-item-img');
    const img = box.querySelector('.cart-item-img img');
    const sizeH2 = box.querySelector('.cart-item-img h2');

    // 圖片路徑映射（fallback）
    const imageMap = {
        '檸檬能量飲': './images/lemon-lime_mockup.png',
        '葡萄能量飲': './images/grape_mockup.png',
        '草莓能量飲': './images/strawberry-lemonade_mockup.png'
    };

    // 確保圖片路徑有效
    const imageUrl = productInfo.imageUrl || imageMap[newName] || './images/lemon-lime_mockup.png';

    priceSpan.textContent = productInfo.price;
    imgDiv.style.backgroundColor = bg;
    img.src = imageUrl;
    img.alt = newName;
    img.onerror = function() {
        // 如果圖片載入失敗，使用備用圖片
        this.src = imageMap[newName] || './images/lemon-lime_mockup.png';
        console.warn(`圖片載入失敗，使用備用圖片: ${newName}`);
    };
    sizeH2.textContent = newSize;
    box.dataset.productId = productInfo.id;
    
    console.log(`已更新我的最愛商品: ${newName} ${newSize}`, {
        imageUrl: imageUrl,
        price: productInfo.price,
        productId: productInfo.id
    });
}

// --- 加入商品到我的最愛 ---
async function addToFavorites(productId, productName, size) {
    // 獲取商品資訊（包含價格）
    let productInfo = await getProductInfo(productId, size);

    if (!productInfo) {
        console.warn('無法連接 API，使用預設資料');
        // 使用假資料（當 API 無法連接時）
        const priceMap = { '6': 199, '24': 499 };
        const imageMap = {
            '檸檬能量飲': './images/lemon-lime_mockup.png',
            '葡萄能量飲': './images/grape_mockup.png',
            '草莓能量飲': './images/strawberry-lemonade_mockup.png'
        };
        productInfo = {
            id: productId,
            name: productName,
            size: size,
            price: priceMap[size] || 199,
            stock: 999,
            imageUrl: imageMap[productName] || './images/lemon-lime_mockup.png'
        };
    }

    let favorites = JSON.parse(sessionStorage.getItem('favorites')) || [];

    // 檢查是否已在最愛中
    const existingItemIndex = favorites.findIndex(item =>
        item.productId === productId
    );

    if (existingItemIndex !== -1) {
        console.log('此商品已在我的最愛中');
        // 即使已存在，仍然打開並顯示我的最愛
        const shoppingCart = document.getElementById('shoppingCart');
        if (shoppingCart.classList.contains('is-hidden')) {
            toggleCart();
        }
        switchTab('favorite');
        return;
    }

    // 加入最愛（包含數量，預設為 1）
    favorites.push({
        productId: productInfo.id,
        name: productInfo.name,
        size: productInfo.size,
        qty: 1,
        price: productInfo.price,
        imageUrl: productInfo.imageUrl
    });

    // 更新 sessionStorage
    sessionStorage.setItem('favorites', JSON.stringify(favorites));

    // 重新渲染我的最愛
    refreshFavorites();

    console.log(`已加入我的最愛: ${productName} ${size}x355ml`);

    // 打開購物車並切換到我的最愛 Tab
    const shoppingCart = document.getElementById('shoppingCart');
    if (shoppingCart.classList.contains('is-hidden')) {
        toggleCart();
    }
    switchTab('favorite');
}

// --- 重新渲染我的最愛內容 ---
function refreshFavorites() {
    const favData = JSON.parse(sessionStorage.getItem('favorites')) || [];
    const favContainer = document.getElementById('favorite-items');

    // 清空現有內容
    favContainer.innerHTML = '';

    if (favData.length === 0) {
        favContainer.innerHTML = '<p style="text-align: center; color: var(--main-gray); padding: 40px;">目前沒有最愛商品</p>';
        return;
    }

    // 重新建立所有最愛項目
    favData.forEach(item => {
        const box = createFavoriteItemBox(item);
        favContainer.appendChild(box);
        bindFavoriteItemEvents(box);
    });
}

// --- 開關購物車 (toggle) ---
function toggleCart() {
    const shoppingCart = document.getElementById('shoppingCart');
    shoppingCart.classList.toggle('is-hidden');
}

// --- 加入商品到購物車（新版：包含完整商品資訊）---
async function addToCart(productId, productName, size, quantity) {
    // 獲取商品資訊（包含價格）
    let productInfo = await getProductInfo(productId, size);

    if (!productInfo) {
        console.warn('無法連接 API，使用預設資料');
        // 使用假資料（當 API 無法連接時）
        const priceMap = { '6': 199, '24': 499 };
        const imageMap = {
            '檸檬能量飲': './images/lemon-lime_mockup.png',
            '葡萄能量飲': './images/grape_mockup.png',
            '草莓能量飲': './images/strawberry-lemonade_mockup.png'
        };
        productInfo = {
            id: productId,
            name: productName,
            size: size,
            price: priceMap[size] || 199,
            stock: 999, // 假設庫存充足
            imageUrl: imageMap[productName] || './images/lemon-lime_mockup.png'
        };
    }

    // 檢查庫存
    if (productInfo.stock < quantity) {
        console.warn(`庫存不足！目前庫存：${productInfo.stock}`);
        return;
    }

    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

    // 檢查購物車中是否已有相同商品
    const existingItemIndex = cart.findIndex(item =>
        item.productId === productId
    );

    if (existingItemIndex !== -1) {
        // 如果已存在，增加數量
        cart[existingItemIndex].qty += quantity;
    } else {
        // 如果不存在，新增商品（儲存完整資訊）
        cart.push({
            productId: productInfo.id,
            name: productInfo.name,
            size: productInfo.size,
            qty: quantity,
            price: productInfo.price,
            imageUrl: productInfo.imageUrl
        });
    }

    // 更新 sessionStorage
    sessionStorage.setItem('cart', JSON.stringify(cart));

    // 重新渲染購物車
    refreshCart();

    console.log(`已加入購物車: ${productName} ${size}x355ml x ${quantity}`);

    // 打開購物車並切換到購物車 Tab
    const shoppingCart = document.getElementById('shoppingCart');
    if (shoppingCart.classList.contains('is-hidden')) {
        toggleCart();
    }
    switchTab('cart');
}

// --- 重新渲染購物車內容 ---
function refreshCart() {
    const cartData = JSON.parse(sessionStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items');

    // 清空現有內容
    cartContainer.innerHTML = '';

    // 重新建立所有商品項目（同步處理，使用快取資料）
    cartData.forEach(item => {
        const box = createItemBox(item);
        cartContainer.appendChild(box);
        bindItemEvents(box);
    });

    // 更新小計
    updateSubtotal();
}

// --- 切換 Tab (購物車 / 我的最愛) ---
function switchTab(tabName) {
    const cartTab = document.getElementById('cart-tab');
    const favoriteTab = document.getElementById('favorite-tab');
    const cartView = document.getElementById('cart-view');
    const favoriteView = document.getElementById('favorite-view');

    if (tabName === 'cart') {
        cartTab.classList.add('active');
        favoriteTab.classList.remove('active');
        cartView.classList.add('active');
        favoriteView.classList.remove('active');
    } else if (tabName === 'favorite') {
        cartTab.classList.remove('active');
        favoriteTab.classList.add('active');
        cartView.classList.remove('active');
        favoriteView.classList.add('active');
    }
}

// ==============================
// 互動式選擇器自動初始化
// ==============================

// --- 價格對應表（離線模式使用）---
const OFFLINE_PRICE_MAP = { '6': 199, '24': 499 };

// --- 商品 ID 對應表（離線模式使用）---
const OFFLINE_PRODUCT_ID_MAP = {
    '檸檬能量飲': { '6': 1, '24': 2 },
    '葡萄能量飲': { '6': 3, '24': 4 },
    '草莓能量飲': { '6': 5, '24': 6 }
};

// --- 初始化所有 .addCart 互動式選擇器 ---
function initializeAddCartSelectors() {
    const addCartContainers = document.querySelectorAll('.addCart');

    addCartContainers.forEach(container => {
        const nameSelect = container.querySelector('.item-name-select');
        const sizeSelect = container.querySelector('.size-select');
        const qtyInput = container.querySelector('.qty-input');
        const minusBtn = container.querySelector('.minus-btn');
        const plusBtn = container.querySelector('.plus-btn');
        const priceDisplay = container.querySelector('.current-price');
        const productIdDisplay = container.querySelector('.current-product-id');

        if (!nameSelect || !sizeSelect) return; // 如果沒有選擇器，跳過

        // 更新價格和商品ID
        function updateProductInfo() {
            const selectedName = nameSelect.value;
            const selectedSize = sizeSelect.value;

            // 嘗試從快取的商品資料中獲取
            let price = OFFLINE_PRICE_MAP[selectedSize]; // 預設值
            let productId = OFFLINE_PRODUCT_ID_MAP[selectedName]?.[selectedSize];

            if (productsCache) {
                const product = productsCache.find(p => p.name === selectedName && p.size === selectedSize);
                if (product) {
                    price = product.price;
                    productId = product.id;
                }
            }

            // 更新顯示
            if (priceDisplay) priceDisplay.textContent = `$${price}`;
            if (productIdDisplay) productIdDisplay.textContent = productId;
            container.dataset.productId = productId;
        }

        // 數量控制
        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                if (qtyInput && qtyInput.value > 1) {
                    qtyInput.value--;
                }
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                if (qtyInput && qtyInput.value < 99) {
                    qtyInput.value++;
                }
            });
        }

        // 監聽選擇變化
        nameSelect.addEventListener('change', updateProductInfo);
        sizeSelect.addEventListener('change', updateProductInfo);

        // 初始化價格顯示
        updateProductInfo();
    });
}

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', async () => {
    injectshoppingCartHTML();

    // 預先載入所有商品資料（含名稱和規格）- 優化效能
    await preloadProductData();

    // 渲染購物車和我的最愛
    refreshCart();
    refreshFavorites();

    // 綁定 Tab 切換事件
    document.getElementById('cart-tab').addEventListener('click', () => switchTab('cart'));
    document.getElementById('favorite-tab').addEventListener('click', () => switchTab('favorite'));

    // 初始化所有互動式選擇器
    initializeAddCartSelectors();

    // 綁定開關 - 區分「開啟購物車」和「加入購物車」按鈕
    const openBtns = document.querySelectorAll('.openCart-btn');
    openBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            // 檢查按鈕文字，判斷是「加入購物車」還是「開啟購物車」
            if (btn.textContent.includes('加入購物車')) {
                // 這是「加入購物車」按鈕
                const addCartContainer = btn.closest('.addCart');

                if (addCartContainer) {
                    // 讀取商品資訊（使用新的選擇器）
                    const productId = parseInt(addCartContainer.dataset.productId) || 1;
                    const productName = addCartContainer.querySelector('.item-name-select')?.value ||
                        addCartContainer.querySelector('.item-name')?.textContent.trim() || '未知商品';
                    const size = addCartContainer.querySelector('.size-select')?.value ||
                        addCartContainer.querySelector('.siz-box')?.textContent.trim() || '24';
                    const quantity = parseInt(addCartContainer.querySelector('.qty-input')?.value) ||
                        parseInt(addCartContainer.querySelector('.item-count')?.textContent.trim()) || 1;

                    // 加入購物車（異步）
                    // addToCart() 內部已經會打開購物車，所以這裡不需要再調用 toggleCart()
                    await addToCart(productId, productName, size, quantity);
                }
            } else {
                // 這是純粹「打開購物車」的按鈕
                toggleCart();
            }
        });
    });

    // 綁定關閉按鈕
    document.addEventListener('click', e => {
        if (e.target.closest('#closeCart-btn')) toggleCart();
    });

    // 點擊背景（粉色遮罩）關閉購物車
    const shoppingCartOverlay = document.getElementById('shoppingCart');
    shoppingCartOverlay.addEventListener('click', (e) => {
        if (e.target === shoppingCartOverlay) {
            toggleCart();
        }
    });

    // 按 ESC 鍵關閉購物車
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !shoppingCartOverlay.classList.contains('is-hidden')) {
            toggleCart();
        }
    });

    // 綁定結帳按鈕
    document.addEventListener('click', (e) => {
        if (e.target.closest('.payment-btn')) {
            // 檢查購物車是否有商品
            const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                alert('購物車是空的，請先加入商品！');
                return;
            }
            
            // 計算總計
            let total = 0;
            cart.forEach(item => {
                total += item.price * item.qty;
            });
            
            // 將購物車資料編碼為 URL 參數
            const cartData = encodeURIComponent(JSON.stringify(cart));
            const totalData = encodeURIComponent(total.toString());
            
            // 跳轉到結帳頁面並傳遞購物車資料
            window.location.href = `./checkouts.html?cart=${cartData}&total=${totalData}`;
        }
    });
});

