export const PARK = {
  nameEn: "7 Ajoobe Park",
  nameHi: "7 अजूबे पार्क",
  tagEn: "A Moradabad Development Authority (M.D.A.) & Zing Parks Initiative",
  tagHi: "मुरादाबाद विकास प्राधिकरण एवं ज़िंग पार्क्स की एक पहल",
  address: "RMMV+MF3, New Moradabad, Chaudharpur, Moradabad, Uttar Pradesh 244102",
  phone: "+91 98765 43210",
  email: "info@7ajoobeparkmoradabad.com",
};

export const WONDERS = [
  { id: 1, en: "Taj Mahal", hi: "ताज महल", loc: "Agra, India",
    img: "https://images.pexels.com/photos/11521892/pexels-photo-11521892.jpeg" },
  { id: 2, en: "Eiffel Tower", hi: "एफिल टॉवर", loc: "Paris, France",
    img: "https://images.pexels.com/photos/37405426/pexels-photo-37405426.jpeg" },
  { id: 3, en: "Statue of Liberty", hi: "स्टैच्यू ऑफ लिबर्टी", loc: "New York, USA",
    img: "https://images.unsplash.com/photo-1588384153148-ebd739ac430c" },
  { id: 4, en: "Colosseum", hi: "कोलोसियम", loc: "Rome, Italy",
    img: "https://images.pexels.com/photos/13092365/pexels-photo-13092365.jpeg" },
  { id: 5, en: "Christ the Redeemer", hi: "क्राइस्ट द रिडीमर", loc: "Rio, Brazil",
    img: "https://images.unsplash.com/photo-1683331404237-64c763c70f5b" },
  { id: 6, en: "Leaning Tower of Pisa", hi: "पीसा की झुकी मीनार", loc: "Pisa, Italy",
    img: "https://images.pexels.com/photos/15960848/pexels-photo-15960848.jpeg" },
  { id: 7, en: "Great Wall of China", hi: "चीन की महान दीवार", loc: "China",
    img: "https://images.pexels.com/photos/19031655/pexels-photo-19031655.jpeg" },
];

export const priceForDate = (date) => {
  if (!date) return 50;
  const d = new Date(date).getDay();
  return d === 0 || d === 6 ? 100 : 50;
};

export const isWeekend = (date) => {
  if (!date) return false;
  const d = new Date(date).getDay();
  return d === 0 || d === 6;
};
