export const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Функція ще не реалізована' });
};
