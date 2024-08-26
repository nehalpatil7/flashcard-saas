import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function getSubscriptionStatus(userId) {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists) {
        return 'free';
    }

    const data = userDoc?.data();
    return data?.subscriptionStatus || 'free';
}
