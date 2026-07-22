export interface Coupon { code: string; type: 'percent' | 'fixed'; value: number; minOrder: number; active: boolean; description?: string; expiresAt?: string; }
const key = 'md_coupons_v1';
const defaults: Coupon[] = [{ code: 'MAADIARIES10', type: 'percent', value: 10, minOrder: 0, active: true }];
export const couponsService = {
  list: (): Coupon[] => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaults)); } catch { return defaults; } },
  save: (items: Coupon[]) => localStorage.setItem(key, JSON.stringify(items)),
  validate: (code: string, subtotal: number) => couponsService.list().find(c => c.active && c.code.toUpperCase() === code.toUpperCase() && subtotal >= c.minOrder && (!c.expiresAt || new Date(c.expiresAt) >= new Date()))
};
