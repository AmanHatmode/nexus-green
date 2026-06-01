export interface ZoneData {
  ward_name: string;
  lat: number;
  lng: number;
  temperature: number;
  aqi: number;
  traffic_density: number;
  risk_score: number;
  color: string;
  state: string;
  last_updated: string;
  is_procedural?: boolean;
  // Optional historical max values (populated for searched/dynamic zones)
  hist_max_temp?: number;
  hist_max_aqi?: number;
  hist_max_risk?: number;
}

export const INDIA_CITIES: ZoneData[] = [
  { ward_name:'Nagpur',            state:'Maharashtra', lat:21.1458, lng:79.0882, temperature:45, aqi:180, traffic_density:600, risk_score:8.5, color:'red',    last_updated:'' },
  { ward_name:'Mumbai',            state:'Maharashtra', lat:19.0760, lng:72.8777, temperature:34, aqi:155, traffic_density:820, risk_score:6.8, color:'yellow', last_updated:'' },
  { ward_name:'Pune',              state:'Maharashtra', lat:18.5204, lng:73.8567, temperature:35, aqi:130, traffic_density:580, risk_score:6.0, color:'yellow', last_updated:'' },
  { ward_name:'Aurangabad',        state:'Maharashtra', lat:19.8762, lng:75.3433, temperature:41, aqi:158, traffic_density:380, risk_score:7.1, color:'red',    last_updated:'' },
  { ward_name:'Nashik',            state:'Maharashtra', lat:19.9975, lng:73.7898, temperature:38, aqi:145, traffic_density:420, risk_score:6.2, color:'yellow', last_updated:'' },
  { ward_name:'Solapur',           state:'Maharashtra', lat:17.6868, lng:75.9064, temperature:42, aqi:168, traffic_density:340, risk_score:7.4, color:'red',    last_updated:'' },
  { ward_name:'New Delhi',         state:'Delhi',       lat:28.6139, lng:77.2090, temperature:44, aqi:320, traffic_density:900, risk_score:9.4, color:'red',    last_updated:'' },
  { ward_name:'Lucknow',           state:'Uttar Pradesh',lat:26.8467, lng:80.9462, temperature:43, aqi:230, traffic_density:620, risk_score:8.8, color:'red',  last_updated:'' },
  { ward_name:'Kanpur',            state:'Uttar Pradesh',lat:26.4499, lng:80.3319, temperature:44, aqi:248, traffic_density:590, risk_score:9.0, color:'red',  last_updated:'' },
  { ward_name:'Varanasi',          state:'Uttar Pradesh',lat:25.3176, lng:82.9739, temperature:44, aqi:220, traffic_density:540, risk_score:8.7, color:'red',  last_updated:'' },
  { ward_name:'Agra',              state:'Uttar Pradesh',lat:27.1767, lng:78.0081, temperature:45, aqi:234, traffic_density:480, risk_score:9.0, color:'red',  last_updated:'' },
  { ward_name:'Jaipur',            state:'Rajasthan',   lat:26.9124, lng:75.7873, temperature:45, aqi:195, traffic_density:560, risk_score:8.8, color:'red',   last_updated:'' },
  { ward_name:'Jodhpur',           state:'Rajasthan',   lat:26.2389, lng:73.0243, temperature:47, aqi:185, traffic_density:350, risk_score:9.1, color:'red',   last_updated:'' },
  { ward_name:'Udaipur',           state:'Rajasthan',   lat:24.5854, lng:73.7125, temperature:38, aqi:110, traffic_density:280, risk_score:6.0, color:'yellow', last_updated:'' },
  { ward_name:'Bhopal',            state:'Madhya Pradesh',lat:23.2599, lng:77.4126, temperature:42, aqi:190, traffic_density:460, risk_score:8.2, color:'red', last_updated:'' },
  { ward_name:'Indore',            state:'Madhya Pradesh',lat:22.7196, lng:75.8577, temperature:41, aqi:185, traffic_density:520, risk_score:7.9, color:'red', last_updated:'' },
  { ward_name:'Ahmedabad',         state:'Gujarat',     lat:23.0225, lng:72.5714, temperature:43, aqi:200, traffic_density:700, risk_score:8.6, color:'red',   last_updated:'' },
  { ward_name:'Surat',             state:'Gujarat',     lat:21.1702, lng:72.8311, temperature:36, aqi:165, traffic_density:650, risk_score:6.8, color:'yellow', last_updated:'' },
  { ward_name:'Bengaluru',         state:'Karnataka',   lat:12.9716, lng:77.5946, temperature:31, aqi:128, traffic_density:850, risk_score:6.2, color:'yellow', last_updated:'' },
  { ward_name:'Mysuru',            state:'Karnataka',   lat:12.2958, lng:76.6394, temperature:30, aqi:95,  traffic_density:320, risk_score:3.8, color:'green',  last_updated:'' },
  { ward_name:'Hyderabad',         state:'Telangana',   lat:17.3850, lng:78.4867, temperature:40, aqi:182, traffic_density:820, risk_score:8.0, color:'red',   last_updated:'' },
  { ward_name:'Chennai',           state:'Tamil Nadu',  lat:13.0827, lng:80.2707, temperature:37, aqi:148, traffic_density:780, risk_score:7.0, color:'yellow', last_updated:'' },
  { ward_name:'Coimbatore',        state:'Tamil Nadu',  lat:11.0168, lng:76.9558, temperature:34, aqi:118, traffic_density:460, risk_score:5.5, color:'yellow', last_updated:'' },
  { ward_name:'Kolkata',           state:'West Bengal', lat:22.5726, lng:88.3639, temperature:36, aqi:170, traffic_density:900, risk_score:7.4, color:'red',   last_updated:'' },
  { ward_name:'Amritsar',          state:'Punjab',      lat:31.6340, lng:74.8723, temperature:40, aqi:195, traffic_density:480, risk_score:7.8, color:'red',   last_updated:'' },
  { ward_name:'Chandigarh',        state:'Punjab',      lat:30.7333, lng:76.7794, temperature:38, aqi:155, traffic_density:420, risk_score:6.8, color:'yellow', last_updated:'' },
  { ward_name:'Patna',             state:'Bihar',       lat:25.5941, lng:85.1376, temperature:43, aqi:225, traffic_density:580, risk_score:8.8, color:'red',   last_updated:'' },
  { ward_name:'Bhubaneswar',       state:'Odisha',      lat:20.2961, lng:85.8245, temperature:38, aqi:145, traffic_density:420, risk_score:6.8, color:'yellow', last_updated:'' },
  { ward_name:'Raipur',            state:'Chhattisgarh',lat:21.2514, lng:81.6296, temperature:42, aqi:175, traffic_density:380, risk_score:7.6, color:'red',   last_updated:'' },
  { ward_name:'Ranchi',            state:'Jharkhand',   lat:23.3441, lng:85.3096, temperature:37, aqi:155, traffic_density:380, risk_score:6.5, color:'yellow', last_updated:'' },
  { ward_name:'Kochi',             state:'Kerala',      lat:9.9312,  lng:76.2673, temperature:31, aqi:90,  traffic_density:480, risk_score:3.5, color:'green',  last_updated:'' },
  { ward_name:'Thiruvananthapuram',state:'Kerala',      lat:8.5241,  lng:76.9366, temperature:30, aqi:82,  traffic_density:380, risk_score:3.0, color:'green',  last_updated:'' },
  { ward_name:'Guwahati',          state:'Assam',       lat:26.1445, lng:91.7362, temperature:34, aqi:142, traffic_density:380, risk_score:5.8, color:'yellow', last_updated:'' },
  { ward_name:'Shimla',            state:'Himachal Pradesh',lat:31.1048, lng:77.1734, temperature:18, aqi:42, traffic_density:180, risk_score:1.2, color:'green', last_updated:'' },
  { ward_name:'Srinagar',          state:'J&K',         lat:34.0837, lng:74.7973, temperature:16, aqi:38,  traffic_density:210, risk_score:1.3, color:'green',  last_updated:'' },
  { ward_name:'Panaji',            state:'Goa',         lat:15.4909, lng:73.8278, temperature:30, aqi:72,  traffic_density:200, risk_score:2.4, color:'green',  last_updated:'' },
  { ward_name:'Visakhapatnam',     state:'Andhra Pradesh',lat:17.6868, lng:83.2185, temperature:35, aqi:138, traffic_density:520, risk_score:6.0, color:'yellow', last_updated:'' },
  { ward_name:'Vijayawada',        state:'Andhra Pradesh',lat:16.5062, lng:80.6480, temperature:40, aqi:165, traffic_density:480, risk_score:7.3, color:'red',  last_updated:'' },
];
