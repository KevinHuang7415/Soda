// ==================== 身份驗證輔助函數 ====================
// 用於處理登入狀態、權限檢查、導向等

// ========== 檢查登入狀態 ==========
function isLoggedIn() {
  const token = localStorage.getItem('token');
  return token !== null && token !== '';
}

// ========== 取得當前使用者資訊 ==========
function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

// ========== 取得當前使用者角色 ==========
function getUserRole() {
  const user = getCurrentUser();
  return user?.role || 'Guest';
}

// ========== 需要登入才能訪問（用於購物車、結帳頁） ==========
function requireLogin(redirectBackHere = true) {
  if (!isLoggedIn()) {
    if (redirectBackHere) {
      // 記錄當前頁面路徑，登入後導回來
      const currentPage = window.location.pathname.split('/').pop();
      localStorage.setItem('redirectAfterLogin', './' + currentPage);
    }
    // 導向登入頁
    alert('請先登入會員');
    window.location.href = './login.html';
    return false;
  }
  return true;
}

// ========== 只允許管理員訪問（用於 Dashboard） ==========
function requireAdmin() {
  if (!isLoggedIn()) {
    alert('請先登入');
    window.location.href = './login.html';
    return false;
  }
  
  if (getUserRole() !== 'Admin') {
    alert('您沒有權限訪問此頁面');
    window.location.href = './index.html';
    return false;
  }
  
  return true;
}

// ========== 登出 ==========
function logout() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // 呼叫後端登出 API（可選）
    // 檢查 axios 是否存在
    if (typeof axios !== 'undefined') {
      axios.post('https://localhost:7085/api/Auth/logout', {}, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(() => {
        console.log('已從伺服器登出');
      })
      .catch((error) => {
        console.error('登出時發生錯誤:', error);
      })
      .finally(() => {
        // 無論 API 呼叫成功與否，都清除本地資料
        clearAuthData();
        alert('已登出');
        window.location.href = './login.html';
      });
    } else {
      // 如果 axios 未載入，直接清除資料
      clearAuthData();
      alert('已登出');
      window.location.href = './login.html';
    }
  } else {
    clearAuthData();
    window.location.href = './login.html';
  }
}

// ========== 清除身份驗證資料 ==========
function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('redirectAfterLogin');
  
  // 清除 axios 預設的 Authorization header（防止使用舊 token）
  if (typeof axios !== 'undefined') {
    delete axios.defaults.headers.common['Authorization'];
  }
  
  console.log('✅ 已清除所有身份驗證資料和 axios headers');
}

// ========== 設定 Axios 預設 Header ==========
function setupAxiosAuth() {
  const token = localStorage.getItem('token');
  if (token && typeof axios !== 'undefined') {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }
}

// ========== 取得 Token（用於 API 請求） ==========
function getAuthToken() {
  return localStorage.getItem('token');
}

// ========== 更新顯示使用者名稱（可選） ==========
function updateUserDisplay() {
  const user = getCurrentUser();
  if (user) {
    // 尋找頁面中顯示使用者名稱的元素並更新
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
      el.textContent = user.username || user.email;
    });
  }
}

// ==================== 導航欄組件 ====================
// 用於在所有頁面中動態插入統一的導航欄

