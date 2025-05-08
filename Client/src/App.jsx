import React from 'react'
import Signup from './components/Signup'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import Login from './components/Login'

function App() {
  const myRoutes=createBrowserRouter([
    {
      path:'/',
      element:<Signup/>
    },
    {
      path:'/login',
      element:<Login/>
    }
  ])
  return (
    <>
    <RouterProvider router={myRoutes}/>
    </>
  )
}

export default App