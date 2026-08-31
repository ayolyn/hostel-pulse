const fs = require('fs');
let content = fs.readFileSync('components/market/PostMarketItem.tsx', 'utf-8');

const oldInput = `<input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#BEF264] file:text-black hover:file:bg-[#a6d456] cursor-pointer"
                                />`;

const newInput = `<div className="w-full relative flex justify-center">
                                    <input 
                                        type="file" 
                                        id="market-image-upload"
                                        accept="image/*" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <label htmlFor="market-image-upload" className="py-2 px-6 rounded-full text-[10px] font-black uppercase bg-[#BEF264] text-black hover:bg-[#a6d456] cursor-pointer transition-colors z-10 pointer-events-none">
                                        Choose File
                                    </label>
                                </div>`;

content = content.replace(oldInput, newInput);
fs.writeFileSync('components/market/PostMarketItem.tsx', content, 'utf-8');
console.log("Updated PostMarketItem.tsx file input");
