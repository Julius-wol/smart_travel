export const localDate = (value = new Date()) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const defaultStayDates = () => {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { checkIn: localDate(start), checkOut: localDate(end), nights: 1 };
};
