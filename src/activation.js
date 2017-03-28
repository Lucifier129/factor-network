export function TANH(x) {
  if (x === Infinity) {
    return 1;
  } else if (x === -Infinity) {
    return -1;
  } else {
    let e2x = Math.exp(2 * x);
    return (e2x - 1) / (e2x + 1);
  }
}

export function RELU(x) {
  return Math.max(0, x)
}

export function SIGMOID(x) {
  return 1 / (1 + Math.exp(-x / 1))
}