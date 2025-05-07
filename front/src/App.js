import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({
    id: "", artist: "", origin: "", about: "", price: "", value: "",
    dom: "", category: "", link: ""
  });
  const [image, setImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://bamboo-uvai.onrender.com/products");
      setProducts(res.data);  // Update state with the fetched products
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };
  

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`https://bamboo-uvai.onrender.com/products/${id}`);
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    // Basic validation
    if (!form.id || !form.artist || !form.origin || !form.price) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }
  
    if (isNaN(form.price)) {
      setError("Price must be a valid number.");
      setLoading(false);
      return;
    }
  
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }
    if (image) {
      formData.append("image", image);
    }
  
    try {
      const res = await axios.post("https://bamboo-uvai.onrender.com/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // Refresh product list after adding the product
      fetchProducts();  // Fetch updated product list
  
      setForm({
        id: "", artist: "", origin: "", about: "", price: "", value: "",
        dom: "", category: "", link: ""
      });
      setImage(null);
    } catch (err) {
      setError("Failed to add product");
    } finally {
      setLoading(false);
    }
  };
  


  const fields = [
    { name: "id", label: "Product ID" },
    { name: "artist", label: "Artist" },
    { name: "origin", label: "Origin" },
    { name: "about", label: "Description" },
    { name: "price", label: "Price" },
    { name: "value", label: "Words of Artist" },
    { name: "dom", label: "Date of Manufacturing" },
    { name: "category", label: "Category" },
    { name: "link", label: "Link" },
  ];

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", padding: "20px", backgroundColor: "#f9f9f9"
    }}>
      <div style={{
        width: "100%", maxWidth: "1000px", padding: "20px",
        border: "1px solid #ddd", borderRadius: "12px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", backgroundColor: "#fff"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Bamboo Inventory System</h2>

        <form onSubmit={handleSubmit} style={{ padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            {fields.map((field) => (
              <div key={field.name} style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontWeight: "bold", textTransform: "capitalize", marginBottom: "5px" }}>
                  {field.label}:
                </label>
                <input
                  placeholder={`Enter ${field.label}`}
                  value={form[field.name]}
                  onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                  required
                  style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>Product Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>

          {image && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <p><strong>Preview:</strong></p>
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                style={{ maxWidth: "150px", borderRadius: "8px" }}
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "40%", padding: "10px", backgroundColor: "#4CAF50",
              color: "white", border: "none", borderRadius: "4px",
              fontSize: "16px", cursor: "pointer", margin: "40px auto 0", display: "block"
            }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>

        {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}

        <h2 style={{ textAlign: "center", marginTop: "40px" }}>Products</h2>
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px", textAlign: "center" }}>
          <thead>
            <tr>
              <th>ID</th><th>Artist</th><th>Origin</th><th>Description</th><th>Price</th>
              <th>Words of Artist</th><th>Date</th><th>Category</th><th>Link</th><th>Image</th><th>QR</th><th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.artist}</td>
                <td>{p.origin}</td>
                <td>{p.about}</td>
                <td>{p.price}</td>
                <td>{p.value}</td>
                <td>{p.dom}</td>
                <td>{p.category}</td>
                <td><a href={p.link} target="_blank" rel="noreferrer">Buy</a></td>
                <td>
                <img
                    src={`http://localhost:5000/static/images/product_${p.id}.png`}
                    alt="QR Code"
                    width="80"
                  />

                </td>
                <td>
                  <img
                    src={`https://bamboo-uvai.onrender.com/qrcodes/product_${p.id}.png`}
                    alt="QR Code"
                    width="80"
                  />
                </td>
                <td>
                  <button onClick={() => deleteProduct(p.id)} style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
