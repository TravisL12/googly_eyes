import { TEye } from '../../types';

export const THROTTLE_DELAY = 30;
export const EYE_MIN = 10;
export const EYE_SIZE_FACTOR = 0.23;
export const IMG_ID_ATTR = 'googly-img-id';
export const PICTURE_LIMIT = 15;

export const NORMAL_EYE = 'normal';
export const BLUE_EYE = 'blue';
export const GLAM_EYE = 'glam';
export const STONED_EYE = 'stoned';
export const SLEEPY_EYE = 'sleepy';
export const DROOPY_EYE = 'droopy';
export const CAT_EYE = 'cat';
export const RANDOM_EYE: TEye = {
  name: 'random',
  innerColor: 'cornsilk',
  colors: ['cornsilk'],
};
export const EYE_TYPES: TEye[] = [
  {
    name: NORMAL_EYE,
    innerColor: '#333',
    colors: ['rgb(254, 190, 190)', 'rgb(245, 211, 176)'],
  },
  { name: BLUE_EYE, innerColor: '#1bafdd', colors: ['#1bafdd'] },
  { name: GLAM_EYE, innerColor: 'pink', colors: ['pink'] },
  {
    name: STONED_EYE,
    overlap: 0.3,
    innerColor: 'lightblue',
    colors: ['lightblue'],
  },
  { name: SLEEPY_EYE, innerColor: 'green', colors: ['green'] },
  { name: DROOPY_EYE, innerColor: 'magenta', colors: ['magenta'] },
  { name: CAT_EYE, overlap: -0.2, innerColor: 'purple', colors: ['purple'] },
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
