let fs = require('fs');
let path = require('path');
let mnist = require('mnist');
let { createEvolution, createBackPropagation } = require('../../');

let { training: trainingData, test: testData } = mnist.set(2000, 200);

const NETWORK_PATH = path.join(__dirname, `./network/mnist-ne.json`);
const INPUT_LENGTH = 28 * 28;

let evolution = createEvolution({
  network: [INPUT_LENGTH, 15, 10],
  amount: 100,
});

try {
  evolution.replaceNetworks(require(NETWORK_PATH));
} catch (error) {
  console.log('There is no default networks exist');
}

function training() {
  let batchNumber = 100;

  for (let i = 0; i < trainingData.length; i += batchNumber) {
    let count = batchNumber;
    let list = Array.from({
      length: evolution.options.amount,
    }).map(() => 0);

    while (count) {
      let item = trainingData[i + batchNumber - count];
      for (let j = 0; j < evolution.options.amount; j++) {
        let results = evolution.compute(j, item.input);
        let result = results[results.length - 1];
        list[j] += getError(result, item.output);
      }
      count -= 1;
    }

    let ranks = list
      .map((value, index) => ({
        value,
        index,
      }))
      .sort((a, b) => a.value - b.value)
      .map(({ index }) => index);

    evolution.adjust(ranks);
  }
}

function softmax(list) {
  let sum = list.map(x => Math.exp(x)).reduce((a, b) => a + b)
  return list.map(x => Math.exp(x) / sum) 
}

function getError(left, right) {
  left = softmax(left)
  let sum = 0;
  for (let i = 0; i < left.length; i++) {
    sum += Math.pow(right[i] - left[i], 2);
  }
  return sum;
}

function save() {
  fs.writeFileSync(
    NETWORK_PATH,
    JSON.stringify(evolution.getNetworks(), null, 2)
  );
}

function test() {
  let statsList = [];
  for (let i = 0; i < evolution.options.amount; i++) {
    statsList.push(testByIndex(i));
  }

  statsList.sort((a, b) => a.rate - b.rate);
  console.log('result', JSON.stringify(statsList[statsList.length - 1], null, 2));
}

function testByIndex(index) {
  let stats = {
    index,
    total: 0,
    correct: 0,
  };
  let detail = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => {
    return {
      number,
      total: 0,
      correct: 0,
    };
  });
  for (let i = 0; i < testData.length; i++) {
    let item = testData[i];
    let results = evolution.compute(index, item.input);
    let result = results[results.length - 1];
    let output = getResult(result);
    let answer = getResult(item.output);

    detail[answer].total += 1;
    stats.total += 1;

    if (output === answer) {
      detail[answer].correct += 1;
      stats.correct += 1;
    }
  }

  detail.forEach(item => (item.rate = item.correct / item.total * 100));
  stats.detail = detail;
  stats.rate = stats.correct / stats.total * 100;

  return stats;
}

console.time('training');
training();
console.timeEnd('training');
console.time('save');
save();
console.timeEnd('save');
console.time('test');
test();
console.timeEnd('test');

function getAvg(list) {
  return list.reduce((sum, item) => sum + item, 0) / list.length;
}

function getResult(results) {
  return results
    .map((value, index) => ({
      value,
      index,
    }))
    .reduce((a, b) => (a.value > b.value ? a : b)).index;
}

function logNumber({ data, width = 28, height = 28 }) {
  let logList = [];

  for (let i = 0; i < height; i++) {
    let list = [];
    for (let j = 0; j < width; j++) {
      let value = data[i * width + j];
      let text = typeof value === 'number' ? (value > 0 ? '0' : '1') : '2';
      list.push(text);
    }
    logList.push(list.join(''));
  }

  console.log(logList.join('\n'));
}

function makeDigitCenter(input) {
  let centerResult = centerCrop({
    data: input,
    width: 28,
    height: 28,
  });

  let scaleResult = scaleImage(centerResult, 28, 28);
  return scaleResult.data;
}

function centerCrop(imageData) {
  const { data, width, height } = imageData;
  let [xmin, ymin] = [width, height];
  let [xmax, ymax] = [-1, -1];
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const idx = i + j * width;
      if (data[idx] > 0) {
        if (i < xmin) xmin = i;
        if (i > xmax) xmax = i;
        if (j < ymin) ymin = j;
        if (j > ymax) ymax = j;
      }
    }
  }

  // add a little padding
  xmin -= 20;
  xmax += 20;
  ymin -= 20;
  ymax += 20;

  // make bounding box square
  let [widthNew, heightNew] = [xmax - xmin + 1, ymax - ymin + 1];
  if (widthNew < heightNew) {
    // new width < new height
    const halfBefore = Math.floor((heightNew - widthNew) / 2);
    const halfAfter = heightNew - widthNew - halfBefore;
    xmax += halfAfter;
    xmin -= halfBefore;
  } else if (widthNew > heightNew) {
    // new width > new height
    const halfBefore = Math.floor((widthNew - heightNew) / 2);
    const halfAfter = widthNew - heightNew - halfBefore;
    ymax += halfAfter;
    ymin -= halfBefore;
  }

  widthNew = xmax - xmin + 1;
  heightNew = ymax - ymin + 1;
  let dataNew = new Uint8ClampedArray(widthNew * heightNew);
  for (let i = xmin; i <= xmax; i++) {
    for (let j = ymin; j <= ymax; j++) {
      if (i >= 0 && i < width && j >= 0 && j < height) {
        const idx = i + j * width;
        const idxNew = i - xmin + (j - ymin) * widthNew;
        dataNew[idxNew] = data[idx];
      }
    }
  }

  if (widthNew < 0 || heightNew < 0) {
    return [];
  }

  dataNew = Array.from(dataNew);

  return { data: dataNew, width: widthNew, height: heightNew };
}

function scaleImage(image, width, height) {
  let data = [];
  let startX = Math.floor((image.width - width) / 2);
  let endX = startX + width;
  let startY = Math.floor((image.height - height) / 2);
  let endY = startY + height;

  for (let i = 0; i < image.height; i++) {
    for (let j = 0; j < image.width; j++) {
      if (i >= startX && i < endX && j >= startY && j < endY) {
        let value = image.data[i * image.width + j];
        data.push(value);
      }
    }
  }

  return {
    data,
    width,
    height,
  };
}
