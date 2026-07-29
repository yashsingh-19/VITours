const SCENES = [
  {
    id: "s01",
    code: "1",
    image: "images/1_main_gate_entrance_showcasing_the_directory_board.jpg",
    thumb: "thumbs/1_main_gate_entrance_showcasing_the_directory_board.jpg",
    title: "Main Gate",
    subtitle: "Campus Entrance & Directory",
    zone: "entrance",
    yaw: 0,
    narration: "Welcome to VIT Bhopal University. You are standing at the main gate of the campus, located on the Bhopal-Indore Highway in Kothri Kalan, Sehore. The large directory board ahead maps out the entire 300-plus acre campus. This is where every journey through VIT Bhopal begins.",
    hotspots: [
      { yaw: 270, pitch: -3, to: "s02", dir: "L", label: "Lion Statue / MPH" },
      { yaw: 90,  pitch: -3, to: "s16", dir: "R", label: "Parking / Gate 2" }
    ]
  },
  {
    id: "s02",
    code: "1L",
    image: "images/1L_the_lion_statue_in_front_of_mph.jpg",
    thumb: "thumbs/1L_the_lion_statue_in_front_of_mph.jpg",
    title: "Lion Statue & MPH",
    subtitle: "Multi-Purpose Hall Frontage",
    zone: "academic",
    yaw: 0,
    narration: "The iconic lion statue stands proudly in front of the Multi-Purpose Hall. This mascot is a symbol of VIT Bhopal's spirit and strength. The MPH building behind houses the basketball court and serves as a venue for major campus events and cultural activities.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s01", dir: "back", label: "Back to Main Gate" },
      { yaw: 0,   pitch: -2, to: "s03", dir: "S", label: "Towards AB1" },
      { yaw: 270, pitch: -1, to: "s15", dir: "i", label: "Inside MPH" }
    ]
  },
  {
    id: "s03",
    code: "1LS",
    image: "images/1LS_The_turn_towards_Academic_Block_(AB1)_from_MPH.jpg",
    thumb: "thumbs/1LS_The_turn_towards_Academic_Block_(AB1)_from_MPH.jpg",
    title: "Turn Towards AB1",
    subtitle: "From MPH to Academic Block 1",
    zone: "academic",
    yaw: 0,
    narration: "This road leads from the Multi-Purpose Hall toward Academic Block 1, the heart of VIT Bhopal's academic activities. The 31,180 square meter Academic Block houses state-of-the-art laboratories, technology-enabled classrooms, a 600-seater auditorium, bank, and ATM.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s02", dir: "back", label: "Back to MPH" },
      { yaw: 0,   pitch: -2, to: "s04", dir: "S", label: "Towards UB & AB1" }
    ]
  },
  {
    id: "s04",
    code: "1LSS",
    image: "images/1LSS_towards_ub_and_ab1.jpg",
    thumb: "thumbs/1LSS_towards_ub_and_ab1.jpg",
    title: "Towards UB & AB1",
    subtitle: "Underbelly Cafeteria & Academic Block 1",
    zone: "academic",
    yaw: 0,
    narration: "Ahead lies both the iconic Underbelly cafeteria and Academic Block 1. The Underbelly, or UB, is VIT Bhopal's beloved food court built from recycled shipping containers — an eco-friendly design that has become the social hub of campus life. AB1 looms on the horizon.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s03", dir: "back", label: "Back" },
      { yaw: 0,   pitch: -2, to: "s05", dir: "R", label: "AB1 Entrance" },
      { yaw: 315, pitch: -2, to: "s09", dir: "S", label: "Mayuri's Cafe / UB" }
    ]
  },
  {
    id: "s05",
    code: "1LSSR",
    image: "images/1LSSR_Academic_Block_1_(AB1)_Enterance.jpg",
    thumb: "thumbs/1LSSR_Academic_Block_1_(AB1)_Enterance.jpg",
    title: "Academic Block 1",
    subtitle: "AB1 Main Entrance",
    zone: "academic",
    yaw: 0,
    narration: "Academic Block 1 is the premier building of VIT Bhopal, spanning 31,180 square meters. This magnificent structure houses cutting-edge laboratories, studios with high-speed internet, technology-enabled classrooms following the innovative CALTech model, and a grand 600-seater auditorium inside.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s04", dir: "back", label: "Back to road" },
      { yaw: 0,   pitch: -1, to: "s06", dir: "i", label: "Inside AB1" }
    ]
  },
  {
    id: "s06",
    code: "1LSSRi",
    image: "images/1LSSRi_Inside_Academic_Block_1_showcasing_help_desk_and_reception.jpg",
    thumb: "thumbs/1LSSRi_Inside_Academic_Block_1_showcasing_help_desk_and_reception.jpg",
    title: "Inside AB1",
    subtitle: "Help Desk & Reception",
    zone: "academic",
    yaw: 270,
    narration: "Inside Academic Block 1, the spacious reception area and help desk welcome students, faculty and visitors. The building features Wi-Fi throughout, advanced research facilities, and the Fully Flexible Credit System administration offices. This is the nerve centre of academic life at VIT Bhopal.",
    hotspots: [
      { yaw: 90,  pitch: -2, to: "s05", dir: "back", label: "Exit AB1" },
      { yaw: 180, pitch: -2, to: "s07", dir: "R", label: "Auditorium Entrance" }
    ]
  },
  {
    id: "s07",
    code: "1LSSRiR",
    image: "images/1LSSRiR_Academic_Block_1_back_gate_and_auditorium_entrance.jpg",
    thumb: "thumbs/1LSSRiR_Academic_Block_1_back_gate_and_auditorium_entrance.jpg",
    title: "AB1 Back & Auditorium",
    subtitle: "Back Gate & Auditorium Entrance",
    zone: "academic",
    yaw: 0,
    narration: "The back gate of Academic Block 1 leads to the grand auditorium entrance. The 600-seater auditorium is one of VIT Bhopal's flagship venues, hosting convocations, guest lectures, cultural events, and conferences. The open corridor here connects the main block to the lab complex further ahead.",
    hotspots: [
      { yaw: 180, pitch: -2, to: "s06", dir: "back", label: "Back to Reception" },
      { yaw: 0,   pitch: -1, to: "s08", dir: "i", label: "Inside Auditorium" },
      { yaw: 90,  pitch: -2, to: "s10", dir: "S", label: "Towards Lab Complex" }
    ]
  },
  {
    id: "s08",
    code: "1LSSRiRi",
    image: "images/1LSSRiRi_Inside_the_Auditorium.jpg",
    thumb: "thumbs/1LSSRiRi_Inside_the_Auditorium.jpg",
    title: "Inside the Auditorium",
    subtitle: "600-Seater Grand Auditorium",
    zone: "academic",
    yaw: 0,
    narration: "Inside the magnificent 600-seater auditorium of VIT Bhopal. This world-class venue features professional audio-visual systems, tiered seating, and a grand stage. It hosts convocation ceremonies, technical symposiums, cultural performances, and eminent guest lectures throughout the academic year.",
    hotspots: [
      { yaw: 180, pitch: -2, to: "s07", dir: "back", label: "Exit Auditorium" }
    ]
  },
  {
    id: "s09",
    code: "1LSSS",
    image: "images/1LSSS_Mayuri's_Cafe_and_Under_Belly_(UB).jpg",
    thumb: "thumbs/1LSSS_Mayuri's_Cafe_and_Under_Belly_(UB).jpg",
    title: "Mayuri's Cafe & Underbelly",
    subtitle: "Food Court & Campus Dining",
    zone: "campus-life",
    yaw: 0,
    narration: "Mayuri's Cafe and the famous Underbelly food court — the social heart of VIT Bhopal. The Underbelly is a unique air-conditioned food court built from recycled shipping containers, offering multi-cuisine meals in hygienic conditions. It is an eco-friendly Green Building initiative of the university.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s04", dir: "back", label: "Back to road" },
      { yaw: 0,   pitch: -2, to: "s10", dir: "R", label: "Towards Lab Complex" }
    ]
  },
  {
    id: "s10",
    code: "1LSSSR",
    image: "images/1LSSSR_From_Academic_Block_1_towards_the_Architecture_Block_and_the_Lab_Complex.jpg",
    thumb: "thumbs/1LSSSR_From_Academic_Block_1_towards_the_Architecture_Block_and_the_Lab_Complex.jpg",
    title: "AB1 to Lab Complex",
    subtitle: "Architecture Block & Lab Complex Road",
    zone: "academic",
    yaw: 0,
    narration: "From Academic Block 1, the campus road stretches ahead toward the Pre-Engineered Laboratory Complex and the Architecture Block. The Lab Complex, spread across 7,875 square meters, houses cutting-edge facilities including the Gaming Studio, Aerospace Lab, IoT Lab, and Bioengineering Labs.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s07", dir: "back", label: "Back to AB1" },
      { yaw: 0,   pitch: -2, to: "s11", dir: "R", label: "Lab Complex" },
      { yaw: 315, pitch: -2, to: "s14", dir: "S", label: "Architecture Block" }
    ]
  },
  {
    id: "s11",
    code: "1LSSSRR",
    image: "images/1LSSSRR_Lab_Complex.jpg",
    thumb: "thumbs/1LSSSRR_Lab_Complex.jpg",
    title: "Lab Complex",
    subtitle: "Pre-Engineered Laboratory Complex",
    zone: "academic",
    yaw: 0,
    narration: "The Pre-Engineered Laboratory Complex — a 7,875 square meter hub of advanced research and practical learning. This modern facility houses the Gaming Studio, Aerospace Lab, IoT Lab, and Bioengineering Labs. It supports both B.Tech and M.Tech programs with industry-standard equipment.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s10", dir: "back", label: "Back to road" },
      { yaw: 0,   pitch: -1, to: "s12", dir: "i", label: "Enter Lab Complex" }
    ]
  },
  {
    id: "s12",
    code: "1LSSSRRi",
    image: "images/1LSSSRRi_Entrance_of_the_Lab_Complex.jpg",
    thumb: "thumbs/1LSSSRRi_Entrance_of_the_Lab_Complex.jpg",
    title: "Lab Complex Entrance",
    subtitle: "Entry Lobby",
    zone: "academic",
    yaw: 0,
    narration: "The entrance of the Pre-Engineered Lab Complex opens into a spacious lobby connecting to the various specialized laboratories. High-speed internet, advanced computing infrastructure, and industry-grade equipment define every lab here — from drone technology to biomedical engineering.",
    hotspots: [
      { yaw: 180, pitch: -2, to: "s11", dir: "back", label: "Exit Lab Complex" },
      { yaw: 0,   pitch: -2, to: "s13", dir: "R", label: "Centre of Lab Complex" }
    ]
  },
  {
    id: "s13",
    code: "1LSSSRRiR",
    image: "images/1LSSSRRiR_Centre_of_the_Lab_Complex.jpg",
    thumb: "thumbs/1LSSSRRiR_Centre_of_the_Lab_Complex.jpg",
    title: "Centre of Lab Complex",
    subtitle: "Core Research Hub",
    zone: "academic",
    yaw: 0,
    narration: "The central atrium of the Lab Complex, surrounded by specialized research labs. This is where students work on projects in aerospace engineering, gaming technology, Internet of Things, and bioengineering. VIT Bhopal's Lab Within a Classroom philosophy ensures theory and practice happen simultaneously.",
    hotspots: [
      { yaw: 180, pitch: -2, to: "s12", dir: "back", label: "Back to Entrance" }
    ]
  },
  {
    id: "s14",
    code: "1LSSSRSi",
    image: "images/1LSSSRSi_Inside_of_The_Architecture_Block.jpg",
    thumb: "thumbs/1LSSSRSi_Inside_of_The_Architecture_Block.jpg",
    title: "Architecture Block",
    subtitle: "School of Architecture & Design",
    zone: "academic",
    yaw: 0,
    narration: "Inside the Architecture Block, a creative hub for students of architecture and design. The open-plan studios, drafting tables, and model-making areas foster a spirit of creativity and innovation. Natural light floods through the glass facades, creating an inspiring environment for future architects.",
    hotspots: [
      { yaw: 180, pitch: -2, to: "s10", dir: "back", label: "Back to road" }
    ]
  },
  {
    id: "s15",
    code: "1Li",
    image: "images/1Li_Inside_the_Multi-Purpose_Hall_(MPH)_showcasing_the_basketball_court.jpg",
    thumb: "thumbs/1Li_Inside_the_Multi-Purpose_Hall_(MPH)_showcasing_the_basketball_court.jpg",
    title: "Inside MPH",
    subtitle: "Basketball & Indoor Sports",
    zone: "sports",
    yaw: 160,
    narration: "Inside the Multi-Purpose Hall — a world-class indoor sports facility featuring a regulation basketball court with polished wooden flooring. The MPH also accommodates badminton, volleyball, and other indoor sports. It doubles as a venue for major campus events, cultural shows, and conferences.",
    hotspots: [
      { yaw: 340, pitch: -2, to: "s02", dir: "back", label: "Exit MPH" }
    ]
  },
  {
    id: "s16",
    code: "1R",
    image: "images/1R_towards_parking_chancellors_bunglow_gate_2_and_entrance.jpg",
    thumb: "thumbs/1R_towards_parking_chancellors_bunglow_gate_2_and_entrance.jpg",
    title: "Parking & Gate 2",
    subtitle: "Chancellor's Bungalow Road",
    zone: "entrance",
    yaw: 0,
    narration: "The right side of the campus from the main gate leads to the parking area, Gate 2, and the Chancellor's Bungalow. This road also connects to the Girls and Boys Hostel complexes. The campus security infrastructure and surveillance building are located along this stretch.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s01", dir: "back", label: "Back to Main Gate" },
      { yaw: 270, pitch: -3, to: "s17", dir: "L", label: "Chancellor's Bungalow" },
      { yaw: 0,   pitch: -2, to: "s20", dir: "R", label: "Open Theatre" }
    ]
  },
  {
    id: "s17",
    code: "1RL",
    image: "images/1RL_Towards_chancellors_bunglow_and_parking_space.jpg",
    thumb: "thumbs/1RL_Towards_chancellors_bunglow_and_parking_space.jpg",
    title: "Chancellor's Bungalow",
    subtitle: "Parking & Administrative Zone",
    zone: "entrance",
    yaw: 0,
    narration: "The road towards the Chancellor's Bungalow and the main parking space. This administrative zone houses the senior leadership offices of VIT Bhopal. The well-maintained road and manicured surroundings reflect the university's commitment to a beautiful and functional campus environment.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s16", dir: "back", label: "Back to Gate 2 road" },
      { yaw: 0,   pitch: -2, to: "s18", dir: "S", label: "Girls Hostel Block 1" }
    ]
  },
  {
    id: "s18",
    code: "1RLS",
    image: "images/1RLS_Girls_Hostel_Block_1.jpg",
    thumb: "thumbs/1RLS_Girls_Hostel_Block_1.jpg",
    title: "Girls Hostel Block 1",
    subtitle: "Women's Residential Facility",
    zone: "hostel",
    yaw: 0,
    narration: "Girls Hostel Block 1 — a modern 6-storey residential building spanning 17,467 square meters. It provides Wi-Fi enabled A/C and non-A/C sharing rooms, a modern kitchen and dining facility offering a healthy diet. The hostel ensures a safe and comfortable environment for women students.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s17", dir: "back", label: "Back" },
      { yaw: 0,   pitch: -2, to: "s19", dir: "R", label: "Girls Hostel Block 2" }
    ]
  },
  {
    id: "s19",
    code: "1RLSR",
    image: "images/1RLSR_Girls_Hostel_Block_2.jpg",
    thumb: "thumbs/1RLSR_Girls_Hostel_Block_2.jpg",
    title: "Girls Hostel Block 2",
    subtitle: "Women's Residential Facility",
    zone: "hostel",
    yaw: 250,
    narration: "Girls Hostel Block 2 is part of the growing women's residential complex. A separate girls hostel facility with 3 wings is under construction, which will feature a Recreation Centre, Library, Gymnasium, Swimming Pool, and food court — making it one of the finest student residences in Central India.",
    hotspots: [
      { yaw: 70,  pitch: -3, to: "s18", dir: "back", label: "Back to Block 1" },
      { yaw: 250, pitch: -2, to: "s20", dir: "R", label: "The Circle" }
    ]
  },
  {
    id: "s20",
    code: "1RLSRR",
    image: "images/1RLSRR_The_Circle.jpg",
    thumb: "thumbs/1RLSRR_The_Circle.jpg",
    title: "The Circle",
    subtitle: "Campus Central Junction",
    zone: "campus-life",
    yaw: 0,
    narration: "The Circle is the central roundabout of VIT Bhopal campus, connecting the hostel blocks, academic buildings, and recreational areas. It is a landmark meeting point and gathering place for students. The wide roads and green surroundings make it a beautiful and functional campus hub.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s19", dir: "back", label: "Back to Girls Hostel 2" },
      { yaw: 0,   pitch: -2, to: "s21", dir: "S", label: "Boys Hostel Block 1" }
    ]
  },
  {
    id: "s21",
    code: "1RLSRRS",
    image: "images/1RLSRRS_Boys_Hostel_Block_1.jpg",
    thumb: "thumbs/1RLSRRS_Boys_Hostel_Block_1.jpg",
    title: "Boys Hostel Block 1",
    subtitle: "Men's Residential Facility",
    zone: "hostel",
    yaw: 0,
    narration: "Boys Hostel Block 1 is part of the men's residential complex spanning 43,514 square meters. It offers Wi-Fi enabled A/C and non-A/C sharing rooms, a well-equipped gym, health centre, hair dressing facility, badminton and basketball courts, and a large dining mess — everything a student needs.",
    hotspots: [
      { yaw: 180, pitch: -3, to: "s20", dir: "back", label: "Back to The Circle" }
    ]
  },
  {
    id: "s22",
    code: "1RSi",
    image: "images/1RSi_Inside_the_Open_Theatre_(OT).jpg",
    thumb: "thumbs/1RSi_Inside_the_Open_Theatre_(OT).jpg",
    title: "Open Theatre",
    subtitle: "Outdoor Amphitheatre",
    zone: "campus-life",
    yaw: 0,
    narration: "The Open Theatre is VIT Bhopal's beautiful outdoor amphitheatre, set amidst lush greenery. This natural performance space hosts cultural events, music festivals, theatrical performances, and informal student gatherings. With the campus pond and flora as a backdrop, it is one of the most picturesque spots on campus.",
    hotspots: [
      { yaw: 180, pitch: -2, to: "s16", dir: "back", label: "Back to Gate 2 road" }
    ]
  }
];
const SCENE_MAP = Object.fromEntries(SCENES.map(s => [s.id, s]));
const ZONES = {
  entrance:    { label: "Entrance & Gates",    icon: "gate",       color: "#000e27" },
  academic:    { label: "Academic Buildings",  icon: "school",     color: "#1a3a6b" },
  sports:      { label: "Sports & Recreation", icon: "sports",     color: "#2d6a2d" },
  hostel:      { label: "Hostels",             icon: "apartment",  color: "#6b3a1a" },
  "campus-life":{ label: "Campus Life",        icon: "local_cafe", color: "#505f76" }
};
