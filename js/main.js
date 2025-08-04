import ReactDOM from 'react-dom/client';
import App from './app';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);




// for sticky header navigation
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('active');
    });
  } else {
    console.error('Hamburger or nav menu element not found.');
  }
});
 //services section 
document.addEventListener('DOMContentLoaded', () => {
  const titles = document.querySelectorAll('.service-title');

  titles.forEach(title => {
    title.addEventListener('click', () => {
  
      const description = title.nextElementSibling;

      // Check if this description is already visible
      const isOpen = description.classList.contains('show');
      console.log('Clicked title:', title.textContent);
  console.log('Description:', description);

      // Close all descriptions
      document.querySelectorAll('.service-description').forEach(desc => {
        desc.classList.remove('show');
      });

      // Remove active class from all titles
      document.querySelectorAll('.service-title').forEach(t => {
        t.classList.remove('active');
      });

      // If this one was not open, open it
      if (!isOpen) {
        description.classList.add('show');
        title.classList.add('active');
      }
    });
  });
});

//for review slider
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const reviewWrapper = document.getElementById('reviewWrapper');
  let reviewItems = document.querySelectorAll('.review-item');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const reviewSlider = document.querySelector('.review-slider');

  let currentIndex = 0;
  let totalReviews = reviewItems.length;
  const slideIntervalTime = 5000; // 5 seconds
  let slideInterval;

  // Function to update visible review
  function showReview(index) {
    reviewItems.forEach((item, i) => {
      item.style.display = i === index ? 'flex' : 'none';
    });
  }

  // Initial load
  function initializeSlider() {
    // Re-select reviewItems in case new reviews are added
    reviewItems = document.querySelectorAll('.review-item');
    totalReviews = reviewItems.length;
    // Reset index if out of bounds
    if (currentIndex >= totalReviews) currentIndex = 0;
    showReview(currentIndex);
  }

  initializeSlider();

  // Next button
  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalReviews;
    showReview(currentIndex);
  });

  // Prev button
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalReviews) % totalReviews;
    showReview(currentIndex);
  });

  // Auto-slide
  slideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % totalReviews;
    showReview(currentIndex);
  }, slideIntervalTime);

  // Pause on mouse enter
  reviewSlider.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });
  // Resume on mouse leave
  reviewSlider.addEventListener('mouseleave', () => {
    slideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalReviews;
      showReview(currentIndex);
    }, slideIntervalTime);
  });

  // When new reviews are added, re-initialize slider
  // This can be called after appending new reviews
  function refreshReviews() {
    initializeSlider();
  }

  // Handle form submission
  document.getElementById('clientReviewForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('clientName').value;
    const position = document.getElementById('clientPosition').value;
    const reviewText = document.getElementById('clientReview').value;

    try {
      const response = await fetch('/add-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, position, review: reviewText }),
      });

      const result = await response.json();

      if (response.ok) {
        // Add new review to DOM
        const newReview = document.createElement('div');
        newReview.className = 'review-item';
        newReview.innerHTML = `
            <div class="review-content">
            <p class="client-name">${name}</p>
            <p class="client-position">${position}</p>
            <p class="client-review">"${reviewText}"</p>
          </div>
        `;
        reviewWrapper.appendChild(newReview);

        // Reset form
        this.reset();

        // Refresh slider to include new review
        refreshReviews();

        alert('Review submitted successfully!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('An error occurred: ' + err.message);
    }
  });

  // Load reviews from server on page load
  loadReviews();

  // Function to load reviews dynamically
  async function loadReviews() {
    try {
      const response = await fetch('/get-reviews');
      const reviews = await response.json();

      // Clear existing reviews
      reviewWrapper.innerHTML = '';

      // Append reviews
      reviews.forEach(review => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review-item';
        reviewDiv.innerHTML = `
          <div class="review-content">
            <p class="client-name">${review.name}</p>
            <p class="client-position">${review.position}</p>
            <p class="client-review">"${review.review}"</p>
          </div>
        `;
        reviewWrapper.appendChild(reviewDiv);
      });

      // Re-initialize slider after loading
      initializeSlider();
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }
});