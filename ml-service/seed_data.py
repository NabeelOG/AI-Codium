"""
Generate a synthetic training dataset of ~250 labeled code snippets
across 5 error categories: Syntax Error, Runtime Error, Logical Error,
Inefficient Solution, Correct.
"""

import csv
import os
import random

random.seed(42)

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "training_data.csv")

# ---------------------------------------------------------------------------
# Templates for each category — (code, stderr, language)
# ---------------------------------------------------------------------------

SYNTAX_ERRORS = [
    # Python
    ('def foo()\n    print("hello"\n', "", "python"),
    ("x = [1, 2, 3\nprint(x)", "", "python"),
    ('if True\n    print("missing colon")', "", "python"),
    ('print("unclosed string)\n', "", "python"),
    ("for i in range(10)\nprint(i)", "", "python"),
    ('x = {"key": "val",\ny = 5', "", "python"),
    ("def bar(x y):\n    return x + y", "", "python"),
    ("import math\nprint(math..pi)", "", "python"),
    ("result = (a + b * (c - d)", "", "python"),
    ("class Foo:\ndef __init__(self)\nself.x = 1", "", "python"),
    # JavaScript
    ('function foo() {\n  console.log("hello"\n}', "", "javascript"),
    ("const x = [1, 2, 3\nconsole.log(x)", "", "javascript"),
    ('if (true {\n  console.log("oops")', "", "javascript"),
    ('let str = "unclosed;\nconsole.log(str)', "", "javascript"),
    ("function sum(a b) {\n  return a + b", "", "javascript"),
    ("const obj = {a: 1, b: 2,\nconst c = 3", "", "javascript"),
    ('import { foo  from "./bar"', "", "javascript"),
    ("arr.map(x => x * 2\n.filter(x > 3)", "", "javascript"),
    ("const fn = () => {\n  return {}\n  .method()", "", "javascript"),
    ("let x = 5\nlet y = x +\nconsole.log(y)", "", "javascript"),
    # --- additional Python syntax errors ---
    ("def add(a, b)\n    return a + b", "", "python"),
    ("while True\n    pass", "", "python"),
    ("x = (1, 2, 3\nprint(x)", "", "python"),
    ('print "hello world"', "", "python"),
    ("class Animal\n    pass", "", "python"),
    ("if x == 5\n    print(x)", "", "python"),
    ("def greet(name):\nprint(name)", "", "python"),
    ('d = {"a": 1, "b": 2\nprint(d)', "", "python"),
    ("nums = [1, 2, 3]]\nprint(nums)", "", "python"),
    ("return total\n", "", "python"),
    # --- additional JavaScript syntax errors ---
    ("function add(a, b) {\n  return a + b\n", "", "javascript"),
    ("const arr = [1, 2, 3];;;\narr.map(x =>", "", "javascript"),
    ("if (x === 5 {\n  console.log(x);\n}", "", "javascript"),
    ("const obj = { a: 1, b: 2;\nconsole.log(obj)", "", "javascript"),
    ("for (let i = 0 i < 10; i++) {\n  console.log(i);\n}", "", "javascript"),
    ("function () {\n  return 1;\n}", "", "javascript"),
    ("let x = ;\nconsole.log(x)", "", "javascript"),
    ("console.log('hello);", "", "javascript"),
    ("function multiply(a, b) {{\n  return a * b;\n}", "", "javascript"),
    ("const sum = (a, b) =>\n  return a + b;", "", "javascript"),
]

