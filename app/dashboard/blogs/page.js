"use client";
import { useEffect, useState } from "react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    async function fetchBlogs() {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBlogs(data);
    }
    fetchBlogs();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Bài viết</h1>
      {blogs.map((b) => (
        <div key={b.id} className="p-3 border rounded-lg mb-2 bg-white">
          <h2 className="font-semibold">{b.title}</h2>
          <p>{b.category}</p>
        </div>
      ))}
    </div>
  );
}
