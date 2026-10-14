# 书影音年鉴

一个不需要后台的个人文化档案站。书籍、电影和音乐记录保存在 `content/` 下的 Markdown 文件中，推送到 GitHub 后自动构建并发布到 GitHub Pages。

## 本地运行

要求 Node.js 20.19 或更高版本，并使用 pnpm。

```bash
pnpm install
pnpm dev
```

## 新增记录

书籍可以通过 ISBN 半自动补全：

```bash
pnpm record:add book 9780140328721
```

电影和音乐会创建手工填写模板：

```bash
pnpm record:add movie
pnpm record:add music
```

脚本会创建 Markdown 文件。打开文件补充正文感受，随后验证并提交：

```bash
pnpm content:validate
git add content
git commit -m "add new archive record"
git push
```

豆瓣评分采用手工记录，并用 `doubanRatingAsOf` 标记采集日期。脚本不会抓取豆瓣，也不会在浏览器中保存任何密钥。

## 内容格式

通用字段为 `type`、`title`、`completedAt`、`tags`、`cover`、`myRating`、`doubanRating`、`doubanUrl` 与 `doubanRatingAsOf`。正文是可选的 Markdown 评论。

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
