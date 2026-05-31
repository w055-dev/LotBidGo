class BaseService {
  validateRequired(data, fields) {
    for (const field of fields) {
      if (!data[field]) {
        throw new Error(`Поле "${field}" обязательно для заполнения`);
      }
    }
  }

  validatePositive(value, fieldName) {
    if (value <= 0) {
      throw new Error(`Поле "${fieldName}" должно быть положительным числом`);
    }
  }

  notFound(entity) {
    throw new Error(`${entity} не найден`);
  }
}

module.exports = BaseService;