import { expect, test } from "@playwright/test";

let createdUsername = "";

test.afterEach(async ({ request }) => {
  if (!createdUsername) return;

  const loginResponse = await request.post("http://127.0.0.1:3001/api/auth/login", {
    data: {
      username: process.env.E2E_ADMIN_USERNAME || "admin2",
      password: process.env.E2E_ADMIN_PASSWORD || "Admin12345",
    },
  });

  if (!loginResponse.ok()) return;

  const { token } = await loginResponse.json();
  const headers = { Authorization: `Bearer ${token}` };
  const employeesResponse = await request.get("http://127.0.0.1:3001/api/empleados", { headers });

  if (!employeesResponse.ok()) return;

  const employees = await employeesResponse.json();
  const employee = employees.find((item: { username: string }) => item.username === createdUsername);

  if (employee?._id) {
    await request.delete(`http://127.0.0.1:3001/api/empleados/${employee._id}`, { headers });
  }

  createdUsername = "";
});

test("el usuario se registra, inicia sesion y crea un permiso", async ({ page }) => {
  const id = Date.now();
  const username = `oriolTester_${id}`;
  const password = "Password123";
  createdUsername = username;

  await page.goto("/");
  await page.getByRole("button", { name: "Crear usuario" }).click();

  await page.locator('input[name="nombre"]').fill("Oriol");
  await page.locator('input[name="apellido"]').fill("Tester");
  await page.locator('input[name="segundoApellido"]').fill("Chiva");
  await page.locator('input[name="email"]').fill(`${username}@travelconnect.local`);
  await page.locator('input[name="registerUsername"]').fill(username);
  await page.locator('input[name="registerPassword"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.locator('form').filter({ has: page.locator('input[name="registerUsername"]') }).getByRole("button", { name: "Crear usuario" }).click();

  await expect(page.getByText("Usuario creado")).toBeVisible();

  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/login");
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
