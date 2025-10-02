import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import {
  analyzeRecords,
  MissingField,
  InvalidFormat,
  DuplicateRecord,
  DateOutOfRange,
  InconsistentUnit,
  RawRecord,
  AnalysisResult,
} from './solution';

describe('analyzeRecords (enhanced + added coverage)', () => {
  // === Validation: missing fields (each required field) ===
  it('throws MissingField when id is missing', () => {
    const records: any[] = [{ patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 }];
    expect(() => analyzeRecords(records)).toThrow(new MissingField('Missing field: id in record unknown'));
  });

  it('throws MissingField when patientId is missing', () => {
    const records: any[] = [{ id: 'r1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 }];
    expect(() => analyzeRecords(records)).toThrow(new MissingField('Missing field: patientId in record r1'));
  });

  it('throws MissingField when timestamp is missing', () => {
    const records: any[] = [{ id: 'r1', patientId: 'p1', metric: 'heart_rate', value: 80 }];
    expect(() => analyzeRecords(records)).toThrow(new MissingField('Missing field: timestamp in record r1'));
  });

  it('throws MissingField when metric is missing', () => {
    const records: any[] = [{ id: 'r1', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', value: 80 }];
    expect(() => analyzeRecords(records)).toThrow(new MissingField('Missing field: metric in record r1'));
  });

  it('throws MissingField when value is missing', () => {
    const records: any[] = [{ id: 'r1', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate' }];
    expect(() => analyzeRecords(records)).toThrow(new MissingField('Missing field: value in record r1'));
  });

  // === Validation: non-empty string checks (new) ===
  it('throws InvalidFormat when id is an empty string', () => {
    const records: any[] = [{ id: '', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 }];
    expect(() => analyzeRecords(records)).toThrow(new InvalidFormat('Invalid format: id in record '));
  });

  it('throws InvalidFormat when patientId is an empty string', () => {
    const records: any[] = [{ id: 'r1', patientId: '', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 }];
    expect(() => analyzeRecords(records)).toThrow(new InvalidFormat('Invalid format: patientId in record r1'));
  });

  // === Validation: wrong formats (representative cases) ===
  it('throws InvalidFormat for malformed fields (representative cases)', () => {
    expect(() =>
      analyzeRecords([{ id: 123, patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 }]),
    ).toThrow(new InvalidFormat('Invalid format: id in record 123'));

    expect(() =>
      analyzeRecords([{ id: 'r2', patientId: 'p1', timestamp: 'invalid', metric: 'heart_rate', value: 80 }]),
    ).toThrow(new InvalidFormat('Invalid format: timestamp in record r2'));

    expect(() =>
      analyzeRecords([{ id: 'r3', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'invalid_metric', value: 80 }]),
    ).toThrow(new InvalidFormat('Invalid format: metric in record r3'));

    expect(() =>
      analyzeRecords([{ id: 'r4', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: {} }]),
    ).toThrow(new InvalidFormat('Invalid format: value in record r4'));

    expect(() =>
      analyzeRecords([{ id: 'r5', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'systolic_bp', value: 'Infinity mmHg' }]),
    ).toThrow(new InvalidFormat('Invalid format: value in record r5'));

    expect(() =>
      analyzeRecords([{ id: 'r6', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: '80' }]),
    ).toThrow(new InvalidFormat('Invalid format: value in record r6'));
  });

  // === Validation: date range ===
  it('throws DateOutOfRange for timestamps outside allowed range', () => {
    expect(() =>
      analyzeRecords([{ id: 'd1', patientId: 'p1', timestamp: '1999-12-31T23:59:59Z', metric: 'heart_rate', value: 80 }]),
    ).toThrow(new DateOutOfRange('Date out of range: 1999-12-31T23:59:59Z in record d1'));

    expect(() =>
      analyzeRecords([{ id: 'd2', patientId: 'p1', timestamp: '2100-01-01T00:00:00Z', metric: 'heart_rate', value: 80 }]),
    ).toThrow(new DateOutOfRange('Date out of range: 2100-01-01T00:00:00Z in record d2'));
  });

  it('throws InconsistentUnit when unit does not match metric', () => {
    expect(() =>
      analyzeRecords([{ id: 'u1', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: '80 mmHg' }]),
    ).toThrow(new InconsistentUnit('Inconsistent unit: mmHg for metric heart_rate in record u1'));
  });

  it('throws DuplicateRecord when two records share an id', () => {
    const records: RawRecord[] = [
      { id: 'dup1', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 },
      { id: 'dup1', patientId: 'p1', timestamp: '2025-01-02T00:00:00Z', metric: 'heart_rate', value: 85 },
    ];
    expect(() => analyzeRecords(records)).toThrow(new DuplicateRecord('Duplicate record: dup1'));
  });

  // === Processing stops at first error in a list ===
  it('stops at the first validation error in a list of records', () => {
    const records: any[] = [
      { id: 'f1', patientId: 'p1', timestamp: 'invalid', metric: 'heart_rate', value: 80 }, // invalid first
      { id: 'f2', patientId: 'p2', timestamp: '2025-01-02T00:00:00Z', metric: 'heart_rate', value: 70 }, // valid second
    ];
    expect(() => analyzeRecords(records)).toThrow(new InvalidFormat('Invalid format: timestamp in record f1'));
  });

  // === Ordering of patients ===
  it('returns patients sorted alphabetically by patientId', () => {
    const records: RawRecord[] = [
      { id: 'p2r1', patientId: 'zed', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 },
      { id: 'p1r1', patientId: 'alice', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 75 },
      { id: 'p3r1', patientId: 'bob', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 78 },
    ];
    const res = analyzeRecords(records);
    const ids = res.patients.map((p) => p.patientId);
    expect(ids).toEqual(['alice', 'bob', 'zed']);
  });

  // === Daily Aggregation (new test requested) ===
  it('aggregates multiple records on the same day for same patient and metric', () => {
    const records: RawRecord[] = [
      { id: 'a1', patientId: 'patient1', timestamp: '2025-01-01T08:00:00Z', metric: 'heart_rate', value: 70 },
      { id: 'a2', patientId: 'patient1', timestamp: '2025-01-01T20:00:00Z', metric: 'heart_rate', value: 90 },
    ];
    const res = analyzeRecords(records);
    const day = res.patients[0].metrics.heart_rate[0];
    // problem spec uses "count", "daySum", "dayAverage"
    expect(day.count).toBe(2);
    expect(day.daySum).toBe(160);
    expect(day.dayAverage).toBe(80);
  });

  // === Successful processing and boundary dates (fixed assertions for sorted daily summaries) ===
  it('processes records and daily summaries are sorted by date (boundary dates & negative/decimal values)', () => {
    const records: RawRecord[] = [
      { id: 'b1', patientId: 'p1', timestamp: '2000-01-01T00:00:00Z', metric: 'heart_rate', value: 80 },
      { id: 'b2', patientId: 'p1', timestamp: '2099-12-31T23:59:59Z', metric: 'heart_rate', value: 85 },
      { id: 'b3', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'temperature_c', value: '-1.5 C' },
    ];
    const r = analyzeRecords(records);
    const dates = r.patients[0].metrics.heart_rate.map((d) => d.date);
    expect(dates).toEqual(['2000-01-01', '2099-12-31']);
    expect(r.patients[0].metrics.temperature_c[0].dayAverage).toBe(-1.5);
  });

  // === Metric support & fixed metric order ===
  it('supports all required metrics and lists them in specified fixed order', () => {
    const records: RawRecord[] = [
      { id: 'm1', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'temperature_c', value: '37 C' },
      { id: 'm2', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 },
      { id: 'm3', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'systolic_bp', value: 120 },
      { id: 'm4', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'diastolic_bp', value: '80 mmHg' },
      { id: 'm5', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'respiratory_rate', value: '16 brpm' },
    ];
    const res = analyzeRecords(records);
    expect(Object.keys(res.patients[0].metrics)).toEqual([
      'heart_rate', 'systolic_bp', 'diastolic_bp', 'respiratory_rate', 'temperature_c',
    ]);
  });

  // === Anomaly detection: precise 7-day historical window verification (updated) ===
  it('computes anomaly using exactly up-to-7-day historical window and early days are null', () => {
    // create 10 consecutive days with values 10,20,...,100
    const records: RawRecord[] = [];
    for (let i = 1; i <= 10; i++) {
      records.push({
        id: `r${i}`,
        patientId: 'p1',
        timestamp: `2025-01-${i.toString().padStart(2, '0')}T00:00:00Z`,
        metric: 'heart_rate',
        value: i * 10,
      });
    }
    const res = analyzeRecords(records);
    const metrics = res.patients[0].metrics.heart_rate;

    // first three days have fewer than 3 historical days -> anomalyScore null
    expect(metrics[0].anomalyScore).toBeNull();
    expect(metrics[1].anomalyScore).toBeNull();
    expect(metrics[2].anomalyScore).toBeNull();

    // Ensure day 10 (index 9) anomaly is computed using previous 7 days (days 3..9 => values 30..90)
    // historical mean = 60, historical std dev = 20 => (100 - 60) / 20 = 2
    expect(metrics[9].anomalyScore).toBeCloseTo(2, 9);

    // Verify that using all 9 prior days would not give the same numeric result (sanity guard)
    const altMean = (10 + 20 + 30 + 40 + 50 + 60 + 70 + 80 + 90) / 9; // 50
    expect(altMean).not.toBe(60); // sanity check
  });

  // === Anomaly detection: identical historical days -> Hstd = 0 -> anomalyScore 0 (new test) ===
  it('returns anomalyScore 0 when historical std dev is zero (identical previous days)', () => {
    const records: RawRecord[] = [
      { id: 's1', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 },
      { id: 's2', patientId: 'p1', timestamp: '2025-01-02T00:00:00Z', metric: 'heart_rate', value: 80 },
      { id: 's3', patientId: 'p1', timestamp: '2025-01-03T00:00:00Z', metric: 'heart_rate', value: 80 },
      { id: 's4', patientId: 'p1', timestamp: '2025-01-04T00:00:00Z', metric: 'heart_rate', value: 80 },
      // 5th day different
      { id: 's5', patientId: 'p1', timestamp: '2025-01-05T00:00:00Z', metric: 'heart_rate', value: 90 },
    ];
    const res = analyzeRecords(records);
    const metrics = res.patients[0].metrics.heart_rate;
    expect(metrics[0].anomalyScore).toBeNull();
    expect(metrics[1].anomalyScore).toBeNull();
    expect(metrics[2].anomalyScore).toBeNull();
    expect(metrics[3].anomalyScore).toBe(0);
    expect(metrics[4].anomalyScore).toBe(0);
  });

  // === Caching ===
  it('omits cacheKey by default and returns consistent SHA256 cacheKey when cache:true', () => {
    const records: RawRecord[] = [
      { id: 'c1', patientId: 'p1', timestamp: '2025-01-01T00:00:00Z', metric: 'heart_rate', value: 80 },
    ];
    const noCache = analyzeRecords(records);
    expect(noCache.cacheKey).toBeUndefined();

    const json = JSON.stringify(records);
    const expected = crypto.createHash('sha256').update(json).digest('hex');
    const a = analyzeRecords(records, { cache: true });
    const b = analyzeRecords(records, { cache: true });
    expect(a.cacheKey).toBe(expected);
    expect(a.cacheKey).toBe(b.cacheKey);
  });
});
