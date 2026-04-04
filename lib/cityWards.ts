// Pre-defined ward/area coordinates for high-priority Indian cities
// Each area has a fixed offset from the city's live temperature to ensure stable colors

export interface WardEntry {
  name: string;
  lat: number;
  lng: number;
  tempOffset: number;  // added to live city temp
  aqiOffset: number;   // added to live city AQI
  trafficOffset: number;
}

export const CITY_WARDS: Record<string, WardEntry[]> = {

  'Nagpur': [
    { name: 'Sitabuldi',     lat: 21.1458, lng: 79.0882, tempOffset:  6.5, aqiOffset:  80, trafficOffset:  320 },
    { name: 'Mahal',         lat: 21.1502, lng: 79.1007, tempOffset:  2.5, aqiOffset:  30, trafficOffset:  120 },
    { name: 'Itwari',        lat: 21.1494, lng: 79.1156, tempOffset:  5.2, aqiOffset:  95, trafficOffset:  280 },
    { name: 'Kamptee Road',  lat: 21.1678, lng: 79.1312, tempOffset:  5.8, aqiOffset:  75, trafficOffset:  240 },
    { name: 'Dharampeth',    lat: 21.1456, lng: 79.0712, tempOffset:  3.0, aqiOffset:  40, trafficOffset:  150 },
    { name: 'Dhantoli',      lat: 21.1312, lng: 79.0967, tempOffset:  2.0, aqiOffset:  25, trafficOffset:  100 },
    { name: 'Gopal Nagar',   lat: 21.1198, lng: 79.0891, tempOffset:  1.8, aqiOffset:  20, trafficOffset:   80 },
    { name: 'Wadi',          lat: 21.1612, lng: 79.0523, tempOffset:  1.5, aqiOffset:  15, trafficOffset:   50 },
    { name: 'Civil Lines',   lat: 21.1627, lng: 79.0849, tempOffset: -2.0, aqiOffset: -30, trafficOffset: -120 },
    { name: 'Ambazari',      lat: 21.1372, lng: 79.0631, tempOffset: -3.0, aqiOffset: -40, trafficOffset: -130 },
    { name: 'Hingna',        lat: 21.1108, lng: 79.0482, tempOffset: -1.5, aqiOffset: -25, trafficOffset: -100 },
    { name: 'Shivaji Nagar', lat: 21.1389, lng: 79.0756, tempOffset: -2.5, aqiOffset: -35, trafficOffset: -110 },
  ],

  'Mumbai': [
    { name: 'Dharavi',       lat: 19.0400, lng: 72.8547, tempOffset:  4.0, aqiOffset:  90, trafficOffset:  300 },
    { name: 'Kurla',         lat: 19.0726, lng: 72.8791, tempOffset:  3.5, aqiOffset:  75, trafficOffset:  280 },
    { name: 'Andheri East',  lat: 19.1136, lng: 72.8697, tempOffset:  2.5, aqiOffset:  60, trafficOffset:  400 },
    { name: 'Borivali',      lat: 19.2307, lng: 72.8567, tempOffset:  1.0, aqiOffset:  20, trafficOffset:  250 },
    { name: 'Dadar',         lat: 19.0178, lng: 72.8478, tempOffset:  3.0, aqiOffset:  65, trafficOffset:  350 },
    { name: 'Worli',         lat: 19.0096, lng: 72.8175, tempOffset:  1.5, aqiOffset:  35, trafficOffset:  280 },
    { name: 'Bandra',        lat: 19.0596, lng: 72.8295, tempOffset:  0.5, aqiOffset:  10, trafficOffset:  450 },
    { name: 'Colaba',        lat: 18.9067, lng: 72.8147, tempOffset: -1.0, aqiOffset: -15, trafficOffset:  180 },
    { name: 'Malad',         lat: 19.1872, lng: 72.8484, tempOffset:  2.0, aqiOffset:  40, trafficOffset:  300 },
    { name: 'Powai',         lat: 19.1176, lng: 72.9060, tempOffset: -0.5, aqiOffset: -10, trafficOffset:  200 },
    { name: 'Govandi',       lat: 19.0637, lng: 72.9225, tempOffset:  4.5, aqiOffset: 110, trafficOffset:  220 },
  ],

  'Delhi': [
    { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, tempOffset:  3.0, aqiOffset:  60, trafficOffset:  350 },
    { name: 'Chandni Chowk',   lat: 28.6506, lng: 77.2334, tempOffset:  5.0, aqiOffset: 100, trafficOffset:  400 },
    { name: 'Karol Bagh',      lat: 28.6514, lng: 77.1907, tempOffset:  4.0, aqiOffset:  85, trafficOffset:  380 },
    { name: 'Rohini',          lat: 28.7361, lng: 77.1149, tempOffset:  2.5, aqiOffset:  50, trafficOffset:  300 },
    { name: 'Dwarka',          lat: 28.5921, lng: 77.0460, tempOffset:  1.5, aqiOffset:  30, trafficOffset:  250 },
    { name: 'Okhla',           lat: 28.5498, lng: 77.2745, tempOffset:  4.5, aqiOffset:  90, trafficOffset:  420 },
    { name: 'Saket',           lat: 28.5245, lng: 77.2066, tempOffset:  1.0, aqiOffset:  20, trafficOffset:  200 },
    { name: 'Lajpat Nagar',    lat: 28.5677, lng: 77.2432, tempOffset:  2.0, aqiOffset:  45, trafficOffset:  350 },
    { name: 'Janakpuri',       lat: 28.6313, lng: 77.0839, tempOffset:  2.0, aqiOffset:  40, trafficOffset:  260 },
    { name: 'Vasant Kunj',     lat: 28.5209, lng: 77.1571, tempOffset:  0.5, aqiOffset:   5, trafficOffset:  150 },
  ],

  'Pune': [
    { name: 'Shivajinagar',    lat: 18.5308, lng: 73.8475, tempOffset:  2.0, aqiOffset:  40, trafficOffset:  350 },
    { name: 'Kothrud',         lat: 18.5074, lng: 73.8076, tempOffset:  0.5, aqiOffset:  10, trafficOffset:  200 },
    { name: 'Hadapsar',        lat: 18.5089, lng: 73.9260, tempOffset:  3.5, aqiOffset:  65, trafficOffset:  320 },
    { name: 'Pimpri',          lat: 18.6298, lng: 73.7997, tempOffset:  4.0, aqiOffset:  80, trafficOffset:  400 },
    { name: 'Hinjewadi',       lat: 18.5912, lng: 73.7389, tempOffset: -1.0, aqiOffset: -20, trafficOffset:  500 },
    { name: 'Viman Nagar',     lat: 18.5679, lng: 73.9143, tempOffset:  1.0, aqiOffset:  25, trafficOffset:  280 },
    { name: 'Koregaon Park',   lat: 18.5362, lng: 73.8929, tempOffset: -0.5, aqiOffset: -10, trafficOffset:  200 },
    { name: 'Yerawada',        lat: 18.5463, lng: 73.8975, tempOffset:  3.0, aqiOffset:  55, trafficOffset:  380 },
  ],

  'Hyderabad': [
    { name: 'Charminar',       lat: 17.3616, lng: 78.4747, tempOffset:  5.0, aqiOffset:  90, trafficOffset:  450 },
    { name: 'Hitech City',     lat: 17.4435, lng: 78.3772, tempOffset: -1.5, aqiOffset: -25, trafficOffset:  600 },
    { name: 'Banjara Hills',   lat: 17.4126, lng: 78.4483, tempOffset:  0.5, aqiOffset:  10, trafficOffset:  300 },
    { name: 'Secunderabad',    lat: 17.4399, lng: 78.4983, tempOffset:  2.5, aqiOffset:  50, trafficOffset:  380 },
    { name: 'Kukatpally',      lat: 17.4849, lng: 78.4138, tempOffset:  3.0, aqiOffset:  60, trafficOffset:  420 },
    { name: 'Jubilee Hills',   lat: 17.4270, lng: 78.4072, tempOffset: -0.5, aqiOffset: -10, trafficOffset:  310 },
    { name: 'Old City',        lat: 17.3616, lng: 78.4747, tempOffset:  4.5, aqiOffset:  88, trafficOffset:  400 },
  ],

  'Chennai': [
    { name: 'T Nagar',         lat: 13.0418, lng: 80.2341, tempOffset:  2.5, aqiOffset:  50, trafficOffset:  500 },
    { name: 'Anna Nagar',      lat: 13.0850, lng: 80.2101, tempOffset:  1.0, aqiOffset:  20, trafficOffset:  350 },
    { name: 'Adyar',           lat: 13.0012, lng: 80.2565, tempOffset: -0.5, aqiOffset: -10, trafficOffset:  280 },
    { name: 'Velachery',       lat: 12.9815, lng: 80.2180, tempOffset:  2.0, aqiOffset:  40, trafficOffset:  420 },
    { name: 'Tambaram',        lat: 12.9249, lng: 80.1000, tempOffset:  3.0, aqiOffset:  60, trafficOffset:  350 },
    { name: 'Guindy',          lat: 13.0067, lng: 80.2206, tempOffset:  2.0, aqiOffset:  45, trafficOffset:  320 },
  ],

  'Kolkata': [
    { name: 'Park Street',     lat: 22.5510, lng: 88.3524, tempOffset:  1.5, aqiOffset:  30, trafficOffset:  450 },
    { name: 'Salt Lake',       lat: 22.5755, lng: 88.4155, tempOffset: -1.0, aqiOffset: -20, trafficOffset:  350 },
    { name: 'Howrah',          lat: 22.5958, lng: 88.2636, tempOffset:  4.5, aqiOffset:  90, trafficOffset:  600 },
    { name: 'Behala',          lat: 22.4987, lng: 88.3176, tempOffset:  3.0, aqiOffset:  65, trafficOffset:  380 },
    { name: 'Jadavpur',        lat: 22.4985, lng: 88.3721, tempOffset:  1.0, aqiOffset:  20, trafficOffset:  280 },
    { name: 'Garden Reach',    lat: 22.5303, lng: 88.2955, tempOffset:  4.0, aqiOffset:  82, trafficOffset:  310 },
  ],

  'Bengaluru': [
    { name: 'MG Road',         lat: 12.9752, lng: 77.6094, tempOffset:  1.5, aqiOffset:  30, trafficOffset:  600 },
    { name: 'Whitefield',      lat: 12.9698, lng: 77.7499, tempOffset: -0.5, aqiOffset: -10, trafficOffset:  500 },
    { name: 'Koramangala',     lat: 12.9279, lng: 77.6271, tempOffset:  0.5, aqiOffset:  15, trafficOffset:  450 },
    { name: 'Electronic City', lat: 12.8458, lng: 77.6603, tempOffset: -1.0, aqiOffset: -20, trafficOffset:  650 },
    { name: 'Hebbal',          lat: 13.0353, lng: 77.5979, tempOffset:  2.5, aqiOffset:  55, trafficOffset:  580 },
    { name: 'Indiranagar',     lat: 12.9784, lng: 77.6408, tempOffset:  1.0, aqiOffset:  25, trafficOffset:  480 },
    { name: 'Marathahalli',    lat: 12.9591, lng: 77.6974, tempOffset:  2.8, aqiOffset:  62, trafficOffset:  700 },
  ],

  'Ahmedabad': [
    { name: 'Maninagar',       lat: 22.9948, lng: 72.6011, tempOffset:  5.0, aqiOffset:  85, trafficOffset:  400 },
    { name: 'Satellite',       lat: 23.0300, lng: 72.5221, tempOffset:  0.5, aqiOffset:  15, trafficOffset:  320 },
    { name: 'Bopal',           lat: 23.0261, lng: 72.4669, tempOffset:  0.5, aqiOffset:  10, trafficOffset:  280 },
    { name: 'Vastral',         lat: 23.0352, lng: 72.6564, tempOffset:  4.2, aqiOffset:  88, trafficOffset:  290 },
    { name: 'Naroda',          lat: 23.0802, lng: 72.6636, tempOffset:  4.5, aqiOffset:  90, trafficOffset:  320 },
  ],

  'Lucknow': [
    { name: 'Hazratganj',    lat: 26.8527, lng: 80.9418, tempOffset:  4.0, aqiOffset:  85, trafficOffset:  380 },
    { name: 'Gomti Nagar',   lat: 26.8631, lng: 81.0006, tempOffset:  2.5, aqiOffset:  55, trafficOffset:  320 },
    { name: 'Alambagh',      lat: 26.8106, lng: 80.9100, tempOffset:  3.5, aqiOffset:  75, trafficOffset:  360 },
  ],

  'Jaipur': [
    { name: 'Walled City',     lat: 26.9239, lng: 75.8267, tempOffset:  6.0, aqiOffset:  80, trafficOffset:  450 },
    { name: 'Mansarovar',      lat: 26.8587, lng: 75.7551, tempOffset:  2.0, aqiOffset:  35, trafficOffset:  350 },
    { name: 'Vaishali Nagar',  lat: 26.9105, lng: 75.7360, tempOffset:  2.5, aqiOffset:  40, trafficOffset:  400 },
    { name: 'Sindhi Camp',     lat: 26.9124, lng: 75.7873, tempOffset:  5.8, aqiOffset:  92, trafficOffset:  500 },
  ],
};
