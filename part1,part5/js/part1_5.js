   const about = document.getElementById("about");
    const menu = document.getElementById("aboutMenu");

    // 顯示選單
    about.addEventListener("mouseenter", () => {
      menu.classList.add("active");
      const rect = about.getBoundingClientRect();
      menu.style.left = rect.left + "px";
    });

    // 隱藏選單
    about.addEventListener("mouseleave", () => {
      setTimeout(() => {
        if (!menu.matches(":hover")) {
          menu.classList.remove("active");
        }
      }, 100);
    });

    menu.addEventListener("mouseleave", () => {
      menu.classList.remove("active");
    });
    //彎曲字體
    $(function () {
      $('#bent1, #bent2').arctext({ radius: 200 });
    });
    //768px以下導覽列下拉選單

    function openNav() {
      document.getElementById("myNav").style.height = "100%";
    }

    function closeNav() {
      document.getElementById("myNav").style.height = "0%";
    }

    // 彈窗畫面
    var loginModal = document.getElementById('loginIn');
    var userBtn = document.getElementById("userbtn");
    var registerModal = document.getElementById('register');
    var registerBtn = document.getElementById("regeistBtn");
    var shoppingCarBtn = document.getElementById("shoppingCarBtn");

    // ✅ 通用開啟函式
    function openModal(id) {
      // 先關閉所有 modal
      document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
      // 再開啟指定的
      document.getElementById(id).style.display = "block";
    }

    // ✅ 點擊使用者按鈕 => 開啟登入 modal
    if (userBtn) {
      userBtn.onclick = function () {
        openModal('loginIn');  // ✅ 改成使用 openModal()
      };
    }

    // ✅ 點擊註冊按鈕 => 開啟註冊 modal
    if (registerBtn) {
      registerBtn.onclick = function () {
        openModal('register');  // ✅ 改成使用 openModal()
      };
    }

    if (shoppingCarBtn) {
      shoppingCarBtn.onclick = function () {
        openModal('shoppingCar');
      };
    }



    // ✅ 通用關閉邏輯
    document.querySelectorAll(".close").forEach(btn => {
      btn.onclick = function () {
        btn.closest(".modal").style.display = "none";
      };
    });

    // ✅ 點擊背景關閉
    window.addEventListener("click", event => {
      if (event.target.classList.contains("modal")) {
        event.target.style.display = "none";
      }
    });