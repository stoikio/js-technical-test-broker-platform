/** Joins the class names that are strings, skipping `false`, `null` and `undefined`. */
export const cx = (...names: (string | false | null | undefined)[]) =>
  names
    .filter((name): name is string => typeof name === 'string' && name.length > 0)
    .join(' ');
