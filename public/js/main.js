// Define API base URL
const API_BASE_URL = 'https://idesignwebsite-905e545d981b.herokuapp.com/api/reviews'; // Update with your actual API endpoint

document.addEventListener('DOMContentLoaded', () => {
  const reviewWrapper = document.getElementById('reviewWrapper');

  // Handle review form submission
  document.getElementById('clientReviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const position = document.getElementById('clientPosition').value.trim();
    const reviewText = document.getElementById('clientReview').value.trim();
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

      // Ensure JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response, but received: ${contentType}`);
      }

      const result = await response.json();
      alert(result.message || 'Review submitted successfully!');

      // Reload reviews to include new one
      await loadReviews();

      // Reset form and stars
      document.getElementById('clientReviewForm').reset();
      resetStars();

    } catch (err) {
      console.error('Fetch error:', err);
      alert('An error occurred: ' + err.message);
    }
  });

  // Load reviews from server and initialize Swiper
 async function loadReviews() {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response, but received: ${contentType}`);
    }

    const reviews = await response.json();
    console.log('Fetched reviews:', reviews); // Add this line
    reviewWrapper.innerHTML = '';

    reviews.forEach(review => {
      // existing code
    });

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
    // Make sure your container has id 'reviewSwiper' for Swiper
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

  // Load initial reviews on page load
  loadReviews();

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