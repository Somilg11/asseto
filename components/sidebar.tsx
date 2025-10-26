"use client"

import { useState } from 'react'
import { UserButton } from '@stackframe/stack'
import { BarChart3, Inbox, Package, Plus, Settings, Menu, X } from 'lucide-react'
import Link from 'next/link'

const Sidebar = ({currentPath = "/dashboard"}: {currentPath: string}) => {
    const [open, setOpen] = useState(false)

    const navigation = [
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { name: 'Inventory', path: '/inventory', icon: Package },
        { name: 'Add Product', path: '/add-product', icon: Plus },
        { name: 'Settings', path: '/settings', icon: Settings },
    ]

    return (
        <>
            {/* Mobile hamburger */}
            <button
                aria-label='Open menu'
                onClick={() => setOpen(true)}
                className='md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-zinc-900 text-white shadow'
            >
                <Menu size={20} />
            </button>

            {/* Desktop sidebar (hidden on small screens) */}
            <aside className='hidden md:block fixed left-0 top-0 w-64 min-h-screen p-6 z-10 bg-[#18181B]'>
                <div className='mb-8'>
                    <div className='flex items-center space-x-3 mb-4'>
                        <div className='bg-[#D6FF3D] rounded-2xl p-2 flex items-center justify-center' style={{width: 40, height: 40}}>
                            <Inbox className='text-[#18181B]' size={24} />
                        </div>
                        <span>
                            <h1 className='text-white text-3xl font-extrabold tracking-tight' style={{fontFamily: 'Geist, Inter, Arial, sans-serif'}}>asseto</h1>
                        </span>
                    </div>
                </div>

                <nav className='space-y-1'>
                    <div className='text-xs font-semibold text-gray-400 uppercase'>
                        Inventory
                    </div>
                                {navigation.map((item) => {
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.path}
                                            className={`flex items-center p-2 text-sm font-medium rounded-md ${item.path === currentPath ? 'bg-zinc-800 text-white' : 'text-gray-300 hover:bg-zinc-800'}`}
                                        >
                                            <item.icon className='w-5 h-5 mr-2' />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                </nav>
                <div className='absolute bottom-0 left-0 right-0 p-6 border-t border-zinc-700'>
                    <div className='flex items-center justify-center'>
                        <UserButton showUserInfo/>
                    </div>
                </div>
            </aside>

            {/* Mobile drawer overlay */}
            <div className={`fixed inset-0 z-30 transition-opacity ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
                <div
                    onClick={() => setOpen(false)}
                    className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
                />

                <aside className={`fixed left-0 top-0 w-64 min-h-screen p-6 bg-[#18181B] transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`} role='dialog' aria-modal='true'>
                        <div className='flex items-center justify-between mb-6 mt-8'>
                            <div className='flex items-center space-x-3'>
                                <div className='bg-[#D6FF3D] rounded-2xl p-2 flex items-center justify-center' style={{width: 40, height: 40}}>
                                    <Inbox className='text-[#18181B]' size={24} />
                                </div>
                                <h1 className='text-white text-2xl font-extrabold tracking-tight' style={{fontFamily: 'Geist, Inter, Arial, sans-serif'}}>asseto</h1>
                            </div>
                            <button aria-label='Close menu' onClick={() => setOpen(false)} className='p-1 rounded-md text-gray-300 hover:text-white'>
                                <X size={18} />
                            </button>
                        </div>

                    <nav className='space-y-1'>
                        <div className='text-xs font-semibold text-gray-400 uppercase'>
                            Inventory
                        </div>
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.path}
                                            onClick={() => setOpen(false)}
                                            className={`flex items-center p-2 text-sm font-medium rounded-md ${item.path === currentPath ? 'bg-zinc-800 text-white' : 'text-gray-300 hover:bg-zinc-800'}`}
                                        >
                                            <item.icon className='w-5 h-5 mr-2' />
                                            {item.name}
                                        </Link>
                                    ))}
                    </nav>

                    <div className='absolute bottom-0 left-0 right-0 p-6 border-t border-zinc-700'>
                        <div className='flex items-center justify-center'>
                            <UserButton showUserInfo/>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    )
}

export default Sidebar