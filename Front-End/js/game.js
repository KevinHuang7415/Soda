let DEBUG = false;    // 是否開啟 debug 模式
let lastGap = null;   // 記錄最後一次計算的間距（在畫面上看）
const MIN_GAP = 400;  // 障礙物間最小安全距離（畫面右邊距離）

let randomGap = 0;    // 每次生成下一棵樹所需的隨機距離

// ====== 全域變數 ======
// canvas board
let board;
let boardWidth = 750;
let boardHeight = 300;
let context;

// 按鈕
let startBtn;
let restartBtn;

// 角色
let roleWidth = 88;
let roleHeight = 105;
let roleX = 50;
let roleY = boardHeight - roleHeight;

let roleImg;        // 當前顯示中的圖片
let roleStandImg;   // 站立圖
let roleJumpImg;    // 跳躍圖
let roleDeadImg;    // 死亡圖

let role = {
    x: roleX,
    y: roleY,
    width: roleWidth,
    height: roleHeight
};

// 障礙物
let treeArrey = [];

let tree1Width = 31;
let tree2Width = 65;
let tree3Width = 100;

let treeHeight = 70;
let treeX = boardWidth;               // 讓樹從畫布右邊外面出生
let treeY = boardHeight - treeHeight;

let tree1Img;
let tree2Img;
let tree3Img;

// 遊戲物理變數
let velocityX = -8; // 障礙物往左移動的速度
let velocityY = 0;  // 垂直速度（跳躍）
let gravity = 0.4;  // 重力

let gameOver = false;
let gameStarted = false;
let score = 0;

let level = 1;
let maxLevel = 5;

let result;   // <ul id="result">

// 地板（track）
let trackImg;
let trackWidth = 2404;
let trackHeight = 28;
let trackY = boardHeight - trackHeight;

let trackX1 = 0;
let trackX2 = trackWidth;

let gameBox;  // .gameBox 容器

// ====== 初始化：等整個頁面載完 ======
window.onload = function () {
    // 取得畫布與 context
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    result = document.getElementById("result");

    // 地板圖片
    trackImg = new Image();
    trackImg.src = "./gameImg/track.png";

    // 取得按鈕
    startBtn = document.getElementById("startBtn");
    restartBtn = document.getElementById("restartBtn");

    // 角色圖片
    roleStandImg = new Image();
    roleStandImg.src = "./gameImg/magpie.png";

    roleJumpImg = new Image();
    roleJumpImg.src = "./gameImg/magpie_jump.png";

    roleDeadImg = new Image();
    roleDeadImg.src = "./gameImg/magpie2.png";

    // 一開始先顯示站立圖
    roleImg = roleStandImg;
    roleStandImg.onload = function () {
        context.drawImage(roleImg, role.x, role.y, role.width, role.height);
    };

    // 障礙物圖片
    tree1Img = new Image();
    tree1Img.src = "./gameImg/tree1.png";
    tree2Img = new Image();
    tree2Img.src = "./gameImg/tree2.png";
    tree3Img = new Image();
    tree3Img.src = "./gameImg/tree3.png";

    gameBox = document.querySelector(".gameBox");

    // 觸控（手機）
    gameBox.addEventListener("touchstart", function (e) {
        e.preventDefault(); // 避免手機滑出拉動畫面
        doJump();
    }, { passive: false });

    // 滑鼠點擊（桌機）
    gameBox.addEventListener("click", function () {
        doJump();
    });

    // 鍵盤事件
    document.addEventListener("keydown", moveRole);

    // 按鈕事件
    startBtn.onclick = handleStart;
    restartBtn.onclick = handleRestart;

    // 啟動動畫迴圈
    requestAnimationFrame(update);
};

// ====== 取得依照等級調整後的隨機間距 ======
function getNewRandomGap() {
    // level 1：大約 320~440
    // level 越高，最小距離略縮短
    let baseGap = 320 - (level - 1) * 20;
    if (baseGap < 220) baseGap = 220;

    let gapRange = 120; // 波動範圍
    return baseGap + Math.random() * gapRange;
}

