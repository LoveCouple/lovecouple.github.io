---
Author : Lampese
---

# 线性变换

### 为什么需要线性变换？

前几节我们曾经提到了空间类型 Space，可以设想一下你需要对这个空间做很多变换：离散、偏移、甚至是旋转。在以前实现这些需求的时候，你肯定会对每一个需求单独分析，比如将点离散的操作，通常的实现是这样的：

```typescript
function diffusion(points: Point[], factor: number): Vec3[] {
  return points.map((b) => new Vec3(b.x * factor, b.y * factor, b.z * factor));
}
```

这其实已经是非常优雅的实现方式了，他运用了 map 的方式来正确的表达需求，但是我们仍然需要对每个操作思考如何用具体的代码流程来概括，而不是用简单的运算来概括，这如果放在我们下文的线性变换中，我们可能只需要一个简单的运算来概括：

```typescript
function diffusion(points: Matrix, factor: number): Matrix {
  return points.mul([
      [factor, 0, 0],
      [0, factor, 0]
  ]);
}
```

### 线性变换的有力工具——矩阵与矩阵乘法

在数学上矩阵的一个**狭义**的定义是：矩阵是一个按照长方形排列的复数或实数集合。因为空间变换的实际需要，我们只研究实数矩阵的运算与性质。

下面是一个四行四列的矩阵（可简记为 $4\times 4$ 的矩阵）：
$$
\left[\begin{array}{c}
1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\\end{array}\right]
$$
那么矩阵的运算是什么呢？

#### 矩阵的代数运算

矩阵的代数运算顾名思义就是矩阵与数字的运算，我们假设加减乘除为一个运算符 $\sigma$，那么定义 $\phi(a,b)=a\ \sigma\ b$，矩阵的代数运算就满足：
$$
\left[\begin{array}{c}1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\\end{array}\right] \sigma \ x= \left[\begin{array}{c}\phi(1,x) & \phi(2,x) & \phi(3,x) & \phi(4,x) \\\phi(1,x) & \phi(2,x) & \phi(3,x) & \phi(4,x)\\\phi(1,x) & \phi(2,x) & \phi(3,x) & \phi(4,x) \\\phi(1,x) & \phi(2,x) & \phi(3,x) & \phi(4,x) \\\end{array}\right]
$$
一个更直观的例子比如矩阵的数乘运算($\sigma = \times, \phi(a,b)=a\times b$)：
$$
\left[\begin{array}{c}1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\1 & 2 & 3 & 4 \\\end{array}\right] \times \ 10= \left[\begin{array}{c}10 & 20 & 30 & 40 \\10 & 20 & 30 & 40\\10 & 20 & 30 & 40 \\10 & 20 & 30 & 40 \\\end{array}\right]
$$
实际上如果上面的 $\phi$ 是一个**柯里化(curried)函数**，我们就可以在代码轻松的抽象这个运算：

````typescript
Matrix sigma x = Matrix.map(x => phi(x))
````

#### 矩阵的加法、乘法运算

矩阵的加法我们不再赘述，两个矩阵对位相加即可。

矩阵的乘法运算是针对矩阵和矩阵的运算，它的规则如下：

设 $A$ 为 $m\times p$ 的矩阵，$B$ 为 $p\times n$ 的矩阵，那么称 $m\times n$ 的矩阵 $C$ 为矩阵 $A$ 与矩阵 $B$ 的乘积，记作 $C=AB$，其中矩阵 $C$ 的第 $i$ 行第 $j$ 列元素可以表示为：
$$
(AB)_{ij}=\sum^p_{k=1}a_{kj}b_{kj}=a_{i1}b_{1j}+a_{i2}b_{2j}+...+a_{ip}b_{pj}
$$
公式可能有些隐涩难懂，读者可以写出两个矩阵手动模拟一下该过程，就可以清晰的理解矩阵乘法的流程。

### 在体素几何变换中的应用

读完前文的基本线性代数知识，读者很可能会想：这和高中阶段的向量的叉乘、点乘很相似！

是的，狭义的矩阵可以被认为是向量的高维抽象，而我们前面定义的 Point 正是一个标准的**矢量**。

那么如果我们把很多 Point 拼接成 Space(Point[]) (也就是最后的几何体)，就等同于很多三维矢量连接起来，成为一个 $3\times n$ 矩阵！

接下来我们就可以把一些针对矩阵的线性变换应用到几何体上：

#### move

move 操作指对于一整个 Space $S$ 给出一个偏移向量 $(x,y,z)$ ，对空间根据偏移量进行偏移。

采用矩阵我们可以轻易的概括该操作：
$$
move(S,Point\rightarrow (x,y,z))=S +\left[\begin{array}{c}x & y & z \\ .& .& .  \\x & y & z \\\end{array}\right]
$$

#### diffusion

diffusion 操作指对于一整个 Space 给出一个偏移向量 $(x,y,z)$ ，对空间根据偏移量进行散射。

采用矩阵我们可以轻易的概括该操作：
$$
diffusion(S,Point\rightarrow (x,y,z))=S\cdot \left[\begin{array}{c}x & y & z \\ .& .& .  \\x & y & z \\\end{array}\right]
$$

#### rotate

rotate 操作指对于一整个 Space 给出一个方向角 $\alpha$，对空间根据方向角旋转。

采用矩阵我们可以轻易的概括该操作：
$$
rotate(S,\alpha)=S\cdot \left[\begin{array}{c}\cos\alpha & 0 & \sin\alpha \\ 0& 1& 0  \\-\sin\alpha & 0 & \cos\alpha \\\end{array}\right]
$$
这就是线性代数在体素集合中参与线性变换的一些简单的例子，当然如果我们需要用代码来实现，需要预先准备一个底层抽象——**线性代数运算库**，笔者手动实现了一个可以满足自身需求的，读者也可以选用现有的很多优秀的开源库。
