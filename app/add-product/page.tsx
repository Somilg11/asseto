"use server";
import React from "react";
import Sidebar from '@/components/sidebar'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addProduct, updateProduct } from '@/lib/actions/products'

export default async function AddProductPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> | Record<string, string | undefined> }) {
    const resolved = searchParams ? await searchParams : {};
    const editId = String(resolved?.edit ?? '').trim();
    const user = await getCurrentUser();

    let product: { id: string; name: string; sku?: string | null; price: string | number; quantity: number; lowStockAt?: number | null; userId?: string } | null = null;
    if (editId) {
        const p = await prisma.product.findUnique({ where: { id: editId } });
        if (p && p.userId === user.id) {
            product = {
                id: p.id,
                name: p.name,
                sku: p.sku,
                price: String(p.price),
                quantity: p.quantity,
                lowStockAt: p.lowStockAt ?? null,
                userId: p.userId,
            };
        }
    }

    return (
        <div className='min-h-screen bg-[#18181B] text-white'>
            <Sidebar currentPath="/add-product" />

            <main className='md:ml-64 p-4 md:p-8 pt-16 md:pt-8 font-sans'>
                <div className='max-w-3xl mx-auto'>
                    <h1 className='text-4xl font-extrabold text-white tracking-tight mb-2' style={{fontFamily: 'Geist, Inter, Arial, sans-serif'}}>{product ? 'Edit Product' : 'Add Product'}</h1>
                    <p className='text-lg text-gray-300 mb-6'>{product ? 'Update product details.' : 'Create a new product.'}</p>

                    <div className='bg-zinc-900 rounded-2xl shadow p-6 border border-gray-800'>
                        <form action={product ? updateProduct : addProduct} className='space-y-6'>
                            {product && <input type='hidden' name='productId' value={product.id} />}

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-sm text-gray-200 mb-1'>Name</label>
                                    <input name='name' defaultValue={product?.name ?? ''} required className='w-full px-4 py-3 rounded-xl bg-black/20 border border-gray-800 text-white font-semibold' />
                                </div>

                                <div>
                                    <label className='block text-sm text-gray-200 mb-1'>SKU</label>
                                    <input name='sku' defaultValue={product?.sku ?? ''} className='w-full px-4 py-3 rounded-xl bg-black/20 border border-gray-800 text-white font-semibold' />
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                                <div>
                                    <label className='block text-sm text-gray-200 mb-1'>Price (e.g. 10.00)</label>
                                    <input name='price' defaultValue={product?.price ? String(product.price) : ''} required className='w-full px-4 py-3 rounded-xl bg-black/20 border border-gray-800 text-white font-semibold' />
                                </div>
                                <div>
                                    <label className='block text-sm text-gray-200 mb-1'>Quantity</label>
                                    <input name='quantity' type='number' defaultValue={product?.quantity ?? 0} required className='w-full px-4 py-3 rounded-xl bg-black/20 border border-gray-800 text-white font-semibold' />
                                </div>
                                <div>
                                    <label className='block text-sm text-gray-200 mb-1'>Low stock at</label>
                                    <input name='lowStockAt' type='number' defaultValue={product?.lowStockAt ?? ''} className='w-full px-4 py-3 rounded-xl bg-black/20 border border-gray-800 text-white font-semibold' />
                                </div>
                            </div>

                            <div className='flex items-center gap-4 mt-4'>
                                <button type='submit' className='px-6 py-3 rounded-xl bg-[#D6FF3D] text-[#18181B] font-bold shadow hover:bg-yellow-300 transition-all duration-150'>{product ? 'Update Product' : 'Create Product'}</button>
                                <a href='/inventory' className='text-sm text-gray-400 font-semibold'>Cancel</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
