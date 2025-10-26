import ProductCharts from '@/components/products-charts';
import Sidebar from '@/components/sidebar'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { readCurrencyCode, currencySymbol } from '@/lib/utils/currency'

const DashboardPage = async () => {
    const user = await getCurrentUser();
    const userId = user.id;
    const [totalProducts, lowStockProducts, allProducts] = await Promise.all([
        prisma.product.count({ where: { userId } }),
        prisma.product.count({
        where: { 
            userId,
            lowStockAt: {not: null},
            quantity: {lte: 5}
            }
        }),
        prisma.product.findMany({
            where: { userId },
            select: {price: true, quantity: true, createdAt: true},
        }),
    ]);
    const totalValue = allProducts.reduce((sum, product) => {
        return sum + (Number(product.price) * Number(product.quantity))
    }, 0);

    // currency symbol from settings
    const currencyCode = await readCurrencyCode();
    const currencySym = currencySymbol(currencyCode);

    // Compute unit-based counts (units in stock) for a more accurate efficiency metric
    const totalUnits = allProducts.reduce((sum, product) => sum + Number(product.quantity), 0);
    const inStockUnits = allProducts.reduce((sum, product) => sum + (Number(product.quantity) > 5 ? Number(product.quantity) : 0), 0);
    const lowStockUnits = allProducts.reduce((sum, product) => sum + (Number(product.quantity) > 0 && Number(product.quantity) <= 5 ? Number(product.quantity) : 0), 0);
    // Percentages based on units (fallback to product-count percentages if totalUnits is zero)
    const outOfStockUnits = Math.max(0, totalUnits - inStockUnits - lowStockUnits);
    const inStockPercentage = totalUnits === 0
        ? (totalProducts === 0 ? 0 : (allProducts.filter(p => Number(p.quantity) > 5).length / totalProducts) * 100)
        : (inStockUnits / Math.max(1, totalUnits)) * 100;
    const lowStockPercentage = totalUnits === 0
        ? (totalProducts === 0 ? 0 : (allProducts.filter(p => Number(p.quantity) > 0 && Number(p.quantity) <= 5).length / totalProducts) * 100)
        : (lowStockUnits / Math.max(1, totalUnits)) * 100;
    const outOfStockPercentage = totalUnits === 0
        ? (totalProducts === 0 ? 0 : (allProducts.filter(p => Number(p.quantity) === 0).length / totalProducts) * 100)
        : (outOfStockUnits / Math.max(1, totalUnits)) * 100;

    const now = new Date();
    const weeklyProductsData = []

    for(let i=11; i>=0; i--){
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - i * 7);
        weekStart.setHours(0,0,0,0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23,59,59,999);


        const weekProducts = allProducts.filter(product => {
            const productDate = new Date(product.createdAt);
            return productDate >= weekStart && productDate <= weekEnd;
        });

        const totalProducts = weekProducts.reduce((sum, product) => sum + product.quantity, 0);
        weeklyProductsData.push({ week: `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`, products: totalProducts });
    }

    const recent = await prisma.product.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });
  return (
    <div className='min-h-screen bg-[#18181B] text-white'>
        <Sidebar currentPath="/dashboard" />
    <main className='md:ml-64 ml-0 pt-16 md:pt-8 p-4 md:p-8 font-sans'>
            {/* Header */}
            <div className='mb-8'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-4xl font-extrabold text-white tracking-tight' style={{fontFamily: 'Geist, Inter, Arial, sans-serif'}}>Dashboard</h1>
                        <p className='text-lg text-gray-300 mt-2'>Your inventory, analytics, and logistics at a glance.</p>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
                {/* Key Metrics: Products */}
                <div className='bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center text-center'>
                    <div className='bg-[#18181B] rounded-2xl p-2 mb-3 flex items-center justify-center' style={{width: 48, height: 48}}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="0" width="24" height="24" rx="6" fill="#D6FF3D"/>
                            <path d="M4 13V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6m-16 0v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-16 0h4l2 3h4l2-3h4" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className='text-3xl font-extrabold text-[#18181B]'>{totalProducts}</div>
                    <div className='text-lg text-gray-700 font-semibold mt-2'>Total Products</div>
                </div>
                {/* Key Metrics: Inventory Value */}
                <div className='bg-gradient-to-tr from-yellow-300 via-yellow-400 to-yellow-500 rounded-2xl shadow p-6 flex flex-col items-center justify-center text-center'>
                    <div className='text-3xl font-extrabold text-gray-900'>{currencySym}{Number(totalValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className='text-lg text-gray-800 font-semibold mt-2'>Inventory Value</div>
                </div>
                {/* Key Metrics: Low Stock */}
                <div className='bg-gradient-to-tr from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow p-6 flex flex-col items-center justify-center text-center'>
                    <div className='text-3xl font-extrabold text-white'>{lowStockProducts}</div>
                    <div className='text-lg text-blue-100 font-semibold mt-2'>Low Stock</div>
                </div>
            </div>
            {/* Inventory overtime */}
            <div className='bg-zinc-900 rounded-2xl border border-gray-800 p-6 mb-8'>
                <h2 className='text-lg font-semibold mb-6'>New products per week</h2>
                <div className='h-48 flex items-center justify-center text-gray-500'>
                    <ProductCharts data={weeklyProductsData} />
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                {/* Stock levels */}
                <div className='bg-zinc-900 rounded-2xl border border-gray-800 p-6'>
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-lg font-semibold'>Recent Products</h2>
                        <Link href="/inventory" className='text-sm text-gray-400 hover:text-gray-300'>View All</Link>
                    </div>
                    <div className='space-y-3'>
                        {recent.map((product, key) => {
                            const stockLevel = product.quantity === 0 ? 0 : product.quantity <=(product.lowStockAt || 5) ? 1 : 2;
                            const stockColor = stockLevel === 0 ? 'bg-red-500' : stockLevel === 1 ? 'bg-yellow-500' : 'bg-green-500';
                            return (
                                <div key={key} className='p-3 bg-zinc-800 rounded-md flex items-center justify-between'>
                                    <div className='flex items-center space-x-3'>
                                        <div className='flex items-center gap-3'>
                                            <div className={`w-3 h-3 rounded-full ${stockColor}`}></div>
                                            <h3 className='text-sm font-semibold'>{product.name}</h3>
                                        </div>
                                        <div className='text-xs text-gray-500'>{product.quantity} units</div>
                                    </div>
                                    <div className='flex items-center'>
                                        <Link href={`/add-product?edit=${product.id}`} className='text-sm text-gray-400 hover:text-gray-300'>View</Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                {/* Effeciency section */}
                <div className='bg-zinc-900 rounded-2xl border border-gray-800 p-6'>
                    <h2 className='text-lg font-semibold mb-6'>Efficiency</h2>
                    <div className='flex items-center justify-center'>
                        <div className='flex flex-col items-center'>
                            {/* Simple SVG donut showing in-stock percentage */}
                            <svg viewBox='0 0 36 36' className='w-36 h-36'>
                                <path
                                    d='M18 2.0845
                                       a 15.9155 15.9155 0 0 1 0 31.831
                                       a 15.9155 15.9155 0 0 1 0 -31.831'
                                    fill='none'
                                    stroke='#2d2d2d'
                                    strokeWidth='4'
                                    className='opacity-60'
                                />
                                <path
                                    d='M18 2.0845
                                       a 15.9155 15.9155 0 0 1 0 31.831
                                       a 15.9155 15.9155 0 0 1 0 -31.831'
                                    fill='none'
                                    stroke='#7c3aed'
                                    strokeWidth='4'
                                    strokeDasharray={`${inStockPercentage.toFixed(2)}, 100`}
                                    strokeLinecap='round'
                                    transform='rotate(-90 18 18)'
                                />
                            </svg>
                            <div className='text-center mt-2'>
                                <span className='block text-2xl font-semibold'>{inStockPercentage.toFixed(0)}%</span>
                                <span className='block text-sm text-gray-500'>In Stock (by units)</span>
                            </div>
                        </div>
                    </div>
                    <div className='mt-6 space-y-4'>
                        <div className='flex items-center justify-between'>
                            <span className='block text-sm text-gray-500'>Low Stock</span>
                            <span className='block text-lg font-semibold'>{lowStockPercentage.toFixed(0)}%</span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <span className='block text-sm text-gray-500'>Out of Stock</span>
                            <span className='block text-lg font-semibold'>{outOfStockPercentage.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  )
}

export default DashboardPage