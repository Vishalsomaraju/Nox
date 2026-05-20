const fs = require('fs');

['285', '286', '287'].forEach((step, i) => {
  const text = fs.readFileSync(`C:/Users/S VISHAL/.gemini/antigravity/brain/27f1e1fb-c31f-492c-8ba4-5da7aca54f14/.system_generated/steps/${step}/output.txt`, 'utf-8');
  
  // Looking for URLs that end in HTML
  const matches = [...text.matchAll(/"downloadUrl":"([^"]+)"/g)];
  matches.forEach(m => {
    if(m[1].includes('.html')) {
       console.log('HTML ' + i + ': ' + m[1]);
       fs.writeFileSync(`E:/social-media-platform/client/src/pages/Stitch_${['Landing', 'Feed', 'Profile'][i]}_URL.txt`, m[1]);
    }
  });
});
