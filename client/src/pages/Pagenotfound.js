import React from 'react';
import { Link } from "react-router-dom";
import Layout from '../components/Layout/Layout';

const Pagenotfound = () => {
  return (
    <Layout title={"Go Back - Page Not Found"}>
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          height: "100vh",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          color: "#6c757d",
        }}
      >
        <h1
          style={{
            fontSize: "8rem",
            fontWeight: "bold",
            color: "#343a40",
            marginBottom: "1rem",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
            fontWeight: "400",
          }}
        >
          Oops! The page you are looking for does not exist.
        </h2>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          It might have been removed or you might have mistyped the URL.
        </p>
        <Link
          to="/"
          className="btn btn-primary"
          style={{
            padding: "0.8rem 2rem",
            fontSize: "1.2rem",
            borderRadius: "30px",
            textDecoration: "none",
          }}
        >
          Go Back to Homepage
        </Link>
      </div>
    </Layout>
  );
};

export default Pagenotfound;
