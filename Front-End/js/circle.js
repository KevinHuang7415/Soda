// 滾動控制圓形軌道旋轉
let rotation = 0;
let targetRotation = 0;
let isAnimating = false;
const container = document.getElementById('orbit-container');
const circleBackground = document.getElementById('circle-background');

console.log('Container:', container);
console.log('Circle Background:', circleBackground);

// 更新圓形背景旋轉（卡片保持靜止）
function updateRotation() {
    if (circleBackground) {
        circleBackground.style.transform = `translate(-50%, 50%) rotate(${rotation}deg)`;
    }

    // 角度正規化到 0~360
    let normalizedRotation = ((rotation % 360) + 360) % 360;

    // 根據角度判斷顯示哪個卡片
    if (normalizedRotation >= 300 || normalizedRotation < 60) {
        // 卡片 1 - 檸檬
        container.style.backgroundColor = '#2BAD2F'; // 綠色
    } else if (normalizedRotation >= 60 && normalizedRotation < 180) {
        // 卡片 2 - 葡萄
        container.style.backgroundColor = '#DDA2F2'; // 紫色
    } else {
        // 卡片 3 - 草莓
        container.style.backgroundColor = '#FE3489'; // 粉紅色
    }
}

// 平滑動畫函數
function animate() {
    if (Math.abs(targetRotation - rotation) > 0.1) {
        rotation += (targetRotation - rotation) * 0.1;
        updateRotation();
        requestAnimationFrame(animate);
    } else {
        rotation = targetRotation;
        updateRotation();
        isAnimating = false;
    }
}

// 滑鼠滾輪事件
if (container) {
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY * 0.05;
        targetRotation -= delta; // 改為減去，讓滾輪向下時順時針轉動

        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animate);
        }
    });

    // 僅在手機螢幕啟用觸控旋轉功能
    if (window.innerWidth <= 768) {
        let touchStartY = 0;

        container.addEventListener('touchstart', function (e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        container.addEventListener('touchmove', function (e) {
            const touchEndY = e.touches[0].clientY;
            // 計算滑動距離，讓「往下滑 = 順時針轉動」
            const deltaY = touchEndY - touchStartY;

            const scrollDelta = deltaY * 0.2; // 靈敏度
            targetRotation -= scrollDelta; // 改為減去，讓往下滑時順時針轉動

            if (!isAnimating) {
                isAnimating = true;
                requestAnimationFrame(animate);
            }

            touchStartY = touchEndY;

            e.preventDefault();
        }, { passive: false });
    }
}

// 初始化
updateRotation();