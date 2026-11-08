import { test, expect } from '@playwright/test'

/**
 * MailMind AI — End-to-End Tests
 * These tests mock Gmail and LLM services.
 * Run against a real local backend with test DB.
 */

test.describe('Authentication Flow', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/MailMind AI/)
    await expect(page.getByText('MailMind AI')).toBeVisible()
    await expect(page.getByText('Your inbox, intelligently understood')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
  })

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated user cannot access inbox', async ({ page }) => {
    await page.goto('/inbox')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Health Check', () => {
  test('backend health endpoint returns ok', async ({ request }) => {
    const response = await request.get('http://localhost:8000/health')
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.status).toBe('ok')
  })
})

test.describe('API Security', () => {
  test('emails endpoint requires authentication', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/emails/')
    expect(response.status()).toBe(401)
  })

  test('tasks endpoint requires authentication', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/tasks/')
    expect(response.status()).toBe(401)
  })

  test('analytics endpoint requires authentication', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/analytics/summary')
    expect(response.status()).toBe(401)
  })
})

test.describe('UI Responsiveness', () => {
  test('login page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
  })
})
