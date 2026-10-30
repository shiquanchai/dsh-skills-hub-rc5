/** Retry policy for Windows transient sharing violations (EPERM/EACCES/EBUSY). */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { errorCode, retryTransient } from '../lib/market/fs-retry.js'

const failure = (code) => Object.assign(new Error(`${code}: fixture`), { code })

test('retries a transient sharing violation until the operation succeeds', async () => {
  let attempts = 0
  const value = await retryTransient(async () => {
    attempts += 1
    if (attempts < 3) throw failure('EPERM')
    return 'published'
  })
  assert.equal(value, 'published')
  assert.equal(attempts, 3)
})

test('does not retry a non-transient filesystem error', async () => {
  let attempts = 0
  await assert.rejects(
    retryTransient(async () => {
      attempts += 1
      throw failure('ENOENT')
    }),
    (error) => error.code === 'ENOENT',
  )
  assert.equal(attempts, 1)
})

test('does not retry an error without a code', async () => {
  let attempts = 0
  await assert.rejects(
    retryTransient(async () => {
      attempts += 1
      throw new Error('plain failure')
    }),
    /plain failure/,
  )
  assert.equal(attempts, 1)
})

test('rethrows the last transient error after the attempt budget', async () => {
  let attempts = 0
  await assert.rejects(
    retryTransient(async () => {
      attempts += 1
      throw failure(attempts < 3 ? 'EBUSY' : 'EACCES')
    }, 3),
    (error) => error.code === 'EACCES',
  )
  assert.equal(attempts, 3)
})

test('errorCode ignores non-string and empty codes', () => {
  assert.equal(errorCode(failure('EPERM')), 'EPERM')
  assert.equal(errorCode({ code: '' }), undefined)
  assert.equal(errorCode({ code: 5 }), undefined)
  assert.equal(errorCode(null), undefined)
})
