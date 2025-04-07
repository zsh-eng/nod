import { createAnimations } from '@tamagui/animations-react-native';

export const animations = createAnimations({
  quicksnap: {
    type: 'spring',
    damping: 20, // High damping to minimize bounce
    stiffness: 300, // High stiffness for speed
    mass: 0.5, // Lower mass to make it more responsive
  },
  // Quick response animations
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },

  // Standard, bouncy animation
  bouncy: {
    type: 'spring',
    damping: 9,
    mass: 0.9,
    stiffness: 150,
  },

  lazy: {
    type: 'spring',
    damping: 18,
    stiffness: 50,
  },
  none: {
    type: 'timing', // Use timing instead of spring
    duration: 300, // Zero duration means it happens instantly
  },
}) as any;
