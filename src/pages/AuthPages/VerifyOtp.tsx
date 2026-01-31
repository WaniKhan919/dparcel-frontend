import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import VerifyOtpForm from "../../components/auth/VerifyOtpForm";

export default function VerifyOtp() {

  return (
    <>
      <PageMeta
        title="International Package and mail Forwarding Services"
        description="Shop Online from USA UK Spain France Germany Australia Japan and ship to any address Worldwide. Shop from famous stores like Amazon eBay Walmart Apple Gucci Hermes etc and ship anywhere. Get the Best Shipping Services with best package Forwarding Company worldwide."
      />
      <AuthLayout>
        <VerifyOtpForm />
      </AuthLayout>
    </>
  );
}
