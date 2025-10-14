import React from 'react'
import 'cally'
import Button from './components/ui/button'
import { Calendar } from "./components/ui/calendar"
import Nav from './components/user/nav/Nav'
import Auth from './pages/Auth/Auth'

function App() {
  return (
    <>
      <div>
        <Auth />
        <Nav />
      </div>
    </>
  )
}

export default App;