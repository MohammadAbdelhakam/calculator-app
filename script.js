const expressionDisplay = document.getElementById('expressionDisplay');
const resultDisplay = document.getElementById('resultDisplay');

let expression = '';
let memoryValue = 0;

const FUNCTION_MAP = {
  sin: (x) => Math.sin((x * Math.PI) / 180),
  cos: (x) => Math.cos((x * Math.PI) / 180),
  tan: (x) => Math.tan((x * Math.PI) / 180),
  asin: (x) => (Math.asin(x) * 180) / Math.PI,
  acos: (x) => (Math.acos(x) * 180) / Math.PI,
  atan: (x) => (Math.atan(x) * 180) / Math.PI,
  sqrt: (x) => Math.sqrt(x),
  cbrt: (x) => Math.cbrt(x),
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  exp: (x) => Math.exp(x),
  abs: (x) => Math.abs(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  factorial: factorial
};

function factorial(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error('Factorial requires a non-negative integer');
  }
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
  }
  return result;
}

function updateDisplay() {
  expressionDisplay.textContent = expression || '0';
}

function updateResult(value) {
  const safeValue = Number.isFinite(value) ? value : 'Error';
  resultDisplay.textContent = safeValue === 'Error' ? 'Error' : formatNumber(safeValue);
}

