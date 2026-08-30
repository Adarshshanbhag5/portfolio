import { expect, test } from '@playwright/test'

test('boots with no console or page errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')

  await expect(page.getByText('Clean slate')).toBeVisible()
  expect(errors).toEqual([])
})

test('tailwind stylesheet is applied', async ({ page }) => {
  await page.goto('/')

  // `grid` + `place-items-center` only resolve if Tailwind processed the sheet.
  const main = page.locator('main')
  await expect(main).toHaveCSS('display', 'grid')
  await expect(main).toHaveCSS('place-items', 'center')
})

test('motion animates the entry element to its resting state', async ({ page }) => {
  await page.goto('/')

  const label = page.getByText('Clean slate')
  await expect(label).toHaveCSS('opacity', '1')
  await expect(label).toHaveCSS('transform', 'none')
})
