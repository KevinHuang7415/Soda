const totalGroups = 3;
let isRotating = false;

document.querySelectorAll('.rotate-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (isRotating) return;
    isRotating = true;

    const group = btn.closest('.flavor-group');
    const currentNum = parseInt(group.dataset.group);
    const sodaCan = group.querySelector('.sodaCan');
    const wrap = document.querySelector('.wrap');

    // 啟動旋轉動畫 & 背景淡出
    sodaCan.classList.add('rotating');
    wrap.classList.add('fade-out');

    setTimeout(() => {
      sodaCan.classList.remove('rotating');
      group.classList.remove('active');

      const nextNum = currentNum % totalGroups + 1;
      const nextGroup = document.querySelector(`[data-group="${nextNum}"]`);

      // 更新 wrap 背景為漸層
      const nextGradient = getComputedStyle(nextGroup).getPropertyValue('--bg-gradient').trim();
      wrap.style.background = nextGradient;

      // 顯示下一組
      nextGroup.classList.add('active');

      // 背景淡入
      wrap.classList.remove('fade-out');
      wrap.classList.add('fade-in');

      setTimeout(() => {
        wrap.classList.remove('fade-in');
        isRotating = false;
      }, 1000);

    }, 2000);
  });
});

// 初始設定 wrap 背景
window.addEventListener('DOMContentLoaded', () => {
  const firstGroup = document.querySelector('.flavor-group.active');
  if (firstGroup) {
    const wrap = document.querySelector('.wrap');
    const bg = getComputedStyle(firstGroup).getPropertyValue('--bg-gradient').trim();
    wrap.style.background = bg;
  }
});
