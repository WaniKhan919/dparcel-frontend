import { useNavigate } from "react-router";
import Label from "../form/Label";
// (we won't reuse your single Input here)
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { ApiHelper } from "../../utils/ApiHelper";
import OtpInput from "../form/input/OtpInput";
import { decryptLocalStorage } from "../../utils/DparcelHelper";

// ✅ stronger validation: exactly 6 digits
const schema = yup
  .object({
    code: yup
      .string()
      .required("OTP is required")
      .matches(/^\d{6}$/, "Enter a valid 6-digit OTP"),
  })
  .required();

type FormValues = {
  code: string;
};

export default function VerifyOtpForm() {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        code: data.code,
        user_id: decryptLocalStorage("verification_user_id"),
      };

      const toastId = toast.loading("Verifying...");
      const res: any = await ApiHelper("POST", "/verify", payload);

      if (res?.status === 200) {
        toast.success(res.data?.message || "Account verified successfully", { id: toastId });
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error(res?.data?.error || "Verification code is expired", { id: toastId });
      }
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(" ");
        toast.error(messages);
      } else {
        toast.error(err?.response?.data?.message || err?.message || "Verification code is expired");
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verify OTP
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your OTP code!</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <div>
                <Label>
                  OTP <span className="text-error-500">*</span>
                </Label>

                {/* ✅ Controller binds OTP component to RHF */}
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <OtpInput
                      length={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      error={!!errors.code}
                      // optional: auto-submit when all 6 digits entered
                      // onComplete={() => handleSubmit(onSubmit)()}
                    />
                  )}
                />

                {errors.code && (
                  <p className="text-red-500 text-sm mt-2">{errors.code.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
