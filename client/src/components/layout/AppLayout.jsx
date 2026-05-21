import { Outlet } from 'react-router-dom'
import BottomNav from '@/components/ui/BottomNav'

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen relative bg-void text-primary">
      {/* 
        BottomNav renders:
        - Mobile: fixed bottom nav
        - Desktop (md+): fixed left sidebar (width: 240px)
      */}
      <BottomNav />
      
      {/* 
        Main content wrapper.
        - Desktop: offset by sidebar width (ml-[240px])
        - Mobile: safe bottom padding for bottom nav
      */}
      <main className="flex-1 md:ml-[240px] min-h-screen">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
