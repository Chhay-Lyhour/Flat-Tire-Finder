// English / Khmer text. Static HTML marks its text with data-i18n (textContent),
// data-i18n-placeholder and data-i18n-aria-label; JS-built text calls t().

const STORAGE_KEY = 'flatfinder:lang';
export const LANGS = ['en', 'km'];

export const STRINGS = {
  en: {
    switchLang: 'ខ្មែរ',
    switchLangLabel: 'Switch to Khmer',
    mapLabel: 'Map of repair spots',
    myVehicle: 'My vehicle',
    moto: 'Moto',
    tuktuk: 'Tuk-tuk',
    car: 'Car',
    motoLabel: '🏍️ Moto',
    tuktukLabel: '🛺 Tuk-tuk',
    carLabel: '🚗 Car',
    retry: 'Retry',
    addSpot: '+ Add a repair spot',
    repairShops: 'Repair shops',
    showAllShops: 'Show all shops',
    showMap: 'Show the map',

    addTitle: 'Add a repair spot',
    editTitle: 'Edit repair spot',
    name: 'Name',
    namePlaceholder: 'e.g. Roadside stall near Chbar Ampov bridge',
    nameError: 'Add a name',
    fixes: 'Fixes',
    vehicleError: 'Add at least one vehicle type',
    price: 'Puncture price (optional)',
    currency: 'Currency',
    riel: '៛ Riel',
    dollar: '$ Dollar',
    priceError: 'The price must be a positive number',
    phone: 'Phone number (optional)',
    phoneHint: "So a driver who can't get there can call you to come find them.",
    phoneError: 'Enter a valid phone number',
    cancel: 'Cancel',
    save: 'Save',
    saveChanges: 'Save changes',
    saving: 'Saving…',
    saveFailed: "Couldn't save. Try again.",
    duplicate: 'A repair spot is already here. Add anyway?',
    addAnyway: 'Add anyway',

    nearest: 'Nearest repair shop',
    sampleShop: 'Sample shop',
    addedByDriver: 'Added by a driver',
    priceNotListed: 'Price not listed',
    call: 'Call',
    directions: 'Directions',
    share: 'Share',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: "Delete this spot? This can't be undone.",
    noSpotsNear: 'No {vehicle} repair spots near you yet. Add one!',

    loading: 'Loading repair spots...',
    loadFailed: "Couldn't load repair spots. Check your connection.",
    offlineSaved: "You're offline. Showing shops saved from your last visit.",
    tapWhereStall: 'Tap the map where the stall is.',
    tapToMovePin: 'Tap the map to move the pin, or save as is.',
    spotAdded: 'Spot added',
    spotUpdated: 'Spot updated',
    spotDeleted: 'Spot deleted',
    deleteFailed: "Couldn't delete. Try again.",
    findingYou: 'Finding you...',
    allowLocation: 'Allow location so we can find the nearest repair shop.',
    tapToSetLocation: 'Tap the map to set where you are.',
  },

  km: {
    switchLang: 'English',
    switchLangLabel: 'ប្ដូរទៅភាសាអង់គ្លេស',
    mapLabel: 'ផែនទីកន្លែងជួសជុល',
    myVehicle: 'យានជំនិះរបស់ខ្ញុំ',
    moto: 'ម៉ូតូ',
    tuktuk: 'តុកតុក',
    car: 'ឡាន',
    motoLabel: '🏍️ ម៉ូតូ',
    tuktukLabel: '🛺 តុកតុក',
    carLabel: '🚗 ឡាន',
    retry: 'ព្យាយាមម្ដងទៀត',
    addSpot: '+ បន្ថែមកន្លែងជួសជុល',
    repairShops: 'ហាងជួសជុល',
    showAllShops: 'មើលហាងទាំងអស់',
    showMap: 'មើលផែនទី',

    addTitle: 'បន្ថែមកន្លែងជួសជុល',
    editTitle: 'កែប្រែកន្លែងជួសជុល',
    name: 'ឈ្មោះ',
    namePlaceholder: 'ឧ. តូបតាមផ្លូវ ជិតស្ពានច្បារអំពៅ',
    nameError: 'សូមបញ្ចូលឈ្មោះ',
    fixes: 'ជួសជុល',
    vehicleError: 'សូមជ្រើសរើសយានជំនិះយ៉ាងហោចណាស់មួយ',
    price: 'តម្លៃប៉ះកង់ (មិនចាំបាច់)',
    currency: 'រូបិយប័ណ្ណ',
    riel: '៛ រៀល',
    dollar: '$ ដុល្លារ',
    priceError: 'តម្លៃត្រូវតែជាលេខវិជ្ជមាន',
    phone: 'លេខទូរស័ព្ទ (មិនចាំបាច់)',
    phoneHint: 'ដើម្បីឱ្យអ្នកបើកបរដែលមកមិនដល់ អាចទូរស័ព្ទហៅអ្នកឱ្យទៅរកពួកគេបាន។',
    phoneError: 'សូមបញ្ចូលលេខទូរស័ព្ទឱ្យបានត្រឹមត្រូវ',
    cancel: 'បោះបង់',
    save: 'រក្សាទុក',
    saveChanges: 'រក្សាទុកការកែប្រែ',
    saving: 'កំពុងរក្សាទុក…',
    saveFailed: 'រក្សាទុកមិនបានទេ។ សូមព្យាយាមម្ដងទៀត។',
    duplicate: 'មានកន្លែងជួសជុលនៅទីនេះរួចហើយ។ នៅតែបន្ថែមឬ?',
    addAnyway: 'នៅតែបន្ថែម',

    nearest: 'ហាងជួសជុលជិតបំផុត',
    sampleShop: 'ហាងគំរូ',
    addedByDriver: 'បន្ថែមដោយអ្នកបើកបរ',
    priceNotListed: 'មិនទាន់ដាក់តម្លៃ',
    call: 'ហៅទូរស័ព្ទ',
    directions: 'ផ្លូវទៅ',
    share: 'ចែករំលែក',
    edit: 'កែប្រែ',
    delete: 'លុប',
    confirmDelete: 'លុបកន្លែងនេះមែនទេ? មិនអាចយកមកវិញបានទេ។',
    noSpotsNear: 'មិនទាន់មានកន្លែងជួសជុល{vehicle}នៅជិតអ្នកទេ។ បន្ថែមមួយមក!',

    loading: 'កំពុងផ្ទុកកន្លែងជួសជុល...',
    loadFailed: 'ផ្ទុកកន្លែងជួសជុលមិនបានទេ។ សូមពិនិត្យអ៊ីនធឺណិតរបស់អ្នក។',
    offlineSaved: 'អ្នកគ្មានអ៊ីនធឺណិត។ កំពុងបង្ហាញហាងដែលបានរក្សាទុកពីលើកមុន។',
    tapWhereStall: 'ចុចលើផែនទី ត្រង់កន្លែងដែលតូបនោះនៅ។',
    tapToMovePin: 'ចុចលើផែនទីដើម្បីប្ដូរទីតាំង ឬរក្សាទុកដូចដើម។',
    spotAdded: 'បានបន្ថែមហើយ',
    spotUpdated: 'បានកែប្រែហើយ',
    spotDeleted: 'បានលុបហើយ',
    deleteFailed: 'លុបមិនបានទេ។ សូមព្យាយាមម្ដងទៀត។',
    findingYou: 'កំពុងស្វែងរកទីតាំងរបស់អ្នក...',
    allowLocation: 'សូមអនុញ្ញាតទីតាំង ដើម្បីរកហាងជួសជុលដែលនៅជិតបំផុត។',
    tapToSetLocation: 'ចុចលើផែនទី ដើម្បីកំណត់កន្លែងដែលអ្នកនៅ។',
  },
};

