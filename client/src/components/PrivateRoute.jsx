export const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  console.log('PrivateRoute check, token:', !!token);
  return token ? children : <Navigate to="/login" />;
};