RUNTIME_ERRORS = [
    # Python
    (
        "def divide(a, b):\n    return a / b\nprint(divide(10, 0))",
        "ZeroDivisionError: division by zero",
        "python",
    ),
    (
        "numbers = [1, 2, 3]\nprint(numbers[5])",
        "IndexError: list index out of range",
        "python",
    ),
    (
        "x = None\nprint(x.upper())",
        "AttributeError: 'NoneType' object has no attribute 'upper'",
        "python",
    ),
    ('d = {"a": 1}\nprint(d["b"])', "KeyError: 'b'", "python"),
    (
        'x = int("abc")',
        "ValueError: invalid literal for int() with base 10: 'abc'",
        "python",
    ),
    (
        "import nonexistent_module",
        "ModuleNotFoundError: No module named 'nonexistent_module'",
        "python",
    ),
    (
        'f = open("nonexistent_file.txt")',
        "FileNotFoundError: [Errno 2] No such file or directory",
        "python",
    ),
    ('"hello" + 5', "TypeError: can only concatenate str (not 'int') to str", "python"),
    (
        "def recurse():\n    return recurse()\nrecurse()",
        "RecursionError: maximum recursion depth exceeded",
        "python",
    ),
    (
        "data = {1, 2, 3}\ndata[0]",
        "TypeError: 'set' object is not subscriptable",
        "python",
    ),
    # JavaScript
    (
        "const arr = [1, 2, 3];\nconsole.log(arr[10].toString())",
        "TypeError: Cannot read properties of undefined",
        "javascript",
    ),
    (
        "let x = null;\nconsole.log(x.foo)",
        "TypeError: Cannot read properties of null",
        "javascript",
    ),
    ('JSON.parse("not json")', "SyntaxError: Unexpected token", "javascript"),
    (
        "function crash() { crash(); }\ncrash()",
        "RangeError: Maximum call stack size exceeded",
        "javascript",
    ),
    (
        'const fn = () => { throw new Error("boom"); };\nfn()',
        "Error: boom",
        "javascript",
    ),
    ('eval("function(");', "SyntaxError: Unexpected token", "javascript"),
    (
        "const x = undefined;\nconsole.log(x.toString())",
        "TypeError: Cannot read properties of undefined",
        "javascript",
    ),
    ('setTimeout(() => { throw "async error"; }, 100);', "", "javascript"),
    ("new Array(-1)", "RangeError: Invalid array length", "javascript"),
    (
        "window.nonExistent.method()",
        "TypeError: Cannot read properties of undefined",
        "javascript",
    ),
    # --- additional Python runtime errors ---
    ("lst = []\nprint(lst.pop())", "IndexError: pop from empty list", "python"),
    ("total = 10\nprint(total / 0)", "ZeroDivisionError: division by zero", "python"),
    ("print(len(42))", "TypeError: object of type 'int' has no len()", "python"),
    (
        "nums = [1, 2, 3]\nnums.remove(9)",
        "ValueError: list.remove(x): x not in list",
        "python",
    ),
    (
        "s = 'hello'\ns[0] = 'H'",
        "TypeError: 'str' object does not support item assignment",
        "python",
    ),
    ("counts = {}\ncounts['x'] += 1", "KeyError: 'x'", "python"),
    (
        "print(float('not a number'))",
        "ValueError: could not convert string to float: 'not a number'",
        "python",
    ),
    (
        "import os\nos.does_not_exist()",
        "AttributeError: module 'os' has no attribute 'does_not_exist'",
        "python",
    ),
    (
        "a = [1, 2, 3]\nb = a + 5",
        'TypeError: can only concatenate list (not "int") to list',
        "python",
    ),
    (
        "print(undefined_variable)",
        "NameError: name 'undefined_variable' is not defined",
        "python",
    ),
    # --- additional JavaScript runtime errors ---
    (
        "const x = null;\nconsole.log(x.length)",
        "TypeError: Cannot read properties of null (reading 'length')",
        "javascript",
    ),
    (
        "console.log(missingVar + 1)",
        "ReferenceError: missingVar is not defined",
        "javascript",
    ),
    (
        "const obj = {};\nconsole.log(obj.a.b)",
        "TypeError: Cannot read properties of undefined (reading 'b')",
        "javascript",
    ),
    (
        "const empty = [];\nempty.reduce((a, b) => a + b)",
        "TypeError: Reduce of empty array with no initial value",
        "javascript",
    ),
    (
        "const PI = 3.14;\nPI = 3.15;",
        "TypeError: Assignment to constant variable.",
        "javascript",
    ),
    ("const f = null;\nf();", "TypeError: f is not a function", "javascript"),
    (
        "JSON.parse('{ bad json }')",
        "SyntaxError: Unexpected token b in JSON at position 2",
        "javascript",
    ),
    ("const n = 5;\nn.map(x => x)", "TypeError: n.map is not a function", "javascript"),
    ("decodeURIComponent('%')", "URIError: URI malformed", "javascript"),
    (
        "const arr = [1, 2];\narr[5].toFixed(2)",
        "TypeError: Cannot read properties of undefined (reading 'toFixed')",
        "javascript",
    ),
]

