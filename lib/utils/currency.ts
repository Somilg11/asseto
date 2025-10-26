import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

export function currencySymbol(code?: string) {
  switch ((code || 'USD').toUpperCase()) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR': return '₹';
    default: return code || '';
  }
}

export async function readCurrencyCode() {
  try {
    const raw = await fs.promises.readFile(SETTINGS_PATH, 'utf-8');
    const json = JSON.parse(raw);
    return json.currency || 'USD';
  } catch {
    return 'USD';
  }
}
