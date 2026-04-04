import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// Comprehensive zone profiles covering all major Indian cities
const WARD_PROFILES: Record<string, string> = {
  // === NAGPUR ===
  'Sitabuldi':        'Dense commercial market zone with hundreds of street vendors and severe vehicular congestion at Sitabuldi intersection. Near-zero tree canopy, extreme concrete heat absorption, Railway Station adding massive pedestrian crowding. No permeable surfaces remain — full urban heat island.',
  'Mahal':            'Historic old city with dense, unplanned housing and narrow lanes that block airflow circulation completely. Near Mahal vegetable market, ageing infrastructure, and almost zero green cover. One of the highest population-density zones in Nagpur.',
  'Civil Lines':      'Government administrative zone with wide, tree-lined roads and large bungalow compounds. Hosts NMC HQ and Divisional Commissioner offices. Has existing mature trees providing shade. Relatively stable urban microclimate.',
  'Ambazari':         'Residential area immediately adjacent to Ambazari Lake and botanical garden. The lake and garden together provide a meaningful urban cooling buffer. Well-maintained parks. One of Nagpur\'s cleaner green corridors.',
  'Dharampeth':       'Upscale mixed-use zone. Dense multi-storey buildings create canyon effect trapping heat. Major hospitals (Lata Mangeshkar Hospital) generate continuous emergency vehicle traffic. Commercial spine on Dharampeth main road adds to congestion.',
  'Itwari':           'Critical wholesale textile trading hub with extreme truck and loading-vehicle traffic. Dense multi-storey storage warehouses trap radiated heat overnight. Adjacent Itwari Railway Station causes massive crowd and congestion spikes.',
  'Hingna':           'Peripheral MIDC industrial zone with heavy manufacturing units generating significant thermal exhaust. High PM2.5 from factories. Worker density spikes during day shifts but low residential population.',
  'Wadi':             'Industrial-residential transitional zone. Cement and chemical manufacturing units nearby. MSRTC bus congestion at peak hours. Rail crossings near Wadi station cause twice-daily traffic gridlock.',
  'Kamptee Road':     'Major 4-lane arterial highway corridor connecting to Kamptee cantonment. Linear urban heat island due to continuous asphalt surface and minimal roadside canopy. Heavy freight and military vehicle movement round the clock.',
  'Gopal Nagar':      'Dense low-to-middle income residential colony. High two-wheeler density, open drainage causing local AQI uplift. Very limited park access. Ground surfaces mostly paved with minimal vegetation.',
  'Shivaji Nagar':    'Planned residential locality near Nagpur Railway Colony. Has moderate street tree cover and organized layout. Lower commercial activity makes it a relative cool island versus central wards.',
  'Dhantoli':         'Mixed residential and institutional zone. Dhantoli Park provides a meaningful green island. However, surrounding concrete multi-storey buildings still accumulate and radiate significant heat by evening.',

  // === MUMBAI ===
  'Dharavi':          'Asia\'s largest informal settlement — extreme density, minimal green cover, open drains, and metal roofing intensifying heat radiation. High industrial micro-unit activity. Critical AQI zone due to leather and textile processing.',
  'Kurla':            'Dense commercial and transit hub around Kurla Railway Station. Commercial spine along LBS Marg creates heat trapping. High pedestrian and vehicular density at peak hours, extremely limited tree cover.',
  'Andheri East':     'Major IT and commercial node near international airport. High-rise commercial buildings with glass facades reflecting and intensifying solar radiation. SEEPZ industrial estate adds particulate load.',
  'Borivali':         'Residential zone adjacent to Sanjay Gandhi National Park — a significant ecological buffer providing natural cooling. Air quality considerably better than south Mumbai. Moderate tree cover on SGNP periphery.',
  'Dadar':            'Dense mixed-use junction — major railway interchange plus flower and vegetable markets generating significant organic waste decomposition heat. High surface impermeability.',
  'Worli':            'Upscale sea-facing residential and commercial zone. Sea breeze provides natural temperature moderation. BKC proximity drives commercial real estate density.',
  'Bandra':           'High-value residential and commercial zone. Hill Road and Linking Road commercial corridors contribute to traffic density. Bandstand promenade provides limited coastal wind corridor.',
  'Colaba':           'Southernmost tip of Mumbai — sea breeze on three sides provides natural cooling. Heritage low-rise buildings allow better airflow than interior high-density zones. Relatively stable microcliamte.',
  'Malad':            'Residential suburb with moderate density. Mindspace IT park adds peak-hour traffic. Limited green infrastructure for the population density it supports.',
  'Powai':            'Planned IT township around Powai Lake. IIT Bombay campus provides significant tree cover and natural buffer. Hiranandani township\'s planned layout allows better airflow than organic urban fabric.',

  // === DELHI ===
  'Connaught Place':  'Central business district — premium commercial and government offices with high pedestrian traffic. Wide radial roads and some green round points but predominantly sealed surfaces. Urban heat island core.',
  'Chandni Chowk':    'Historic bazaar district with extreme pedestrian density, narrow lanes, continuous vehicular idling, and almost zero canopy. One of Delhi\'s most thermally stressed zones. Pollution and congestion compound heat stress.',
  'Karol Bagh':       'Dense commercial and residential mixed zone. High surface sealing, narrow commercial lanes, and continuous retail activity creating sustained heat retention through the night.',
  'Rohini':           'Planned residential sector in North-West Delhi. Grid layout allows better airflow than unplanned areas. Some sector parks but tree cover density remains insufficient for summer temperatures.',
  'Dwarka':           'Large planned residential sub-city in South-West Delhi. DDA sector layout with some green belts. Lower industrial activity makes it relatively better managed than east Delhi zones.',
  'Okhla':            'Dense industrial and commercial corridor. Okhla Industrial Area generates significant particulate and thermal load. Close to Yamuna floodplains but industrial discharge affects air quality severely.',
  'Saket':            'Upscale south Delhi commercial and residential zone. Select City Walk mall generates significant heat from HVAC exhaust. Some tree cover on residential roads provides partial relief.',

  // === PUNE ===
  'Shivajinagar':     'Administrative and commercial core of Pune. PMC headquarters zone. Wide roads with moderate tree cover — better than most Indian CBDs. Rail station adds peak-hour congestion.',
  'Kothrud':          'Dense middle-class residential suburb. Good locality-level green cover but high two-wheeler density. Relatively stable microclimate compared to Hadapsar.',
  'Hadapsar':         'Rapidly expanding IT-residential fringe. Magarpatta and SP Infocity campuses have internal green zones but surrounding infrastructure is under-developed. Construction dust adding to AQI.',
  'Pimpri':           'PCMC industrial and residential zone. MIDC units generate significant thermal and particulate load. High worker commuter density at shift changes.',
  'Hinjewadi':        'Rajiv Gandhi IT Park — planned campus-style IT zone with significant internal landscaping. However, massive peak-hour traffic causing severe congestion on approach roads.',
  'Koregaon Park':    'Upscale urban residential and hospitality zone. Good private tree cover, lower commercial density. One of Pune\'s cooler microclimate pockets due to established garden heritage.',

  // === HYDERABAD ===
  'Charminar':        'Historic old city hub. Extremely dense, mostly organic urban form with narrow lanes and minimal canopy. Laad Bazaar and surrounding markets generate continuous congestion and thermal stress. Critical heritage zone where redevelopment options are constrained by ASI regulations.',

  // === CHENNAI ===
  'T Nagar':          'One of India\'s densest commercial retail zones. Extreme pedestrian and vehicle density, especially at Ranganathan Street. Almost zero canopy. Ground surface fully sealed.',
  'Anna Nagar':       'Well-planned residential district with wide roads and good tree cover. Anna Nagar Tower Park provides a green node. Among Chennai\'s more thermally stable residential areas.',
  'Adyar':            'Coastal residential locality near Adyar River estuary. River corridor and Theosophical Society campus provide significant natural biodiversity. Cooler than interior zones.',
  'Velachery':        'Rapidly densified residential suburb. Pallikaranai marshland partially acts as regional cooling body despite significant encroachment. Lake flooding risk during monsoon.',

  // === KOLKATA ===
  'Howrah':           'Dense industrial and transit hub. Howrah Bridge and station drive massive daily pedestrian and vehicle flow. Industrial riverside activity generates heavy particulate load.',
  'Salt Lake':        'Planned township with wider roads and sector-based layout. Eco Park proximity and wetland buffer (East Kolkata Wetlands) provides meaningful ecological cooling.',
  'Park Street':      'Commercial and entertainment hub. High-rise office and hospitality buildings, continuous night activity. Some heritage trees on Park Street provide partial shading.',

  // === BENGALURU ===
  'MG Road':          'Commercial core. High-rise glass-facade towers create solar reflection and heat islands. Metro corridor reduces some traffic load. Some Gulmohar trees remain but insufficient for temperature.',
  'Whitefield':       'Major IT hub with campus-style development. Significant internal green zones within campuses. However, approach roads are severely congested, increasing commuter heat exposure.',
  'Koramangala':      'Startup and residential mixed zone. Good private green cover within layouts. One of Bengaluru\'s better-maintained microclimate zones with moderate building density.',
  'Electronic City':  'IT manufacturing corridor with EPIP zone. Significant internal campus greenery. Phase 1 flyover reduces surface traffic. Industrial dry-season dust is a concern.',
};

