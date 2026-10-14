import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RecordCover from './RecordCover.vue'

describe('RecordCover', () => {
  it('shows a useful fallback when the image fails', async () => {
    const wrapper = mount(RecordCover, {
      props: { src: '/missing.jpg', alt: '缺失的封面', type: 'book' },
    })
    await wrapper.get('img').trigger('error')
    expect(wrapper.text()).toContain('缺失的封面')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('uses a square frame for music artwork', () => {
    const wrapper = mount(RecordCover, { props: { alt: '专辑封面', type: 'music' } })
    expect(wrapper.classes()).toContain('aspect-square')
  })
})
