const pick = (object: Record<string, any>, keys: string[]) => {
  const result: Record<string, any> = {};
  for (const key of keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
};

export default pick;
