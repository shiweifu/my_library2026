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
pnpm record:add book https://book.douban.com/subject/1200840/
pnpm record:add book 9780140328721
```

电影和音乐可以通过对应的豆瓣条目链接补全标题、封面、豆瓣评分、简介、创作者、发行年份和标签：

```bash
pnpm record:add movie https://movie.douban.com/subject/1291557/
pnpm record:add music https://music.douban.com/subject/1397546/
```

不带链接运行 `movie` 或 `music` 时，仍可创建手工填写的记录。ISBN 录入会同时尝试豆瓣 ISBN 页面和 Open Library；任一来源暂时不可访问时，脚本会使用另一来源，并保留交互式补充步骤。

脚本会创建 Markdown 文件。简介保存在 frontmatter 的 `description` 字段；文件正文是可选的个人书评、影评或乐评，只会在详情页展示。补充完成后验证并提交：

```bash
pnpm content:validate
git add content
git commit -m "add new archive record"
git push
```

自动取得的豆瓣评分会用 `doubanRatingAsOf` 标记采集日期。豆瓣可能对自动访问触发验证；此时脚本会说明失败原因并继续创建可编辑记录，不会保存 Cookie 或密钥。

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