(function () {
    'use strict';
    // 導航欄 CSS 樣式
    const navStyles = `
        <style id="nav-styles">
        html,
        body {
             height: 100%;
             margin: 0;
             padding: 0;
        }
        header {
            box-sizing:content-box;
            background-color: var(--main-color);
            height: 40px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            padding: 20px 30px;
            list-style: none;
            position: relative; 
        }
        header nav {
            visibility: hidden;
            position: absolute;
            width: 2em;
            height: 1em;
            top: calc(40px - 0.5em);
            right: 35px;
        }

        header nav .bar {
            width: 100%;
            height: 2px;
            position: absolute;
            background-color: var(--main-gray);
        }

        header nav .bar:nth-of-type(1) {
            top: 0;
        }

        header nav .bar:nth-of-type(2) {
            top: calc(0.5em - 1px);
        }

        header nav .bar:nth-of-type(3) {
            top: calc(0.5em - 1px);
        }

        header nav .bar:nth-of-type(4) {
            bottom: 0;
        }

        header nav .bar:nth-of-type(1).change {
            opacity: 0;
        }

        header nav .bar:nth-of-type(2).change {
            transform: rotate(40deg);
        }

        header nav .bar:nth-of-type(3).change {
            transform: rotate(-40deg);
        }

        header nav .bar:nth-of-type(4).change {
            opacity: 0;
        }

        .header img {
            object-fit: contain;
            height: 100%;
            vertical-align: middle;
        }

        .logoBox {
            height: 40px;
        }

        .navUl {
            margin-top: auto;
            list-style: none;
            display: flex;
            gap: 10px;
            text-align: center;
            line-height: 50px;
        }

        .navUl li {
            /* border: 1px solid #333; */
        }

        .navUl a {
            padding: 0;
            color: #000;
            text-decoration: none;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: bold;
        }

        .navTxtBtn {
            height: 50px;
            width: 100px;
            background: white;
            border-radius: 30px;
        }

        .navIconBtn {
            height: 50px;
            width: 50px;
            background: white;
            border-radius: 50%;
        }

        .navIconBtn img {
            height: 20px;
        }

        .navIconBtn .user-initial {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-size: 18px;
            font-weight: bold;
            color: #000;
            text-transform: uppercase;
        }

        .navBtn {
            transition: transform 0.2s ease-in-out;
        }

        .navBtn:hover {
            cursor: pointer;
            animation: heartBeat 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
        }

        @keyframes heartBeat {
            0% {
                transform: scale(1);
            }

            30% {
                transform: scale(0.95);
            }

            60% {
                transform: scale(1.05);
            }

            100% {
                transform: scale(1);
            }
        }

        /* 下拉 DIV */
        .dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            border-radius: 0.5vw;
            box-shadow: 0 0.3vw 1vw rgba(0, 0, 0, 0.15);
            overflow: hidden;
            transform: translateY(-1vw);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
            z-index: 11;
        }

        .dropdown.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        .dropdown-item {
            padding: 0.8vw 1.2vw;
            font-size: 0.9vw;
            transition: background 0.2s;
        }

        .dropdown-item:hover {
            background: #f0f0f0;
        }

        .separateRight {
            margin-right: 3vw;
        }

        .separateLeft {
            padding-left: 3vw;
            padding-top: 5px;
            width: 20vw;
        }

        .navbar ul {
            display: flex;
            list-style: none;
        }

        .sign {
            line-height: 12px;
            font-size: small;
            text-align: right;
            margin-top: 12px;
        }

        /* ======768px以下導覽列下拉選單========  */
        .ctn {
            cursor: pointer;
        }

        .bar1,
        .bar2,
        .bar3 {
            width: 20px;
            height: 1px;
            background-color: #333;
            margin: 5px 10px 0 0;
            transition: 0.4s;
        }

        .change .bar1 {
            -webkit-transform: rotate(-45deg) translate(-9px, 6px);
            transform: rotate(-45deg) translate(-9px, 6px);
        }

        .change .bar2 {
            opacity: 0;
        }

        .change .bar3 {
            -webkit-transform: rotate(45deg) translate(-8px, -8px);
            transform: rotate(45deg) translate(-8px, -8px);
        }

        .overlay {
            height: 0%;
            width: 100%;
            position: fixed;
            z-index: 10;
            top: 80px;
            left: 0;
            background-color: rgb(0, 0, 0);
            background-color: rgba(0, 0, 0, 0.9);
            overflow-y: hidden;
            transition: 0.5s;
        }

        .overlay.change {
            height: 100%;
        }

        .overlay-content {
            position: relative;
            top: 25%;
            width: 100%;
            text-align: center;
            margin-top: 30px;
        }

        .overlay a {
            padding: 8px;
            text-decoration: none;
            font-size: 36px;
            color: #818181;
            display: block;
            transition: 0.3s;
        }

        .overlay a:hover,
        .overlay a:focus {
            color: #f1f1f1;
        }

        .overlay .closebtn {
            position: absolute;
            top: 20px;
            right: 45px;
            font-size: 60px;
        }

        @media screen and (max-height: 450px) {
            .overlay {
                overflow-y: auto;
            }

            .overlay a {
                font-size: 20px
            }

            .overlay .closebtn {
                font-size: 40px;
                top: 15px;
                right: 35px;
            }
        }

        @media (max-width:768px) {
            header {
                height: 40px;
            }

            header nav {
                visibility: visible;
            }

            .navBox.show {
                display: none;
            }

            .container {
                display: inline-block;
            }

            .dropdown-content {
                position: absolute;
                top: 60px;
                /* 可依你的導覽列高度調整 */
                right: 10px;
                display: none;
            }

            .dropdown-content.show {
                display: block;
            }

            .overlay {
                top: 80px;
            }
        }

        @media screen and (min-width: 769px) {
            .overlay {
                display: none;
            }
        }
    </style>
    `;
    // 導航欄 HTML 模板
    const navHTML = `
    <header class="header">
        <nav>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </nav>
        <div class="logoBox">
            <a href="./index.html"><img src="./images/logo.png" alt=""></a>
        </div>

        <div class="navBox show">
            <ul class="navUl">
                <li class="navBtn navTxtBtn">
                    <a href="./about.html">關於我們</a>
                </li>
                <li class="navBtn navTxtBtn">
                    <a href="./product.html">商品</a>
                </li>
                <li class="navBtn navIconBtn">
                    <a href="./login.html"><img src="./images/user.svg" alt=""></a>
                </li>
                <li class="navBtn navIconBtn openCart-btn">
                    <a href=""><img src="./images/shopping-cart.svg" alt=""></a>
                </li>
            </ul>
        </div>
        <!-- 下拉選單 -->
        <div id="myNav" class="overlay ">
            <!-- <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a> -->
            <div class="overlay-content">
                <a href="./about.html">關於我們</a>
                <a href="./product.html">商品</a>
                <a href="./login.html">登入</a>
                <a href="" class="openCart-btn">購物車</a>
            </div>
        </div>
    </header>
    `;
    // 插入導航欄的函數
    function injectNav() {
        // 檢查是否已經插入過（避免重複）
        if (document.getElementById('nav-styles')) {
            console.warn('導航欄已經存在，跳過插入');
            return;
        }

        // 插入 CSS 樣式到 head
        document.head.insertAdjacentHTML('beforeend', navStyles);

        // 插入 HTML 到 body 開頭
        document.body.insertAdjacentHTML('afterbegin', navHTML);

        // 綁定事件監聽器（在插入 HTML 後）
        const navElement = document.getElementsByTagName("nav")[0];
        if (navElement) {
            navElement.addEventListener("click", function () {
                const overlay = document.getElementsByClassName("overlay")[0];
                if (overlay) {
                    overlay.classList.toggle("change");
                }
                for (const bar of this.children) {
                    bar.classList.toggle("change");
                }
            });
        }

        // ========== 檢查登入狀態並動態修改登入連結 ==========
        updateLoginLinks();

        console.log('✅ 導航欄已成功插入');
    }

    // 獲取使用者首字母
    function getUserInitial() {
        const user = getCurrentUser();
        if (!user) return '';
        
        // 優先使用 username，如果沒有則使用 email
        const name = user.username || user.email || '';
        if (!name) return '';
        
        // 取得第一個字母（英文字母）
        const firstChar = name.charAt(0).toUpperCase();
        // 如果第一個字符不是英文字母，嘗試找到第一個英文字母
        if (!/[A-Za-z]/.test(firstChar)) {
            for (let i = 0; i < name.length; i++) {
                if (/[A-Za-z]/.test(name[i])) {
                    return name[i].toUpperCase();
                }
            }
            // 如果完全沒有英文字母，返回第一個字符
            return firstChar;
        }
        return firstChar;
    }

    // 更新登入連結的函數（可從外部調用）
    window.updateNavLoginStatus = function() {
        updateLoginLinks();
    };

    function updateLoginLinks() {
        // 檢查是否已登入
        function isUserLoggedIn() {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            return token !== null && token !== '' && user !== null && user !== '';
        }

        if (isUserLoggedIn()) {
            // 已登入：將所有登入連結改為會員系統
            const loginLinks = document.querySelectorAll('a[href="./login.html"]');
            loginLinks.forEach(function(link) {
                link.href = './memberSystem.html';
                
                // 檢查是否在 navIconBtn 中（使用者圖標按鈕）
                const parentBtn = link.closest('.navIconBtn');
                if (parentBtn) {
                    // 如果是圖標按鈕，將圖片替換為使用者首字母
                    const img = link.querySelector('img');
                    const existingInitial = link.querySelector('.user-initial');
                    
                    // 如果已經有首字母，更新它；如果有圖片，替換它
                    if (existingInitial) {
                        // 已經有首字母，只需要更新
                        const initial = getUserInitial();
                        existingInitial.textContent = initial || '?';
                    } else if (img) {
                        // 有圖片，替換為首字母
                        const initial = getUserInitial();
                        const initialSpan = document.createElement('span');
                        initialSpan.className = 'user-initial';
                        initialSpan.textContent = initial || '?';
                        img.replaceWith(initialSpan);
                        console.log('✅ 已將使用者圖標改為首字母:', initial);
                    }
                } else {
                    // 如果是文字連結，可以選擇改變文字（可選）
                    if (link.textContent === '登入') {
                        link.textContent = '會員中心';
                    }
                    console.log('✅ 已將登入連結改為會員中心');
                }
            });
        } else {
            // 未登入：恢復圖片（如果之前被替換了）
            const loginLinks = document.querySelectorAll('a[href="./memberSystem.html"]');
            loginLinks.forEach(function(link) {
                link.href = './login.html';
                
                // 檢查是否在 navIconBtn 中
                const parentBtn = link.closest('.navIconBtn');
                if (parentBtn) {
                    const existingInitial = link.querySelector('.user-initial');
                    // 如果有首字母，恢復為圖片
                    if (existingInitial) {
                        const img = document.createElement('img');
                        img.src = './images/user.svg';
                        img.alt = '';
                        existingInitial.replaceWith(img);
                        console.log('✅ 已恢復使用者圖標');
                    }
                } else {
                    // 如果是文字連結，恢復為登入
                    if (link.textContent === '會員中心') {
                        link.textContent = '登入';
                    }
                }
            });
            console.log('ℹ️ 用戶未登入，保持登入連結');
            
            // 為登入連結添加點擊事件，保存當前頁面以便登入後返回
            loginLinks.forEach(function(link) {
                // 檢查是否已經有監聽器（避免重複添加）
                if (link.hasAttribute('data-redirect-listener')) {
                    return;
                }
                link.setAttribute('data-redirect-listener', 'true');
                
                // 添加點擊事件監聽器
                link.addEventListener('click', function(e) {
                    // 如果已經有 redirectAfterLogin（例如由其他頁面設置的），則不覆蓋
                    if (!localStorage.getItem('redirectAfterLogin')) {
                        // 獲取當前頁面的完整 URL（包含路徑和查詢參數）
                        const currentPath = window.location.pathname.split('/').pop();
                        const currentSearch = window.location.search;
                        const returnUrl = './' + currentPath + currentSearch;
                        
                        // 如果是登入頁面本身，則不保存
                        if (currentPath !== 'login.html') {
                            localStorage.setItem('redirectAfterLogin', returnUrl);
                            console.log('✅ 已保存當前頁面以便登入後返回:', returnUrl);
                        }
                    }
                    // 讓連結正常執行跳轉
                });
            });
        }
    }

    // 確保 body 存在後才插入導航欄
    function initNav() {
        if (!document.body) {
            // body 還沒準備好，等待 DOMContentLoaded
            document.addEventListener('DOMContentLoaded', injectNav);
        } else {
            // DOM 已經載入完成
            injectNav();
        }
    }

    // 立即執行或等待 DOM 準備好
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNav);
    } else {
        initNav();
    }

})();

