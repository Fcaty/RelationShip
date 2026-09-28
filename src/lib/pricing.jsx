export const todayStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getActivePromo = (cruise, promos, on = todayStr()) => {
  const tagIds = cruise.tag_ids || [];
  const active = promos.filter(
    (p) =>
      tagIds.includes(p.tag_id) &&
      p.promo_date_start <= on &&
      on <= p.promo_date_end
  );
  if (!active.length) return null;
  return active.reduce((best, p) =>
    Number(p.promo_price_decrease) > Number(best.promo_price_decrease) ? p : best
  );
};

export const discountedPrice = (price, promo) =>
  promo ? Math.max(0, +(Number(price) * (1 - Number(promo.promo_price_decrease))).toFixed(2)) : Number(price);

export const lowestTierPrice = (cruise) =>
  Math.min(...(cruise.tiers || []).map((t) => Number(t.tier_price)), Infinity);

export const getSchedules = (cruise) => {
  if (Array.isArray(cruise.schedules) && cruise.schedules.length) {
    return cruise.schedules.filter((d) => d >= todayStr()).sort();
  }
  const out = [];
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  for (let i = 0; i < 8; i++) {
    out.push(todayStr(d));
    d.setDate(d.getDate() + 7);
  }
  return out;
};