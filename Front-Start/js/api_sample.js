  document.getElementById("create_acc").addEventListener("submit", function (e) {
      e.preventDefault();

      const data = {
        firstName: document.getElementById("FirstName").value,
        lastName: document.getElementById("LastName").value,
        email: document.getElementById("Email").value,
        password: document.getElementById("Password").value
      };

      // 使用 Axios 發送 POST 請求
      axios.post("http://localhost:5206/api/Home/CreateAccount", data, {
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(response => {
          alert("帳號建立成功！");
          console.log("伺服器回應：", response.data);
        })
        .catch(error => {
          console.error("發生錯誤：", error);
          if (error.response) {
            alert("建立失敗：" + error.response.status + " - " + error.response.data);
          } else {
            alert("建立失敗，請確認伺服器是否啟動！");
          }
        });
    });