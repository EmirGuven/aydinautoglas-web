import { listTestimonialsForBlock } from '../../services/content-read.service'

export default defineEventHandler(async (event) => {
  const limit = Number(getQuery(event).limit) || 6
  return listTestimonialsForBlock(limit)
})
