// CafeSoft Aqua · sistema de diseño
// Espaciado, radios, tipografía y movimiento.
// Solo tokens visuales: no cambia reglas de negocio.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const typography = {
  display: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  subheading: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 21 },
  small: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
  caption: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
};

export const shadow = {
  card: {
    shadowColor: '#043A4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  raised: {
    shadowColor: '#043A4C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 7,
  },
};

export const motion = {
  press: { duration: 140 },
  enter: { duration: 420 },
  stagger: 55,
  spring: { duration: 380, dampingRatio: 0.85 },
};

export default { spacing, radius, typography, shadow, motion };
