export const getWeatherEmoji = (code: number) => {
  if (code >= 1 && code <= 3) return '⛅';
  if (code >= 45 && code <= 48) return '🌫️'; // Fog
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return '❄️';
  if (code >= 95) return '🌩️';
  return '☀️';
};
