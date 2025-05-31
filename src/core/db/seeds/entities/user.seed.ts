import { UserRoles } from '../../enum/user_roles.enum';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import * as bcrypt from 'bcryptjs';

export async function userSeeds(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(UserEntity);

  // Проверяем, есть ли уже пользователи в базе
  const existingUsersCount = await userRepository.count();
  if (existingUsersCount > 0) {
    console.log(
      'Пользователи уже существуют в базе. Пропускаю сиды пользователей.',
    );
    return;
  }

  const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  };

  // Создаем базовых пользователей
  const users: Partial<UserEntity>[] = [
    {
      email: 'admin@shoply.ru',
      password: await hashPassword('admin123'),
      role: UserRoles.ADMIN,
    },
    {
      email: 'user@shoply.ru',
      password: await hashPassword('user123'),
      role: UserRoles.USER,
    },
  ];

  // Сохраняем пользователей
  for (const userData of users) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
  }

  console.log(`Создано ${users.length} пользователей`);
}
