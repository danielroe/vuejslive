export default defineEventHandler(async event => {
  const data = await $fetch('/foo')
  return {
    foo: data
  }
})
