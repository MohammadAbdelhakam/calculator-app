const display = document.getElementById('display');
const memoryStatus = document.getElementById('memoryStatus');

let firstValue = null;
let secondValue = null;
let operator = null;
let shouldResetDisplay = false;
let memoryValue = 0;

function formatDisplay(value) {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'Error';
  }

  if (Math.abs(numericValue) >= 1e12 || (Math.abs(numericValue) > 0 && Math.abs(numericValue) < 1e-10)) {
    return numericValue.toExponential(6).replace(/\.0+e/, 'e').replace(/(\.\d*?)0+e/, '$1e');
  }

  const formatted = numericValue.toLocaleString('en-US', {
    maximumFractionDigits: 10,
  });

  return formatted;
}

function updateDisplay(value) {
  display.textContent = formatDisplay(value);
}

function updateMemoryIndicator() {
  memoryStatus.classList.toggle('active', memoryValue !== 0);
}

function resetCalculatorState() {
  firstValue = null;
  secondValue = null;
  operator = null;
  shouldResetDisplay = false;
}

function appendNumber(value) {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  let text = currentText.replace(/,/g, '');

  if (shouldResetDisplay) {
    text = '0';
    shouldResetDisplay = false;
  }

  if (value === '.' && text.includes('.')) {
    return;
  }

  if (text === '0' && value !== '.') {
    text = value;
  } else {
    text += value;
  }

  if (value === '.' && !text.includes('.')) {
    text = text + '.';
  }

  updateDisplay(text === '' ? '0' : text);
}

function calculate(a, b, op) {
  switch (op) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) {
        return 'error';
      }
      return a / b;
    default:
      return b;
  }
}

function handleOperator(nextOperator) {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  const currentValue = Number(currentText.replace(/,/g, ''));

  if (firstValue === null) {
    firstValue = currentValue;
    operator = nextOperator;
    shouldResetDisplay = true;
    return;
  }

  if (operator && !shouldResetDisplay) {
    secondValue = currentValue;
    const result = calculate(firstValue, secondValue, operator);

    if (result === 'error') {
      display.textContent = 'Error';
      resetCalculatorState();
      return;
    }

    firstValue = result;
    updateDisplay(result);
  }

  operator = nextOperator;
  shouldResetDisplay = true;
}

function handleEquals() {
  if (firstValue === null || operator === null) {
    return;
  }

  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  const currentValue = Number(currentText.replace(/,/g, ''));
  const result = calculate(firstValue, currentValue, operator);

  if (result === 'error') {
    updateDisplay('Error');
    resetCalculatorState();
    return;
  }

  updateDisplay(result);
  resetCalculatorState();
  firstValue = result;
}

function clearDisplay() {
  updateDisplay(0);
  resetCalculatorState();
}

function deleteLastDigit() {
  if (display.textContent === 'Error') {
    clearDisplay();
    return;
  }

  const currentText = display.textContent.replace(/,/g, '');
  if (currentText.length <= 1) {
    updateDisplay(0);
    return;
  }

  const nextValue = currentText.slice(0, -1);
  updateDisplay(nextValue);
}

function toggleSign() {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  const numeric = Number(currentText.replace(/,/g, ''));
  updateDisplay(-numeric);
}

function applyPercent() {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  const currentValue = Number(currentText.replace(/,/g, ''));
  updateDisplay(currentValue / 100);
}

function applySquareRoot() {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  const value = Number(currentText.replace(/,/g, ''));
  if (value < 0) {
    updateDisplay('Error');
    return;
  }
  updateDisplay(Math.sqrt(value));
}

function applySquare() {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  const value = Number(currentText.replace(/,/g, ''));
  updateDisplay(value * value);
}

function applyReciprocal() {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  const value = Number(currentText.replace(/,/g, ''));
  if (value === 0) {
    updateDisplay('Error');
    return;
  }
  updateDisplay(1 / value);
}

function memoryClear() {
  memoryValue = 0;
  updateMemoryIndicator();
}

function memoryRecall() {
  updateDisplay(memoryValue);
}

function memoryAdd() {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  memoryValue += Number(currentText.replace(/,/g, ''));
  updateMemoryIndicator();
}

function memorySubtract() {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  memoryValue -= Number(currentText.replace(/,/g, ''));
  updateMemoryIndicator();
}

function memoryStore() {
  const currentText = display.textContent === 'Error' ? '0' : display.textContent;
  memoryValue = Number(currentText.replace(/,/g, ''));
  updateMemoryIndicator();
}

document.querySelectorAll('.number').forEach((button) => {
  button.addEventListener('click', () => {
    appendNumber(button.dataset.value);
  });
});

document.querySelectorAll('.operator').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    if (action === 'add') handleOperator('add');
    if (action === 'subtract') handleOperator('subtract');
    if (action === 'multiply') handleOperator('multiply');
    if (action === 'divide') handleOperator('divide');
    if (action === 'equals') handleEquals();
  });
});

document.querySelectorAll('.function').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    if (action === 'clear') clearDisplay();
    if (action === 'delete') deleteLastDigit();
    if (action === 'percent') applyPercent();
    if (action === 'sqrt') applySquareRoot();
    if (action === 'square') applySquare();
    if (action === 'reciprocal') applyReciprocal();
    if (action === 'toggle-sign') toggleSign();
    if (action === 'memory-clear') memoryClear();
    if (action === 'memory-recall') memoryRecall();
    if (action === 'memory-add') memoryAdd();
    if (action === 'memory-subtract') memorySubtract();
    if (action === 'memory-store') memoryStore();
  });
});

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    appendNumber(key);
  }

  if (key === '.') {
    appendNumber('.');
  }

  if (key === '+') handleOperator('add');
  if (key === '-') handleOperator('subtract');
  if (key === '*') handleOperator('multiply');
  if (key === '/') handleOperator('divide');
  if (key === 'Enter' || key === '=') handleEquals();
  if (key === 'Escape') clearDisplay();
  if (key === 'Backspace') deleteLastDigit();
  if (key === '%') applyPercent();
});

updateDisplay(0);
updateMemoryIndicator();
