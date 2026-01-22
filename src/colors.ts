/**
 * Foundational Color System
 * 
 * This file contains all foundational colors extracted from Figma.
 * Colors are organized by family (Neutral, Purple, Beige, Blue, Red, Orange, Green)
 * and series (Magic, Base, Alpha).
 * 
 * Use these foundational colors to create semantic colors for your application.
 */

export const colors = {
  neutral: {
    magic: {
      200: '#d6d9ef',
      300: '#c2c5de',
      400: '#afb2ce',
      600: '#707393',
      700: '#5c5f7b',
      800: '#4a4c64',
      alpha: {
        400: {
          alpha1: '#afb2ce14',
          alpha2: '#afb2ce1f',
          alpha3: '#afb2ce33',
          alpha4: '#afb2ce47',
          alpha5: '#afb2ce5c',
        },
        600: {
          alpha1: '#70739305',
          alpha2: '#7073930f',
          alpha3: '#7073931a',
          alpha4: '#70739329',
          alpha5: '#70739338',
        },
      },
    },
    base: {
      0: '#ffffff',
      50: '#fbfcfd',
      100: '#f4f5f9',
      150: '#ededf3',
      200: '#dddde5',
      300: '#c3c3cc',
      400: '#9d9da8',
      500: '#70707d',
      600: '#535461',
      700: '#363644',
      800: '#272735',
      900: '#1e1e2a',
      950: '#171721',
      1000: '#10101a',
    },
  },
  purple: {
    magic: {
      200: '#cdddff',
      300: '#b4c9f8',
      400: '#9cb4e8',
      600: '#5266eb',
      700: '#4354c8',
      800: '#3442a6',
      alpha: {
        400: {
          alpha1: '#9cb4e814',
          alpha2: '#9cb4e81f',
          alpha3: '#9cb4e833',
          alpha4: '#9cb4e847',
          alpha5: '#9cb4e85c',
        },
        600: {
          alpha1: '#5266eb05',
          alpha2: '#5266eb0f',
          alpha3: '#5266eb1a',
          alpha4: '#5266eb29',
          alpha5: '#5266eb38',
        },
      },
    },
    base: {
      0: '#ffffff',
      50: '#fbfbff',
      100: '#f5f4fd',
      150: '#edecfb',
      200: '#dddbf4',
      300: '#c3c0df',
      400: '#9d98c3',
      500: '#716b96',
      600: '#554e7b',
      700: '#383255',
      800: '#28253b',
      900: '#1f1d2d',
      950: '#181623',
      1000: '#11101a',
    },
  },
  beige: {
    magic: {
      200: '#e7dab6',
      300: '#d5c69f',
      400: '#c3b389',
      600: '#8a753c',
      700: '#736131',
      800: '#5d4e27',
      alpha: {
        400: {
          alpha1: '#c3b38914',
          alpha2: '#c3b3891f',
          alpha3: '#c3b38933',
          alpha4: '#c3b38947',
          alpha5: '#c3b3895c',
        },
        600: {
          alpha1: '#8a753c05',
          alpha2: '#8a753c0f',
          alpha3: '#8a753c1a',
          alpha4: '#8a753c29',
          alpha5: '#8a753c38',
        },
      },
    },
    base: {
      0: '#ffffff',
      50: '#fcfcfa',
      100: '#f6f5f2',
      150: '#efeee9',
      200: '#e0ded7',
      300: '#c8c4b8',
      400: '#a39e91',
      500: '#767165',
      600: '#5a5548',
      700: '#3a3831',
      800: '#2a2924',
      900: '#201f1c',
      950: '#181818',
      1000: '#121212',
    },
  },
  blue: {
    magic: {
      200: '#a9e6f6',
      300: '#8fd0e1',
      400: '#77becf',
      600: '#007f95',
      700: '#00697b',
      800: '#075462',
      alpha: {
        400: {
          alpha1: '#76bdff14',
          alpha2: '#76bdff1f',
          alpha3: '#76bdff33',
          alpha4: '#76bdff47',
          alpha5: '#76bdff5c',
        },
        600: {
          alpha1: '#0078b905',
          alpha2: '#0078b90f',
          alpha3: '#0078b91a',
          alpha4: '#0078b929',
          alpha5: '#0078b938',
        },
      },
    },
    base: {
      0: '#ffffff',
      50: '#f8fcfd',
      150: '#e4f0f5',
      200: '#d1e1e8',
      300: '#b0c9d3',
      400: '#84a4b1',
      500: '#547886',
      600: '#335c6b',
      700: '#183d4a',
      800: '#0f2d37',
      900: '#112228',
      950: '#111a1d',
      1000: '#0c1316',
    },
  },
  red: {
    magic: {
      200: '#fdcbd9',
      300: '#fdb2c8',
      400: '#fc92b4',
      600: '#d03275',
      700: '#b0175f',
      800: '#93004c',
      alpha: {
        400: {
          alpha1: '#fc92b414',
          alpha2: '#fc92b41f',
          alpha3: '#fc92b433',
          alpha4: '#fc92b447',
          alpha5: '#fc92b45c',
        },
        600: {
          alpha1: '#d0327505',
          alpha2: '#d032750f',
          alpha3: '#d032751a',
          alpha4: '#d0327529',
          alpha5: '#d0327538',
        },
      },
    },
    base: {
      0: '#ffffff',
      50: '#fefbfc',
      100: '#fdf2f5',
      150: '#fbe8ed',
      200: '#fdd0dc',
      300: '#eab2c2',
      400: '#d2849c',
      500: '#a4546f',
      600: '#803b53',
      700: '#5a2236',
      800: '#411a28',
      900: '#2f161e',
      950: '#201418',
      1000: '#151011',
    },
  },
  orange: {
    magic: {
      200: '#fecdb7',
      300: '#ffb392',
      400: '#fc9b6f',
      600: '#c45000',
      700: '#a44200',
      800: '#863400',
      alpha: {
        400: {
          alpha1: '#fc9b6f14',
          alpha2: '#fc9b6f1f',
          alpha3: '#fc9b6f33',
          alpha4: '#fc9b6f47',
          alpha5: '#fc9b6f5c',
        },
        600: {
          alpha1: '#c4500005',
          alpha2: '#c450000f',
          alpha3: '#c450001a',
          alpha4: '#c4500029',
          alpha5: '#c4500038',
        },
      },
    },
    base: {
      0: '#ffffff',
      50: '#fffbf9',
      100: '#fdf3ef',
      150: '#faeae3',
      200: '#f8d6c7',
      300: '#edb69d',
      400: '#d18b6c',
      500: '#9c6045',
      600: '#764833',
      700: '#4e2f21',
      800: '#38231a',
      900: '#281c17',
      950: '#1c1715',
      1000: '#15100f',
    },
  },
  green: {
    magic: {
      200: '#bbe7cc',
      300: '#95d5af',
      400: '#77c599',
      600: '#188554',
      700: '#036e43',
      800: '#0a5736',
      alpha: {
        400: {
          alpha1: '#77c59914',
          alpha2: '#77c5991f',
          alpha3: '#77c59933',
          alpha4: '#77c59947',
          alpha5: '#77c5995c',
        },
        600: {
          alpha1: '#18855405',
          alpha2: '#1885540f',
          alpha3: '#1885541a',
          alpha4: '#18855429',
          alpha5: '#18855438',
        },
      },
    },
    base: {
      0: '#ffffff',
      50: '#fafcfb',
      100: '#f1f7f3',
      150: '#e7f1ea',
      200: '#d3e3d8',
      300: '#b4cbbc',
      400: '#88a794',
      500: '#5b7a67',
      600: '#405d4c',
      700: '#293d31',
      800: '#1f2d24',
      900: '#1a211d',
      950: '#161917',
      1000: '#0c0f0e',
    },
  },
} as const;

