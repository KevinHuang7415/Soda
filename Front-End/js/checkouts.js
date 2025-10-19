
        // 商品背景顏色對應表
        const productBackgroundMap = {
            '檸檬能量飲': 'var(--product-green-light)',
            '葡萄能量飲': 'var(--product-purple-light)',
            '草莓能量飲': 'var(--product-pink-light)'
        };

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

                const bgColor = productBackgroundMap[item.name] || 'var(--main-gray-light)';
                const subtotal = item.price * item.qty;

                orderItemBox.innerHTML = `
                    <div class="order-item-img" style="background-color: ${bgColor}">
                        <span class="order-item-quantity">${item.qty}</span>
                        <h2>${item.size}</h2>
                        <img src="${item.imageUrl}" alt="${item.name}">
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
            marqueeInstance: null
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

        // 檢查用戶登入狀態（優化版）
        function checkUserLoginStatus() {
            try {
                // 從 localStorage 或 sessionStorage 檢查登入狀態
                const loginData = localStorage.getItem('userLoginData') || sessionStorage.getItem('userLoginData');

                if (loginData) {
                    const userData = JSON.parse(loginData);

                    // 驗證數據完整性
                    if (!userData || typeof userData !== 'object' || !userData.loginTime) {
                        throw new Error('無效的登入數據');
                    }

                    // 檢查登入是否過期（例如：24小時）
                    const loginTime = userData.loginTime;
                    const currentTime = Date.now();
                    const twentyFourHours = 24 * 60 * 60 * 1000;

                    if (currentTime - loginTime < twentyFourHours) {
                        AppState.isUserLoggedIn = true;
                        AppState.userInfo = userData;
                        console.log('用戶已登入:', userData);
                        return true;
                    } else {
                        // 登入已過期，清除資料
                        this.clearLoginData();
                        return false;
                    }
                }

                // 也可以從 cookie 檢查
                const authToken = getCookie('authToken');
                if (authToken && authToken.length > 0) {
                    // 這裡可以驗證 token 的有效性
                    AppState.isUserLoggedIn = true;
                    AppState.userInfo = { token: authToken };
                    return true;
                }

                return false;
            } catch (error) {
                console.error('檢查登入狀態失敗:', error);
                this.clearLoginData();
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

        // 計算折扣
        function calculateDiscounts() {
            let totalDiscount = 0;
            appliedDiscounts.forEach(discount => {
                // 只計算有效的折扣（沒有 isInvalid 和 isReplaced 標記）
                if (!discount.isInvalid && !discount.isReplaced) {
                    if (discount.type === 'percentage') {
                        totalDiscount += Math.floor(subtotal * discount.value);
                    } else if (discount.type === 'fixed' || discount.type === 'coupon') {
                        totalDiscount += discount.value;
                    }
                }
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

        // 計算優惠券折扣金額
        function calculateDiscountAmount(discount) {
            if (discount.type === 'percentage') {
                return Math.floor(subtotal * discount.value);
            } else if (discount.type === 'fixed' || discount.type === 'coupon') {
                return discount.value;
            }
            return 0;
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
            if (discount.requiresLogin && !isUserLoggedIn) {
                pauseMarquee();
                const shouldLogin = confirm('此優惠需要登入才能使用！\n\n點擊「確定」前往登入頁面，或點擊「取消」繼續購物。');
                if (shouldLogin) {
                    // 保存當前折扣狀態
                    saveDiscountState();

                    // 重定向到登入頁面
                    window.location.href = '../part1,part5/登入資訊/login.html?returnUrl=' + encodeURIComponent(window.location.href);
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

            const newDiscountAmount = calculateDiscountAmount(discount);
            const newDiscount = {
                id: discountId,
                name: discount.name,
                type: discount.type,
                value: discount.value,
                amount: newDiscountAmount,
                code: discount.code,
                discountType: discount.discountType
            };

            // 根據折扣類型處理
            if (discount.discountType === 'event' || discount.discountType === 'newuser') {
                // 活動優惠和新好友優惠：可以同時存在
                appliedDiscounts.push(newDiscount);
                updateDiscountDisplay();
            } else {
                // 所有優惠券類型：進行比較（每筆訂單只能用一份優惠券）
                // 找到所有現有的優惠券
                const existingCoupons = appliedDiscounts.filter(d =>
                    d.discountType === 'coupon' && !d.isReplaced && !d.isInvalid
                );

                console.log('檢查現有優惠券:', existingCoupons);
                console.log('新優惠券金額:', newDiscountAmount);

                if (existingCoupons.length > 0) {
                    // 找到最優惠的現有優惠券
                    const bestExistingCoupon = existingCoupons.reduce((best, current) =>
                        current.amount > best.amount ? current : best
                    );

                    console.log('最優惠的現有優惠券:', bestExistingCoupon);

                    // 比較優惠程度
                    if (newDiscountAmount > bestExistingCoupon.amount) {
                        // 新優惠更划算，將所有現有優惠券標記為被替換
                        appliedDiscounts.forEach(d => {
                            if (d.discountType === 'coupon' && !d.isReplaced && !d.isInvalid) {
                                d.isReplaced = true;
                            }
                        });
                        alert('耶!! 獲得魔法~~');
                        appliedDiscounts.push(newDiscount);
                        updateDiscountDisplay();
                        pauseMarquee();
                        resumeMarquee();
                    } else {
                        // 新優惠不划算，仍然添加但標記為無效
                        alert('沒有比較優惠>_< 魔法失效了');
                        newDiscount.isInvalid = true;
                        appliedDiscounts.push(newDiscount);
                        updateDiscountDisplay();
                        pauseMarquee();
                        resumeMarquee();
                    }
                } else {
                    // 沒有現有優惠券，直接添加
                    appliedDiscounts.push(newDiscount);
                    updateDiscountDisplay();
                }
            }

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

            appliedDiscounts.forEach(discount => {
                const discountItem = document.createElement('div');
                discountItem.className = 'discount-item';

                // 設定樣式
                if (discount.isInvalid) {
                    // 無效的優惠券（不划算的）
                    discountItem.style.textDecoration = 'line-through';
                    discountItem.style.opacity = '0.6';
                    discountItem.style.color = '#999';
                } else if (discount.isReplaced) {
                    // 被替換的優惠券（更優惠的替換了這個）
                    discountItem.style.textDecoration = 'line-through';
                    discountItem.style.opacity = '0.6';
                    discountItem.style.color = '#999';
                }

                // 使用動態生成函數
                const displayName = generateDiscountDisplayName(discount);

                discountItem.innerHTML = `
                    <p>${displayName}</p>
                    <p>-$${discount.amount.toLocaleString()}</p>
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
                    if (!isUserLoggedIn) {
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
                    if (discount.requiresLogin && !isUserLoggedIn) {

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

            // 載入優惠券資料
            await loadDiscountData();

            // 載入購物車資料並更新顯示
            const cartData = getCartDataFromURL();
            if (cartData) {
                subtotal = cartData.total;
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
