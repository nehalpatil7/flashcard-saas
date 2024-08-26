import { NextResponse } from "next/server";
import Stripe from "stripe";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const formatAmountForStripe = (amount) => {
    return Math.round(amount * 100);
}

export async function GET(req) {
    const searchParams = req?.nextUrl?.searchParams;
    const session_id = searchParams.get('session_id');

    try {
        const checkoutSession = await stripe?.checkout?.sessions?.retrieve(session_id);
        return NextResponse.json(checkoutSession);
    } catch (error) {
        console.error('Error retrieving checkout session: ', error);
        return NextResponse.json({error: {message: error?.message}}, {status: 500});
    }
}

export async function POST(req) {
    const { price, userId } = await req.json();
    const amount = parseFloat(price.replace(/[^0-9.-]+/g, ""));

    const params = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Pro Subscription'
                    },
                    unit_amount: formatAmountForStripe(amount),
                    recurring: {
                        interval: 'month',
                        interval_count: 1,
                    }
                },
                quantity: 1,
            },
        ],
        success_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
    };
    const checkoutSession = await stripe.checkout.sessions.create(params);

    // Update user's subscription status in the database
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { subscriptionStatus: 'paid' }, { merge: true });

    return NextResponse.json(checkoutSession, {
        status: 200,
    });
}