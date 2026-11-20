/* src/components/Blog/BlogSection.js */
import React from 'react';
import './Blog.css';

const BlogSection = () => {
const blogs = [
    {
      id: 1,
      title: "How to Choose the Perfect Jewellery for Your Wedding",
      author: "By Admin",
      category: ["Jewellery"],
      img: "/assets/img/blog-img1.jpg", 
      date: "March 26, 2026"
    },
    {
      id: 2,
      title: "5 Must-Have Handbag Styles for Every Occasion",
      author: "By Admin",
      category: ["Bags"],
      img: "/assets/img/blog-img2.jpg",
      date: "March 24, 2026"
    },
    {
      id: 3,
      title: "The Ultimate Guide to Styling Statement Earrings",
      author: "By Admin",
      category: ["Accessories"],
      img: "/assets/img/blog-img3.jpg",
      date: "March 20, 2026"
    }
  ];

  return (
    <section className="blog-section">
      <div className="container-wrapper">
        {/* Left Aligned Header with Navy and Gold Theme */}
        <div className="blog-header-left">
          <h2 className="blog-main-title">OUR BLOG</h2>
          <div className="title-underline"></div>
        </div>

        <div className="blog-grid">
          {blogs.map((blog) => (
            <div key={blog.id} className="blog-card">
              <div className="blog-img-container">
                <img src={blog.img} alt={blog.title} />
                {/* Navy & Gold Badge */}
                <div className="blog-badges">
                  {blog.category.map((cat, index) => (
                    <span key={index} className="blog-badge">{cat}</span>
                  ))}
                </div>
              </div>
              
              <div className="blog-content">
                <h3 className="blog-title">{blog.title}</h3>
                <div className="blog-meta">
                   <span className="blog-author">{blog.author}</span>
                   <span className="blog-date">{blog.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;