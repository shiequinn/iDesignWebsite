// Define API base URL
const API_PROXY_URL = 'https://idesignwebsite-905e545d981b.herokuapp.com/api/reviews';

// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('active');
});

// Initialize Swiper
let reviewSwiper;

function initReviewSwiper() {
  if (reviewSwiper) {
    reviewSwiper.destroy(true, true);
  }
  reviewSwiper = new Swiper('.mySwiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    navigation: {
      nextEl: '#nextBtn',
      prevEl: '#prevBtn',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}

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

// Load reviews from server
async function loadReviews() {
  const token = '972431bb52be49cddd3f36420df375d54f21151f8551d06548aba499deb56e5b';
  try {
    const response = await fetch(`${API_PROXY_URL}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

    const data = await response.text();

    if (data.trim()) {
      try {
        const reviews = JSON.parse(data);
        const reviewWrapper = document.getElementById('reviewWrapper');
        reviewWrapper.innerHTML = '';

        if (Array.isArray(reviews) && reviews.length > 0) {
         reviews.forEach(review => {
         console.log('Review:', review);
         reviewWrapper.appendChild(createReviewItem(review));
});
        } else {
          reviewWrapper.innerHTML = '<p>No reviews available.</p>';
        }
        initReviewSwiper();
      } catch (error) {
        console.error('Failed to parse reviews JSON:', error);
      }
    } else {
      document.getElementById('reviewWrapper').innerHTML = '<p>No reviews found or empty response.</p>';
    }
  } catch (err) {
    console.error('Failed to load reviews:', err);
  }
}

// Call loadReviews on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  loadReviews();

  // Handle review form submission
  document.getElementById('clientReviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const position = document.getElementById('clientPosition').value.trim();
    const reviewText = document.getElementById('clientReview').value.trim();
    const rating = document.getElementById('ratingInput')?.value || 0;

    // Submit review to API
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

  // Navigation to reviews page
  const goToReviewsBtn = document.getElementById('goToReviewsBtn');
  if (goToReviewsBtn) {
    goToReviewsBtn.addEventListener('click', () => {
      window.location.href = '/index.reviews.html';
    });
  }

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