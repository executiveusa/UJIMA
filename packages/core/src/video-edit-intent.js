function addError(errors, code, path, message) {
  errors.push({ code, path, message });
}

function nonEmpty(value) {
  return typeof value === 'string' && value.length > 0;
}

export function validateVideoEditIntentSemantics(intent) {
  const errors = [];

  if (!intent || typeof intent !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'intent.invalid', path: '$', message: 'Intent must be an object.' }],
    };
  }

  const sourceAssets = Array.isArray(intent.source_assets) ? intent.source_assets : [];
  const sourceAssetIds = new Set();
  const declaredSourceRefs = new Set();

  for (const [index, asset] of sourceAssets.entries()) {
    if (!asset || typeof asset !== 'object') continue;

    if (nonEmpty(asset.asset_id)) {
      if (sourceAssetIds.has(asset.asset_id)) {
        addError(
          errors,
          'source_asset.duplicate_id',
          `$.source_assets[${index}].asset_id`,
          `Duplicate source asset id: ${asset.asset_id}`,
        );
      }
      sourceAssetIds.add(asset.asset_id);
      declaredSourceRefs.add(asset.asset_id);
    }

    for (const ref of [asset.uri, asset.fingerprint, asset.transcript_ref]) {
      if (nonEmpty(ref)) declaredSourceRefs.add(ref);
    }
  }

  const segments = Array.isArray(intent.timeline?.segments) ? intent.timeline.segments : [];
  const segmentIds = new Set();
  const segmentOrders = new Set();

  for (const [index, segment] of segments.entries()) {
    if (!segment || typeof segment !== 'object') continue;
    const basePath = `$.timeline.segments[${index}]`;

    if (nonEmpty(segment.segment_id)) {
      if (segmentIds.has(segment.segment_id)) {
        addError(
          errors,
          'timeline.duplicate_segment_id',
          `${basePath}.segment_id`,
          `Duplicate segment id: ${segment.segment_id}`,
        );
      }
      segmentIds.add(segment.segment_id);
    }

    if (Number.isInteger(segment.order)) {
      if (segmentOrders.has(segment.order)) {
        addError(
          errors,
          'timeline.duplicate_order',
          `${basePath}.order`,
          `Duplicate segment order: ${segment.order}`,
        );
      }
      segmentOrders.add(segment.order);
    }

    if (nonEmpty(segment.asset_id) && !sourceAssetIds.has(segment.asset_id)) {
      addError(
        errors,
        'timeline.unknown_asset',
        `${basePath}.asset_id`,
        `Timeline segment references undeclared source asset: ${segment.asset_id}`,
      );
    }

    if (
      typeof segment.source_start_seconds === 'number'
      && typeof segment.source_end_seconds === 'number'
      && segment.source_end_seconds <= segment.source_start_seconds
    ) {
      addError(
        errors,
        'timeline.invalid_source_range',
        basePath,
        'source_end_seconds must be greater than source_start_seconds.',
      );
    }
  }

  const beats = Array.isArray(intent.story?.beats) ? intent.story.beats : [];
  const beatIds = new Set();

  for (const [index, beat] of beats.entries()) {
    if (!beat || typeof beat !== 'object') continue;
    const basePath = `$.story.beats[${index}]`;

    if (nonEmpty(beat.beat_id)) {
      if (beatIds.has(beat.beat_id)) {
        addError(
          errors,
          'story.duplicate_beat_id',
          `${basePath}.beat_id`,
          `Duplicate story beat id: ${beat.beat_id}`,
        );
      }
      beatIds.add(beat.beat_id);
    }

    if (nonEmpty(beat.source_ref) && !declaredSourceRefs.has(beat.source_ref)) {
      addError(
        errors,
        'story.unresolved_source_ref',
        `${basePath}.source_ref`,
        `Story beat source_ref does not resolve to declared source or transcript material: ${beat.source_ref}`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
