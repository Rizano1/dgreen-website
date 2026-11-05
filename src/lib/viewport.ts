/**
 * Calls `fit` now and on real resizes only. Phone browsers fire "resize" while
 * their address bar slides in and out during scrolling; reacting to that makes
 * the hero and the menu book jump in size, so small height-only changes are ignored.
 */
export function onStableResize(fit: () => void) {
  let w = innerWidth;
  let h = innerHeight;
  fit();
  const onResize = () => {
    if (innerWidth === w && Math.abs(innerHeight - h) < 160) return;
    w = innerWidth;
    h = innerHeight;
    fit();
  };
  addEventListener("resize", onResize);
  return () => removeEventListener("resize", onResize);
}
