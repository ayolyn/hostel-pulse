const fs = require('fs');
let file = fs.readFileSync('app/property/[id]/PropertyClientActions.tsx', 'utf8');

if (!file.includes('Share2')) {
    file = file.replace(
        'import { Heart, MessageCircle, Phone, ExternalLink, PencilLine, Building2 }',
        'import { Heart, MessageCircle, Phone, ExternalLink, PencilLine, Building2, Share2 }'
    );
}

const handleShareFn = `
    const handleShare = async () => {
        try {
            await navigator.share({
                title: propertyName,
                text: 'Check out this property on HostelPulse',
                url: window.location.href,
            });
        } catch (err) {
            console.log('Error sharing', err);
        }
    };
`;

file = file.replace(
    'const sendMessage = async () => {',
    handleShareFn + '\n    const sendMessage = async () => {'
);

const shareButtonHtml = `
                    <button
                        onClick={handleShare}
                        className="w-14 items-center justify-center flex border-2 border-gray-100 rounded-2xl transition-all bg-white text-gray-400 hover:border-gray-300 hover:text-gray-900"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
`;

file = file.replace(
    '<Heart className={`w-5 h-5 ${isSaved ? \'fill-current\' : \'\'}`} />\n                    </button>',
    '<Heart className={`w-5 h-5 ${isSaved ? \'fill-current\' : \'\'}`} />\n                    </button>' + shareButtonHtml
);

fs.writeFileSync('app/property/[id]/PropertyClientActions.tsx', file, 'utf8');
