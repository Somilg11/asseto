import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  let isLoggedIn = false;
  try {
    const user = await getCurrentUser();
    if (user && user.id) isLoggedIn = true;
  } catch {
    isLoggedIn = false;
  }

  return (
    <main className="min-h-screen bg-[#18181B] flex flex-col items-center justify-center px-4 py-8">
      {/* Branding grid and logo */}
      <section className="w-full max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="flex items-center gap-4 mt-6">
              <div className="bg-[#D6FF3D] rounded-2xl p-4 flex items-center justify-center" style={{width: 80, height: 80}}>
                {/* asseto logo: Inbox icon from lucide-react */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="24" height="24" rx="6" fill="#D6FF3D"/>
                  <path d="M4 13V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6m-16 0v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-16 0h4l2 3h4l2-3h4" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-5xl font-extrabold text-white" style={{fontFamily: 'Geist, Inter, Arial, sans-serif'}}>asseto</span>
            </div>
          </div>
        </div>
        {/* Perfect dotted grid lines */}
        <div className="w-full h-24 mb-8 relative">
          <svg width="100%" height="100%" viewBox="0 0 800 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-0 w-full h-full">
            {/* Horizontal dotted lines */}
            <line x1="0" y1="24" x2="800" y2="24" stroke="#444" strokeDasharray="6 6" strokeWidth="2" />
            <line x1="0" y1="48" x2="800" y2="48" stroke="#444" strokeDasharray="6 6" strokeWidth="2" />
            <line x1="0" y1="72" x2="800" y2="72" stroke="#444" strokeDasharray="6 6" strokeWidth="2" />
            {/* Vertical dotted lines */}
            <line x1="160" y1="0" x2="160" y2="96" stroke="#444" strokeDasharray="6 6" strokeWidth="2" />
            <line x1="320" y1="0" x2="320" y2="96" stroke="#444" strokeDasharray="6 6" strokeWidth="2" />
            <line x1="480" y1="0" x2="480" y2="96" stroke="#444" strokeDasharray="6 6" strokeWidth="2" />
            <line x1="640" y1="0" x2="640" y2="96" stroke="#444" strokeDasharray="6 6" strokeWidth="2" />
          </svg>
        </div>
        {/* 3 bento grid blocks below logo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Block 1: Logo on white card */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4 justify-center">
            <div className="bg-[#18181B] rounded-2xl p-2 flex items-center justify-center" style={{width: 48, height: 48}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="24" height="24" rx="6" fill="#D6FF3D"/>
                <path d="M4 13V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6m-16 0v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-16 0h4l2 3h4l2-3h4" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-3xl font-extrabold text-[#18181B]" style={{fontFamily: 'Geist, Inter, Arial, sans-serif'}}>asseto</span>
          </div>
          {/* Block 2: Inventory management theme + Get Started button */}
          <div className="bg-gradient-to-tr from-yellow-300 via-yellow-400 to-yellow-500 rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-gray-900 mb-2">Inventory Management</span>
            <span className="text-sm text-gray-800 mb-4">Track, organize, and optimize your stock with asseto.</span>
            <Link href={isLoggedIn ? "/dashboard" : "/sign-in"}>
              <button className="bg-white text-black px-6 py-3 rounded-xl text-lg font-bold shadow hover:bg-gray-100 transition-all duration-150 mt-2">
                Get Started
              </button>
            </Link>
          </div>
          {/* Block 3: Shipping theme */}
          <div className="bg-gradient-to-tr from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-white mb-2">Safely Shipped Your Goods</span>
            <span className="text-sm text-blue-100">Efficient logistics and secure delivery, powered by asseto.</span>
          </div>
        </div>
      </section>
      <footer className="mt-16 text-xs text-gray-500 text-center opacity-80">
        &copy; {new Date().getFullYear()} asseto. All rights reserved.
      </footer>
    </main>
  );
}
