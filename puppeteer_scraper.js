import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const linksByCategory = {
  books: [
    'https://link.amazon/A0iNG7v6A',
    'https://link.amazon/B0hpXYl3p',
    'https://link.amazon/B08W2ooJ3',
    'https://link.amazon/B0dPfvbxc',
    'https://link.amazon/B09CVIuRs',
    'https://link.amazon/B0ft3m2tt',
    'https://link.amazon/B04J7y9GP'
  ],
  shoes: [
    'https://link.amazon/B0j2bKqJD',
    'https://link.amazon/B01XehkNF',
    'https://link.amazon/B0g3u3caF',
    'https://link.amazon/B0gAg34V0',
    'https://link.amazon/B089KTW9o',
    'https://link.amazon/B0h8OIzHS'
  ],
  'wrist-watch': [
    'https://link.amazon/B02Y0vncO',
    'https://link.amazon/B020DQ2ax',
    'https://link.amazon/A016Xffyp',
    'https://link.amazon/B05JNZWdg',
    'https://link.amazon/B0cLo6A6K'
  ],
  tshirt: [
    'https://link.amazon/B0iSVRWlS',
    'https://link.amazon/B0bMknniG',
    'https://link.amazon/B016N16Zj',
    'https://link.amazon/B01IvnlyB'
  ]
};

const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Find local browser executable
function getBrowserPath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log('Found browser at:', p);
      return p;
    }
  }
  throw new Error('No Google Chrome or Microsoft Edge installation found.');
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

async function scrapeAll() {
  const browserPath = getBrowserPath();
  console.log('Launching browser...');
  
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--blink-settings=imagesEnabled=true'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });

  const scrapedProducts = [];
  let idCounter = 1;

  for (const [category, links] of Object.entries(linksByCategory)) {
    console.log(`\n--- Category: ${category} ---`);
    for (const shortLink of links) {
      console.log(`[${idCounter}] Navigating to: ${shortLink}`);
      try {
        await page.goto(shortLink, { waitUntil: 'networkidle2', timeout: 45000 });
        await page.waitForSelector('body');
        await new Promise(r => setTimeout(r, 2000)); // wait for full load

        const finalUrl = page.url();
        console.log(`[${idCounter}] Resolved URL: ${finalUrl}`);

        const hasCaptcha = await page.evaluate(() => {
          const text = document.body.innerText.toLowerCase();
          return text.includes('captcha') || text.includes('enter the characters') || text.includes('robot check');
        });

        if (hasCaptcha) {
          console.warn(`[${idCounter}] Captcha detected!`);
        }

        // Extract metadata
        const data = await page.evaluate(() => {
          // Title
          const titleEl = document.getElementById('productTitle') || 
                          document.querySelector('.a-size-large') || 
                          document.querySelector('#title');
          let title = titleEl ? titleEl.innerText.trim() : '';

          if (title) {
            title = title.split(' online at best prices ')[0].split(' : Amazon.in')[0].trim();
          }

          // Price
          const twisterPriceEl = document.getElementById('twister-plus-price-data-price');
          const twisterPrice = twisterPriceEl ? twisterPriceEl.value : null;

          const wholePriceEl = document.querySelector('.a-price-whole');
          const wholePrice = wholePriceEl ? wholePriceEl.innerText.trim() : null;

          let priceVal = null;
          if (twisterPrice) {
            priceVal = parseInt(twisterPrice);
          } else if (wholePrice) {
            priceVal = parseInt(wholePrice.replace(/[^\d]/g, ''));
          }

          // Image URL
          const landingImg = document.getElementById('landingImage') || 
                            document.getElementById('main-image');
          let imgUrl = landingImg ? landingImg.src : '';

          if (!imgUrl) {
            const dynamicImgEl = document.querySelector('[data-a-dynamic-image]');
            if (dynamicImgEl) {
              try {
                const imgData = JSON.parse(dynamicImgEl.getAttribute('data-a-dynamic-image'));
                imgUrl = Object.keys(imgData)[0];
              } catch (e) {}
            }
          }

          // Meta description
          const metaDesc = document.querySelector('meta[name="description"]');
          let description = metaDesc ? metaDesc.content.trim() : '';
          if (description.length > 150) {
            description = description.substring(0, 147) + '...';
          }

          return {
            title,
            priceVal,
            imgUrl,
            description
          };
        });

        const title = data.title || `Premium Curated ${category}`;
        const price = data.priceVal ? `₹${data.priceVal.toLocaleString('en-IN')}` : '₹999';
        const imgUrl = data.imgUrl;
        const description = data.description || `High-quality ${category} recommendations. Click to view deal.`;

        console.log(`[${idCounter}] Scraped -> Title: ${title.substring(0, 40)}... | Price: ${price} | Image: ${imgUrl ? 'Found' : 'Not Found'}`);

        // Download image if found
        let imagePath = `/images/product_${idCounter}.jpg`;
        if (imgUrl) {
          try {
            await downloadImage(imgUrl, path.join(imagesDir, `product_${idCounter}.jpg`));
            console.log(`[${idCounter}] Image downloaded successfully.`);
          } catch (err) {
            console.warn(`[${idCounter}] Image download failed: ${err.message}`);
            imagePath = null;
          }
        } else {
          imagePath = null;
        }

        if (!imagePath) {
          imagePath = `https://images.unsplash.com/photo-${category === 'books' ? '1544716278-ca5e3f4abd8c' : category === 'shoes' ? '1542291026-7eec264c27ff' : category === 'wrist-watch' ? '1524592094714-0f0654e20314' : '1521572267360-ee0c2909d518'}?auto=format&fit=crop&w=600&q=80`;
        }

        scrapedProducts.push({
          id: idCounter,
          name: title,
          category: category,
          description: description,
          price: price,
          imageUrl: imagePath,
          affiliateLink: shortLink,
          rating: parseFloat((4.5 + Math.random() * 0.4).toFixed(1)),
          badge: (idCounter % 5 === 0) ? 'Editor\'s Choice' : (idCounter % 7 === 0) ? 'Best Seller' : ''
        });

      } catch (err) {
        console.error(`[${idCounter}] Failed to scrape:`, err.message);
        scrapedProducts.push({
          id: idCounter,
          name: `Curated ${category.charAt(0).toUpperCase() + category.slice(1)} Item ${idCounter}`,
          category: category,
          description: `Hand-picked premium selection for your lifestyle. Click below to check current deal.`,
          price: 'Check Site',
          imageUrl: `https://images.unsplash.com/photo-${category === 'books' ? '1544716278-ca5e3f4abd8c' : category === 'shoes' ? '1542291026-7eec264c27ff' : category === 'wrist-watch' ? '1524592094714-0f0654e20314' : '1521572267360-ee0c2909d518'}?auto=format&fit=crop&w=600&q=80`,
          affiliateLink: shortLink,
          rating: 4.5,
          badge: ''
        });
      }

      idCounter++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  await browser.close();
  console.log('\n--- Scraping complete! ---');
  fs.writeFileSync(path.join(__dirname, 'products_scraped.json'), JSON.stringify(scrapedProducts, null, 2));
  console.log('Saved data to products_scraped.json');
}

scrapeAll();
