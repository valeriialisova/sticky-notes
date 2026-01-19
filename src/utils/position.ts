export const isOverElement = (
  x: number,
  y: number,
  element: HTMLElement | null
) => {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};
