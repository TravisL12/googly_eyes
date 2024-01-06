import { TEye } from '../../types';

export const THROTTLE_DELAY = 30;
export const EYE_MIN = 10;
export const EYE_SIZE_FACTOR = 0.23;
export const IMG_ID_ATTR = 'googly-img-id';
export const PICTURE_LIMIT = 15;
export const DEFAULT_INNER_SIZE = 0.6;

export const NORMAL_EYE = 'normal';
export const BLUE_EYE = 'blue';
export const GLAM_EYE = 'glam';
export const STONED_EYE = 'stoned';
export const SLEEPY_EYE = 'sleepy';
export const DROOPY_EYE = 'droopy';
export const CAT_EYE = 'cat';
const BLACK = '#333';
export const RANDOM_EYE: TEye = {
  name: 'random',
  innerSize: 1 * DEFAULT_INNER_SIZE,
  innerColor: 'HSL(130,17%,49%)',
  colors: ['HSL(130,17%,49%)', 'HSL(30,96%,60%)'],
};
export const EYE_TYPES: TEye[] = [
  {
    name: NORMAL_EYE,
    innerSize: 1 * DEFAULT_INNER_SIZE,
    innerColor: BLACK,
    colors: ['HSL(0,97%,87%)', 'HSL(30,78%,83%)'],
  },
  {
    name: BLUE_EYE,
    innerSize: 1 * DEFAULT_INNER_SIZE,
    innerColor: 'HSL(194,78%,20%)',
    colors: ['HSL(194,78%,49%)', 'HSL(194,78%,30%)'],
  },
  {
    name: GLAM_EYE,
    overlap: -0.1,
    innerSize: 1 * DEFAULT_INNER_SIZE,
    innerColor: 'HSL(350,100%,20%)',
    colors: ['HSL(350,100%,88%)', 'HSL(30,96%,60%)'],
  },
  {
    name: STONED_EYE,
    overlap: 0.2,
    innerSize: 1 * DEFAULT_INNER_SIZE,
    innerColor: 'HSL(0,0%,20%)',
    colors: ['HSL(0,100%,50%)', 'HSL(0,100%,29%)'],
  },
  {
    name: SLEEPY_EYE,
    overlap: 0.3,
    innerSize: 1 * DEFAULT_INNER_SIZE,
    innerColor: 'HSL(120,100%,20%)',
    colors: ['HSL(120,100%,45%)', 'HSL(120,100%,30%)'],
  },
  {
    name: DROOPY_EYE,
    innerSize: 1 * DEFAULT_INNER_SIZE,
    innerColor: 'HSL(200,100%,20%)',
    colors: ['HSL(220,100%,50%)', 'HSL(200,100%,40%)'],
  },
  {
    name: CAT_EYE,
    overlap: -0.2,
    innerSize: 0.6 * DEFAULT_INNER_SIZE,
    innerColor: 'HSL(300,100%,20%)',
    colors: ['HSL(300,100%,25%)', 'HSL(300,100%,10%)'],
  },
];

// storage options
export const IS_GOOGLY_ON = 'isGooglyOn';
export const HAS_EYELIDS = 'hasEyelids';
export const PICTURE_LIMIT_SETTING = 'facesWithEyesLimit';
export const EYE_TYPE_IDX = 'eyeTypeIdx';
export const SETTING_VALUES = [
  HAS_EYELIDS,
  PICTURE_LIMIT_SETTING,
  IS_GOOGLY_ON,
  EYE_TYPE_IDX,
];
