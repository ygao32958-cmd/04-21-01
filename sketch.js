let capture;
let pg;
let bubbles = [];
let saveBtn;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(640, 480); // 設定標準擷取解析度
  capture.hide();

  // 產生一個與視訊畫面寬高一樣的內容疊加層
  pg = createGraphics(640, 480);

  // 在視訊圖片外面產生一個按鈕
  saveBtn = createButton('擷取視訊畫面');
  saveBtn.position(20, 20);
  saveBtn.mousePressed(saveImage);

  // 初始化冒泡泡效果
  for (let i = 0; i < 20; i++) {
    bubbles.push(new Bubble(pg.width, pg.height));
  }
}

function draw() {
  background('#e7c6ff');
  
  if (capture.loadedmetadata) {
    // 計算顯示影像的寬高 (整個畫布寬高的 60%)
    let vW = width * 0.6;
    let vH = height * 0.6;
    let startX = (width - vW) / 2;
    let startY = (height - vH) / 2;

    // 處理馬賽克、黑白轉換與鏡像修正
    capture.loadPixels();
    let unitSize = 20; // 每個單位 20x20
    let scaleX = vW / capture.width;
    let scaleY = vH / capture.height;

    for (let y = 0; y < capture.height; y += unitSize) {
      for (let x = 0; x < capture.width; x += unitSize) {
        // 修正左右顛倒：從右側計算對應的像素索引
        let mirrorX = capture.width - x - unitSize;
        let index = (y * capture.width + mirrorX) * 4;

        let r = capture.pixels[index];
        let g = capture.pixels[index + 1];
        let b = capture.pixels[index + 2];

        // 取得黑白顏色值 (R+G+B)/3
        let avg = (r + g + b) / 3;

        fill(avg);
        noStroke();
        // 繪製馬賽克方塊到畫布中央
        rect(startX + x * scaleX, startY + y * scaleY, unitSize * scaleX, unitSize * scaleY);
      }
    }

    // 更新並在 pg (疊加層) 上畫泡泡
    pg.clear();
    for (let b of bubbles) {
      b.update();
      b.show(pg);
    }

    // 將 pg 顯示在視訊畫面的上方
    imageMode(CORNER);
    image(pg, startX, startY, vW, vH);
  }
}

function saveImage() {
  let vW = width * 0.6;
  let vH = height * 0.6;
  let startX = (width - vW) / 2;
  let startY = (height - vH) / 2;
  
  // 剪下視訊圖片範圍並儲存
  let img = get(startX, startY, vW, vH);
  img.save('screenshot', 'jpg');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 泡泡效果類別
class Bubble {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.x = random(w); this.y = random(h);
    this.r = random(5, 15); this.speed = random(1, 3);
  }
  update() {
    this.y -= this.speed;
    if (this.y < -this.r) this.y = this.h + this.r;
  }
  show(g) {
    g.stroke(255);
    g.strokeWeight(2);
    g.noFill();
    g.ellipse(this.x, this.y, this.r * 2);
  }
}
