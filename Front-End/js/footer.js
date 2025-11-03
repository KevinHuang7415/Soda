// ==================== Footer 組件 ====================
// 用於在所有頁面中動態插入統一的 Footer

(function () {
    'use strict';

    // Footer CSS 樣式
    const footerStyles = `
        <style id="footer-styles">
        footer {
            padding: 2vw 0;
            font-size: 1.5vw;
            background-color: var(--main-color);
            text-align: center;
            width: 100%;
            margin: 0;
            margin-top: auto;
            display: flex;
            flex-direction: column;
        }
        </style>
    `;

    // Footer HTML 模板
    const footerHTML = `
        <footer>
            Copyright &copy;<ins>第五組</ins> All Rights Reserved.
        </footer>
    `;

    // 插入 Footer 的函數
    function injectFooter() {
        // 檢查是否已經插入過（避免重複）
        if (document.getElementById('footer-styles')) {
            console.warn('Footer 已經存在，跳過插入');
            return;
        }

        // 插入 CSS 樣式到 head
        document.head.insertAdjacentHTML('beforeend', footerStyles);

        // 插入 HTML 到 body 末尾
        document.body.insertAdjacentHTML('beforeend', footerHTML);

        console.log('✅ Footer 已成功插入');
    }

    // 確保 body 存在後才插入 Footer
    function initFooter() {
        if (!document.body) {
            // body 還沒準備好，等待 DOMContentLoaded
            document.addEventListener('DOMContentLoaded', injectFooter);
        } else {
            // DOM 已經載入完成
            injectFooter();
        }
    }

    // 立即執行或等待 DOM 準備好
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectFooter);
    } else {
        initFooter();
    }

})();

