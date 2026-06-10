import { expect, test } from "@playwright/test";

test("el usuario se registra, inicia sesion y crea un permiso", async ({ page }) => {
  const id = Date.now();
  const username = `e2e_${id}`;
  const password = "Password123";

  await page.goto("/login");
  await page.getByRole("button", { name: "Crear usuario" }).click();

  await page.locator('input[name="nombre"]').fill("E2E");
  await page.locator('input[name="apellido"]').fill("Tester");
  await page.locator('input[name="segundoApellido"]').fill("Playwright");
  await page.locator('input[name="email"]').fill(`${username}@demo.local`);
  await page.locator('input[name="registerUsername"]').fill(username);
  await page.locator('input[name="registerPassword"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.locator('form').filter({ has: page.locator('input[name="registerUsername"]') }).getByRole("button", { name: "Crear usuario" }).click();

  await expect(page.getByText("Usuario creado")).toBeVisible();

  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole("link", { name: /Permisos/ }).click();

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  await page.locator('input[name="fechaInicio"]').fill(formatDate(tomorrow));
  await page.locator('input[name="fechaFin"]').fill(formatDate(nextWeek));
  await page.locator('select[name="tipo"]').selectOption({ index: 1 });
  await page.locator('textarea[name="descripcion"]').fill("Permiso creado automaticamente por Playwright.");
  await page.getByRole("button", { name: "Crear permiso" }).click();

  await expect(page.getByText(/Permiso/i).last()).toBeVisible();
  await expect(page.getByText("Pendientes")).toBeVisible();
});
