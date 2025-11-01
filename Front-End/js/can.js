const totalGroups = 3;   // 目前三組
let isRotating = false;

document.querySelectorAll('.rotate-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (isRotating) return;
    isRotating = true;

    const group = btn.closest('.flavor-group');
    const currentNum = parseInt(group.dataset.group);
    const sodaCan = group.querySelector('.sodaCan');

    // 啟動旋轉動畫
    sodaCan.classList.add('rotating');

    // 動畫時間結束後切換下一組
    setTimeout(() => {
      sodaCan.classList.remove('rotating');
      group.classList.remove('active');

      const nextNum = currentNum % totalGroups + 1;
      const nextGroup = document.querySelector(`[data-group="${nextNum}"]`);
      nextGroup.classList.add('active');

      isRotating = false;
    }, 2000);  // 與 CSS transition: 2s 對應
  });
});