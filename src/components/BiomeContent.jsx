// BiomeContent — time-state colour palette for each biome.
// PNG assets live in /public/assets/biomes/{biome}/{sky,midground,foreground}.png
//
// skyImgOpacity: how visible the craftpix sky PNG is at this time state.
//   Day-sky biomes (mountains, meadow): high at AWAY, low at SLEEP.
//   Night-sky biomes (forest, port):    low at AWAY, high at SLEEP.

export const BIOME_THEMES = {
  forest: {
    // Night sky asset (starfield + moon glow)
    AWAY: {
      skyTop: '#2A7A50', skyBottom: '#80D0A0',
      skyImgOpacity: 0.10,
      boxGlow: 0, label: 'Forest · Daytime', labelFill: '#74C69D',
    },
    HOME: {
      skyTop: '#3D1C4A', skyBottom: '#7B3F6E',
      skyImgOpacity: 0.50,
      boxGlow: 1, label: 'Forest · Evening', labelFill: '#9B7250',
    },
    SLEEP: {
      skyTop: '#080E18', skyBottom: '#101828',
      skyImgOpacity: 0.95,
      boxGlow: 0, label: 'Forest · Night', labelFill: '#40C8A0',
    },
  },
  port: {
    // Night sky asset (purple-mauve + teal aurora)
    AWAY: {
      skyTop: '#0077B6', skyBottom: '#90E0EF',
      skyImgOpacity: 0.10,
      boxGlow: 0, label: 'Port · Daytime', labelFill: '#0096C7',
    },
    HOME: {
      skyTop: '#4A2870', skyBottom: '#8850A8',
      skyImgOpacity: 0.55,
      boxGlow: 1, label: 'Port · Evening', labelFill: '#F59E0B',
    },
    SLEEP: {
      skyTop: '#3A2858', skyBottom: '#584878',
      skyImgOpacity: 0.95,
      boxGlow: 0, label: 'Port · Night', labelFill: '#4488CC',
    },
  },
  mountains: {
    // Day sky asset (teal-to-cream gradient)
    AWAY: {
      skyTop: '#38C8D0', skyBottom: '#D8ECC8',
      skyImgOpacity: 0.90,
      boxGlow: 0, label: 'Mountains · Daytime', labelFill: '#A78BFA',
    },
    HOME: {
      skyTop: '#C06030', skyBottom: '#E89060',
      skyImgOpacity: 0.38,
      boxGlow: 1, label: 'Mountains · Evening', labelFill: '#E879F9',
    },
    SLEEP: {
      skyTop: '#030712', skyBottom: '#0F0A20',
      skyImgOpacity: 0.08,
      boxGlow: 0, label: 'Mountains · Night', labelFill: '#7C3AED',
    },
  },
  meadow: {
    // Day sky asset (teal-to-silver gradient)
    AWAY: {
      skyTop: '#38C8C8', skyBottom: '#C8D0C0',
      skyImgOpacity: 0.90,
      boxGlow: 0, label: 'Meadow · Daytime', labelFill: '#16A34A',
    },
    HOME: {
      skyTop: '#C2410C', skyBottom: '#FB923C',
      skyImgOpacity: 0.35,
      boxGlow: 1, label: 'Meadow · Evening', labelFill: '#A3E635',
    },
    SLEEP: {
      skyTop: '#0C0A24', skyBottom: '#1E1B3A',
      skyImgOpacity: 0.08,
      boxGlow: 0, label: 'Meadow · Night', labelFill: '#84CC16',
    },
  },
}
