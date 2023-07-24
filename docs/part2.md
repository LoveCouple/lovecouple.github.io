---
Author: Lampese, CAIMEO
---

::: info
This Document is working in progress.
:::

# 函子和线性变换

在 Part1 中，我们已经介绍过空间 `Space` 的概念，但我们多是通过构造性的方法来处理空间中的点。现在，让我们来考虑空间之间的变换。

## 简单的空间变换

如果你有一个空间，你可以对这个空间做很多变换：离散、偏移、甚至是旋转等。比如离散变换，也就是把空间中的每个向量的坐标分量全都乘上一个倍数，我们可以很轻松地写出这个函数：

```typescript
const diffusion = (points: Space, factor: number) =>
  points.map((b) => new Point(b.x * factor, b.y * factor, b.z * factor));
```

这是一个非常优雅的实现方式，它利用 `map` （类似 `forEach` ）来遍历空间中的每一个点，并将坐标分量乘上一个系数。几何直观上看，就是这个空间中的点被扩散开了。

类似的，我们也可以很轻松地实现对称（也就是把整个空间关于原点翻转）：

```typescript
const symmetry = (space: Space) =>
  space.map((b) => new Point(-b.x, -b.y, -b.z));
```

你是否注意到了这些函数具有的一个共同结构？ 在上面的例子中， `Point` 的每个分量都用与参与 $*$ 和 $-$ 运算，我们能否写出一个抽象结构来概括它？很显然是可以的。首先，上面涉及到的运算都具有 `number => number` 的结构，所以我们定义一个 `fmap` 函数概括它们：

```typescript
const fmap = (fn: (p: number) => number) => (p: Point) =>
  new Point(fn(p.x), fn(p.y), fn(p.z));
```

自然就可以改写上面的两个函数：

```typescript
const diffusion = (space: Space, factor: number) =>
  space.map(fmap((y) => y * factor));

const symmetry = (space: Space) => space.map(fmap((y) => -y));
```

## 函子

这个 `fmap` 函数是如何想到的呢？ 在范畴论里，它是一个很常见的结构，我们将其称之为**函子（Functor）**。当然不用担心，你完全不需要具备范畴论的知识就能理解它。

我们可以把函子想象成一种特殊的函数（或者构造器），它可以将某个函数进行**升格（Lift）**，使它能够应用于更复杂的数据结构。

就以 `diffusion` 函数中的 `(y) => -y` 为例子，它的类型签名是 `(n: number): number` ，而我们通过 `fmap` 升格后它的类型就变成了 `(p:Point): Point` 。

为什么我们需要一个签名为 `(n: number): number` 的函数来升格？这里我举个不是很恰当的比喻：把 `Point` 当成一个容器。回顾 `Point` 的定义，它包括三个属性 `x,y,z:number` ，我们可以把它当作容器内的物品。函子可以把容器中的物品取出，进行变换后再放回容器中去，而我们要操作 `number` 就必须通过 `(n: number): number` 类型的函数。

### 函子律

函子具有非常良好的性质，我们称为函子律：

（记号说明：$F(X)$ 为包含类型 $X$ 的容器结构，$\text{id}_X:X\to X$ 、${\displaystyle f\colon X\to Y}$ 、${\displaystyle g\colon Y\to Z}$ 是函数）

- 单位律： ${\displaystyle F(\mathrm {id} _{X})=\mathrm {id} _{F(X)}\,\!}$
  - 恒等函数升格之后仍是恒等函数
- 结合律： ${\displaystyle F(g\circ f)=F(f)\circ F(g)}$
  - 升格不影响函数复合的结果

为什么 `Space` 也有这个方法，而且看起来很相似？同样回到定义上来， `Space` 是个数组，其元素固定为 `Point` ，在此情况下，我们也可以把 map 视作函子，将 `(p:Point):Point` 函数升格到了 `(s:Space):Space`

在函数式编程中，函子是一个非常有用的工具，在往下继续阅读文章之前，读者应当仔细体会一下函子的有趣之处，并想想自己喜欢的语言中（除了 Haskell 之外）有什么结构是一个函子。

## 线性变换

现在我们回到空间变换上来，函子确实给我们带来了很多便利，但运算上的复杂不是函子能够解决的。扩散和对称是非常简单的操作，所以我们可以很快写出一个函数来完成这个任务，但如果是旋转、折叠和剪切呢？幸运的是，线性代数可以帮助我们解决这个难题！正常来说，我们只需要考虑空间中的线性变换，非线性变换比较自由，我们无法用一种运算来概括。

而空间中的线性变换都可以通过矩阵表示，所以在开始解释线性变换之前，我们先来认识一下矩阵。（实际上我更认可先学习线性变换后学习矩阵表示的路线，这样可以使你理解更深刻，但这样本篇文章难度和篇幅也会大大增加，如果你手边有教科书是这么讲的，那么看你的教科书就好了！）

## 矩阵

在数学上**矩阵（Matrix）**的一个**狭义**的定义是：矩阵是一个按照矩形排列的复数或实数集合。因为空间变换的实际需要，我们只研究实数矩阵的运算与性质。

下面是一个四行四列的矩阵（可简记为 $4\times 4$ 的矩阵）：

$$
\left[\begin{array}{c}
1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\\end{array}\right]
$$

