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
export const RANDOM_EYE = { name: 'random', colors: ['cornsilk'] };
export const EYE_TYPES = [
  { name: NORMAL_EYE, colors: ['rgb(254, 190, 190)', 'rgb(245, 211, 176)'] },
  { name: BLUE_EYE, colors: ['#1bafdd'] },
  { name: GLAM_EYE, colors: ['pink'] },
  { name: STONED_EYE, colors: ['lightblue'] },
  { name: SLEEPY_EYE, colors: ['green'] },
  { name: DROOPY_EYE, colors: ['magenta'] },
  { name: CAT_EYE, colors: ['purple'] },
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
