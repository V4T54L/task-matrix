import { BrowserRouter, Route, Routes } from "react-router-dom"
import AuthLayout from "./components/AuthLayout"
import Signup from "./components/forms/Signup"
import Login from "./components/forms/Login"
import NotFoundPage from "./pages/NotFoundPage"
import Dashboard from "./pages/Dashboard"
import Layout from "./components/Layout"
import Projects from "./pages/Projects"
import KanbanBoard from "./components/KanbanBoard"

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
          <Route path="test" element={<KanbanBoard />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App