function formatNumber(number) {
  const absValue = Math.abs(number);
  if (absValue >= 1e12 || (absValue > 0 && absValue < 1e-10)) {
    return number.toExponential(6);
  }
  return Number(number.toFixed(10)).toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function clearAll() {
  expression = '';
  updateDisplay();
  updateResult(0);
}

function deleteLast() {
  expression = expression.slice(0, -1);
  updateDisplay();
  if (expression) {
    const result = safeEvaluate(expression);
    updateResult(result);
  } else {
    updateResult(0);
  }
}

function appendDigit(value) {
  expression += value;
  updateDisplay();
  try {
    updateResult(safeEvaluate(expression));
  } catch {
    updateResult('Error');
  }
}

function appendOperator(symbol) {
  const lastChar = expression.slice(-1);
  if (!expression || ['+', '-', '*', '/', '^', '%'].includes(lastChar)) {
    if (symbol === '-') {
      expression += '-';
    }
    updateDisplay();
    return;
  }
  expression += symbol;
  updateDisplay();
  try {
    updateResult(safeEvaluate(expression));
  } catch {
    updateResult('Error');
  }
}

function appendFunction(name) {
  expression += `${name}(`;
  updateDisplay();
}

function appendConstant(name) {
  expression += name;
  updateDisplay();
  try {
    updateResult(safeEvaluate(expression));
  } catch {
    updateResult('Error');
  }
}

function appendPower() {
  const lastChar = expression.slice(-1);
  if (!expression || ['+', '-', '*', '/', '^', '%', '('].includes(lastChar)) {
    return;
  }
  expression += '^';
  updateDisplay();
}

function toggleSign() {
  if (!expression) {
    expression = '-';
    updateDisplay();
    return;
  }

  const lastOperatorIndex = Math.max(
    expression.lastIndexOf('+'),
    expression.lastIndexOf('-'),
    expression.lastIndexOf('*'),
    expression.lastIndexOf('/'),
    expression.lastIndexOf('^'),
    expression.lastIndexOf('%')
  );

  if (lastOperatorIndex === -1) {
    expression = `(-${expression})`;
  } else {
    const lastSegment = expression.slice(lastOperatorIndex + 1);
    if (lastSegment && !['(', ')'].includes(lastSegment[0])) {
      expression = `${expression.slice(0, lastOperatorIndex + 1)}(-${lastSegment})`;
    } else {
      expression = `${expression.slice(0, lastOperatorIndex + 1)}(-1*${lastSegment || '1'})`;
    }
  }

  updateDisplay();
  try {
    updateResult(safeEvaluate(expression));
  } catch {
    updateResult('Error');
  }
}

function processPercent() {
  if (!expression) {
    return;
  }
  expression += '%';
  updateDisplay();
  try {
    updateResult(safeEvaluate(expression));
  } catch {
    updateResult('Error');
  }
}

function processMod() {
  if (!expression) {
    return;
  }
  expression += '%';
  updateDisplay();
}

function processEquals() {
  if (!expression) {
    return;
  }

  try {
    const result = safeEvaluate(expression);
    expression = formatNumber(result).replace(/,/g, '');
    updateDisplay();
    updateResult(result);
  } catch {
    updateResult('Error');
    expression = '';
    updateDisplay();
  }
}

function memoryClear() {
  memoryValue = 0;
}

function memoryStore() {
  try {
    const value = safeEvaluate(expression || '0');
    memoryValue = value;
  } catch {
    memoryValue = 0;
  }
}

function memoryRecall() {
  expression += String(memoryValue);
  updateDisplay();
  try {
    updateResult(safeEvaluate(expression));
  } catch {
    updateResult('Error');
  }
}

function memoryAdd() {
  try {
    const value = safeEvaluate(expression || '0');
    memoryValue += value;
  } catch {
    memoryValue = 0;
  }
}

function memorySubtract() {
  try {
    const value = safeEvaluate(expression || '0');
    memoryValue -= value;
  } catch {
    memoryValue = 0;
  }
}

function memoryShow() {
  if (memoryValue === 0) {
    resultDisplay.textContent = '0';
    return;
  }
  resultDisplay.textContent = formatNumber(memoryValue);
}

function tokenize(input) {
  const tokens = [];
  const cleaned = input.replace(/\s+/g, '').replace(/÷/g, '/').replace(/×/g, '*');
  let index = 0;

  while (index < cleaned.length) {
    const char = cleaned[index];

    if (/[0-9.]/.test(char)) {
      let number = '';
      let hasDot = false;
      while (index < cleaned.length) {
        const ch = cleaned[index];
        if (/[0-9]/.test(ch)) {
          number += ch;
          index += 1;
        } else if (ch === '.' && !hasDot) {
          number += ch;
          hasDot = true;
          index += 1;
        } else {
          break;
        }
      }
      tokens.push({ type: 'NUMBER', value: Number(number) });
      continue;
    }

    if (/[A-Za-zπ]/.test(char)) {
      let identifier = '';
      while (index < cleaned.length && /[A-Za-zπ]/.test(cleaned[index])) {
        identifier += cleaned[index];
        index += 1;
      }
      tokens.push({ type: 'IDENT', value: identifier.toLowerCase() });
      continue;
    }

    if ('+-*/%^()!^'.includes(char)) {
      tokens.push({ type: 'OP', value: char });
      index += 1;
      continue;
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  return tokens;
}

function safeEvaluate(expr) {
  const tokens = tokenize(expr);
  let index = 0;

  function peek() {
    return tokens[index];
  }

  function consume(value) {
    if (!peek()) {
      throw new Error('Unexpected end of expression');
    }
    if (value && peek().value !== value) {
      throw new Error(`Expected ${value}`);
    }
    return tokens[index++];
  }

  function parseExpression() {
    return parseAddSub();
  }

  function parseAddSub() {
    let value = parseMulDiv();
    while (peek() && ['+', '-'].includes(peek().value)) {
      const op = consume().value;
      const rhs = parseMulDiv();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseMulDiv() {
    let value = parsePower();
    while (peek() && ['*', '/', '%'].includes(peek().value)) {
      const op = consume().value;
      const rhs = parsePower();
      if (op === '*') value *= rhs;
      else if (op === '/') {
        if (rhs === 0) throw new Error('Division by zero');
        value /= rhs;
      } else {
        value %= rhs;
      }
    }
    return value;
  }

  function parsePower() {
    let value = parseUnary();
    while (peek() && peek().value === '^') {
      consume('^');
      value = Math.pow(value, parseUnary());
    }
    return value;
  }

  function parseUnary() {
    if (!peek()) {
      throw new Error('Unexpected end');
    }
    if (peek().value === '+') {
      consume('+');
      return parseUnary();
    }
    if (peek().value === '-') {
      consume('-');
      return -parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary() {
    if (!peek()) {
      throw new Error('Missing value');
    }

    const token = peek();

    if (token.type === 'NUMBER') {
      consume();
      return token.value;
    }

    if (token.type === 'IDENT') {
      consume();
      const name = token.value;
      if (name === 'pi' || name === 'π') return Math.PI;
      if (name === 'e') return Math.E;
      if (name in FUNCTION_MAP) {
        if (!peek() || peek().value !== '(') {
          throw new Error(`Function ${name} requires parentheses`);
        }
        consume('(');
        const arg = parseExpression();
        consume(')');
        return FUNCTION_MAP[name](arg);
      }
      throw new Error(`Unknown identifier: ${name}`);
    }

    if (token.value === '(') {
      consume('(');
      const expressionValue = parseExpression();
      consume(')');
      return expressionValue;
    }

    if (token.value === '!') {
      consume('!');
      return factorial(parsePrimary());
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  const result = parseExpression();
  if (peek()) {
    throw new Error(`Unexpected trailing token: ${peek().value}`);
  }
  return result;
}

function onButtonClick(action) {
  switch (action) {
    case 'clear':
      clearAll();
      break;
    case 'delete':
      deleteLast();
      break;
    case 'parenthesis-open':
      expression += '(';
      updateDisplay();
      break;
    case 'parenthesis-close':
      expression += ')';
      updateDisplay();
      break;
    case 'equals':
      processEquals();
      break;
    case 'add':
      appendOperator('+');
      break;
    case 'subtract':
      appendOperator('-');
      break;
    case 'multiply':
      appendOperator('*');
      break;
    case 'divide':
      appendOperator('/');
      break;
    case 'power':
      appendPower();
      break;
    case 'percent':
      processPercent();
      break;
    case 'mod':
      processMod();
      break;
    case 'sqrt':
      appendFunction('sqrt');
      break;
    case 'cbrt':
      appendFunction('cbrt');
      break;
    case 'square':
      appendFunction('pow');
      break;
    case 'cube':
      expression += '^(3)';
      updateDisplay();
      break;
    case 'sin':
      appendFunction('sin');
      break;
    case 'cos':
      appendFunction('cos');
      break;
    case 'tan':
      appendFunction('tan');
      break;
    case 'asin':
      appendFunction('asin');
      break;
    case 'acos':
      appendFunction('acos');
      break;
    case 'atan':
      appendFunction('atan');
      break;
    case 'log':
      appendFunction('log');
      break;
    case 'ln':
      appendFunction('ln');
      break;
    case 'exp':
      appendFunction('exp');
      break;
    case 'factorial':
      expression += '!';
      updateDisplay();
      break;
    case 'reciprocal':
      expression += '1/';
      updateDisplay();
      break;
    case 'toggle-sign':
      toggleSign();
      break;
    case 'pi':
      appendConstant('π');
      break;
    case 'euler':
      appendConstant('e');
      break;
    case 'power-of-ten':
      expression += '10^';
      updateDisplay();
      break;
    case 'power-e':
      expression += 'e^';
      updateDisplay();
      break;
    case 'memory-clear':
      memoryClear();
      break;
    case 'memory-store':
      memoryStore();
      break;
    case 'memory-recall':
      memoryRecall();
      break;
    case 'memory-add':
      memoryAdd();
      break;
    case 'memory-subtract':
      memorySubtract();
      break;
    case 'memory-show':
      memoryShow();
      break;
    default:
      break;
  }
}

document.querySelectorAll('.number').forEach((button) => {
  button.addEventListener('click', () => appendDigit(button.dataset.value));
});

document.querySelectorAll('.function').forEach((button) => {
  button.addEventListener('click', () => onButtonClick(button.dataset.action));
});

document.querySelectorAll('.operator').forEach((button) => {
  button.addEventListener('click', () => onButtonClick(button.dataset.action));
});

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) appendDigit(key);
  if (key === '.') appendDigit('.');
  if (key === '+') appendOperator('+');
  if (key === '-') appendOperator('-');
  if (key === '*') appendOperator('*');
  if (key === '/') appendOperator('/');
  if (key === '^') appendPower();
  if (key === '%') processPercent();
  if (key === 'Enter' || key === '=') processEquals();
  if (key === 'Backspace') deleteLast();
  if (key === 'Escape') clearAll();
});

clearAll();
