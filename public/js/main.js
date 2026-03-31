async function loadReviews() {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response, but received: ${contentType}`);
    }

    const reviews = await response.json();

    // Clear existing reviews (including static ones)
    //reviewWrapper.innerHTML = '';(comment out if you want to keep static reviews in HTML)

    // Re-add static reviews if you want them to always stay
    // Or keep static reviews in HTML, and only append new reviews
    // If static reviews are in HTML, do NOT clear them
    // Instead, append only new reviews:
    
    // Append new reviews
    reviews.forEach(review => {
      const reviewItem = createReviewItem(review);
      reviewWrapper.appendChild(reviewItem);
    });

    // Re-initialize Swiper
    initializeSwiper();

  } catch (err) {
    console.error('Failed to load reviews:', err);
  }
}