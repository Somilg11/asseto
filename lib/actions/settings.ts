"use server";
import { promises as fs } from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

export async function saveSettings(formData: FormData) {
  'use server'
  const companyName = formData.get('companyName');
  const currency = formData.get('currency');
  const defaultLowStockThreshold = formData.get('defaultLowStockThreshold');
  const itemsPerPage = formData.get('itemsPerPage');
  const notifyEmail = formData.get('notifyEmail');
  const timezone = formData.get('timezone');

  if (!companyName || typeof companyName !== 'string') throw new Error('Company name is required');
  if (!currency || typeof currency !== 'string') throw new Error('Currency is required');

  const payload = {
    companyName: String(companyName),
    currency: String(currency),
    defaultLowStockThreshold: Number(defaultLowStockThreshold) || 5,
    itemsPerPage: Math.max(1, Number(itemsPerPage) || 20),
    notifyEmail: notifyEmail ? String(notifyEmail) : '',
    timezone: timezone ? String(timezone) : Intl.DateTimeFormat().resolvedOptions().timeZone,
    updatedAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(payload, null, 2), 'utf-8');

  redirect('/settings?saved=1');
}
