
import { getCoupons } from "@/lib/data";
import { CouponManager } from "@/components/admin/CouponManager";

export default async function CouponsAdminPage() {
    const initialCoupons = await getCoupons();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary mb-2">Manage Coupons</h1>
                <p className="text-muted-foreground">Create and manage discount codes for your customers.</p>
            </div>
            <CouponManager initialCoupons={initialCoupons} />
        </div>
    );
}
