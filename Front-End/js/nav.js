// ==================== 導航欄組件 ====================
// 用於在所有頁面中動態插入統一的導航欄

(function () {
    'use strict';
    // 導航欄 CSS 樣式
    const navStyles = `
        <style id="nav-styles">
        header {
            box-sizing:content-box;
            background-color: var(--main-color);
            height: 40px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            position: relative;
            list-style: none;
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
            color: #000;
            text-decoration: none;
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

        console.log('✅ 導航欄已成功插入');
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

