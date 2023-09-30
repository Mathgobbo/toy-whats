import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { User } from "../types/User";

import * as AuthService from "../service/auth";

interface IAuthContext {
  user?: User;
  isLoggedIn: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, phone: string) => Promise<void>;
}

export const AuthContext = createContext<IAuthContext>({} as IAuthContext);

interface IProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: IProps) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const signIn = useCallback(async (username: string, password: string) => {
    const response = await AuthService.signIn(username, password);
    setUser(response);
    setIsLoggedIn(true);
  }, []);

  const signUp = useCallback(
    async (username: string, password: string, phone: string) => {
      const response = await AuthService.signUp(username, password, phone);
      setUser(response);
      setIsLoggedIn(true);
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
