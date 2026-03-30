// Define API base URL
const API_BASE_URL = 'https://idesignwebsite-905e545d981b.herokuapp.com/api/reviews';

document.addEventListener('DOMContentLoaded', () => {
  // Select elements
  const reviewWrapper = document.getElementById('reviewWrapper');

  // Attach form submit event directly
  document.getElementById('clientReviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value;
    const position = document.getElementById('clientPosition').value;
    const reviewText = document.getElementById('clientReview').value;
    const rating = document.getElementById('ratingInput')?.value || 0;

    const payload = { name, position, review: reviewText, rating: parseInt(rating) };
    console.log('Submitting review:', payload);

    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response, but received: ${contentType}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      // Reload reviews after success
      loadReviews();
      document.getElementById('clientReviewForm').reset();
      resetStars();
    } catch (err) {
      console.error('Fetch error:', err);
      alert('An error occurred: ' + err.message);
    }
  });

  // Load reviews from server
  async function loadReviews() {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response, but received: ${contentType}`);
    }

    const reviews = await response.json();
    const reviewWrapper = document.getElementById('reviewWrapper');

    reviewWrapper.innerHTML = ''; // Clear existing reviews

    reviews.forEach(review => {
      const reviewDiv = document.createElement('div');
      reviewDiv.className = 'swiper-slide'; // Swiper slide class
      reviewDiv.innerHTML = `
        <div class="review-item">
          <div class="review-content">
            <p class="client-name">${review.name}</p>
            <p class="client-position">${review.position}</p>
            <p class="client-review">"${review.review}"</p>
          </div>
        </div>
      `;
      reviewWrapper.appendChild(reviewDiv);
    });

    // Initialize Swiper
    initializeSwiper();
  } catch (err) {
    console.error('Failed to load reviews:', err);
  }
}

let mySwiper;
function initializeSwiper() {
  if (mySwiper) {
    mySwiper.destroy(true, true);
  }
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
  // Star rating interactivity
  const stars = document.querySelectorAll('.star-rating .star');
  const ratingInput = document.getElementById('ratingInput');
  let selectedRating = 0;

  stars.forEach((star, index) => {
    star.addEventListener('mouseover', () => highlightStars(index + 1));
    star.addEventListener('mouseout', () => highlightStars(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = index + 1;
      highlightStars(selectedRating);
      if (ratingInput) ratingInput.value = selectedRating;
    });
  });

  function highlightStars(rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('hover', 'selected');
      } else {
        star.classList.remove('hover', 'selected');
      }
    });
  }

  function resetStars() {
    selectedRating = 0;
    highlightStars(0);
  }

  // Load initial reviews
  loadReviews();

  // Services section toggle
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