LOGICAL_ERRORS = [
    # Python — off-by-one, wrong comparison, inverted condition
    (
        "def sum_to_n(n):\n    total = 0\n    for i in range(n):\n        total += i\n    return total",
        "",
        "python",
    ),
    ("def is_even(n):\n    return n % 2 == 1", "", "python"),
    (
        "def find_max(arr):\n    max_val = 0\n    for x in arr:\n        if x > max_val:\n            max_val = x\n    return max_val",
        "",
        "python",
    ),
    (
        "def factorial(n):\n    result = 0\n    for i in range(1, n+1):\n        result *= i\n    return result",
        "",
        "python",
    ),
    (
        "def binary_search(arr, target):\n    lo, hi = 0, len(arr)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid\n        else:\n            hi = mid\n    return -1",
        "",
        "python",
    ),
    (
        'def reverse_string(s):\n    return s[::-1]\nprint(reverse_string("hello") == "hello")',
        "",
        "python",
    ),
    (
        'def count_vowels(s):\n    vowels = "aeiou"\n    count = 0\n    for c in s:\n        if c in vowels:\n            count += 1\n    return count',
        "",
        "python",
    ),
    (
        'def is_palindrome(s):\n    return s == s[::-1]\nprint(is_palindrome("Racecar"))',
        "",
        "python",
    ),
    (
        'def fizzbuzz(n):\n    for i in range(1, n):\n        if i % 3 == 0 and i % 5 == 0:\n            print("FizzBuzz")\n        elif i % 3 == 0:\n            print("Fizz")\n        elif i % 5 == 0:\n            print("Buzz")\n        else:\n            print(i)',
        "",
        "python",
    ),
    (
        "def gcd(a, b):\n    while b:\n        a = b\n        b = a % b\n    return a",
        "",
        "python",
    ),
    # JavaScript
    (
        "function sumToN(n) {\n  let total = 0;\n  for (let i = 0; i < n; i++) {\n    total += i;\n  }\n  return total;\n}",
        "",
        "javascript",
    ),
    ("function isEven(n) {\n  return n % 2 === 1;\n}", "", "javascript"),
    (
        "function findMax(arr) {\n  let max = 0;\n  for (let x of arr) {\n    if (x > max) max = x;\n  }\n  return max;\n}",
        "",
        "javascript",
    ),
    (
        "function factorial(n) {\n  let result = 0;\n  for (let i = 1; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}",
        "",
        "javascript",
    ),
    (
        'function reverseStr(s) {\n  return s.split("").reverse().join("");\n}\nconsole.log(reverseStr("hello") === "hello");',
        "",
        "javascript",
    ),
    (
        'function isPalindrome(s) {\n  return s === s.split("").reverse().join("");\n}\nconsole.log(isPalindrome("Racecar"));',
        "",
        "javascript",
    ),
    (
        'function countVowels(s) {\n  const vowels = ["a","e","i","o","u"];\n  let count = 0;\n  for (let c of s) {\n    if (vowels.includes(c)) count++;\n  }\n  return count;\n}',
        "",
        "javascript",
    ),
    (
        "function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length;\n  while (lo < hi) {\n    let mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) lo = mid;\n    else hi = mid;\n  }\n  return -1;\n}",
        "",
        "javascript",
    ),
    ("const arr = [3, 1, 4, 1, 5];\narr.sort();\nconsole.log(arr);", "", "javascript"),
    (
        "function clamp(val, min, max) {\n  if (val < min) return min;\n  if (val < max) return val;\n  return max;\n}",
        "",
        "javascript",
    ),
    # --- additional Python logical errors ---
    ("def average(nums):\n    return sum(nums) / len(nums) + 1", "", "python"),
    ("def is_positive(n):\n    return n >= 0", "", "python"),
    (
        "def max_of_two(a, b):\n    if a > b:\n        return b\n    return a",
        "",
        "python",
    ),
    ("def square_all(nums):\n    return [n * 2 for n in nums]", "", "python"),
    (
        "def sum_list(lst):\n    total = 1\n    for x in lst:\n        total += x\n    return total",
        "",
        "python",
    ),
    ("def to_celsius(f):\n    return (f - 32) * 5 / 9 + 1", "", "python"),
    (
        "def double_values(lst):\n    for x in lst:\n        x *= 2\n    return lst",
        "",
        "python",
    ),
    (
        "def absolute(n):\n    if n > 0:\n        return n\n    return n",
        "",
        "python",
    ),
    (
        "def last_index(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return 0",
        "",
        "python",
    ),
    ("def average_grade(grades):\n    return sum(grades) // len(grades)", "", "python"),
    # --- additional JavaScript logical errors ---
    (
        "function average(nums) {\n  return nums.reduce((a, b) => a + b, 0) / nums.length + 1;\n}",
        "",
        "javascript",
    ),
    ("function isPositive(n) {\n  return n >= 0;\n}", "", "javascript"),
    ("function maxOfTwo(a, b) {\n  return a > b ? b : a;\n}", "", "javascript"),
    (
        "function sumList(arr) {\n  let total = 1;\n  for (const x of arr) total += x;\n  return total;\n}",
        "",
        "javascript",
    ),
    ("function squareAll(nums) {\n  return nums.map(n => n * 2);\n}", "", "javascript"),
    ("function lastElement(arr) {\n  return arr[arr.length];\n}", "", "javascript"),
    ("function toCelsius(f) {\n  return (f - 32) * 5 / 9 + 1;\n}", "", "javascript"),
    (
        "function countdown(n) {\n  while (n > 0) {\n    console.log(n);\n  }\n}",
        "",
        "javascript",
    ),
    ("function greaterThanTen(n) {\n  return n > 100;\n}", "", "javascript"),
    ("function firstHalf(arr) {\n  return arr.slice(0, arr.length);\n}", "", "javascript"),
]

