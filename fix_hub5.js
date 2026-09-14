const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

const targetSection = `{ id: 'Install App', icon: Download, label: 'Install App' }`;
const replaceSection = `{ id: 'Install App', icon: Download, label: 'Install App' },
        { id: 'Explore', icon: MapPin, label: 'Explore Ogbomoso', isLink: true, href: '/explore' }`;

content = content.replace(targetSection, replaceSection);

const targetMap = `                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}`;
const replaceMap = `                            {section.isLink ? (
                                <Link
                                    key={section.id}
                                    href={section.href}
                                    className="w-full flex items-center justify-between p-3 rounded-2xl transition-all text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <div className="flex items-center gap-3">
                                        <section.icon className="w-5 h-5" />
                                        <span className="font-bold text-sm">{section.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </Link>
                            ) : (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}`;

content = content.replace(targetMap, replaceMap);
content = content.replace(`</button>\n                    ))} `, `</button>\n                            )}\n                    ))}`);

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
