import { AuthContextProvider } from "./context/AuthContext";
import { MainRoutes } from "./routes";

function App() {
  return (
    <AuthContextProvider>
      <MainRoutes />
    </AuthContextProvider>
  );
}

export default App;
