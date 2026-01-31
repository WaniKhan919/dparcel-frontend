import { useLocation } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { ApiHelper } from "../../utils/ApiHelper";
import { UserIcon, CubeIcon, DocumentIcon } from "@heroicons/react/24/outline";

export default function ShopperCustomDeclaration() {
  const location = useLocation();
  const { order_id } = location.state || {};
  const [customDeclaration, setCustomDeclaration] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomDeclaration = async () => {
    if (!order_id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await ApiHelper("GET", `/order/get-order-detail/${order_id}`);
      if (response.status === 200 && response.data?.data) {
        const orderData = response.data.data;
        setTrackingNumber(orderData.tracking_number);
        setCustomDeclaration(orderData.custom_declaration);
      } else {
        setError(response.data?.message || "Failed to fetch custom declarations");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomDeclaration();
  }, []);

  const renderBadge = (value: number | null) => (
    <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
      value ? "bg-green-500" : "bg-gray-400"
    }`}>
      {value ? "Yes" : "No"}
    </span>
  );

  return (
    <>
      <PageMeta title="Delivering Parcel | Custom Declaration" description="" />
      <PageBreadcrumb pageTitle="Custom Declaration" />
      <div className="space-y-6">

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {customDeclaration && (
          <div className="space-y-6">

            {/* Tracking Number */}
            <div className="text-center p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xl rounded-lg shadow-md">
              Tracking Number: {trackingNumber}
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Left Column - Sender & Recipient */}
              <div className="space-y-4">
                <div className="p-4 bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition duration-200">
                  <div className="flex items-center gap-2 mb-2 text-yellow-600 font-semibold">
                    <UserIcon className="h-5 w-5" /> Sender Details
                  </div>
                  <p><strong>Name:</strong> {customDeclaration.from_name}</p>
                  <p><strong>Business:</strong> {customDeclaration.from_business}</p>
                  <p><strong>Street:</strong> {customDeclaration.from_street}</p>
                  <p><strong>Postcode:</strong> {customDeclaration.from_postcode}</p>
                  <p><strong>Country:</strong> {customDeclaration.from_country.name}</p>
                  <p><strong>State:</strong> {customDeclaration.from_state.name}</p>
                  <p><strong>City:</strong> {customDeclaration.from_city.name}</p>
                </div>

                <div className="p-4 bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition duration-200">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold">
                    <UserIcon className="h-5 w-5" /> Recipient Details
                  </div>
                  <p><strong>Name:</strong> {customDeclaration.to_name}</p>
                  <p><strong>Business:</strong> {customDeclaration.to_business}</p>
                  <p><strong>Street:</strong> {customDeclaration.to_street}</p>
                  <p><strong>Postcode:</strong> {customDeclaration.to_postcode}</p>
                  <p><strong>Country:</strong> {customDeclaration.to_country.name}</p>
                  <p><strong>State:</strong> {customDeclaration.to_state.name}</p>
                  <p><strong>City:</strong> {customDeclaration.to_city.name}</p>
                </div>
              </div>

              {/* Right Column - Categories, Documents, Declaration Info */}
              <div className="space-y-4">
                <div className="p-4 bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition duration-200">
                  <div className="flex items-center gap-2 mb-2 text-purple-600 font-semibold">
                    <CubeIcon className="h-5 w-5" /> Categories
                  </div>
                  <div className="flex flex-col gap-1">
                    <p>Commercial Sample: {renderBadge(customDeclaration.category_commercial_sample)}</p>
                    <p>Gift: {renderBadge(customDeclaration.category_gift)}</p>
                    <p>Returned Goods: {renderBadge(customDeclaration.category_returned_goods)}</p>
                    <p>Documents: {renderBadge(customDeclaration.category_documents)}</p>
                    <p>Other: {renderBadge(customDeclaration.category_other)}</p>
                  </div>
                </div>

                <div className="p-4 bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition duration-200">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold">
                    <DocumentIcon className="h-5 w-5" /> Documents
                  </div>
                  <div className="flex flex-col gap-1">
                    <p>Licence: {renderBadge(customDeclaration.doc_licence)}</p>
                    <p>Certificate: {renderBadge(customDeclaration.doc_certificate)}</p>
                    <p>Invoice: {renderBadge(customDeclaration.doc_invoice)}</p>
                  </div>
                </div>

                <div className="p-4 bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition duration-200">
                  <div className="flex items-center gap-2 mb-2 text-red-600 font-semibold">
                    <DocumentIcon className="h-5 w-5" /> Declaration Info
                  </div>
                  <p>Status: <span className="font-semibold">{customDeclaration.status}</span></p>
                  <p>Total Declared Value: <span className="font-semibold">{customDeclaration.total_declared_value}</span></p>
                  <p>Total Weight: <span className="font-semibold">{customDeclaration.total_weight || "N/A"}</span></p>
                  <p>Prohibited Items: {renderBadge(customDeclaration.contains_prohibited_items)}</p>
                  <p>Liquids: {renderBadge(customDeclaration.contains_liquids)}</p>
                  <p>Batteries: {renderBadge(customDeclaration.contains_batteries)}</p>
                  <p>Fragile: {renderBadge(customDeclaration.is_fragile)}</p>
                  <p>Submitted At: {customDeclaration.submitted_at}</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