/**
 * Helper function to get a color value
 * @example getColor('neutral', 'base', 500) // returns '#70707d'
 */
export function getColor(
  family: keyof typeof colors,
  series: 'magic' | 'base',
  shade: number | string
): string {
  const colorFamily = colors[family];
  if (!colorFamily) {
    throw new Error(`Color family "${family}" not found`);
  }

  const colorSeries = colorFamily[series];
  if (!colorSeries) {
    throw new Error(`Color series "${series}" not found in ${family}`);
  }

  if (series === 'magic' && shade === 'alpha') {
    return (colorSeries as { alpha: unknown }).alpha as string;
  }

  const colorValue = (colorSeries as any)[shade];
  if (!colorValue) {
    throw new Error(`Shade "${shade}" not found in ${family}.${series}`);
  }

  return colorValue;
}

/**
 * Type-safe color accessor
 */
export type ColorFamily = keyof typeof colors;
export type ColorSeries = 'magic' | 'base';
export type NeutralShade = keyof typeof colors.neutral.base | keyof typeof colors.neutral.magic;
export type PurpleShade = keyof typeof colors.purple.base | keyof typeof colors.purple.magic;
export type BeigeShade = keyof typeof colors.beige.base | keyof typeof colors.beige.magic;
export type BlueShade = keyof typeof colors.blue.base | keyof typeof colors.blue.magic;
export type RedShade = keyof typeof colors.red.base | keyof typeof colors.red.magic;
export type OrangeShade = keyof typeof colors.orange.base | keyof typeof colors.orange.magic;
export type GreenShade = keyof typeof colors.green.base | keyof typeof colors.green.magic;
