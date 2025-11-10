        // ==================== 頁面初始化 ====================
        
        // 頁面載入時初始化
        window.addEventListener('DOMContentLoaded', () => {
            initializeUserDataOnLoad();
        });

        // 初始化使用者資料（頁面載入時）
        function initializeUserDataOnLoad() {
            const user = getCurrentUser();
            
            if (user) {
                // 已登入，自動填入使用者資料
                fillUserData(user);
            } else {
                // 未登入，顯示登入連結
                const loginStatusLink = document.getElementById('login-status-link');
                if (loginStatusLink) {
                    loginStatusLink.textContent = '登入';
                    loginStatusLink.href = './login.html';
                }
            }
        }

        // 填入使用者資料
        function fillUserData(user) {
            // 1. 更新登入狀態顯示
            const loginStatusLink = document.getElementById('login-status-link');
            if (loginStatusLink) {
                loginStatusLink.textContent = `Hi, ${user.username || user.email}`;
                loginStatusLink.href = 'javascript:void(0);';
                loginStatusLink.style.cursor = 'default';
                loginStatusLink.style.color = 'var(--main-green)';
                loginStatusLink.title = '已登入';
            }

            // 2. 自動填入 Email
            const emailInput = document.getElementById('email');
            if (emailInput && user.email) {
                emailInput.value = user.email;
                emailInput.readOnly = true; // 已登入使用者不能修改 email
                emailInput.style.backgroundColor = '#f5f5f5';
            }

            // 3. 自動填入姓名（如果有的話）
            const firstNameInput = document.getElementById('deliveryFirstName');
            const lastNameInput = document.getElementById('deliveryLaName');
            
            if (user.lastName && firstNameInput) {
                firstNameInput.value = user.lastName;
            }
            
            if (user.firstName && lastNameInput) {
                lastNameInput.value = user.firstName;
            }

            // 4. 自動填入電話（如果有的話）
            const phoneInput = document.getElementById('deliveryTel');
            if (phoneInput) {
                if (user.phoneNumber) {
                    phoneInput.value = user.phoneNumber;
                    phoneInput.classList.add('has-value');
                } else if (!phoneInput.value) {
                    // 如果沒有用戶電話且欄位為空，設置預設前綴 "09"
                    phoneInput.value = '09';
                    phoneInput.classList.add('has-value');
                }
            }

            // 5. 自動填入地址（如果有的話）- 需要解析完整地址
            if (user.address) {
                // 解析地址格式：例如 "320桃園市中壢區中山路100號"
                const addressMatch = user.address.match(/^(\d{3})?([台北台中台南高雄桃園新北基隆新竹苗栗彰化南投雲林嘉義屏東宜蘭花蓮台東])([^市縣]+)(市|縣|市區|縣區)?([^區鄉鎮市]+)(區|鄉|鎮|市)?(.+)$/);
                
                if (addressMatch) {
                    const zipcode = addressMatch[1];
                    const city = addressMatch[2] + (addressMatch[4] || '');
                    const district = addressMatch[5] + (addressMatch[6] || '');
                    const detail = addressMatch[7];
                    
                    // 填入郵遞區號
                    const zipcodeInput = document.getElementById('zipcode-input');
                    if (zipcodeInput && zipcode) {
                        zipcodeInput.value = zipcode;
                    }
                    
                    // 填入縣市
                    const citySelect = document.getElementById('city');
                    if (citySelect && city) {
                        citySelect.value = city;
                        // 觸發change事件以更新區域選單
                        citySelect.dispatchEvent(new Event('change'));
                    }
                    
                    // 延遲填入區域（等待選單更新）
                    setTimeout(() => {
                        const districtSelect = document.getElementById('district');
                        if (districtSelect && district) {
                            districtSelect.value = district;
                            // 觸發change事件以自動填入郵遞區號
                            districtSelect.dispatchEvent(new Event('change'));
                        }
                    }, 100);
                    
                    // 填入詳細地址
                    const addressInput = document.getElementById('addressName');
                    if (addressInput && detail) {
                        addressInput.value = detail;
                    }
                } else {
                    // 如果無法解析，直接填入完整地址
                    const addressInput = document.getElementById('addressName');
                    if (addressInput) {
                        addressInput.value = user.address;
                    }
                }
            }

            console.log('已自動填入使用者資料:', user);
        }

        // ==================== 商品相關 ====================
        
        // 獲取商品背景顏色（根據ID）- 與shoppingCart_v2.js保持一致
        function getProductBackgroundById(productId) {
            // id: 1,2 -> 綠色; id: 3,4 -> 紫色; id: 5,6 -> 粉色
            if (productId === 1 || productId === 2) {
                return 'var(--product-green-light)';
            } else if (productId === 3 || productId === 4) {
                return 'var(--product-purple-light)';
            } else if (productId === 5 || productId === 6) {
                return 'var(--product-pink-light)';
            }
            return 'var(--main-gray-light)';
        }

        // 獲取商品圖片路徑（根據ID）- 與shoppingCart_v2.js保持一致
        function getProductImageById(productId) {
            // id: 1,2 -> 檸檬; id: 3,4 -> 葡萄; id: 5,6 -> 草莓
            if (productId === 1 || productId === 2) {
                return './images/lemon-lime_mockup.png';
            } else if (productId === 3 || productId === 4) {
                return './images/grape_mockup.png';
            } else if (productId === 5 || productId === 6) {
                return './images/strawberry-lemonade_mockup.png';
            }
            return './images/lemon-lime_mockup.png'; // 預設圖片
        }

        // 提取規格中的數字（用於顯示）- 與shoppingCart_v2.js保持一致
        function extractSizeNumber(sizeString) {
            // 將 sizeString 轉為字串
            const str = String(sizeString);
            // 提取開頭的數字部分（支援 1-2 位數字）
            const match = str.match(/^(\d{1,2})/);
            // 如果找到數字就返回，否則返回原始字串
            return match ? match[1] : str;
        }

        // 從 URL 參數獲取購物車資料
        function getCartDataFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            const cartData = urlParams.get('cart');
            const totalData = urlParams.get('total');

            if (cartData && totalData) {
                try {
                    const cart = JSON.parse(decodeURIComponent(cartData));
                    const total = parseFloat(decodeURIComponent(totalData));
                    return { cart, total };
                } catch (error) {
                    console.error('解析購物車資料失敗:', error);
                    return null;
                }
            }
            return null;
        }

        // 更新訂單摘要顯示
        function updateOrderSummary(cartData, total) {
            const orderList = document.querySelector('.order-list');
            const listTitleSum = document.querySelector('.list-title-sum h5');
            const totalBox = document.querySelector('.total-box h5');

            // 更新總計顯示
            if (listTitleSum) listTitleSum.textContent = `$${total.toLocaleString()}`;
            if (totalBox) totalBox.textContent = `$${total.toLocaleString()}`;

            // 清空現有的訂單項目
            const existingItems = orderList.querySelectorAll('.order-item-box');
            existingItems.forEach(item => item.remove());

            // 動態生成訂單項目
            cartData.forEach((item, index) => {
                const orderItemBox = document.createElement('div');
                orderItemBox.className = 'order-item-box';

                // 使用基於ID的函數來獲取背景色和圖片
                const bgColor = getProductBackgroundById(item.productId);
                const imageUrl = item.imageUrl || getProductImageById(item.productId);
                const subtotal = item.price * item.qty;

                orderItemBox.innerHTML = `
                    <div class="order-item-img" style="background-color: ${bgColor}">
                        <span class="order-item-quantity">${item.qty}</span>
                        <h2>${extractSizeNumber(item.size)}</h2>
                        <img src="${imageUrl}" alt="${item.name}" onerror="this.src='${getProductImageById(item.productId)}'">
                    </div>
                    <div class="order-item-info">
                        <div class="order-item-sel-box">
                            <div class="order-item-name">
                                ${item.name}
                            </div>
                            <div class="order-item-size">
                                <p>
                                    ${item.size} x 355ml
                                </p>
                            </div>
                        </div>
                        <div class="order-item-subtotal">$${subtotal.toLocaleString()}</div>
                    </div>
                `;

                // 將新項目插入到禮物卡表單之前
                const giftBox = orderList.querySelector('.gift-box');
                if (giftBox) {
                    orderList.insertBefore(orderItemBox, giftBox);
                } else {
                    orderList.appendChild(orderItemBox);
                }
            });

            // 更新折扣區域的商品數量
            const discountItem = orderList.querySelector('.discount-item p span');
            if (discountItem) {
                const totalItems = cartData.reduce((sum, item) => sum + item.qty, 0);
                discountItem.textContent = totalItems;
            }

            // 更新小計
            const subtotalAmount = document.getElementById('subtotal-amount');
            if (subtotalAmount) {
                subtotalAmount.textContent = `$${total.toLocaleString()}`;
            }

            // 更新商品數量
            const totalItems = document.getElementById('total-items');
            if (totalItems) {
                const totalItemsCount = cartData.reduce((sum, item) => sum + item.qty, 0);
                totalItems.textContent = totalItemsCount;
            }

            // 更新總計
            updateTotal();
        }

        // 應用程式狀態管理
        const AppState = {
            appliedDiscounts: [],
            subtotal: 0,
            discountTypes: {},
            marqueeItems: [],
            isUserLoggedIn: false,
            userInfo: null,
            marqueeInstance: null,
            cartData: null  // 保存購物車資料
        };

        // 向後兼容的變數
        let appliedDiscounts = AppState.appliedDiscounts;
        let subtotal = AppState.subtotal;
        let discountTypes = AppState.discountTypes;
        let marqueeItems = AppState.marqueeItems;
        let isUserLoggedIn = AppState.isUserLoggedIn;
        let userInfo = AppState.userInfo;
        let marqueeInstance = AppState.marqueeInstance;

        // 現代化跑馬燈控制
        class ModernMarquee {
            constructor(containerId) {
                this.container = document.querySelector(containerId);
                this.content = this.container?.querySelector('.marquee-content');
                this.isPaused = false;
                this.animationDuration = 200; // 秒
                this.init();
            }

            init() {
                if (!this.content) return;

                // 設置初始動畫速度
                this.setSpeed(this.animationDuration);

                // 綁定事件
                this.content.addEventListener('mouseenter', () => this.pause());
                this.content.addEventListener('mouseleave', () => this.resume());
            }

            pause() {
                if (this.isPaused) return;
                this.isPaused = true;
                this.content?.classList.add('paused');
            }

            resume() {
                if (!this.isPaused) return;
                this.isPaused = false;
                this.content?.classList.remove('paused');
            }

            setSpeed(duration) {
                this.animationDuration = duration;
                if (this.content) {
                    this.content.style.animationDuration = `${duration}s`;
                }
            }

            // 重新啟動動畫（用於內容更新後）
            restart() {
                if (this.content) {
                    this.content.style.animation = 'none';
                    // 強制重繪
                    this.content.offsetHeight;
                    this.content.style.animation = `marquee-scroll ${this.animationDuration}s linear infinite`;
                }
            }

            destroy() {
                this.content?.classList.add('paused');
            }
        }

        // 跑馬燈實例將在 AppState 中管理

        // 防抖動函數
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // 節流函數
        function throttle(func, limit) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }

        // 檢查用戶登入狀態（使用 auth-helper.js 的函數）
        function checkUserLoginStatus() {
            try {
                // 使用 auth-helper.js 提供的 isLoggedIn() 函數
                if (typeof isLoggedIn === 'function' && isLoggedIn()) {
                    const user = getCurrentUser();
                    AppState.isUserLoggedIn = true;
                    AppState.userInfo = user;
                    console.log('用戶已登入:', user);
                    return true;
                }

                // 備用：檢查 localStorage 中的 user 和 token
                const token = localStorage.getItem('token');
                const userJson = localStorage.getItem('user');
                
                if (token && userJson) {
                    try {
                        const userData = JSON.parse(userJson);
                        AppState.isUserLoggedIn = true;
                        AppState.userInfo = userData;
                        console.log('用戶已登入（備用檢查）:', userData);
                        return true;
                    } catch (e) {
                        console.error('解析使用者資料失敗:', e);
                    }
                }

                AppState.isUserLoggedIn = false;
                AppState.userInfo = null;
                return false;
            } catch (error) {
                console.error('檢查登入狀態失敗:', error);
                AppState.isUserLoggedIn = false;
                AppState.userInfo = null;
                return false;
            }
        }

        // 清除登入數據
        function clearLoginData() {
            AppState.isUserLoggedIn = false;
            AppState.userInfo = null;
            localStorage.removeItem('userLoginData');
            sessionStorage.removeItem('userLoginData');
        }

        // 獲取 Cookie 的輔助函數
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        }


        // 登出
        function logout() {
            localStorage.removeItem('userLoginData');
            sessionStorage.removeItem('userLoginData');
            document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            isUserLoggedIn = false;
            userInfo = null;
            console.log('用戶已登出');
        }

        // 保存當前折扣狀態
        function saveDiscountState() {
            const discountState = {
                appliedDiscounts: appliedDiscounts,
                subtotal: subtotal,
                timestamp: Date.now()
            };

            sessionStorage.setItem('checkoutDiscountState', JSON.stringify(discountState));
            console.log('已保存折扣狀態:', discountState);
        }

        // 恢復折扣狀態
        function restoreDiscountState() {
            try {
                const savedState = sessionStorage.getItem('checkoutDiscountState');
                if (savedState) {
                    const discountState = JSON.parse(savedState);

                    // 檢查時間戳，如果超過30分鐘則不恢復
                    const now = Date.now();
                    const thirtyMinutes = 30 * 60 * 1000;

                    if (now - discountState.timestamp < thirtyMinutes) {
                        appliedDiscounts = discountState.appliedDiscounts || [];
                        subtotal = discountState.subtotal || 0;

                        // 更新顯示
                        updateDiscountDisplay();
                        updateTotal();

                        console.log('已恢復折扣狀態:', discountState);
                        return true;
                    } else {
                        // 過期，清除保存的狀態
                        sessionStorage.removeItem('checkoutDiscountState');
                        console.log('折扣狀態已過期，已清除');
                    }
                }
            } catch (error) {
                console.error('恢復折扣狀態失敗:', error);
                sessionStorage.removeItem('checkoutDiscountState');
            }
            return false;
        }

        // 清除保存的折扣狀態
        function clearDiscountState() {
            sessionStorage.removeItem('checkoutDiscountState');
            console.log('已清除保存的折扣狀態');
        }

        // 檢查是否從登入頁面返回
        function checkLoginReturn() {
            const urlParams = new URLSearchParams(window.location.search);
            const loginSuccess = urlParams.get('loginSuccess');
            const loginError = urlParams.get('loginError');

            if (loginSuccess === 'true') {
                // 登入成功，重新檢查登入狀態
                checkUserLoginStatus();

                // 清除保存的折扣狀態（因為登入成功，不需要恢復）
                clearDiscountState();

                // 重新套用自動優惠
                setTimeout(() => {
                    applyAutoDiscounts();
                }, 100);

                // 顯示成功訊息
                pauseMarquee();
                alert('登入成功！已為您套用相關優惠。');
                resumeMarquee();

                // 清除 URL 參數
                const newUrl = window.location.pathname + window.location.search.replace(/[?&]loginSuccess=true/, '').replace(/[?&]loginError=[^&]*/, '');
                window.history.replaceState({}, document.title, newUrl);
            } else if (loginError) {
                // 登入失敗
                pauseMarquee();
                alert('登入失敗：' + decodeURIComponent(loginError));
                resumeMarquee();

                // 清除 URL 參數
                const newUrl = window.location.pathname + window.location.search.replace(/[?&]loginError=[^&]*/, '');
                window.history.replaceState({}, document.title, newUrl);
            }
        }

        // 從 API 載入優惠券資料
        async function loadDiscountData() {
            try {
                // 這裡可以替換 API 端點
                const response = await fetch('/api/discounts');
                if (!response.ok) throw new Error('無法載入優惠券資料');

                const data = await response.json();
                discountTypes = data.discountTypes || {};
                marqueeItems = data.marqueeItems || [];

                console.log('從 API 載入優惠券資料成功:', discountTypes);

                // 更新跑馬燈內容
                updateMarqueeContent();
            } catch (error) {
                console.error('載入優惠券資料失敗:', error);
                console.log('使用預設優惠券資料');
                // 使用預設資料作為備用
                loadDefaultDiscountData();
            }
        }

        // 預設優惠券資料（API 失敗時使用）
        function loadDefaultDiscountData() {
            discountTypes = {
                // 活動優惠（特殊節慶）
                1: {
                    id: 1,
                    name: '歡慶聖誕 88 折',
                    type: 'percentage',
                    value: 0.12,
                    discountType: 'event', // 活動優惠
                    isActive: true,
                    startDate: '2024-12-01',
                    endDate: '2026-12-31',
                    autoApply: true // 自動套用
                },
                // 新好友優惠
                2: {
                    id: 2,
                    name: '登入獲得新好友折價',
                    type: 'fixed',
                    value: 100,
                    discountType: 'newuser', // 新好友優惠
                    isActive: true,
                    startDate: '2024-01-01',
                    endDate: '2026-12-31',
                    autoApply: true, // 自動套用
                    requiresLogin: true // 需要登入
                },
                // 優惠券（需要手動輸入代碼）
                3: {
                    id: 3,
                    name: '使用優惠',
                    type: 'coupon',
                    value: 200,
                    code: 'SODA200',
                    discountType: 'coupon', // 優惠券
                    isActive: true,
                    startDate: '2024-01-01',
                    endDate: '2026-12-31',
                    autoApply: false, // 不自動套用
                    minAmount: 2500 // 最低消費限制
                },
                4: {
                    id: 4,
                    name: '30%OFF',
                    type: 'percentage',
                    value: 0.3,
                    code: 'coupon30',
                    discountType: 'coupon', // 優惠券
                    isActive: true,
                    startDate: '2024-01-01',
                    endDate: '2026-12-31',
                    autoApply: false // 不自動套用
                },
                5: {
                    id: 5,
                    name: '50%OFF',
                    type: 'percentage',
                    value: 0.5,
                    code: 'coupon50',
                    discountType: 'coupon', // 優惠券
                    isActive: true,
                    startDate: '2024-01-01',
                    endDate: '2026-12-31',
                    autoApply: false // 不自動套用
                },
                6: {
                    id: 6,
                    name: '70%OFF',
                    type: 'percentage',
                    value: 0.7,
                    code: 'coupon70',
                    discountType: 'coupon', // 優惠券
                    isActive: true,
                    startDate: '2024-01-01',
                    endDate: '2026-12-31',
                    autoApply: false // 不自動套用
                }
            };

            marqueeItems = [
                { discountId: 1, text: '歡慶聖誕 88 折' },
                { discountId: 2, text: '登入獲得新好友折價' },
                { discountId: 3, text: '滿兩千五折兩百' },
                { discountId: 4, text: '30%OFF' },
                { discountId: 5, text: '50%OFF' },
                { discountId: 6, text: '70%OFF' }
            ];

            console.log('載入預設優惠券資料:', discountTypes);
            console.log('SODA200 優惠券資料:', discountTypes.coupon);

            updateMarqueeContent();
        }

        // 更新跑馬燈內容
        function updateMarqueeContent() {
            const marquee = document.querySelector('#discount-marquee');
            if (!marquee) return;

            // 生成更多重複的內容，確保畫面始終有內容
            const repeatedItems = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems];

            marquee.innerHTML = repeatedItems.map(item => {
                const discount = discountTypes[item.discountId];
                if (!discount || !discount.isActive) return '';

                return `
                    <span class="marquee-item" 
                          data-discount="${item.discountId}" 
                          data-type="${discount.type}" 
                          data-value="${discount.value}"
                          ${discount.code ? `data-code="${discount.code}"` : ''}>
                        ${item.text}
                    </span>
                `;
            }).join('');

            // 重新綁定點擊事件
            bindMarqueeEvents();

            // 重新啟動動畫
            if (marqueeInstance) {
                marqueeInstance.restart();
            }
        }

        // 綁定跑馬燈事件
        function bindMarqueeEvents() {
            const marquee = document.querySelector('#discount-marquee');
            if (!marquee) return;

            // 移除舊的事件監聽器
            marquee.removeEventListener('click', handleMarqueeClick);

            // 添加新的事件監聽器
            marquee.addEventListener('click', handleMarqueeClick);
        }

        // 計算折扣（累進式計算，每個折扣基於已折扣後的金額）
        function calculateDiscounts() {
            let currentAmount = subtotal; // 當前金額，從小計開始
            let totalDiscount = 0;
            
            appliedDiscounts.forEach(discount => {
                let discountAmount = 0;
                
                if (discount.type === 'percentage') {
                    // ⭐ 百分比折扣基於當前金額計算
                    discountAmount = Math.floor(currentAmount * discount.value);
                } else if (discount.type === 'fixed' || discount.type === 'coupon') {
                    // 固定金額折扣
                    discountAmount = discount.value;
                }
                
                // ⭐ 確保折扣不會讓金額變成負數
                discountAmount = Math.min(discountAmount, currentAmount);
                
                totalDiscount += discountAmount;
                currentAmount -= discountAmount; // 更新當前金額
            });
            
            return totalDiscount;
        }

        // 更新總計顯示
        function updateTotal() {
            const totalDiscount = calculateDiscounts();
            const finalTotal = subtotal - totalDiscount;

            // 更新總計顯示
            const totalBox = document.querySelector('.total-box h5');
            if (totalBox) {
                totalBox.textContent = `$${finalTotal.toLocaleString()}`;
            }

            // 更新訂單摘要總計
            const listTitleSum = document.querySelector('.list-title-sum h5');
            if (listTitleSum) {
                listTitleSum.textContent = `$${finalTotal.toLocaleString()}`;
            }
        }

        // 計算優惠券折扣金額（基於當前已折扣後的金額）
        function calculateDiscountAmount(discount) {
            // ⭐ 先計算目前已套用的折扣後的剩餘金額
            let currentAmount = subtotal;
            appliedDiscounts.forEach(appliedDiscount => {
                let discountAmount = 0;
                if (appliedDiscount.type === 'percentage') {
                    discountAmount = Math.floor(currentAmount * appliedDiscount.value);
                } else if (appliedDiscount.type === 'fixed' || appliedDiscount.type === 'coupon') {
                    discountAmount = appliedDiscount.value;
                }
                // 確保折扣不會讓金額變成負數
                discountAmount = Math.min(discountAmount, currentAmount);
                currentAmount -= discountAmount;
            });
            
            // ⭐ 基於當前金額計算新的折扣
            let newDiscountAmount = 0;
            if (discount.type === 'percentage') {
                newDiscountAmount = Math.floor(currentAmount * discount.value);
            } else if (discount.type === 'fixed' || discount.type === 'coupon') {
                newDiscountAmount = discount.value;
            }
            
            // ⭐ 確保新折扣不會讓金額變成負數
            newDiscountAmount = Math.min(newDiscountAmount, currentAmount);
            
            return newDiscountAmount;
        }

        // 添加折扣項目
        function addDiscountItem(discountId) {
            const discount = discountTypes[discountId];
            if (!discount) return;

            // 檢查最低消費限制
            if (discount.minAmount && subtotal < discount.minAmount) {
                pauseMarquee();
                alert(`此優惠券需要最低消費 $${discount.minAmount.toLocaleString()}，目前小計 $${subtotal.toLocaleString()}`);
                resumeMarquee();
                return;
            }

            // 檢查登入要求
            if (discount.requiresLogin && !AppState.isUserLoggedIn) {
                pauseMarquee();
                const shouldLogin = confirm('此優惠需要登入才能使用！\n\n點擊「確定」前往登入頁面，或點擊「取消」繼續購物。');
                if (shouldLogin) {
                    // 保存當前折扣狀態
                    saveDiscountState();

                    // 記錄當前頁面，登入後返回
                    localStorage.setItem('redirectAfterLogin', './checkouts.html' + window.location.search);

                    // 重定向到登入頁面
                    window.location.href = './login.html';
                } else {
                    resumeMarquee();
                }
                return;
            }

            // 檢查是否已經使用過此折扣
            if (appliedDiscounts.find(d => d.id == discountId)) {
                pauseMarquee();
                alert('已套用優惠');
                resumeMarquee();
                return;
            }

            // ⭐ 先計算當前已折扣後的金額
            const currentTotalDiscount = calculateDiscounts();
            const currentAmount = subtotal - currentTotalDiscount;
            
            // ⭐ 計算新的折扣金額（已經基於當前金額）
            const newDiscountAmount = calculateDiscountAmount(discount);
            
            // ⭐ 計算套用新折扣後的最終金額
            const finalAmountAfterNewDiscount = currentAmount - newDiscountAmount;
            
            if (finalAmountAfterNewDiscount < 10) {
                pauseMarquee();
                alert(`使用此優惠券後結帳金額將低於 $10，無法使用！\n\n目前小計：$${subtotal.toLocaleString()}\n已折扣後金額：$${currentAmount.toLocaleString()}\n使用後金額：$${finalAmountAfterNewDiscount.toLocaleString()}\n最低結帳金額：$10`);
                resumeMarquee();
                return;
            }
            const newDiscount = {
                id: discountId,
                name: discount.name,
                type: discount.type,
                value: discount.value,
                amount: newDiscountAmount,
                code: discount.code,
                discountType: discount.discountType
            };

            // ⭐ 移除比較邏輯，所有優惠券都可以使用
            // 直接添加優惠券（已經在前面檢查過金額不會小於10）
            appliedDiscounts.push(newDiscount);
            updateDiscountDisplay();
            
            // 顯示成功訊息
            pauseMarquee();
            alert('✨ 優惠券已成功套用！');
            resumeMarquee();

            // 更新總計
            updateTotal();

            // 保存當前折扣狀態
            saveDiscountState();
        }

        // 生成折扣顯示名稱
        function generateDiscountDisplayName(discount) {
            const prefix = '使用優惠';

            // 根據折扣類型決定顯示內容
            switch (discount.discountType) {
                case 'event':
                    // 活動優惠：顯示活動名稱
                    return `${prefix}：${discount.name}`;

                case 'newuser':
                    // 新好友優惠：顯示優惠名稱
                    return `${prefix}：${discount.name}`;

                case 'coupon':
                    // 優惠券：顯示優惠券代碼
                    return `${prefix}：${discount.code || discount.id}`;

                default:
                    // 預設：使用名稱
                    return `${prefix}：${discount.name}`;
            }
        }

        // 更新折扣顯示
        function updateDiscountDisplay() {
            const container = document.getElementById('discount-items-container');
            container.innerHTML = '';

            // ⭐ 累進計算每個折扣的實際扣除金額
            let currentAmount = subtotal;
            
            appliedDiscounts.forEach(discount => {
                const discountItem = document.createElement('div');
                discountItem.className = 'discount-item';

                // ⭐ 計算這個折扣的實際扣除金額（基於當前金額）
                let actualDiscountAmount = 0;
                if (discount.type === 'percentage') {
                    actualDiscountAmount = Math.floor(currentAmount * discount.value);
                } else if (discount.type === 'fixed' || discount.type === 'coupon') {
                    actualDiscountAmount = discount.value;
                }
                // 確保不超過當前金額
                actualDiscountAmount = Math.min(actualDiscountAmount, currentAmount);
                currentAmount -= actualDiscountAmount; // 更新當前金額

                // 使用動態生成函數
                const displayName = generateDiscountDisplayName(discount);

                // ⭐ 顯示實際扣除的金額
                discountItem.innerHTML = `
                    <p>${displayName}</p>
                    <p>-$${actualDiscountAmount.toLocaleString()}</p>
                `;

                container.appendChild(discountItem);
            });

            // 保存當前折扣狀態
            saveDiscountState();
        }

        // 處理跑馬燈點擊事件
        function handleMarqueeClick(event) {
            const target = event.target;
            if (target.classList.contains('marquee-item')) {
                const discountId = target.dataset.discount;
                const discount = discountTypes[discountId];

                if (discount) {
                    if (discount.discountType === 'coupon') {
                        // 優惠券：複製到輸入框
                        const giftInput = document.querySelector('.gift-box .input-box');
                        if (giftInput) {
                            giftInput.value = discount.code || discountId;
                            giftInput.focus();
                        }
                    } else if (discount.discountType === 'event' || discount.discountType === 'newuser') {
                        // 活動優惠和新好友優惠：直接套用
                        addDiscountItem(discountId);
                    }
                }
            }
        }

        // 驗證優惠代碼
        async function validateCouponCode(code) {
            try {
                // 這裡可以替換為您的 API 端點
                const response = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
                if (!response.ok) throw new Error('API 請求失敗');

                const data = await response.json();
                return data.valid ? data.discount : null;
            } catch (error) {
                console.error('驗證優惠代碼失敗:', error);
                // 離線模式：檢查本地優惠券資料
                console.log('使用離線模式驗證優惠代碼:', code);

                // 支援所有類型的優惠券（包括百分比和固定金額）
                const discount = Object.values(discountTypes).find(d =>
                    (d.code === code || d.id == code) && d.isActive
                );

                console.log('找到的折扣:', discount);

                // 檢查最低消費限制
                if (discount && discount.minAmount) {
                    if (subtotal < discount.minAmount) {
                        console.log(`優惠券 ${code} 需要最低消費 ${discount.minAmount}，目前小計 ${subtotal}`);
                        return {
                            ...discount,
                            validationError: `此優惠券需要最低消費 $${discount.minAmount.toLocaleString()}，目前小計 $${subtotal.toLocaleString()}`
                        };
                    }
                }

                // 檢查登入要求
                if (discount && discount.requiresLogin) {
                    if (!AppState.isUserLoggedIn) {
                        console.log(`優惠券 ${code} 需要登入，目前未登入`);
                        return {
                            ...discount,
                            validationError: '此優惠需要登入才能使用，請先登入！',
                            requiresLogin: true
                        };
                    }
                }

                return discount || null;
            }
        }

        // 處理禮物卡使用按鈕
        async function handleGiftCodeSubmit(event) {
            event.preventDefault();
            const giftInput = document.querySelector('.gift-box .input-box');
            const code = giftInput.value.trim();

            if (!code) return;

            console.log('驗證優惠代碼:', code);
            const discount = await validateCouponCode(code);
            console.log('驗證結果:', discount);

            if (discount) {
                // 檢查是否有驗證錯誤（如最低消費限制）
                if (discount.validationError) {
                    console.log('優惠代碼驗證失敗:', discount.validationError);
                    pauseMarquee();
                    alert(discount.validationError);
                    resumeMarquee();
                    return;
                }

                console.log('優惠代碼有效，添加折扣項目');
                addDiscountItem(discount.id);
                giftInput.value = ''; // 清空輸入框
            } else {
                console.log('優惠代碼無效');
                pauseMarquee();
                alert('無效的優惠代碼！');
                resumeMarquee();
            }
        }

        // 自動套用活動優惠和新好友優惠
        function applyAutoDiscounts() {
            const now = new Date();
            const autoDiscounts = Object.values(discountTypes).filter(discount =>
                discount.isActive &&
                discount.autoApply &&
                new Date(discount.startDate) <= now &&
                new Date(discount.endDate) >= now
            );

            autoDiscounts.forEach(discount => {
                // 檢查是否已經使用過
                if (!appliedDiscounts.find(d => d.id === discount.id)) {
                    // 檢查是否需要登入
                    if (discount.requiresLogin && !AppState.isUserLoggedIn) {

                        console.log('跳過需要登入的優惠:', discount.name);
                        return;
                    }

                    console.log('自動套用優惠:', discount.name);
                    addDiscountItem(discount.id);
                }
            });
        }

        document.addEventListener('DOMContentLoaded', async function () {
            // 檢查是否從登入頁面返回
            checkLoginReturn();

            // 檢查用戶登入狀態
            checkUserLoginStatus();
            
            // ⭐ 新增：自動填入登入用戶的資料
            initializeUserDataOnLoad();
            
            // 💾 恢復之前保存的表單資料（在用戶資料之後，避免被覆蓋）
            restoreFormData();

            // 載入優惠券資料
            await loadDiscountData();

            // 載入購物車資料並更新顯示
            const cartData = getCartDataFromURL();
            if (cartData) {
                subtotal = cartData.total;
                AppState.cartData = cartData;  // 保存購物車資料
                updateOrderSummary(cartData.cart, cartData.total);
            } else {
                console.warn('未找到購物車資料，使用預設顯示');
                subtotal = 2994; // 預設小計
            }

            // 嘗試恢復之前保存的折扣狀態
            const stateRestored = restoreDiscountState();

            if (!stateRestored) {
                // 如果沒有恢復到狀態，才自動套用活動優惠和新好友優惠
                applyAutoDiscounts();
            }

            // 初始化現代化跑馬燈
            marqueeInstance = new ModernMarquee('.marquee-container');

            // 綁定跑馬燈點擊事件
            bindMarqueeEvents();

            // 綁定禮物卡表單提交事件
            const giftForm = document.querySelector('.gift-box');
            if (giftForm) {
                giftForm.addEventListener('submit', handleGiftCodeSubmit);
            }

            const titleBox = document.querySelector('.list-title-box');
            const orderList = document.querySelector('.order-list');
            const arrowIcon = document.querySelector('.list-title img');

            // 既有：點擊切換
            titleBox.addEventListener('click', function () {
                orderList.classList.toggle('hidden');
                arrowIcon.classList.toggle('rotate');
            });

            // 斷點：1140px 以下 = 中尺寸；以上 = 全螢幕（桌機）
            const mq = window.matchMedia('(max-width: 1140px)');

            function syncPanel(e) {
                if (e.matches) {
                    // 進入響應式模式：預設打開，不釘頂
                    orderList.classList.remove('hidden');
                    arrowIcon.classList.remove('rotate'); // 讓箭頭朝下顯示可收起
                } else {
                    // 回到全螢幕：一定展開並釘頂
                    orderList.classList.remove('hidden');
                    // 清掉可能殘留的 inline 樣式
                    orderList.style.removeProperty('display');
                    orderList.style.removeProperty('height');
                    orderList.style.removeProperty('opacity');
                    orderList.style.removeProperty('transition');
                    arrowIcon.classList.remove('rotate'); // 桌機不需要旋轉狀態
                }
            }

            // 初次載入就同步一次（避免一開頁就錯誤狀態）
            syncPanel(mq);
            // 視窗大小改變時同步
            mq.addEventListener('change', syncPanel);
            
            // 💾 設置表單資料自動保存功能
            setupAutoSaveFormData();

            // 🍎 初始化 Apple Pay 按鈕
            initApplePayButton();

            // 🔵 初始化 Google Pay 按鈕
            initGooglePayButton();

            // 🟠 初始化 Amazon Pay 按鈕
            initAmazonPayButton();
        });

        // === 全台縣市與郵遞區號資料 ===
        const taiwanZipData = {
            "台北市": {
                "中正區": "100", "大同區": "103", "中山區": "104", "松山區": "105",
                "大安區": "106", "萬華區": "108", "信義區": "110", "士林區": "111",
                "北投區": "112", "內湖區": "114", "南港區": "115", "文山區": "116"
            },
            "新北市": {
                "萬里區": "207", "金山區": "208", "板橋區": "220", "汐止區": "221", "深坑區": "222",
                "石碇區": "223", "瑞芳區": "224", "平溪區": "226", "雙溪區": "227", "貢寮區": "228",
                "新店區": "231", "坪林區": "232", "烏來區": "233", "永和區": "234", "中和區": "235",
                "土城區": "236", "三峽區": "237", "樹林區": "238", "鶯歌區": "239", "三重區": "241",
                "新莊區": "242", "泰山區": "243", "林口區": "244", "蘆洲區": "247", "五股區": "248",
                "八里區": "249", "淡水區": "251", "三芝區": "252", "石門區": "253"
            },
            "桃園市": {
                "中壢區": "320", "平鎮區": "324", "龍潭區": "325", "楊梅區": "326", "新屋區": "327",
                "觀音區": "328", "桃園區": "330", "龜山區": "333", "八德區": "334", "大溪區": "335",
                "復興區": "336", "大園區": "337", "蘆竹區": "338"
            },
            "台中市": {
                "中區": "400", "東區": "401", "南區": "402", "西區": "403", "北區": "404",
                "北屯區": "406", "西屯區": "407", "南屯區": "408", "太平區": "411", "大里區": "412",
                "霧峰區": "413", "烏日區": "414", "豐原區": "420", "后里區": "421", "東勢區": "423",
                "石岡區": "422", "新社區": "426", "潭子區": "427", "大雅區": "428", "神岡區": "429",
                "大肚區": "432", "沙鹿區": "433", "龍井區": "434", "梧棲區": "435", "清水區": "436",
                "大甲區": "437", "外埔區": "438", "大安區": "439"
            },
            "台南市": {
                "中西區": "700", "東區": "701", "南區": "702", "北區": "704", "安平區": "708",
                "安南區": "709", "永康區": "710", "歸仁區": "711", "新化區": "712", "左鎮區": "713",
                "玉井區": "714", "楠西區": "715", "南化區": "716", "仁德區": "717", "關廟區": "718",
                "龍崎區": "719", "官田區": "720", "麻豆區": "721", "佳里區": "722", "西港區": "723",
                "七股區": "724", "將軍區": "725", "學甲區": "726", "北門區": "727", "新營區": "730",
                "後壁區": "731", "白河區": "732", "東山區": "733", "六甲區": "734", "下營區": "735",
                "柳營區": "736", "鹽水區": "737", "善化區": "741", "大內區": "742", "山上區": "743",
                "新市區": "744", "安定區": "745"
            },
            "高雄市": {
                "新興區": "800", "前金區": "801", "苓雅區": "802", "鹽埕區": "803", "鼓山區": "804",
                "旗津區": "805", "前鎮區": "806", "三民區": "807", "楠梓區": "811", "小港區": "812",
                "左營區": "813", "仁武區": "814", "大社區": "815", "岡山區": "820", "路竹區": "821",
                "阿蓮區": "822", "田寮區": "823", "燕巢區": "824", "橋頭區": "825", "梓官區": "826",
                "彌陀區": "827", "永安區": "828", "湖內區": "829", "鳳山區": "830", "大寮區": "831",
                "林園區": "832", "鳥松區": "833", "大樹區": "840", "旗山區": "842", "美濃區": "843",
                "六龜區": "844", "甲仙區": "847", "杉林區": "846", "內門區": "845", "茄萣區": "852"
            },
            "宜蘭縣": {
                "宜蘭市": "260", "羅東鎮": "265", "蘇澳鎮": "270", "頭城鎮": "261", "礁溪鄉": "262",
                "壯圍鄉": "263", "員山鄉": "264", "冬山鄉": "269", "五結鄉": "268", "三星鄉": "266",
                "大同鄉": "267", "南澳鄉": "272"
            },
            "花蓮縣": {
                "花蓮市": "970", "鳳林鎮": "975", "玉里鎮": "981", "新城鄉": "971", "吉安鄉": "973",
                "壽豐鄉": "974", "光復鄉": "976", "豐濱鄉": "977", "瑞穗鄉": "978", "富里鄉": "983",
                "秀林鄉": "972", "萬榮鄉": "979", "卓溪鄉": "982"
            },
            "台東縣": {
                "台東市": "950", "成功鎮": "961", "關山鎮": "956", "卑南鄉": "954", "鹿野鄉": "955",
                "池上鄉": "958", "東河鄉": "959", "長濱鄉": "962", "太麻里鄉": "963", "大武鄉": "965",
                "綠島鄉": "951", "延平鄉": "953", "海端鄉": "957", "達仁鄉": "966", "金峰鄉": "964",
                "蘭嶼鄉": "952"
            },
            "屏東縣": {
                "屏東市": "900", "潮州鎮": "920", "東港鎮": "928", "恆春鎮": "946", "萬丹鄉": "913",
                "內埔鄉": "912", "麟洛鄉": "909", "竹田鄉": "911", "長治鄉": "908", "九如鄉": "904",
                "里港鄉": "905", "鹽埔鄉": "907", "高樹鄉": "906", "萬巒鄉": "923", "新埤鄉": "925",
                "枋寮鄉": "940", "枋山鄉": "941", "三地門鄉": "901", "瑪家鄉": "903"
            },
            "澎湖縣": { "馬公市": "880", "湖西鄉": "885", "白沙鄉": "884", "西嶼鄉": "881", "望安鄉": "882", "七美鄉": "883" },
            "金門縣": { "金城鎮": "893", "金沙鎮": "890", "金湖鎮": "891", "金寧鄉": "892", "烈嶼鄉": "894", "烏坵鄉": "896" },
            "連江縣": { "南竿鄉": "209", "北竿鄉": "210", "莒光鄉": "211", "東引鄉": "212" }
        };

        const citySelect = document.getElementById("city");
        const districtSelect = document.getElementById("district");
        const zipcodeInput = document.getElementById("zipcode-input");

        // === 初始化縣市選單 ===
        Object.keys(taiwanZipData).forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });

        // === 當縣市變更時，更新區域選單 ===
        citySelect.addEventListener("change", () => {
            const selectedCity = citySelect.value;
            const districts = Object.keys(taiwanZipData[selectedCity]);

            // 重置區域下拉選單
            districtSelect.innerHTML = '<option value="" selected disabled>請選擇區域</option>';

            // 動態生成各區
            districts.forEach(d => {
                const opt = document.createElement("option");
                opt.value = d;
                opt.textContent = d;
                districtSelect.appendChild(opt);
            });

            // 清空郵遞區號
            zipcodeInput.value = "";
        });

        // === 當選擇區域時，自動帶出郵遞區號 ===
        districtSelect.addEventListener("change", () => {
            const city = citySelect.value;
            const district = districtSelect.value;
            const zip = taiwanZipData[city]?.[district];

            console.log("查到郵遞區號：", zip);

            if (zip) {
                zipcodeInput.value = zip;
            } else {
                zipcodeInput.value = "沒有";
            }
        });
        // 自動生成月份 (01–12)
        const monthSelect = document.getElementById("cardMonth");
        for (let i = 1; i <= 12; i++) {
            const month = i.toString().padStart(2, "0");
            monthSelect.innerHTML += `<option value="${month}">${month}</option>`;
        }

        // 自動生成年份 (今年到 +10年)
        const yearSelect = document.getElementById("cardYear");
        const currentYear = new Date().getFullYear();
        for (let i = 0; i <= 10; i++) {
            const year = currentYear + i;
            yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
        }

        // ==================== 訂單提交功能 ====================

        // 綁定立即付款按鈕
        const payNowBtn = document.querySelector('.pay-now-btn');
        if (payNowBtn) {
            payNowBtn.addEventListener('click', handleOrderSubmit);
        }

        // ==================== Apple Pay 功能 ====================

        // 檢查 Apple Pay 是否可用
        function checkApplePayAvailable() {
            // 檢查是否在支持的瀏覽器中（Safari、Chrome on macOS/iOS）
            if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
                return true;
            }
            return false;
        }

        // 初始化 Apple Pay 按鈕
        function initApplePayButton() {
            const applePayBtn = document.querySelector('.applePay');
            if (!applePayBtn) return;

            // 檢查是否支持 Apple Pay
            if (!checkApplePayAvailable()) {
                // 如果不支持，隱藏按鈕或顯示提示
                applePayBtn.style.opacity = '0.5';
                applePayBtn.style.cursor = 'not-allowed';
                applePayBtn.title = '您的設備不支持 Apple Pay';
                return;
            }

            // 綁定點擊事件
            applePayBtn.style.cursor = 'pointer';
            applePayBtn.addEventListener('click', handleApplePay);
        }

        // 處理 Apple Pay 支付
        async function handleApplePay(event) {
            event.preventDefault();

            // 檢查是否支持 Apple Pay
            if (!checkApplePayAvailable()) {
                pauseMarquee();
                alert('您的設備不支持 Apple Pay，請使用其他付款方式。');
                resumeMarquee();
                return;
            }

            // 0. 檢查登入狀態
            if (!getCurrentUser()) {
                const confirmLogin = confirm('結帳需要登入會員，是否前往登入？');
                if (confirmLogin) {
                    sessionStorage.setItem('returnUrl', window.location.href);
                    window.location.href = './login.html';
                }
                return;
            }

            // 1. 驗證基本表單（只驗證收件資料，不需要信用卡資料）
            const email = document.getElementById('email').value.trim();
            const firstName = document.getElementById('deliveryFirstName').value.trim();
            const lastName = document.getElementById('deliveryLaName').value.trim();
            const tel = document.getElementById('deliveryTel').value.trim();
            const city = document.getElementById('city').value;
            const district = document.getElementById('district').value;
            const address = document.getElementById('addressName').value.trim();

            if (!firstName || !lastName || !tel || !city || !district || !address) {
                alert('請完整填寫收件人資料');
                return;
            }

            if (email && !isValidEmail(email)) {
                alert('請輸入有效的電子郵件地址');
                return;
            }

            if (!isValidPhone(tel)) {
                alert('請輸入有效的聯絡電話');
                return;
            }

            // 2. 收集訂單資料並檢查金額限制
            let orderData;
            try {
                orderData = collectOrderData('Apple Pay');
            } catch (error) {
                pauseMarquee();
                alert(error.message);
                resumeMarquee();
                return;
            }

            // 3. 計算最終金額
            const totalDiscount = calculateDiscounts();
            const finalAmount = subtotal - totalDiscount;

            // 4. 創建 Apple Pay 支付請求
            try {
                pauseMarquee();

                const request = {
                    countryCode: 'TW',
                    currencyCode: 'TWD',
                    supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
                    merchantCapabilities: ['supports3DS'],
                    total: {
                        label: 'Soda 能量飲',
                        amount: finalAmount.toFixed(2),
                        type: 'final'
                    },
                    requiredShippingContactFields: ['postalAddress', 'name', 'phone', 'email'],
                    lineItems: []
                };

                // 添加購物車項目到 lineItems（可選，用於顯示明細）
                if (AppState.cartData && AppState.cartData.cart) {
                    AppState.cartData.cart.forEach(item => {
                        const itemTotal = item.price * item.qty;
                        request.lineItems.push({
                            label: `${item.name} ${item.size}`,
                            amount: itemTotal.toFixed(2),
                            type: 'final'
                        });
                    });

                    // 如果有折扣，顯示折扣項目
                    if (totalDiscount > 0) {
                        request.lineItems.push({
                            label: '折扣',
                            amount: (-totalDiscount).toFixed(2),
                            type: 'final'
                        });
                    }
                }

                // 創建 Apple Pay Session
                const session = new ApplePaySession(3, request);

                // 處理驗證商家
                session.onvalidatemerchant = async (event) => {
                    try {
                        // 在實際生產環境中，這裡應該調用後端 API 來驗證商家
                        // 目前使用模擬驗證
                        const merchantSession = {
                            epochTimestamp: Date.now(),
                            expiresAt: Date.now() + 3600000,
                            merchantSessionIdentifier: 'merchant.session.' + Date.now(),
                            nonce: 'nonce-' + Date.now(),
                            merchantIdentifier: 'merchant.com.soda',
                            domainName: window.location.hostname,
                            displayName: 'Soda 能量飲'
                        };

                        session.completeMerchantValidation(merchantSession);
                    } catch (error) {
                        console.error('商家驗證失敗:', error);
                        session.abort();
                        alert('Apple Pay 驗證失敗，請使用其他付款方式。');
                        resumeMarquee();
                    }
                };

                // 處理支付授權
                session.onpaymentauthorized = async (event) => {
                    try {
                        // 這裡應該將支付令牌發送到後端進行處理
                        // 在實際環境中，應該使用後端 API 來處理支付
                        console.log('Apple Pay 授權成功:', event.payment);

                        // 更新訂單資料（使用 Apple Pay 提供的聯絡資訊，如果有的話）
                        if (event.payment.shippingContact) {
                            const contact = event.payment.shippingContact;
                            if (contact.givenName && contact.familyName) {
                                orderData.ReceiverName = `${contact.familyName} ${contact.givenName}`;
                            }
                            if (contact.postalAddress) {
                                const addr = contact.postalAddress;
                                orderData.ShippingAddress = `${addr.postalCode || ''} ${addr.country || ''}${addr.state || ''}${addr.city || ''}${addr.street || ''}`;
                            }
                        }

                        // 提交訂單到後端
                        const response = await submitOrder(orderData);

                        if (response.success) {
                            // 支付成功
                            session.completePayment({
                                status: ApplePaySession.STATUS_SUCCESS
                            });

                            alert(`訂單建立成功！\n訂單編號：${response.orderId}\n\n感謝您的訂購！`);

                            // 清除購物車資料和表單資料
                            localStorage.removeItem('cartData');
                            clearDiscountState();
                            clearSavedFormData();

                            // 導向訂單歷史頁面
                            window.location.href = './orderHistory.html';
                        } else {
                            // 訂單建立失敗
                            session.completePayment({
                                status: ApplePaySession.STATUS_FAILURE
                            });
                            alert('訂單建立失敗：' + response.message);
                        }
                        resumeMarquee();
                    } catch (error) {
                        console.error('處理 Apple Pay 支付時發生錯誤:', error);
                        session.completePayment({
                            status: ApplePaySession.STATUS_FAILURE
                        });
                        alert('處理支付時發生錯誤：' + error.message);
                        resumeMarquee();
                    }
                };

                // 處理取消
                session.oncancel = () => {
                    console.log('Apple Pay 已取消');
                    resumeMarquee();
                };

                // 開始 Apple Pay 流程
                session.begin();

            } catch (error) {
                console.error('啟動 Apple Pay 失敗:', error);
                alert('無法啟動 Apple Pay，請使用其他付款方式。');
                resumeMarquee();
            }
        }

        // ==================== Google Pay 功能 ====================

        // 檢查 Payment Request API 是否可用（Google Pay 使用此 API）
        function checkGooglePayAvailable() {
            // 檢查是否支援 Payment Request API
            if (window.PaymentRequest) {
                // 檢查是否支援 Google Pay
                try {
                    const paymentRequest = new PaymentRequest(
                        [{
                            supportedMethods: 'https://google.com/pay',
                            data: {
                                environment: 'TEST',
                                apiVersion: 2,
                                apiVersionMinor: 0,
                                merchantInfo: {
                                    merchantId: 'merchant.com.soda',
                                    merchantName: 'Soda 能量飲'
                                },
                                allowedPaymentMethods: [{
                                    type: 'CARD',
                                    parameters: {
                                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                        allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
                                    }
                                }]
                            }
                        }],
                        {
                            total: {
                                label: 'Soda 能量飲',
                                amount: {
                                    currency: 'TWD',
                                    value: '1.00'
                                }
                            }
                        }
                    );

                    // 檢查是否可以使用
                    return paymentRequest.canMakePayment().then(result => {
                        paymentRequest.abort();
                        return result !== null;
                    }).catch(() => false);
                } catch (error) {
                    console.log('Google Pay 檢查錯誤:', error);
                    return Promise.resolve(false);
                }
            }
            return Promise.resolve(false);
        }

        // 初始化 Google Pay 按鈕
        async function initGooglePayButton() {
            const googlePayBtn = document.querySelector('.googlePay');
            if (!googlePayBtn) return;

            // 檢查是否支持 Google Pay
            try {
                const isAvailable = await checkGooglePayAvailable();
                if (!isAvailable) {
                    // 如果不支持，降低透明度並顯示提示
                    googlePayBtn.style.opacity = '0.5';
                    googlePayBtn.style.cursor = 'not-allowed';
                    googlePayBtn.title = '您的設備不支持 Google Pay';
                    return;
                }
            } catch (error) {
                console.log('檢查 Google Pay 可用性時發生錯誤:', error);
                googlePayBtn.style.opacity = '0.5';
                googlePayBtn.style.cursor = 'not-allowed';
                googlePayBtn.title = '無法檢查 Google Pay 支援狀態';
                return;
            }

            // 綁定點擊事件
            googlePayBtn.style.cursor = 'pointer';
            googlePayBtn.addEventListener('click', handleGooglePay);
        }

        // 處理 Google Pay 支付
        async function handleGooglePay(event) {
            event.preventDefault();

            // 0. 檢查登入狀態
            if (!getCurrentUser()) {
                const confirmLogin = confirm('結帳需要登入會員，是否前往登入？');
                if (confirmLogin) {
                    sessionStorage.setItem('returnUrl', window.location.href);
                    window.location.href = './login.html';
                }
                return;
            }

            // 1. 驗證基本表單（只驗證收件資料，不需要信用卡資料）
            const email = document.getElementById('email').value.trim();
            const firstName = document.getElementById('deliveryFirstName').value.trim();
            const lastName = document.getElementById('deliveryLaName').value.trim();
            const tel = document.getElementById('deliveryTel').value.trim();
            const city = document.getElementById('city').value;
            const district = document.getElementById('district').value;
            const address = document.getElementById('addressName').value.trim();

            if (!firstName || !lastName || !tel || !city || !district || !address) {
                alert('請完整填寫收件人資料');
                return;
            }

            if (email && !isValidEmail(email)) {
                alert('請輸入有效的電子郵件地址');
                return;
            }

            if (!isValidPhone(tel)) {
                alert('請輸入有效的聯絡電話');
                return;
            }

            // 2. 收集訂單資料並檢查金額限制
            let orderData;
            try {
                orderData = collectOrderData('Google Pay');
            } catch (error) {
                pauseMarquee();
                alert(error.message);
                resumeMarquee();
                return;
            }

            // 3. 計算最終金額
            const totalDiscount = calculateDiscounts();
            const finalAmount = subtotal - totalDiscount;

            // 4. 創建 Google Pay 支付請求
            try {
                pauseMarquee();

                // 準備購物車明細
                const displayItems = [];
                if (AppState.cartData && AppState.cartData.cart) {
                    AppState.cartData.cart.forEach(item => {
                        const itemTotal = item.price * item.qty;
                        displayItems.push({
                            label: `${item.name} ${item.size}`,
                            amount: {
                                currency: 'TWD',
                                value: itemTotal.toFixed(2)
                            }
                        });
                    });

                    // 如果有折扣，顯示折扣項目
                    if (totalDiscount > 0) {
                        displayItems.push({
                            label: '折扣',
                            amount: {
                                currency: 'TWD',
                                value: (-totalDiscount).toFixed(2)
                            }
                        });
                    }
                }

                // 建立 Payment Request
                const paymentRequest = new PaymentRequest(
                    [
                        {
                            supportedMethods: 'https://google.com/pay',
                            data: {
                                environment: 'TEST', // 生產環境改為 'PRODUCTION'
                                apiVersion: 2,
                                apiVersionMinor: 0,
                                merchantInfo: {
                                    merchantId: 'merchant.com.soda',
                                    merchantName: 'Soda 能量飲'
                                },
                                allowedPaymentMethods: [
                                    {
                                        type: 'CARD',
                                        parameters: {
                                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                            allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']
                                        },
                                        tokenizationSpecification: {
                                            type: 'PAYMENT_GATEWAY',
                                            parameters: {
                                                gateway: 'example',
                                                gatewayMerchantId: 'exampleGatewayMerchantId'
                                            }
                                        }
                                    }
                                ],
                                transactionInfo: {
                                    totalPriceStatus: 'FINAL',
                                    totalPrice: finalAmount.toFixed(2),
                                    totalPriceLabel: '總計',
                                    currencyCode: 'TWD',
                                    countryCode: 'TW'
                                },
                                shippingAddressRequired: false, // 我們使用表單中的地址
                                emailRequired: false // 我們使用表單中的 email
                            }
                        }
                    ],
                    {
                        total: {
                            label: 'Soda 能量飲',
                            amount: {
                                currency: 'TWD',
                                value: finalAmount.toFixed(2)
                            }
                        },
                        displayItems: displayItems.length > 0 ? displayItems : undefined
                    },
                    {
                        requestShipping: false, // 不需要 Google Pay 的地址，使用表單地址
                        requestPayerEmail: false,
                        requestPayerPhone: false,
                        requestPayerName: false
                    }
                );

                // 檢查是否可以使用
                if (!await paymentRequest.canMakePayment()) {
                    pauseMarquee();
                    alert('您的設備不支持 Google Pay，請使用其他付款方式。');
                    resumeMarquee();
                    return;
                }

                // 顯示支付界面
                try {
                    const paymentResponse = await paymentRequest.show();

                    // 處理支付響應
                    console.log('Google Pay 支付響應:', paymentResponse);

                    // 這裡應該將支付令牌發送到後端進行處理
                    // 在實際環境中，應該使用後端 API 來處理支付
                    // paymentResponse.details 包含支付令牌和資訊

                    // 使用 Google Pay 提供的聯絡資訊（如果有）
                    if (paymentResponse.details && paymentResponse.details.shippingAddress) {
                        const addr = paymentResponse.details.shippingAddress;
                        // 可以選擇使用 Google Pay 提供的地址或表單地址
                        // orderData.ShippingAddress = formatAddressFromGooglePay(addr);
                    }

                    // 模擬處理支付（在實際環境中，應該調用後端 API）
                    // 提交訂單到後端
                    const response = await submitOrder(orderData);

                    if (response.success) {
                        // 支付成功
                        await paymentResponse.complete('success');

                        alert(`訂單建立成功！\n訂單編號：${response.orderId}\n\n感謝您的訂購！`);

                        // 清除購物車資料和表單資料
                        localStorage.removeItem('cartData');
                        clearDiscountState();
                        clearSavedFormData();

                        // 導向訂單歷史頁面
                        window.location.href = './orderHistory.html';
                    } else {
                        // 訂單建立失敗
                        await paymentResponse.complete('fail');
                        alert('訂單建立失敗：' + response.message);
                    }
                    resumeMarquee();

                } catch (error) {
                    // 用戶取消或發生錯誤
                    if (error.name === 'AbortError') {
                        console.log('Google Pay 已取消');
                    } else {
                        console.error('Google Pay 支付錯誤:', error);
                        alert('處理支付時發生錯誤：' + error.message);
                    }
                    resumeMarquee();
                }

            } catch (error) {
                console.error('啟動 Google Pay 失敗:', error);
                alert('無法啟動 Google Pay，請使用其他付款方式。');
                resumeMarquee();
            }
        }

        // ==================== Amazon Pay 功能 ====================

        // 檢查 Amazon Pay 是否可用
        function checkAmazonPayAvailable() {
            // 檢查是否支援 Payment Request API
            if (window.PaymentRequest) {
                // 檢查是否支援 Amazon Pay
                try {
                    const paymentRequest = new PaymentRequest(
                        [{
                            supportedMethods: 'https://pay.amazon.com',
                            data: {
                                merchantId: 'merchant.com.soda',
                                ledgerCurrency: 'TWD',
                                sandbox: true, // 生產環境改為 false
                                storeId: 'soda-store'
                            }
                        }],
                        {
                            total: {
                                label: 'Soda 能量飲',
                                amount: {
                                    currency: 'TWD',
                                    value: '1.00'
                                }
                            }
                        }
                    );

                    // 檢查是否可以使用
                    return paymentRequest.canMakePayment().then(result => {
                        paymentRequest.abort();
                        return result !== null;
                    }).catch(() => false);
                } catch (error) {
                    console.log('Amazon Pay 檢查錯誤:', error);
                    return Promise.resolve(false);
                }
            }
            return Promise.resolve(false);
        }

        // 初始化 Amazon Pay 按鈕
        async function initAmazonPayButton() {
            const amazonPayBtn = document.querySelector('.amazonPay');
            if (!amazonPayBtn) return;

            // 檢查是否支持 Amazon Pay
            try {
                const isAvailable = await checkAmazonPayAvailable();
                if (!isAvailable) {
                    // 如果不支持，降低透明度並顯示提示
                    amazonPayBtn.style.opacity = '0.5';
                    amazonPayBtn.style.cursor = 'not-allowed';
                    amazonPayBtn.title = '您的設備不支持 Amazon Pay';
                    return;
                }
            } catch (error) {
                console.log('檢查 Amazon Pay 可用性時發生錯誤:', error);
                amazonPayBtn.style.opacity = '0.5';
                amazonPayBtn.style.cursor = 'not-allowed';
                amazonPayBtn.title = '無法檢查 Amazon Pay 支援狀態';
                return;
            }

            // 綁定點擊事件
            amazonPayBtn.style.cursor = 'pointer';
            amazonPayBtn.addEventListener('click', handleAmazonPay);
        }

        // 處理 Amazon Pay 支付
        async function handleAmazonPay(event) {
            event.preventDefault();

            // 0. 檢查登入狀態
            if (!getCurrentUser()) {
                const confirmLogin = confirm('結帳需要登入會員，是否前往登入？');
                if (confirmLogin) {
                    sessionStorage.setItem('returnUrl', window.location.href);
                    window.location.href = './login.html';
                }
                return;
            }

            // 1. 驗證基本表單（只驗證收件資料，不需要信用卡資料）
            const email = document.getElementById('email').value.trim();
            const firstName = document.getElementById('deliveryFirstName').value.trim();
            const lastName = document.getElementById('deliveryLaName').value.trim();
            const tel = document.getElementById('deliveryTel').value.trim();
            const city = document.getElementById('city').value;
            const district = document.getElementById('district').value;
            const address = document.getElementById('addressName').value.trim();

            if (!firstName || !lastName || !tel || !city || !district || !address) {
                alert('請完整填寫收件人資料');
                return;
            }

            if (email && !isValidEmail(email)) {
                alert('請輸入有效的電子郵件地址');
                return;
            }

            if (!isValidPhone(tel)) {
                alert('請輸入有效的聯絡電話');
                return;
            }

            // 2. 收集訂單資料並檢查金額限制
            let orderData;
            try {
                orderData = collectOrderData('Amazon Pay');
            } catch (error) {
                pauseMarquee();
                alert(error.message);
                resumeMarquee();
                return;
            }

            // 3. 計算最終金額
            const totalDiscount = calculateDiscounts();
            const finalAmount = subtotal - totalDiscount;

            // 4. 創建 Amazon Pay 支付請求
            try {
                pauseMarquee();

                // 準備購物車明細
                const displayItems = [];
                if (AppState.cartData && AppState.cartData.cart) {
                    AppState.cartData.cart.forEach(item => {
                        const itemTotal = item.price * item.qty;
                        displayItems.push({
                            label: `${item.name} ${item.size}`,
                            amount: {
                                currency: 'TWD',
                                value: itemTotal.toFixed(2)
                            }
                        });
                    });

                    // 如果有折扣，顯示折扣項目
                    if (totalDiscount > 0) {
                        displayItems.push({
                            label: '折扣',
                            amount: {
                                currency: 'TWD',
                                value: (-totalDiscount).toFixed(2)
                            }
                        });
                    }
                }

                // 建立 Payment Request
                const paymentRequest = new PaymentRequest(
                    [
                        {
                            supportedMethods: 'https://pay.amazon.com',
                            data: {
                                merchantId: 'merchant.com.soda',
                                ledgerCurrency: 'TWD',
                                sandbox: true, // 生產環境改為 false
                                storeId: 'soda-store',
                                version: 2,
                                chargeAmount: {
                                    amount: finalAmount.toFixed(2),
                                    currencyCode: 'TWD'
                                },
                                paymentAction: 'AuthorizeAndCapture',
                                scopes: ['name', 'email', 'phone']
                            }
                        }
                    ],
                    {
                        total: {
                            label: 'Soda 能量飲',
                            amount: {
                                currency: 'TWD',
                                value: finalAmount.toFixed(2)
                            }
                        },
                        displayItems: displayItems.length > 0 ? displayItems : undefined
                    },
                    {
                        requestShipping: false, // 不需要 Amazon Pay 的地址，使用表單地址
                        requestPayerEmail: false,
                        requestPayerPhone: false,
                        requestPayerName: false
                    }
                );

                // 檢查是否可以使用
                if (!await paymentRequest.canMakePayment()) {
                    pauseMarquee();
                    alert('您的設備不支持 Amazon Pay，請使用其他付款方式。');
                    resumeMarquee();
                    return;
                }

                // 顯示支付界面
                try {
                    const paymentResponse = await paymentRequest.show();

                    // 處理支付響應
                    console.log('Amazon Pay 支付響應:', paymentResponse);

                    // 這裡應該將支付令牌發送到後端進行處理
                    // 在實際環境中，應該使用後端 API 來處理支付
                    // paymentResponse.details 包含支付令牌和資訊

                    // 使用 Amazon Pay 提供的聯絡資訊（如果有）
                    if (paymentResponse.details && paymentResponse.details.shippingAddress) {
                        const addr = paymentResponse.details.shippingAddress;
                        // 可以選擇使用 Amazon Pay 提供的地址或表單地址
                        // orderData.ShippingAddress = formatAddressFromAmazonPay(addr);
                    }

                    // 模擬處理支付（在實際環境中，應該調用後端 API）
                    // 提交訂單到後端
                    const response = await submitOrder(orderData);

                    if (response.success) {
                        // 支付成功
                        await paymentResponse.complete('success');

                        alert(`訂單建立成功！\n訂單編號：${response.orderId}\n\n感謝您的訂購！`);

                        // 清除購物車資料和表單資料
                        localStorage.removeItem('cartData');
                        clearDiscountState();
                        clearSavedFormData();

                        // 導向訂單歷史頁面
                        window.location.href = './orderHistory.html';
                    } else {
                        // 訂單建立失敗
                        await paymentResponse.complete('fail');
                        alert('訂單建立失敗：' + response.message);
                    }
                    resumeMarquee();

                } catch (error) {
                    // 用戶取消或發生錯誤
                    if (error.name === 'AbortError') {
                        console.log('Amazon Pay 已取消');
                    } else {
                        console.error('Amazon Pay 支付錯誤:', error);
                        alert('處理支付時發生錯誤：' + error.message);
                    }
                    resumeMarquee();
                }

            } catch (error) {
                console.error('啟動 Amazon Pay 失敗:', error);
                alert('無法啟動 Amazon Pay，請使用其他付款方式。');
                resumeMarquee();
            }
        }

        // 處理訂單提交
        async function handleOrderSubmit(event) {
            event.preventDefault();

            // 0. 檢查登入狀態（結帳時才需要登入）
            if (!getCurrentUser()) {
                const confirmLogin = confirm('結帳需要登入會員，是否前往登入？');
                if (confirmLogin) {
                    // 儲存當前頁面 URL，登入後返回
                    sessionStorage.setItem('returnUrl', window.location.href);
                    window.location.href = './login.html';
                }
                return;
            }

            // 1. 驗證表單
            if (!validateOrderForm()) {
                return;
            }

            // 2. 收集訂單資料並檢查金額限制
            let orderData;
            try {
                orderData = collectOrderData();
            } catch (error) {
                // 捕獲金額不足等錯誤
                pauseMarquee();
                alert(error.message);
                resumeMarquee();
                return;
            }

            // 3. 顯示確認訊息
            if (!confirm('確定要送出訂單嗎？')) {
                return;
            }

            // 4. 送出訂單到後端
            try {
                pauseMarquee();
                console.log('送出訂單資料 (JSON):', JSON.stringify(orderData, null, 2));
                
                const response = await submitOrder(orderData);
                
                if (response.success) {
                    alert(`訂單建立成功！\n訂單編號：${response.orderId}\n\n感謝您的訂購！`);
                    
                    // 清除購物車資料和表單資料
                    localStorage.removeItem('cartData');
                    clearDiscountState();
                    clearSavedFormData();  // 清除保存的表單資料
                    
                    // 導向訂單歷史頁面
                    window.location.href = './orderHistory.html';
                } else {
                    alert('訂單建立失敗：' + response.message);
                }
                resumeMarquee();
            } catch (error) {
                console.error('送出訂單時發生錯誤:', error);
                alert('送出訂單時發生錯誤：' + error.message);
                resumeMarquee();
            }
        }

        // 驗證訂單表單
        function validateOrderForm() {
            const email = document.getElementById('email').value.trim();
            const firstName = document.getElementById('deliveryFirstName').value.trim();
            const lastName = document.getElementById('deliveryLaName').value.trim();
            const tel = document.getElementById('deliveryTel').value.trim();
            const city = document.getElementById('city').value;
            const district = document.getElementById('district').value;
            const address = document.getElementById('addressName').value.trim();
            const cardNum = document.getElementById('cardNum').value.trim();
            const cardMonth = document.getElementById('cardMonth').value;
            const cardYear = document.getElementById('cardYear').value;
            const cvv = document.getElementById('cvv').value.trim();
            const nameOnCard = document.getElementById('nameOnCard').value.trim();

            // 驗證電子郵件（非必填，但如果有填寫則需要格式正確）
            if (email && !isValidEmail(email)) {
                alert('請輸入有效的電子郵件地址');
                document.getElementById('email').focus();
                return false;
            }

            // 驗證收件人資料
            if (!firstName || !lastName) {
                alert('請輸入收件人姓名');
                document.getElementById('deliveryFirstName').focus();
                return false;
            }

            if (!tel || !isValidPhone(tel)) {
                alert('請輸入有效的聯絡電話');
                document.getElementById('deliveryTel').focus();
                return false;
            }

            // 驗證地址
            if (!city || !district || !address) {
                alert('請完整填寫收件地址');
                return false;
            }

            // 驗證信用卡資訊
            if (!cardNum || cardNum.length < 15) {
                alert('請輸入有效的信用卡號碼');
                document.getElementById('cardNum').focus();
                return false;
            }

            if (!cardMonth || !cardYear) {
                alert('請選擇信用卡有效期限');
                return false;
            }

            if (!cvv || cvv.length < 3) {
                alert('請輸入有效的 CVV 安全碼');
                document.getElementById('cvv').focus();
                return false;
            }

            if (!nameOnCard) {
                alert('請輸入持卡人姓名');
                document.getElementById('nameOnCard').focus();
                return false;
            }

            return true;
        }

        // 驗證電子郵件格式
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // 驗證電話格式
        function isValidPhone(phone) {
            const phoneRegex = /^09\d{8}$/;
            return phoneRegex.test(phone);
        }

        // 收集訂單資料
        function collectOrderData(paymentMethod = 'Credit Card') {
            // 取得使用者資訊
            const userJson = localStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            const userId = user?.id;
            
            // 確保用戶已登入
            if (!userId || userId <= 0) {
                throw new Error('無法取得使用者資訊，請重新登入');
            }

            // 取得購物車資料 - 優先使用保存的資料，避免 URL 參數遺失
            let cartData = AppState.cartData;
            if (!cartData) {
                cartData = getCartDataFromURL();
            }
            
            console.log('🔍 購物車資料來源:', cartData ? '找到資料' : '未找到資料');
            
            let productList = '';
            let orderItems = '';

            if (cartData && cartData.cart && cartData.cart.length > 0) {
                // 產品列表（簡單字串格式）
                productList = cartData.cart.map(item => 
                    `${item.name} (${item.size}) x${item.qty}`
                ).join(', ');

                // 訂單項目（轉換為 JSON 字串格式）
                // 將購物車資料的欄位名稱轉換成後端期望的 Pascal Case 格式
                const formattedCartItems = cartData.cart.map(item => ({
                    ProductName: item.name,
                    Size: item.size,
                    Quantity: item.qty,
                    UnitPrice: item.price
                }));
                orderItems = JSON.stringify(formattedCartItems);
            } else {
                // 如果沒有購物車資料，拋出錯誤
                throw new Error('購物車資料遺失，請重新選擇商品');
            }

            // 收集表單資料
            const email = document.getElementById('email').value.trim();
            const firstName = document.getElementById('deliveryFirstName').value.trim();
            const lastName = document.getElementById('deliveryLaName').value.trim();
            const tel = document.getElementById('deliveryTel').value.trim();
            const city = document.getElementById('city').value;
            const district = document.getElementById('district').value;
            const zipcode = document.getElementById('zipcode-input').value;
            const address = document.getElementById('addressName').value.trim();
            const sendEmail = document.getElementById('sendemail').checked;

            // 組合完整地址
            const fullAddress = `${zipcode} ${city}${district}${address}`;

            // 收件人名稱
            const receiverName = `${firstName} ${lastName}`;

            // 計算最終金額（含折扣）
            const totalDiscount = calculateDiscounts();
            const finalAmount = subtotal - totalDiscount;

            // ⭐ 新增：最終檢查結帳金額不能小於 10
            if (finalAmount < 10) {
                throw new Error(`結帳金額不能低於 $10！\n\n目前結帳金額：$${finalAmount.toLocaleString()}\n請調整購物車或移除部分優惠券。`);
            }

            // 備註（改為完整的 JSON 格式）
            // 組裝商品詳細資訊
            const productsInfo = cartData.cart.map(item => ({
                productId: item.productId || item.id || null,
                name: item.name,
                size: item.size,
                qty: item.qty,
                price: item.price,
                imageUrl: item.imageUrl || item.image || null
            }));

            // 組裝折扣資訊
            let discountsInfo = [];
            if (appliedDiscounts.length > 0) {
                const validDiscounts = appliedDiscounts.filter(d => !d.isInvalid && !d.isReplaced);
                discountsInfo = validDiscounts.map(d => ({
                    name: d.name || d.code || '未知優惠',
                    amount: d.amount || 0,
                    code: d.code || null
                }));
            }

            // 組合完整的 JSON 格式備註
            const notesData = {
                contact: {
                    email: email,
                    tel: tel,
                    subscribeNewsletter: sendEmail
                },
                // products: productsInfo,
                discounts: {
                    items: discountsInfo,
                    totalDiscount: totalDiscount
                }
            };
            
            const notes = JSON.stringify(notesData);

            // 組合訂單資料（JSON 格式）- 使用帕斯卡式命名以匹配後端 C# 模型
            // 確保所有必要的欄位都有值
            const orderData = {
                UserID: userId,
                ProductList: productList || '',
                TotalAmount: finalAmount || 0,
                OrderItems: orderItems || '[]',
                PaymentMethod: paymentMethod || 'Credit Card',
                ShippingAddress: fullAddress || '',
                ReceiverName: receiverName || '',
                Notes: notes || '',
                Status: 'Pending',
                PaymentStatus: 'Unpaid',
                ShippingMethod: '宅配', // 設定運送方式為宅配
                ShippingStatus: 'Pending'
            };

            // 最終驗證
            if (!orderData.ProductList || orderData.ProductList.trim() === '') {
                throw new Error('購物車為空，無法建立訂單');
            }

            if (orderData.TotalAmount <= 0) {
                throw new Error('訂單金額必須大於 0');
            }

            return orderData;
        }

        // 送出訂單到後端
        async function submitOrder(orderData) {
            try {
                // 🔍 調試：詳細記錄要發送的數據
                // console.log('========== 訂單數據 ==========');
                // console.log('原始數據 (orderData):', orderData);
                // console.log('JSON 字串:', JSON.stringify(orderData, null, 2));
                // console.log('數據類型檢查:');
                // console.log('  - UserID:', typeof orderData.UserID, '=', orderData.UserID);
                // console.log('  - ProductList:', typeof orderData.ProductList, '=', orderData.ProductList?.substring(0, 100) + '...');
                // console.log('  - TotalAmount:', typeof orderData.TotalAmount, '=', orderData.TotalAmount);
                // console.log('  - OrderItems:', typeof orderData.OrderItems, '=', orderData.OrderItems?.substring(0, 200) + '...');
                // console.log('  - ShippingAddress:', typeof orderData.ShippingAddress, '=', orderData.ShippingAddress);
                // console.log('  - ReceiverName:', typeof orderData.ReceiverName, '=', orderData.ReceiverName);
                // console.log('===============================');
                // console.log('開始發送 POST 請求到: https://localhost:7085/api/Orders');
                
                // 使用 axios 或 fetch 發送請求
                const response = await fetch('https://localhost:7085/api/Orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 如果需要認證，加上 token
                        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
                    },
                    body: JSON.stringify(orderData)
                });

                console.log('收到響應狀態:', response.status, response.statusText);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('響應錯誤內容:', errorText);
                    
                    // 嘗試解析錯誤訊息
                    try {
                        const errorData = JSON.parse(errorText);
                        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
                        throw new Error(errorMessage);
                    } catch (parseError) {
                        // 如果無法解析 JSON，使用原始錯誤文字
                        throw new Error(`HTTP error! status: ${response.status}\n${errorText}`);
                    }
                }

                const data = await response.json();
                console.log('成功收到訂單響應:', data);
                
                // 將後端的格式轉換為前端期望的格式
                // 後端成功時返回: { message: "...", data: { OrderID: 123, ... }, orderId: 123 }
                return {
                    success: true,
                    message: data.message || '訂單建立成功',
                    orderId: data.orderId || data.data?.OrderID || data.OrderID,
                    data: data.data || data
                };
                
                console.log('轉換後的響應格式:', {
                    success: true,
                    orderId: data.orderId || data.data?.OrderID || data.OrderID
                });
            } catch (error) {
                console.error('API 請求失敗:', error);
                console.error('錯誤詳情:', error.message);
                throw error;
            }
        }

        // 輔助函數：暫停跑馬燈（如果沒有定義的話）
        function pauseMarquee() {
            if (marqueeInstance && typeof marqueeInstance.pause === 'function') {
                marqueeInstance.pause();
            }
        }

        // 輔助函數：恢復跑馬燈（如果沒有定義的話）
        function resumeMarquee() {
            if (marqueeInstance && typeof marqueeInstance.resume === 'function') {
                marqueeInstance.resume();
            }
        }

        // ==================== 表單驗證和浮動標籤功能 ====================

        // 初始化表單驗證
        function initFormValidation() {
            const inputWrappers = document.querySelectorAll('.input-wrapper');
            
            inputWrappers.forEach(wrapper => {
                const input = wrapper.querySelector('input');
                if (!input) return;

                // 處理預填值（如已登入的用戶自動填入的資料）
                if (input.value) {
                    input.classList.add('has-value');
                }

                // 監聽輸入事件
                input.addEventListener('input', function() {
                    if (this.value) {
                        this.classList.add('has-value');
                    } else {
                        this.classList.remove('has-value');
                    }
                    
                    // 清除錯誤狀態（當用戶開始輸入時）
                    if (this.classList.contains('error')) {
                        clearError(this);
                    }
                });

                // 監聽失焦事件（blur）- 進行驗證
                input.addEventListener('blur', function() {
                    if (this.hasAttribute('required')) {
                        validateInput(this);
                    }
                });

                // 監聽焦點事件（focus）- 清除錯誤
                input.addEventListener('focus', function() {
                    clearError(this);
                });
            });

            // 為選擇框添加驗證
            const selectBoxes = document.querySelectorAll('select.select-box[required]');
            selectBoxes.forEach(select => {
                select.addEventListener('change', function() {
                    if (this.value) {
                        this.classList.remove('error');
                    }
                });

                select.addEventListener('blur', function() {
                    if (this.hasAttribute('required') && !this.value) {
                        showSelectError(this);
                    }
                });
            });
        }

        // 驗證單個輸入框
        function validateInput(input) {
            const value = input.value.trim();
            const type = input.type;
            const id = input.id;
            
            // 必填驗證
            if (!value) {
                showError(input, '此欄位為必填');
                return false;
            }

            // Email 格式驗證
            if (type === 'email' || id === 'email') {
                if (!isValidEmail(value)) {
                    showError(input, '請輸入有效的電子郵件地址');
                    return false;
                }
            }

            // 電話號碼驗證
            if (id === 'deliveryTel') {
                if (!isValidPhone(value)) {
                    showError(input, '請輸入有效的手機號碼（格式：09xxxxxxxx）');
                    return false;
                }
            }

            // 信用卡號驗證
            if (id === 'cardNum') {
                // 移除空格和破折號
                const cardNum = value.replace(/[\s-]/g, '');
                if (cardNum.length < 13 || cardNum.length > 19) {
                    showError(input, '請輸入有效的信用卡號碼（13-19位數字）');
                    return false;
                }
                if (!/^\d+$/.test(cardNum)) {
                    showError(input, '信用卡號只能包含數字');
                    return false;
                }
            }

            // CVV 驗證
            if (id === 'cvv') {
                if (value.length < 3 || value.length > 4) {
                    showError(input, 'CVV 應為 3 或 4 位數字');
                    return false;
                }
                if (!/^\d+$/.test(value)) {
                    showError(input, 'CVV 只能包含數字');
                    return false;
                }
            }

            // 姓名驗證
            if (id === 'deliveryFirstName' || id === 'deliveryLaName' || id === 'nameOnCard') {
                if (value.length < 1) {
                    showError(input, '請輸入姓名');
                    return false;
                }
            }

            // 地址驗證
            if (id === 'addressName') {
                if (value.length < 5) {
                    showError(input, '請輸入完整地址');
                    return false;
                }
            }

            // 驗證通過，清除錯誤
            clearError(input);
            return true;
        }

        // 顯示錯誤訊息
        function showError(input, message) {
            const wrapper = input.closest('.input-wrapper');
            if (!wrapper) return;

            const errorMessage = wrapper.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }

            input.classList.add('error');
        }

        // 清除錯誤訊息
        function clearError(input) {
            const wrapper = input.closest('.input-wrapper');
            if (!wrapper) return;

            const errorMessage = wrapper.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = '';
            }

            input.classList.remove('error');
        }

        // 顯示選擇框錯誤
        function showSelectError(select) {
            select.classList.add('error');
            select.style.borderColor = '#dc3545';
        }

        // 驗證所有必填欄位
        function validateAllRequiredFields() {
            let isValid = true;
            const inputWrappers = document.querySelectorAll('.input-wrapper');
            
            inputWrappers.forEach(wrapper => {
                const input = wrapper.querySelector('input[required]');
                if (input && !validateInput(input)) {
                    isValid = false;
                }
            });

            // 驗證選擇框
            const selectBoxes = document.querySelectorAll('select.select-box[required]');
            selectBoxes.forEach(select => {
                if (!select.value) {
                    showSelectError(select);
                    isValid = false;
                }
            });

            return isValid;
        }

        // 修改原有的 validateOrderForm 函數，添加視覺驗證
        const originalValidateOrderForm = validateOrderForm;
        validateOrderForm = function() {
            // 先執行視覺驗證
            const visualValidation = validateAllRequiredFields();
            
            if (!visualValidation) {
                alert('請完整填寫所有必填欄位');
                return false;
            }
            
            // 再執行原有的邏輯驗證
            return originalValidateOrderForm();
        };

        // 在 DOMContentLoaded 後初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initFormValidation);
        } else {
            // DOM 已經載入完成
            initFormValidation();
        }

        // 信用卡號格式化（選用功能：自動加入空格）
        const cardNumInput = document.getElementById('cardNum');
        if (cardNumInput) {
            cardNumInput.addEventListener('input', function(e) {
                // 記錄當前游標位置
                const cursorPos = this.selectionStart;
                const oldValue = this.value;
                
                // 移除所有空格，只保留數字
                let value = oldValue.replace(/\s/g, '');
                
                // 限制最大長度為16位
                if (value.length > 16) {
                    value = value.slice(0, 16);
                }
                
                // 格式化：每4位加一個空格
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                
                // 計算在原始字符串中游標前面有多少個數字（不包括空格）
                const digitsBeforeCursor = oldValue.slice(0, cursorPos).replace(/\s/g, '').length;
                
                // 在格式化後的字符串中找到對應的位置
                let newCursorPos = 0;
                let digitCount = 0;
                
                for (let i = 0; i < formattedValue.length; i++) {
                    if (formattedValue[i] !== ' ') {
                        digitCount++;
                        if (digitCount === digitsBeforeCursor) {
                            newCursorPos = i + 1;
                            break;
                        }
                    }
                }
                
                // 如果沒有找到（游標在最後），則放在格式化後的字符串末尾
                if (newCursorPos === 0) {
                    newCursorPos = formattedValue.length;
                }
                
                // 更新值
                this.value = formattedValue;
                
                // 設置游標位置
                this.setSelectionRange(newCursorPos, newCursorPos);
            });
        }

        // 電話號碼輸入優化
        const phoneInput = document.getElementById('deliveryTel');
        if (phoneInput) {
            // 設置預設前綴 "09"（僅在欄位為空時）
            if (!phoneInput.value) {
                phoneInput.value = '09';
            }

            phoneInput.addEventListener('input', function(e) {
                let value = this.value;
                
                // 只保留數字
                value = value.replace(/\D/g, '');
                
                // 確保開頭是 "09"
                if (!value.startsWith('09')) {
                    value = '09' + value;
                }
                
                // 限制總長度為 10 位（09 + 8位數字）
                if (value.length > 10) {
                    value = value.slice(0, 10);
                }
                
                // 確保至少保持 "09" 前綴
                if (value.length < 2) {
                    value = '09';
                }
                
                // 更新值
                this.value = value;
                
                // 如果值改變，觸發 has-value 類更新
                if (value) {
                    this.classList.add('has-value');
                } else {
                    this.classList.remove('has-value');
                }
            });

            // 防止刪除前綴
            phoneInput.addEventListener('keydown', function(e) {
                const cursorPos = this.selectionStart;
                
                // 如果嘗試刪除 "09" 前綴
                if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos <= 2) {
                    e.preventDefault();
                    // 保持前綴 "09"，選擇它
                    this.setSelectionRange(2, 2);
                }
            });

            // 獲取焦點時，將游標移到末尾（避免選擇 "09"）
            phoneInput.addEventListener('focus', function(e) {
                if (this.value === '09' || this.selectionStart <= 2) {
                    this.setSelectionRange(this.value.length, this.value.length);
                }
            });
        }

        // ==================== 表單資料保存和恢復 ====================

        // 保存表單資料到 localStorage
        function saveFormData() {
            const formData = {
                email: document.getElementById('email').value,
                deliveryFirstName: document.getElementById('deliveryFirstName').value,
                deliveryLaName: document.getElementById('deliveryLaName').value,
                deliveryTel: document.getElementById('deliveryTel').value,
                city: document.getElementById('city').value,
                district: document.getElementById('district').value,
                zipcode: document.getElementById('zipcode-input').value,
                addressName: document.getElementById('addressName').value,
                cardNum: document.getElementById('cardNum').value,
                cardMonth: document.getElementById('cardMonth').value,
                cardYear: document.getElementById('cardYear').value,
                cvv: document.getElementById('cvv').value,
                nameOnCard: document.getElementById('nameOnCard').value,
                sendemail: document.getElementById('sendemail').checked,
                timestamp: Date.now()
            };
            
            sessionStorage.setItem('checkoutFormData', JSON.stringify(formData));
            console.log('✅ 表單資料已保存');
        }

        // 恢復表單資料
        function restoreFormData() {
            try {
                const savedData = sessionStorage.getItem('checkoutFormData');
                if (!savedData) return false;

                const formData = JSON.parse(savedData);
                
                // 檢查資料是否過期（超過 24 小時）
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;
                if (now - formData.timestamp > oneDay) {
                    sessionStorage.removeItem('checkoutFormData');
                    console.log('⚠️ 保存的表單資料已過期，已清除');
                    return false;
                }

                // 恢復資料（跳過 email，因為它是從用戶資料自動填入的）
                if (formData.deliveryFirstName) {
                    const firstNameInput = document.getElementById('deliveryFirstName');
                    if (firstNameInput && !firstNameInput.value) {
                        firstNameInput.value = formData.deliveryFirstName;
                        firstNameInput.classList.add('has-value');
                    }
                }

                if (formData.deliveryLaName) {
                    const lastNameInput = document.getElementById('deliveryLaName');
                    if (lastNameInput && !lastNameInput.value) {
                        lastNameInput.value = formData.deliveryLaName;
                        lastNameInput.classList.add('has-value');
                    }
                }

                if (formData.deliveryTel) {
                    const telInput = document.getElementById('deliveryTel');
                    if (telInput && !telInput.value) {
                        telInput.value = formData.deliveryTel;
                        telInput.classList.add('has-value');
                    }
                }

                // 恢復地址（如果有保存的城市和區域）
                if (formData.city) {
                    const citySelect = document.getElementById('city');
                    if (citySelect && !citySelect.value) {
                        citySelect.value = formData.city;
                        citySelect.dispatchEvent(new Event('change'));
                    }
                }

                // 延遲設置區域（等待城市選單更新）
                if (formData.district) {
                    setTimeout(() => {
                        const districtSelect = document.getElementById('district');
                        if (districtSelect && !districtSelect.value) {
                            districtSelect.value = formData.district;
                            districtSelect.dispatchEvent(new Event('change'));
                        }
                    }, 100);
                }

                if (formData.zipcode) {
                    const zipcodeInput = document.getElementById('zipcode-input');
                    if (zipcodeInput && !zipcodeInput.value) {
                        zipcodeInput.value = formData.zipcode;
                    }
                }

                if (formData.addressName) {
                    const addressInput = document.getElementById('addressName');
                    if (addressInput && !addressInput.value) {
                        addressInput.value = formData.addressName;
                        addressInput.classList.add('has-value');
                    }
                }

                // 恢復信用卡資料
                if (formData.cardNum) {
                    const cardNumInput = document.getElementById('cardNum');
                    if (cardNumInput && !cardNumInput.value) {
                        cardNumInput.value = formData.cardNum;
                        cardNumInput.classList.add('has-value');
                    }
                }

                if (formData.cardMonth) {
                    const cardMonthInput = document.getElementById('cardMonth');
                    if (cardMonthInput && !cardMonthInput.value) {
                        cardMonthInput.value = formData.cardMonth;
                    }
                }

                if (formData.cardYear) {
                    const cardYearInput = document.getElementById('cardYear');
                    if (cardYearInput && !cardYearInput.value) {
                        cardYearInput.value = formData.cardYear;
                    }
                }

                if (formData.cvv) {
                    const cvvInput = document.getElementById('cvv');
                    if (cvvInput && !cvvInput.value) {
                        cvvInput.value = formData.cvv;
                        cvvInput.classList.add('has-value');
                    }
                }

                if (formData.nameOnCard) {
                    const nameInput = document.getElementById('nameOnCard');
                    if (nameInput && !nameInput.value) {
                        nameInput.value = formData.nameOnCard;
                        nameInput.classList.add('has-value');
                    }
                }

                if (formData.sendemail !== undefined) {
                    const emailCheckbox = document.getElementById('sendemail');
                    if (emailCheckbox) {
                        emailCheckbox.checked = formData.sendemail;
                    }
                }

                console.log('✅ 表單資料已恢復');
                AppState.formDataSaved = true;
                return true;
            } catch (error) {
                console.error('恢復表單資料失敗:', error);
                return false;
            }
        }

        // 清除保存的表單資料（訂單提交成功後調用）
        function clearSavedFormData() {
            sessionStorage.removeItem('checkoutFormData');
            console.log('🗑️ 已清除保存的表單資料');
        }

        // 監聽表單輸入變化，自動保存
        function setupAutoSaveFormData() {
            // 需要監聽的表單欄位
            const formFields = [
                'email',
                'deliveryFirstName',
                'deliveryLaName',
                'deliveryTel',
                'city',
                'district',
                'zipcode-input',
                'addressName',
                'cardNum',
                'cardMonth',
                'cardYear',
                'cvv',
                'nameOnCard',
                'sendemail'
            ];

            formFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    // 監聽輸入變化
                    if (field.type === 'checkbox') {
                        field.addEventListener('change', debounce(saveFormData, 500));
                    } else if (field.tagName === 'SELECT') {
                        field.addEventListener('change', debounce(saveFormData, 500));
                    } else {
                        field.addEventListener('input', debounce(saveFormData, 500));
                    }
                }
            });
        }