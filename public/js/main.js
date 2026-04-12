// Define API base URL
const API_PROXY_URL = '/index.reviews.html'; // Adjust this if your API endpoint is different

document.addEventListener('DOMContentLoaded', () => {
  const reviewWrapper = document.getElementById('reviewWrapper');

  // Function to create a review DOM element
  function createReviewItem(review) {
    const reviewItem = document.createElement('div');
    reviewItem.className = 'review-item';

    reviewItem.innerHTML = `
      <div class="review-content">
        <p class="client-name">${review.name}</p>
        <p class="client-position">${review.position}</p>
        <p class="client-review">"${review.review}"</p>
        <p class="client-rating">Rating: ${review.rating}</p>
      </div>
    `;
    return reviewItem;
  }

  // Load reviews from server and append new ones
  async function loadReviews() {
  const token = '972431bb52be49cddd3f36420df375d54f21151f8551d06548aba499deb56e5b'; // Replace this with your actual token retrieval logic

  try {
    const response = await fetch(`${API_PROXY_URL}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response, but received: ${contentType}`);
    }

    const data = await response.text();
    if (data) {
      const reviews = JSON.parse(data);
      // Do NOT clear existing reviews
      reviews.forEach(review => {
        const reviewItem = createReviewItem(review);
        reviewWrapper.appendChild(reviewItem);
      });
    } else {
      console.log('No reviews found.');
    }

    initializeSwiper();

  } catch (err) {
    console.error('Failed to load reviews:', err);
  }
}
  // Submit new review
  document.getElementById('clientReviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const position = document.getElementById('clientPosition').value.trim();
    const reviewText = document.getElementById('clientReview').value.trim();
    const rating = document.getElementById('ratingInput')?.value || 0;

    const payload = { name, position, review: reviewText, rating: parseInt(rating) };
    console.log('Submitting review:', payload);

    try {
      const response = await fetch(`${API_PROXY_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const result = await response.json();
      alert(result.message || 'Review submitted successfully!');

      // Reload reviews to include the new one
      await loadReviews();

      // Reset form and stars
      document.getElementById('clientReviewForm').reset();
      resetStars();

    } catch (err) {
      console.error('Fetch error:', err);
      alert('An error occurred: ' + err.message);
    }
  });

  // Initialize Swiper for reviews
  let mySwiper;
  function initializeSwiper() {
    if (mySwiper) {
      mySwiper.destroy(true, true);
    }
    if (document.querySelector('#reviewSwiper')) {
      mySwiper = new Swiper('#reviewSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        navigation: {
          nextEl: '#nextBtn',
          prevEl: '#prevBtn',
        },
        loop: true,
      });
    }
  }

  // Star rating interactivity
  const stars = document.querySelectorAll('.star-rating .star');
  const ratingInput = document.getElementById('ratingInput');
  let selectedRating = 0;

  function highlightStars(rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
  }

  function resetStars() {
    selectedRating = 0;
    highlightStars(0);
  }

  stars.forEach((star, index) => {
    star.addEventListener('mouseover', () => highlightStars(index + 1));
    star.addEventListener('mouseout', () => highlightStars(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = index + 1;
      highlightStars(selectedRating);
      if (ratingInput) ratingInput.value = selectedRating;
    });
  });

  // Load initial reviews
  loadReviews();

  // Select hamburger and nav
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open'); // toggle the "X" transform
    navMenu.classList.toggle('active'); // toggle menu visibility
  });

  // Service section toggle
  const titles = document.querySelectorAll('.service-title');
  titles.forEach(title => {
    title.addEventListener('click', () => {
      const description = title.nextElementSibling;
      const isOpen = description.classList.contains('show');

      document.querySelectorAll('.service-description').forEach(desc => desc.classList.remove('show'));
      document.querySelectorAll('.service-title').forEach(t => t.classList.remove('active'));

      if (!isOpen) {
        description.classList.add('show');
        title.classList.add('active');
      }
    });
  });
});