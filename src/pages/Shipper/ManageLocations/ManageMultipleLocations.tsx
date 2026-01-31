import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import MultiSelect from "../../../components/form/MultiSelect";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import toast from "react-hot-toast";
import { ApiHelper } from "../../../utils/ApiHelper";
import { fetchCountries } from "../../../slices/countriesSlice";

type Subscription = {
  level?: {
    title?: string;
    max_locations?: number;
  };
};

export default function ManageMultipleLocations() {
  const dispatch = useDispatch<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [availableCities, setAvailableCities] = useState<any[]>([]);
  const [shipperSubscripition, setShipperSubscripition] = useState<Subscription | null>(null);;
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [maxLocation, setMaxLocation] = useState<number>(0);
  const [selectedCountryId, setSelectedCountryId] = useState<number>(0);
  const { data: countries } = useSelector((state: any) => state.countries);
  
  const fetchLevelsAndSubscriptions = async () => {
    try {
        const res = await ApiHelper("GET", "/shipper/subscription");
        if (res.status === 200) {
          setShipperSubscripition(res.data.data)
          if(res.data.data){
            const maxLocation = res.data.data.level.max_locations
            setMaxLocation(Number(maxLocation))
          }
        }else{
          setShipperSubscripition(null)
        }
      } catch (err: any) {
        setShipperSubscripition(null)
    }
  };

  // Fetch countries on mount
  useEffect(() => {
    fetchLevelsAndSubscriptions();
    dispatch(fetchCountries());
  }, [dispatch]);

  // Fetch all cities when country changes
  useEffect(() => {
    if (!selectedCountryId) {
      setAvailableCities([]);
      setSelectedCities([]);
      return;
    }

    const fetchCitiesByCountry = async () => {
      setLoadingCities(true);
      try {
        // API call to get all cities of selected country
        const response = await ApiHelper("GET", `/cities/country/${selectedCountryId}`);
        
        if (response.status === 200 && response.data.data) {
          setAvailableCities(response.data.data);
          setSelectedCities([]);
        } else {
          toast.error("Failed to load cities", {
            duration: 3000,
            position: "top-right",
          });
          setAvailableCities([]);
        }
      } catch (error: any) {
        console.error("Error fetching cities:", error);
        toast.error(error.response?.data?.message || "Failed to load cities", {
          duration: 3000,
          position: "top-right",
        });
        setAvailableCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCitiesByCountry();
  }, [selectedCountryId]);

  const handleSave = async () => {
    if (selectedCities.length === 0) {
      toast.error("Please select at least one city", {
        duration: 3000,
        position: "top-right",
        icon: "⚠️",
      });
      return;
    }

    if (selectedCities.length > maxLocation) {
      toast.error(`You can select maximum ${maxLocation} cities`, {
        duration: 3000,
        position: "top-right",
        icon: "⚠️",
      });
      return;
    }

    const payload = {
      city_ids: selectedCities.map(Number),
    };

    setLoading(true);

    try {
      const res = await ApiHelper("POST", "/shipper/service-area/store", payload);
      if (res.status === 200) {
        toast.success("Service areas saved successfully", {
          duration: 3000,
          position: "top-right",
          icon: "✅",
        });
      } else {
        toast.error(res.data.message || "Something went wrong", {
          duration: 3000,
          position: "top-right",
          icon: "⚠️",
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "API request failed", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
        },
        icon: "⚠️",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Delivering Parcel | Service Areas" description="" />
      <PageBreadcrumb pageTitle="Service Areas" />

      <div className="space-y-6">
        <ComponentCard title="Service Areas">

          {/* Subscription Info */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-6">
            <div>
              <p className="text-sm text-gray-500">Your Subscription</p>
              <p className="text-lg font-semibold text-gray-800">
                {shipperSubscripition?.level?.title} ({shipperSubscripition?.level?.max_locations} Locations)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Selected</p>
              <p className="text-lg font-semibold text-blue-600">
                {selectedCities.length} / {shipperSubscripition?.level?.max_locations}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Country (Single Select) */}
            <div>
              <Label>Select Country</Label>
              <Select
                className="dark:bg-dark-900"
                placeholder="Select Country"
                options={countries.map((c: any) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
                defaultValue={selectedCountryId ? String(selectedCountryId) : ""}
                onChange={(value) => {
                  setSelectedCountryId(Number(value));
                }}
              />
            </div>

            {/* Cities (Multi Select) */}
            {selectedCountryId > 0 && (
              <div>
                {loadingCities ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading cities...</span>
                  </div>
                ) : availableCities.length > 0 ? (
                  <MultiSelect
                    key={`cities-${selectedCountryId}`}
                    label="Select Cities (Max 10)"
                    options={availableCities.map((c: any) => ({
                      value: String(c.id),
                      text: c.name,
                    }))}
                    defaultSelected={selectedCities}
                    onChange={setSelectedCities}
                  />
                ) : (
                  <div className="py-4">
                    <Label>Select Cities</Label>
                    <p className="text-sm text-gray-500 mt-2">No cities available for selected country</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Cities Preview */}
          {selectedCities.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Selected Cities ({selectedCities.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCities.map((cityId) => {
                  const city = availableCities.find((c) => String(c.id) === cityId);
                  return city ? (
                    <span
                      key={cityId}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {city.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={loading || selectedCities.length === 0}
              className={`px-6 py-2 rounded-lg text-white ${
                loading || selectedCities.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

        </ComponentCard>
      </div>
    </>
  );
}