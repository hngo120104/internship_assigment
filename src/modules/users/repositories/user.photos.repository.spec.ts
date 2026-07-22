import { UserPhotosRepository } from './user.photos.repository';
import { UserPhoto } from '../entities/photo.entity';

describe('UserPhotosRepository', () => {
  it('associates inserted photos with the user via both the foreign key and relation', async () => {
    const save = jest.fn().mockResolvedValue([]);
    const repo = new UserPhotosRepository({
      target: UserPhoto,
      manager: {},
      queryRunner: undefined,
      save,
    } as any);

    await repo.insertPhotosIntoUser(7, [
      { url: 'https://img.test/a.jpg', type: 'avatar' } as any,
    ]);

    expect(save).toHaveBeenCalledWith([
      expect.objectContaining({
        url: 'https://img.test/a.jpg',
        type: 'avatar',
        userId: 7,
        user: { id: 7 },
      }),
    ]);
  });
});