在 TypeScript 中，我们可以实现一个 Matrix Class：
```typescript
class Matrix {
  rows: number;
  cols: number;
  data: number[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.data = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
  }
}
```

那么矩阵的运算是什么呢？

## 矩阵运算

矩阵的代数运算顾名思义就是矩阵与数字的运算，我们假设加减乘除为一个运算符 $\sigma$，那么定义 $\phi(a,b)=a\ \sigma\ b$，矩阵的代数运算就满足：

$$
\left[\begin{array}{c}1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\\end{array}\right] \sigma \ x= \left[\begin{array}{c}\phi(1,x) & \phi(2,x) & \phi(3,x) & \phi(4,x) \\\phi(1,x) & \phi(2,x) & \phi(3,x) & \phi(4,x)\\\phi(1,x) & \phi(2,x) & \phi(3,x) & \phi(4,x) \\\phi(1,x) & \phi(2,x) & \phi(3,x) & \phi(4,x) \\\end{array}\right]
$$

```typescript
class Matrix {
  rows: number;
  cols: number;
  data: number[][];

  constructor(rows: number, cols: number) { ... }

  map(fn: (value: number) => number): Matrix {
    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = fn(this.data[i][j]);
      }
    }
    return result;
  }
}
```
其实就是一个函子。

一个更直观的例子比如矩阵的数乘运算($\sigma = \times, \phi(a,b)=a\times b$)：

$$
\left[\begin{array}{c}1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\\end{array}\right] \times \ 10= \left[\begin{array}{c}10 & 20 & 30 & 40 \\10 & 20 & 30 & 40\\10 & 20 & 30 & 40 \\10 & 20 & 30 & 40 \\\end{array}\right]
$$

用代码实现就是：
```typescript
mat.map(x => x * 10)
```


### 矩阵的加法、乘法运算

矩阵的加法我们不再赘述，两个矩阵对位相加即可（试试用函子实现它）。

矩阵的乘法运算是针对矩阵和矩阵的运算，它的规则如下：

设 $A$ 为 $m\times p$ 的矩阵，$B$ 为 $p\times n$ 的矩阵，那么称 $m\times n$ 的矩阵 $C$ 为矩阵 $A$ 与矩阵 $B$ 的乘积，记作 $C=AB$，其中矩阵 $C$ 的第 $i$ 行第 $j$ 列元素可以表示为：

$$
(AB)_{ij}=\sum^p_{k=1}a_{kj}b_{kj}=a_{i1}b_{1j}+a_{i2}b_{2j}+...+a_{ip}b_{pj}
$$

公式可能有些隐涩难懂，读者可以写出两个矩阵手动模拟一下该过程，然后再尝试自己手动实现矩阵乘法，就可以清晰的理解矩阵乘法的流程。

```typescript
const multiply = (matrixA: Matrix, matrixB: Matrix) => {
    if (matrixA.cols !== matrixB.rows) {
      throw new Error('Invalid dimensions for matrix multiplication');
    }

    const result = new Matrix(matrixA.rows, matrixB.cols);

    for (let i = 0; i < matrixA.rows; i++) {
      for (let j = 0; j < matrixB.cols; j++) {
        let sum = 0;
        for (let k = 0; k < matrixA.cols; k++) {
          sum += matrixA.data[i][k] * matrixB.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }

    return result;
  }
```

## 在体素几何变换中的应用

读完前文的基本线性代数知识，读者很可能会想：这和高中阶段的向量的叉乘、点乘很相似！

是的，狭义的矩阵可以被认为是向量的高维抽象，而我们前面定义的 Point 正是一个标准的**矢量**。

那么如果我们把很多 Point 拼接成 Space(Space) (也就是最后的几何体)，就等同于很多三维矢量连接起来，成为一个 $3\times n$ 矩阵！

接下来我们就可以把一些针对矩阵的线性变换应用到几何体上：

### move

move 操作指对于一整个 Space $S$ 给出一个偏移向量 $(x,y,z)$ ，对空间根据偏移量进行偏移。

采用矩阵我们可以轻易的概括该操作：

$$
move(S,Point\rightarrow (x,y,z))=S +\left[\begin{array}{c}x & y & z \\ .& .& .  \\x & y & z \\\end{array}\right]
$$

### diffusion

diffusion 操作指对于一整个 Space 给出一个偏移向量 $(x,y,z)$ ，对空间根据偏移量进行散射。

采用矩阵我们可以轻易的概括该操作：

$$
diffusion(S,Point\rightarrow (x,y,z))=S\cdot \left[\begin{array}{c}x & y & z \\ .& .& .  \\x & y & z \\\end{array}\right]
$$

### rotate

rotate 操作指对于一整个 Space 给出一个方向角 $\alpha$，对空间根据方向角旋转。

采用矩阵我们可以轻易的概括该操作：

$$
rotate(S,\alpha)=S\cdot \left[\begin{array}{c}\cos\alpha & 0 & \sin\alpha \\ 0& 1& 0  \\-\sin\alpha & 0 & \cos\alpha \\\end{array}\right]
$$

这就是线性代数在体素集合中参与线性变换的一些简单的例子，当然如果我们需要用代码来实现，需要预先准备一个底层抽象——**线性代数运算库**，笔者手动实现了一个可以满足自身需求的，读者也可以选用现有的很多优秀的开源库。

## 步入高维几何

## 旋转矩阵

## 向低维投影
