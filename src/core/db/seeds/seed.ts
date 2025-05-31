import { DataSource } from 'typeorm';
import { userSeeds } from './entities/user.seed';

export async function runSeeds(dataSource: DataSource): Promise<void> {
  console.log('Запуск сидов...');

  try {
    await userSeeds(dataSource);

    console.log('Сиды успешно выполнены.');
  } catch (error) {
    console.error('Ошибка при выполнении сидов:', error);
    throw error;
  }
}
