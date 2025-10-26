"use server";
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

type ProductPayload = {
  name: string
  sku?: string | null
  price: string
  quantity: string
  lowStockAt?: string
}

export async function addProduct(formData: FormData) {
  'use server'
  const user = await getCurrentUser()

  const name = formData.get('name')
  const sku = formData.get('sku')
  const price = formData.get('price')
  const quantity = formData.get('quantity')
  const lowStockAt = formData.get('lowStockAt')

  if (!name || typeof name !== 'string') throw new Error('Name is required')
  // basic coercions
  const payload: ProductPayload = {
    name,
    sku: sku && typeof sku === 'string' ? sku : undefined,
    price: price && typeof price === 'string' ? price : '0',
    quantity: quantity && typeof quantity === 'string' ? quantity : '0',
    lowStockAt: lowStockAt && typeof lowStockAt === 'string' ? lowStockAt : undefined,
  }

  await prisma.product.create({
    data: {
      userId: user.id,
      name: payload.name,
      sku: payload.sku,
      price: payload.price,
      quantity: Number(payload.quantity) || 0,
      lowStockAt: payload.lowStockAt ? Number(payload.lowStockAt) : null,
    },
  })

  redirect('/inventory')
}

export async function updateProduct(formData: FormData) {
  'use server'
  const user = await getCurrentUser()
  const id = formData.get('productId')
  if (!id || typeof id !== 'string') throw new Error('productId is required')

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw new Error('Product not found')
  if (product.userId !== user.id) throw new Error('Not authorized')

  const name = formData.get('name')
  const sku = formData.get('sku')
  const price = formData.get('price')
  const quantity = formData.get('quantity')
  const lowStockAt = formData.get('lowStockAt')

  await prisma.product.update({
    where: { id },
    data: {
      name: name && typeof name === 'string' ? name : product.name,
      sku: sku && typeof sku === 'string' ? sku : product.sku,
      price: price && typeof price === 'string' ? price : String(product.price),
      quantity: quantity && typeof quantity === 'string' ? Number(quantity) || 0 : product.quantity,
      lowStockAt: lowStockAt && typeof lowStockAt === 'string' ? (lowStockAt === '' ? null : Number(lowStockAt)) : product.lowStockAt,
    },
  })

  redirect('/inventory')
}

export async function deleteProduct(formData: FormData) {
  'use server'
  const id = formData.get('productId')
  if (!id || typeof id !== 'string') throw new Error('productId is required')

  const user = await getCurrentUser()
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw new Error('Product not found')
  if (product.userId !== user.id) throw new Error('Not authorized')

  await prisma.product.delete({ where: { id } })

  redirect('/inventory')
}