export async function POST(req: Request) {
  const { ward_name, city, temperature, aqi, traffic_density, risk_score, hist_max_temp, hist_max_aqi } = await req.json();

  const cityName = city || 'Nagpur';
  const wardProfile = WARD_PROFILES[ward_name] ??
    `Urban area in ${cityName} with mixed residential and commercial land use, typical infrastructure density, and moderate green cover.`;

  const riskLevel = risk_score >= 7 ? 'CRITICAL' : risk_score >= 4 ? 'MODERATE' : 'LOW';

  // Build a different style prompt based on risk level
  let prompt = '';

  if (riskLevel === 'LOW') {
    prompt = `You are Dr. Ananya Desai, Senior Urban Climate Scientist at the National Smart Cities Mission. You are generating a Zone Health Assessment for the Nexus-Green Command Dashboard.

ZONE: ${ward_name}, ${cityName}
STATUS: ✅ HEALTHY ZONE (Risk Score: ${risk_score}/10)
LIVE METRICS: Temperature ${temperature}°C | AQI ${aqi} | Traffic ${traffic_density} vehicles/hour
HISTORICAL 5-YEAR MAX: Temperature ${hist_max_temp}°C | AQI ${hist_max_aqi}

ZONE PROFILE:
${wardProfile}

This zone is currently performing WELL. Issue a positive, science-backed assessment in this EXACT format:

ZONE STATUS — Performing Above City Average:
[2 sentences on what makes this zone perform well environmentally, citing specific features of this area.]

STRENGTH 1 — [Title]:
[2 sentences celebrating a specific environmental asset of this zone and quantifying its benefit. E.g.: "The Ambazari Lake corridor reduces ambient temperature by 2.8°C within a 400m radius compared to the city average."]

STRENGTH 2 — [Title]:
[2 sentences on another positive environmental factor unique to this zone.]

RECOMMENDATION — Sustain & Enhance:
[2 specific, science-backed suggestions to MAINTAIN or IMPROVE this zone's healthy status. Include quantified projections, e.g.: "Planting an additional 150 Peepal trees along the northern boundary would extend the natural cooling corridor by 600m."]

PROJECTED IMPACT: [One sentence on what targeted investment could achieve here in 12 months.]

Keep language positive, authoritative, and scientifically precise.`;

  } else if (riskLevel === 'MODERATE') {
    prompt = `You are Dr. Ananya Desai, Senior Urban Climate Scientist at the National Smart Cities Mission. You are generating a Zone Risk Intervention Plan for the Nexus-Green Command Dashboard.

ZONE: ${ward_name}, ${cityName}
STATUS: ⚠️ MODERATE RISK (Score: ${risk_score}/10)
LIVE METRICS: Temperature ${temperature}°C | AQI ${aqi} | Traffic ${traffic_density} vehicles/hour
HISTORICAL 5-YEAR MAX: Temperature ${hist_max_temp}°C | AQI ${hist_max_aqi}

ZONE PROFILE:
${wardProfile}

Issue a science-backed 3-point intervention plan in this EXACT format:

ZONE ASSESSMENT & HISTORICAL COMPARISON:
[2 sentences describing the current environmental condition of this specific zone vs its historical maximum. Specifically mention how close the current temperature (${temperature}°C) is to the 5-year maximum of ${hist_max_temp}°C. Detail what is driving the moderate risk.]

INTERVENTION 1 — [Specific title, referencing this zone]:
[2 sentences describing the action. Include QUANTIFIED projections, e.g.: "Planting 300 Neem and Peepal trees along the main road will reduce mean surface temperature by 3.5°C within 18 months and provide shade to 2,400 daily pedestrians."]

INTERVENTION 2 — [Specific title]:
[2 sentences on another targeted action for this zone. Include measurable outcomes.]

INTERVENTION 3 — [Specific title]:
[2 sentences on a traffic or AQI management action specific to this area.]

PROJECTED OUTCOME: [One sentence with specific numbers: temperature reduction, AQI improvement, or traffic density reduction expected within 6 months.]

Be scientifically precise, cite real numbers, reference actual landmarks or characteristics of ${ward_name}.`;

  } else {
    // CRITICAL
    prompt = `You are Dr. Ananya Desai, Senior Urban Climate Scientist at the National Smart Cities Mission. You are issuing an EMERGENCY Urban Heat Crisis Advisory for the Nexus-Green Command Dashboard.

ZONE: ${ward_name}, ${cityName}
STATUS: 🔴 CRITICAL EMERGENCY (Risk Score: ${risk_score}/10)
LIVE METRICS: Temperature ${temperature}°C | AQI ${aqi} | Traffic ${traffic_density} vehicles/hour
HISTORICAL 5-YEAR MAX: Temperature ${hist_max_temp}°C | AQI ${hist_max_aqi}

ZONE PROFILE:
${wardProfile}

Issue an urgent, science-backed 3-point Emergency Advisory in this EXACT format:

CRISIS ASSESSMENT & HISTORICAL WARNING:
[2 sentences explaining WHY this zone is in crisis right now. You MUST directly compare the current ${temperature}°C to the historical ${hist_max_temp}°C. Warn the officer if it is approaching or exceeding the 5-year maximum. Name specific causes unique to ${ward_name}.]

EMERGENCY ACTION 1 — [Urgent title]:
[2 sentences on an IMMEDIATE intervention, naming actual streets/landmarks in ${ward_name}. Include quantified impact: e.g., "Installing 8 high-pressure water-misting stations at the main market intersection will reduce perceived temperature by 6–8°C for up to 1,200 pedestrians per hour."]

EMERGENCY ACTION 2 — [Urgent title]:
[2 sentences on a rapid structural intervention with measurable outcomes. E.g.: "Mass-planting 500 fast-growing Neem trees across the 3 km corridor will reduce urban surface temperature by 4.2°C and cut AQI by 18 points within 24 months."]

EMERGENCY ACTION 3 — [Urgent title]:
[2 sentences on a traffic or pollution emergency measure specific to this zone's known congestion pattern.]

PROJECTED IMPACT: [One sentence with bold numbers: if all three actions are deployed, what improvement in temperature, AQI, and livability is expected in 6 months.]

Be extremely specific. Reference landmarks, roads, and real infrastructure of ${ward_name}. All numbers must be scientifically plausible.`;
  }

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-pro'),
      prompt,
      temperature: 0.3,
    });
    return NextResponse.json({ advisory: text });
  } catch (error) {
    console.error('Gemini AI API Error:', error);

    // Zone + risk-level specific fallbacks
    const getFallback = () => {
      if (riskLevel === 'LOW') {
        return `ZONE STATUS — Performing Above City Average:\nThis zone benefits from established green infrastructure and lower commercial density, keeping heat stress well below the city baseline. The natural vegetation buffer reduces ambient temperatures by an estimated 2.5–3°C compared to adjacent high-density wards.\n\nSTRENGTH 1 — Natural Cooling Corridor:\nExisting mature tree canopy provides shade for over 60% of public walkways, reducing pedestrian heat exposure by approximately 4°C during peak afternoon hours. This aligns with CPWD standards for Grade A urban green corridors.\n\nSTRENGTH 2 — Lower Surface Impermeability:\nCompared to city average, this zone retains a higher percentage of permeable surfaces, enabling ground-level moisture retention and reducing thermal re-radiation after sunset by approximately 1.8°C.\n\nRECOMMENDATION — Sustain & Enhance:\nPlanting an additional 200 Peepal and Gulmohar trees along the northern boundary will extend the natural cooling buffer by 500m. Installing 4 rainwater harvesting pits at key road intersections will improve ground moisture, further reducing surface temperature by 1.2°C.\n\nPROJECTED IMPACT: With targeted investment, this zone can become a certified Urban Cool Island within 18 months, potentially reducing citywide heat island intensity by 0.4°C.`;
      } else if (riskLevel === 'MODERATE') {
        return `ZONE ASSESSMENT:\nThis zone exhibits a concerning combination of moderate heat buildup and rising traffic density that, without intervention, will escalate to critical risk within 2 dry-weather months. The limited green cover is the primary structural vulnerability.\n\nINTERVENTION 1 — Urban Forestry Emergency Programme:\nPlanting 400 fast-growing Neem trees (Azadirachta indica) along all major arterial roads in this zone will reduce mean surface temperature by 3.8°C and provide shade cover to an estimated 3,200 daily pedestrians within 20 months. Neem is drought-resistant and survives Nagpur's summer temperatures above 45°C.\n\nINTERVENTION 2 — Reflective Roof Surface Mandate:\nMandating cool-roof white-paint treatment on all flat rooftops in a 1 km² core area will reduce building surface temperatures by 7–12°C, cutting ambient radiative heat by 1.5°C zone-wide.\n\nINTERVENTION 3 — Peak-Hour Traffic Corridor Ban:\nRestricting heavy goods vehicles from the main road between 10:00–17:00 IST will reduce idling emissions by 35%, improving AQI by an estimated 12 points within 30 days.\n\nPROJECTED OUTCOME: Full implementation of all three measures will reduce this zone's risk score from ${risk_score} to approximately 4.2 within 6 months.`;
      } else {
        return `CRISIS ASSESSMENT:\nThis zone is in active urban heat emergency — surface temperatures ${temperature}°C are 6–8°C above safe outdoor exposure thresholds, and AQI at ${aqi} poses direct respiratory risk to vulnerable populations. Immediate multi-agency intervention is required within 48 hours.\n\nEMERGENCY ACTION 1 — Immediate Cooling Station Deployment:\nInstall 10 high-pressure water-misting stations at the highest-density pedestrian intersections in this zone, operating at full capacity between 10:00 and 17:00 IST. Each unit reduces perceived air temperature by 6–8°C in a 20m radius, protecting an estimated 800 pedestrians per hour from life-threatening heat exposure.\n\nEMERGENCY ACTION 2 — Mass Canopy Creation Initiative:\nCommission emergency planting of 600 Neem, Peepal, and Banyan saplings across all available public land and road margins in this zone. Scientific modelling projects a 4.5°C surface temperature reduction and 22-point AQI improvement within 24 months of full canopy establishment. This is the single highest-ROI long-term climate intervention available.\n\nEMERGENCY ACTION 3 — Traffic Load Emergency Reduction:\nImplement immediate alternate-day heavy vehicle restrictions and deploy 4 NMC traffic management teams to critical junctions to enforce no-idling zones. This will reduce vehicular heat and emission contribution by an estimated 40%, improving AQI by 18 points within 2 weeks.\n\nPROJECTED IMPACT: Combined implementation is projected to reduce zone temperature by 5.2°C, AQI by 35 points, and risk score from ${risk_score} to below 5.0 within 6 months.`;
      }
    };

    const fallbackText = getFallback();
    return NextResponse.json({ advisory: fallbackText });
  }
}
