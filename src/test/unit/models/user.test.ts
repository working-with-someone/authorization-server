import prismaClient from './client';
import { prismaMock } from './singleton';

test('expect create new user', async () => {
  const newUser = {
    id: 1,
    username: 'seungho-hub',
    pfp: 'https://www.google.com/favicon.ico',
    created_at: new Date(),
    updated_at: new Date(),
  };

  prismaMock.user.create.mockResolvedValue(newUser);

  await expect(prismaClient.user.create({ data: newUser })).resolves.toEqual(
    newUser
  );
});
