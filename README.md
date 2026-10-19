# 书影音年鉴

一个不需要后台的个人文化档案站。书籍、电影和音乐记录保存在 `content/` 下的 Markdown 文件中，推送到 GitHub 后自动构建并发布到 GitHub Pages。

## 本地运行

要求 Node.js 20.19 或更高版本，并使用 pnpm。

```bash
pnpm install
pnpm dev
```

## 新增记录

书籍可以通过豆瓣链接或 ISBN 自动补全标题、作者、封面、豆瓣评分、简介、出版社、出版年份和标签：

```bash
pnpm record:add https://book.douban.com/subject/1200840/
pnpm record:add 9780140328721
```

电影和音乐可以通过对应的豆瓣条目链接补全标题、封面、豆瓣评分、简介、创作者、发行年份和标签：

```bash
pnpm record:add https://movie.douban.com/subject/1291557/
pnpm record:add https://music.douban.com/subject/1397546/
```

脚本会根据豆瓣链接的域名自动判断书籍、电影或音乐类型，不需要提前指定。原来的 `pnpm record:add book <ISBN>` 以及不带链接运行 `movie`、`music` 的手工填写方式仍然兼容。ISBN 录入会同时尝试豆瓣 ISBN 页面和 Open Library；任一来源暂时不可访问时，脚本会使用另一来源，并保留交互式补充步骤。

豆瓣读取默认使用本机已有的 Chromium/Chrome 打开可见浏览器。如果豆瓣显示验证页，请在窗口中完成验证，再回到终端按回车；浏览器资料保存在项目的 `.cache/douban-browser/`，方便下次沿用验证状态，但不会提交到 Git。系统未自动找到浏览器时，可以指定路径：

```bash
DOUBAN_BROWSER_PATH=/path/to/chrome pnpm record:add https://movie.douban.com/subject/1291557/
```

在没有图形桌面的环境中可以设置 `DOUBAN_BROWSER_HEADLESS=1`，但遇到需要人工验证的页面时仍需改用可见浏览器。

脚本会创建 Markdown 文件。简介保存在 frontmatter 的 `description` 字段；文件正文是可选的个人书评、影评或乐评，只会在详情页展示。补充完成后验证并提交：

```bash
pnpm content:validate
git add content
git commit -m "add new archive record"
git push
```

自动取得的豆瓣评分会用 `doubanRatingAsOf` 标记采集日期。抓取到的封面会下载到 `public/covers/`，Markdown 中保存相对路径；简介直接保存在条目中。浏览器无法启动或豆瓣暂时不可访问时，脚本会尝试普通网络请求，最后仍会保留可编辑的手工录入流程。

## 删除记录

可以使用标题、记录 ID、Markdown 文件名或豆瓣链接删除条目：

```bash
pnpm record:delete 了不起的狐狸爸爸
pnpm record:delete book-2026-10-03-fantastic-mr-fox
pnpm record:delete https://book.douban.com/subject/1200840/
```

命令会先显示即将删除的条目，并要求输入“删除”确认。脚本调用时可以增加 `--yes` 跳过确认：

```bash
pnpm record:delete book-2026-10-03-fantastic-mr-fox --yes
```

删除的是对应的 Markdown 文件；如果尚未提交，可以使用命令输出的 `git restore -- <文件>` 恢复。

## 内容格式

通用字段为 `type`、`title`、`completedAt`、`tags`、`cover`、`description`、`myRating`、`doubanRating`、`doubanUrl` 与 `doubanRatingAsOf`。正文是可选的 Markdown 评论，只在详情页展示。

- 书籍：`isbn`、`authors`、`publisher`、`publishedYear`
- 电影：`directors`、`releaseYear`
- 音乐：`artists`、`releaseYear`、`musicKind`

同一作品再次阅读或观看时，新建一条带新完成日期的记录即可。

## 验证与构建

```bash
pnpm content:validate
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

## 发布到 GitHub Pages

1. 将仓库默认分支设为 `main`。
2. 在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**。
3. 推送到 `main`，`.github/workflows/deploy.yml` 会完成校验、测试和发布。

Vite 会在 GitHub Actions 中自动识别普通项目站点与 `<username>.github.io` 用户站点，并设置正确的资源基础路径。
