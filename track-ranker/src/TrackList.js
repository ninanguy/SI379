import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TrackItem from './TrackItem';

function TrackList({ tracks, setTracks }) {
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTracks(items);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="tracks">
        {(provided) => (
          <ul className="track-list" {...provided.droppableProps} ref={provided.innerRef}>
            {tracks.map((track, index) => (
              <Draggable key={track.id} draggableId={track.id} index={index}>
                {(provided) => (
                  <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <TrackItem track={track} rank={index + 1} />
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default TrackList;
