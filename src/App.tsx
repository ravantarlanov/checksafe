import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import ScrollToTop from './components/ScrollToTop'
import { routes } from './lib/routes'
import { CheckIMEI } from './pages/CheckIMEI'
import { Home } from './pages/Home'
import { LiveCall } from './pages/LiveCall'
import { LiveChat } from './pages/LiveChat'

function App() {
  return (
    <AppShell>
      <ScrollToTop />
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.check} element={<CheckIMEI />} />
        <Route path={routes.chat} element={<LiveChat />} />
        <Route path={routes.call} element={<LiveCall />} />
      </Routes>
    </AppShell>
  )
}

export default App