INEFFICIENT_SOLUTIONS = [
    # Python — O(n^2) where O(n) possible, repeated work, unnecessary nesting
    (
        "def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(len(nums)):\n            if i != j and nums[i] + nums[j] == target:\n                return [i, j]",
        "",
        "python",
    ),
    (
        "def contains_duplicate(nums):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] == nums[j]:\n                return True\n    return False",
        "",
        "python",
    ),
    (
        "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
        "",
        "python",
    ),
    (
        "def find_duplicates(arr):\n    result = []\n    for i in range(len(arr)):\n        for j in range(i+1, len(arr)):\n            if arr[i] == arr[j] and arr[i] not in result:\n                result.append(arr[i])\n    return result",
        "",
        "python",
    ),
    (
        "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(n):\n            if arr[i] > arr[j]:\n                arr[i], arr[j] = arr[j], arr[i]\n    return arr",
        "",
        "python",
    ),
    (
        "def count_frequency(arr):\n    result = []\n    for x in arr:\n        result.append(arr.count(x))\n    return result",
        "",
        "python",
    ),
    (
        "def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, n):\n        if n % i == 0:\n            return False\n    return True",
        "",
        "python",
    ),
    (
        "def find_intersection(a, b):\n    result = []\n    for x in a:\n        if x in b and x not in result:\n            result.append(x)\n    return result",
        "",
        "python",
    ),
    (
        'def max_subarray_bruteforce(nums):\n    max_sum = float("-inf")\n    for i in range(len(nums)):\n        for j in range(i, len(nums)):\n            max_sum = max(max_sum, sum(nums[i:j+1]))\n    return max_sum',
        "",
        "python",
    ),
    (
        'def longest_common_prefix(strs):\n    if not strs: return ""\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n    return prefix',
        "",
        "python",
    ),
    # JavaScript
    (
        "function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = 0; j < nums.length; j++) {\n      if (i !== j && nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n}",
        "",
        "javascript",
    ),
    (
        "function containsDuplicate(nums) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] === nums[j]) return true;\n    }\n  }\n  return false;\n}",
        "",
        "javascript",
    ),
    (
        "function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}",
        "",
        "javascript",
    ),
    (
        "function isPrime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i < n; i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}",
        "",
        "javascript",
    ),
    (
        "function findDuplicates(arr) {\n  const result = [];\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] === arr[j] && !result.includes(arr[i])) {\n        result.push(arr[i]);\n      }\n    }\n  }\n  return result;\n}",
        "",
        "javascript",
    ),
    (
        "function intersect(a, b) {\n  const result = [];\n  for (let x of a) {\n    if (b.includes(x) && !result.includes(x)) result.push(x);\n  }\n  return result;\n}",
        "",
        "javascript",
    ),
    (
        "function countFreq(arr) {\n  return arr.map(x => arr.filter(y => y === x).length);\n}",
        "",
        "javascript",
    ),
    (
        "function bubbleSort(arr) {\n  const n = arr.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n; j++) {\n      if (arr[i] > arr[j]) [arr[i], arr[j]] = [arr[j], arr[i]];\n    }\n  }\n  return arr;\n}",
        "",
        "javascript",
    ),
    (
        "function maxSubarrayBrute(nums) {\n  let maxSum = -Infinity;\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i; j < nums.length; j++) {\n      const sum = nums.slice(i, j + 1).reduce((a, b) => a + b, 0);\n      maxSum = Math.max(maxSum, sum);\n    }\n  }\n  return maxSum;\n}",
        "",
        "javascript",
    ),
    (
        'function longestCommonPrefix(strs) {\n  if (!strs.length) return "";\n  let prefix = strs[0];\n  for (let s of strs.slice(1)) {\n    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);\n  }\n  return prefix;\n}',
        "",
        "javascript",
    ),
    # --- additional Python inefficient solutions ---
    (
        "def has_pair_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(len(nums)):\n            if i != j and nums[i] + nums[j] == target:\n                return True\n    return False",
        "",
        "python",
    ),
    (
        "def unique(arr):\n    result = []\n    for x in arr:\n        if x not in result:\n            result.append(x)\n    return result",
        "",
        "python",
    ),
    ("def slow_max(arr):\n    return sorted(arr)[-1]", "", "python"),
    (
        "def common_elements(a, b):\n    result = []\n    for x in a:\n        for y in b:\n            if x == y and x not in result:\n                result.append(x)\n    return result",
        "",
        "python",
    ),
    (
        "def power(base, exp):\n    result = 1\n    for _ in range(exp):\n        result *= base\n    return result",
        "",
        "python",
    ),
    (
        "def reverse_list(arr):\n    result = []\n    for i in range(len(arr)):\n        result = [arr[i]] + result\n    return result",
        "",
        "python",
    ),
    (
        "def nth_fib(n):\n    if n < 2:\n        return n\n    return nth_fib(n - 1) + nth_fib(n - 2)",
        "",
        "python",
    ),
    ("def count_each(arr):\n    return [arr.count(x) for x in arr]", "", "python"),
    (
        "def dedupe(arr):\n    result = []\n    for i in range(len(arr)):\n        found = False\n        for j in range(len(result)):\n            if arr[i] == result[j]:\n                found = True\n        if not found:\n            result.append(arr[i])\n    return result",
        "",
        "python",
    ),
    ("def sum_of_squares(n):\n    return sum([i * i for i in range(n)])", "", "python"),
    # --- additional JavaScript inefficient solutions ---
    (
        "function hasPairSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = 0; j < nums.length; j++) {\n      if (i !== j && nums[i] + nums[j] === target) return true;\n    }\n  }\n  return false;\n}",
        "",
        "javascript",
    ),
    (
        "function unique(arr) {\n  const result = [];\n  for (const x of arr) {\n    if (!result.includes(x)) result.push(x);\n  }\n  return result;\n}",
        "",
        "javascript",
    ),
    (
        "function slowMax(arr) {\n  return [...arr].sort((a, b) => a - b).pop();\n}",
        "",
        "javascript",
    ),
    (
        "function commonElements(a, b) {\n  const result = [];\n  for (const x of a) {\n    for (const y of b) {\n      if (x === y && !result.includes(x)) result.push(x);\n    }\n  }\n  return result;\n}",
        "",
        "javascript",
    ),
    (
        "function power(base, exp) {\n  let result = 1;\n  for (let i = 0; i < exp; i++) result *= base;\n  return result;\n}",
        "",
        "javascript",
    ),
    (
        "function reverseArr(arr) {\n  let result = [];\n  for (let i = 0; i < arr.length; i++) result = [arr[i], ...result];\n  return result;\n}",
        "",
        "javascript",
    ),
    (
        "function nthFib(n) {\n  if (n < 2) return n;\n  return nthFib(n - 1) + nthFib(n - 2);\n}",
        "",
        "javascript",
    ),
    (
        "function countEach(arr) {\n  return arr.map(x => arr.filter(y => y === x).length);\n}",
        "",
        "javascript",
    ),
    (
        "function dedupe(arr) {\n  const result = [];\n  for (let i = 0; i < arr.length; i++) {\n    let found = false;\n    for (let j = 0; j < result.length; j++) {\n      if (arr[i] === result[j]) found = true;\n    }\n    if (!found) result.push(arr[i]);\n  }\n  return result;\n}",
        "",
        "javascript",
    ),
    (
        "function sumOfSquares(n) {\n  return Array.from({ length: n }, (_, i) => i * i).reduce((a, b) => a + b, 0);\n}",
        "",
        "javascript",
    ),
]

