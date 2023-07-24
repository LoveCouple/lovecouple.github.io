import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3';
const customElements = ['mjx-container'];

export default defineConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
      },
    },
  },
  title: "Script API 指南",
  description: "Minecraft Bedrock Script API Guide",
  markdown: {
    config: (md) => {
      md.use(mathjax3);
    },
  },
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '课程', link: '/course' }
    ],

    sidebar: [
      {
        text: '课程列表',
        items: [
          { text: '0. 课程简介', link: '/course'},
          { text: '1. 快速入门', link: '/part0'},
          { text: '2. 写一个体素几何库', link: '/part1' },
          { text: '3. 函子和线性变换', link: '/part2' },
          { text: '4. 待定', link: '/part3'}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LoveCouple/sapi' },
    ]
  }
})
