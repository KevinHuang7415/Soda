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
    if (order.orderItems) {
        try {
            const items = JSON.parse(order.orderItems);
            if (Array.isArray(items) && items.length > 0) {
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
                            ${items.map(item => `
                                <tr>
                                    <td>${item.productName || item.name || '未知商品'}</td>
                                    <td>${item.quantity || 0}</td>
                                    <td>$${formatCurrency(item.price || 0)}</td>
                                    <td>$${formatCurrency((item.quantity || 0) * (item.price || 0))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (e) {
            console.error('解析訂單明細時發生錯誤:', e);
            orderItemsHtml = `<p>${order.orderItems}</p>`;
        }
    }

    // 備註內容
    const notesHtml = order.notes ? `
        <div class="notes-section">
            <p>${order.notes}</p>
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
                <div class="detail-item">
                    <span class="detail-label">訂單總金額</span>
                    <span class="detail-value" style="color: var(--main-orange); font-size: 1.3em;">$${formatCurrency(order.totalAmount)}</span>
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
 * 格式化日期
 */
function formatDate(dateString) {
    if (!dateString) return '未知日期';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
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

