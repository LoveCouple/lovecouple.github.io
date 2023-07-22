# 快速入门

### 先决条件

- 编程语言：本文面向具有一定**JavaScript**基础，希望快速上手Script API的读者，学习过**TypeScript**则更好（若没学过，你可以把**TypeScript**当成具有**类型标记**的**JavaScript**）。
- 行为包：读者最好有一定的Minecraft行为包基础知识，本文不会介绍行为包的结构。
- 开发环境：推荐使用
  - 操作系统：**Linux** (安装**Mcpelauncher**，这也是笔者使用的环境) / **Windows**（安装**Minecraft Windows 10**）/ **Android** (安装 Termux 和 VIM)
  - 游戏版本：Minecraft Bedrock **1.20.10.01**
  - 编辑器：**Visual Studio Code**
  - 包管理工具：NodeJS NPM
  - 项目管理：**Serein** （下文会告诉你安装方式）

## 安装管理工具

### 安装Serein

​	**Serein** 是一个为 Minecraft Bedrock Edition Script API 开发的脚手架项目，可以帮助开发者高效、优雅地创建和管理项目。利用它可以帮助我们快速构建项目并自动部署，很方便进行测试。

​	打开 **cmd** 或者 **Linux Terminal**， 输入以下命令来安装 serein 并初始化我们的项目：

```shell
npm i @pureeval/serein -g
mkdir sapi && cd sapi
serein init
```

​	按照流程配置项目（注意框选部分）：![](/serein.png)

​	之后在**Visual Studio Code**中打开 **sapi** 文件夹，开始编写我们的程序。

### 项目结构

```shell
# behavior_packs文件夹是存放行为包信息地方
├── behavior_packs
│   ├── manifest.json
│   ├── pack_icon.png
│   └── scripts
├── gulpfile.js
├── package.json
├── package-lock.json

# scripts 文件夹存储 scripts文件
├── scripts
│   └── main.ts
└── tsconfig.json
```

- serein 利用 **gulp** 来完成自动部署和打包功能，因此 **gulpfile** 是必须的（你也可以根据自己的实际需求修改）
- main.ts 是脚本入口，之后它会被编译成 js 文件

### 使用Serein管理项目

​	Serein 提供了许多方便的函数供打包、测试使用。下面介绍几个常见的命令。

#### pack

​	自动打包项目，保存到 `build/` 目录下

![pack](/pack.png)

#### deploy

​	自动部署到游戏路径（Development），会根据不同平台自动处理（包括Linux/Android/Windows）

![deploy](/deploy.png)

### 测试流程

​	先写一段简单的代码来熟悉一下 serein 的工作流。

​	这段代码的作用是复读玩家的话，不懂里面用到的函数没关系，后文会解释：

```typescript
// main.ts
import { ChatSendAfterEvent, world  } from "@minecraft/server";
const overWorld = world.getDimension("overworld");

function onChat(e: ChatSendAfterEvent) {
    overWorld.runCommandAsync(`say ${e.message}`)
}

world.afterEvents.chatSend.subscribe(onChat);
```

​	接下来运行deploy自动部署行为包：

```typescript
serein deploy
```

​	接下来可以开始测试了。

1. 打开Minecraft，创建一个新的世界

2. 选择创造模式

3. 添加你的行为包

   ![addons](/load.png)

4. 打开实验功能（**Beta APIs experiment**）

    ![Beta API](/enable_beta.png)
    

5. 进入世界

​	在聊天界面发送 `Hi Script API`，不出意外的话，会看到如下输出：

```
[Script Engine] Hi Script API
```
![hello](/hello.png)

​	其它测试技巧：

1. 可以在设置打开调试控制台，便于查看错误信息
2. 执行 `serein watch`，gulp会监控代码修改，并自动部署到游戏中
3. 可在在游戏中使用 `/reload` 命令重新加载行为包

## Gametest框架简介

### 事件

​	事件系统，简单来说就是通过**监听**某个事件发生，并在发生时做出相应的动作（执行某个函数）。Script API有两种事件类型：`beforeEvents` 和 `afterEvents`，顾名思义，前者是在某行为发生之前的会触发的事件，后者则是在事件发生之后才执行的事件。在Minecraft中世界中发生的各种事件（如实体死亡、方块破坏、聊天信息等）都包含在了其中，但并不是每种事件都有 before 和 after 两种类型，有的可能只有一种。你可以通过 `subscribe` 方法来设置事件的回调函数（也就是事件被触发时要干的事情）。完整事件列表可以查阅官方文档：

> https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/

​	举个例子，我们可以监听 `afterEvents` 的 `chatSend`， 这个事件会在玩家发送聊天信息后调用。

```typescript
import { ChatSendAfterEvent, world  } from "@minecraft/server";

// Kill lampese
function onChat(e: ChatSendAfterEvent) {
  if (e.sender.name === 'lampese') {
    e.sender.kill();
  }
}

world.afterEvents.chatSend.subscribe(onChat);
```

​	对于不熟悉ts的读者，`e: ChatSendAfterEvent `正是一个类型标注，格式是 `name: Type` 此处用到了参数 `e` 的 `sender: Player` 属性，随后调用了 `kill()` 方法杀死名为 lampese 的玩家。

### 动作

​	事件系统使我们得以监听 Minecraft世界的信息，但目前我们还不能影响世界，为了达到这个目的，我们需要 `World` 和 `Dimension` 类（不过你并不能构造它们，只能通过 Script API 提供的函数获取），`@minecraft/server` 包中包含了 `world` 对象，你可以通过它提供的方法来访问世界的一些属性，比如玩家 （**getAllPlayers**） ，维度（**getDimension**） 等。
    下面是使用 `getAllPlayers` 方法的一些例子：
```typescript
world.getAllPlayers().map(x => x.kill())
world.getAllPlayers().filter(p => p.name !== 'CAIMEO').map(p => p.applyDamage(10))
```

当然 `World` 还有很多方法，涉及多种对实体、天气等的操作，具体可查阅文档：

```typescript
world.sendMessage('Hello Everyone')
world.stopMusic()
```

​	 `Dimension` 也是一个重要的对象，它同样也是无法构造的，只能通过 `getDimension` 方法获取。一般的，我们只需要获取主世界（overworld）。

```typescript
const overWorld = world.getDimension("overworld");
```

​	`Dimension` 提供了更多修改世界的方法（可以操作方块和实体等），在下面这个例子中，我们监听 `afterEvents` 的 `blockPlace` ，在放置方块的地方生成一只猪：
```typescript
import { BlockPlaceAfterEvent, world  } from "@minecraft/server";

const overWorld = world.getDimension('overworld')

function onPlace(e: BlockPlaceAfterEvent) {
    overWorld.spawnEntity('minecraft:pig', e.block.location) 
}

world.afterEvents.blockPlace.subscribe(onPlace);
```


​	关于其他函数的使用方法可以查阅官方文档：

> https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/minecraft-server