// Pure: the text for `key` in `lang`, with {name} placeholders filled from `vars`.
// Falls back to English, then to the key itself, so a missing string never shows blank.
export function translate(key, lang, vars = {}) {
  const text = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => vars[name] ?? match);
}

let current = null;

// Read lazily so this module also loads in node --test, where there's no localStorage.
export function getLang() {
  if (current === null) {
    try {
      current = localStorage.getItem(STORAGE_KEY) === 'km' ? 'km' : 'en';
    } catch {
      current = 'en';
    }
  }
  return current;
}

export const t = (key, vars) => translate(key, getLang(), vars);

// Sets an element's text from a key and remembers the key, so a language switch updates it.
// A null key clears the text.
export function setText(element, key) {
  if (key) {
    element.dataset.i18n = key;
    element.textContent = t(key);
  } else {
    delete element.dataset.i18n;
    element.textContent = '';
  }
}

// Re-translates everything marked with data-i18n* attributes.
export function applyLanguage() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)));
}

// Switches language, saves the choice, and tells JS-built UI to redraw.
export function setLang(lang) {
  current = LANGS.includes(lang) ? lang : 'en';
  try {
    localStorage.setItem(STORAGE_KEY, current);
  } catch {
    // Storage blocked: the switch still works for this visit.
  }
  applyLanguage();
  window.dispatchEvent(new CustomEvent('flatfinder:langchange'));
}
