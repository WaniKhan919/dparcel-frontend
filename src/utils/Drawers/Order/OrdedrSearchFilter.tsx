import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderStatus } from "../../../slices/orderStatusSlice";
import { fetchCountries } from "../../../slices/countriesSlice";
import { AppDispatch } from "../../../store";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";

interface RequestSearchFilterProps {
    onSearch: (filters: any) => void;
    onReset: () => void;
}

const OrdedrSearchFilter: React.FC<RequestSearchFilterProps> = ({ onSearch, onReset }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { orderStatus } = useSelector((state: any) => state.orderStatus);
    const { data: countries } = useSelector((state: any) => state.countries);

    const [filters, setFilters] = useState({
        requestNumber: "",
        status: "",
        date: "",
        shipFrom: "",
        shipTo: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        onSearch(filters);
    };

    const handleReset = () => {
        setFilters({
            requestNumber: "",
            status: "",
            date: "",
            shipFrom: "",
            shipTo: "",
        });
        onReset();
    };
    useEffect(() => {
        dispatch(fetchOrderStatus());
        dispatch(fetchCountries());
    }, [dispatch]);

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Request Number */}
                <div>
                    <Label>Request Number</Label>
                    <Input
                        type="text"
                        name="requestNumber"
                        placeholder="Enter request number"
                        value={filters.requestNumber}
                        onChange={handleChange}
                    />
                </div>

                {/* Status */}
                <div>
                    <Label>Status</Label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        {orderStatus?.map((status: any) => (
                            <option key={status.id} value={status.id}>
                                {status.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date */}
                <div>
                    <Label>Date</Label>
                    <Input
                        type="date"
                        name="date"
                        value={filters.date || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* Ship From */}
                <div>
                    <Label>Ship From</Label>
                    <select
                        name="shipFrom"
                        value={filters.shipFrom}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Country</option>
                        {countries?.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Ship To */}
                <div>
                    <Label>Ship To</Label>
                    <select
                        name="shipTo"
                        value={filters.shipTo}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Country</option>
                        {countries?.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition"
                >
                    Reset
                </button>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export default OrdedrSearchFilter;
