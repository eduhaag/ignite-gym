import { makeFetchUserCheckInsHistoryUseCase } from '@/use-cases/factories/make-fetch-user-check-ins-History-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function history(req: FastifyRequest, res: FastifyReply) {
  const historyQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
  })

  const { page } = historyQuerySchema.parse(req.query)

  const historyUserCheckInUseCase = makeFetchUserCheckInsHistoryUseCase()

  const { checkIns } = await historyUserCheckInUseCase.execute({
    userId: req.user.sub,
    page,
  })

  return res.status(200).send({ checkIns })
}
