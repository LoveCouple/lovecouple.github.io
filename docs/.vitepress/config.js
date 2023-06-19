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
  title: "Script API Guide",
  description: "Minecraft Bedrock Script API Guide",
  markdown: {
    config: (md) => {
      md.use(mathjax3);
    },
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Tutorial', link: '/course' }
    ],

    sidebar: [
      {
        text: 'Tutorial List',
        items: [
          { text: '1. 写一个体素几何库', link: '/part1' },
          { text: '2. 线性变换', link: '/part2' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LoveCouple/sapi' },
    ]
  }
})
