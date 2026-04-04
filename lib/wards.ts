export interface Ward {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const WARDS: Ward[] = [
  { id: 'sitabuldi',     name: 'Sitabuldi',     lat: 21.1458, lng: 79.0882 },
  { id: 'mahal',         name: 'Mahal',         lat: 21.1502, lng: 79.1007 },
  { id: 'civil_lines',   name: 'Civil Lines',   lat: 21.1627, lng: 79.0849 },
  { id: 'ambazari',      name: 'Ambazari',      lat: 21.1372, lng: 79.0631 },
  { id: 'dharampeth',    name: 'Dharampeth',    lat: 21.1456, lng: 79.0712 },
  { id: 'itwari',        name: 'Itwari',        lat: 21.1494, lng: 79.1156 },
  { id: 'hingna',        name: 'Hingna',        lat: 21.1108, lng: 79.0482 },
  { id: 'wadi',          name: 'Wadi',          lat: 21.1612, lng: 79.0523 },
  { id: 'kamptee_road',  name: 'Kamptee Road',  lat: 21.1678, lng: 79.1312 },
  { id: 'gopal_nagar',   name: 'Gopal Nagar',   lat: 21.1198, lng: 79.0891 },
  { id: 'shivaji_nagar', name: 'Shivaji Nagar', lat: 21.1389, lng: 79.0756 },
  { id: 'dhantoli',      name: 'Dhantoli',      lat: 21.1312, lng: 79.0967 },
];

export function calcRiskScore(temp: number, aqi: number, traffic: number) {
  const tempW = temp > 40 ? 10 : temp >= 35 ? 6 : 3;
  const aqiW  = aqi  > 200 ? 10 : aqi  >= 100 ? 6 : 3;
  const traW  = traffic > 500 ? 10 : traffic >= 200 ? 6 : 3;
  return parseFloat((tempW * 0.4 + aqiW * 0.3 + traW * 0.3).toFixed(2));
}

export function scoreToColor(score: number): 'red' | 'yellow' | 'green' {
  if (score >= 7) return 'red';
  if (score >= 4) return 'yellow';
  return 'green';
}
