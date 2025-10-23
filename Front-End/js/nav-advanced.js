// ==================== 進階版導航欄組件 ====================
// 包含錯誤處理、重試機制和更好的性能

(function() {
    'use strict';

    // 配置選項
    const CONFIG = {
        retryAttempts: 3,
        retryDelay: 100,
        debug: true
    };

    // 日誌函數
    function log(message, type = 'info') {
        if (CONFIG.debug) {
            const emoji = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
            console.log(`${emoji[type]} [Nav Component] ${message}`);
        }
    }

    // 導航欄 HTML 模板
    const navHTML = `
    <header id="site-header">
        <div class="main-nav">
            <div class="navbar navbar-default mobile-nav-wrap">
                <a href="./index.html"><img class="separateLeft" src="./images/soda_title.png" alt="SODA標題" style="height:4vw; margin-right:auto;"></a>
                <ul>
                    <li>
                        <div class="nav-item nav-item-style" id="about"><a href="./about.html">關於我們</a></div>
                    </li>
                    <li>
                        <div class="nav-item nav-item-style" id="shop"><a href="./product.html">商品</a></div>
                    </li>
                    <li>
                        <div class="nav-item nav-item-style" id="userbtn"><a href="./login.html"><img src="./images/user.svg" alt="會員"></a></div>
                    </li>
                    <li>
                        <div class="show-shopping-cart">
                            <div class="nav-item nav-item-style separateRight openCart-btn" id="shoppingCarBtn">
                                <a href="javascript:void(0)" aria-label="開啟購物車"><img src="./images/shopping-cart.svg" alt="購物車"></a>
                                <span class="shoppingCart-item-nmber" aria-live="polite"></span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="ctn hidden dropbtn" onclick="openNav()" role="button" tabindex="0" aria-label="開啟選單">
                            <div class="bar1"></div>
                            <div class="bar2"></div>
                            <div class="bar3"></div>
                        </div>
                    </li>
                </ul>

                <div id="myNav" class="overlay" role="navigation" aria-label="行動版選單">
                    <a href="javascript:void(0)" class="closebtn" onclick="closeNav()" aria-label="關閉選單">&times;</a>
                    <div class="overlay-content">
                        <a href="./about.html">關於我們</a>
                        <a href="./product.html">商品</a>
                        <a href="./login.html">登入</a>
                        <a href="javascript:void(0)" class="openCart-btn">購物車</a>
                    </div>
                </div>
            </div>
        </div>
    </header>
    `;

    // 導航欄 CSS（與之前相同，這裡省略）
    const navStyles = `<style id="nav-styles">/* CSS 內容與之前相同 */</style>`;

    // 檢查依賴項
    function checkDependencies() {
        const required = {
            'localStorage': typeof Storage !== "undefined",
            'JSON': typeof JSON !== "undefined"
        };

        for (const [name, available] of Object.entries(required)) {
            if (!available) {
                log(`缺少必要功能: ${name}`, 'error');
                return false;
            }
        }
        return true;
    }

    // 檢查是否已插入
    function isNavAlreadyInjected() {
        return document.getElementById('site-header') !== null || 
               document.getElementById('nav-styles') !== null;
    }

    // 插入導航欄（帶重試機制）
    function injectNav(attempt = 1) {
        try {
            // 檢查依賴
            if (!checkDependencies()) {
                log('環境檢查失敗', 'error');
                return false;
            }

            // 檢查是否已插入
            if (isNavAlreadyInjected()) {
                log('導航欄已存在，跳過插入', 'warn');
                return true;
            }

            // 確保 body 存在
            if (!document.body) {
                if (attempt <= CONFIG.retryAttempts) {
                    log(`Body 尚未載入，第 ${attempt} 次重試...`, 'warn');
                    setTimeout(() => injectNav(attempt + 1), CONFIG.retryDelay);
                    return false;
                } else {
                    log('Body 載入超時', 'error');
                    return false;
                }
            }

            // 插入 CSS
            if (!document.getElementById('nav-styles')) {
                document.head.insertAdjacentHTML('beforeend', navStyles);
                log('CSS 樣式已插入', 'info');
            }

            // 插入 HTML
            document.body.insertAdjacentHTML('afterbegin', navHTML);
            log('HTML 結構已插入', 'success');

            // 標記當前頁面（用於高亮顯示）
            highlightCurrentPage();

            // 初始化購物車徽章
            initializeCartBadge();

            return true;

        } catch (error) {
            log(`插入失敗: ${error.message}`, 'error');
            return false;
        }
    }

    // 高亮當前頁面的導航項目
    function highlightCurrentPage() {
        try {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navItems = document.querySelectorAll('.navbar a');
            
            navItems.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes(currentPage)) {
                    link.parentElement.classList.add('active');
                }
            });
            
            log('當前頁面已高亮', 'info');
        } catch (error) {
            log(`高亮失敗: ${error.message}`, 'warn');
        }
    }

    // 初始化購物車徽章
    function initializeCartBadge() {
        // 等待 updateCartBadge 函數可用
        const checkBadge = setInterval(() => {
            if (typeof window.updateCartBadge === 'function') {
                window.updateCartBadge();
                clearInterval(checkBadge);
                log('購物車徽章已初始化', 'success');
            }
        }, 100);

        // 5 秒後停止檢查
        setTimeout(() => clearInterval(checkBadge), 5000);
    }

    // 手機版選單函數
    window.openNav = function() {
        const nav = document.getElementById("myNav");
        if (nav) nav.style.height = "100%";
    };

    window.closeNav = function() {
        const nav = document.getElementById("myNav");
        if (nav) nav.style.height = "0%";
    };

    // 暴露給外部的 API
    window.NavComponent = {
        inject: injectNav,
        isInjected: isNavAlreadyInjected,
        version: '2.0.0'
    };

    // 自動初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            log('DOM 已載入，開始插入導航欄', 'info');
            injectNav();
        });
    } else {
        log('DOM 已就緒，立即插入導航欄', 'info');
        injectNav();
    }

    // 頁面卸載時清理
    window.addEventListener('beforeunload', () => {
        log('頁面即將卸載', 'info');
    });

})();

