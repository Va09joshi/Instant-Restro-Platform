const fs = require('fs');
const path = require('path');

const files = [
  'src/components/dashboard/CustomerDashboard.tsx',
  'src/app/customer/dashboard/bookings/page.tsx',
  'src/app/customer/dashboard/history/page.tsx',
  'src/app/customer/dashboard/profile/page.tsx',
  'src/app/customer/dashboard/settings/page.tsx',
  'src/app/customer/dashboard/favorites/page.tsx',
  'src/app/customer/dashboard/layout.tsx',
  'src/app/search/page.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace shadow colors if they exist
    content = content.replace(/shadow-slate-\d+\/\d+/g, 'shadow-black/20');
    content = content.replace(/shadow-emerald-\d+\/\d+/g, 'shadow-emerald-900/30');

    // Upgrade small shadows to larger ones with dark black tint
    content = content.replace(/\bshadow-sm\b/g, 'shadow-lg shadow-black/20');
    content = content.replace(/\bshadow-md\b/g, 'shadow-xl shadow-black/30');
    content = content.replace(/\bshadow-lg\b/g, 'shadow-2xl shadow-black/30');
    content = content.replace(/\bshadow-xl\b(?!\s+shadow-)/g, 'shadow-2xl shadow-black/40');
    
    // For any 2xl without a color, add the color
    content = content.replace(/\bshadow-2xl\b(?!\s+shadow-)/g, 'shadow-2xl shadow-black/50');
    
    fs.writeFileSync(fullPath, content);
  }
});
console.log('Shadows updated!');
