const userService = require('../services/UserService');

describe('UserService', () => {
  test('пункт 11 ТЗ: регистрация нового пользователя', async () => {
    const user = await userService.register({
      name: 'Тестовый',
      email: `test_${Date.now()}@test.ru`,
      password: '123456'
    });
    expect(user).toHaveProperty('id');
    expect(user.role).toBe('user');
    expect(user.is_buyer).toBe(true);
  });

  test('пункт 11 ТЗ: регистрация с уже существующим email вызывает ошибку', async () => {
    await expect(userService.register({
      name: 'Дубль',
      email: 'admin@lotbidgo.ru',
      password: '123456'
    })).rejects.toThrow('уже существует');
  });
});
