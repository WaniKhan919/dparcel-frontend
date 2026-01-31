import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import Badge from "../../../components/ui/badge/Badge";
import DParcelTable from "../../../components/tables/DParcelTable";
import { useEffect, useState } from "react";
import PageMeta from "../../../components/common/PageMeta";
import { useModal } from "../../../hooks/useModal";
import { ApiHelper } from "../../../utils/ApiHelper";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import { AppDispatch } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { fetchShippingType } from "../../../slices/shippingTypeSlice";
import { fetchRoles } from "../../../slices/roleSlice";
import { fetchPaymentSetting } from "../../../slices/paymentSettingSlice";

export interface PaymentSettingFormData {
  id: number;
  role_id: number;
  shipping_types_id?: number | null;
  title: string;
  amount: number;
  type: string;
  description?: string;
  active: boolean;
}

const schema = yup.object({
  role_id: yup.number().typeError("Role is required").required("Role is required"),
  shipping_types_id: yup.number().nullable(),
  title: yup.string().required("Title is required"),
  amount: yup.number().typeError("Amount must be a number").required("Amount is required"),
  type: yup.string().oneOf(["percent", "fixed"]).required("Type is required"),
  description: yup.string().nullable(),
  active: yup.boolean().required("Status is required"),
});

export default function PaymentSettings() {
  
  const dispatch = useDispatch<AppDispatch>();
  const { data:paymentSetting, meta, loading:paymentLoading } = useSelector((state: any) => state.paymentSetting);
  const { shippingType} = useSelector((state: any) => state.shippingType);
  const { roles} = useSelector((state: any) => state.roles);
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentSettingFormData>({
    resolver: yupResolver(schema) as any,
  });


  useEffect(() => {
    dispatch(fetchShippingType());
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPaymentSetting({ page, per_page: 10 }));
  }, [dispatch, page]);

  // ✅ Submit handler
  const onSubmit = async (data: PaymentSettingFormData) => {
    setLoading(true);
    try {
      const endpoint = editMode
        ? `/admin/settings/payment/${selectedId}`
        : "/admin/settings/payment";
      const method = editMode ? "PUT" : "POST";

      const res = await ApiHelper(method, endpoint, data);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message || "Saved successfully ✅");
        dispatch(fetchPaymentSetting({ page, per_page: 12 }));
        reset();
        setEditMode(false);
        setSelectedId(null);
        onClose();
      } else {
        toast.error(res.data.message || "Failed to save ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit
  const editSetting = (id: number) => {
    const setting = paymentSetting.find((s:any) => s.id === id);
    if (setting) {
      reset(setting);
      setSelectedId(id);
      setEditMode(true);
      openModal();
    }
  };

  // ✅ Delete
  const deleteSetting = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await ApiHelper("DELETE", `/admin/settings/payment/${deleteId}`);
      if (res.status === 200) {
        toast.success(res.data.message || "Deleted successfully ✅");
        dispatch(fetchPaymentSetting({ page, per_page: 12 }));
      } else {
        toast.error(res.data.message || "Delete failed ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting ❌");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const onClose = () => {
    reset();
    setEditMode(false);
    setSelectedId(null);
    closeModal();
  };

  const columns: any = [
    { key: "title", header: "Title" },
    { key: "amount", header: "Amount" },
    { key: "type", header: "Type" },
    { key: "description", header: "Description" },
    {
      key: "active",
      header: "Status",
      render: (row: PaymentSettingFormData) => (
        <Badge size="sm" color={row.active ? "success" : "warning"}>
          {row.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: PaymentSettingFormData) => (
        <div className="flex gap-3">
          <button
            onClick={() => editSetting(row.id!)}
            className="p-2 border border-blue-300 rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setDeleteId(row.id!);
              setDeleteModalOpen(true);
            }}
            className="p-2 border border-red-300 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition"
          >
            <TrashBinIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Admin | Payment Setting" description="Manage Payment Settings" />
      <PageBreadcrumb pageTitle="Payment Setting" />

      <div className="space-y-6">
        <ComponentCard title="Payment Settings">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={openModal}>
              Add Setting
            </Button>
          </div>
          <DParcelTable 
            columns={columns} 
            data={paymentSetting}
            rowsPerPage={12}
            meta={meta}
            loading={paymentLoading}
            onPageChange={(newPage:number) => setPage(newPage)}
          />
        </ComponentCard>

        {/* Add/Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4" closeOnOutsideClick={false}>
          <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editMode ? "Edit Setting" : "Add Setting"}
            </h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role *</Label>
                  <select {...register("role_id", { valueAsNumber: true })} className="w-full border p-2 rounded-md">
                    <option value="">Select Role</option>
                    {roles
                    .filter((role: any) => role.name !== "Admin")
                    .map((record: any) => (
                      <option key={record.id} value={record.id}>
                        {record.name}
                      </option>
                    ))}
                  </select>
                  {errors.role_id && <p className="text-red-500 text-sm">{errors.role_id.message}</p>}
                </div>

                <div>
                  <Label>Shipping Type (optional)</Label>
                  <select {...register("shipping_types_id", { valueAsNumber: true })} className="w-full border p-2 rounded-md">
                    <option value="">None</option>
                    {shippingType.map((s:any) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input placeholder="" {...register("title")} />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>

                <div>
                  <Label>Amount *</Label>
                  <Input type="number" step="0.01" placeholder="Enter amount" {...register("amount")} />
                  {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type *</Label>
                  <select {...register("type")} className="w-full border p-2 rounded-md">
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
                </div>

                <div>
                  <Label>Status *</Label>
                  <select {...register("active")} className="w-full border p-2 rounded-md">
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input placeholder="Optional description" {...register("description")} />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting || loading}>
                  {loading ? "Saving..." : editMode ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-md m-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="text-xl font-semibold mb-4">Confirm Deletion</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this setting? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={deleteSetting} disabled={loading} className="bg-red-600 text-white">
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
