const fs = require('fs');
let content = fs.readFileSync('app/book/[propertyId]/MockCheckoutClient.tsx', 'utf-8');

// Ensure createNotification is imported
if (!content.includes('createNotification')) {
    content = content.replace("import { createClient } from '@/lib/supabase/client';", "import { createClient } from '@/lib/supabase/client';\nimport { createNotification } from '@/lib/notifications';");
}

const targetBlock = `            // 4. Send Notification to Provider
            await supabase.from("notifications").insert({
                user_id: providerId,
                title: "New Booking Request!",
                message: \`Escrow has locked ?\${totalAmount.toLocaleString()} for a new booking.\`,
                body: \`Escrow has locked ?\${totalAmount.toLocaleString()} for a new booking.\`,
                type: "success",
                link: "/dashboard/agent?tab=wallet",
                is_read: false
            });

            // 5. Send Notification to Student (Buyer)
            await supabase.from("notifications").insert({
                user_id: studentId,
                title: "Checkout Successful!",
                message: \`Your payment of ?\${totalAmount.toLocaleString()} has been locked in Escrow.\`,
                body: \`Your payment of ?\${totalAmount.toLocaleString()} has been locked in Escrow.\`,
                type: "success",
                link: "/dashboard/student?tab=wallet",
                is_read: false
            });`;

const replacement = `            // 4. Send Notification to Provider
            await createNotification(
                providerId,
                "New Booking Request!",
                \`Escrow has locked ?\${totalAmount.toLocaleString()} for a new booking.\`,
                "/dashboard/agent?tab=wallet",
                "booking"
            );

            // 5. Send Notification to Student (Buyer)
            await createNotification(
                studentId,
                "Checkout Successful!",
                \`Your payment of ?\${totalAmount.toLocaleString()} has been locked in Escrow.\`,
                "/dashboard/student?tab=wallet",
                "booking"
            );`;

if (content.includes('await supabase.from("notifications").insert({')) {
    content = content.replace(targetBlock, replacement);
    fs.writeFileSync('app/book/[propertyId]/MockCheckoutClient.tsx', content, 'utf-8');
    console.log("Updated MockCheckoutClient.tsx");
} else {
    console.log("Not found in MockCheckoutClient.tsx");
}
