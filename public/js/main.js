// Define API base URL
const API_BASE_URL = 'https://idesignwebsite-905e545d981b.herokuapp.com/';

document.addEventListener('DOMContentLoaded', () => {
  // Sticky header navigation
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

  // Services section toggle
  const titles = document.querySelectorAll('.service-title');
  titles.forEach(title => {
    title.addEventListener('click', () => {
      const description = title.nextElementSibling;
      const isOpen = description.classList.contains('show');

      // Close all descriptions
      document.querySelectorAll('.service-description').forEach(desc => desc.classList.remove('show'));
      // Remove active class from all titles
      document.querySelectorAll('.service-title').forEach(t => t.classList.remove('active'));

      // Toggle current description
      if (!isOpen) {
        description.classList.add('show');
        title.classList.add('active');
      }
    });
  });

  // Review slider setup
  const reviewWrapper = document.getElementById('reviewWrapper');
  const reviewItems = document.querySelectorAll('.review-item');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const reviewSlider = document.querySelector('.review-slider');

  let currentIndex = 0;
  let totalReviews = reviewItems.length;
  const slideIntervalTime = 5000; // 5 seconds
  let slideInterval;

  // Function to display review at index
  function showReview(index) {
    reviewItems.forEach((item, i) => {
      item.style.display = i === index ? 'flex' : 'none';
    });
  }

  // Initialize slider
  function initializeSlider() {
    // Re-select reviewItems in case of DOM updates
    const updatedReviews = document.querySelectorAll('.review-item');
    totalReviews = updatedReviews.length;
    if (currentIndex >= totalReviews) currentIndex = 0;
    showReview(currentIndex);
  }

  initializeSlider();

  // Next review
  nextBtn?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalReviews;
    showReview(currentIndex);
  });

  // Previous review
  prevBtn?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalReviews) % totalReviews;
    showReview(currentIndex);
  });

  // Auto-slide
  slideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % totalReviews;
    showReview(currentIndex);
  }, slideIntervalTime);

  // Pause on hover
  reviewSlider?.addEventListener('mouseenter', () => clearInterval(slideInterval));
  reviewSlider?.addEventListener('mouseleave', () => {
    slideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalReviews;
      showReview(currentIndex);
    }, slideIntervalTime);
  });

  // Load reviews from server
  async function loadReviews() {
    try {
      const response = await fetch(`${API_BASE_URL}/get-reviews`);
      if (!response.ok) throw new Error('Network response was not ok');
      const reviews = await response.json();

      // Clear existing reviews
      reviewWrapper.innerHTML = '';

      // Append new reviews
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

  // Submit new review
  document.getElementById('clientReviewForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('clientName').value;
  const position = document.getElementById('clientPosition').value;
  const reviewText = document.getElementById('clientReview').value;

  const payload = { name, position, review: reviewText };
  console.log('Submitting review:', payload);

  try {
    const response = await fetch(`${API_BASE_URL}/add-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('API response:', result);

    if (response.ok) {
      // Add to DOM, reset form, etc.
    } else {
      alert('Error: ' + result.message);
    }
  } catch (err) {
    console.error('Fetch error:', err);
    alert('An error occurred: ' + err.message);
  }
});

  // Initial load of reviews
  loadReviews();
});