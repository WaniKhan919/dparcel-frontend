import { useState } from "react";



export default function DashboardPermissions() {

    const [selectAll, setSelectAll] = useState(false);
    const [permissions, setPermissions] = useState<Record<string, boolean>>({
        licensee: false,
        user: false,
    });

    // Toggle select all
    const handleSelectAll = () => {
        const newValue = !selectAll;
        setSelectAll(newValue);
        setPermissions({
            licensee: newValue,
            user: newValue,
        });
    };

    // Toggle individual
    const handleToggle = (key: string) => {
        const updated = { ...permissions, [key]: !permissions[key] };
        setPermissions(updated);

        // If all are selected, turn on "Select All"
        const allSelected = Object.values(updated).every((v) => v === true);
        setSelectAll(allSelected);
    };

    return (
        <div className="p-4 space-y-3">
            {/* Header Row */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Dashboard</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-base">Select All</span>
                    <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 relative transition">
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-5"></div>
                    </div>
                </label>
            </div>

            {/* Permission Toggles */}
            <div className="border border-orange-400 rounded-md p-4 flex gap-6">
                {/* Licensee Dashboard */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={permissions.licensee}
                        onChange={() => handleToggle("licensee")}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full relative transition peer-checked:bg-blue-600">
                        {/* knob */}
                        <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-base">Licensee Dashboard</span>
                </label>

                {/* User Dashboard */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={permissions.user}
                        onChange={() => handleToggle("user")}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full relative transition peer-checked:bg-blue-600">
                        {/* knob */}
                        <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-base">User Dashboard</span>
                </label>
            </div>

        </div>
    );
}