CORRECT_SOLUTIONS = [
    # Python
    (
        "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i",
        "",
        "python",
    ),
    (
        "def contains_duplicate(nums):\n    return len(set(nums)) < len(nums)",
        "",
        "python",
    ),
    (
        "def fibonacci(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b",
        "",
        "python",
    ),
    (
        "def is_prime(n):\n    if n < 2:\n        return False\n    import math\n    for i in range(2, int(math.sqrt(n)) + 1):\n        if n % i == 0:\n            return False\n    return True",
        "",
        "python",
    ),
    ('def reverse_words(s):\n    return " ".join(s.split()[::-1])', "", "python"),
    (
        'def is_palindrome(s):\n    s = "".join(c.lower() for c in s if c.isalnum())\n    return s == s[::-1]',
        "",
        "python",
    ),
    (
        'def count_vowels(s):\n    return sum(1 for c in s.lower() if c in "aeiou")',
        "",
        "python",
    ),
    (
        "def factorial(n):\n    result = 1\n    for i in range(1, n + 1):\n        result *= i\n    return result",
        "",
        "python",
    ),
    (
        "def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1",
        "",
        "python",
    ),
    (
        "def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a",
        "",
        "python",
    ),
    (
        'def fizzbuzz(n):\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            print("FizzBuzz")\n        elif i % 3 == 0:\n            print("Fizz")\n        elif i % 5 == 0:\n            print("Buzz")\n        else:\n            print(i)',
        "",
        "python",
    ),
    (
        "def max_subarray(nums):\n    max_cur = max_global = nums[0]\n    for n in nums[1:]:\n        max_cur = max(n, max_cur + n)\n        max_global = max(max_global, max_cur)\n    return max_global",
        "",
        "python",
    ),
    ("def find_intersection(a, b):\n    return list(set(a) & set(b))", "", "python"),
    (
        "def merge_sorted(a, b):\n    i = j = 0\n    result = []\n    while i < len(a) and j < len(b):\n        if a[i] < b[j]:\n            result.append(a[i]); i += 1\n        else:\n            result.append(b[j]); j += 1\n    result.extend(a[i:])\n    result.extend(b[j:])\n    return result",
        "",
        "python",
    ),
    (
        "def longest_substring_no_repeat(s):\n    seen = {}\n    left = max_len = 0\n    for right, c in enumerate(s):\n        if c in seen and seen[c] >= left:\n            left = seen[c] + 1\n        seen[c] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len",
        "",
        "python",
    ),
    # JavaScript
    (
        "function twoSum(nums, target) {\n  const seen = {};\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (diff in seen) return [seen[diff], i];\n    seen[nums[i]] = i;\n  }\n}",
        "",
        "javascript",
    ),
    (
        "function containsDuplicate(nums) {\n  return new Set(nums).size < nums.length;\n}",
        "",
        "javascript",
    ),
    (
        "function fibonacci(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}",
        "",
        "javascript",
    ),
    (
        "function isPrime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}",
        "",
        "javascript",
    ),
    (
        'function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}',
        "",
        "javascript",
    ),
    (
        "function factorial(n) {\n  let result = 1;\n  for (let i = 1; i <= n; i++) result *= i;\n  return result;\n}",
        "",
        "javascript",
    ),
    (
        "function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}",
        "",
        "javascript",
    ),
    (
        "function gcd(a, b) {\n  while (b) { [a, b] = [b, a % b]; }\n  return a;\n}",
        "",
        "javascript",
    ),
    (
        "function maxSubarray(nums) {\n  let maxCur = nums[0], maxGlobal = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    maxCur = Math.max(nums[i], maxCur + nums[i]);\n    maxGlobal = Math.max(maxGlobal, maxCur);\n  }\n  return maxGlobal;\n}",
        "",
        "javascript",
    ),
    (
        "function mergeSorted(a, b) {\n  let i = 0, j = 0;\n  const result = [];\n  while (i < a.length && j < b.length) {\n    if (a[i] < b[j]) result.push(a[i++]);\n    else result.push(b[j++]);\n  }\n  return [...result, ...a.slice(i), ...b.slice(j)];\n}",
        "",
        "javascript",
    ),
    (
        'function isValidParentheses(s) {\n  const stack = [];\n  const pairs = { "(": ")", "[": "]", "{": "}" };\n  for (let c of s) {\n    if (c in pairs) stack.push(c);\n    else if (pairs[stack.pop()] !== c) return false;\n  }\n  return stack.length === 0;\n}',
        "",
        "javascript",
    ),
    (
        'function groupAnagrams(strs) {\n  const map = {};\n  for (let s of strs) {\n    const key = s.split("").sort().join("");\n    if (!map[key]) map[key] = [];\n    map[key].push(s);\n  }\n  return Object.values(map);\n}',
        "",
        "javascript",
    ),
    # TypeScript / modern JS with Map, Set, arrow functions, type annotations
    (
        "function twoSum(nums: number[], target: number): number[] {\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff)!, i];\n        map.set(nums[i], i);\n    }\n    return [];\n}",
        "",
        "typescript",
    ),
    (
        "const twoSum = (nums: number[], target: number): number[] => {\n    const seen = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (seen.has(complement)) return [seen.get(complement)!, i];\n        seen.set(nums[i], i);\n    }\n    return [];\n};",
        "",
        "typescript",
    ),
    (
        "function containsDuplicate(nums: number[]): boolean {\n    return new Set(nums).size !== nums.length;\n}",
        "",
        "typescript",
    ),
    (
        "const containsDuplicate = (nums: number[]): boolean => new Set(nums).size < nums.length;",
        "",
        "typescript",
    ),
    (
        'function isValid(s: string): boolean {\n    const stack: string[] = [];\n    const map = new Map([[")", "("], ["]", "["], ["}", "{"]]);\n    for (const c of s) {\n        if (!map.has(c)) { stack.push(c); continue; }\n        if (stack.pop() !== map.get(c)) return false;\n    }\n    return stack.length === 0;\n}',
        "",
        "typescript",
    ),
    (
        "function findDuplicates(nums: number[]): number[] {\n    const seen = new Set<number>();\n    const dupes = new Set<number>();\n    for (const n of nums) {\n        if (seen.has(n)) dupes.add(n);\n        seen.add(n);\n    }\n    return [...dupes];\n}",
        "",
        "typescript",
    ),
    (
        'const reverseString = (s: string): string => s.split("").reverse().join("");',
        "",
        "typescript",
    ),
    (
        "function fibonacci(n: number): number {\n    if (n <= 1) return n;\n    let prev = 0, curr = 1;\n    for (let i = 2; i <= n; i++) {\n        [prev, curr] = [curr, prev + curr];\n    }\n    return curr;\n}",
        "",
        "typescript",
    ),
    (
        'const groupAnagrams = (strs: string[]): string[][] => {\n    const map = new Map<string, string[]>();\n    for (const s of strs) {\n        const key = s.split("").sort().join("");\n        if (!map.has(key)) map.set(key, []);\n        map.get(key)!.push(s);\n    }\n    return [...map.values()];\n};',
        "",
        "typescript",
    ),
    (
        "function maxSubArray(nums: number[]): number {\n    let maxCur = nums[0], maxGlobal = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        maxCur = Math.max(nums[i], maxCur + nums[i]);\n        maxGlobal = Math.max(maxGlobal, maxCur);\n    }\n    return maxGlobal;\n}",
        "",
        "typescript",
    ),
    # --- additional correct solutions (counterparts to the logical errors) ---
    ("def average(nums):\n    return sum(nums) / len(nums)", "", "python"),
    ("def is_positive(n):\n    return n > 0", "", "python"),
    ("def max_of_two(a, b):\n    return a if a > b else b", "", "python"),
    ("def square_all(nums):\n    return [n ** 2 for n in nums]", "", "python"),
    ("def to_celsius(f):\n    return (f - 32) * 5 / 9", "", "python"),
    (
        "function average(nums) {\n  return nums.reduce((a, b) => a + b, 0) / nums.length;\n}",
        "",
        "javascript",
    ),
    ("function maxOfTwo(a, b) {\n  return a > b ? a : b;\n}", "", "javascript"),
    ("function lastElement(arr) {\n  return arr[arr.length - 1];\n}", "", "javascript"),
]


