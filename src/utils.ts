export function hash(s: string) {
  return Math.abs(
    s.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0)
  );
}
