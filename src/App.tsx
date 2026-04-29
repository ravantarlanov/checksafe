import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { routes } from './lib/routes'
import { Home } from './pages/Home'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path={routes.home} element={<Home />} />
      </Routes>
    </AppShell>
  )
}

export default App
