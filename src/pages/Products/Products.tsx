import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { PencilIcon, TrashBinIcon } from "../../icons";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useModal } from "../../hooks/useModal";
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchProduct } from "../../slices/productSlice";
import TextArea from "../../components/form/input/TextArea";

const schema = yup.object().shape({
  title: yup.string().required("Product title is required"),
  description: yup.string().required("Description is required"),
  product_url: yup
    .string()
    .required("Product URL is required")
    .url("Enter a valid URL (e.g. https://example.com)"),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .min(0, "Quantity cannot be negative"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0, "Price cannot be negative"),
  weight: yup
    .number()
    .typeError("Weight must be a number")
    .required("Weight is required")
    .min(0, "Weight cannot be negative"),
});

interface Product {
  id: number;
  title: string;
  description: string;
  product_url: string;
  quantity: number;
  price: number;
  weight: number;
}

type FormData = {
  title: string;
  description: string;
  product_url: string;
  quantity: number;
  price: number;
  weight: number;
};

export default function Products() {
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: any) => state.products);

  useEffect(() => {
    dispatch(fetchProduct());
  }, [dispatch]);

  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onClose = () => {
    reset();
    setSelectedProduct(null); // clear edit state
    closeModal();
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      let res;
      if (selectedProduct) {
        // Edit mode
        res = await ApiHelper("PUT", `/products/${selectedProduct.id}`, data);
      } else {
        // Add mode
        res = await ApiHelper("POST", "/products", data);
      }

      if (res.status === 200) {
        toast.success(res.data.message || (selectedProduct ? "Product updated!" : "Product added!"));
        setTimeout(() => {
          dispatch(fetchProduct());
          onClose();
        }, 1000);
      } else {
        toast.error(res.data.message || "Failed to save ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong!", {
        style: { background: "#f44336", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  const editProduct = (product: Product) => {
    setSelectedProduct(product);
    reset(product); // pre-fill form
    openModal();
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      const res = await ApiHelper("DELETE", `/products/${productToDelete.id}`);
      if (res.status === 200) {
        toast.success(res.data.message || "Product deleted!");
        dispatch(fetchProduct());
      } else {
        toast.error(res.data.message || "Failed to delete ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };


  const columns = [
    { key: "title", header: "Title" },
    { key: "description", header: "Description" },
    { key: "product_url", header: "Url" },
    { key: "quantity", header: "Quantity" },
    { key: "price", header: "Price Per Unit(USD$)" },
    { key: "weight", header: "Weight Per Unit (Gram)" },
    {
      key: "actions",
      header: "Actions",
      render: (row: Product) => (
        <div className="flex gap-3">
          <button
            onClick={() => editProduct(row)}
            className="p-2 border border-blue-300 rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition"
          >
            <PencilIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setProductToDelete(row);
              setDeleteModalOpen(true);
            }}
            className="p-2 border border-red-300 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition"
          >
            <TrashBinIcon className="w-5 h-5" />
          </button>
          {/* Delete Confirmation Modal */}
          <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-md m-4">
            <div className="bg-white p-6 rounded-2xl text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Confirm Delete
              </h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete <strong>{productToDelete?.title}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProduct}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </Modal>

        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Delivering Parcel | Products" description="" />
      <PageBreadcrumb pageTitle="Products" />
      <div className="space-y-6">
        <ComponentCard
          title="Products"
          actions={
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedProduct(null); // reset to add mode
                  reset(); // clear form
                  openModal();
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                + Add Product
              </button>
            </div>
          }
        >
          <DParcelTable columns={columns} data={products} />
        </ComponentCard>

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
          <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedProduct ? "Edit Product" : "Add Product"}
            </h4>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <Label>
                  Product Title <span className="text-error-500">*</span>
                </Label>
                <Input type="text" placeholder="Enter product title" {...register("title")} />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <Label>Description <span className="text-error-500">*</span></Label>
                <TextArea placeholder="Enter description" {...register("description")}></TextArea>
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>

              {/* Product URL */}
              <div>
                <Label>
                  Product URL <span className="text-error-500">*</span>
                </Label>
                <Input type="text" placeholder="Enter product URL" {...register("product_url")} />
                {errors.product_url && <p className="text-red-500 text-sm">{errors.product_url.message}</p>}
              </div>

              {/* Quantity, Price, Weight in one row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Quantity <span className="text-error-500">*</span></Label>
                  <Input type="number" placeholder="Enter quantity" {...register("quantity")} />
                  {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
                </div>

                <div>
                  <Label>Price <span className="text-error-500">*</span></Label>
                  <Input type="number" step="0.01" placeholder="Enter price" {...register("price")} />
                  {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                </div>

                <div>
                  <Label>Weight (Gram) <span className="text-error-500">*</span></Label>
                  <Input type="number" step="0.01" placeholder="Enter weight" {...register("weight")} />
                  {errors.weight && <p className="text-red-500 text-sm">{errors.weight.message}</p>}
                </div>
              </div>



              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <Button size="sm" variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting || loading}>
                  {loading ? "Saving..." : selectedProduct ? "Update Product" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>


      </div>
    </>
  );
}
