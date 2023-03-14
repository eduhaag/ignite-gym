import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { CheckinUseCase } from './check-in'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckImsError } from './errors/max-number-of-check-ims-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckinUseCase

describe('Check-in use case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckinUseCase(checkInsRepository, gymsRepository)

    vi.useFakeTimers()

    gymsRepository.create({
      id: 'gym-01',
      title: 'Academia 01',
      phone: '559933993399',
      latitude: -26.4856393,
      longitude: -49.0716105,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -26.4856393,
      userLongitude: -49.0716105,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2023, 2, 10, 4, 0, 0))
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -26.4856393,
      userLongitude: -49.0716105,
    })

    expect(async () => {
      await sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -26.4856393,
        userLongitude: -49.0716105,
      })
    }).rejects.toBeInstanceOf(MaxNumberOfCheckImsError)
  })

  it('should be able to check in twice in the different day', async () => {
    vi.setSystemTime(new Date(2023, 2, 10, 4, 0, 0))
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -26.4856393,
      userLongitude: -49.0716105,
    })

    vi.setSystemTime(new Date(2023, 2, 11, 4, 0, 0))

    const checkIn = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -26.4856393,
      userLongitude: -49.0716105,
    })

    expect(checkIn).toBeTruthy()
  })

  it('should not be able to check in on distant gym', async () => {
    gymsRepository.create({
      id: 'gym-02',
      title: 'Academia 02',
      phone: '559933993399',
      latitude: -26.474057526816065,
      longitude: -49.019468339228865,
    })

    expect(async () => {
      await sut.execute({
        gymId: 'gym-02',
        userId: 'user-01',
        userLatitude: -26.4856393,
        userLongitude: -49.0716105,
      })
    }).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
