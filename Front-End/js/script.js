// 使用JavaScript控制旋转
document.getElementById('spinButton').addEventListener('click', function() {
    const wheel = document.getElementById('wheel');
    const rotation = Math.floor(Math.random() * 3600) + 360; // 随机旋转角度
    wheel.style.transition = 'transform 4s ease-out';
    wheel.style.transform = `rotate(${rotation}deg)`;
    setTimeout(() => {
        alert('抽奖结果已出！');
    }, 4000);
});

// 添加不同颜色的扇区
function createWheel() {
    const wheel = document.getElementById('wheel');
    const numSectors = 8;
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF8C33', '#33FFF3', '#FF3333'];
    for (let i = 0; i < numSectors; i++) {
        const sector = document.createElement('div');
        sector.className = 'sector';
        sector.style.backgroundColor = colors[i];
        sector.style.transform = `rotate(${(360 / numSectors) * i}deg)`;
        wheel.appendChild(sector);
    }
}
createWheel();

// 添加奖项文字
function createWheel() {
    const wheel = document.getElementById('wheel');
    const numSectors = 8;
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF8C33', '#33FFF3', '#FF3333'];
    const prizes = ['奖品1', '奖品2', '奖品3', '奖品4', '奖品5', '奖品6', '奖品7', '奖品8'];
    for (let i = 0; i < numSectors; i++) {
        const sector = document.createElement('div');
        sector.className = 'sector';
        sector.style.backgroundColor = colors[i];
        sector.style.transform = `rotate(${(360 / numSectors) * i}deg)`;
        const text = document.createElement('div');
        text.className = 'text';
        text.innerText = prizes[i];
        sector.appendChild(text);
        wheel.appendChild(sector);
    }
}
createWheel();

// 添加动画效果

document.getElementById('spinButton').addEventListener('click', function() {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');
    const spinSound = document.getElementById('spinSound');
    spinButton.disabled = true; // 禁用按钮
    spinSound.play(); // 播放旋转声音
    const rotation = Math.floor(Math.random() * 3600) + 360; // 随机旋转角度
    wheel.style.transition = 'transform 4s ease-out';
    wheel.style.transform = `rotate(${rotation}deg)`;
    setTimeout(() => {
        spinSound.pause(); // 停止旋转声音
        const finalRotation = rotation % 360;
        const sectorSize = 360 / 8;
        const winningSector = Math.floor(finalRotation / sectorSize);
        const prizes = ['奖品1', '奖品2', '奖品3', '奖品4', '奖品5', '奖品6', '奖品7', '奖品8'];
        alert(`恭喜你，获得了${prizes[winningSector]}！`);
        spinButton.disabled = false; // 启用按钮
    }, 4000);
});

