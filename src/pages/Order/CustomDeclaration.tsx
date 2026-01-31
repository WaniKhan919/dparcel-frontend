import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchCountries } from "../../slices/countriesSlice";
import { fetchStates } from "../../slices/statesSlice";
import { fetchCities } from "../../slices/citiesSlice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { ApiHelper } from "../../utils/ApiHelper";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useLocation } from "react-router";
import CustomDeclarationView from "./CustomDeclarationView";

interface FormValues {
  from_name: string;
  from_business: string;
  from_street: string;
  from_postcode: string;
  from_country: string;
  from_state: string;
  from_city: string;
  to_name: string;
  to_business: string;
  to_street: string;
  to_postcode: string;
  to_country: string;
  to_state: string;
  to_city: string;
  importer_reference?: string;
  importer_contact?: string;
  category_commercial_sample?: boolean;
  category_gift?: boolean;
  category_returned_goods?: boolean;
  category_documents?: boolean;
  category_other?: boolean;
  explanation?: string;
  comments?: string;
  office_origin_posting?: string;
  doc_licence?: boolean;
  doc_certificate?: boolean;
  doc_invoice?: boolean;
}

const validationSchema: Yup.ObjectSchema<FormValues> = Yup.object({
  from_name: Yup.string().required("Name is required"),
  from_business: Yup.string().required("Business is required"),
  from_street: Yup.string().required("Street is required"),
  from_postcode: Yup.string().required("Postcode is required"),
  from_country: Yup.string().required("Country is required"),
  from_state: Yup.string().required("State is required"),
  from_city: Yup.string().required("City is required"),
  to_name: Yup.string().required("Name is required"),
  to_business: Yup.string().required("Business is required"),
  to_street: Yup.string().required("Street is required"),
  to_postcode: Yup.string().required("Postcode is required"),
  to_country: Yup.string().required("Country is required"),
  to_state: Yup.string().required("State is required"),
  to_city: Yup.string().required("City is required"),
  importer_reference: Yup.string().optional(),
  importer_contact: Yup.string().optional(),
  category_commercial_sample: Yup.boolean().optional(),
  category_gift: Yup.boolean().optional(),
  category_returned_goods: Yup.boolean().optional(),
  category_documents: Yup.boolean().optional(),
  category_other: Yup.boolean().optional(),
  explanation: Yup.string().optional(),
  comments: Yup.string().optional(),
  office_origin_posting: Yup.string().optional(),
  doc_licence: Yup.boolean().optional(),
  doc_certificate: Yup.boolean().optional(),
  doc_invoice: Yup.boolean().optional(),

});

