"use server";
import React from 'react';
import Sidebar from '@/components/sidebar'
import fs from 'fs';
import Link from 'next/link'
import path from 'path';
import { saveSettings } from '@/lib/actions/settings'

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

async function readSettings() {
    try {
        const raw = await fs.promises.readFile(SETTINGS_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> | Record<string, string | undefined> }) {
    const resolved = searchParams ? await searchParams : {};
    const saved = resolved?.saved === '1';

    const settings = await readSettings();
    const defaults = {
        companyName: settings?.companyName ?? '',
        currency: settings?.currency ?? 'USD',
        defaultLowStockThreshold: settings?.defaultLowStockThreshold ?? 5,
        itemsPerPage: settings?.itemsPerPage ?? 20,
        notifyEmail: settings?.notifyEmail ?? '',
        timezone: settings?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    return (
        <div className='min-h-screen bg-[#18181B] text-white'>
            <Sidebar currentPath="/settings" />

            <main className='md:ml-64 p-4 md:p-8 pt-16 md:pt-8 font-sans'>
                <div className='max-w-3xl mx-auto'>
                    <h1 className='text-4xl font-extrabold text-white tracking-tight mb-2' style={{fontFamily: 'Geist, Inter, Arial, sans-serif'}}>Settings</h1>
                    <p className='text-lg text-gray-300 mb-6'>Configure application settings</p>

                    {saved && <div className='mb-4 p-3 rounded-xl bg-emerald-700/20 text-emerald-300 font-semibold'>Settings saved.</div>}

                    <div className='bg-zinc-900 rounded-2xl shadow p-6 border border-gray-800'>
                        <form action={saveSettings} className='space-y-6'>
                            <div>
                                <label className='block text-sm text-gray-200 mb-1'>Company name *</label>
                                <input name='companyName' defaultValue={defaults.companyName} required className='w-full px-4 py-3 rounded-xl bg-black/20 border border-gray-800 text-white font-semibold' />
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-sm text-gray-200 mb-1'>Currency *</label>
                                    <select name='currency' defaultValue={defaults.currency} className='w-full px-4 py-3 rounded-xl bg-black/20 border border-gray-800 text-white font-semibold'>
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>INR</option>
                                        <option>GBP</option>
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-sm text-gray-300 mb-1'>Timezone</label>
                                    <input name='timezone' defaultValue={defaults.timezone} className='w-full px-3 py-2 rounded-md bg-black/20 border border-gray-800 text-white' />
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-sm text-gray-300 mb-1'>Default low stock threshold</label>
                                    <input name='defaultLowStockThreshold' type='number' defaultValue={defaults.defaultLowStockThreshold} className='w-full px-3 py-2 rounded-md bg-black/20 border border-gray-800 text-white' />
                                </div>
                                <div>
                                    <label className='block text-sm text-gray-300 mb-1'>Items per page</label>
                                    <input name='itemsPerPage' type='number' defaultValue={defaults.itemsPerPage} className='w-full px-3 py-2 rounded-md bg-black/20 border border-gray-800 text-white' />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm text-gray-300 mb-1'>Notification email</label>
                                <input name='notifyEmail' type='email' defaultValue={defaults.notifyEmail} className='w-full px-3 py-2 rounded-md bg-black/20 border border-gray-800 text-white' />
                            </div>

                            <div className='flex items-center gap-3'>
                                <button type='submit' className='px-4 py-2 rounded-md bg-emerald-500 text-black font-semibold'>Save settings</button>
                                <Link href='/' className='text-sm text-gray-300'>Cancel</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
