/**
 * Layout — enveloppe principale avec sidebar
 */

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-night">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Top gradient glow */}
        <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-indigo/5 to-transparent z-0" />
        <div className="relative z-10 p-4 lg:p-6 xl:p-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
