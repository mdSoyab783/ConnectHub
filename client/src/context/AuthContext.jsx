import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  // =========================================
  // LOGIN
  // =========================================

  const login = (userData, jwtToken) => {

    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "token",
      jwtToken
    );
  };


  // =========================================
  // UPDATE USER
  // =========================================

  const updateUser = (updatedUser) => {

    setUser((currentUser) => {

      const newUser = {
        ...currentUser,
        ...updatedUser,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(newUser)
      );

      return newUser;
    });
  };


  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {

    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () =>
  useContext(AuthContext);