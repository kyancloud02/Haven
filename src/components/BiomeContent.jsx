// BiomeContent — time-state colour palette for each biome.
// PNG assets live in /public/assets/biomes/{biome}/{sky,midground,foreground}.png

export const BIOME_THEMES = {
  forest: {
    AWAY: {
      skyTop:'#1A5C3A', skyBottom:'#74C69D',
      boxGlow:0, label:'Forest · Daytime', labelFill:'#74C69D',
    },
    HOME: {
      skyTop:'#3D1C4A', skyBottom:'#7B3F6E',
      boxGlow:1, label:'Forest · Evening', labelFill:'#9B7250',
    },
    SLEEP: {
      skyTop:'#020A0A', skyBottom:'#040F10',
      boxGlow:0, label:'Forest · Night', labelFill:'#40C8A0',
    },
  },
  port: {
    AWAY: {
      skyTop:'#0077B6', skyBottom:'#90E0EF',
      boxGlow:0, label:'Port · Daytime', labelFill:'#0096C7',
    },
    HOME: {
      skyTop:'#C25018', skyBottom:'#F59E0B',
      boxGlow:1, label:'Port · Evening', labelFill:'#F59E0B',
    },
    SLEEP: {
      skyTop:'#050A2A', skyBottom:'#0A1545',
      boxGlow:0, label:'Port · Night', labelFill:'#4488CC',
    },
  },
  mountains: {
    AWAY: {
      skyTop:'#2D0D5A', skyBottom:'#7C3AED',
      boxGlow:0, label:'Mountains · Daytime', labelFill:'#A78BFA',
    },
    HOME: {
      skyTop:'#6B21A8', skyBottom:'#DB2777',
      boxGlow:1, label:'Mountains · Evening', labelFill:'#E879F9',
    },
    SLEEP: {
      skyTop:'#030712', skyBottom:'#0F0A20',
      boxGlow:0, label:'Mountains · Night', labelFill:'#7C3AED',
    },
  },
  meadow: {
    AWAY: {
      skyTop:'#0EA5E9', skyBottom:'#BAE6FD',
      boxGlow:0, label:'Meadow · Daytime', labelFill:'#16A34A',
    },
    HOME: {
      skyTop:'#C2410C', skyBottom:'#FB923C',
      boxGlow:1, label:'Meadow · Evening', labelFill:'#A3E635',
    },
    SLEEP: {
      skyTop:'#0C0A24', skyBottom:'#1E1B3A',
      boxGlow:0, label:'Meadow · Night', labelFill:'#84CC16',
    },
  },
}
