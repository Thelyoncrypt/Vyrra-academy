// Throwaway responsive audit: asserts no horizontal overflow at the 5 DESIGN.md
// viewports for key routes on the live dev server (:3000). Run: node e2e/responsive-audit.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000";
const VIEWPORTS = [
  { name: "320", width: 320, height: 800 },
  { name: "375", width: 375, height: 800 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
];
const ROUTES = [
  "/",
  "/course",
  "/course/1",
  "/videos",
  "/dashboard",
  "/academy",
  "/tracks",
  "/lessons/1.1.1",
  "/quizzes/m0-quiz",
  "/resources",
];

const browser = await chromium.launch();
let fail = 0;
let pass = 0;
for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    let line;
    try {
      const res = await page.goto(BASE + route, {
        waitUntil: "networkidle",
        timeout: 20000,
      });
      const status = res?.status() ?? 0;
      const overflow = await page.evaluate(() => {
        const el = document.scrollingElement || document.documentElement;
        return {
          scrollW: el.scrollWidth,
          clientW: el.clientWidth,
          over: el.scrollWidth - el.clientWidth,
        };
      });
      const bad = status >= 400 || overflow.over > 1;
      if (bad) fail++;
      else pass++;
      line = `${bad ? "FAIL" : "ok  "} ${route} @${vp.name} http=${status} scrollW=${overflow.scrollW} clientW=${overflow.clientW} over=${overflow.over}`;
    } catch (e) {
      fail++;
      line = `FAIL ${route} @${vp.name} ERROR ${String(e).slice(0, 80)}`;
    }
    console.log(line);
    await page.close();
  }
}
await browser.close();
console.log(`\nRESULT pass=${pass} fail=${fail}`);
process.exit(fail > 0 ? 1 : 0);
