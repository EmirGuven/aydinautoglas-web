import { listFaqsForBlock } from '../../services/content-read.service'

export default defineEventHandler(async (event) => {
  const categoryId = getQuery(event).categoryId
  return listFaqsForBlock(typeof categoryId === 'string' ? categoryId : undefined)
})
