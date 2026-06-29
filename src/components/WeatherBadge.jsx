/**
 * WeatherBadge — Affiche les conditions météo du match.
 * Supporte les icônes : ☀️ Dégagé, 🌧️ Pluie, ⛈️ Orage, 🌡️ Chaud, 💨 Vent, ❄️ Froid
 */
export default function WeatherBadge({ weather }) {
  if (!weather || !weather.label) return null;

  const colorMap = {
    '☀️': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    '🌧️': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    '⛈️': 'text-red-400 bg-red-500/10 border-red-500/20',
    '🌡️': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    '💨': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    '❄️': 'text-sky-300 bg-sky-500/10 border-sky-500/20',
  };

  const prefix = weather.label.charAt(0) + weather.label.charAt(1);
  const style = colorMap[prefix] || 'text-slate-400 bg-slate-800/50 border-slate-700';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${style}`}
      title={
        weather.temp_kickoff
          ? `${weather.temp_kickoff}°C · ${weather.precip_mm}mm · ${weather.wind_kmh}km/h`
          : weather.label
      }
    >
      <span>{weather.label}</span>
      {weather.temp_kickoff && (
        <span className="opacity-70">{weather.temp_kickoff}°</span>
      )}
    </span>
  );
}
