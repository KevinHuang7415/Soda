$(function () {
    // 1️⃣ 載入 navigation
    $('#site-header').load('./partials/nav.html', function (response, status, xhr) {
      if (status === 'error') {
        console.error('載入 nav 失敗：', xhr.status, xhr.statusText);
      } else {
        // 若 nav 裡有需要的互動（下拉選單、手機漢堡選單）可在此初始化
        // 例：$('.main-nav .toggle').on('click', ...);
      }
    });
  
    // 2️⃣ 載入 footer
    $('#site-footer').load('./partials/footer.html', function (response, status, xhr) {
      if (status === 'error') {
        console.error('載入 footer 失敗：', xhr.status, xhr.statusText);
      }
    });
  });