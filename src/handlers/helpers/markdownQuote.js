export default str =>
  str
    .trim()
    .split('\n')
    .map(s => s.trim())
    .map(s => `> ${s}`)
    .join('\n')
