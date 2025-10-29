// boxBody1.js - 檸檬能量飲內容動態生成
document.addEventListener('DOMContentLoaded', function() {
    const boxBody1 = document.querySelector('.boxBody1');
    if (boxBody1) {
        const contentBg = boxBody1.querySelector('.contentBg');
        if (contentBg && !contentBg.querySelector('.contentTitle')) {
            // 創建標題
            const titleDiv = document.createElement('div');
            titleDiv.className = 'contentTitle';
            titleDiv.innerHTML = `
                <h2>檸檬</h2>
                <h2>X</h2>
                <h2>振宇</h2>
            `;
            
            // 創建內容
            const contentDiv = document.createElement('div');
            contentDiv.className = 'contentMain';
            contentDiv.innerHTML = `
                <p>檸檬：清爽酸甜，一口喚醒夏日活力。振宇：充滿活力的小隊長，總是帶著自信的笑容，用勇氣帶領朋友們迎接挑戰。</p>
            `;
            
            contentBg.insertBefore(titleDiv, contentBg.children[0]);
            contentBg.insertBefore(contentDiv, contentBg.children[1]);
        }
    }
});

