import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { ApiHelper } from "../../ApiHelper";
import toast from "react-hot-toast";
import { AppDispatch } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderStatus } from "../../../slices/orderStatusSlice";
import Label from "../../../components/form/Label";
import TextArea from "../../../components/form/input/TextArea";
import Input from "../../../components/form/input/InputField";

const schema = yup.object().shape({
  status: yup.string().required("Status is required"),
  // tracking_number: yup.string().optional(),
  // remarks: yup.string().optional(),
});

// 👇 renamed this to avoid clash with built-in FormData
type OrderStatusFormData = {
  status: string;
  tracking_number?: string;
  remarks?: string;
};

interface ViewOffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}
const excludedStatuses = [
  "Pending",
  "Offer Placed",
  "Offer Accepted",
  "Payment Pending",
  "Received",
  "Completed",
];

export default function ViewShopperOffersDrawer({
  isOpen,
  onClose,
  orderData,
}: ViewOffersDrawerProps) {
  if (!orderData) return null;

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: any) => state.orderStatus);
  const [orderStatusOptions, setOrderStatusOptions] = useState<
    { id: number; name: string; disabled: boolean }[]
  >([]);

  // const [isLoading, setIsLoading] = useState(false);
  const [orderTracking, setOrderTrackingData] = useState<any>([]);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrderStatusFormData>({
    resolver: yupResolver(schema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data: OrderStatusFormData) => {
    // setIsLoading(true);

    try {
      const payload: any = {
        order_id: orderData.id,
        status_id: data.status,
        tracking_number: data.tracking_number || "",
        remarks: data.remarks || "",
        files,
      };

      const res = await ApiHelper("POST", "/order/update-status", payload);

      if (res.status === 200) {
        getOrderTrackingData()
        toast.success(res.data.message || "Status updated successfully 🎉");
        reset();
        setFiles([]);
      } else {
        toast.error(res.data.message || "Failed to update ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchOrderStatus());
  }, [dispatch]);

  const getOrderTrackingData = async () => {
    // setIsLoading(true);
    try {
      const res = await ApiHelper("GET", `/order/get-order-tracking/${orderData.id}`);
      if (res.status === 200) {
        const trackingArray = res.data.data;
        setOrderTrackingData(trackingArray);
        const options = trackingArray
          .filter((st: any) => !excludedStatuses.includes(st.status_name))
          .map((st: any) => {
            return {
              id: st.status_id,
              name: st.status_name,
              disabled: st.is_completed, // only completed steps disabled
            };
          });

        setOrderStatusOptions(options);
      } else {
        setOrderTrackingData([]);
      }
    } catch {
      toast.error("Failed to fetch offers");
    } finally {
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderData.id) {
      getOrderTrackingData();
    }
  }, [orderData]);

  return (
    <div className="fixed inset-0 z-[100] mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            Manage Order – #{orderData?.order?.tracking_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-60px)]">
          {/* Order Actions */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              {/* Status */}
              <div>
                <Label>
                  Status <span className="text-error-500">*</span>
                </Label>
                <select
                  {...register("status")}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring focus:ring-blue-200"
                >
                  <option value="">Select status</option>
                  {orderStatusOptions.map((st) => (
                    <option key={st.id} value={st.id} disabled={st.disabled}>
                      {st.name.charAt(0).toUpperCase() + st.name.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status.message}</p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <Label>File</Label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 
                    file:mr-3 file:py-2 file:px-4 file:rounded-md 
                    file:border-0 file:bg-blue-50 file:text-blue-700 
                    hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Tracking number */}
            <div>
              <Label>Tracking Number</Label>
              <Input
                type="text"
                placeholder="Enter tracking number"
                {...register("tracking_number")}
              />
            </div>

            {/* Remarks */}
            <div>
              <Label>Remarks</Label>
              <TextArea
                placeholder="Enter description"
                {...register("remarks")}
              />
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md 
                  hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading || isSubmitting ? "Updating..." : "Update Status"}
              </button>
            </div>
          </form>

          {/* Order History */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-6">Order Tracking</h3>

            <ul className="relative">
              {orderTracking.map((status: any, idx: number) => {
                const isCompleted = status.is_completed;
                const nextStatus = orderTracking[idx + 1];
                const isCurrent = isCompleted && !nextStatus?.is_completed;

                return (
                  <li key={status.status_id} className="flex items-start relative">

                    {/* Left: circle + vertical line */}
                    <div className="flex flex-col items-center relative">
                      {/* Circle */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center z-10
                ${isCompleted
                            ? isCurrent
                              ? "bg-green-400 border-2 border-green-600 text-white"
                              : "bg-green-600 text-white"
                            : "bg-gray-300 text-gray-600"
                          }`}
                      >
                        {!isCurrent && isCompleted ? "✓" : ""}
                      </div>

                      {/* Vertical line connecting to next circle */}
                      {idx !== orderTracking.length - 1 && (
                        <div
                          className={`w-1 h-6 mt-0.5 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`}
                        ></div>
                      )}
                    </div>

                    {/* Right: step info */}
                    <div className="ml-4">
                      <p
                        className={`text-sm font-medium ${isCurrent ? "text-blue-600" : "text-gray-800"
                          }`}
                      >
                        {status.status_name} {isCurrent && "(Current)"}
                      </p>

                      {status.tracking && (
                        <div className="text-xs text-gray-500 mt-1">
                          {status.tracking.tracking_number && (
                            <p>Tracking #: {status.tracking.tracking_number}</p>
                          )}
                          {status.tracking.created_at && (
                            <p>{new Date(status.tracking.created_at).toLocaleString()}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
