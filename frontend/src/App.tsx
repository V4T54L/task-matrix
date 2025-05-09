import { BrowserRouter, Route, Routes } from "react-router-dom"
import AuthLayout from "./components/AuthLayout"
import Signup from "./components/forms/Signup"
import Login from "./components/forms/Login"
import NotFoundPage from "./pages/NotFoundPage"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth" element={<AuthLayout />}>
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App