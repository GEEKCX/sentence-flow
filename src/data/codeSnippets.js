/**
 * 代码片段练习数据
 * 支持多种编程语言
 */

export const CODE_SNIPPETS = {
  javascript: {
    name: 'JavaScript',
    color: '#F7DF1E',
    icon: '⚡',
    snippets: [
      {
        name: '数组去重',
        code: `const unique = [...new Set(array)];`,
        difficulty: 'easy'
      },
      {
        name: 'Promise.all',
        code: `const results = await Promise.all(promises);`,
        difficulty: 'medium'
      },
      {
        name: '解构赋值',
        code: `const { name, age } = person;`,
        difficulty: 'easy'
      },
      {
        name: '箭头函数',
        code: `const sum = (a, b) => a + b;`,
        difficulty: 'easy'
      },
      {
        name: '模板字符串',
        code: `const message = \`Hello, \${name}!\`;`,
        difficulty: 'easy'
      },
      {
        name: '数组map',
        code: `const doubled = numbers.map(n => n * 2);`,
        difficulty: 'easy'
      },
      {
        name: '对象展开',
        code: `const newObj = { ...oldObj, newProp: true };`,
        difficulty: 'medium'
      },
      {
        name: 'Async/Await',
        code: `async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}`,
        difficulty: 'medium'
      },
      {
        name: 'reduce求和',
        code: `const sum = arr.reduce((acc, curr) => acc + curr, 0);`,
        difficulty: 'medium'
      },
      {
        name: '类定义',
        code: `class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    return \`Hello, I'm \${this.name}\`;
  }
}`,
        difficulty: 'hard'
      }
    ]
  },
  
  python: {
    name: 'Python',
    color: '#3776AB',
    icon: '🐍',
    snippets: [
      {
        name: '列表推导',
        code: `squares = [x**2 for x in range(10)]`,
        difficulty: 'easy'
      },
      {
        name: '装饰器',
        code: `@property
def name(self):
    return self._name`,
        difficulty: 'hard'
      },
      {
        name: '字典推导',
        code: `d = {k: v for k, v in zip(keys, values)}`,
        difficulty: 'medium'
      },
      {
        name: 'Lambda函数',
        code: `multiply = lambda x, y: x * y`,
        difficulty: 'easy'
      },
      {
        name: '生成器',
        code: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b`,
        difficulty: 'hard'
      },
      {
        name: 'With语句',
        code: `with open('file.txt', 'r') as f:
    content = f.read()`,
        difficulty: 'easy'
      },
      {
        name: '异常处理',
        code: `try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")`,
        difficulty: 'medium'
      },
      {
        name: '字符串格式化',
        code: `message = f"Hello, {name}! You are {age} years old."`,
        difficulty: 'easy'
      },
      {
        name: 'Enumerate',
        code: `for index, value in enumerate(items):
    print(f"{index}: {value}")`,
        difficulty: 'medium'
      },
      {
        name: 'Zip函数',
        code: `for name, score in zip(names, scores):
    print(f"{name}: {score}")`,
        difficulty: 'medium'
      }
    ]
  },
  
  typescript: {
    name: 'TypeScript',
    color: '#3178C6',
    icon: '📘',
    snippets: [
      {
        name: '接口定义',
        code: `interface User {
  id: number;
  name: string;
  email?: string;
}`,
        difficulty: 'easy'
      },
      {
        name: '泛型函数',
        code: `function identity<T>(arg: T): T {
  return arg;
}`,
        difficulty: 'medium'
      },
      {
        name: '类型别名',
        code: `type Point = {
  x: number;
  y: number;
};`,
        difficulty: 'easy'
      },
      {
        name: '枚举',
        code: `enum Color {
  Red,
  Green,
  Blue
}`,
        difficulty: 'easy'
      },
      {
        name: '泛型接口',
        code: `interface GenericResponse<T> {
  data: T;
  status: number;
  message: string;
}`,
        difficulty: 'medium'
      },
      {
        name: '条件类型',
        code: `type IsString<T> = T extends string ? true : false;`,
        difficulty: 'hard'
      },
      {
        name: '工具类型',
        code: `type PartialUser = Partial<User>;
type ReadonlyUser = Readonly<User>;`,
        difficulty: 'medium'
      },
      {
        name: '函数重载',
        code: `function add(a: number, b: number): number;
function add(a: string, b: string): string;
function add(a: any, b: any): any {
  return a + b;
}`,
        difficulty: 'hard'
      }
    ]
  },
  
  html: {
    name: 'HTML',
    color: '#E34F26',
    icon: '🌐',
    snippets: [
      {
        name: '基础结构',
        code: `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
</body>
</html>`,
        difficulty: 'easy'
      },
      {
        name: '表单',
        code: `<form action="/submit" method="POST">
  <input type="text" name="username" required>
  <button type="submit">提交</button>
</form>`,
        difficulty: 'medium'
      },
      {
        name: '导航链接',
        code: `<nav>
  <a href="/home">首页</a>
  <a href="/about">关于</a>
</nav>`,
        difficulty: 'easy'
      },
      {
        name: '图片',
        code: `<img src="image.jpg" alt="描述文字" width="300">`,
        difficulty: 'easy'
      },
      {
        name: '表格',
        code: `<table>
  <thead>
    <tr><th>姓名</th><th>年龄</th></tr>
  </thead>
  <tbody>
    <tr><td>张三</td><td>25</td></tr>
  </tbody>
</table>`,
        difficulty: 'medium'
      }
    ]
  },
  
  css: {
    name: 'CSS',
    color: '#1572B6',
    icon: '🎨',
    snippets: [
      {
        name: 'Flexbox居中',
        code: `.center {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
        difficulty: 'easy'
      },
      {
        name: 'Grid布局',
        code: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}`,
        difficulty: 'medium'
      },
      {
        name: '渐变背景',
        code: `.gradient {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
}`,
        difficulty: 'easy'
      },
      {
        name: '动画',
        code: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate {
  animation: fadeIn 0.5s ease;
}`,
        difficulty: 'medium'
      },
      {
        name: '媒体查询',
        code: `@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}`,
        difficulty: 'medium'
      }
    ]
  },
  
  rust: {
    name: 'Rust',
    color: '#DEA584',
    icon: '🦀',
    snippets: [
      {
        name: 'Hello World',
        code: `fn main() {
    println!("Hello, World!");
}`,
        difficulty: 'easy'
      },
      {
        name: '函数定义',
        code: `fn add(a: i32, b: i32) -> i32 {
    a + b
}`,
        difficulty: 'easy'
      },
      {
        name: '结构体',
        code: `struct Point {
    x: f64,
    y: f64,
}

impl Point {
    fn distance(&self, other: &Point) -> f64 {
        ((self.x - other.x).powi(2) + 
         (self.y - other.y).powi(2)).sqrt()
    }
}`,
        difficulty: 'hard'
      },
      {
        name: '枚举',
        code: `enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}`,
        difficulty: 'medium'
      },
      {
        name: '模式匹配',
        code: `match value {
    1 => println!("One"),
    2 => println!("Two"),
    _ => println!("Other"),
}`,
        difficulty: 'medium'
      }
    ]
  }
};

/**
 * 获取语言列表
 */
export function getLanguageOptions() {
  return Object.entries(CODE_SNIPPETS).map(([key, lang]) => ({
    value: key,
    label: `${lang.icon} ${lang.name}`,
    color: lang.color
  }));
}

/**
 * 获取指定语言的随机代码片段
 * @param {string} language 语言key
 * @param {string} difficulty 难度筛选（可选）
 */
export function getRandomSnippet(language, difficulty = null) {
  const lang = CODE_SNIPPETS[language];
  if (!lang) return null;
  
  let snippets = lang.snippets;
  if (difficulty) {
    snippets = snippets.filter(s => s.difficulty === difficulty);
  }
  
  if (snippets.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * snippets.length);
  return snippets[randomIndex];
}

/**
 * 获取所有代码片段
 * @param {string} language 语言key（可选，不传则返回所有）
 */
export function getAllSnippets(language = null) {
  if (language) {
    return CODE_SNIPPETS[language]?.snippets || [];
  }
  
  return Object.entries(CODE_SNIPPETS).flatMap(([lang, data]) =>
    data.snippets.map(s => ({ ...s, language: lang, languageName: data.name }))
  );
}
