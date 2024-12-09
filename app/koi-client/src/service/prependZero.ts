const prependZero = (num: number, length: number): string => {
  return String(num).padStart(length, '0');
};

export default prependZero;
