import React, { useState, useEffect } from 'react';
import TrackList from './TrackList';
import './App.css';

function App() {
  const [tracks, setTracks] = useState([]);
  const [originalTracks, setOriginalTracks] = useState([]);
  const [albumSearch, setAlbumSearch] = useState('');
  const [albumResults, setAlbumResults] = useState([]);
  const [albumName, setAlbumName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const savedTracks = localStorage.getItem('tracks');
    if (savedTracks) {
      setTracks(JSON.parse(savedTracks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tracks', JSON.stringify(tracks));
  }, [tracks]);

  const searchAlbums = async () => {
    const response = await fetch(`https://deezerdevs-deezer.p.rapidapi.com/search?q=album:"${albumSearch}"`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '247e26d6d1msh37bf7541cf9df80p177cc0jsnc98ebcac4554',  // <--- YOUR key here
        'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
      }
    });
    const data = await response.json();
    const albums = data.data.map(item => item.album);
    setAlbumResults(albums);
    setIsSearching(true);
  };
  

  const loadAlbumTracks = async (albumId) => {
    const response = await fetch(`https://deezerdevs-deezer.p.rapidapi.com/album/${albumId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '247e26d6d1msh37bf7541cf9df80p177cc0jsnc98ebcac4554',
        'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
      }
    });
    const data = await response.json();
  
    const albumTracks = data.tracks.data.map((track, index) => ({
      id: track.id.toString(),
      name: track.title,
      albumArt: data.cover_medium,
      trackNumber: index + 1, // new field, original album order
    }));
    
  
    setTracks(albumTracks);
    setOriginalTracks(albumTracks);
    setAlbumResults([]);
    setAlbumName(data.title);
    setArtistName(data.artist.name);
    setIsSearching(false);
  };
  

  const resetTracks = () => {
    setTracks(originalTracks);
    localStorage.setItem('tracks', JSON.stringify(originalTracks));
  };

  const clearTracks = () => {
    setTracks([]);
    setOriginalTracks([]);
    setAlbumName('');
    setArtistName('');
    localStorage.removeItem('tracks');
  };
  

  return (
    <div className="App">
      <h1>Album Track Ranker</h1>
      <p class="by">by Nina Nguyen</p>
      <form className="search-section" onSubmit={(e) => {
        e.preventDefault();
        searchAlbums();
      }}>
        <input
          type="text"
          placeholder="Search Album..."
          value={albumSearch}
          onChange={(e) => setAlbumSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
  
      {/* 🔥 Insert Back to Ranking button here! */}
      {isSearching && (
        <div className="back-button-container">
          <button onClick={() => {
            setAlbumResults([]);
            setIsSearching(false);
          }} className="back-button">
            ← Back to Ranking
          </button>
        </div>
      )}
  
      {/* 🔥 Insert Album Results (search results) here */}
      {isSearching && (
        <div className="album-results">
          {albumResults.map((album) => (
            <div key={album.id} className="album-result" onClick={() => loadAlbumTracks(album.id)}>
              <img src={album.cover_medium} alt={album.title} />
              <p>{album.title}</p>
            </div>
          ))}
        </div>
      )}
  
      {/* Controls (Reset and Clear) */}
      <div className="controls">
        <button onClick={resetTracks} className="reset-button">Reset to Original Order</button>
        <button onClick={clearTracks} className="clear-button">Clear All Tracks</button>
      </div>
  
      {/* Album Name and Artist */}
      {albumName && artistName && (
        <div className="album-header">
          <h2>{albumName}</h2>
          <h3>by {artistName}</h3>
        </div>
      )}
  
      {/* Tracklist */}
      <TrackList tracks={tracks} setTracks={setTracks} />
    </div>
  );  
}

export default App;
