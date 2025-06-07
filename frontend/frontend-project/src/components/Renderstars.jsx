
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegStar } from "@fortawesome/free-regular-svg-icons";
export const Renderstars = (ratings) => {
  if (!Array.isArray(ratings) || ratings.length === 0) {
    return {
      stars: Array(5)
        .fill(null)
        .map((_, i) => (
          <FontAwesomeIcon key={`empty-${i}`} icon={faRegStar} size="sm" color="gray" />
        )),
      averageRating: 0,
    };
  }

  // No need to extract rating again, ratings is already an array of numbers
  const ratingValues = ratings.filter((rating) => typeof rating === "number" && !isNaN(rating));

  if (ratingValues.length === 0) {
    return {
      stars: Array(5)
        .fill(null)
        .map((_, i) => (
          <FontAwesomeIcon key={`empty-${i}`} icon={faRegStar} size="sm" color="gray" />
        )),
      averageRating: 0,
    };
  }

  const totalRatings = ratingValues.length;
  const averageRating = ratingValues.reduce((sum, rating) => sum + rating, 0) / totalRatings;

  const stars = [];
  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FontAwesomeIcon key={`full-${i}`} icon={faStar} size="sm" color="#d4af37" />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <FontAwesomeIcon key="half" icon={faStarHalfAlt} size="sm" color="#d4af37" />
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <FontAwesomeIcon key={`empty-${i}`} icon={faRegStar} size="sm" color="gray" />
    );
  }

  return { stars, averageRating };
};
