import { describe, expect, it } from 'vitest'
import { doubanTypeFromUrl, parseDoubanPage } from './douban'

describe('Douban metadata', () => {
  it('maps a movie page from JSON-LD and microdata', () => {
    const html = `
      <link rel="canonical" href="https://movie.douban.com/subject/1291557/">
      <meta property="og:image" content="https://img.example/poster.jpg">
      <script type="application/ld+json">{
        "@type": "Movie",
        "name": "花样年华",
        "director": [{"name": "王家卫"}],
        "datePublished": "2000-09-29",
        "aggregateRating": {"ratingValue": "8.8"},
        "genre": ["剧情", "爱情"],
        "description": "一段电影简介。"
      }</script>
    `
    expect(
      parseDoubanPage(html, 'https://movie.douban.com/subject/1291557/', 'movie'),
    ).toMatchObject({
      title: '花样年华',
      creators: ['王家卫'],
      cover: 'https://img.example/poster.jpg',
      rating: 8.8,
      releaseYear: 2000,
      genres: ['剧情', '爱情'],
      description: '一段电影简介。',
    })
  })

  it('maps a book page from classic Douban HTML', () => {
    const html = `
      <meta property="og:title" content="测试书 (豆瓣)">
      <meta property="og:image" content="http://img.example/book.jpg">
      <span property="v:itemreviewed">测试书</span>
      <strong property="v:average">9.1</strong>
      <div id="info">
        <span class="pl">作者:</span> <a>作者甲</a> / <a>作者乙</a><br>
        <span class="pl">出版社:</span> 测试出版社<br>
        <span class="pl">出版年:</span> 2024-3<br>
        <span class="pl">ISBN:</span> 9780140328721<br>
      </div>
    `
    expect(parseDoubanPage(html, 'https://book.douban.com/subject/1/', 'book')).toMatchObject({
      title: '测试书',
      creators: ['作者甲', '作者乙'],
      cover: 'https://img.example/book.jpg',
      rating: 9.1,
      isbn: '9780140328721',
      publisher: '测试出版社',
      publishedYear: 2024,
    })
  })

  it('accepts only known Douban media hosts', () => {
    expect(doubanTypeFromUrl('https://music.douban.com/subject/1/')).toBe('music')
    expect(doubanTypeFromUrl('https://example.com/subject/1/')).toBeUndefined()
  })
})
