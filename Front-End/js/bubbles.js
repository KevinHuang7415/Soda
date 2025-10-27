// <!-- Bubbles made of SVG Gradients and SVG Masks just as experiment : ) 

// How bubble was made: https://codepen.io/yoksel/full/BzkyBJ
// -->

// ==================== 泡泡動畫組件 ====================
// 用於在頁面中顯示動態泡泡效果
// 自動插入 CSS 樣式和 HTML 結構

(function () {
    'use strict';

    // 泡泡動畫 CSS 樣式
    const bubbleStyles = `
        <style id="bubbles-styles">
        .hidden {
            display: none;
        }

        .svg {
            position: absolute;
            width: 250px;
            height: 250px;
            overflow: visible;
            mix-blend-mode: multiply;
        }

        .svg--defs {
            width: 0;
            height: 0;
        }

        .demo {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            overflow: hidden;
            isolation: isolate;
            z-index: 1;
            pointer-events: none; /* 讓泡泡不阻擋其他元素操作 */
        }

        .demo__content {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .bubble {
            cursor: pointer;
            pointer-events: auto; /* 泡泡本身可以點擊 */
        }

        .bubble__splash {
            opacity: 0;
            pointer-events: none;
        }
        </style>
    `;

    // 泡泡動畫 HTML 結構
    const bubbleHTML = `
        <div class="demo">
            <div class="demo__content">
                <!-- SVG 定義 -->
                <svg class="svg svg--defs">
                    <radialGradient id="grad--bw" fx="25%" fy="25%">
                        <stop offset="0%" stop-color="black" />
                        <stop offset="30%" stop-color="black" stop-opacity=".2" />
                        <stop offset="97%" stop-color="white" stop-opacity=".4" />
                        <stop offset="100%" stop-color="black" />
                    </radialGradient>

                    <mask id="mask" maskContentUnits="objectBoundingBox">
                        <rect fill="url(#grad--bw)" width="1" height="1"></rect>
                    </mask>

                    <radialGradient id="grad--spot" fx="50%" fy="20%">
                        <stop offset="10%" stop-color="white" stop-opacity=".7" />
                        <stop offset="70%" stop-color="white" stop-opacity="0" />
                    </radialGradient>

                    <radialGradient id="grad--bw-light" fx="25%" fy="10%">
                        <stop offset="60%" stop-color="black" stop-opacity="0" />
                        <stop offset="90%" stop-color="white" stop-opacity=".25" />
                        <stop offset="100%" stop-color="black" />
                    </radialGradient>

                    <mask id="mask--light-top" maskContentUnits="objectBoundingBox">
                        <rect fill="url(#grad--bw-light)" width="1" height="1" transform="rotate(180, .5, .5)"></rect>
                    </mask>

                    <mask id="mask--light-bottom" maskContentUnits="objectBoundingBox">
                        <rect fill="url(#grad--bw-light)" width="1" height="1"></rect>
                    </mask>

                    <linearGradient id="grad" x1="0" y1="100%" x2="100%" y2="0">
                        <stop offset="0%" stop-color="dodgerblue" class="stop-1" />
                        <stop offset="50%" stop-color="fuchsia" class="stop-2" />
                        <stop offset="100%" stop-color="yellow" class="stop-3" />
                    </linearGradient>

                    <mask id="mask--collapse" maskContentUnits="objectBoundingBox">
                        <circle r=".5" cx=".5" cy=".5" class="collapse-circle"></circle>
                    </mask>

                    <symbol id="splash">
                        <g class="splash__group" fill="none" stroke="white" stroke-opacity=".8">
                            <circle r="49%" cx="50%" cy="50%" stroke-width="3%" stroke-dasharray="1% 10%" class="splash__circle _hidden"></circle>
                            <circle r="44%" cx="50%" cy="50%" stroke-width="2%" stroke-dasharray="1% 5%" class="splash__circle _hidden"></circle>
                            <circle r="39%" cx="50%" cy="50%" stroke-width="1%" stroke-dasharray="1% 8%" class="splash__circle _hidden"></circle>
                            <circle r="33%" cx="50%" cy="50%" stroke-width="3%" stroke-dasharray="1% 6%" class="splash__circle _hidden"></circle>
                            <circle r="26%" cx="50%" cy="50%" stroke-width="1%" stroke-dasharray="1% 7%" class="splash__circle _hidden"></circle>
                            <circle r="18%" cx="50%" cy="50%" stroke-width="1%" stroke-dasharray="1% 8%" class="splash__circle _hidden"></circle>
                        </g>
                    </symbol>
                </svg>

                <!-- 泡泡模板 -->
                <div class="demo__defs hidden">
                    <svg class="svg bubble" viewBox="0 0 200 200">
                        <g class="bubble__group">
                            <ellipse rx="20%" ry="10%" cx="150" cy="150" fill="url(#grad--spot)" transform="rotate(-225, 150, 150)" class="shape _hidden"></ellipse>
                            <circle r="50%" cx="50%" cy="50%" fill="aqua" mask="url(#mask--light-bottom)" class="shape _hidden"></circle>
                            <circle r="50%" cx="50%" cy="50%" fill="yellow" mask="url(#mask--light-top)" class="shape _hidden"></circle>
                            <ellipse rx="55" ry="25" cx="55" cy="55" fill="url(#grad--spot)" transform="rotate(-45, 55, 55)" class="shape _hidden"></ellipse>
                            <circle r="50%" cx="50%" cy="50%" fill="url(#grad)" mask="url(#mask)" class="shape _hidden"></circle>
                        </g>
                        <use xlink:href="#splash" class="bubble__splash" />
                    </svg>
                </div>
            </div>
        </div>
    `;

    // 配置參數
    var config = {
        maxBubbles: 25,
        baseShapeSize: 200,
        minShapeSize: 50,
        time: 7,
        minTime: 4
    };

    // 插入泡泡結構
    function injectBubbles() {
        // 檢查是否已經插入過（避免重複）
        if (document.getElementById('bubbles-styles')) {
            console.warn('泡泡動畫已經存在，跳過插入');
            return;
        }

        // 插入 CSS 樣式到 head
        document.head.insertAdjacentHTML('beforeend', bubbleStyles);

        // 插入 HTML 到 body 開頭
        document.body.insertAdjacentHTML('afterbegin', bubbleHTML);

        console.log('✅ 泡泡結構已成功插入');
    }

    // 初始化泡泡動畫
    function initBubbles(options) {
        // 合併配置
        if (options) {
            config = Object.assign(config, options);
        }

        // 確保結構已插入
        if (!document.getElementById('bubbles-styles')) {
            injectBubbles();
        }

        console.clear();

        var maxBubbles = config.maxBubbles;
        var container = document.querySelector('.demo');
        
        if (!container) {
            console.error('找不到 .demo 容器');
            return;
        }

        var containerWidth = container.clientWidth;
        var containerHeight = container.clientHeight;
        var content = document.querySelector('.demo__content');
        
        if (!content) {
            console.error('找不到 .demo__content 容器');
            return;
        }

        var shape = document.querySelector('.bubble');
        
        if (!shape) {
            console.error('找不到 .bubble 模板');
            return;
        }

        var shapeWidth = shape.clientWidth;
        var shapeHeight = shape.clientHeight;

        var bubbles = [];

        var minX = 0;
        var minY = 0;

        var baseShapeSize = config.baseShapeSize;
        var minShapeSize = config.minShapeSize;

        var time = config.time;
        var minTime = config.minTime;

        var posibleSides = ['top', 'right', 'bottom', 'left'];

        //------------------------------

        function Bubble(pos) {
            this.bubble = shape.cloneNode(true);
            this.setSize();
            this.setPos();
            this.addAnimation();
            content.appendChild(this.bubble);
            this.content = this.bubble.querySelector('.bubble__group');
            this.splash = this.bubble.querySelector('.bubble__splash');
            this.isCollapsed = false;
            var that = this;

            this.bubble.onclick = function () {
                if (!that.isCollapsed) {
                    that.isCollapsed = true;
                    that.collapse();
                }
            }
        }

        //------------------------------

        Bubble.prototype.collapse = function () {
            var that = this;

            function resetBubble() {
                var tl = new TimelineLite();
                that.setSize();
                that.setPos();

                tl.to(that.content, .3, {
                    'scale': 1,
                    'opacity': 1,
                    'delay': 2,
                    'onComplete': function () {
                        that.isCollapsed = false;
                    }
                });
            }

            var tl = new TimelineLite();
            tl.set(this.content, {
                'scale': 0,
                'transform-origin': '100px 100px',
                'opacity': 0
            });
            tl.set(this.splash, {
                'scale': .5,
                'transform-origin': '100px 100px',
                'opacity': 1,
            });
            tl.to(this.splash, .15, {
                'scale': 1.5,
                'opacity': 0,
                'ease': Power1.easeOut,
                'onComplete': resetBubble
            });
        }

        //------------------------------

        Bubble.prototype.setPos = function () {
            var target = this.getSide();
            this.bubble.style.transform = 'translate3d(' + target.coords.x + 'px, ' + target.coords.y + 'px, 0)';
        }

        //------------------------------

        Bubble.prototype.setSize = function () {
            this.shapeSize = Math.round(Math.random() * (baseShapeSize - minShapeSize)) + minShapeSize;
            this.bubble.style.width = this.shapeSize + 'px';
            this.bubble.style.height = this.shapeSize + 'px';

            this.maxX = containerWidth - this.shapeSize;
            this.maxY = containerHeight - this.shapeSize;
        }

        //------------------------------

        Bubble.prototype.addAnimation = function () {

            var minX = 0;
            var newTime = Math.random() * time + minTime;
            var elem = this.bubble;
            var delay = Math.random() * time;
            var tl = new TimelineLite();
            var that = this;

            animate();

            function animate() {
                var target = that.getSide(that.side);
                that.side = target.side;
                var propSet = {
                    x: target.coords.x,
                    y: target.coords.y,
                    ease: SlowMo.easeInOut,
                    delay: delay,
                    onComplete: animate
                };
                tl.to(elem, newTime, propSet);

                if (delay) {
                    delay = 0;
                }
            }
        }

        //------------------------------

        Bubble.prototype.getSide = function () {
            var targetParams = {
                side: '',
                coords: {}
            };
            var maxRandX = Math.round(Math.random() * this.maxX);
            var maxRandY = Math.round(Math.random() * this.maxY);

            var sides = {
                'top':
                {
                    x: maxRandX,
                    y: minY
                },
                'right':
                {
                    x: this.maxX,
                    y: maxRandY
                },
                'bottom':
                {
                    x: maxRandX,
                    y: this.maxY
                },
                'left': {
                    x: minX,
                    y: maxRandY
                }
            };

            delete sides[this.side];
            var keys = Object.keys(sides);
            var randPos = Math.floor(Math.random() * keys.length);
            var newSide = keys[randPos];

            targetParams.side = newSide;
            targetParams.coords = sides[newSide];

            return targetParams;

        }

        //------------------------------

        function addBubble() {
            var bubble = new Bubble(i);
            bubbles.push(bubble);
        }

        //------------------------------

        for (var i = 0; i < maxBubbles; i++) {
            addBubble();
        }

        //------------------------------

        window.onresize = function () {
            containerWidth = container.clientWidth;
            containerHeight = container.clientHeight;

            bubbles.forEach(function (item) {
                item.maxX = containerWidth - item.shapeSize;
                item.maxY = containerHeight - item.shapeSize;
            });
        }

        console.log('✅ 泡泡動畫初始化完成');
    }

    // 導出全局函數
    window.initBubbles = initBubbles;

})();
