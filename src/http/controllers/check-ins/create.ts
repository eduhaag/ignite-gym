import { makeCheckInUseCase } from '@/use-cases/factories/make-check-in-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(req: FastifyRequest, res: FastifyReply) {
  const checkInParamsSchema = z.object({
    gymId: z.string().uuid(),
  })

  const checkInBodySchema = z.object({
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  const { gymId } = checkInParamsSchema.parse(req.params)
  const { latitude, longitude } = checkInBodySchema.parse(req.body)

  const checkInUseCase = makeCheckInUseCase()

  await checkInUseCase.execute({
    userId: req.user.sub,
    gymId,
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return res.status(201).send()
}
