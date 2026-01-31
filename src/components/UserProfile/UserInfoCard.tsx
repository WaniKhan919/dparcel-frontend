import * as yup from "yup";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { ApiHelper } from "../../utils/ApiHelper";
import { fetchCountries } from "../../slices/countriesSlice";
import { fetchStates } from "../../slices/statesSlice";
import { fetchCities } from "../../slices/citiesSlice";

// ✅ Profile schema
const profileSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().required("Email is required"),
  phone: yup.string().required("Phone is required"),
  country_id: yup.number().required("Country is required"),
  state_id: yup.number().required("State is required"),
  city_id: yup.number().required("City is required"),
});

const passwordSchema = yup.object().shape({
  old_password: yup.string().required("Old password is required"),
  new_password: yup
    .string()
    .min(8, "New password must be at least 8 characters")
    .required("New password is required"),
  new_password_confirmation: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const dispatch = useDispatch<any>();

  const { data: countries, loading: countriesLoading } = useSelector((state: any) => state.countries);
  const { data: states, loading: statesLoading } = useSelector((state: any) => state.states);
  const { data: cities, loading: citiesLoading } = useSelector((state: any) => state.cities);

  // Form setup
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset,
    watch,
    setValue,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { isSubmitting: passwordSubmitting },
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const selectedCountryId = watch("country_id");
  const selectedStateId = watch("state_id");

  // ✅ Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const res = await ApiHelper("GET", "/user-profile");
      if (res.status === 200 && res.data?.data) {
        const user = res.data.data;

        // First, reset the basic info
        reset({
          name: user.name,
          email: user.email,
          phone: user.phone,
          country_id: user.country?.id || "",
          state_id: user.state?.id || "",
          city_id: 0, // temporarily empty
        });

        // Then, fetch dependent dropdowns in sequence
        if (user.country?.id) {
          await dispatch(fetchStates(user.country.id));
        }

        if (user.state?.id) {
          await dispatch(fetchCities(user.state.id));
        }

        // ✅ After both lists are loaded, now set the city value
        if (user.city?.id) {
          setValue("city_id", user.city.id);
        }
      }
    } catch (error) {
      toast.error("Failed to load profile data");
    }
  };


  useEffect(() => {
    fetchUserProfile();
    dispatch(fetchCountries());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCountryId) {
      dispatch(fetchStates(selectedCountryId));
      setValue("state_id", 0);
      setValue("city_id", 0);
    }
  }, [selectedCountryId, dispatch, setValue]);

  useEffect(() => {
    if (selectedStateId) {
      dispatch(fetchCities(selectedStateId));
      setValue("city_id", 0);
    }
  }, [selectedStateId, dispatch, setValue]);

  const onUpdateProfile = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city_id: data.city_id,
      };

      const res = await ApiHelper("PUT", "/update-profile", payload);
      if (res.status === 200) {
        toast.success(res.data.message || "Profile updated successfully");
      } else {
        toast.error(res.data.message || "Profile update failed ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Profile update failed!");
    }
  };

  const onUpdatePassword = async (data: any) => {
    try {
      const res = await ApiHelper("PUT", "/update-password", data);
      if (res.status === 200) {
        toast.success(res.data.message || "Password updated successfully");
      } else {
        toast.error(res.data.message || "Password update failed ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password update failed!");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Tabs */}
      <div className="w-full">
        <div className="p-6 border border-gray-200 rounded-2xl shadow-sm bg-white dark:bg-gray-900">
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "profile"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              Update Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "password"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200">
          {activeTab === "profile" ? (
            <form
              onSubmit={handleProfileSubmit(onUpdateProfile)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <Label>Name</Label>
                <Input placeholder="Enter your name" {...registerProfile("name")} />
                {profileErrors.name && <p className="text-red-500 text-sm">{profileErrors.name.message}</p>}
              </div>

              <div>
                <Label>Email</Label>
                <Input placeholder="Enter email" {...registerProfile("email")} />
                {profileErrors.email && <p className="text-red-500 text-sm">{profileErrors.email.message}</p>}
              </div>

              <div>
                <Label>Phone</Label>
                <Input placeholder="Enter phone" {...registerProfile("phone")} />
                {profileErrors.phone && <p className="text-red-500 text-sm">{profileErrors.phone.message}</p>}
              </div>

              <div>
                <Label>Country</Label>
                <select {...registerProfile("country_id")} className="w-full border rounded-lg px-3 py-2">
                  {countriesLoading ? (
                    <option>Loading countries...</option>
                  ) : (
                    <>
                      <option value="">Select country</option>
                      {countries?.map((c: any) => (
                        <option key={c.id} value={Number(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>


              {/* State Dropdown */}
              <div>
                <Label>State</Label>
                <select
                  value={selectedStateId || ""}
                  {...registerProfile("state_id")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setValue("state_id", Number(value));
                    setValue("city_id", 0);
                    if (value) dispatch(fetchCities(Number(value)));
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {statesLoading ? (
                    <option>Loading states...</option>
                  ) : (
                    <>
                      <option value="">Select state</option>
                      {states?.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              
              {/* City Dropdown */}
              <div>
                <Label>City</Label>
                <select
                  {...registerProfile("city_id", { valueAsNumber: true })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {citiesLoading ? (
                    <option>Loading cities...</option>
                  ) : (
                    <>
                      <option value="">Select city</option>
                      {cities?.map((city: any) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="col-span-full flex justify-end">
                <Button type="submit" disabled={profileSubmitting}>
                  {profileSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handlePasswordSubmit(onUpdatePassword)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <Label>Old Password</Label>
                <Input type="password" placeholder="Enter old password" {...registerPassword("old_password")} />
              </div>
              <div>
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" {...registerPassword("new_password")} />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  {...registerPassword("new_password_confirmation")}
                />
              </div>
              <div className="col-span-full flex justify-end">
                <Button type="submit" disabled={passwordSubmitting}>
                  {passwordSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
