const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

// Add My Transactions to sections
content = content.replace(
    "{ id: 'My Reviews', icon: Star, label: 'My Reviews' },",
    "{ id: 'My Reviews', icon: Star, label: 'My Reviews' },\n          { id: 'My Transactions', icon: CreditCard, label: 'My Transactions' },"
);

// Add state for transactions
content = content.replace("const [disputes, setDisputes] = useState<any[]>([]);", "const [disputes, setDisputes] = useState<any[]>([]);\n    const [transactions, setTransactions] = useState<any[]>([]);");

// Add fetch logic
const newFetchLogic = `} else if (activeSection === 'My Transactions') {
                const { data } = await supabase
                    .from('escrow_transactions')
                    .select('id, amount, status, created_at, type, title, properties(title)')
                    .eq('buyer_id', user.id)
                    .order('created_at', { ascending: false });
                setTransactions(data || []);`;

content = content.replace("setLoadingData(false);", newFetchLogic + "\n            setLoadingData(false);");

// Add render block
const newRenderBlock = `
                {activeSection === 'My Transactions' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-[#BEF264]" />
                                My Transactions
                            </h3>
                        </div>
                        {loadingData ? (
                            <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                        ) : transactions.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-10 text-center">
                                <p className="text-gray-500 font-medium">No transactions found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {transactions.map((tx: any) => (
                                    <div key={tx.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 p-4 rounded-3xl flex justify-between items-center">
                                        <div>
                                            <h4 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{tx.title || tx.properties?.title || 'Payment'}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{new Date(tx.created_at).toLocaleDateString()} • {tx.status}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-lg text-gray-900 dark:text-white">₦{tx.amount?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
`;
content = content.replace("{activeSection === 'My Disputes' && (", newRenderBlock + "\n                {activeSection === 'My Disputes' && (");

// Add CreditCard import
content = content.replace("Download", "Download, CreditCard");

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
