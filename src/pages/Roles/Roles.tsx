import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import DParcelTable from "../../components/tables/DParcelTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { useEffect } from "react";
import { fetchRoles } from "../../slices/roleSlice";
import PageMeta from "../../components/common/PageMeta";

interface Order {
    id: number;
    name: string;
    status: string;
    created_at: string;
}

export default function Roles() {
    const dispatch = useDispatch<AppDispatch>();
    const { roles } = useSelector((state: any) => state.roles);
    

    useEffect(() => {
        dispatch(fetchRoles());
    }, [dispatch]);

    const columns = [
        {
            key: "name",
            header: "Role Name",
        },
        {
            key: "status",
            header: "Status",
            render: (row: Order) => (
                <Badge
                    size="sm"
                    color={
                        row.status === "Active"
                            ? "success"
                            : row.status === "Inactive"
                                ? "warning"
                                : "error"
                    }
                >
                    {row.status}
                </Badge>
            ),
        },
        { key: "created_at", header: "Created At" },
    ]
    return (
        <>
            <PageMeta
                title="Delevering Parcel | Roles"
                description=""
            />
            <PageBreadcrumb pageTitle="Roles" />
            <div className="space-y-6">
                <ComponentCard title="Roles">
                    <DParcelTable
                        columns={columns} 
                        data={roles} 
                    />
                </ComponentCard>
            </div>
        </>
    );
}
