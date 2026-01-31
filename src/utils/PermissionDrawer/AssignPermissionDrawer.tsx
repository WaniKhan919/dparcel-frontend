import * as yup from "yup";
import { toast } from "react-hot-toast";
import { AppDispatch } from "../../store";
import { useForm } from "react-hook-form";
import { ApiHelper } from "../../utils/ApiHelper";
import { fetchRoles } from "../../slices/roleSlice";
import { useEffect, useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { fetchPermission } from "../../slices/permissionSlice";

// Yup schema
const schema = yup.object().shape({
  roleId: yup.number().nullable().required("Role is required"),
  permissions: yup
    .array()
    .of(yup.number())
    .min(1, "At least one permission must be selected"),
});

interface AssignPermissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignPermissionDrawer({
  isOpen,
  onClose,
}: AssignPermissionDrawerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { roles} = useSelector((state: any) => state.roles);
  const { permissions, permissionsLoading } = useSelector(
    (state: any) => state.permissions
  );

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermission());
  }, [dispatch]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      roleId: undefined,
      permissions: [],
    },
  });
  const selectedRole = watch("roleId");
  const selectedPermissions = watch("permissions") || [];

  const mappedRoles = useMemo(() => {
    if (!roles) return [];
    return roles.map((record: any) => ({
      id: record.id,
      name: record.name,
    }));
  }, [roles]);

  const mappedPermissions = useMemo(() => {
    if (!permissions) return [];
    return permissions.map((record: any) => ({
      id: record.id,
      name: record.name,
      code: record.code,
    }));
  }, [permissions]);

  // const [selectedRole, setSelectedRole] = useState<number | null>(null);
  // const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;


  const handleSelectAll = () => {
    if (selectAll) {
      setValue("permissions", [], { shouldValidate: true });
    } else {
      setValue("permissions", permissions.map((p: any) => p.id), { shouldValidate: true });
    }
    setSelectAll(!selectAll);
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await ApiHelper("POST", `/roles/${data.roleId}/permissions`, {
        permissions: data.permissions,
      });
      if (res.status === 200) {
        toast.success("Permissions assigned!");
        // onClose();
      } else {
        toast.error(res.data.message || "Failed to assign permissions ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

   const fetchRolePermissions = async (roleId:any) => {
    try {
      const res = await ApiHelper("GET", `/roles/${roleId}/permissions`);
      if (res.status === 200) {
        setValue("permissions", res.data.permissions);
        setSelectAll(res.data.permissions.length === mappedPermissions.length);
      }
    } catch (err: any) {
      toast.error("Failed to fetch role permissions");
    }
  };
  const handleRoleChange = async (roleId: number) => {
    setValue("roleId", roleId);
    fetchRolePermissions(roleId)
  };

  return (
    <div className="fixed inset-0 z-[100] mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Assign Permissions</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-5 space-y-6 h-[calc(100%-60px)] flex flex-col">
            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Role <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedRole ?? ""}
                onChange={(e) => handleRoleChange(Number(e.target.value))}
              >
                <option value="" disabled>
                  Choose a role
                </option>
                {mappedRoles.map((role: any) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && <p className="text-red-500 text-sm">{errors.roleId.message}</p>}
            </div>

            {/* Select All Button */}
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800">Permissions</h3>
              <button
                onClick={handleSelectAll}
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
              >
                {selectAll ? "Unselect All" : "Select All"}
              </button>
            </div>

            {/* Permissions Grid */}
            <div className="flex-1 overflow-y-auto border rounded-lg p-3">
              {errors.permissions && <p className="text-red-500 text-sm mb-2">{errors.permissions.message}</p>}
              {permissionsLoading ? (
                <p className="text-sm text-gray-500">Loading permissions...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mappedPermissions.map((permission: any) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-2 text-sm text-gray-700 border rounded-md px-2 py-1 hover:bg-gray-50 cursor-pointer"
                    >
                     <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => {
                          let updated = [...selectedPermissions];
                          if (updated.includes(permission.id)) {
                            updated = updated.filter((p) => p !== permission.id);
                          } else {
                            updated.push(permission.id);
                          }
                          setValue("permissions", updated, { shouldValidate: true });
                        }}
                      />
                      {permission.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundImage: "linear-gradient(180deg, #003bff 25%, #0061ff 100%)",
                }}
                className="px-5 py-2 rounded-md text-white hover:bg-green-700"
              >
                {loading ? "Assigning..." : "Assign Permissions"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
