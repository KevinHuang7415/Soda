/**
 * 訂單查詢頁面 JavaScript
 */

// API 基礎路徑
const API_BASE_URL = 'https://localhost:7085/api';

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', async function () {
    // 檢查登入狀態
    if (!isLoggedIn()) {
        alert('請先登入才能查看訂單');
        localStorage.setItem('redirectAfterLogin', './orderHistory.html');
        window.location.href = './login.html';
        return;
    }

    // 更新用戶名稱顯示
    updateUserNameDisplay();

    // 載入訂單資料
    await loadOrders();

    // 設定彈窗關閉事件
    setupModalEvents();
});

/**
 * 更新用戶名稱顯示
 */
function updateUserNameDisplay() {
    const user = getCurrentUser();
    const userNameElement = document.getElementById('user-name');
    
    if (user && userNameElement) {
        userNameElement.textContent = user.username || user.email || '會員';
    }
}

/**
 * 載入訂單資料
 */
async function loadOrders() {
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const noOrders = document.getElementById('no-orders');
    const ordersContainer = document.getElementById('orders-container');

    try {
        // 顯示載入中
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        noOrders.style.display = 'none';
        ordersContainer.style.display = 'none';

        // 取得 Token
        const token = getAuthToken();
        if (!token) {
            throw new Error('未找到登入憑證');
        }

        // 呼叫 API 取得訂單列表
        const response = await axios.get(`${API_BASE_URL}/Orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // 隱藏載入中
        loadingIndicator.style.display = 'none';

        // 檢查是否有訂單
        if (!response.data || response.data.length === 0) {
            noOrders.style.display = 'block';
            return;
        }

        // 顯示訂單列表
        ordersContainer.style.display = 'flex';
        renderOrders(response.data);

    } catch (error) {
        console.error('載入訂單時發生錯誤:', error);
        
        // 隱藏載入中
        loadingIndicator.style.display = 'none';
        
        // 顯示錯誤訊息
        errorMessage.style.display = 'block';
        
        // 如果是 401 錯誤，可能是 token 過期
        if (error.response && error.response.status === 401) {
            alert('登入已過期，請重新登入');
            clearAuthData();
            window.location.href = './login.html';
        }
    }
}

/**
 * 渲染訂單列表
 */
function renderOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    ordersContainer.innerHTML = '';

    // 按照日期排序（最新的在前）
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

/**
 * 創建訂單卡片
 */
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';

    // 格式化日期
    const orderDate = formatDate(order.orderDate);

    // 取得狀態標籤
    const statusBadge = getStatusBadge(order.status || '處理中');
    const paymentStatusBadge = getStatusBadge(order.paymentStatus || '未付款', 'payment');
    const shippingStatusBadge = getStatusBadge(order.shippingStatus || '準備中', 'shipping');

    card.innerHTML = `
        <div class="order-card-header">
            <div>
                <div class="order-number">訂單編號：${order.orderID || 'N/A'}</div>
                <div class="order-date">${orderDate}</div>
            </div>
            ${statusBadge}
        </div>
        <div class="order-card-body">
            <div class="order-info-item">
                <span class="order-info-label">付款狀態</span>
                <span class="order-info-value">${paymentStatusBadge}</span>
            </div>
            <div class="order-info-item">
                <span class="order-info-label">運送狀態</span>
                <span class="order-info-value">${shippingStatusBadge}</span>
            </div>
            <div class="order-info-item">
                <span class="order-info-label">付款方式</span>
                <span class="order-info-value">${order.paymentMethod || '未指定'}</span>
            </div>
            <div class="order-info-item">
                <span class="order-info-label">收件人</span>
                <span class="order-info-value">${order.receiverName || '未指定'}</span>
            </div>
        </div>
        <div class="order-card-footer">
            <div class="order-total">總金額：$${formatCurrency(order.totalAmount)}</div>
            <button class="view-details-btn" onclick="viewOrderDetails(${order.orderID})">查看詳情</button>
        </div>
    `;

    return card;
}

/**
 * 查看訂單詳情
 */
async function viewOrderDetails(orderId) {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('未找到登入憑證');
        }

        // 呼叫 API 取得訂單詳情
        const response = await axios.get(`${API_BASE_URL}/Orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const order = response.data;

        // 顯示詳情彈窗
        showOrderDetailsModal(order);

    } catch (error) {
        console.error('載入訂單詳情時發生錯誤:', error);
        alert('無法載入訂單詳情，請稍後再試');
    }
}

/**
 * 顯示訂單詳情彈窗
 */
function showOrderDetailsModal(order) {
    const modal = document.getElementById('order-modal');
    const detailsContainer = document.getElementById('order-details');

    // 格式化日期
    const orderDate = formatDate(order.orderDate);

    // 解析訂單明細
    let orderItemsHtml = '<p>暫無明細資料</p>';
    let subtotal = 0; // 計算小計總額
    
    if (order.orderItems) {
        try {
            const items = JSON.parse(order.orderItems);
            if (Array.isArray(items) && items.length > 0) {
                // 計算小計
                subtotal = items.reduce((sum, item) => {
                    const quantity = item.qty || item.quantity || 0;
                    const price = item.price || 0;
                    return sum + (quantity * price);
                }, 0);
                
                orderItemsHtml = `
                    <table class="order-items-table">
                        <thead>
                            <tr>
                                <th>商品名稱</th>
                                <th>數量</th>
                                <th>單價</th>
                                <th>小計</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => {
                                // 使用正確的欄位名稱：qty 而不是 quantity，name 而不是 productName
                                const productName = item.name || item.productName || '未知商品';
                                const quantity = item.qty || item.quantity || 0;
                                const price = item.price || 0;
                                const itemSubtotal = quantity * price;
                                
                                return `
                                <tr>
                                    <td>${productName}${item.size ? ` (${item.size})` : ''}</td>
                                    <td>${quantity}</td>
                                    <td>$${formatCurrency(price)}</td>
                                    <td>$${formatCurrency(itemSubtotal)}</td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (e) {
            console.error('解析訂單明細時發生錯誤:', e);
            orderItemsHtml = `<p>${order.orderItems}</p>`;
        }
    }

    // 解析折扣資訊
    let discountDetailsHtml = '';
    let totalDiscount = 0;
    let discounts = [];
    
    if (order.notes) {
        // 嘗試解析 JSON 格式的折扣資訊
        // 找到 DISCOUNTS_JSON: 後面的 JSON 字串
        const discountJsonIndex = order.notes.indexOf('DISCOUNTS_JSON:');
        if (discountJsonIndex !== -1) {
            try {
                // 從 DISCOUNTS_JSON: 後面開始提取 JSON
                const jsonStart = discountJsonIndex + 'DISCOUNTS_JSON:'.length;
                let jsonEnd = jsonStart;
                let braceCount = 0;
                let foundFirstBrace = false;
                
                // 找到完整的 JSON 物件
                for (let i = jsonStart; i < order.notes.length; i++) {
                    if (order.notes[i] === '{') {
                        braceCount++;
                        foundFirstBrace = true;
                    } else if (order.notes[i] === '}') {
                        braceCount--;
                        if (foundFirstBrace && braceCount === 0) {
                            jsonEnd = i + 1;
                            break;
                        }
                    }
                }
                
                if (jsonEnd > jsonStart) {
                    const jsonString = order.notes.substring(jsonStart, jsonEnd);
                    const discountData = JSON.parse(jsonString);
                    discounts = discountData.discounts || [];
                    totalDiscount = discountData.totalDiscount || 0;
                }
            } catch (e) {
                console.error('解析折扣 JSON 時發生錯誤:', e);
            }
        }
        
        // 如果沒有 JSON 格式，嘗試從文字中解析（向後兼容）
        if (discounts.length === 0) {
            const discountMatch = order.notes.match(/使用優惠:([^|,\n]+)/);
            if (discountMatch) {
                // 舊格式：只有名稱，沒有金額
                // 計算總折扣 = 小計 - 總金額
                totalDiscount = subtotal - (order.totalAmount || 0);
                if (totalDiscount > 0) {
                    const discountNames = discountMatch[1].split(',').map(s => s.trim());
                    // 平均分配折扣（無法獲得準確金額）
                    const avgDiscount = discountNames.length > 0 ? Math.floor(totalDiscount / discountNames.length) : 0;
                    discounts = discountNames.map(name => ({
                        name: name,
                        amount: avgDiscount
                    }));
                }
            }
        }
    }
    
    // 生成折扣明細 HTML
    if (discounts.length > 0) {
        discountDetailsHtml = `
            <div class="discount-details" style="margin-top: 15px;">
                <h4 style="margin-bottom: 10px; color: var(--main-gray);">折扣詳情</h4>
                ${discounts.map(discount => `
                    <div class="discount-item-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                        <span style="color: var(--main-gray);">使用優惠：${discount.name}</span>
                        <span style="color: var(--main-orange); font-weight: bold;">-$${formatCurrency(discount.amount)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 備註內容（排除折扣 JSON 資訊，因為已經單獨顯示）
    let cleanNotes = order.notes || '';
    if (cleanNotes) {
        // 移除折扣 JSON 部分（使用更可靠的方式）
        const discountJsonIndex = cleanNotes.indexOf('DISCOUNTS_JSON:');
        if (discountJsonIndex !== -1) {
            // 找到 JSON 結束位置
            let jsonStart = discountJsonIndex + 'DISCOUNTS_JSON:'.length;
            let jsonEnd = jsonStart;
            let braceCount = 0;
            let foundFirstBrace = false;
            
            for (let i = jsonStart; i < cleanNotes.length; i++) {
                if (cleanNotes[i] === '{') {
                    braceCount++;
                    foundFirstBrace = true;
                } else if (cleanNotes[i] === '}') {
                    braceCount--;
                    if (foundFirstBrace && braceCount === 0) {
                        jsonEnd = i + 1;
                        break;
                    }
                }
            }
            
            // 移除 | DISCOUNTS_JSON:... 部分
            const beforeJson = cleanNotes.substring(0, discountJsonIndex).replace(/\s*\|\s*$/, '');
            const afterJson = cleanNotes.substring(jsonEnd);
            cleanNotes = (beforeJson + afterJson).trim();
        }
        
        // 移除折扣文字部分（因為已經在折扣詳情中顯示）
        cleanNotes = cleanNotes.replace(/,\s*使用優惠:[^|,\n]+/, '');
    }
    
    const notesHtml = cleanNotes && cleanNotes.trim() ? `
        <div class="notes-section">
            <p>${cleanNotes}</p>
        </div>
    ` : '<p class="detail-value">無備註</p>';

    detailsContainer.innerHTML = `
        <div class="detail-section">
            <h3>訂單資訊</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">訂單編號</span>
                    <span class="detail-value">${order.orderID || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">訂單日期</span>
                    <span class="detail-value">${orderDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">訂單狀態</span>
                    <span class="detail-value">${getStatusBadge(order.status || '處理中')}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>付款資訊</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">付款方式</span>
                    <span class="detail-value">${order.paymentMethod || '未指定'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">付款狀態</span>
                    <span class="detail-value">${getStatusBadge(order.paymentStatus || '未付款', 'payment')}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>金額明細</h3>
            <div class="amount-breakdown" style="padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                    <span class="detail-label">小計</span>
                    <span class="detail-value">$${formatCurrency(subtotal)}</span>
                </div>
                ${discounts.length > 0 ? `
                    ${discounts.map(discount => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                            <span class="detail-label" style="color: var(--main-gray);">使用優惠：${discount.name}</span>
                            <span class="detail-value" style="color: var(--main-orange);">-$${formatCurrency(discount.amount)}</span>
                        </div>
                    `).join('')}
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #ddd; margin-top: 5px;">
                        <span class="detail-label" style="font-weight: bold;">折扣總計</span>
                        <span class="detail-value" style="color: var(--main-orange); font-weight: bold;">-$${formatCurrency(totalDiscount)}</span>
                    </div>
                ` : `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span class="detail-label" style="color: var(--main-gray);">折扣</span>
                        <span class="detail-value" style="color: var(--main-gray);">-$0</span>
                    </div>
                `}
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid var(--main-orange); margin-top: 10px;">
                    <span class="detail-label" style="font-size: 1.2em; font-weight: bold;">訂單總金額</span>
                    <span class="detail-value" style="color: var(--main-orange); font-size: 1.3em; font-weight: bold;">$${formatCurrency(order.totalAmount)}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>收件資訊</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">收件人姓名</span>
                    <span class="detail-value">${order.receiverName || '未指定'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">收件地址</span>
                    <span class="detail-value">${order.shippingAddress || '未指定'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">運送方式</span>
                    <span class="detail-value">${order.shippingMethod || '未指定'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">運送狀態</span>
                    <span class="detail-value">${getStatusBadge(order.shippingStatus || '準備中', 'shipping')}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>訂單明細</h3>
            ${orderItemsHtml}
        </div>

        <div class="detail-section">
            <h3>備註</h3>
            ${notesHtml}
        </div>
    `;

    // 顯示彈窗
    modal.style.display = 'flex';
}

/**
 * 設定彈窗事件
 */
function setupModalEvents() {
    const modal = document.getElementById('order-modal');
    const closeBtn = document.querySelector('.close-btn');

    // 點擊關閉按鈕
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // 點擊彈窗外部區域關閉
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ESC 鍵關閉彈窗
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
}

/**
 * 格式化日期（轉換為台灣時間 UTC+8）
 */
function formatDate(dateString) {
    if (!dateString) return '未知日期';
    
    try {
        // 創建日期對象
        const date = new Date(dateString);
        
        // 檢查日期是否有效
        if (isNaN(date.getTime())) {
            return '無效日期';
        }
        
        // 轉換為台灣時間（UTC+8）
        // 使用 toLocaleString 是最簡單可靠的方法
        const taiwanTimeString = date.toLocaleString('zh-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        // 格式：YYYY/MM/DD HH:MM:SS -> YYYY-MM-DD HH:MM:SS
        return taiwanTimeString.replace(/\//g, '-');
    } catch (error) {
        console.error('日期格式化錯誤:', error);
        return '日期格式錯誤';
    }
}

/**
 * 格式化金額（千分位逗號）
 */
function formatCurrency(amount) {
    if (!amount) return '0';
    return Number(amount).toLocaleString('zh-TW');
}

/**
 * 取得狀態標籤
 */
function getStatusBadge(status, type = 'order') {
    let className = 'status-badge ';
    let displayText = status;

    if (type === 'order') {
        // 訂單狀態
        switch (status.toLowerCase()) {
            case 'pending':
            case '待處理':
                className += 'status-pending';
                displayText = '待處理';
                break;
            case 'processing':
            case '處理中':
                className += 'status-processing';
                displayText = '處理中';
                break;
            case 'completed':
            case '已完成':
                className += 'status-completed';
                displayText = '已完成';
                break;
            case 'cancelled':
            case '已取消':
                className += 'status-cancelled';
                displayText = '已取消';
                break;
            default:
                className += 'status-pending';
        }
    } else if (type === 'payment') {
        // 付款狀態
        switch (status.toLowerCase()) {
            case 'paid':
            case '已付款':
                className += 'status-paid';
                displayText = '已付款';
                break;
            case 'unpaid':
            case '未付款':
                className += 'status-unpaid';
                displayText = '未付款';
                break;
            case 'pending':
            case '處理中':
                className += 'status-pending';
                displayText = '處理中';
                break;
            default:
                className += 'status-unpaid';
        }
    } else if (type === 'shipping') {
        // 運送狀態
        switch (status.toLowerCase()) {
            case 'preparing':
            case '準備中':
                className += 'status-pending';
                displayText = '準備中';
                break;
            case 'shipped':
            case '已出貨':
                className += 'status-shipped';
                displayText = '已出貨';
                break;
            case 'delivered':
            case '已送達':
                className += 'status-delivered';
                displayText = '已送達';
                break;
            default:
                className += 'status-pending';
        }
    }

    return `<span class="${className}">${displayText}</span>`;
}