def generate():
    rows = []

    for code, stderr, lang in SYNTAX_ERRORS:
        rows.append((code, stderr, lang, "Syntax Error"))
    for code, stderr, lang in RUNTIME_ERRORS:
        rows.append((code, stderr, lang, "Runtime Error"))
    for code, stderr, lang in LOGICAL_ERRORS:
        rows.append((code, stderr, lang, "Logical Error"))
    for code, stderr, lang in INEFFICIENT_SOLUTIONS:
        rows.append((code, stderr, lang, "Inefficient Solution"))
    for code, stderr, lang in CORRECT_SOLUTIONS:
        rows.append((code, stderr, lang, "Correct"))

    random.shuffle(rows)

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["code", "stderr", "language", "label"])
        for code, stderr, lang, label in rows:
            w.writerow([code, stderr, lang, label])

    print(f"Generated {len(rows)} training examples → {OUTPUT_PATH}")
    print(f"  Syntax Error:      {len(SYNTAX_ERRORS)}")
    print(f"  Runtime Error:     {len(RUNTIME_ERRORS)}")
    print(f"  Logical Error:     {len(LOGICAL_ERRORS)}")
    print(f"  Inefficient:       {len(INEFFICIENT_SOLUTIONS)}")
    print(f"  Correct:           {len(CORRECT_SOLUTIONS)}")


if __name__ == "__main__":
    generate()
