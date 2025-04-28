import React from 'react';

// function TrackItem({ track, rank }) {
//   return (
//     <div className="track-content">
//       <img src={track.albumArt} alt="Album Art" className="album-art" />
//       <span className="rank">#{rank}</span>
//       <span className="track-number">(Track {track.trackNumber})</span>
//       <span className="track-name">{track.name}</span>
//     </div>
//   );
// }
function TrackItem({ track, rank }) {
  return (
    <div className="track-content">
      <img src={track.albumArt} alt="Album Art" className="album-art" />
      <div className="track-text-bundle">
        <div className="rank-track">
          <span className="rank">#{rank}</span>
          <span className="track-number">(Track {track.trackNumber})</span>
        </div>
        <span className="track-name">{track.name}</span>
      </div>
    </div>
  );
}


export default TrackItem;
