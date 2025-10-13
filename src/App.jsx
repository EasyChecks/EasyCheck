import React from 'react'
import 'cally'
import Button from './components/ui/button'
import Auth from './pages/Auth/Auth'
import { Calendar } from "./components/ui/calendar"
import Nav from './components/user/nav/Nav'

function App() {
  return (
    <>
      <div>
          <Auth />
      </div>
      <div>
          <Nav />
      </div>
    </>
  )
}

export default App