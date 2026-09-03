const fs = require('fs');
let clientPage = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

clientPage = clientPage.replace(
    "import { useState, useEffect } from 'react';",
    "import { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';"
);

fs.writeFileSync('app/LandingPageClient.tsx', clientPage, 'utf8');
