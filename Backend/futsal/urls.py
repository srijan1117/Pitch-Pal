from django.urls import path
from futsal.views import ReviewCreateView, ReviewUpdateDeleteView, CourtReviewListView
from futsal.views import (
    CourtListView, CourtCreateView, CourtDetailView, OwnerCourtListView,
    TimeSlotCreateView, TimeSlotDetailView, CourtTimeSlotsView,
    BookingCreateView, UserBookingListView, BookingCancelView, OwnerBookingListView,
    KhaltiInitiateView, KhaltiVerifyView,
)

urlpatterns = [
    # ── Courts ──────────────────────────────────
    path('courts/', CourtListView.as_view(), name='court-list'),               # Public
    path('courts/create/', CourtCreateView.as_view(), name='court-create'),    # Owner
    path('courts/mine/', OwnerCourtListView.as_view(), name='court-mine'),     # Owner
    path('courts/<int:pk>/', CourtDetailView.as_view(), name='court-detail'),  # Owner

    # ── Time Slots ───────────────────────────────
    path('courts/<int:court_id>/slots/', CourtTimeSlotsView.as_view(), name='court-slots'),           # Public
    path('courts/<int:court_id>/slots/create/', TimeSlotCreateView.as_view(), name='slot-create'),   # Owner
    path('slots/<int:slot_id>/', TimeSlotDetailView.as_view(), name='slot-detail'),                  # Owner

    # ── Bookings ─────────────────────────────────
    path('bookings/', UserBookingListView.as_view(), name='booking-list'),          # User
    path('bookings/create/', BookingCreateView.as_view(), name='booking-create'),   # User
    path('bookings/<int:booking_id>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),  # User
    path('bookings/owner/', OwnerBookingListView.as_view(), name='owner-bookings'), # Owner


    # ── Review ─────────────────────────────────
    path('reviews/create/', ReviewCreateView.as_view(), name='review-create'),
    path('reviews/<int:review_id>/', ReviewUpdateDeleteView.as_view(), name='review-detail'),
    path('courts/<int:court_id>/reviews/', CourtReviewListView.as_view(), name='court-reviews'),

    # ── Payment ──────────────────────────────────
    path('payment/khalti/initiate/', KhaltiInitiateView.as_view(), name='khalti-initiate'),
    path('payment/khalti/verify/', KhaltiVerifyView.as_view(), name='khalti-verify'),
]