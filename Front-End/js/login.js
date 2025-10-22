 const API_BASE_URL = 'https://localhost:7085/api'; // 請根據您的實際 API 位址修改
        let currentToken = null;

        // 註冊功能
        async function register() {
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const firstName = document.getElementById('regFirstName').value;
            const lastName = document.getElementById('regLastName').value;

            if (!username || !email || !password) {
                showResponse('registerResponse', '請填寫所有必填欄位', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                        firstName: firstName || null,
                        lastName: lastName || null
                    })
                });

                const data = await response.json();
                
                if (response.ok && data.success) {
                    currentToken = data.token;
                    showResponse('registerResponse', 
                        `註冊成功！\n使用者：${data.user.username}\n郵件：${data.user.email}`, 
                        true);
                    displayToken();
                    clearRegisterForm();
                } else {
                    showResponse('registerResponse', `註冊失敗：${data.message}`, false);
                }
            } catch (error) {
                showResponse('registerResponse', `錯誤：${error.message}`, false);
            }
        }

        // 登入功能
        async function login() {
            const usernameOrEmail = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (!usernameOrEmail || !password) {
                showResponse('loginResponse', '請填寫所有欄位', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        usernameOrEmail,
                        password
                    })
                });

                const data = await response.json();
                
                if (response.ok && data.success) {
                    currentToken = data.token;
                    showResponse('loginResponse', 
                        `登入成功！\n歡迎回來，${data.user.username}`, 
                        true);
                    displayToken();
                    clearLoginForm();
                } else {
                    showResponse('loginResponse', `登入失敗：${data.message}`, false);
                }
            } catch (error) {
                showResponse('loginResponse', `錯誤：${error.message}`, false);
            }
        }

        // 登出功能
        async function logout() {
            if (!currentToken) {
                showResponse('userResponse', '尚未登入', false);
                return;
            }

            try {
                // 呼叫伺服器端 logout API
                const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    showResponse('userResponse', `✅ ${data.message}`, true);
                } else {
                    showResponse('userResponse', '⚠️ 登出請求失敗，但已清除本地 Token', false);
                }
            } catch (error) {
                console.error('Logout error:', error);
                showResponse('userResponse', '⚠️ 無法連接伺服器，已清除本地 Token', false);
            } finally {
                // 無論如何都清除前端的 Token
                currentToken = null;
                document.getElementById('tokenDisplay').style.display = 'none';
                clearAllForms();
            }
        }

        // 新增：登出所有裝置
        async function logoutAll() {
            if (!currentToken) {
                showResponse('userResponse', '尚未登入', false);
                return;
            }

            if (!confirm('確定要登出所有裝置嗎？')) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/logout-all`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    showResponse('userResponse', `✅ ${data.message}`, true);
                } else {
                    showResponse('userResponse', '登出失敗', false);
                }
            } catch (error) {
                showResponse('userResponse', `錯誤：${error.message}`, false);
            } finally {
                currentToken = null;
                document.getElementById('tokenDisplay').style.display = 'none';
                clearAllForms();
            }
        }

        // 取得當前使用者資訊
        async function getCurrentUser() {
            if (!currentToken) {
                showResponse('userResponse', '請先登入', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/user/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                });

                if (response.ok) {
                    const user = await response.json();
                    showResponse('userResponse', formatUserInfo(user), true);
                } else {
                    showResponse('userResponse', '無法取得使用者資訊', false);
                }
            } catch (error) {
                showResponse('userResponse', `錯誤：${error.message}`, false);
            }
        }

        // 取得所有使用者
        async function getAllUsers() {
            if (!currentToken) {
                showResponse('userResponse', '請先登入', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/user`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                });

                if (response.ok) {
                    const users = await response.json();
                    let output = `共 ${users.length} 位使用者：\n\n`;
                    users.forEach(user => {
                        output += `• ${user.username} (${user.email})\n`;
                    });
                    showResponse('userResponse', output, true);
                } else {
                    showResponse('userResponse', '無法取得使用者列表', false);
                }
            } catch (error) {
                showResponse('userResponse', `錯誤：${error.message}`, false);
            }
        }

        // 顯示回應訊息
        function showResponse(elementId, message, isSuccess) {
            const element = document.getElementById(elementId);
            element.textContent = message;
            element.className = `response ${isSuccess ? 'success' : 'error'}`;
            element.style.display = 'block';
        }

        // 顯示 Token
        function displayToken() {
            document.getElementById('tokenDisplay').style.display = 'block';
            document.getElementById('tokenText').textContent = currentToken;
        }

        // 格式化使用者資訊
        function formatUserInfo(user) {
            return `使用者 ID: ${user.id}
使用者名稱: ${user.username}
電子郵件: ${user.email}
角色: ${user.roleDisplay}
名字: ${user.firstName || '未設定'}
姓氏: ${user.lastName || '未設定'}
帳號狀態: ${user.isActive ? '啟用' : '停用'}
註冊時間: ${new Date(user.createdAt).toLocaleString('zh-TW')}
最後登入: ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-TW') : '無記錄'}`;
        }

        // 清除表單
        function clearRegisterForm() {
            document.getElementById('regUsername').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regFirstName').value = '';
            document.getElementById('regLastName').value = '';
        }

        function clearLoginForm() {
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
        }

        function clearAllForms() {
            clearRegisterForm();
            clearLoginForm();
        }