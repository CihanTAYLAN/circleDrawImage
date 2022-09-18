// Follow me on twitter @moorodcon!
//
// Change URL in image variable below
// to try with a different image
// Only images from CORS enabled domains will work

var image = './g.png';

document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var circles = [];

  function loadImage(url, callback) {
    let img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      let canvas = document.getElementById('img');
      let ctx = canvas.getContext('2d');
      let h = Math.min(500, this.height);
      let w = Math.round(this.width / this.height * h);
      canvas.height = h;
      canvas.width = w;
      ctx.drawImage(this, 0, 0, w, h);
      imgData = ctx.getImageData(0, 0, w, h);
      var dataURI = canvas.toDataURL('png');
      callback(dataURI, h, w);
    }
    img.src = url;
  }

  loadImage(image, function (URI, height, width) {
    img.src = URI;
    canvas.height = imgHeight = height;
    canvas.width = imgWidth = width;
    draw();
  });

  class Circle {
    constructor(x_, y_, r, color, ctx) {
      this.x = x_;
      this.y = y_;
      this.r = r;
      this.color = color;
      // this.growing = true;
      this.canvas = document.getElementById('canvas');
      this.ctx = canvas.getContext('2d');
    }
    drawCircle() {
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.color;
      this.ctx.fillStyle = this.color;
      this.ctx.ellipse(this.x, this.y, this.r, this.r, 0, 0, Math.PI * 2);
      // this.ctx.fillRect(this.x-this.r/2, this.y-this.r/2, this.r, this.r);
      this.ctx.stroke();
    }
    // touchEdges() {
    //   return (this.r + this.x > this.canvas.width || this.x - this.r < 0 ||
    //       this.r + this.y > this.canvas.height || this.y - this.r < 0)
    // }
    // growCircle() {
    //   if (this.growing === true) {
    //     this.r += 0.25;
    //   }
    // }
    static outsideCircle(c, _x, _y, _r) {
      return (dist(c.x, c.y, _x, _y) > c.r + _r + 1);
    }
    // static circleContact(c1, c2) {
    //   var d = dist(c1.x, c1.y, c2.x, c2.y);
    //   if (d-1 < c1.r + c2.r) return true;
    //   else return false;
    // }
  }

  function dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  function random(max, min = 0) {
    return (Math.random() * (max - min) + min);
  }

  function getPixelColor(imageData, xPos, yPos, width) {
    var rgb = 'rgb(';
    for (var i = 0; i < 3; ++i) {
      rgb += (imageData[(width * yPos * 4) + (xPos * 4) + i]);
      if (i !== 2) rgb += ',';
      else rgb += ')';
    }
    return rgb;
  }

  function newCircle() {
    var x = Math.floor(random(canvas.width));
    var y = Math.floor(random(canvas.height));
    var r = 50 / (Math.sqrt(
      calcVar(
        imgData.data,
        findIndices(imgData.data, (x + y * imgWidth) * 4, imgWidth, 0, 10))));
    var valid = true;
    for (let c of circles) {
      if (Circle.outsideCircle(c, x, y, r) === false) {
        valid = false;
        break;
      }
    }
    if (valid === true) {
      return new Circle(x, y, r, getPixelColor(imgData.data, x, y, canvas.width), ctx);
    } else return null;
  }

  function draw() {
    var count = 0, max = 5, attempts = 0;
    while (count < max) {
      let newC = newCircle();
      if (newC !== null) {
        circles.push(newC);
        ++count;
      }
      ++attempts;
      if (attempts > 250) {
        console.log("Done");
        return;
      }
    }
    ctx.clearRect(0, 0, imgWidth, imgHeight);
    for (let c of circles) {
      // if (c.growing === true) {
      //   if (c.touchEdges() == true) {
      //     c.growing = false
      //   } else {
      //     for (let otherC of circles) {
      //       if (c !== otherC) {
      //         if (Circle.circleContact(c, otherC) === true) c.growing = false;
      //       }
      //     }
      //   }
      // }
      c.drawCircle();
      // c.growCircle();
    }
    window.requestAnimationFrame(draw);
  }
  // Function to find indices of pixels within a range of the starting pixel
  function findIndices(arr, startInd, width, dist, maxDist, indArr = []) {
    if (dist > maxDist || indArr.indexOf(startInd) >= 0) {
      return null;
    }
    else {
      indArr.push(startInd);
    }
    // Checks if pixel is in first row of pixels
    if (startInd < width * 4) {
      if (startInd === 0) { //Top left corner
        findIndices(arr, startInd + 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd + width * 4, width, dist + 1, maxDist, indArr);
      }
      else if (startInd === 4 * (width - 1)) { //Top right corner
        findIndices(arr, startInd - 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd + width * 4, width, dist + 1, maxDist, indArr);
      }
      else {
        findIndices(arr, startInd - 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd + width * 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd + 4, width, dist + 1, maxDist, indArr);
      }
    }
    // Checks for left edge cases
    else if (startInd % (width * 4) === 0) {
      if (startInd === arr.length - width * 4) { //Bottom left corner
        findIndices(arr, startInd - width * 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd + 4, width, dist + 1, maxDist, indArr);
      }
      else {
        findIndices(arr, startInd - width * 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd + 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd + width * 4, width, dist + 1, maxDist, indArr);
      }
    }
    //Checks is pixel is in last row
    else if (startInd > arr.length - 4 * width) {
      if (startInd === arr.length - 4) { //Bottom right corner
        findIndices(arr, startInd - width * 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd - 4, width, dist + 1, maxDist, indArr);
      }
      else {
        findIndices(arr, startInd - width * 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd - 4, width, dist + 1, maxDist, indArr);
        findIndices(arr, startInd + 4, width, dist + 1, maxDist, indArr);
      }
    }
    //Checks for right edge cases
    else if (startInd % (4 * (width - 1))) {
      findIndices(arr, startInd - width * 4, width, dist + 1, maxDist, indArr);
      findIndices(arr, startInd - 4, width, dist + 1, maxDist, indArr);
      findIndices(arr, startInd + width * 4, width, dist + 1, maxDist, indArr);
    }
    else {
      findIndices(arr, startInd - width * 4, width, dist + 1, maxDist, indArr);
      findIndices(arr, startInd - 4, width, dist + 1, maxDist, indArr);
      findIndices(arr, startInd + width * 4, width, dist + 1, maxDist, indArr);
      findIndices(arr, startInd + 4, width, dist + 1, maxDist, indArr);
    }
    return indArr;
  }
  function calcVar(pixelArray, indexArray) {
    var r = [], g = [], b = [];
    indexArray.forEach((e) => {
      r.push(pixelArray[e]);
      g.push(pixelArray[e + 1]);
      b.push(pixelArray[e + 2]);
    });
    function singleVar(data) {
      var tot = 0;
      var sqTot = 0;
      data.forEach(function (e) {
        tot += e;
        sqTot += e * e;
      })
      return sqTot / data.length - (tot * tot) / (data.length * data.length);
    }
    return (singleVar(r) + singleVar(g) + singleVar(b));
  }
})
