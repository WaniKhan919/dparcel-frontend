import { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { ApiHelper } from "../../utils/ApiHelper";
import { useNavigate, useLocation } from "react-router";
import { toast } from "react-hot-toast";
import Input from "../../components/form/input/InputField";
import TextEditor from "../../components/form/input/TextEditor";

interface BlogFormValues {
  id?: string;
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  author_name?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  robots?: string;
  category_id?: string;
  tags?: string;
  published_at?: string;
}

export default function EditBlogs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Get blog data if editing
  const blog = location.state?.blog;

  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<BlogFormValues>({
    defaultValues: blog || {
      title: "",
      content: "",
      slug: "",
      excerpt: "",
      author_name: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      canonical_url: "",
      robots: "index, follow",
      category_id: "",
      tags: "",
      published_at: "",
    },
  });

  // Prefill form if editing
  useEffect(() => {
    if (blog) {
      reset(blog);
    } else if (location.pathname.includes("edit")) {
      toast.error("No blog data found");
      navigate("/blogs");
    }
  }, [blog, reset, navigate, location]);

  const onSubmit: SubmitHandler<BlogFormValues> = async (data) => {
    // Custom validation for required fields
    if (!data.title.trim()) {
      setError("title", { type: "manual", message: "Title is required" });
      return;
    }
    if (!data.content.trim()) {
      setError("content", { type: "manual", message: "Content is required" });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      let res;
      if (blog?.id) {
        // Edit mode
        res = await ApiHelper("PUT", `/admin/blogs/${blog.id}`, formData);
      } else {
        // Create mode
        res = await ApiHelper("POST", "/admin/blogs", formData);
      }

      if (res.status === 200) {
        toast.success(res.data.message || "Blog saved successfully!", { duration: 3000, position: "top-right" });
        navigate("/blogs");
      } else {
        toast.error(res.data.message || "Failed to save blog ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save blog!", { duration: 3000, position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Admin | Edit Blog" description="Edit blog" />
      <PageBreadcrumb pageTitle={blog?.id ? "Edit Blog" : "Create Blog"} />

      <div className="space-y-6">
        <ComponentCard title={blog?.id ? "Edit Blog" : "Create Blog"}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Title *"
                placeholder="Enter blog title"
                {...register("title")}
                error={!!errors.title}
                hint={errors.title?.message}
              />
              <Input
                label="Slug"
                placeholder="Enter slug (optional)"
                {...register("slug")}
                error={!!errors.slug}
                hint={errors.slug?.message}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white/90">Content *</label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => <TextEditor value={field.value} onChange={field.onChange} />}
              />
              {errors.content && <p className="text-error-500 text-xs mt-1">{errors.content.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Excerpt" placeholder="Short summary" {...register("excerpt")} error={!!errors.excerpt} hint={errors.excerpt?.message} />
              <Input label="Author Name" placeholder="Author" {...register("author_name")} error={!!errors.author_name} hint={errors.author_name?.message} />
              <Input label="Meta Title" placeholder="SEO Meta Title" {...register("meta_title")} error={!!errors.meta_title} hint={errors.meta_title?.message} />
              <Input label="Meta Description" placeholder="SEO Meta Description" {...register("meta_description")} error={!!errors.meta_description} hint={errors.meta_description?.message} />
              <Input label="Meta Keywords" placeholder="Comma-separated keywords" {...register("meta_keywords")} error={!!errors.meta_keywords} hint={errors.meta_keywords?.message} />
              <Input label="Canonical URL" placeholder="https://example.com/blog-url" {...register("canonical_url")} error={!!errors.canonical_url} hint={errors.canonical_url?.message} />
              <Input label="Robots" placeholder="index, follow" {...register("robots")} error={!!errors.robots} hint={errors.robots?.message} />
              <Input label="Category ID" placeholder="Select category" {...register("category_id")} error={!!errors.category_id} hint={errors.category_id?.message} />
              <Input label="Tags" placeholder="Comma-separated tags" {...register("tags")} error={!!errors.tags} hint={errors.tags?.message} />
              <Input type="date" label="Published At" {...register("published_at")} error={!!errors.published_at} hint={errors.published_at?.message} />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Blog"}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
