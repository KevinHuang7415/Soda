// boxBody3.js - 草莓能量飲內容動態生成
document.addEventListener('DOMContentLoaded', function() {
    const boxBody3 = document.querySelector('.boxBody3');
    if (boxBody3) {
        const contentBg = boxBody3.querySelector('.contentBg');
        if (contentBg && !contentBg.querySelector('.contentTitle')) {
            // 創建標題
            const titleDiv = document.createElement('div');
            titleDiv.className = 'contentTitle';
            titleDiv.innerHTML = `
                <h2>草莓</h2>
                <h2>X</h2>
                <h2>貝比</h2>
            `;
            
            // 創建內容
            const contentDiv = document.createElement('div');
            contentDiv.className = 'contentMain';
            contentDiv.innerHTML = `
                <p>草莓：粉嫩香甜，每一口都是戀愛的感覺。貝比：可愛又單純，總是帶來歡笑和溫暖，是大家的小太陽。</p>
            `;
            
            contentBg.insertBefore(titleDiv, contentBg.children[0]);
            contentBg.insertBefore(contentDiv, contentBg.children[1]);
        }
    }
});

