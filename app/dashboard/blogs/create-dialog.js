"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "quill/dist/quill.snow.css";

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const CreateDialog = ({ open, setOpen, onSuccess }) => {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "link",
    "image",
  ];

  async function handleCreate(e) {
    e?.preventDefault();
    if (!title.trim()) {
      alert("Tiêu đề không được để trống");
      return;
    }
    if (!content.trim() || content === "<p><br></p>") {
      alert("Nội dung không được để trống");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: category.trim() || null,
          excerpt: excerpt.trim() || null,
          tags: tagsArray,
          published,
          coverImage: {
            url: coverImageUrl.trim() || null,
            alt: coverImageAlt.trim() || null,
          },
          meta: {
            title: metaTitle.trim() || null,
            description: metaDescription.trim() || null,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess?.(data.data);
        resetForm();
        setOpen(false);
      } else {
        console.error(data);
        alert(data?.message || "Tạo bài viết thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo bài viết");
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("");
    setExcerpt("");
    setTags("");
    setPublished(false);
    setCoverImageUrl("");
    setCoverImageAlt("");
    setMetaTitle("");
    setMetaDescription("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo bài viết mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Basic Info */}
          <div>
            <Label>Tiêu đề *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Chuyên mục</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="vd: Công nghệ, Kinh doanh"
              />
            </div>

            <div>
              <Label>Tags (cách nhau bằng dấu phẩy)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div>
            <Label>Trích đoạn</Label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Mô tả ngắn gọn bài viết"
              className="w-full rounded-md border px-3 py-2 min-h-[80px]"
            />
          </div>

          {/* Content Editor */}
          <div>
            <Label>Nội dung *</Label>
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-2">
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  placeholder="Nhập nội dung bài viết..."
                  className="bg-white"
                  style={{ minHeight: "300px" }}
                />
              </TabsContent>

              <TabsContent
                value="preview"
                className="border rounded-md p-4 bg-white min-h-[300px]"
              >
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Cover Image */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm">Ảnh bìa</h3>
            <div>
              <Label>URL ảnh</Label>
              <Input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>Alt text</Label>
              <Input
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder="Mô tả ảnh (cho SEO)"
              />
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm">SEO Meta</h3>
            <div>
              <Label>Meta Title</Label>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Tiêu đề cho công cụ tìm kiếm"
              />
            </div>
            <div>
              <Label>Meta Description</Label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Mô tả cho công cụ tìm kiếm"
                className="w-full rounded-md border px-3 py-2 min-h-[60px]"
              />
            </div>
          </div>

          {/* Publish */}
          <div className="flex items-center gap-3 border-t pt-4">
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="published" className="mb-0 cursor-pointer">
              Công khai (Đã đăng)
            </Label>
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                type="button"
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Đang tạo..." : "Tạo bài viết"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDialog;
