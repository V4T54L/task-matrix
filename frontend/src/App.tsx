import { BrowserRouter, Route, Routes } from "react-router-dom"
import AuthLayout from "./components/AuthLayout"
import Signup from "./components/forms/Signup"
import Login from "./components/forms/Login"
import NotFoundPage from "./pages/NotFoundPage"
import Dashboard from "./pages/Dashboard"
import Layout from "./components/Layout"
import Sidebar from "./components/Sidebar"
import Projects from "./pages/Projects"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth" element={<AuthLayout />}>
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="" element={<Layout />}>
          <Route path="" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
        </Route>
        <Route path="test" element={<Sidebar>
          <h1 className="text-3xl font-semibold">Children component</h1>
        </Sidebar>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App