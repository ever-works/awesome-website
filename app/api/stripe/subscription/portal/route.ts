import { auth, initializeStripeProvider } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stripe = initializeStripeProvider();
        const stripeInstance = stripe.getStripeInstance();
        const stripeCustomerId = await stripe.getCustomerId(session.user as any);
        if (!stripeCustomerId) {
            return NextResponse.json({ error: 'Stripe customer ID not found' }, { status: 404 });
        }
        const response = await stripeInstance.billingPortal.sessions.create({
                customer: stripeCustomerId!,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
        });

        console.log('response', response);

        return NextResponse.json({
            success: true,
            data: response,
            message: 'Billing portal session created'
        });
    } catch (error) {
        console.error('Error creating billing portal session:', error);
        return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
    }
}