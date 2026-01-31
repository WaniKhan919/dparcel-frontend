import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ApiHelper } from "../../utils/ApiHelper";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchPermission } from "../../slices/permissionSlice";

const schema = yup.object().shape({
  name: yup.string().required("Permission title is required"),
});

type FormData = {
  name: string;
};

interface EditPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionId: number;
}

export default function EditPermissionModal({
  isOpen,
  onClose,
  permissionId,
}: EditPermissionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Load permission details when modal opens
  useEffect(() => {
    if (permissionId && isOpen) {
      (async () => {
        try {
          const res = await ApiHelper("GET", `/permission/${permissionId}`);
          if (res.status === 200) {
            reset({
                name: res.data.data.name,
            });
          }
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [permissionId, isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await ApiHelper("PUT", `/permissions/${permissionId}`, data);

      if (res.status === 200) {
          toast.success(res.data.message || "Permission updated!", {
            duration: 3000,
            position: "top-right",
            icon: "🎉",
            });
          dispatch(fetchPermission());
          setTimeout(() => {
            onClose();
          }, 100);
      } else {
        toast.error(res.data.message || "Failed to update ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong!", {
        style: { background: "#f44336", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit Permission
        </h4>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>
              Permission Title <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter permission name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || loading}>
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
