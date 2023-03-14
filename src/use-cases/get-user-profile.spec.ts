import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'

import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { GetUserProfileUseCase } from './get-user-profile'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

describe('Get User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserProfileUseCase(usersRepository)
  })

  it('should be able to get a user', async () => {
    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123abc', 6),
    })

    const { user } = await sut.execute({ userId: createdUser.id })

    expect(user).toEqual(createdUser)
  })

  it('should not be able to get user profile with wrong id', async () => {
    expect(async () => {
      await sut.execute({ userId: 'non-existing-id' })
    }).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
