import { test } from 'node:test'
import assert from 'node:assert/strict'
import { uploadDateTime, durationIso, videoSchema } from '../src/lib/video-schema.ts'

test('uploadDate — дата-время с часовым поясом Москвы (требование Google)', () => {
  assert.equal(uploadDateTime('2026-11-01'), '2026-11-01T12:00:00+03:00')
  assert.match(uploadDateTime('2026-11-12'), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)
})

test('uploadDate — неверная дата роняет сборку', () => {
  assert.throws(() => uploadDateTime('2026-11-31'))
  assert.throws(() => uploadDateTime('01.11.2026'))
  assert.throws(() => uploadDateTime('2026-11-01T10:00'))
})

test('duration — ISO 8601 из подписи М:СС', () => {
  assert.equal(durationIso('0:18'), 'PT18S')
  assert.equal(durationIso('1:09'), 'PT1M9S')
  assert.equal(durationIso('2:00'), 'PT2M')
  assert.throws(() => durationIso('18'))
})

test('videoSchema — VideoObject с полной датой', () => {
  const s = videoSchema({
    name: 'Ролик', description: 'Описание', thumbnailUrl: '/a.webp', contentUrl: '/a.mp4',
    uploadDate: '2026-11-01', duration: '0:27',
  })
  assert.equal(s['@type'], 'VideoObject')
  assert.equal(s.uploadDate, '2026-11-01T12:00:00+03:00')
  assert.equal(s.duration, 'PT27S')
})
