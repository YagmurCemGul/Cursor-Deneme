import React, { useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { TemplateRating, TemplateReview } from '../types';

interface TemplateRatingsReviewsProps {
  templateId: string;
  templateName: string;
  language: Lang;
  onClose: () => void;
}

export const TemplateRatingsReviews: React.FC<TemplateRatingsReviewsProps> = ({
  templateId,
  templateName,
  language,
  onClose,
}) => {
  const [ratings, setRatings] = useState<TemplateRating[]>([]);
  const [reviews, setReviews] = useState<TemplateReview[]>([]);
  const [averageRating, setAverageRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [showAddReview, setShowAddReview] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewPros, setReviewPros] = useState('');
  const [reviewCons, setReviewCons] = useState('');

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    const [templateRatings, templateReviews, avgRating] = await Promise.all([
      StorageService.getTemplateRatings(templateId),
      StorageService.getTemplateReviews(templateId),
      StorageService.getAverageRating(templateId)
    ]);

    setRatings(templateRatings);
    setReviews(templateReviews);
    setAverageRating(avgRating);
  };

  const handleQuickRating = async (rating: number) => {
    const newRating: TemplateRating = {
      id: Date.now().toString(),
      templateId,
      rating,
      createdAt: new Date().toISOString(),
      helpful: 0
    };

    await StorageService.saveTemplateRating(newRating);
    await loadData();
  };

  const handleSubmitReview = async () => {
    if (!userRating || !reviewTitle || !reviewText) {
      alert(t(language, 'reviews.fillRequired'));
      return;
    }

    const newReview: TemplateReview = {
      id: Date.now().toString(),
      templateId,
      rating: userRating,
      title: reviewTitle,
      review: reviewText,
      pros: reviewPros.split('\n').filter(p => p.trim()),
      cons: reviewCons.split('\n').filter(c => c.trim()),
      createdAt: new Date().toISOString(),
      helpful: 0,
      notHelpful: 0
    };

    await StorageService.saveTemplateReview(newReview);
    await handleQuickRating(userRating);

    // Reset form
    setUserRating(0);
    setReviewTitle('');
    setReviewText('');
    setReviewPros('');
    setReviewCons('');
    setShowAddReview(false);

    await loadData();
  };

  const handleVoteHelpful = async (reviewId: string, helpful: boolean) => {
    await StorageService.voteReviewHelpful(reviewId, helpful);
    await loadData();
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
          >
            {star <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();
  const totalRatings = ratings.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content ratings-reviews-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>⭐ {t(language, 'reviews.title')} - {templateName}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Overall Rating Summary */}
          <div className="rating-summary">
            <div className="rating-overview">
              <div className="rating-score">
                <span className="score-number">{averageRating.average.toFixed(1)}</span>
                {renderStars(Math.round(averageRating.average))}
                <span className="rating-count">{averageRating.count} {t(language, 'reviews.ratings')}</span>
              </div>

              <div className="rating-distribution">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="distribution-row">
                    <span className="star-label">{star} ★</span>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill"
                        style={{
                          width: totalRatings > 0 ? `${(distribution[star] / totalRatings) * 100}%` : '0%'
                        }}
                      />
                    </div>
                    <span className="distribution-count">{distribution[star]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Rating */}
            <div className="quick-rating">
              <h4>{t(language, 'reviews.quickRating')}</h4>
              {renderStars(0, true, handleQuickRating)}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section">
            <div className="reviews-header">
              <h4>{t(language, 'reviews.userReviews')} ({reviews.length})</h4>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddReview(!showAddReview)}
              >
                {showAddReview ? t(language, 'common.cancel') : t(language, 'reviews.writeReview')}
              </button>
            </div>

            {/* Add Review Form */}
            {showAddReview && (
              <div className="add-review-form">
                <div className="form-group">
                  <label>{t(language, 'reviews.yourRating')}*</label>
                  {renderStars(userRating, true, setUserRating)}
                </div>

                <div className="form-group">
                  <label htmlFor="review-title">{t(language, 'reviews.reviewTitle')}*</label>
                  <input
                    id="review-title"
                    type="text"
                    className="form-control"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder={t(language, 'reviews.titlePlaceholder')}
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="review-text">{t(language, 'reviews.reviewText')}*</label>
                  <textarea
                    id="review-text"
                    className="form-control"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={t(language, 'reviews.textPlaceholder')}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="review-pros">{t(language, 'reviews.pros')}</label>
                    <textarea
                      id="review-pros"
                      className="form-control"
                      rows={3}
                      value={reviewPros}
                      onChange={(e) => setReviewPros(e.target.value)}
                      placeholder={t(language, 'reviews.prosPlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-cons">{t(language, 'reviews.cons')}</label>
                    <textarea
                      id="review-cons"
                      className="form-control"
                      rows={3}
                      value={reviewCons}
                      onChange={(e) => setReviewCons(e.target.value)}
                      placeholder={t(language, 'reviews.consPlaceholder')}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmitReview}
                    disabled={!userRating || !reviewTitle || !reviewText}
                  >
                    {t(language, 'reviews.submitReview')}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAddReview(false)}
                  >
                    {t(language, 'common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="no-reviews">
                  <p>{t(language, 'reviews.noReviews')}</p>
                  <p>{t(language, 'reviews.beFirst')}</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-rating">
                        {renderStars(review.rating)}
                        {review.verified && <span className="verified-badge">✓ {t(language, 'reviews.verified')}</span>}
                      </div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h5 className="review-title">{review.title}</h5>
                    <p className="review-text">{review.review}</p>

                    {(review.pros && review.pros.length > 0) && (
                      <div className="review-pros">
                        <strong>✓ {t(language, 'reviews.pros')}:</strong>
                        <ul>
                          {review.pros.map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(review.cons && review.cons.length > 0) && (
                      <div className="review-cons">
                        <strong>✗ {t(language, 'reviews.cons')}:</strong>
                        <ul>
                          {review.cons.map((con, idx) => (
                            <li key={idx}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="review-actions">
                      <span className="helpful-text">{t(language, 'reviews.wasHelpful')}</span>
                      <button
                        className="btn-link"
                        onClick={() => handleVoteHelpful(review.id, true)}
                      >
                        👍 {t(language, 'reviews.yes')} ({review.helpful})
                      </button>
                      <button
                        className="btn-link"
                        onClick={() => handleVoteHelpful(review.id, false)}
                      >
                        👎 {t(language, 'reviews.no')} ({review.notHelpful})
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t(language, 'common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
