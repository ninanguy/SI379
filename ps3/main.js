// events: list of events from API
let events = []
// currentIndex: keeps track of current selected event
let currentIndex = 0;
// timerId is where setTimeout() ID so we can reset it whenever we need
let timerId = null;

const setSelectedIndex = (index) => {
  currentIndex = index;
  const event = events[index];

  // updates the large event display thing
  // update the selected image
   document.getElementById("selected-image").src = event.image_url;
   // update the selected title
   document.getElementById("selected-title").textContent = event.event_title;
   // and link it using href to event.permalink
   document.getElementById("selected-title").href = event.permalink;
   // selected-date (which is the start date) is formatted using getReadableTime
   document.getElementById("selected-date").textContent = getReadableTime(event.datetime_start);
   // update the selected-description
   document.getElementById("selected-description").textContent = event.description;

   // updates the thumbnail
   // uses querySelectorAll to find all #thumbnail with <img> elements
   const thumbnails = document.querySelectorAll("#thumbnails img");
   // loops through all thumbnails
   for (let image of thumbnails) {
    // removes "selected" class from every image
    image.classList.remove("selected");
   }
   // adds "selected" class to one that matches index
   thumbnails[index].classList.add("selected");

   // this resets the timer so multiple timers don't overlap
   clearTimeout(timerId);
   // uses setTimeout() to move to next event in 10 seconds
   timerId = setTimeout(() => {
    // currentIndex + 1 makes sure currentIndex moves up by 1
    // % events.length gives us the remainder, making sure it loops back to 0
    // when the last event = currentIndex + 1
    setSelectedIndex((currentIndex + 1) % events.length);
   }, 10000);
};

const createThumbnails = () => {
  // finds the first element with id=thumbnails and then clears it to avoid duplicates
  const thumbs = document.getElementById("thumbnails");
  thumbs.innerHTML = ""; // clear existing thumbnails

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const img = document.createElement("img");
    img.src = event.styled_images.event_thumb; // src is set to thumbnail image
    img.dataset.index = i;
    img.addEventListener("click", () => setSelectedIndex(i));
    thumbs.appendChild(img);
  }

  // selects the first event (after the thumbnails have been made) so that an
  // event is displayed when the page loads
  setSelectedIndex(0);
};

// eventlistener adeded so it waits for the page to fully load
document.addEventListener("DOMContentLoaded", () => {
  // calls function from api to fetch event data
  getUMEventsWithImages((fetchedEvents) => {
    // if there are events, it stores them in events and then runs
    // createThumbnails() to display them
    if(fetchedEvents.length > 0) {
      events = fetchedEvents;
      createThumbnails();
    }
  });
});
