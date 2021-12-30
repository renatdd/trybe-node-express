module.exports = () => {
  const date = new Date();
  const day = date.getDay().toString().padStart(2, '0');
  const month = date.getMonth().toString().padStart(2, '0');
  const year = date.getFullYear();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${day}-${month}-${year} ${hour}:${minutes}:${seconds}`;
};
