import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Controller, useForm } from "react-hook-form";
import Checkbox from "../../components/form/input/Checkbox";
import { AppDispatch } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { fetchServices } from "../../slices/servicesSlice";
import { fetchPaymentPlan } from "../../slices/getPaymentSettingForRolesSlice";
import { fetchCountries } from "../../slices/countriesSlice";
import { fetchStates } from "../../slices/statesSlice";
import { fetchCities } from "../../slices/citiesSlice";

const steps = ["Shipping Info", "Shipping Address", "Product Details", "Additional Services"];

type Product = {
  title: string;
  price: number;
  description: string;
  weight: number;
  quantity: number;
  product_url: string;
};

const stepSchemas = [
  // Step 1: Service Type
  yup.object().shape({
    serviceType: yup.string().required("Please select a service type"),
  }),

  // Step 2: Shipping Address
  yup.object().shape({
    ship_from_country_id: yup
      .number()
      .typeError("Country is required")
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? undefined : value
      )
      .required("Country is required"),

    ship_from_state_id: yup
      .number()
      .typeError("State is required")
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? undefined : value
      )
      .required("State is required"),

    ship_from_city_id: yup
      .number()
      .typeError("City is required")
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? undefined : value
      )
      .required("City is required"),

    ship_to_country_id: yup
      .number()
      .typeError("Country is required")
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? undefined : value
      )
      .required("Country is required"),

    ship_to_state_id: yup
      .number()
      .typeError("State is required")
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? undefined : value
      )
      .required("State is required"),

    ship_to_city_id: yup
      .number()
      .typeError("City is required")
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? undefined : value
      )
      .required("City is required"),
  }),

  // Step 3: Product Validation (handled separately)
  yup.object().shape({}), // Leave empty, we'll handle products manually

  // Step 4: Terms validation
  yup.object().shape({
    terms: yup.boolean().oneOf([true], "You must accept the terms"),
  }),
];

const productSchema = yup.object().shape({
  title: yup.string().required("Product title is required"),

  description: yup.string().required("Description is required"),

  product_url: yup
    .string()
    .required("Product URL is required")
    .matches(
      /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/,
      "Enter a valid single URL"
    ),

  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .positive("Quantity must be greater than 0")
    .integer("Quantity must be an integer")
    .max(1000, "Quantity cannot be greater than 1000")
    .required("Quantity is required"),

  price: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be greater than 0")
    .max(10000, "Price cannot be greater than 10000")
    .required("Price is required"),

  weight: yup
    .number()
    .typeError("Weight must be a number")
    .positive("Weight must be greater than 0")
    .required("Weight is required"),
});

