// ══ SAMPLE PROGRAMS ══
const SAMPLES = {
  'Hello World': `# Welcome to MiniLang Studio!\nlet name = "World"\nprint("Hello, " + name + "!")\nprint("This runs entirely in your browser.")\n\n# Try changing 'World' to your name!`,

  'Calculator': `# Calculator demo\nfunc add(a, b):\n  return a + b\n\nfunc power(base, exp):\n  let result = 1\n  let i = 0\n  while i < exp:\n    result = result * base\n    i = i + 1\n  return result\n\nprint("5 + 3 =", add(5, 3))\nprint("2^10 =", power(2, 10))\nprint("sqrt(144) =", sqrt(144))`,

  'Loop demo': `# Loops in MiniLang\nprint("Counting up to 5:")\nlet i = 1\nwhile i <= 5:\n  print(i)\n  i = i + 1\n\nprint("\\nFibonacci sequence:")\nlet a = 0\nlet b = 1\nlet n = 0\nwhile n < 10:\n  print(a)\n  let t = a + b\n  a = b\n  b = t\n  n = n + 1`,

  'Conditions': `# Conditions demo\nfunc grade(score):\n  if score >= 90:\n    return "A"\n  else if score >= 80:\n    return "B"\n  else if score >= 70:\n    return "C"\n  else if score >= 60:\n    return "D"\n  else:\n    return "F"\n\nlet scores = [95, 82, 71, 58, 100, 43]\nfor s in scores:\n  print("Score " + str(s) + " → Grade " + grade(s))`,

  'Functions': `# Functions & recursion\nfunc factorial(n):\n  if n <= 1:\n    return 1\n  return n * factorial(n - 1)\n\nfunc isPrime(n):\n  if n < 2:\n    return false\n  let i = 2\n  while i * i <= n:\n    if n % i == 0:\n      return false\n    i = i + 1\n  return true\n\nlet i = 1\nwhile i <= 8:\n  print(str(i) + "! = " + str(factorial(i)))\n  i = i + 1\n\nprint("\\nPrimes up to 30:")\nlet n = 2\nwhile n <= 30:\n  if isPrime(n):\n    print(n)\n  n = n + 1`,
};

// Seed demo account on first load
(function seedDemo() {
  let u = DB.users();
  if (!u.find(x => x.email === 'demo@minilang.dev')) {
    u.push({ id: 'demo', name: 'Demo User', email: 'demo@minilang.dev', password: 'demo1234', created: new Date().toISOString() });
    DB.saveUsers(u);
  }
  if (DB.projs('demo').length === 0) {
    DB.saveProjs('demo', Object.entries(SAMPLES).map(([n, c], i) => ({
      id: 'd' + i, name: n, code: c, created: new Date().toISOString()
    })));
  }
})();
