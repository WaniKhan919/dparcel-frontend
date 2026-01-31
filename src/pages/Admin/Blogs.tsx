import { useDispatch, useSelector } from "react-redux";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { fetchBlogs } from "../../slices/admin/getBlogsSlice";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import { useEffect, useState } from "react";
import { AppDispatch } from "../../store";
import { useNavigate } from "react-router";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { EnvelopeIcon, EyeIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../components/ui/modal";
import { DeleteConfirmModal } from "../../components/delete/ConfirmDeleteModal";
import { ApiHelper } from "../../utils/ApiHelper";
import { toast } from "react-hot-toast";

export default function Blogs() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: any) => state.blogs);

  const [viewBlog, setViewBlog] = useState<any>(null); // For viewing modal
  const [deleteBlog, setDeleteBlog] = useState<any>(null); // For delete modal

  // Fetch blogs
  useEffect(() => {
    dispatch(fetchBlogs({ page: 1, per_page: 10 }));
  }, [dispatch]);

  // Delete function
  const handleDelete = async (id: string) => {
    try {
      const res = await ApiHelper("DELETE", `/admin/blogs/${id}`);
      if (res.status === 200) {
        toast.success("Blog deleted successfully!");
        dispatch(fetchBlogs({ page: 1, per_page: 10 }));
      } else {
        toast.error("Failed to delete blog ❌");
      }
    } catch (err) {
      toast.error("Something went wrong ❌");
      console.error(err);
    }
  };

  const handleSendBroadcast = async (id: string) => {
    try {
      const res = await ApiHelper("GET", `/admin/blogs/broadcast-email/${id}`);
      if (res.status === 200) {
        toast.success("Blog broadcast email sent successfully");
      } else {
        toast.error("Failed to send broadcast email");
      }
    } catch (err) {
      toast.error("Failed to send broadcast email");
    }
  };


  const columns = [
    { key: "title", header: "Title" },
    { key: "slug", header: "Slug" },
    { key: "author_name", header: "Author" },
    {
      key: "published_at",
      header: "Published At",
      render: (record: any) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {record.published_at ? new Date(record.published_at).toLocaleDateString() : "-"}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created At",
      render: (record: any) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {record.created_at ? new Date(record.created_at).toLocaleDateString() : "-"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (record: any) => (
        <div className="flex gap-2">
          {/* View */}
          <button
            onClick={() => setViewBlog(record)}
            className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="View"
          >
            <EyeIcon className="h-5 w-5 text-gray-800 stroke-2" />
          </button>

          {/* Edit */}
          <button
            onClick={() =>
              navigate("/blogs/edit", { state: { blog: record } })
            }
            className="p-2 rounded bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
            title="Edit"
          >
            <PencilIcon />
          </button>

          {/* Delete */}
          <button
            onClick={() => setDeleteBlog(record)}
            className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete"
          >
            <TrashBinIcon />
          </button>

          <button
            onClick={() => handleSendBroadcast(record.id)}
            className="p-2 rounded bg-green-100 hover:bg-green-200"
            title="Send as Broadcast Email"
          >
            <EnvelopeIcon className="h-5 w-5 text-green-700" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Admin | Blogs" description="Manage Blogs" />
      <PageBreadcrumb pageTitle="Blogs" />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/blogs/create")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + Add Blog
        </button>
      </div>

      <ComponentCard title="Blogs">
        <DParcelTable columns={columns} data={data} />
      </ComponentCard>

      {/* View Modal */}
      <Modal
        isOpen={!!viewBlog}
        onClose={() => setViewBlog(null)}
        className="
          w-full 
          max-w-full 
          sm:max-w-2xl 
          md:max-w-3xl 
          lg:max-w-4xl 
          xl:max-w-5xl 
          p-4 sm:p-6 md:p-8
        "
      >
        {viewBlog && (
          <div className="space-y-5 max-h-[85vh] overflow-y-auto">

            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              {viewBlog.title}
            </h2>

            {/* Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-500">
              <p><strong>Slug:</strong> {viewBlog.slug}</p>
              <p><strong>Author:</strong> {viewBlog.author_name}</p>
              <p><strong>Published:</strong> {new Date(viewBlog.published_at).toLocaleDateString()}</p>
              <p><strong>Excerpt:</strong> {viewBlog.excerpt}</p>
            </div>

            {/* Tags */}
            {viewBlog.tags && (
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-gray-700 mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {viewBlog.tags.split(",").map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-[10px] sm:text-xs bg-blue-100 text-blue-700 rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Info */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-1 text-xs sm:text-sm">
              <h4 className="font-semibold text-gray-700 mb-1">
                SEO Details
              </h4>
              <p><strong>Meta Title:</strong> {viewBlog.meta_title}</p>
              <p><strong>Meta Description:</strong> {viewBlog.meta_description}</p>
              <p><strong>Meta Keywords:</strong> {viewBlog.meta_keywords}</p>
              <p className="break-all">
                <strong>Canonical URL:</strong> {viewBlog.canonical_url}
              </p>
              <p><strong>Robots:</strong> {viewBlog.robots}</p>
            </div>

            {/* Content */}
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-gray-700 mb-2">
                Content
              </h4>

              <div
                className="
            prose 
            prose-sm 
            sm:prose 
            max-w-none
          "
                dangerouslySetInnerHTML={{ __html: viewBlog.content }}
              />
            </div>

          </div>
        )}
      </Modal>


      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteBlog}
        onClose={() => setDeleteBlog(null)}
        onConfirm={async () => {
          if (deleteBlog) {
            await handleDelete(deleteBlog.id);
            setDeleteBlog(null);
          }
        }}
        itemName={deleteBlog?.title}
      />
    </>
  );
}
