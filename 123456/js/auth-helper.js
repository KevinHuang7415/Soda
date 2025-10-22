/**
 * 身份驗證輔助函數
 * 用於處理登入狀態、權限檢查、導向等
 */

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
    window.location.href = './indexPart234.html';
    return false;
  }
  
  return true;
}

// ========== 登出 ==========
function logout() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // 呼叫後端登出 API（可選）
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
    clearAuthData();
    window.location.href = './login.html';
  }
}

// ========== 清除身份驗證資料 ==========
function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('redirectAfterLogin');
}

// ========== 設定 Axios 預設 Header ==========
function setupAxiosAuth() {
  const token = localStorage.getItem('token');
  if (token) {
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

