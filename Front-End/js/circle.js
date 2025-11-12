let rotation = 0;
let targetRotation = 0;
let isAnimating = false;
let isOrbitActive = false; // 是否接管滾輪 / 觸控
let direction = 'down';
const rotationLimit = 360;

const container = document.querySelector('.orbit-container');
const circleBackground = document.getElementById('circle-background');
const sectionWrap = document.querySelector('.wrap');
const sectionProduct = document.querySelector('.product');

// 更新旋轉
function updateRotation() {
    if (circleBackground) {
        circleBackground.style.transform = `translate(-50%, 50%) rotate(${rotation}deg)`;
    }

    let normalizedRotation = ((rotation % 360) + 360) % 360;

    if (normalizedRotation >= 300 || normalizedRotation < 60) {
        container.style.backgroundColor = '#2BAD2F'; // 綠
    } else if (normalizedRotation >= 60 && normalizedRotation < 180) {
        container.style.backgroundColor = '#DDA2F2'; // 紫
    } else {
        container.style.backgroundColor = '#FE3489'; // 粉
    }
}

// 平滑動畫
function animate() {
    if (Math.abs(targetRotation - rotation) > 0.1) {
        rotation += (targetRotation - rotation) * 0.1;
        updateRotation();
        requestAnimationFrame(animate);
    } else {
        rotation = targetRotation;
        updateRotation();
        isAnimating = false;

        // 旋轉滿一圈 → 自動滾動切換頁面 + 釋放控制
        if (Math.abs(rotation) >= rotationLimit) {
            isOrbitActive = false;
            document.body.style.overflow = ''; // ✅ 恢復頁面滾動
            rotation = 0;
            targetRotation = 0;

            if (direction === 'down') {
                sectionProduct.scrollIntoView({ behavior: 'smooth' });
            } else {
                sectionWrap.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
}

// 滾輪事件（桌機）
function handleWheel(e) {
    if (!isOrbitActive) return;
    e.preventDefault();

    const delta = e.deltaY;
    direction = delta > 0 ? 'down' : 'up';
    const rotateDelta = delta * 0.3;

    if (direction === 'down') {
        targetRotation += rotateDelta;
        if (targetRotation > rotationLimit) targetRotation = rotationLimit;
    } else {
        targetRotation += rotateDelta;
        if (targetRotation < -rotationLimit) targetRotation = -rotationLimit;
    }

    if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animate);
    }
}

// ✅ 手機觸控版本
let touchStartY = 0;
let touchActive = false;

function handleTouchStart(e) {
    if (!isOrbitActive) return;
    touchActive = true;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!isOrbitActive || !touchActive) return;
    e.preventDefault(); // ✅ 阻止整頁滑動

    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY - currentY; // 往上滑 = 正值
    direction = deltaY > 0 ? 'down' : 'up';

    const rotateDelta = deltaY * 0.5; // 可自行調靈敏度
    if (direction === 'down') {
        targetRotation += rotateDelta;
        if (targetRotation > rotationLimit) targetRotation = rotationLimit;
    } else {
        targetRotation += rotateDelta;
        if (targetRotation < -rotationLimit) targetRotation = -rotationLimit;
    }

    if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animate);
    }

    touchStartY = currentY;
}

function handleTouchEnd() {
    touchActive = false;
}

// 監聽滾動進出 orbit 區
window.addEventListener('scroll', () => {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // 容器可見高度 = 視窗底部與容器底部的最小值 - 視窗頂部與容器頂部的最大值
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visibleRatio = visibleHeight / rect.height; // 可見比例

    if (visibleRatio >= 0.9) {
        // ✅ 當 .orbit-container 有 90% 高度進入畫面
        if (!isOrbitActive) {
            isOrbitActive = true;
            document.body.style.overflow = 'hidden'; // 鎖住整頁滾動
        }
    } else {
        if (isOrbitActive) {
            isOrbitActive = false;
            document.body.style.overflow = ''; // 釋放滾動
        }
    }
});


// 綁定事件
window.addEventListener('wheel', handleWheel, { passive: false });
container.addEventListener('touchstart', handleTouchStart, { passive: true });
container.addEventListener('touchmove', handleTouchMove, { passive: false });
container.addEventListener('touchend', handleTouchEnd, { passive: true });

// 初始化
updateRotation();
