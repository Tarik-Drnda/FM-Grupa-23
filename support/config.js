// config.js - Konfiguracioni file za testove

export const config = {
  // Base URL aplikacije
  baseUrl: "https://www.temu.com",
  
  // Kredencijali za login
  credentials: {
    email: "formalnemetode10@gmail.com",
    password: "test1234@"
  },
  
  // Timeout vrijednosti (u milisekundama)
  timeouts: {
    implicit: 10000,
    explicit: 10000,
    pageLoad: 30000,
    sleep: 2000,
    longWaitMs: 60000
  },
  
  // Browser podešavanja
  browser: {
    type: "firefox",
    headless: false // Postavite na true za headless mode
  },
  
  // Test data - proizvodi za testiranje
  testProducts: {
    product1: {
      name: "Car vacuum cleaner high-power cleaning LED lamp",
      price: 17,
      url: "https://www.temu.com/ba-en/car-vacuum-cleaner-high--cat-hair-pet-hair-powerful-suction-led-lamp-car-multifunctional-portable-small-12v-car-vacuum-cleaner-g-601100606146636.html"
    },
    product2: {
      name: "Carbon Fiber Console Frame Ibiza Console frame with 3 Knobs",
      price: 15,
      url: "https://www.temu.com/ba-en/for-vw--a4-bora-golf-iv-mk4-r32---1997-2005-trim-accessories-car-center-console-air-conditioner-adjust-panel-carbon-fiber-interior-sticker-g-601105243842651.html"
    },
    product3: {
      name: "NEW VIEW Silent Binocular Harness Chest Pack",
      price: 42.81,
      url: "https://www.temu.com/goods.html?_bg_fs=1&goods_id=601099566089885&sku_id=17592416097053&_oak_page_source=501&_x_sessn_id=ngvxgwcwgx&refer_page_name=shopping_cart&refer_page_id=10037_1767818174949_7flqo9ohbp&refer_page_sn=10037"
    },
    product4: {
      name: "WiFi Extender Booster",
      price: 0,
      url: "https://www.temu.com/ba-en/wifi-extender--booster-2-4-ghz-strong-wifi---for-35-devices--setup--with-4--and-2-ethernet-ports-ideal-for-home-office-mall-cafe-and-more-wifi-extender-and-adapter-outdoor-wifi-extender--booster-long-range-outdoor-wifi-extender-wifi-booster-for-outside-wifi-range-extender--booster-office-wifi-adapter-cafe-wifi-repeater-modern-wifi-extender----g-601101148357052.html?_oak_mp_inf=ELyDsKOs1ogBGiAyOTc4ZDQ5NmZkMjE0ZTdhYTcwMWI0NDRmMjcyOTJhYiDHh9XSuTM%3D&top_gallery_url=https%3A%2F%2Fimg.kwcdn.com%2Fproduct%2Ffancy%2Fb1d2a01b-7cef-49a4-a198-cf24ba414e1e.jpg&spec_gallery_id=403344&refer_page_sn=10032&refer_source=0&freesia_scene=2&_oak_freesia_scene=2&_oak_rec_ext_1=MTE4MQ&_oak_gallery_order=40543564%2C1918486462%2C377041501%2C1706825305%2C198035710&_x_sff=1&search_key=Select%20item%204-Antenna%20WiFi%20Extender%20Signal%20Booster%20with%202%20Ethernet%20Ports&refer_page_el_sn=200049&ab_scene=0&_x_sessn_id=ngvxgwcwgx&refer_page_name=goods&refer_page_id=10032_1767820843581_7w9nyhdz7m"
    }
  },
  
  // Validni payment podaci za testiranje
  paymentData: {
    cardType: "MasterCard",
    cardNumber: "4532123456789012",
    cardNumberMasked: "**** **** **** 1234",
    cvv: "123",
    expiryDate: "12/25"
  },
  
  // Adresa za testiranje
  address: {
    fullAddress: "Bosna i Hercegovina, Kanton Sarajevo, Sarajevo, Vrbanja 1 71000",
    country: "Bosna i Hercegovina",
    city: "Sarajevo",
    street: "Vrbanja 1",
    zipCode: "71000"
  },
  
  // Business rules - granice za checkout
  checkoutLimits: {
    minimumAmount: 40,
    maximumAmount: 292
  },

  sqlInjectionPayloads: [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1' OR '1' = '1' --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "1; DELETE FROM orders WHERE '1'='1",
    "' OR 1=1 --",
    "'; INSERT INTO users VALUES('hacker'); --"
  ],
};