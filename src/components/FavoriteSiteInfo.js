import React, { useState } from "react";

export default function FavoriteSiteInfo({
  favorite,
  setSettings,
  favorites,
  setFavorites,
}) {
  const [note, setNote] = useState(favorite.note);
  const [update, setUpdate] = useState(false);

  const { lat, lng } = favorite;

  const backend = `${process.env.REACT_APP_API_URL}/favorites`;

  function toggleUpdate() {
    setUpdate(!update);
  }

  function submitUpdate() {
    const newFavorite = { ...favorite };
    newFavorite.note = note;
    fetch(`${backend}/${newFavorite._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(newFavorite),
    });
    const newFavoriteList = favorites.map((favorite) => {
      return favorite._id === newFavorite._id ? newFavorite : favorite;
    });
    setFavorites(newFavoriteList);
    setUpdate(!update);
  }

  function chooseFavorite(e) {
    e.stopPropagation();
    setSettings({
      zoom: 15,
      center: [lng, lat],
    });
  }

  function deleteFavorite(e) {
    setUpdate(!update);
    fetch(`${backend}/${favorite._id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    }).then(() => {
      const newFavoritesList = favorites.filter((oldFavorite) => {
        return oldFavorite._id !== favorite._id;
      });
      setFavorites(newFavoritesList);
    });
  }

  return (
    <div className="site-info">
      <div className="lat-lng">
        <p>Lat: {lat.toFixed(4)}</p>
        <p>Lon: {lng.toFixed(4)}</p>
      </div>
      <button className="see-site" onClick={chooseFavorite}>
        See Site
      </button>
      <p className="note">Notes:</p>
      {update ? (
        <textarea
          className="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      ) : (
        <p className="note">{note}</p>
      )}
      <button className="update" onClick={update ? submitUpdate : toggleUpdate}>
        Update
      </button>
      {update ? (
        <button className="delete" onClick={deleteFavorite}>
          Delete
        </button>
      ) : (
        <a
          href={`https://www.google.com/maps/dir/''/${lat},${lng}`}
          target="blank"
        >
          Get there with Google
        </a>
      )}
    </div>
  );
}
