import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';

describe('Design Tokens (Figma Node 29:1190)', () => {
  it('should have exact Figma brand colors', () => {
    expect(COLORS.primary).toBe('#00685F');
    expect(COLORS.primaryDark).toBe('#008378');
    expect(COLORS.textHeading).toBe('#0B1C30');
    expect(COLORS.textBody).toBe('#3D4947');
    expect(COLORS.screenBg).toBe('#F8F9FF');
    expect(COLORS.inputBg).toBe('#EFF4FF');
  });

  it('should specify typography weights and sizes', () => {
    expect(TYPOGRAPHY.weights.regular).toBe('400');
    expect(TYPOGRAPHY.weights.bold).toBe('700');
    expect(TYPOGRAPHY.sizes.title).toBe(16);
  });

  it('should define consistent border radii and shadows', () => {
    expect(BORDER_RADIUS.full).toBe(9999);
    expect(BORDER_RADIUS.lg).toBe(12);
    expect(BORDER_RADIUS.xl).toBe(16);
    expect(SHADOWS.card).toBeDefined();
    expect(SHADOWS.card.shadowColor).toBe('#000');
  });
});
