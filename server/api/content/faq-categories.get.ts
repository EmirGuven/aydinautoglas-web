import { listFaqCategoriesForBlock } from '../../services/content-read.service'

export default defineEventHandler(async () => {
  return listFaqCategoriesForBlock()
})
