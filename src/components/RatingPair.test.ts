import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RatingPair from './RatingPair.vue'

describe('RatingPair', () => {
  it('does not render an empty rating block', () => {
    expect(mount(RatingPair).html()).toBe('<!--v-if-->')
  })

  it('keeps personal and Douban ratings distinct', () => {
    const wrapper = mount(RatingPair, { props: { myRating: 4.5, doubanRating: 8.8 } })
    expect(wrapper.text()).toContain('我的评分')
    expect(wrapper.text()).toContain('4.5 / 5')
    expect(wrapper.text()).toContain('豆瓣')
    expect(wrapper.text()).toContain('8.8 / 10')
  })
})
