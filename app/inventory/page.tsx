"use server";
import Sidebar from '@/components/sidebar'
import React from 'react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { deleteProduct } from '@/lib/actions/products'
import { readCurrencyCode, currencySymbol } from '@/lib/utils/currency'

type ProductRow = {
    id: string;
    name: string;
    sku?: string | null;
    price: string | number;
    quantity: number;
    lowStockAt?: number | null;
    createdAt: string;
};

function formatCurrencyWithSymbol(v: unknown, symbol: string) {
    const n = Number(String(v));
    if (Number.isNaN(n)) return String(v);
    // Use Intl.NumberFormat to format number and then prefix with symbol when appropriate
    const formatted = n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${symbol}${formatted}`;
}

export default async function InventoryPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> | Record<string, string | undefined> }) {
    // `searchParams` can be a Promise in Next.js route handlers — await it safely.
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const q = String(resolvedSearchParams?.q ?? '').trim();
    // Ensure the user is signed in and filter products by user
    const user = await getCurrentUser();

    // support search by name or sku (case-insensitive)
    const where = q
        ? {
              userId: user.id,
              OR: [
                  { name: { contains: q, mode: 'insensitive' as const } },
                  { sku: { contains: q, mode: 'insensitive' as const } },
              ],
          }
        : { userId: user.id };

    // pagination params from searchParams
    const pageParam = resolvedSearchParams?.page ?? undefined;
    const pageSizeParam = resolvedSearchParams?.pageSize ?? undefined;
    const page = Math.max(1, Number(String(pageParam ?? '1')) || 1);
    const pageSize = Math.min(100, Math.max(5, Number(String(pageSizeParam ?? '20')) || 20));
    const skip = (page - 1) * pageSize;

    // total count and aggregates
    const totalCount = await prisma.product.count({ where });
    const agg = await prisma.product.aggregate({ where, _sum: { quantity: true } });
    const totalQuantity = agg._sum?.quantity ?? 0;

    // compute low stock count by scanning relevant products (we select small fields)
    const lowStockRows = await prisma.product.findMany({ where, select: { id: true, quantity: true, lowStockAt: true } });
    const lowStockCount = lowStockRows.filter((r) => r.lowStockAt !== null && r.quantity <= (r.lowStockAt ?? 0)).length;

    // fetch paginated page of products
    const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize });

    const productRows: ProductRow[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: String(p.price),
        quantity: p.quantity,
        lowStockAt: p.lowStockAt ?? null,
        createdAt: p.createdAt.toISOString(),
    }));

    // read currency for display
    const currencyCode = await readCurrencyCode();
    const currencySym = currencySymbol(currencyCode);

    return (
        <div className='min-h-screen bg-[#18181B] text-white'>
            <Sidebar currentPath="/inventory" />

            <main className='md:ml-64 p-4 md:p-8 pt-16 md:pt-8 font-sans'>
                <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div>
                        <h1 className='text-4xl font-extrabold text-white tracking-tight' style={{fontFamily: 'Geist, Inter, Arial, sans-serif'}}>Inventory</h1>
                        <p className='text-lg text-gray-300 mt-2'>Manage your product inventory and stock levels.</p>
                    </div>
                    <div className='flex gap-3 items-center'>
                        <form method='get' className='flex items-center gap-2'>
                            <input name='q' defaultValue={q} placeholder='Search by name or SKU' className='rounded-md bg-zinc-900 px-3 py-2 text-sm text-gray-200 border border-gray-800' />
                            <button type='submit' className='px-3 py-2 rounded-md bg-white/6 hover:bg-white/10 text-sm'>Search</button>
                        </form>
                        <a href='/add-product' className='inline-block bg-white text-black px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-gray-100 transition-all duration-150'>Add product</a>
                    </div>
                </div>

                {/* summary cards - bento style */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                    <div className='bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center text-center'>
                        <div className='text-3xl font-extrabold text-[#18181B]'>{totalCount}</div>
                        <div className='text-lg text-gray-700 font-semibold mt-2'>Total Products</div>
                        <div className='text-xs text-gray-500 mt-1'>Showing {(totalCount === 0) ? 0 : skip + 1}–{Math.min(totalCount, skip + productRows.length)}</div>
                    </div>
                    <div className='bg-gradient-to-tr from-yellow-300 via-yellow-400 to-yellow-500 rounded-2xl shadow p-6 flex flex-col items-center justify-center text-center'>
                        <div className='text-3xl font-extrabold text-gray-900'>{totalQuantity}</div>
                        <div className='text-lg text-gray-800 font-semibold mt-2'>Total Quantity</div>
                    </div>
                    <div className='bg-gradient-to-tr from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow p-6 flex flex-col items-center justify-center text-center'>
                        <div className='text-3xl font-extrabold text-white'>{lowStockCount}</div>
                        <div className='text-lg text-blue-100 font-semibold mt-2'>Low Stock Items</div>
                    </div>
                </div>

                {/* pagination controls */}
                <div className='flex items-center justify-between mb-4'>
                    <div className='text-sm text-gray-400'>
                        Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
                    </div>
                    <div className='flex items-center gap-2'>
                        {/* Page size selector - submits a GET form */}
                        <form method='get' className='flex items-center gap-2'>
                            <input type='hidden' name='q' value={q} />
                            <label className='text-xs text-gray-400'>Per page</label>
                            <select name='pageSize' defaultValue={String(pageSize)} className='bg-zinc-900 text-sm rounded-md px-2 py-1 border border-gray-800'>
                                <option value='5'>5</option>
                                <option value='10'>10</option>
                                <option value='20'>20</option>
                                <option value='50'>50</option>
                            </select>
                            <button type='submit' className='px-2 py-1 rounded-md bg-white/6 hover:bg-white/10 text-sm'>Apply</button>
                        </form>
                        <nav className='flex items-center gap-1'>
                            {/* Prev */}
                            <a href={`?q=${encodeURIComponent(q)}&page=${Math.max(1, page - 1)}&pageSize=${pageSize}`} className={`px-2 py-1 rounded-md ${page === 1 ? 'opacity-40 pointer-events-none' : 'bg-white/6 hover:bg-white/10'}`}>Prev</a>
                            {/* simple page numbers: show up to 5 pages around current */}
                            {(() => {
                                const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
                                const pages: number[] = [];
                                const start = Math.max(1, page - 2);
                                const end = Math.min(totalPages, page + 2);
                                for (let i = start; i <= end; i++) pages.push(i);
                                return pages.map((pnum) => (
                                    <a key={pnum} href={`?q=${encodeURIComponent(q)}&page=${pnum}&pageSize=${pageSize}`} className={`px-2 py-1 rounded-md ${pnum === page ? 'bg-white/10 font-semibold' : 'bg-white/6 hover:bg-white/10'}`}>{pnum}</a>
                                ));
                            })()}
                            {/* Next */}
                            <a href={`?q=${encodeURIComponent(q)}&page=${Math.min(Math.max(1, Math.ceil(totalCount / pageSize)), page + 1)}&pageSize=${pageSize}`} className={`px-2 py-1 rounded-md ${page >= Math.ceil(totalCount / pageSize) ? 'opacity-40 pointer-events-none' : 'bg-white/6 hover:bg-white/10'}`}>Next</a>
                        </nav>
                    </div>
                </div>

                <div className='space-y-6'>
                    {/* desktop/table view */}
                    <div className='hidden md:block rounded-lg border border-gray-800 overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='w-full min-w-[720px] table-auto'>
                                <thead className='bg-zinc-900'>
                                    <tr>
                                        <th className='p-3 text-left text-sm font-semibold text-gray-300'>Name</th>
                                        <th className='p-3 text-left text-sm font-semibold text-gray-300'>SKU</th>
                                        <th className='p-3 text-left text-sm font-semibold text-gray-300'>Price</th>
                                        <th className='p-3 text-left text-sm font-semibold text-gray-300'>Quantity</th>
                                        <th className='p-3 text-left text-sm font-semibold text-gray-300'>Low stock at</th>
                                        <th className='p-3 text-left text-sm font-semibold text-gray-300'>Added</th>
                                        <th className='p-3 text-left text-sm font-semibold text-gray-300'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-900'>
                                    {productRows.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className='p-6 text-center text-gray-400'>No products yet. Add your first product.</td>
                                        </tr>
                                    )}

                                    {productRows.map((p) => {
                                        const isLow = p.lowStockAt !== null && p.quantity <= (p.lowStockAt ?? 0);
                                        return (
                                            <tr key={p.id} className='hover:bg-white/2'>
                                                <td className='p-3'>
                                                    <div className='font-medium'>{p.name}</div>
                                                    <div className='text-xs text-gray-500'>{/* small description placeholder */}</div>
                                                </td>
                                                <td className='p-3 text-sm text-gray-300'>{p.sku ?? '—'}</td>
                                                <td className='p-3 text-sm text-gray-200'>{formatCurrencyWithSymbol(p.price, currencySym)}</td>
                                                <td className='p-3 text-sm'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='text-sm'>{p.quantity}</div>
                                                        <div className='w-28 bg-white/6 rounded-full h-2 overflow-hidden'>
                                                            <div
                                                                className={`h-2 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-400'}`}
                                                                style={{ width: `${Math.min(100, p.lowStockAt ? (p.quantity / Math.max(1, p.lowStockAt)) * 100 : (p.quantity > 100 ? 100 : p.quantity))}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`p-3 text-sm ${isLow ? 'text-rose-300' : 'text-gray-300'}`}>{p.lowStockAt ?? '—'}</td>
                                                <td className='p-3 text-sm text-gray-400'>{new Date(p.createdAt).toLocaleDateString()}</td>
                                                <td className='p-3 text-sm'>
                                                    <div className='flex gap-2'>
                                                        <a href={`/add-product?edit=${p.id}`} className='px-3 py-1 text-sm rounded-md bg-white/6 hover:bg-white/10'>Edit</a>
                                                        <form action={deleteProduct}>
                                                            <input type='hidden' name='productId' value={p.id} />
                                                            <button type='submit' className='px-3 py-1 text-sm rounded-md bg-white/6 hover:bg-white/10'>Delete</button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* mobile card view */}
                    <div className='md:hidden space-y-3'>
                        {productRows.length === 0 && (
                            <div className='p-4 bg-zinc-900 rounded-md text-gray-400'>No products yet. Add your first product.</div>
                        )}
                        {productRows.map((p) => {
                            const isLow = p.lowStockAt !== null && p.quantity <= (p.lowStockAt ?? 0);
                            return (
                                <div key={p.id} className='bg-zinc-900 border border-gray-800 rounded-lg p-4'>
                                    <div className='flex items-start justify-between'>
                                        <div>
                                            <div className='font-semibold'>{p.name}</div>
                                            <div className='text-xs text-gray-400'>{p.sku ?? '—'}</div>
                                        </div>
                                        <div className='text-right'>
                                            <div className='text-sm text-gray-200'>{formatCurrencyWithSymbol(p.price, currencySym)}</div>
                                            <div className={`text-xs mt-1 ${isLow ? 'text-rose-300' : 'text-gray-400'}`}>Qty: {p.quantity}</div>
                                        </div>
                                    </div>

                                    <div className='mt-3 flex items-center justify-between gap-3'>
                                        <div className='flex-1'>
                                            <div className='w-full bg-white/6 rounded-full h-2 overflow-hidden'>
                                                <div className={`h-2 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: `${Math.min(100, p.lowStockAt ? (p.quantity / Math.max(1, p.lowStockAt)) * 100 : (p.quantity > 100 ? 100 : p.quantity))}%` }} />
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <a href={`/add-product?edit=${p.id}`} className='px-3 py-1 text-sm rounded-md bg-white/6 hover:bg-white/10'>Edit</a>
                                            <form action={deleteProduct}>
                                                <input type='hidden' name='productId' value={p.id} />
                                                <button type='submit' className='px-3 py-1 text-sm rounded-md bg-white/6 hover:bg-white/10'>Delete</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}