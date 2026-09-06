import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // ==============================
  // USER
  // ==============================

  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  // ==============================
  // TOKEN
  // ==============================

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // ==============================
  // LOGIN
  // ==============================

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

  // ==============================
  // UPDATE USER
  // ==============================

  const updateUser = (updatedData) => {

    setUser((currentUser) => {

      if (!currentUser) {
        return updatedData;
      }

      const updatedUser = {
        ...currentUser,
        ...updatedData,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  // ==============================
  // LOGOUT
  // ==============================

  const logout = () => {

    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ==============================
  // PROVIDER
  // ==============================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        updateUser,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==============================
// HOOK
// ==============================

export const useAuth = () =>
  useContext(AuthContext);