// ==================== 導航欄組件 ====================
// 用於在所有頁面中動態插入統一的導航欄

(function () {
    'use strict';

    // 導航欄 HTML 模板
    const navHTML = `
    <header>
        <div class="main-nav">
            <!-- 導覽列 -->
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
                                <a href="javascript:void(0)"><img src="./images/shopping-cart.svg" alt="購物車"></a>
                                <span class="shoppingCart-item-nmber"></span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="ctn hidden dropbtn" onclick="openNav()">
                            <div class="bar1"></div>
                            <div class="bar2"></div>
                            <div class="bar3"></div>
                        </div>
                    </li>
                </ul>

                <!-- 下拉選單 -->
                <div id="myNav" class="overlay">
                    <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
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

    // 導航欄 CSS 樣式
    const navStyles = `
        <style id="nav-styles">
            .main-nav {
                padding: 20px;
                background: var(--main-color);
            }
            .main-nav a {
                cursor: pointer;
            }
            .main-nav img {
                object-fit: contain;
            }

            .hidden {
                display: none;
            }

            .show-shopping-cart {
                display: block;
            }

            /* 第一部分 */
            a {
                text-decoration: none;
                color: #000;
            }

            /* 導覽列 */
            .navbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: transparent;
                position: relative;
                width: 100%;
                z-index: 2;
                margin-bottom: 0;
            }

            .nav-item {
                margin-right: 1vw;
                position: relative;
                cursor: pointer;
                font-weight: 600;
                font-size: 1.6vw;
            }

            .nav-item-style {
                background-color: #f0f0f0;
                border: 0.05vw solid #000;
                padding: 0.4vw 0.4vw 0 0.4vw;
                border-radius: 20px;
            }

            .nav-item img {
                min-width: 1.5vw;
                min-height: 1.5vw;
                width: 2vw;
                height: 2vw;
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

            .separateLeft {
                width: 20vw;
                max-width: 200px;
                min-width: 150px;
            }

            .navbar ul {
                display: flex;
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .sign {
                line-height: 12px;
                font-size: small;
                text-align: right;
                margin-top: 12px;
            }

            /* 購物車數量徽章 */
            .shoppingCart-item-nmber {
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #ff4444;
                color: white;
                font-size: 12px;
                font-weight: bold;
                min-width: 20px;
                height: 20px;
                border-radius: 10px;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 0 6px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                opacity: 0;
                transform: scale(0.5);
            }

            .shoppingCart-item-nmber.show {
                display: flex;
                opacity: 1;
                transform: scale(1);
                animation: badgePop 0.3s ease;
            }

            @keyframes badgePop {
                0% { transform: scale(0.5); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            #shoppingCarBtn {
                position: relative;
            }

            /* ======768px以下導覽列下拉選單======== */
            .ctn {
                cursor: pointer;
            }

            .bar1, .bar2, .bar3 {
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
                top: 0;
                left: 0;
                background-color: rgba(0, 0, 0, 0.9);
                overflow-y: hidden;
                transition: 0.5s;
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
                    font-size: 20px;
                }
                .overlay .closebtn {
                    font-size: 40px;
                    top: 15px;
                    right: 35px;
                }
            }

            @media (max-width: 768px) {
                .show-shopping-cart {
                    display: none;
                }
                .container {
                    display: inline-block;
                }
                .dropdown-content {
                    position: absolute;
                    top: 60px;
                    right: 10px;
                    display: none;
                }
                .dropdown-content.show-shopping-cart {
                    display: block;
                }
                .shoppingCart-item-nmber {
                    font-size: 10px;
                    min-width: 18px;
                    height: 18px;
                    top: -6px;
                    right: -6px;
                }
            }
        </style>
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

        console.log('✅ 導航欄已成功插入');
    }

    // 768px以下導覽列下拉選單函數
    window.openNav = function () {
        document.getElementById("myNav").style.height = "100%";
    };

    window.closeNav = function () {
        document.getElementById("myNav").style.height = "0%";
    };

    // 當 DOM 載入完成時插入導航欄
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNav);
    } else {
        // DOM 已經載入完成
        injectNav();
    }

})();

