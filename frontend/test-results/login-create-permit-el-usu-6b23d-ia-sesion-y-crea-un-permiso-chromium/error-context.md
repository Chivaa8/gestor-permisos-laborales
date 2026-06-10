# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login-create-permit.spec.ts >> el usuario se registra, inicia sesion y crea un permiso
- Location: e2e\login-create-permit.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Crear usuario' })

```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e6]:
    - complementary [ref=e7]:
      - generic [ref=e11]:
        - img "FUCS" [ref=e12]
        - generic [ref=e14]: FUCS x BookHospital
      - generic [ref=e15]:
        - paragraph [ref=e16]:
          - img [ref=e17]
          - text: Acceso institucional seguro
        - heading "Acceso a Homologaciones FUCS" [level=1] [ref=e19]
        - paragraph [ref=e20]: Portal para la internacionalización de egresados de ciencias de la salud.
        - article [ref=e22]:
          - img [ref=e24]
          - generic [ref=e26]:
            - paragraph [ref=e27]: El acceso abre el expediente y conserva el seguimiento por usuario.
            - paragraph [ref=e28]: Credenciales validadas para perfiles FUCS y BookHospital.
      - generic [ref=e29]:
        - generic [ref=e30]:
          - paragraph [ref=e31]: 2.5k+
          - paragraph [ref=e32]: Egresados homologados
        - generic [ref=e33]:
          - paragraph [ref=e34]: 15+
          - paragraph [ref=e35]: Países destino
    - generic [ref=e37]:
      - generic [ref=e39]:
        - generic [ref=e40]:
          - img [ref=e41]
          - combobox "Seleccionar universidad" [ref=e43]:
            - option "FUCS" [selected]
            - option "Javeriana"
            - option "Rosario"
            - option "Unisanitas"
            - option "Universidad"
        - button "Activar modo noche" [ref=e44] [cursor=pointer]:
          - img [ref=e45]
        - generic [ref=e47]:
          - img [ref=e48]
          - button "ES" [ref=e50] [cursor=pointer]:
            - generic [ref=e51]: ES
          - button "EN" [ref=e52] [cursor=pointer]:
            - generic [ref=e53]: EN
      - generic [ref=e54]:
        - generic [ref=e55]:
          - paragraph [ref=e56]: Acceso institucional seguro
          - heading "Iniciar Sesión" [level=2] [ref=e57]
          - paragraph [ref=e58]: Portal para la internacionalización de egresados de ciencias de la salud.
        - generic [ref=e59]:
          - button "Iniciar Sesión" [ref=e60] [cursor=pointer]
          - button "Crear cuenta" [ref=e61] [cursor=pointer]
        - generic [ref=e62]:
          - generic [ref=e63]:
            - text: Correo o usuario
            - generic [ref=e64]:
              - img [ref=e65]
              - textbox "Correo o usuario" [ref=e67]:
                - /placeholder: correo@ejemplo.com o usuario
          - generic [ref=e68]:
            - generic [ref=e69]:
              - generic [ref=e70]: Contraseña
              - button "Recuperar Acceso?" [ref=e71] [cursor=pointer]
            - generic [ref=e72]:
              - img [ref=e73]
              - textbox "Contraseña" [ref=e75]
          - generic [ref=e76]:
            - checkbox "Recordar Sesión" [checked] [ref=e77]
            - generic [ref=e78]: Recordar Sesión
          - button "Iniciar Sesión" [ref=e79] [cursor=pointer]:
            - img [ref=e80]
            - text: Iniciar Sesión
          - generic [ref=e83]:
            - img [ref=e85]
            - generic [ref=e87]:
              - paragraph [ref=e88]: Acceso institucional seguro
              - paragraph [ref=e89]: Credenciales validadas para perfiles FUCS y BookHospital.
        - generic [ref=e91]:
          - img [ref=e93]
          - generic [ref=e95]:
            - paragraph [ref=e96]: Sincronización móvil
            - paragraph [ref=e97]: Login y registro web listos; la app móvil se sincroniza al enviar el formulario.
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("el usuario se registra, inicia sesion y crea un permiso", async ({ page }) => {
  4  |   const id = Date.now();
  5  |   const username = `e2e_${id}`;
  6  |   const password = "Password123";
  7  | 
  8  |   await page.goto("/login");
> 9  |   await page.getByRole("button", { name: "Crear usuario" }).click();
     |                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  10 | 
  11 |   await page.locator('input[name="nombre"]').fill("E2E");
  12 |   await page.locator('input[name="apellido"]').fill("Tester");
  13 |   await page.locator('input[name="segundoApellido"]').fill("Playwright");
  14 |   await page.locator('input[name="email"]').fill(`${username}@demo.local`);
  15 |   await page.locator('input[name="registerUsername"]').fill(username);
  16 |   await page.locator('input[name="registerPassword"]').fill(password);
  17 |   await page.locator('input[name="confirmPassword"]').fill(password);
  18 |   await page.locator('form').filter({ has: page.locator('input[name="registerUsername"]') }).getByRole("button", { name: "Crear usuario" }).click();
  19 | 
  20 |   await expect(page.getByText("Usuario creado")).toBeVisible();
  21 | 
  22 |   await page.locator('input[name="username"]').fill(username);
  23 |   await page.locator('input[name="password"]').fill(password);
  24 |   await page.getByRole("button", { name: "Entrar" }).click();
  25 | 
  26 |   await expect(page).toHaveURL(/\/dashboard/);
  27 |   await page.getByRole("link", { name: /Permisos/ }).click();
  28 | 
  29 |   const today = new Date();
  30 |   const tomorrow = new Date(today);
  31 |   tomorrow.setDate(today.getDate() + 1);
  32 |   const nextWeek = new Date(today);
  33 |   nextWeek.setDate(today.getDate() + 7);
  34 |   const formatDate = (date: Date) => date.toISOString().slice(0, 10);
  35 | 
  36 |   await page.locator('input[name="fechaInicio"]').fill(formatDate(tomorrow));
  37 |   await page.locator('input[name="fechaFin"]').fill(formatDate(nextWeek));
  38 |   await page.locator('select[name="tipo"]').selectOption({ index: 1 });
  39 |   await page.locator('textarea[name="descripcion"]').fill("Permiso creado automaticamente por Playwright.");
  40 |   await page.getByRole("button", { name: "Crear permiso" }).click();
  41 | 
  42 |   await expect(page.getByText(/Permiso/i).last()).toBeVisible();
  43 |   await expect(page.getByText("Pendientes")).toBeVisible();
  44 | });
  45 | 
```