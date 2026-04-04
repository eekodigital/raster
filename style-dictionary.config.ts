import StyleDictionary from 'style-dictionary';
import type { Config } from 'style-dictionary/types';

const themes = ['light', 'dark', 'high-contrast'] as const;

const baseConfig: Config = {
  usesDtcg: true,
  source: [
    'tokens/color.primitive.json',
    'tokens/spacing.json',
    'tokens/typography.json',
    'tokens/border.json',
    'tokens/shadow.json',
    'tokens/motion.json',
    'tokens/opacity.json',
    'tokens/z-index.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: '',
      files: [
        {
          destination: 'src/tokens/primitives.css',
          format: 'css/variables',
          filter: (token) =>
            token.filePath.includes('primitive') || !token.filePath.includes('themes'),
          options: { selector: ':root', outputReferences: false },
        },
      ],
    },
  },
};

// Build primitives + theme-agnostic tokens
const sd = new StyleDictionary(baseConfig);
await sd.buildAllPlatforms();

// Build each theme as a separate [data-theme] selector
for (const theme of themes) {
  const themeConfig: Config = {
    usesDtcg: true,
    source: ['tokens/color.primitive.json'],
    include: [`tokens/themes/${theme}.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        files: [
          {
            destination: `src/tokens/theme-${theme}.css`,
            format: 'css/variables',
            filter: (token) => token.filePath.includes(`themes/${theme}`),
            options: {
              selector:
                theme === 'light' ? ":root,\n[data-theme='light']" : `[data-theme='${theme}']`,
              outputReferences: false,
            },
          },
        ],
      },
    },
  };

  const themeSd = new StyleDictionary(themeConfig);
  await themeSd.buildAllPlatforms();
}