export default function Order() {
  const dispatch = useDispatch<AppDispatch>();
  const { services } = useSelector((state: any) => state.services);
  const { data: paymentPlanData } = useSelector((state: any) => state.paymentPlan);
  const [currentStep, setCurrentStep] = useState(0);
  const [productRequired, setProductRequired] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [shipTypeId, setShipTypeId] = useState(0);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const { data: countries} = useSelector((state: any) => state.countries);
  const { data: states } = useSelector((state: any) => state.states);
  const { data: cities } = useSelector((state: any) => state.cities);

  // main step form
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: yupResolver(stepSchemas[currentStep] as any),
    mode: "onChange",
    defaultValues: {
      serviceType: "",
      shipFrom: "",
      shipTo: "",
      products: [],
      weight: "",
      price: "",
      terms: false,
    },
  });

  const {
    register: registerProduct,
    handleSubmit: handleProductSubmit,
    reset: resetProductForm,
    formState: { errors: productErrors },
  } = useForm<Product>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      title: "",
      price: 0,
      description: "",
      weight: 0,
      quantity: 1,
      product_url: "",
    },
  });


  const handleAddNewProduct = () => {
    resetProductForm();
    setSelectedProductIndex(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (index: number) => {
    const product = products[index];
    resetProductForm(product);
    setSelectedProductIndex(index);
    setIsProductModalOpen(true);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
    toast.success("Product removed successfully");
  };

  const handleSaveProduct = (data: Product) => {
    if (selectedProductIndex !== null) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p, i) => (i === selectedProductIndex ? data : p))
      );
      toast.success("Product updated!");
    } else {
      // Add new product
      setProducts((prev) => [...prev, data]);
      toast.success("Product added!");
    }
    setProductRequired(false)
    setIsProductModalOpen(false);
  };

  const nextStep = async () => {
    // Validate fields for this step
    const isValid = await trigger();
    if (!isValid) return;

    // Step 3 (Product Details): must have at least one product
    if (currentStep === 2 && products.length === 0) {
      // toast.error("Please add at least one product before continuing.");
      setProductRequired(true)
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const onSubmitForm = async (data: any) => {
    
    try {
      // 1️⃣ Get active and selected services
      const activeServices = services?.filter((item: any) => item.status === 1) || [];

      // Use watch() to get checkbox states
      const watchedValues = watch();

      // Find all checked or required services
      const selectedServices = activeServices.filter((item: any) => {
        const fieldName = item.title.replace(/\s+/g, "_").toLowerCase();
        const isRequired = item.is_required === 1;
        return isRequired || watchedValues[fieldName];
      });

      // Map to minimal payload (only IDs)
      const servicePayload = selectedServices.map((s: any) => ({
        service_id: s.id,
      }));

      // 2️⃣ Create final payload
      const payload = {
        service_type: data.serviceType === "Buy For Me" ? "buy_for_me" : "ship_for_me",
        ship_from_country_id: data.ship_from_country_id,
        ship_from_state_id: data.ship_from_state_id,
        ship_from_city_id: data.ship_from_city_id,
        ship_to_country_id: data.ship_to_country_id,
        ship_to_state_id: data.ship_to_state_id,
        ship_to_city_id: data.ship_to_city_id,
        products, // from your products state
        services: servicePayload, // selected service IDs
      };

      // 3️⃣ Send to backend
      const res = await ApiHelper("POST", "/order/store", payload);

      if (res.status === 200 && res.data.success) {
        toast.success(res.data.message || "Order placed successfully");
        reset();
        setProducts([]);
        setCurrentStep(0);
      } else {
        toast.error(res.data.message || "Failed to place order ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong!", {
        style: { background: "#f44336", color: "#fff" },
      });
    } finally {
      
    }
  };

  const handleServiceChange = (option: string, onChange: any) => {
    onChange(option);
    const shippingTypeId = option === "Buy For Me" ? 1 : 2;
    setShipTypeId(shippingTypeId)
    dispatch(fetchPaymentPlan({ shipping_types_id: shippingTypeId }));
  };

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchCountries());
  }, [dispatch]);

  return (
    <>
      <PageMeta title="Delivering Parcel | Request" description="" />
      <PageBreadcrumb pageTitle="Request" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 flex items-center last:flex-none">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition 
                  ${index === currentStep
                    ? "bg-blue-500 text-white shadow-lg"
                    : index < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
              >
                {index < currentStep ? "✓" : index + 1}
              </div>
              <span className="ml-3 font-medium hidden sm:inline-block">{step}</span>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 bg-gray-200 mx-3">
                  <div
                    className={`h-1 transition ${index < currentStep ? "bg-blue-500" : ""}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
          {/* Step 0 */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Service Type</h2>
              {/* <Controller
                control={control}
                name="serviceType"
                render={({ field }) => (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {["Buy For Me", "Ship For Me"].map((option) => (
                      <label
                        key={option}
                        className={`flex-1 flex items-center justify-between cursor-pointer rounded-xl border p-5 transition 
                          ${field.value === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          value={option}
                          checked={field.value === option}
                          onChange={() => field.onChange(option)}
                          className="hidden"
                        />
                        <span className="font-medium text-gray-700">{option}</span>
                        {field.value === option && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                            ✓
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              /> */}
              <Controller
                control={control}
                name="serviceType"
                render={({ field }) => (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {["Buy For Me", "Ship For Me"].map((option) => (
                      <label
                        key={option}
                        className={`flex-1 flex items-center justify-between cursor-pointer rounded-xl border p-5 transition 
                          ${field.value === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          value={option}
                          checked={field.value === option}
                          onChange={() => handleServiceChange(option, field.onChange)}
                          className="hidden"
                        />
                        <span className="font-medium text-gray-700">{option}</span>
                        {field.value === option && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                            ✓
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.serviceType && (
                <p className="text-red-500 text-sm">{errors.serviceType.message as string}</p>
              )}
            </div>
          )}

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Shipping Address</h2>

              {/* SHIP FROM SECTION */}
              <div className="border p-4 rounded-xl bg-gray-50">
                <h3 className="font-semibold mb-2">Ship From</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Country */}
                  <div>
                    <Label>Country <span className="text-red-500">*</span></Label>
                    <select
                      value={watch("ship_from_country_id") || ""}
                      {...register("ship_from_country_id")}
                      onChange={(e) => {
                        const countryId = Number(e.target.value);
                        setValue("ship_from_country_id", countryId);
                        setValue("ship_from_state_id", "");
                        setValue("ship_from_city_id", "");
                        if (countryId) dispatch(fetchStates(countryId));
                      }}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Country</option>
                      {countries?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.ship_from_country_id && <p className="text-red-500 text-sm">{errors.ship_from_country_id.message as string}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <Label>State <span className="text-red-500">*</span></Label>
                    <select
                      value={watch("ship_from_state_id") || ""}
                      {...register("ship_from_state_id")}
                      onChange={(e) => {
                        const stateId = Number(e.target.value);
                        setValue("ship_from_state_id", stateId);
                        setValue("ship_from_city_id", "");
                        if (stateId) dispatch(fetchCities(stateId));
                      }}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      {states?.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {errors.ship_from_state_id && <p className="text-red-500 text-sm">{errors.ship_from_state_id.message as string}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <Label>City <span className="text-red-500">*</span></Label>
                    <select
                      value={watch("ship_from_city_id") || ""}
                      {...register("ship_from_city_id")}
                      onChange={(e) => setValue("ship_from_city_id", Number(e.target.value))}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select City</option>
                      {cities?.map((city: any) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                    {errors.ship_from_city_id && <p className="text-red-500 text-sm">{errors.ship_from_city_id.message as string}</p>}
                  </div>
                </div>
              </div>

              {/* SHIP TO SECTION */}
              <div className="border p-4 rounded-xl bg-gray-50">
                <h3 className="font-semibold mb-2">Ship To</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Country */}
                  <div>
                    <Label>Country <span className="text-red-500">*</span></Label>
                    <select
                      value={watch("ship_to_country_id") || ""}
                      {...register("ship_to_country_id")}
                      onChange={(e) => {
                        const countryId = Number(e.target.value);
                        setValue("ship_to_country_id", countryId);
                        setValue("ship_to_state_id", "");
                        setValue("ship_to_city_id", "");
                        if (countryId) dispatch(fetchStates(countryId));
                      }}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Country</option>
                      {countries?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.ship_to_country_id && <p className="text-red-500 text-sm">{errors.ship_to_country_id.message as string}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <Label>State <span className="text-red-500">*</span></Label>
                    <select
                      value={watch("ship_to_state_id") || ""}
                      {...register("ship_to_state_id")}
                      onChange={(e) => {
                        const stateId = Number(e.target.value);
                        setValue("ship_to_state_id", stateId);
                        setValue("ship_to_city_id", "");
                        if (stateId) dispatch(fetchCities(stateId));
                      }}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      {states?.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {errors.ship_to_state_id && <p className="text-red-500 text-sm">{errors.ship_to_state_id.message as string}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <Label>City <span className="text-red-500">*</span></Label>
                    <select
                      value={watch("ship_to_city_id") || ""}
                      {...register("ship_to_city_id")}
                      onChange={(e) => setValue("ship_to_city_id", Number(e.target.value))}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select City</option>
                      {cities?.map((city: any) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                    {errors.ship_to_city_id && <p className="text-red-500 text-sm">{errors.ship_to_city_id.message as string}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Product Details</h2>
                <Button onClick={handleAddNewProduct}>+ Add Product</Button>
              </div>
              {currentStep === 2 && products.length === 0 && productRequired && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  Please add at least one product before continuing.
                </p>
              )}
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  No products added yet. Click “Add Product” to get started.
                </p>
              ) : (
                <>
                  {/* Product Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-5 flex flex-col border border-gray-100"
                      >
                        {/* {product.product_url ? (
                          <div className="relative w-full h-44 mb-4 overflow-hidden rounded-xl">
                            <img
                              src={product.product_url}
                              alt={product.title}
                              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-44 mb-4 bg-gray-50 rounded-xl text-gray-400 text-sm">
                            No image available
                          </div>
                        )} */}
                        <div className=" w-full h-44 bg-gray-400 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {product.title.charAt(0)}
                          </span>
                        </div>

                        <h4 className="text-lg font-semibold text-gray-800 mb-1">{product.title}</h4>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>

                        <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-700">
                          <p>
                            <span className="font-medium text-gray-800">Price:</span> ${product.price}
                          </p>
                          <p>
                            <span className="font-medium text-gray-800">Qty:</span> {product.quantity}
                          </p>
                          <p>
                            <span className="font-medium text-gray-800">Weight:</span> {product.weight}g
                          </p>
                        </div>

                        <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleEditProduct(index)}
                            className="px-3 py-1.5 text-sm border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemoveProduct(index)}
                            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Summary */}
                  <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <p className="text-gray-800 font-semibold text-lg">Totals</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="text-gray-700">
                        <span className="font-medium">Total Approx Weight:</span>{" "}
                        {products.reduce(
                          (sum, p) => sum + (Number(p.weight) || 0) * (Number(p.quantity) || 0),
                          0
                        )}{" "}
                        g
                      </div>
                      <div className="text-gray-700">
                        <span className="font-medium">Total Price:</span> $
                        {products
                          .reduce(
                            (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
                            0
                          )
                          .toFixed(2)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Additional Services</h2>
              {/* Watch form data */}
              {(() => {
                const watchedValues = watch();

                // 🧮 1. Product total
                const productTotal = products.reduce(
                  (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
                  0
                );

                // 🧮 2. Service total
                const activeServices = services?.filter((item: any) => item.status === 1) || [];
                const selectedServices = activeServices.filter((item: any) => {
                  const fieldName = item.title.replace(/\s+/g, "_").toLowerCase();
                  const isRequired = item.is_required === 1;
                  return isRequired || watchedValues[fieldName];
                });

                const serviceTotal = selectedServices.reduce(
                  (sum: number, s: { price?: string }) => sum + Number(s.price || 0),
                  0
                );

                // 🧮 3. Base total depends on shipTypeId
                const baseTotal =
                  shipTypeId === 1
                    ? productTotal + serviceTotal
                    : serviceTotal;

                // 🧮 4. Payment plan total calculated on baseTotal
                const paymentPlanTotal =
                  paymentPlanData?.reduce((sum: number, plan: any) => {
                    const amount = Number(plan.amount);
                    if (plan.type === "percent") {
                      return sum + (baseTotal * amount) / 100;
                    } else {
                      return sum + amount;
                    }
                  }, 0) || 0;

                // 🧮 5. Final grand total
                const grandTotal = baseTotal + paymentPlanTotal;


                return (
                  <>
                    {/* Services Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {services?.filter((item: any) => item.status === 1).map((item: any) => {
                        const inputName = item.title.replace(/\s+/g, "_").toLowerCase();
                        const isRequired = item.is_required === 1;

                        return (
                          <div key={item.id} className="relative group">
                            {/* Tooltip */}
                            <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg z-10">
                              {item.description}
                            </div>

                            <label
                              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer bg-white shadow-sm hover:shadow-md transition ${isRequired ? "bg-gray-50 cursor-not-allowed" : ""
                                }`}
                            >
                              <input
                                type="checkbox"
                                {...register(inputName)}
                                className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                defaultChecked={isRequired}
                                disabled={isRequired}
                                required={isRequired}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-700">
                                  {item.title}{" "}
                                  {isRequired && (
                                    <span className="text-red-500 text-sm ml-1">*</span>
                                  )}
                                </span>
                                {item.price && (
                                  <span className="text-sm text-gray-500">${item.price}</span>
                                )}
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    {/* ✅ Payment Plan Display */}
                    {paymentPlanData?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Plans</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {paymentPlanData.map((plan: any) => (
                            <div
                              key={plan.id}
                              className="p-4 border rounded-lg bg-white shadow-sm flex justify-between"
                            >
                              <span className="font-medium text-gray-700">{plan.title}</span>
                              <span className="text-gray-600">
                                {plan.type === "percent"
                                  ? `${plan.amount}%`
                                  : `$${plan.amount}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Totals Section */}
                    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <p className="text-gray-800 font-semibold text-lg">Totals</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="text-gray-700">
                          <span className="font-medium">Products Total:</span> ${productTotal.toFixed(2)}
                        </div>
                        <div className="text-gray-700">
                          <span className="font-medium">Services Total:</span> ${serviceTotal.toFixed(2)}
                        </div>
                        <div className="text-gray-700">
                          <span className="font-medium">Payment Plans:</span> ${paymentPlanTotal.toFixed(2)}
                        </div>
                        <div className="text-gray-800 font-semibold">
                          <span className="font-medium">Grand Total:</span> ${grandTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Controller
                        control={control}
                        name="terms"
                        render={({ field }) => (
                          <Checkbox
                            className="w-5 h-5 mt-1"
                            checked={field.value}
                            onChange={() => field.onChange(!field.value)}
                          />
                        )}
                      />
                      <p className="text-sm text-gray-600">
                        By clicking the tick button, I hereby agree and consent to the{" "}
                        <a href="#" className="text-blue-500 underline">
                          terms of business
                        </a>
                        , its policies, and the privacy policy.
                      </p>
                    </div>
                    {errors.terms && (
                      <p className="text-red-500 text-sm">
                        {errors.terms?.message as string}
                      </p>
                    )}
                  </>
                );
              })()}

            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-5 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit(onSubmitForm)}
                className="px-5 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedProductIndex !== null ? "Edit Product" : "Add Product"}
          </h4>
          <form onSubmit={handleProductSubmit(handleSaveProduct)} className="space-y-6">
            <div>
              <Label>Product Title *</Label>
              <Input type="text" placeholder="Enter product title" {...registerProduct("title")} />
              {productErrors.title && <p className="text-red-500 text-sm mt-1">{productErrors.title.message}</p>}
            </div>

            <div>
              <Label>Description *</Label>
              <TextArea placeholder="Enter description" {...registerProduct("description")} />
              {productErrors.description && <p className="text-red-500 text-sm mt-1">{productErrors.description.message}</p>}
            </div>

            <div>
              <Label>Product URL *</Label>
              <Input type="text" placeholder="Enter product URL" {...registerProduct("product_url")} />
              {productErrors.product_url && <p className="text-red-500 text-sm mt-1">{productErrors.product_url.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Quantity *</Label>
                <Input type="number" {...registerProduct("quantity")} />
                {productErrors.quantity && <p className="text-red-500 text-sm mt-1">{productErrors.quantity.message}</p>}
              </div>
              <div>
                <Label>Price *</Label>
                <Input type="number" step="0.01" {...registerProduct("price")} />
                {productErrors.price && <p className="text-red-500 text-sm mt-1">{productErrors.price.message}</p>}
              </div>
              <div>
                <Label>Weight (Gram) *</Label>
                <Input type="number" step="0.01" {...registerProduct("weight")} />
                {productErrors.weight && <p className="text-red-500 text-sm mt-1">{productErrors.weight.message}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button size="sm" variant="outline" onClick={() => setIsProductModalOpen(false)}>
                Close
              </Button>
              <Button type="submit" size="sm">
                {selectedProductIndex !== null ? "Update Product" : "Save Product"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
