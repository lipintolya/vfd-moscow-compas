import { ref, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

export function useScrollReveal(threshold = 0.15) {
  const sectionRef = useTemplateRef<HTMLElement>('sectionEl')
  const visible    = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const el = sectionRef.value
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      visible.value = true
      return
    }
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) { visible.value = true; observer?.disconnect() }
      },
      { threshold }
    )
    observer.observe(el)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { sectionRef, visible }
}
