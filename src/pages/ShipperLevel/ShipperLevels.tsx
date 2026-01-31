import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import DParcelTable from "../../components/tables/DParcelTable";
import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useModal } from "../../hooks/useModal";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import MultiSelect from "../../components/form/MultiSelect";

export interface ShipperLevelFormData {
  id: number;
  title: string;
  fee: number;
  max_orders: number;
  max_locations: number;
  status?: number;
  shipping_type_ids: number[];
}

// ✅ Validation schema
const schema = yup.object({
  title: yup.string().required("Title is required"),
  fee: yup
    .number()
    .typeError("Fee must be a number")
    .required("Fee is required"),
  max_orders: yup
    .number()
    .typeError("Max orders must be a number")
    .required("Max orders is required"),
  max_locations: yup
    .number()
    .typeError("Max locations must be a number")
    .required("Max locations is required"),
  status: yup
    .number()
    .typeError("Status is required")
    .required("Status is required")
    .oneOf([0, 1], "Invalid status")
    .default(1),
  shipping_type_ids: yup
  .array()
  .of(
    yup
      .number()
      .transform((originalVal) => {
        if (originalVal === "" || originalVal === undefined || originalVal === null)
          return undefined;
        return Number(originalVal);
      })
      .typeError("Invalid type ID")
  )
  .min(1, "Select at least one shipping type")
  .required("Select at least one shipping type"),
});

export default function ShipperLevels() {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [levels, setLevels] = useState<ShipperLevelFormData[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [shippingTypes, setShippingTypes] = useState<any>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShipperLevelFormData>({
    resolver: yupResolver(schema) as any,
  });

  const fetchShippingTypes = async () => {
    try {
      const res = await ApiHelper("GET", "/shipping-types");
      if (res.status === 200) {
        const formatted = res.data.data.map((item: any) => ({
          value: String(item.id),
          text: item.title,
        }));
        setShippingTypes(formatted);
      }
    } catch (err: any) {
      toast.error("Failed to load shipping types ❌");
    }
  };

  // ✅ Fetch all levels
  const fetchLevels = async () => {
    try {
      setLoading(true);
      const res = await ApiHelper("GET", "/admin/shipper-levels");
      if (res.status === 200) {
        setLevels(res.data.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load levels ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
    fetchShippingTypes();
  }, []);

  // ✅ Submit handler
  const onSubmit = async (data: ShipperLevelFormData) => {
    setLoading(true);
    try {
      const endpoint = editMode
        ? `/admin/shipper-levels/update/${selectedLevelId}`
        : "/admin/shipper-levels/store";
      const method = editMode ? "PUT" : "POST";

      const res = await ApiHelper(method, endpoint, data);

      if (res.status === 200) {
        toast.success(res.data.message || "Saved successfully ✅");
        fetchLevels();
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

  // ✅ Edit level
  const editLevel = (id: number) => {
    const level = levels.find((l) => l.id === id);
    if (level) {
      reset({
        title: level.title,
        fee: level.fee,
        max_orders: level.max_orders,
        max_locations: level.max_locations,
        status: level.status,
      });
      setSelectedLevelId(id);
      setEditMode(true);
      openModal();
    }
  };

  // ✅ Delete level
  const deleteLevel = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await ApiHelper("DELETE", `/admin/shipper-levels/destroy/${deleteId}`);
      if (res.status === 200) {
        toast.success(res.data.message || "Deleted successfully ✅");
        fetchLevels();
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

  // ✅ Close modal
  const onClose = () => {
    reset();
    setEditMode(false);
    setSelectedLevelId(null);
    closeModal();
  };

  // ✅ Table columns
  const columns: any = [
    { key: "title", header: "Title" },
    { key: "fee", header: "Fee" },
    { key: "max_orders", header: "Max Orders" },
    { key: "max_locations", header: "Max Locations" },
    {
      key: "status",
      header: "Status",
      render: (row: ShipperLevelFormData) => (
        <Badge
          size="sm"
          color={row.status === 1 ? "success" : "warning"}
        >
          {row.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ShipperLevelFormData) => (
        <div className="flex gap-3">
          <button
            onClick={() => editLevel(row.id!)}
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
      <PageMeta title="Admin | Shipper Levels" description="Manage shipper levels" />
      <PageBreadcrumb pageTitle="Shipper Levels" />

      <div className="space-y-6">
        <ComponentCard title="Shipper Levels">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={openModal}>
              Add Level
            </Button>
          </div>
          <DParcelTable columns={columns} data={levels} />
        </ComponentCard>

        {/* Add/Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4" closeOnOutsideClick={false}>
          <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editMode ? "Edit Level" : "Add Level"}
            </h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input placeholder="Enter level title" {...register("title")} />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>

                <div>
                  <Label>Fee *</Label>
                  <Input type="number" step="0.01" placeholder="Enter fee" {...register("fee")} />
                  {errors.fee && <p className="text-red-500 text-sm">{errors.fee.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Orders *</Label>
                  <Input type="number" placeholder="Max orders" {...register("max_orders")} />
                  {errors.max_orders && <p className="text-red-500 text-sm">{errors.max_orders.message}</p>}
                </div>

                <div>
                  <Label>Max Locations *</Label>
                  <Input type="number" placeholder="Max locations" {...register("max_locations")} />
                  {errors.max_locations && <p className="text-red-500 text-sm">{errors.max_locations.message}</p>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                {/* Status dropdown */}
                <div className="flex-1">
                  <Label>Status</Label>
                  <select
                    {...register("status", { valueAsNumber: true })}
                    className="w-full border p-2 rounded-md"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                {/* Shipping Types multiselect */}
                <div className="flex-1">
                  <Controller
                    name="shipping_type_ids"
                    control={control}
                    render={({ field }) => (
                      <>
                        <MultiSelect
                          label="Select Shipping Types *"
                          options={shippingTypes}
                          onChange={(values) => field.onChange(values)}
                        />
                        {errors.shipping_type_ids && (
                          <p className="text-red-500 text-sm">
                            {errors.shipping_type_ids.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>
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
              Are you sure you want to delete this level? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={deleteLevel} disabled={loading} className="bg-red-600 text-white">
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
