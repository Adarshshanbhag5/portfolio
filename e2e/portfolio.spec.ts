import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** Collects anything the page logs as an error, for a hard assertion later. */
function watchForErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

/**
 * Clicks through the cold-start overlay and waits for the hero to come to
 * rest, since hovering or clicking mid-entrance chases a moving target.
 */
async function skipIntro(page: Page) {
  const intro = page.getByText('COLD START', { exact: true })
  // The intro is short enough that it can finish on its own before the click
  // lands on a slower machine; either way we only care that it is gone.
  await intro.click({ timeout: 3000 }).catch(() => {})
  await expect(intro).toBeHidden()

  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toHaveCSS('opacity', '1')
  await expect(heading).toHaveCSS('transform', 'none')
}

const primaryNav = (page: Page) => page.getByRole('navigation', { name: 'Primary' })

test.describe('page shell', () => {
  test('boots, plays the cold start, then reveals the hero', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('COLD START', { exact: true })).toBeVisible()
    await expect(page.getByText('ADARSH', { exact: false }).first()).toBeVisible()

    await skipIntro(page)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('I build backends')
  })

  test('renders every section and live canvas without console errors', async ({ page }) => {
    const errors = watchForErrors(page)
    await page.goto('/')
    await skipIntro(page)

    for (const id of ['top', 'work', 'systems', 'stack', 'builds', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
    }

    // Ten scenes plus the shared burst canvas.
    await expect(page.locator('canvas')).toHaveCount(11)

    await page.locator('#contact').scrollIntoViewIfNeeded()
    await page.waitForTimeout(1200)
    expect(errors).toEqual([])
  })

  test('nav and dot rail follow the reading position', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    await primaryNav(page).getByRole('link', { name: 'systems' }).click()
    await expect(primaryNav(page).getByRole('link', { name: 'systems' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  test('counters settle on their target values', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)
    await page.getByText('GLOBAL EXCHANGES WIRED').scrollIntoViewIfNeeded()

    await expect(page.getByText('GLOBAL EXCHANGES WIRED').locator('..')).toContainText('18')
    await expect(page.getByText('SHIPPING TO PRODUCTION').locator('..')).toContainText('2+')
    await expect(page.getByText('RECORDS PER SYNC JOB').locator('..')).toContainText('3M')
  })
})

test.describe('theme', () => {
  test('toggles, persists, and survives a reload', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('button', { name: /switch to light theme/i }).click()
    await expect(html).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 246, 243)')

    await page.reload()
    // The pre-paint script applies it before React ever runs.
    await expect(html).toHaveAttribute('data-theme', 'light')
  })
})

test.describe('easter eggs', () => {
  test('the deploy button runs a canary rollout to completion', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    await page.getByRole('button', { name: /deploy to prod/i }).click()

    const console_ = page.getByText(/deploy · v\d+/)
    await expect(console_).toBeVisible()
    await expect(page.getByText('canary up · shifting 5% of traffic')).toBeVisible()
    await expect(page.getByText(/promoted · 6\/6 healthy · 0 downtime/)).toBeVisible()
    await expect(console_).toBeHidden({ timeout: 6000 })
  })

  test('typing "ship" runs the same rollout', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    await page.keyboard.type('ship', { delay: 40 })
    await expect(page.getByText(/deploy · v\d+/)).toBeVisible()
  })

  test('three clicks on the wordmark releases the chaos monkey, which recovers', async ({
    page,
  }) => {
    await page.goto('/')
    await skipIntro(page)

    const brand = primaryNav(page).getByRole('link', { name: /adarsh/i })
    // One action, so the three clicks cannot drift past the detection window.
    await brand.click({ clickCount: 3, delay: 60 })

    const toast = page.getByRole('status')
    await expect(toast).toContainText('chaos monkey released')
    await expect(toast).toContainText('recovered', { timeout: 6000 })
  })

  test('typing "kafka" releases it too', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    await page.keyboard.type('kafka', { delay: 40 })
    await expect(page.getByRole('status')).toContainText('chaos monkey released')
  })
})

test.describe('résumé', () => {
  test('plays the streamed-transfer overlay and closes itself', async ({ page, context }) => {
    await page.goto('/')
    await skipIntro(page)

    // The link opens the real PDF in a new tab; keep this one on the page.
    context.on('page', (opened) => void opened.close().catch(() => {}))

    await primaryNav(page).getByRole('link', { name: /résumé/i }).click()

    const overlay = page.getByText('GET /adarsh-resume.pdf')
    await expect(overlay).toBeVisible()
    await expect(page.getByText('200 OK', { exact: true })).toBeVisible()
    await expect(page.getByText('↳ dns · adarsh.dev resolved')).toBeVisible()
    await expect(page.getByText('✓ transfer complete', { exact: false })).toBeVisible()
    await expect(overlay).toBeHidden({ timeout: 6000 })
  })

  test('opens the file only once the overlay has played', async ({ page, context }) => {
    await page.goto('/')
    await skipIntro(page)

    const clickedAt = Date.now()
    const popup = context.waitForEvent('page')
    await primaryNav(page).getByRole('link', { name: /résumé/i }).click()

    await expect(page.getByText('GET /adarsh-resume.pdf')).toBeVisible()
    const opened = await popup
    // The tab must trail the animation, not race it.
    expect(Date.now() - clickedAt).toBeGreaterThan(700)

    await opened.close()
  })
})

test.describe('content', () => {
  test('project cards link to their own repositories', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    await expect(page.getByRole('link', { name: /react-native-palette-picker/ })).toHaveAttribute(
      'href',
      'https://github.com/Adarshshanbhag5/react-native-palette-picker',
    )
    await expect(page.getByRole('link', { name: /MusicFumes/ })).toHaveAttribute(
      'href',
      'https://github.com/Adarshshanbhag5/musicFumes',
    )
  })

  test('every section heading finishes its reveal', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    const headings: [string, string][] = [
      ['work', "Where I've built."],
      ['systems', 'The things I keep running.'],
      ['stack', 'What I reach for.'],
      ['builds', 'Shipped on my own time.'],
    ]

    for (const [id, title] of headings) {
      await primaryNav(page).getByRole('link', { name: id }).click()
      await expect(page.getByRole('heading', { name: title })).toBeVisible()
      // A heading masked mid-reveal still reports as visible, so assert the
      // slide actually landed. This shipped stuck once.
      await expect(page.locator(`#${id} h2 span`)).toHaveCSS('transform', 'none')
    }
  })

  test('carries no em dashes', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    const withEmDash = await page.evaluate(() =>
      document.body.innerText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.includes('\u2014')),
    )
    expect(withEmDash).toEqual([])
  })

  test('body text is unselectable, contact details are not', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('user-select', 'none')
    await expect(page.locator('[data-selectable]').first()).toHaveCSS('user-select', 'text')
  })
})

test.describe('text effects', () => {
  test('the hero words scramble on hover and settle back', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    const words = page.getByRole('heading', { level: 1 }).locator('span').first()
    // Dismissing the overlay leaves the cursor mid-screen, which can already be
    // inside the target, so park it in the corner and make the hover a real entry.
    await page.mouse.move(4, 4)
    await expect(words).toHaveText('hold up')

    await words.hover()
    await expect(words).not.toHaveText('hold up', { timeout: 1000 })
    await expect(words).toHaveText('hold up', { timeout: 3000 })
  })
})

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('skips the cold start and shows the hero immediately', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('COLD START', { exact: true })).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1')
  })
})
