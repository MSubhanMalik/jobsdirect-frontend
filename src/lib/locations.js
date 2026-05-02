// Irish counties (26 Republic of Ireland counties)
const COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin",
  "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim",
  "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan",
  "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford",
  "Westmeath", "Wexford", "Wicklow",
];

// Major Irish cities and towns
const CITIES = [
  // Dublin area
  "Dublin City", "Dún Laoghaire", "Swords", "Tallaght", "Blanchardstown", "Lucan", "Clondalkin", "Malahide", "Balbriggan", "Howth",
  // Cork
  "Cork City", "Cobh", "Midleton", "Mallow", "Bandon", "Carrigaline", "Kinsale", "Youghal", "Fermoy", "Clonakilty",
  // Galway
  "Galway City", "Tuam", "Ballinasloe", "Loughrea", "Oranmore", "Athenry", "Clifden",
  // Limerick
  "Limerick City", "Ennis", "Shannon", "Newcastle West", "Kilmallock",
  // Waterford
  "Waterford City", "Dungarvan", "Tramore", "Lismore",
  // Kilkenny
  "Kilkenny City", "Thomastown", "Callan", "Castlecomer",
  // Other major towns by county
  "Carlow Town", "Tullow",
  "Cavan Town", "Virginia", "Bailieborough",
  "Kilrush", "Kilkee",
  "Letterkenny", "Buncrana", "Donegal Town", "Bundoran",
  "Naas", "Newbridge", "Celbridge", "Maynooth", "Athy", "Leixlip",
  "Portlaoise", "Mountmellick", "Portarlington",
  "Carrick-on-Shannon",
  "Longford Town", "Edgeworthstown",
  "Drogheda", "Dundalk", "Ardee",
  "Tralee", "Killarney", "Listowel", "Dingle", "Kenmare", "Cahersiveen",
  "Castlebar", "Westport", "Ballina", "Claremorris", "Knock",
  "Navan", "Trim", "Ashbourne", "Dunshaughlin", "Kells", "Ratoath",
  "Monaghan Town", "Clones", "Carrickmacross", "Castleblayney",
  "Tullamore", "Birr", "Edenderry",
  "Roscommon Town", "Boyle", "Castlerea",
  "Sligo Town", "Strandhill", "Enniscrone",
  "Clonmel", "Thurles", "Nenagh", "Tipperary Town", "Cashel", "Roscrea", "Templemore",
  "Mullingar", "Athlone", "Moate",
  "Wexford Town", "Enniscorthy", "Gorey", "New Ross",
  "Wicklow Town", "Arklow", "Bray", "Greystones", "Blessington",
];

export const COUNTY_OPTIONS = COUNTIES.map((c) => ({ value: c, label: c }));

const cityOptions = CITIES.map((c) => ({ value: c, label: c }));

export const LOCATION_OPTIONS = [
  { value: "Remote", label: "Remote (Ireland)" },
  { value: "Nationwide", label: "Nationwide" },
  ...COUNTY_OPTIONS,
  ...cityOptions,
];
