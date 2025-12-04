export const formatDate = (value: string | Date) => {
  // console.log("formatDate", value);
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString();
};