export default function CustomDeclarationForm() {
  const [step, setStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const dispatch = useDispatch<any>();

  const { data: countries } = useSelector((state: any) => state.countries);
  const { data: states } = useSelector((state: any) => state.states);
  const { data: cities } = useSelector((state: any) => state.cities);
  const [orderData, setOrderData] = useState<any>(null);
  const location = useLocation();
  const { order_id } = location.state || {};

  const {
    register,
    handleSubmit,
    setValue,
    trigger,  
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ApiHelper("GET", `/order/get-order-detail/${order_id}`);
      if (response.status === 200) {
        setOrderData(response.data.data);
        if (response.data.data?.custom_declaration) {
          setShowForm(false);
        } else {
          setShowForm(true);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch order details:", error);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  // ✅ This prevents auto submit when step 5 loads
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (step < 5) return;
    try {
      const payload = {
        ...data,
        order_id: order_id, // from previous screen
        shipping_type_id: orderData?.service_type === "buy_for_me" ? 1 : 2,
      };
      const res = await ApiHelper("POST", "/custom-declaration/store", payload);
      if (res.status === 200 && res.data.success) {

        toast.success("Custom Declaration submitted successfully!");
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create declaration.");
    }
  };

  // ✅ Step validation only when Next is clicked
  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ["from_name", "from_business", "from_street", "from_postcode", "from_country", "from_city"];
        break;
      case 2:
        fieldsToValidate = ["to_name", "to_business", "to_street", "to_postcode", "to_country", "to_city"];
        break;
      case 3:
        setTimeout(() => setStep(5), 0);
        return;
      case 4:
        setTimeout(() => setStep(5), 0);
        return;
      case 5:
        setTimeout(() => setStep(5), 0);
        break;
    }

    const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 5));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };

  useEffect(() => {
    if (showForm && orderData?.custom_declaration) {
      const data = orderData.custom_declaration;
      // reset the form with existing values
      reset({
        from_name: data.from_name || "",
        from_business: data.from_business || "",
        from_street: data.from_street || "",
        from_postcode: data.from_postcode || "",
        from_country: data.from_country?.id || "",
        from_state: data.from_state?.id || "",
        from_city: data.from_city?.id || "",
        to_name: data.to_name || "",
        to_business: data.to_business || "",
        to_street: data.to_street || "",
        to_postcode: data.to_postcode || "",
        to_country: data.to_country?.id || "",
        to_state: data.to_state?.id || "",
        to_city: data.to_city?.id || "",
        importer_reference: data.importer_reference || "",
        importer_contact: data.importer_contact || "",
        category_commercial_sample: data.category_commercial_sample || false,
        category_gift: data.category_gift || false,
        category_returned_goods: data.category_returned_goods || false,
        category_documents: data.category_documents || false,
        category_other: data.category_other || false,
        explanation: data.explanation || "",
        comments: data.comments || "",
        office_origin_posting: data.office_origin_posting || "",
        doc_licence: data.doc_licence || false,
        doc_certificate: data.doc_certificate || false,
        doc_invoice: data.doc_invoice || false,
      });

      // Optional: fetch states and cities if country/state exist
      if (data.from_country?.id) dispatch(fetchStates(data.from_country.id));
      if (data.from_state?.id) dispatch(fetchCities(data.from_state.id));
      if (data.to_country?.id) dispatch(fetchStates(data.to_country.id));
      if (data.to_state?.id) dispatch(fetchCities(data.to_state.id));
    }
  }, [showForm, orderData, dispatch, reset]);


  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <>
      <PageMeta title="Delivering Parcel | Custom Declaration" description="" />
      <PageBreadcrumb pageTitle="Custom Declaration" />
      {
        orderData?.custom_declaration && !showForm ? (
          <CustomDeclarationView
            data={orderData.custom_declaration}
            orderDetails={orderData.order_details}
            onEdit={() => setShowForm(true)} // 👈 open edit mode
          />
        ) :
          (
            <div className="max-w-5xl mx-auto p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
              {/* Stepper */}
              <div className="flex justify-between items-center mb-10 relative">
                {[
                  "From",
                  "To",
                  "Importer Details",
                  "Products Info",
                  "Declaration Info",
                ].map((label, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center relative">
                    {index < 3 && (
                      <div
                        className={`absolute top-5 left-1/2 w-full h-[3px] -z-10 ${step > index + 1 ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                          }`}
                      ></div>
                    )}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${step > index
                        ? "bg-blue-600 border-blue-600 text-white"
                        : step === index + 1
                          ? "border-blue-600 text-blue-600"
                          : "border-gray-400 text-gray-400"
                        }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${step >= index + 1
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                {/* STEP 1 */}
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label>Name</Label>
                        <Input type="text" {...register("from_name")} />
                        <p className="text-red-500 text-sm">
                          {errors.from_name?.message}
                        </p>
                      </div>

                      <div>
                        <Label>Business</Label>
                        <Input type="text" {...register("from_business")} />
                        <p className="text-red-500 text-sm">
                          {errors.from_business?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label>Street</Label>
                        <Input type="text" {...register("from_street")} />
                        <p className="text-red-500 text-sm">
                          {errors.from_street?.message}
                        </p>
                      </div>

                      <div>
                        <Label>Postcode</Label>
                        <Input type="text" {...register("from_postcode")} />
                        <p className="text-red-500 text-sm">
                          {errors.from_postcode?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <Label>Country</Label>
                        <select
                          {...register("from_country")}
                          onChange={(e) => {
                            const id = e.target.value;
                            setValue("from_country", id);
                            dispatch(fetchStates(Number(id)));
                          }}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select Country</option>
                          {countries?.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-red-500 text-sm">{errors.from_country?.message}</p>
                      </div>

                      <div>
                        <Label>State</Label>
                        <select
                          {...register("from_state")}
                          onChange={(e) => {
                            const id = e.target.value;
                            setValue("from_state", id);
                            dispatch(fetchCities(Number(id)));
                          }}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select State</option>
                          {states?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-red-500 text-sm">{errors.from_state?.message}</p>
                      </div>

                      <div>
                        <Label>City</Label>
                        <select
                          {...register("from_city")}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select City</option>
                          {cities?.map((city: any) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-red-500 text-sm">{errors.from_city?.message}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label>Name</Label>
                        <Input type="text" {...register("to_name")} />
                        <p className="text-red-500 text-sm">
                          {errors.to_name?.message}
                        </p>
                      </div>

                      <div>
                        <Label>Business</Label>
                        <Input type="text" {...register("to_business")} />
                        <p className="text-red-500 text-sm">
                          {errors.to_business?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label>Street</Label>
                        <Input type="text" {...register("to_street")} />
                        <p className="text-red-500 text-sm">
                          {errors.to_street?.message}
                        </p>
                      </div>

                      <div>
                        <Label>Postcode</Label>
                        <Input type="text" {...register("to_postcode")} />
                        <p className="text-red-500 text-sm">
                          {errors.to_postcode?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <Label>Country</Label>
                        <select
                          {...register("to_country")}
                          onChange={(e) => {
                            const id = e.target.value;
                            setValue("to_country", id);
                            dispatch(fetchStates(Number(id)));
                          }}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select Country</option>
                          {countries?.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-red-500 text-sm">{errors.to_country?.message}</p>
                      </div>

                      <div>
                        <Label>State</Label>
                        <select
                          {...register("to_state")}
                          onChange={(e) => {
                            const id = e.target.value;
                            setValue("to_state", id);
                            dispatch(fetchCities(Number(id)));
                          }}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select State</option>
                          {states?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-red-500 text-sm">{errors.to_state?.message}</p>
                      </div>

                      <div>
                        <Label>City</Label>
                        <select
                          {...register("to_city")}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select City</option>
                          {cities?.map((city: any) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-red-500 text-sm">{errors.to_city?.message}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label>Importer’s Reference (Optional)</Label>
                      <Input type="text" {...register("importer_reference")} />
                    </div>

                    <div>
                      <Label>Importer’s Telephone / Fax / Email (If Known)</Label>
                      <Input type="text" {...register("importer_contact")} />
                    </div>
                  </div>
                )}
                {/* STEP 4 */}
                {step === 4 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Product Details</h3>

                    {orderData?.order_details && orderData.order_details.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-lg">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 border">#</th>
                              <th className="px-4 py-2 border">Product Name</th>
                              <th className="px-4 py-2 border">Quantity</th>
                              <th className="px-4 py-2 border">Price</th>
                              <th className="px-4 py-2 border">Weight</th>
                              <th className="px-4 py-2 border">Total Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderData.order_details.map((item: any, index: number) => (
                              <tr key={item.id} className="text-center">
                                <td className="px-4 py-2 border">{index + 1}</td>
                                <td className="px-4 py-2 border">{item.product?.title}</td>
                                <td className="px-4 py-2 border">{item.quantity}</td>
                                <td className="px-4 py-2 border">{item.price}</td>
                                <td className="px-4 py-2 border">{item.weight} g</td>
                                <td className="px-4 py-2 border">${Number(item.price) * Number(item.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No product details found.</p>
                    )}
                  </div>
                )}

                {/* STEP 5 */}
                {step === 5 && (
                  <>
                    <div>
                      <h2>Category of item</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                      <label className="flex items-center gap-2">
                        <Input type="checkbox" {...register("category_commercial_sample")} />
                        Commercial Sample
                      </label>

                      <label className="flex items-center gap-2">
                        <Input type="checkbox" {...register("category_gift")} />
                        Gift
                      </label>

                      <label className="flex items-center gap-2">
                        <Input type="checkbox" {...register("category_returned_goods")} />
                        Returned Goods
                      </label>

                      <label className="flex items-center gap-2">
                        <Input type="checkbox" {...register("category_documents")} />
                        Documents
                      </label>

                      <label className="flex items-center gap-2">
                        <Input type="checkbox" {...register("category_other")} />
                        Other
                      </label>
                    </div>

                    {/* Explanation */}
                    <div className="grid grid-cols-1">
                      <div>
                        <Label>Explanation</Label>
                        <textarea
                          {...register("explanation")}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="grid grid-cols-1">
                      <div>
                        <Label>Comments</Label>
                        <textarea
                          {...register("comments")}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Office info */}
                    <div className="grid grid-cols-1">
                      <div>
                        <Label>Office of origin/Date of posting</Label>
                        <textarea
                          {...register("office_origin_posting")}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Licence / Certificate / Invoice */}
                    <div className="grid grid-cols-1 sm:grid-cols-3">
                      <label className="flex items-center gap-2">
                        <Input type="checkbox" {...register("doc_licence")} />
                        Licence
                      </label>

                      <label className="flex items-center gap-2">
                        <Input type="checkbox" {...register("doc_certificate")} />
                        Certificate
                      </label>

                      <label className="flex items-center gap-2">
                        <Input type="checkbox" {...register("doc_invoice")} />
                        Invoice
                      </label>
                    </div>
                  </>
                )}


                {/* Buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
                    >
                      Previous
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  )}
                </div>
              </form>
            </div>

          )
      }
    </>
  );
}
