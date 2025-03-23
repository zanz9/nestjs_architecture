export function convertDeepPartial(obj?: Record<string, any>) {
  if (!obj) return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return [key, convertDeepPartial(value)];
      }

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

      return [key, value];
    }),
  );
}
