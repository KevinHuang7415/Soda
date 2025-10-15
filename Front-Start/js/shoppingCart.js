// ================================
// shoppingCart.js (toggle 版)
// ================================

// --- 動態插入購物車 HTML 結構 ---
function injectshoppingCartHTML() {
    const html = `
    <div class="shoppingCart is-hidden" id="shoppingCart">
        <div class="cart">
            <div class="cart-title-box">
                <p class="cart-title">Cart</p>
                <div class="btn close-btn closeCart-btn" id="closeCart-btn">
                    <img class="close-btn-img" src="./images/icon/211651_close_round_icon.svg" alt="close">
                </div>
            </div>
            <div id="cart-items"></div>
            <div class="subtotal">
                <p>Subtotal</p>
                <div class="subtotal-sum" id="subtotal-sum">$0</div>
            </div>
            <div class="btn btn-l payment-btn">Payment</div>
        </div>
    </div>
    `;
    // 購物車會插在 <body> 的最前面（避免被其他內容影響排版）
    document.body.insertAdjacentHTML("afterbegin", html);

}
// ==============================
// JS 功能邏輯
// ==============================

// --- 初始假資料 ---
const fakeCartData = [
    { name: 'Lemon', size: '12', qty: 3 },
    { name: 'Grape', size: '4', qty: 2 },
    { name: 'Strawberry', size: '12', qty: 1 }
];
sessionStorage.setItem('cart', JSON.stringify(fakeCartData));

// --- 價格與圖片設定 ---
const PRICE_MAP = { '4': 199, '12': 499 };
const VARIANT_MAP = {
    Lemon: { bg: 'var(--product-green-light)', img: './images/lemon-lime_mockup.png', alt: 'Lemon' },
    Grape: { bg: 'var(--product-purple-mid)', img: './images/grape_mockup.png', alt: 'Grape' },
    Strawberry: { bg: 'var(--product-pink-light)', img: './images/strawberry-lemonade_mockup.png', alt: 'Strawberry' }
};
const PRODUCT_URLS = {
    Lemon: '/products/lemon',
    Grape: '/products/grape',
    Strawberry: '/products/strawberry'
};

// --- 建立商品項目 ---
function createItemBox({ name, size, qty }) {
    const variant = VARIANT_MAP[name] || VARIANT_MAP.Lemon;
    const price = PRICE_MAP[size] || 0;
    const href = PRODUCT_URLS[name] || '/products';
    const box = document.createElement('div');
    box.className = 'item-box';
    box.innerHTML = `
        <div class="cart-item-img" style="background-color:${variant.bg}">
            <h2>${size}</h2>
            <a href="${href}" target="_blank">
                        <img src="${variant.img}" alt="${variant.alt}">     
            </a>
        </div>
        <div class="cart-item-info">
            <div class="cart-item-sel-box">
                <div class="cart-item-form-box">
                    <select class="sel-opt cart-item-name">
                        <option value="Lemon"${name === 'Lemon' ? ' selected' : ''}>Lemon</option>
                        <option value="Grape"${name === 'Grape' ? ' selected' : ''}>Grape</option>
                        <option value="Strawberry"${name === 'Strawberry' ? ' selected' : ''}>Strawberry</option>
                    </select>
                    <select class="sel-opt cart-item-size">
                        <option value="4"${size === '4' ? ' selected' : ''}>4 x 355ml</option>
                        <option value="12"${size === '12' ? ' selected' : ''}>12 x 355ml</option>
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

// --- 綁定單筆商品事件 ---
function bindItemEvents(box) {
    const minus = box.querySelector('.subtraction');
    const plus = box.querySelector('.Addition');
    const qtyInput = box.querySelector('.cart-item-nmb');
    const closeBtn = box.querySelector('.item-close-btn');
    const nameSel = box.querySelector('.cart-item-name');
    const sizeSel = box.querySelector('.cart-item-size');

    minus.addEventListener('click', () => { qtyInput.value--; renderItem(box); });
    plus.addEventListener('click', () => { qtyInput.value++; renderItem(box); });
    qtyInput.addEventListener('change', () => renderItem(box));
    closeBtn.addEventListener('click', () => { box.remove(); updateSubtotal(); });
    nameSel.addEventListener('change', () => renderItem(box));
    sizeSel.addEventListener('change', () => renderItem(box));
}

// --- 更新單筆商品顯示 ---
function renderItem(box) {
    const name = box.querySelector('.cart-item-name').value;
    const size = box.querySelector('.cart-item-size').value;
    const qty = parseInt(box.querySelector('.cart-item-nmb').value) || 0;
    const variant = VARIANT_MAP[name];
    const priceEl = box.querySelector('.cart-item-price');
    const qtyDisplay = box.querySelector('.cart-item-qty-display');
    const img = box.querySelector('img');
    const imgWrap = box.querySelector('.cart-item-img');

    img.src = variant.img;
    img.alt = variant.alt;
    imgWrap.style.backgroundColor = variant.bg;
    priceEl.textContent = PRICE_MAP[size];
    qtyDisplay.textContent = qty;
    if (qty <= 0) box.remove();
    updateSubtotal();
}

// --- 開關購物車 (toggle) ---
function toggleCart() {
    const shoppingCart = document.getElementById('shoppingCart');
    shoppingCart.classList.toggle('is-hidden');
}

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    injectshoppingCartHTML();
    const cartData = JSON.parse(sessionStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items');
    cartData.forEach(item => {
        const box = createItemBox(item);
        cartContainer.appendChild(box);
        bindItemEvents(box);
    });
    updateSubtotal();

    // 綁定開關
    const openBtn = document.getElementById('openCart-btn');
    if (openBtn) openBtn.addEventListener('click', toggleCart);
    document.addEventListener('click', e => {
        if (e.target.closest('#closeCart-btn')) toggleCart();
    });
});
