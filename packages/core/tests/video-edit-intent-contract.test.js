import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { validateVideoEditIntentSemantics } from '../src/video-edit-intent.js';

const root = process.cwd();
const contractPath = path.join(
  root,
  'control-plane',
  'hive',
  'contracts',
  'video-edit-intent.schema.json',
);

function readContract() {
  return JSON.parse(fs.readFileSync(contractPath, 'utf8'));
}

function validIntent() {
  return {
    correlation_id: 'corr-asc3nd-01',
    idempotency_key: 'idem-asc3nd-01',
    version: 'v0',
    tenant_id: 'asc3nd',
    project_id: 'why-we-started-01',
    owner_provider: 'montage',
    source_assets: [
      {
        asset_id: 'interview-main',
        uri: 'drive://interview-main',
        transcript_ref: 'transcript://interview-main',
        immutable: true,
      },
    ],
    series: {
      title: 'ASC3ND Founder Mini-Series',
      episode_index: 1,
      episode_total: 4,
      display_marker: '01 / 04',
      source_session_id: 'founder-interview-session',
      protected_story_bank_refs: ['story-bank://human-element'],
    },
    story: {
      objective: 'Establish why ASC3ND started without resolving the whole story.',
      beats: [
        {
          beat_id: 'mentor-absence',
          purpose: 'Otha frames the absence of mentors.',
          source_ref: 'transcript://interview-main',
        },
      ],
      protected_material: ['A hug is free'],
    },
    timeline: {
      canonical_owner: 'montage',
      target_duration_seconds: 30,
      reopen_required: true,
      segments: [
        {
          segment_id: 'seg-1',
          asset_id: 'interview-main',
          source_start_seconds: 10,
          source_end_seconds: 16,
          order: 0,
        },
      ],
    },
    presentation: {
      aspect_ratio: '9:16',
      captions: { enabled: true, source_faithful: true, language: 'en' },
      layers: [],
    },
    review: {
      human_required: true,
      publish_allowed: false,
      independent_critic_required: true,
      evidence_required: ['render', 'timeline_reopen', 'source_ranges'],
    },
    storage: {
      source_of_truth: 'montage',
      review_export_targets: [
        { provider: 'google_drive', mode: 'export', external_file_id: null },
        { provider: 'capcut', mode: 'round_trip', external_file_id: null },
      ],
    },
  };
}

describe('Agenix video edit intent contract', () => {
  it('ships a Montage-owned canonical edit contract', () => {
    expect(fs.existsSync(contractPath)).toBe(true);
    const schema = readContract();
    expect(schema.required).toEqual(expect.arrayContaining([
      'correlation_id',
      'idempotency_key',
      'tenant_id',
      'project_id',
      'owner_provider',
      'source_assets',
      'story',
      'timeline',
      'presentation',
      'review',
      'storage',
    ]));
    expect(schema.properties.correlation_id.minLength).toBe(1);
    expect(schema.properties.idempotency_key.minLength).toBe(1);
    expect(schema.properties.owner_provider.const).toBe('montage');
    expect(schema.properties.timeline.properties.canonical_owner.const).toBe('montage');
    expect(schema.properties.storage.properties.source_of_truth.const).toBe('montage');
  });

  it('requires immutable source refs and reopenable timeline state', () => {
    const schema = readContract();
    const sourceItem = schema.properties.source_assets.items;
    expect(sourceItem.required).toEqual(expect.arrayContaining(['asset_id', 'uri', 'immutable']));
    expect(sourceItem.properties.immutable.const).toBe(true);

    const timeline = schema.properties.timeline;
    expect(timeline.required).toEqual(expect.arrayContaining([
      'segments',
      'target_duration_seconds',
      'reopen_required',
    ]));
    expect(timeline.properties.reopen_required.const).toBe(true);
    expect(timeline.properties.segments.items.required).toEqual(expect.arrayContaining([
      'asset_id',
      'source_start_seconds',
      'source_end_seconds',
      'order',
    ]));
  });

  it('treats mini-series continuity as explicit structured metadata', () => {
    const schema = readContract();
    const series = schema.properties.series;
    expect(series.required).toEqual([
      'title',
      'episode_index',
      'episode_total',
      'display_marker',
    ]);
    expect(series.properties.display_marker.pattern).toBe('^\\d{2} / \\d{2}$');
    expect(series.properties.protected_story_bank_refs.uniqueItems).toBe(true);
  });

  it('keeps review outputs unpublished and independently reviewed', () => {
    const schema = readContract();
    const review = schema.properties.review.properties;
    expect(review.human_required.const).toBe(true);
    expect(review.publish_allowed.const).toBe(false);
    expect(review.independent_critic_required.const).toBe(true);
  });

  it('models Google Drive and CapCut as external targets, not project owners', () => {
    const schema = readContract();
    const target = schema.properties.storage.properties.review_export_targets.items;
    expect(target.properties.provider.enum).toEqual(expect.arrayContaining([
      'google_drive',
      'capcut',
    ]));
    expect(target.properties.mode.enum).toEqual(expect.arrayContaining([
      'export',
      'round_trip',
      'fallback',
    ]));

    const capcutGuard = target.allOf.find((rule) =>
      rule.if?.properties?.provider?.const === 'capcut'
    );
    expect(capcutGuard).toBeTruthy();
    expect(capcutGuard.then.properties.mode.enum).toEqual(['round_trip', 'fallback']);
    expect(capcutGuard.then.properties.mode.enum).not.toContain('export');
  });
});

describe('Agenix video edit intent semantic validator', () => {
  it('accepts a source-backed intent', () => {
    expect(validateVideoEditIntentSemantics(validIntent())).toEqual({ valid: true, errors: [] });
  });

  it('rejects timeline segments that reference undeclared source assets', () => {
    const intent = validIntent();
    intent.timeline.segments[0].asset_id = 'missing-asset';
    const result = validateVideoEditIntentSemantics(intent);
    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toContain('timeline.unknown_asset');
  });

  it('rejects reversed or zero-length source ranges', () => {
    const intent = validIntent();
    intent.timeline.segments[0].source_end_seconds = 10;
    const result = validateVideoEditIntentSemantics(intent);
    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toContain('timeline.invalid_source_range');
  });

  it('rejects duplicate segment identities and order values', () => {
    const intent = validIntent();
    intent.timeline.segments.push({ ...intent.timeline.segments[0] });
    const result = validateVideoEditIntentSemantics(intent);
    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual(expect.arrayContaining([
      'timeline.duplicate_segment_id',
      'timeline.duplicate_order',
    ]));
  });

  it('rejects story references that do not resolve to declared source or transcript material', () => {
    const intent = validIntent();
    intent.story.beats[0].source_ref = 'transcript://missing';
    const result = validateVideoEditIntentSemantics(intent);
    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toContain('story.unresolved_source_ref');
  });
});
