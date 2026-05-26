export const today = () => {
  const d = new Date();

  d.setMinutes(
    d.getMinutes() - d.getTimezoneOffset()
  );

  return d.toISOString().split('T')[0];
};
export const yesterday = () => {
  const d = new Date();

  d.setDate(d.getDate() - 1);

  d.setMinutes(
    d.getMinutes() - d.getTimezoneOffset()
  );

  return d.toISOString().split('T')[0];
};
export const tomorrow = () => {
  const d = new Date();

  d.setDate(d.getDate() + 1);

  d.setMinutes(
    d.getMinutes() - d.getTimezoneOffset()
  );

  return d.toISOString().split('T')[0];
};

export const scrollToView = (id: string) => {
  const el = document.getElementById(id);

  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};