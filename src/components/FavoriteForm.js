import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const backend = `${process.env.REACT_APP_API_URL}/favorites`;

export default function FavoriteForm({
  point,
  setShowForm,
  showForm,
  favorites,
  setFavorites,
}) {
  const [formData, setFormData] = useState({
    lat: point.lat,
    lng: point.lng,
    note: "",
  });

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    fetch(backend, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then(() => navigate("/favorites"));
    setShowForm(!showForm);
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      note: e.target.value,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      className="modal-card"
    >
      <h2>Add Site to Favorites</h2>
      <p>Lat: {formData.lat.toFixed(4)}</p>
      <p>Lng: {formData.lng.toFixed(4)}</p>
      <label>Notes:</label>
      <textarea value={formData.note} onChange={handleChange} />
      <div className="favorite-buttons">
        <button onClick={handleSubmit}>Add Favorite</button>
        <button onClick={() => setShowForm(!showForm)}>
          Back to Conditions
        </button>
      </div>
    </form>
  );
}
