/**
 * Преобразует значения в объекте в соответствующие типы данных
 *
 * Преобразует:
 * - Строки "true" и "false" в булевы значения
 * - Строки "null" и "undefined" в соответствующие значения
 * - Числовые строки в числа
 * - Строки с датами в объекты Date
 * - Рекурсивно обрабатывает вложенные объекты
 *
 * @param obj Объект для преобразования
 * @returns Преобразованный объект
 */
export function convertDeepPartial(
  obj?: Record<string, any>,
): Record<string, any> | undefined {
  if (!obj) return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return [key, convertDeepPartial(value)];
      }

      if (typeof value === 'string') {
        if (value === 'true') {
          return [key, true];
        }

        if (value === 'false') {
          return [key, false];
        }

        if (value === 'null') {
          return [key, null];
        }

        if (value === 'undefined') {
          return [key, undefined];
        }

        if (!isNaN(Number(value)) && value.trim() !== '') {
          return [key, Number(value)];
        }

        const dateValue = new Date(value);
        if (value.match(/^\d{4}-\d{2}-\d{2}/) && !isNaN(dateValue.getTime())) {
          return [key, dateValue];
        }
      }

      return [key, value];
    }),
  );
}
