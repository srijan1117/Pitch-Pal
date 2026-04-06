from django.urls import path
from futsal.views import ReviewCreateView, ReviewUpdateDeleteView, CourtReviewListView
from futsal.views import CourtImageUploadView  
from futsal.views import WeeklyBookingCreateView, WeeklyBookingListView, WeeklyBookingCancelView
from futsal.views import (
    CourtListView, CourtCreateView, CourtDetailView, OwnerCourtListView,
    TimeSlotCreateView, TimeSlotDetailView, CourtTimeSlotsView,
    BookingCreateView, UserBookingListView, BookingCancelView, OwnerBookingListView,
    WalkinBookingView,
    KhaltiInitiateView, KhaltiVerifyView,
)
from futsal.views import (
    TournamentListView, TournamentDetailView, TournamentCreateView,
    TournamentUpdateView, TournamentDeleteView, TournamentRegisterView,
    UserTournamentRegistrationsView, TournamentRegistrationsAdminView
)

urlpatterns = [
    # ── Courts ──────────────────────────────────
    path('courts/', CourtListView.as_view(), name='court-list'),               # Public
    path('courts/create/', CourtCreateView.as_view(), name='court-create'),    # Owner
    path('courts/mine/', OwnerCourtListView.as_view(), name='court-mine'),     # Owner
    path('courts/<int:pk>/', CourtDetailView.as_view(), name='court-detail'),  # Owner
    path('courts/<int:court_id>/images/', CourtImageUploadView.as_view(), name='court-images'),

    # ── Time Slots ───────────────────────────────
    path('courts/<int:court_id>/slots/', CourtTimeSlotsView.as_view(), name='court-slots'),           # Public
    path('courts/<int:court_id>/slots/create/', TimeSlotCreateView.as_view(), name='slot-create'),   # Owner
    path('slots/<int:slot_id>/', TimeSlotDetailView.as_view(), name='slot-detail'),                  # Owner

    # ── Bookings ─────────────────────────────────
    path('bookings/', UserBookingListView.as_view(), name='booking-list'),          # User
    path('bookings/create/', BookingCreateView.as_view(), name='booking-create'),   # User
    path('bookings/<int:booking_id>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),  # User
    path('bookings/owner/', OwnerBookingListView.as_view(), name='owner-bookings'), # Owner
    path('bookings/walkin/', WalkinBookingView.as_view(), name='walkin-booking'),   # Owner
    path('bookings/weekly/', WeeklyBookingListView.as_view(), name='weekly-booking-list'),
    path('bookings/weekly/create/', WeeklyBookingCreateView.as_view(), name='weekly-booking-create'),
    path('bookings/weekly/<int:booking_id>/cancel/', WeeklyBookingCancelView.as_view(), name='weekly-booking-cancel'),

    # ── Tournaments ───────────────────────────────
path('tournaments/', TournamentListView.as_view(), name='tournament-list'),
path('tournaments/create/', TournamentCreateView.as_view(), name='tournament-create'),
path('tournaments/my-registrations/', UserTournamentRegistrationsView.as_view(), name='my-tournament-registrations'),
path('tournaments/register/', TournamentRegisterView.as_view(), name='tournament-register'),
path('tournaments/<int:tournament_id>/', TournamentDetailView.as_view(), name='tournament-detail'),
path('tournaments/<int:tournament_id>/update/', TournamentUpdateView.as_view(), name='tournament-update'),
path('tournaments/<int:tournament_id>/delete/', TournamentDeleteView.as_view(), name='tournament-delete'),
path('tournaments/<int:tournament_id>/registrations/', TournamentRegistrationsAdminView.as_view(), name='tournament-registrations'),    

    # ── Review ─────────────────────────────────
    path('reviews/create/', ReviewCreateView.as_view(), name='review-create'),
    path('reviews/<int:review_id>/', ReviewUpdateDeleteView.as_view(), name='review-detail'),
    path('courts/<int:court_id>/reviews/', CourtReviewListView.as_view(), name='court-reviews'),

    # ── Payment ──────────────────────────────────
    path('payment/khalti/initiate/', KhaltiInitiateView.as_view(), name='khalti-initiate'),
    path('payment/khalti/verify/', KhaltiVerifyView.as_view(), name='khalti-verify'),
]