// ====== 遊戲主迴圈 ======
function update() {
    requestAnimationFrame(update);
    if (!gameStarted) return;

    // 清畫布
    context.clearRect(0, 0, board.width, board.height);

    // ====== 更新狀態（只在沒 Game Over 時） ======
    if (!gameOver) {
        // 角色：重力 & 位置
        velocityY += gravity;
        role.y += velocityY;

        // 限制上下邊界
        if (role.y < 0) {
            role.y = 0;
            velocityY = 0;
        }
        if (role.y > roleY) {
            role.y = roleY;
            velocityY = 0;
            roleImg = roleStandImg; // 落地換回站立圖
        }

        // 地板位移
        trackX1 += velocityX;
        trackX2 += velocityX;

        if (trackX1 + trackWidth < 0) {
            trackX1 = trackX2 + trackWidth;
        }
        if (trackX2 + trackWidth < 0) {
            trackX2 = trackX1 + trackWidth;
        }

        // ====== 生成新障礙物（依距離 + 隨機 Gap） ======
        let canSpawn = false;

        if (treeArrey.length === 0) {
            // 第一棵樹一定生
            canSpawn = true;
        } else {
            let last = treeArrey[treeArrey.length - 1];
            // 最後一棵樹的右邊到畫布右邊的距離
            let gapFromRightEdge = boardWidth - (last.x + last.width);
            lastGap = gapFromRightEdge; // debug 用

            // 同時滿足最小安全距離 & 隨機距離
            if (gapFromRightEdge >= MIN_GAP && gapFromRightEdge >= randomGap) {
                canSpawn = true;
            }
        }

        if (canSpawn) {
            placeTree();
            randomGap = getNewRandomGap();
        }

        // 障礙物移動 + 碰撞偵測 + 刪除離開畫面的
        for (let i = 0; i < treeArrey.length; i++) {
            let trees = treeArrey[i];

            // 只在沒 Game Over 時移動
            trees.x += velocityX;

            // 碰撞偵測
            if (detectCollision(role, trees)) {
                gameOver = true;
                roleImg = roleDeadImg;
                restartBtn.style.display = "block";

                const li = document.createElement("li");
                li.textContent = "得分:" + score + "；等級:" + level;
                result.appendChild(li);

                break; // 撞一次就好，跳出迴圈
            }

            // 跑出畫面就刪掉
            if (trees.x + trees.width < 0) {
                treeArrey.splice(i, 1);
                i--;
            }
        }

        // 分數 & 難度只在沒 Game Over 時更新
        score++;
        updateDifficulty();
    }

    // ====== 繪製（不管死活都會畫） ======

    // 地板
    context.drawImage(trackImg, trackX1, trackY, trackWidth, trackHeight);
    context.drawImage(trackImg, trackX2, trackY, trackWidth, trackHeight);

    // 障礙物
    for (let i = 0; i < treeArrey.length; i++) {
        let trees = treeArrey[i];
        context.drawImage(trees.img, trees.x, trees.y, trees.width, trees.height);
    }

    // 角色
    context.drawImage(roleImg, role.x, role.y, role.width, role.height);

    // 分數 & 等級文字
    context.fillStyle = "black";
    context.font = "16px courier";
    context.fillText("得分:" + score, 5, 20);
    context.fillText("等級:" + level, 100, 20);

    // DEBUG 區
    if (DEBUG) {
        drawDebugInfo();
    }
}

