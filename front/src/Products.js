import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Products() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/product/${id}`) // Adjust if using a different backend port
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Product Details</h2>
      <table border="1" cellPadding="10">
        <tbody>
          <tr>
            <td><strong>ID</strong></td>
            <td>{product.id}</td>
          </tr>
          <tr>
            <td><strong>Name</strong></td>
            <td>{product.name}</td>
          </tr>
          <tr>
            <td><strong>Origin</strong></td>
            <td>{product.origin}</td>
          </tr>
          <tr>
            <td><strong>Artist</strong></td>
            <td>{product.artist}</td>
          </tr>
          <tr>
            <td><strong>Info</strong></td>
            <td>{product.info}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Products;
