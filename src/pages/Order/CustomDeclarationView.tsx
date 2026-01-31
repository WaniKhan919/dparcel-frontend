import React from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

interface Props {
  data: any;
  orderDetails: any;
  onEdit: () => void;
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-gray-200 pb-1">
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
      {children}
    </div>
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <p>
    <span className="font-medium text-gray-800">{label}:</span>{" "}
    <span className="text-gray-600">{value ?? "-"}</span>
  </p>
);

const CustomDeclarationView: React.FC<Props> = ({
  data,
  orderDetails,
  onEdit,
}) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading declaration details...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-2xl border border-gray-200">
      {/* Header with title and edit icon */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Custom Declaration Summary
        </h2>

        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 transition"
          title="Edit Declaration"
        >
          <PencilSquareIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Step 1 — From / To Details */}
      <Section title="Step 1: Sender & Receiver Details">
        {/* FROM */}
        <InfoItem label="From Name" value={data.from_name} />
        <InfoItem label="From Business" value={data.from_business} />
        <InfoItem label="From Street" value={data.from_street} />
        <InfoItem label="From Postcode" value={data.from_postcode} />
        <InfoItem label="From Country" value={data.from_country?.name} />
        <InfoItem label="From State" value={data.from_state?.name} />
        <InfoItem label="From City" value={data.from_city?.name} />


        {/* TO */}
        <InfoItem label="To Name" value={data.to_name} />
        <InfoItem label="To Business" value={data.to_business} />
        <InfoItem label="To Street" value={data.to_street} />
        <InfoItem label="To Postcode" value={data.to_postcode} />
        <InfoItem label="To Country" value={data.to_country?.name} />
        <InfoItem label="To State" value={data.to_state?.name} />
        <InfoItem label="To City" value={data.to_city?.name} />
      </Section>

      {/* Step 2 — Categories */}
      <Section title="Step 2: Shipment Categories">
        <InfoItem
          label="Commercial Sample"
          value={data.category_commercial_sample ? "Yes" : "No"}
        />
        <InfoItem label="Gift" value={data.category_gift ? "Yes" : "No"} />
        <InfoItem
          label="Returned Goods"
          value={data.category_returned_goods ? "Yes" : "No"}
        />
        <InfoItem
          label="Documents"
          value={data.category_documents ? "Yes" : "No"}
        />
        <InfoItem label="Other" value={data.category_other ? "Yes" : "No"} />
      </Section>

      {/* Step 3 — Importer & Office Info */}
      <Section title="Step 3: Importer & Office Info">
        <InfoItem label="Importer Reference" value={data.importer_reference} />
        <InfoItem label="Importer Contact" value={data.importer_contact} />
        <InfoItem label="Explanation" value={data.explanation} />
        <InfoItem label="Comments" value={data.comments} />
        <InfoItem
          label="Office Origin Posting"
          value={data.office_origin_posting}
        />
      </Section>

      {/* Step 4 — Documents */}
      <Section title="Step 4: Documents">
        <InfoItem label="Licence" value={data.doc_licence ? "Yes" : "No"} />
        <InfoItem
          label="Certificate"
          value={data.doc_certificate ? "Yes" : "No"}
        />
        <InfoItem label="Invoice" value={data.doc_invoice ? "Yes" : "No"} />
      </Section>

      {/* Step 5 — Products Info */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-gray-200 pb-1">
          Step 5: Products Info
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-gray-700 text-sm">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Product Title</th>
                <th className="border px-4 py-2 text-left">Quantity</th>
                <th className="border px-4 py-2 text-left">Weight</th>
                <th className="border px-4 py-2 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails && orderDetails.length > 0 ? (
                orderDetails.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">
                      {item.product?.title || "-"}
                    </td>
                    <td className="border px-4 py-2">{item.quantity}</td>
                    <td className="border px-4 py-2">{item.weight}</td>
                    <td className="border px-4 py-2">{item.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500 py-4 border"
                  >
                    No product information available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 6 — Declaration Info */}
      <Section title="Step 6: Declaration Info">
        <InfoItem
          label="Total Declared Value"
          value={`${data.total_declared_value} ${data.currency ?? "USD"}`}
        />
        <InfoItem
          label="Total Weight"
          value={`${data.total_weight ?? "-"} ${data.unit_of_weight ?? "kg"}`}
        />
        <InfoItem
          label="Contains Prohibited Items"
          value={data.contains_prohibited_items ? "Yes" : "No"}
        />
        <InfoItem
          label="Contains Liquids"
          value={data.contains_liquids ? "Yes" : "No"}
        />
        <InfoItem
          label="Contains Batteries"
          value={data.contains_batteries ? "Yes" : "No"}
        />
        <InfoItem label="Is Fragile" value={data.is_fragile ? "Yes" : "No"} />
        <InfoItem
          label="Declaration Status"
          value={data.status ?? "Pending"}
        />
        <InfoItem
          label="Submitted At"
          value={data.submitted_at ?? "-"}
        />
      </Section>
    </div>
  );
};

export default CustomDeclarationView;
