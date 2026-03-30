// Define API base URL
const API_BASE_URL = 'https://idesignwebsite-905e545d981b.herokuapp.com';

document.addEventListener('DOMContentLoaded', () => {
  // Select elements for review loading and submission
  const reviewWrapper = document.getElementById('reviewWrapper');
  const reviewForm = document.getElementById('clientReviewForm');

  // Load reviews from server
  async function loadReviews() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`);
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

      // Re-initialize slider after loading if needed
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
    const rating = document.getElementById('ratingInput')?.value || 0; // get rating value

    const payload = { name, position, review: reviewText, rating: parseInt(rating) };
    console.log('Submitting review:', payload);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (response.ok) {
        // Reload reviews after successful submission
        loadReviews();
        // Reset form
        document.getElementById('clientReviewForm').reset();
        // Reset star selection visuals
        resetStars();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('An error occurred: ' + err.message);
    }
  });

  // Star rating interactivity
  const stars = document.querySelectorAll('.star-rating .star');
  const ratingInput = document.getElementById('ratingInput');
  let selectedRating = 0;

  // Add event listeners for hover and click
  stars.forEach((star, index) => {
    star.addEventListener('mouseover', () => {
      highlightStars(index + 1);
    });
    star.addEventListener('mouseout', () => {
      highlightStars(selectedRating);
    });
    star.addEventListener('click', () => {
      selectedRating = index + 1;
      highlightStars(selectedRating);
      if (ratingInput) {
        ratingInput.value = selectedRating; // store in hidden input
      }
    });
  });

  // Function to highlight stars up to given rating
  function highlightStars(rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('hover');
        star.classList.add('selected');
      } else {
        star.classList.remove('hover');
        star.classList.remove('selected');
      }
    });
  }

  // Function to reset star visuals
  function resetStars() {
    selectedRating = 0;
    highlightStars(0);
  }

  // Load initial reviews
  loadReviews();
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