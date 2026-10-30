// QuRa GE economy scenario simulator (documentation prototype; not production).
// Node 20+ / ESM. Zero dependencies.
export const LEVEL_RATES = Object.freeze({
  3: 1, 4: 1, 5: 1.1, 6: 1.2, 7: 1.35, 8: 1.5, 9: 1.7,
  10: 2, 11: 2.2, 12: 2.4, 13: 2.7, 14: 3, 15: 3.4,
  16: 3.8, 17: 4.2, 18: 4.7, 19: 5.2, 20: 6,
});
export const SHOP_PRICES = Object.freeze({
  common_gear: 75, rare_gear: 225, epic_gear: 600,
  legendary_gear: 1850, founder_egg: 1000,
  second_early_egg: 450, third_early_egg: 700,
  coop_4_to_6: 500, coop_6_to_10: 1500,
  coop_10_to_16: 4000, coop_16_to_24: 9000,
});
const round = n => Math.round((n + Number.EPSILON) * 1e6) / 1e6;
const nonnegative = (v, name) => {
  if (!Number.isFinite(v) || v < 0) throw new RangeError(name + ' must be nonnegative and finite');
  return v;
};
export function runScenario(config = {}) {
  const {
    roster = [{ level: 3, count: 1 }],
    days = 30,
    dailyFinancialGE = 0,
    dailyMinigameGE = 0,
    dailyQuestGE = 0,
    dailyPartnerSpendGE = 0,
    startGE = 0,
    giftBonusPct = 0,
    shopPurchases = [],
    levelRates = LEVEL_RATES,
    configVersion = 'prototype-0.2',
  } = config;
  if (!Number.isInteger(days) || days < 1 || days > 3650) throw new RangeError('days must be integer 1..3650');
  for (const [key, val] of Object.entries({ dailyFinancialGE, dailyMinigameGE, dailyQuestGE, dailyPartnerSpendGE, startGE, giftBonusPct })) nonnegative(val, key);
  if (!Array.isArray(roster)) throw new TypeError('roster must be array');
  for (const r of roster) {
    if (!Number.isInteger(r.count) || r.count < 0 || !Number.isInteger(r.level) || r.level < 1 || r.level > 20) throw new RangeError('invalid roster item');
  }
  const purchasesByDay = new Map();
  for (const p of shopPurchases) {
    if (!Number.isInteger(p.day) || p.day < 1 || p.day > days) throw new RangeError('invalid purchase day');
    nonnegative(p.priceGE, 'purchase priceGE');
    if (!p.id) throw new Error('purchase id required');
    if (!purchasesByDay.has(p.day)) purchasesByDay.set(p.day, []);
    purchasesByDay.get(p.day).push(p);
  }
  const passiveDaily = roster.reduce((sum,r) => {
    if (r.level < 3) return sum;
    const rate = levelRates[r.level];
    if (!Number.isFinite(rate) || rate < 1) throw new Error('L3+ must have >=1 GE/day');
    return sum + rate * r.count;
  }, 0) * (1 + giftBonusPct / 100);
  let balance = startGE, credited = 0, spent = 0, redeemed = 0;
  const timeline = [];
  for (let day = 1; day <= days; day++) {
    const passive = round(passiveDaily), financial = dailyFinancialGE, minigame = dailyMinigameGE, quests = dailyQuestGE;
    const earned = round(passive + financial + minigame + quests);
    balance = round(balance + earned); credited = round(credited + earned);
    let spentToday = 0;
    for (const p of purchasesByDay.get(day) || []) {
      if (p.priceGE > balance + 1e-8) throw new Error('insufficient balance for ' + p.id + ' on day ' + day);
      balance = round(balance - p.priceGE); spentToday = round(spentToday + p.priceGE);
    }
    if (dailyPartnerSpendGE > balance + 1e-8) throw new Error('insufficient balance for partner redemption on day ' + day);
    balance = round(balance - dailyPartnerSpendGE);
    spent = round(spent + spentToday); redeemed = round(redeemed + dailyPartnerSpendGE);
    timeline.push({ day, passive, financial, minigame, quests, earned, shopSpent: spentToday, partnerRedeemed: dailyPartnerSpendGE, balance });
  }
  return { configVersion, roster, days, passiveDaily: round(passiveDaily), totalCredited: credited, totalShopSpent: spent, totalPartnerRedeemed: redeemed, closingBalance: balance, timeline };
}
export function daysToGoal(price, dailyGE, currentGE = 0) {
  nonnegative(price, 'price'); nonnegative(dailyGE, 'dailyGE'); nonnegative(currentGE, 'currentGE');
  return currentGE >= price ? 0 : dailyGE === 0 ? null : Math.ceil((price - currentGE) / dailyGE - 1e-10);
}
export const SCENARIOS = Object.freeze({
  oneChick: { roster: [{level:3,count:1}] },
  threeChicks: { roster: [{level:3,count:3}] },
  sixAtL10: { roster: [{level:10,count:6}] },
  collector: { roster: [{level:20,count:24}] },
  activeHistorical: { roster: [{level:3,count:1}], dailyFinancialGE:52.8, dailyMinigameGE:40 },
});
