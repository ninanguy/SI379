# Album Track Ranker

*Created by Nina Nguyen*

---

## Overview

Album Track Ranker is a React app that lets users search for real albums, load their tracklists, and reorder the tracks by personal preference.

Users can:
- Search for albums dynamically (powered by the Deezer API through RapidAPI)
- View real album tracks, including album cover, current rank, original track number, and track title
- Drag and drop tracks to reorder them
- Reset the list back to the original album order
- Clear all tracks and search for a new album
- Navigate between ranking mode and album search mode smoothly

---

## Features

- **Live Album Search**: Search real albums using the Deezer API.
- **Drag-and-Drop Ranking**: Reorder tracks interactively using drag-and-drop.
- **Track Details**: Display album cover, ranking, original track number, and title.
- **State Persistence**: Track ranking is saved in local storage.
- **Reset and Clear Controls**: Easily reset to the original order or clear all tracks.
- **Responsive Navigation**: Switch between searching for new albums and ranking current tracks.

---

## Built With

- **React** (Create React App)
- **@hello-pangea/dnd** for drag-and-drop functionality
- **Deezer API** via **RapidAPI** for live music data
- **CSS Flexbox** for layout and styling

---

## How It Works

1. **Search for an Album**:  
   Type an album name into the search bar and press Enter.

2. **Select an Album**:  
   Click on an album from the search results to load its tracklist.

3. **Rank the Tracks**:  
   Drag and drop tracks into your preferred order.

4. **Reset or Clear**:  
   Use the "Reset to Original Order" button to go back to the official tracklist, or "Clear All Tracks" to start over.

5. **Switch Between Ranking and Searching**:  
   Search for new albums without losing your current ranking session.
