// Walmart Cash adapter.
//
// Walmart's offer API only accepts requests carrying tracing headers its own
// site code generates, so instead of calling the API this adapter drives the
// page's own "Get this offer" buttons and pager, and Walmart's code makes
// every request. Slower, and tied to the page's markup, but nothing is faked.
//
// The all-offers page shows 50 offers per page. Walmart flips a card to
// "Offer claimed" as soon as it's clicked and flips it back if the request
// fails, so a clip only counts once the label has stayed put for a moment.

(() => {
  const grid = () => document.querySelector('[data-testid="all-offer-tiles-container"]');
  const cards = () => [...(grid()?.children || [])];
  const button = (card) => card.querySelector('[data-testid^="qa-id-walmartReward-"] .pointer');
  const claimed = (card) => /Offer claimed/i.test(card.innerText);
  const claimable = (card) => !!button(card) && /Get this offer/i.test(card.innerText);
  const nextButton = () => [...document.querySelectorAll('[data-testid="aop-pagination-container"] button, [data-testid="aop-pagination-container"] a')]
    .find((b) => b.getAttribute("aria-label") === "Next Page");

  async function waitFor(ctx, test, ms) {
    for (let t = 0; t < ms; t += 300) {
      if (test()) return true;
      await ctx.sleep(300);
    }
    return test();
  }

  window.__gbc.register({
    id: "walmart",
    name: "Walmart Cash",
    isCouponPage: () => location.pathname.startsWith("/offer/all-offers"),

    async run(ctx) {
      if (/\/redirect\/identity|\/account\/login/.test(location.pathname)) {
        throw ctx.fail("login", "Sign in to walmart.com first, then run again.");
      }
      if (!location.pathname.startsWith("/offer/all-offers")) {
        throw ctx.fail("error", "Open walmart.com/offer/all-offers, then run again.");
      }
      if (!(await waitFor(ctx, () => cards().length > 0, 10000))) {
        throw ctx.fail("error", "Walmart's offers didn't load. Reload the page and run again.");
      }

      let total = 0;
      let already = 0;
      let failStreak = 0;
      for (let page = 1; page <= 30; page++) {
        const onPage = cards();
        total += onPage.length;
        already += onPage.filter(claimed).length;
        ctx.found(total, already);

        for (const card of onPage.filter(claimable)) {
          const ok = await ctx.clip(async () => {
            card.scrollIntoView({ block: "center" });
            button(card).click();
            if (!(await waitFor(ctx, () => claimed(card), 5000))) return false;
            await ctx.sleep(1200);
            return claimed(card);
          }, [700, 1400]);
          failStreak = ok ? 0 : failStreak + 1;
          if (failStreak >= 5) throw ctx.fail("blocked", "Walmart stopped accepting offers. Wait a while, reload the page, and run again.");
        }

        const next = nextButton();
        if (!next || next.disabled || next.getAttribute("aria-disabled") === "true") break;
        const first = onPage[0]?.innerText;
        next.click();
        ctx.status(`Loading page ${page + 1}…`);
        if (!(await waitFor(ctx, () => cards().length > 0 && cards()[0].innerText !== first, 10000))) break;
        await ctx.sleep(ctx.between(800, 1500));
      }
    },
  });
})();
