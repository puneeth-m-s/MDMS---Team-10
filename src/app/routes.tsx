import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Dashboard from '../features/end-user/pages/Dashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [{ index: true, element: <Dashboard /> }],
  },
])
