// Define API base URL
const API_BASE_URL = 'https://idesignwebsite-905e545d981b.herokuapp.com';

document.addEventListener('DOMContentLoaded', () => {
  // ... your existing code ...

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
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (response.ok) {
        // Optionally, reload reviews after successful submission
        loadReviews();
        // Reset form
        document.getElementById('clientReviewForm').reset();
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