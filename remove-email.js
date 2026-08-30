const fs = require('fs');
const files = [
  'app/actions/reviews.ts',
  'app/api/market/checkout/route.ts',
  'app/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/actions.ts'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/import \{ render \} from '@react-email\/render';\n?/g, '');
  content = content.replace(/import \{ WelcomeEmail \} from '@\/components\/emails\/WelcomeEmail';\n?/g, '');
  content = content.replace(/import \{ BookingConfirmedEmail \} from '@\/components\/emails\/BookingConfirmedEmail';\n?/g, '');
  content = content.replace(/import \{ WithdrawalApprovedEmail \} from '@\/components\/emails\/WithdrawalApprovedEmail';\n?/g, '');
  content = content.replace(/import \{ WithdrawalRejectedEmail \} from '@\/components\/emails\/WithdrawalRejectedEmail';\n?/g, '');

  content = content.replace(/const htmlBody = await render\(WelcomeEmail\(\{[^\}]*\}\)\);/g, 'const htmlBody = "<h1>Thanks for your review!</h1>";');
  
  content = content.replace(/const htmlBody = await render\(BookingConfirmedEmail\(\{[^;]*\}\)\);/g, 'const htmlBody = "<h1>Checkout Confirmed!</h1><p>Your purchase was successful.</p>";');
  
  content = content.replace(/const html = await render\(WithdrawalApprovedEmail\(\{[^;]*\}\)\);/g, 'const html = "<h1>Withdrawal Approved</h1><p>Your funds are on the way.</p>";');
  
  content = content.replace(/const html = await render\(WithdrawalRejectedEmail\(\{[^;]*\}\)\);/g, 'const html = "<h1>Withdrawal Rejected</h1><p>Your withdrawal request was declined. Please contact support.</p>";');

  fs.writeFileSync(file, content);
}
console.log('Done');
