// boxBody2.js - 葡萄能量飲內容動態生成
document.addEventListener('DOMContentLoaded', function() {
    const boxBody2 = document.querySelector('.boxBody2');
    if (boxBody2) {
        const contentBg = boxBody2.querySelector('.contentBg');
        if (contentBg && !contentBg.querySelector('.contentTitle')) {
            // 創建標題
            const titleDiv = document.createElement('div');
            titleDiv.className = 'contentTitle';
            titleDiv.innerHTML = `
                <h2>葡萄</h2>
                <h2>X</h2>
                <h2>神秘</h2>
            `;
            
            // 創建內容
            const contentDiv = document.createElement('div');
            contentDiv.className = 'contentMain';
            contentDiv.innerHTML = `
                <p>葡萄：飽滿果香，氣泡中藏著微醺的浪漫。神秘：總是隱藏在面紗後，帶著神秘氣息，沒人能完全看透他。</p>
            `;
            
            contentBg.insertBefore(titleDiv, contentBg.children[0]);
            contentBg.insertBefore(contentDiv, contentBg.children[1]);
        }
    }
});