// ====== DEBUG 畫面：hitbox & gap 線 ======
function drawDebugInfo() {
    context.save();

    // 角色 hitbox
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.strokeRect(role.x, role.y, role.width, role.height);

    // 每一棵樹的 hitbox + gap
    context.strokeStyle = "blue";
    for (let i = 0; i < treeArrey.length; i++) {
        let t = treeArrey[i];
        context.strokeRect(t.x, t.y, t.width, t.height);

        if (i > 0) {
            let prev = treeArrey[i - 1];
            let gap = t.x - (prev.x + prev.width);

            let y = treeY - 10;
            let x1 = prev.x + prev.width;
            let x2 = t.x;

            context.beginPath();
            context.moveTo(x1, y);
            context.lineTo(x2, y);
            context.stroke();

            context.fillStyle = "purple";
            context.font = "12px courier";
            let midX = x1 + (gap / 2) - 10;
            context.fillText(Math.round(gap), midX, y - 5);
        }
    }

    // 左上角 debug 狀態
    context.fillStyle = "purple";
    context.font = "12px courier";
    context.fillText("DEBUG: ON(按 D 切換)", 5, 40);
    if (lastGap !== null) {
        context.fillText("Last gap: " + Math.round(lastGap), 5, 55);
    }
    context.fillText("MIN_GAP: " + MIN_GAP, 5, 70);

    context.restore();
}

// ====== 調整難度 ======
function updateDifficulty() {
    // 每 300 分升一級
    level = Math.floor(score / 300) + 1;
    if (level > maxLevel) {
        level = maxLevel;
    }

    // 根據 level 調整速度（越高級越快）
    // 初始速度 -8，每級增加 -1
    velocityX = -(8 + (level - 1) * 1);
}

// ====== 跳躍動作 ======
function doJump() {
    if (!gameStarted || gameOver) return;

    // 只在地板上才能起跳
    if (role.y === roleY) {
        velocityY = -10;
        roleImg = roleJumpImg;
    }
}

// ====== 鍵盤事件：跳躍 & DEBUG ======
function moveRole(e) {
    // debug 切換
    if (e.code === "KeyD") {
        DEBUG = !DEBUG;
        return;
    }

    if (!gameStarted || gameOver) {
        return;
    }

    if (e.code === "Space" || e.code === "ArrowUp") {
        doJump();
    }
}

// ====== 生成障礙物 ======
function placeTree() {
    if (!gameStarted || gameOver) {
        return;
    }

    let trees = {
        img: null,
        x: treeX,
        y: treeY,
        width: null,
        height: treeHeight
    };

    // 隨機決定用哪一種樹
    let r = Math.random();

    if (r > 0.90) {            // 約 10%
        trees.img = tree3Img;
        trees.width = tree3Width;
    } else if (r > 0.70) {     // 約 20%
        trees.img = tree2Img;
        trees.width = tree2Width;
    } else if (r > 0.50) {     // 約 20%
        trees.img = tree1Img;
        trees.width = tree1Width;
    } else {
        // 0 ~ 0.5：這輪不生樹，製造較大空檔
        return;
    }

    treeArrey.push(trees);

    if (treeArrey.length > 5) {
        treeArrey.shift(); // 避免陣列無限成長
    }
}

// ====== 碰撞判定 ======
function detectCollision(a, b) {
    return a.x < b.x + b.width - 25 &&      // 左
        a.x + a.width - 25 > b.x &&        // 右
        a.y < b.y + b.height - 20 &&       // 上
        a.y + a.height - 20 > b.y;         // 下
}

// ====== 共用「開始一局遊戲」邏輯 ======
function startGameCommon() {
    gameOver = false;
    gameStarted = true;
    score = 0;
    velocityY = 0;
    role.y = roleY;
    treeArrey = [];

    level = 1;
    velocityX = -8;

    roleImg = roleStandImg;

    // 初始化 gap，讓第一棵之後的樹有距離設定
    randomGap = getNewRandomGap();
}

// ====== 按鈕：開始 ======
function handleStart() {
    startBtn.style.display = "none";
    restartBtn.style.display = "none";
    startGameCommon();
}

// ====== 按鈕：重新開始 ======
function handleRestart() {
    restartBtn.style.display = "none";
    startGameCommon();
}
