import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

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
