export const VAFI = (globalThis.VAFI ||= {});
VAFI.guard = {
  clean(source, sample) {
    const out = {};
    for (const [k, v] of Object.entries(sample || {})) {
      const val = source?.[k];
      if (val == null) continue;
      if (typeof val === typeof v) out[k] = val;
    }
    return out;
  }
};