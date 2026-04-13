import { test, expect } from "@playwright/test";

const URL = "https://buildia-rho.vercel.app/sample1";

test.describe("sample1 - 予約フォーム", () => {

  // ── 1. ページ表示 ──
  test("トップに予約フォームが表示される（ログイン不要）", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByText("ご予約フォーム")).toBeVisible();
  });

  test("入力欄が存在する", async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
    await expect(page.locator('input[name="time"]')).toBeVisible();
    await expect(page.locator('select[name="menu"]')).toBeVisible();
  });

  test("「予約を確定する」ボタンが存在する", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole("button", { name: "予約を確定する" })).toBeVisible();
  });

  // ── 2. 予約追加 ──
  test("予約を追加すると一覧に表示される", async ({ page }) => {
    await page.goto(URL);

    // フォームを入力
    await page.locator('input[name="name"]').fill("テスト太郎");
    await page.locator('input[name="phone"]').fill("090-1234-5678");
    await page.locator('input[name="date"]').fill("2026-05-01");
    await page.locator('input[name="time"]').fill("10:00");
    await page.locator('select[name="menu"]').selectOption("カット");

    // 送信
    await page.getByRole("button", { name: "予約を確定する" }).click();

    // 管理者ログインして一覧確認
    await page.locator('input[placeholder="admin"]').fill("admin");
    await page.locator('input[placeholder="1234"]').fill("1234");
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page.getByText("テスト太郎")).toBeVisible();
  });

  // ── 3. 削除機能 ──
  test("削除ボタンで予約を削除できる", async ({ page }) => {
    await page.goto(URL);

    // 予約を追加
    await page.locator('input[name="name"]').fill("削除テスト");
    await page.locator('input[name="phone"]').fill("090-0000-0000");
    await page.locator('input[name="date"]').fill("2026-06-01");
    await page.locator('input[name="time"]').fill("11:00");
    await page.locator('select[name="menu"]').selectOption("カラー");
    await page.getByRole("button", { name: "予約を確定する" }).click();

    // 管理者ログイン
    await page.locator('input[placeholder="admin"]').fill("admin");
    await page.locator('input[placeholder="1234"]').fill("1234");
    await page.getByRole("button", { name: "ログイン" }).click();

    // 削除ボタンをクリック（confirmをOKで確定）
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "削除" }).first().click();

    await expect(page.getByText("削除テスト")).not.toBeVisible();
  });

  // ── 4. 管理者ログイン ──
  test("ページ下部に管理者ログインエリアが存在する", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole("heading", { name: "🔐 管理者ログイン" })).toBeVisible();
  });

  test("管理者ログイン（admin/1234）で管理画面が表示される", async ({ page }) => {
    await page.goto(URL);

    await page.locator('input[placeholder="admin"]').fill("admin");
    await page.locator('input[placeholder="1234"]').fill("1234");
    await page.getByRole("button", { name: "ログイン" }).click();

    // 予約一覧タイトルまたはログアウトボタンが表示される
    await expect(page.getByRole("button", { name: "ログアウト" })).toBeVisible();
  });

  test("誤ったパスワードではログインできない", async ({ page }) => {
    await page.goto(URL);

    await page.locator('input[placeholder="admin"]').fill("admin");
    await page.locator('input[placeholder="1234"]').fill("wrong");
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page.getByText("IDまたはパスワードが違います")).toBeVisible();
  });
});
