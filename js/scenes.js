/* ============================================================
   SCENES.JS — calibrated yaw & hotspot directions
   ============================================================ */

const TOUR_ZONES = {
  gates:   { name: "Gates & Approach",     color: "#C1623D" },
  transit: { name: "Transit & Parking",    color: "#3D6FC1" },
  sports:  { name: "Sports Block",         color: "#7A8C3D" },
  hostel:  { name: "Hostel Quarter",       color: "#C1623D" },
  academic:{ name: "Academic Core",        color: "#3D6FC1" },
  campus:  { name: "Campus Walkways",      color: "#8C6A3D" }
};

const SCENES = [
  {
    id: "s1",
    image: "images/pano_1.jpg",
    thumb: "images/thumbs/thumb_1.jpg",
    title: "Hostel Security Gate",
    zone: "gates",
    yaw: 250,
    narration: "You're standing at one of the residential block's security gates. The curved, terracotta-banded building ahead is a student hostel block — six storeys, wrapped balconies, and a manned gate with a security cabin on the right. Two-wheelers are parked along the boundary wall, a common sight on Indian campuses where most day-to-day movement happens by scooter. Beyond the wall to the right you can see another block still under construction, a reminder that VIT Bhopal's hundred-plus-acre campus is still growing.",
    hotspots: [
      { yaw: 120, pitch: -4, to: "s9",  label: "Toward hostel approach" },
      { yaw: 250, pitch: -3, to: "s2",  label: "Toward bus park gate" }
    ]
  },
  {
    id: "s2",
    image: "images/pano_2.jpg",
    thumb: "images/thumbs/thumb_2.jpg",
    title: "Gate Near the Bus Yard",
    zone: "gates",
    yaw: 250,
    narration: "This smaller gate sits at a road junction, with a bougainvillea hedge in full bloom along the boundary wall on the left. Straight ahead is a compact guard building marking a secondary entrance. To the right, under the red-roofed open shed, you can just make out the rows of yellow buses — this gate opens directly onto the campus transport yard, where the university's fleet shuttles students between the hostels, academic blocks and the highway.",
    hotspots: [
      { yaw: 70,  pitch: -3, to: "s1",  label: "Back to hostel gate" },
      { yaw: 250, pitch: -3, to: "s3",  label: "Into the bus yard" }
    ]
  },
  {
    id: "s3",
    image: "images/pano_3.jpg",
    thumb: "images/thumbs/thumb_3.jpg",
    title: "Transport Yard Junction",
    zone: "transit",
    yaw: 250,
    narration: "A wide, sandy junction inside the transport yard. On the left, a covered shed shelters two-wheelers under a red roof, with an electrical substation fenced off just beyond it. Ahead, a small pink-roofed cabin acts as a checkpoint, and a 20 km per hour speed-breaker sign reminds drivers this is shared ground with pedestrians. The road continues straight on toward the green-fenced sports ground in the distance.",
    hotspots: [
      { yaw: 70,  pitch: -3, to: "s2",  label: "Back to the gate" },
      { yaw: 250, pitch: -2, to: "s4",  label: "Into the bus parking" }
    ]
  },
  {
    id: "s4",
    image: "images/pano_4.jpg",
    thumb: "images/thumbs/thumb_4.jpg",
    title: "Bus Parking Ground",
    zone: "transit",
    yaw: 110,
    narration: "This open gravel ground is where the campus bus fleet lines up between runs. Six liveried university buses are parked in a neat row on the right, alongside a few autos and SUVs. The dark, arched structure in the middle distance is an open-sided shed — you will step inside it next. Electrical poles and a tree line mark the yard's edge on the left, with low-rise staff buildings just visible beyond them.",
    hotspots: [
      { yaw: 290, pitch: -2, to: "s3",  label: "Back to the junction" },
      { yaw: 110, pitch: -1, to: "s5",  label: "Into the open shed" }
    ]
  },
  {
    id: "s5",
    image: "images/pano_5.jpg",
    thumb: "images/thumbs/thumb_5.jpg",
    title: "Covered Vehicle Shed",
    zone: "transit",
    yaw: 180,
    narration: "Underneath a long, vaulted steel-truss roof — one of several utility sheds dotted around the campus perimeter, used for covered parking of tractors, two-wheelers and maintenance vehicles. Through the open sides you can see a hostel block to the left and a row of blue-and-white site cabins to the right, with one of the campus buses visible far on the right edge. It is a useful midpoint between the transport yard and the residential blocks.",
    hotspots: [
      { yaw: 0,   pitch: -1, to: "s4",  label: "Back to bus parking" },
      { yaw: 200, pitch: -2, to: "s9",  label: "Toward hostel block" }
    ]
  },
  {
    id: "s6",
    image: "images/pano_6.jpg",
    thumb: "images/thumbs/thumb_6.jpg",
    title: "Wayfinding Junction",
    zone: "campus",
    yaw: 270,
    narration: "A signposted crossroads near the heart of the campus. The black directional board lists the way to the surveillance block, hostels, boys' and girls' residences, and staff quarters — practical signage for a campus this spread out. On the left, a white building flies the Indian tricolour; to the right, palm trees line the road toward the residential side. This junction is a good anchor point if you ever lose your bearings on the walk.",
    hotspots: [
      { yaw: 60,  pitch: -3, to: "s7",  label: "Toward sports block" },
      { yaw: 225, pitch: -3, to: "s9",  label: "Toward hostel block" }
    ]
  },
  {
    id: "s7",
    image: "images/pano_7.jpg",
    thumb: "images/thumbs/thumb_7.jpg",
    title: "Walkway to the Sports Block",
    zone: "campus",
    yaw: 340,
    narration: "A long covered walkway with a red-and-green roof runs alongside a row of low buildings on the left — shaded benches and a parked car suggest this is a well-used pedestrian route. To the right, an open lawn and young trees separate the path from the high-rise residential blocks visible on the horizon. Straight ahead, the path continues toward the indoor sports complex.",
    hotspots: [
      { yaw: 160, pitch: -3, to: "s6",  label: "Back to the junction" },
      { yaw: 340, pitch: -1, to: "s8",  label: "Into the sports hall" }
    ]
  },
  {
    id: "s8",
    image: "images/pano_8.jpg",
    thumb: "images/thumbs/thumb_8.jpg",
    title: "Indoor Sports Arena",
    zone: "sports",
    yaw: 160,
    narration: "Inside the multi-purpose indoor courts — a single arched hall large enough for basketball, volleyball and badminton, marked out in white, red and yellow court lines on a polished wooden floor. Curtained alcoves along one wall store nets and equipment, while tall windows on the far side let in natural light. The hoop overhead and the scale of the trusses give a sense of just how large this hall really is.",
    hotspots: [
      { yaw: 340, pitch: -2, to: "s7",  label: "Back to the walkway" }
    ]
  },
  {
    id: "s9",
    image: "images/pano_9.jpg",
    thumb: "images/thumbs/thumb_9.jpg",
    title: "Approach to the Hostel Block",
    zone: "hostel",
    yaw: 330,
    narration: "A broad concrete approach road with the same striped hostel block from earlier now visible on the right, fronted by young trees and a low hedge. The white peaked-roof structure on the left is an open-air canteen kiosk, popular with students passing between the hostels and the academic side. A campus bus and a few parked two-wheelers complete the everyday scene.",
    hotspots: [
      { yaw: 15,  pitch: -3, to: "s10", label: "Toward the hostel entrance" },
      { yaw: 225, pitch: -3, to: "s1",  label: "Back to hostel gate" },
      { yaw: 195, pitch: -3, to: "s6",  label: "Toward the junction" }
    ]
  },
  {
    id: "s10",
    image: "images/pano_10.jpg",
    thumb: "images/thumbs/thumb_10.jpg",
    title: "Hostel Block Entrance",
    zone: "hostel",
    yaw: 250,
    narration: "Standing right in front of the hostel block now. The terracotta-and-grey striped facade rises six storeys, with a covered porch and a tall glazed entrance bay marking the main door. Frangipani and palm trees soften the forecourt, where a parked SUV and a few motorbikes sit along the curb. This is one of several near-identical residential blocks spread across the campus's eastern half.",
    hotspots: [
      { yaw: 70,  pitch: -3, to: "s9",  label: "Back toward the approach road" }
    ]
  },
  {
    id: "s11",
    image: "images/pano_11.jpg",
    thumb: "images/thumbs/thumb_11.jpg",
    title: "Main Reception Lobby",
    zone: "academic",
    yaw: 270,
    narration: "Inside the main academic block's double-height reception lobby. The VIT Bhopal crest sits on a patchwork-tiled feature wall, with a curved welcome desk in front of it. Patterned textile panels line a mezzanine balcony above, and on the left, a scale model of the campus sits on a low table beside an open doorway to the gardens outside. A long corridor stretches away to the right, lined with notice boards and event posters.",
    hotspots: [
      { yaw: 180, pitch: -1, to: "s12", label: "Toward the upper foyer" },
      { yaw: 60,  pitch: -2, to: "s16", label: "Toward placement block" }
    ]
  },
  {
    id: "s12",
    image: "images/pano_12.jpg",
    thumb: "images/thumbs/thumb_12.jpg",
    title: "Upper Foyer & Hall Entrance",
    zone: "academic",
    yaw: 200,
    narration: "A wide, double-height foyer just outside one of the seminar halls, identifiable by the heavy wooden double doors at the centre. A mezzanine walkway with steel railings wraps around the upper level, and a wheelchair and bean bags near the side door point to this space doubling as an informal waiting and accessibility area. Bright daylight spills in from the glazed openings on the right.",
    hotspots: [
      { yaw: 200, pitch: -1, to: "s13", label: "Into the seminar hall" },
      { yaw: 20,  pitch: -1, to: "s11", label: "Back to reception" }
    ]
  },
  {
    id: "s13",
    image: "images/pano_13.jpg",
    thumb: "images/thumbs/thumb_13.jpg",
    title: "Seminar Hall",
    zone: "academic",
    yaw: 90,
    narration: "A long seminar hall done up in bold geometric murals — triangular patchwork columns in blue, coral and gold break up the striped walls between rows of writing-arm chairs and a carpeted aisle leading to a stage at the far end. Free-standing pin-up boards and a projector screen suggest this room is used for guest lectures, orientation sessions and small symposiums rather than regular classes.",
    hotspots: [
      { yaw: 270, pitch: -1, to: "s12", label: "Back to the foyer" }
    ]
  },
  {
    id: "s14",
    image: "images/pano_14.jpg",
    thumb: "images/thumbs/thumb_14.jpg",
    title: "Academic Quad",
    zone: "academic",
    yaw: 250,
    narration: "A bird's-eye sense of how the academic core fits together. To the left stands the same striped hostel block seen earlier, now at a distance; in the centre, a sharply angled glass-fronted building catches the light; and on the right, a long two-winged building with a folded sunshade roof houses classrooms and labs. Open, unlandscaped ground on either side shows the campus still has room to grow.",
    hotspots: [
      { yaw: 345, pitch: -2, to: "s15", label: "Toward the glass building" },
      { yaw: 285, pitch: -2, to: "s17", label: "Into the courtyard block" }
    ]
  },
  {
    id: "s15",
    image: "images/pano_15.jpg",
    thumb: "images/thumbs/thumb_15.jpg",
    title: "Glass Atrium Building",
    zone: "academic",
    yaw: 290,
    narration: "Up close, this angular glass-and-steel building reveals a cantilevered canopy and a curved curtain-wall front, distinct from the campus's older striped-concrete blocks. A handful of motorbikes are parked near the entrance steps, and colour-coded waste bins sit at the roadside — a small but telling sign of how deliberately the newer buildings have been planned. The hostel block and another office building are visible far down the road on the left.",
    hotspots: [
      { yaw: 110, pitch: -2, to: "s14", label: "Back to the quad" }
    ]
  },
  {
    id: "s16",
    image: "images/pano_16.jpg",
    thumb: "images/thumbs/thumb_16.jpg",
    title: "Placement & Careers Block",
    zone: "academic",
    yaw: 320,
    narration: "A covered breezeway in bold green, red and blue — colour-blocking that turns out to be more than decoration: banners nearby celebrate VIT Bhopal students' placement packages with top recruiters. Floor-to-ceiling glazing on both sides frames views of the gardens and an adjacent building, and a spiral stair on the right leads up to a viewing balcony. This corridor connects the placement and careers offices to the rest of the academic block.",
    hotspots: [
      { yaw: 140, pitch: -1, to: "s11", label: "Back to main lobby" },
      { yaw: 20,  pitch: -1, to: "s17", label: "Toward the courtyard" }
    ]
  },
  {
    id: "s17",
    image: "images/pano_17.jpg",
    thumb: "images/thumbs/thumb_17.jpg",
    title: "Landscaped Courtyard",
    zone: "academic",
    yaw: 0,
    narration: "An open-air courtyard at the centre of one of the academic blocks, tucked beneath a tensioned fabric canopy that filters the harsh midday sun. Raised planters break the floor into informal seating pockets — a couple of students are settled on a wooden deck on the right, books open. Three storeys of balconies ring the courtyard on every side, colour-coded in the same green, red and blue seen in the breezeway nearby, making this the social heart of the academic core.",
    hotspots: [
      { yaw: 200, pitch: -1, to: "s16", label: "Toward the breezeway" },
      { yaw: 20,  pitch: -2, to: "s14", label: "Back to the quad" }
    ]
  }
];

const SCENE_MAP = Object.fromEntries(SCENES.map(s => [s.id, s]));
