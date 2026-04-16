import requests
from django.utils import timezone
from django.conf import settings
from django.db.models import Count, Avg, Q

from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from futsal.models import (
    FutsalCourt, TimeSlot, Booking, Payment, 
    BookingStatusEnum, PaymentStatusEnum, CourtImage, 
    Review, WeeklyBooking, Tournament, TournamentRegistration,
    TournamentStatusEnum, TournamentStateEnum
)
from futsal.serializers import (
    FutsalCourtSerializer, FutsalCourtCreateSerializer,
    TimeSlotSerializer, BookingSerializer,
    KhaltiInitSerializer, KhaltiVerifySerializer,
    WalkinBookingSerializer, ReviewSerializer,
    WeeklyBookingSerializer, TournamentSerializer,
    TournamentCreateSerializer, TournamentRegistrationSerializer
)
from futsal.permissions import IsOwner, IsOwnerOfCourt
from PitchPal.utils import api_response
from accounts.models import RoleEnum

# USE a.khalti.com for Sandbox and pay.khalti.com for Production
KHALTI_INITIATE_URL = "https://a.khalti.com/api/v2/epayment/initiate/"
KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/"

def parse_khalti_amount(amount):
    if amount is None: return 0
    if isinstance(amount, (int, float, Decimal)): return float(amount)
    
    # Handle string cases like "Rs 500" or "500.00"
    clean_str = str(amount).replace('Rs', '').replace('Rs.', '').replace(',', '').strip()
    try: return float(clean_str)
    except: return 0

# ── COURTS ──────────────────────────────────────────────────────────────────

class CourtListView(generics.ListAPIView):
    """List all active futsal courts."""
    queryset = FutsalCourt.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = FutsalCourtSerializer
    permission_classes = [AllowAny]
    swagger_tags = ['Courts']

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class CourtCreateView(APIView):
    """Owner: Create a new futsal court."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [MultiPartParser, FormParser]
    swagger_tags = ['Courts']

    @swagger_auto_schema(request_body=FutsalCourtCreateSerializer, tags=["Courts"])
    def post(self, request):
        serializer = FutsalCourtCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            court = serializer.save()
            return api_response(is_success=True, result=FutsalCourtSerializer(court, context={'request': request}).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class OwnerCourtListView(generics.ListAPIView):
    """Owner: List their own courts."""
    serializer_class = FutsalCourtSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    swagger_tags = ['Courts']

    def get_queryset(self):
        return FutsalCourt.objects.filter(owner=self.request.user)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class CourtDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Manage specific court details."""
    queryset = FutsalCourt.objects.all()
    serializer_class = FutsalCourtSerializer
    permission_classes = [IsAuthenticated, IsOwnerOfCourt]
    swagger_tags = ['Courts']

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class CourtImageUploadView(APIView):
    """Upload gallery images for a court."""
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [MultiPartParser, FormParser]
    swagger_tags = ['Courts']

    def post(self, request, court_id):
        try:
            court = FutsalCourt.objects.get(id=court_id, owner=request.user)
            images = request.FILES.getlist('images')
            if not images:
                return api_response(is_success=False, error_message="No images provided", status_code=status.HTTP_400_BAD_REQUEST)
            
            # Max 4 images check
            current_count = court.gallery.count()
            if current_count + len(images) > 4:
                return api_response(is_success=False, error_message=f"Maximum 4 images allowed. You already have {current_count}.", status_code=status.HTTP_400_BAD_REQUEST)

            for img in images:
                CourtImage.objects.create(court=court, image=img)
            
            return api_response(is_success=True, result="Images uploaded successfully", status_code=status.HTTP_201_CREATED)
        except FutsalCourt.DoesNotExist:
            return api_response(is_success=False, error_message="Court not found", status_code=status.HTTP_404_NOT_FOUND)

    def delete(self, request, court_id):
        try:
            image_id = request.query_params.get('image_id')
            if not image_id:
                return api_response(is_success=False, error_message="Image ID required", status_code=status.HTTP_400_BAD_REQUEST)
            
            image = CourtImage.objects.get(id=image_id, court__id=court_id, court__owner=request.user)
            image.delete()
            return api_response(is_success=True, result="Image deleted successfully", status_code=status.HTTP_200_OK)
        except CourtImage.DoesNotExist:
            return api_response(is_success=False, error_message="Image not found or not authorized", status_code=status.HTTP_404_NOT_FOUND)

# ── TIME SLOTS ──────────────────────────────────────────────────────────────

class CourtTimeSlotsView(APIView):
    """Public: View all slots for a specific court, marked if booked for a specific date."""
    permission_classes = [AllowAny]
    swagger_tags = ['Time Slots']

    def get(self, request, court_id):
        booking_date = request.query_params.get('date')
        
        # Base slots for the court
        slots = TimeSlot.objects.filter(court_id=court_id).order_by('start_time')
        
        booked_slot_ids = []
        if booking_date:
            try:
                # 1. Confirmed or Played bookings
                confirmed_bookings = Booking.objects.filter(
                    court_id=court_id,
                    booking_date=booking_date,
                    status__in=[BookingStatusEnum.CONFIRMED, BookingStatusEnum.COMPLETED]
                )
                
                # 2. Pending bookings created in the last 5 minutes (temporary lock)
                from datetime import timedelta
                lock_time = timezone.now() - timedelta(minutes=5)
                
                pending_bookings = Booking.objects.filter(
                    court_id=court_id,
                    booking_date=booking_date,
                    status=BookingStatusEnum.PENDING,
                    created_at__gte=lock_time
                )
                
                booked_slot_ids = list(confirmed_bookings.values_list('time_slot_id', flat=True))
                pending_slot_ids = list(pending_bookings.values_list('time_slot_id', flat=True))
                
                # Combine both to show as "unavailable" in the UI
                booked_slot_ids = list(set(booked_slot_ids + pending_slot_ids))
                
            except Exception as e:
                print(f"Error fetching bookings for date: {e}")

        serializer = TimeSlotSerializer(
            slots, 
            many=True, 
            context={'booked_slot_ids': booked_slot_ids}
        )
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class TimeSlotCreateView(APIView):
    """Owner: Create a time slot."""
    permission_classes = [IsAuthenticated, IsOwner]
    swagger_tags = ['Time Slots']

    def post(self, request, court_id):
        try:
            court = FutsalCourt.objects.get(id=court_id, owner=request.user)
            serializer = TimeSlotSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(court=court)
                return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_201_CREATED)
            return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        except FutsalCourt.DoesNotExist:
            return api_response(is_success=False, error_message="Court not found", status_code=status.HTTP_404_NOT_FOUND)

class TimeSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    lookup_url_kwarg = 'slot_id'
    swagger_tags = ['Time Slots']

# ── BOOKINGS ────────────────────────────────────────────────────────────────

class BookingCreateView(APIView):
    """User: Create a new booking."""
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Bookings']

    def post(self, request):
        serializer = BookingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            booking = serializer.save()
            return api_response(is_success=True, result=BookingSerializer(booking).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class UserBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Bookings']

    def get_queryset(self):
        user = self.request.user
        now = timezone.now()
        
        # ✅ Auto-complete past confirmed bookings
        # 1. Bookings before today
        # 2. Today's bookings where end_time has passed
        Booking.objects.filter(
            user=user,
            status=BookingStatusEnum.CONFIRMED,
            booking_date__lt=now.date()
        ).update(status=BookingStatusEnum.COMPLETED)

        Booking.objects.filter(
            user=user,
            status=BookingStatusEnum.CONFIRMED,
            booking_date=now.date(),
            time_slot__end_time__lt=now.time()
        ).update(status=BookingStatusEnum.COMPLETED)

        return Booking.objects.filter(user=user).order_by('-booking_date', '-id')

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class BookingCancelView(APIView):
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Bookings']

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
            if booking.status in [BookingStatusEnum.CANCELLED, BookingStatusEnum.COMPLETED]:
                return api_response(is_success=False, error_message="Cannot cancel this booking", status_code=status.HTTP_400_BAD_REQUEST)
            
            # ✅ Business Rule: Cannot cancel within 6 hours of the game
            from datetime import datetime
            from django.utils import timezone
            
            booking_datetime = datetime.combine(booking.booking_date, booking.time_slot.start_time)
            # Make timezone aware if settings.USE_TZ is True
            if settings.USE_TZ:
                booking_datetime = timezone.make_aware(booking_datetime)
            
            now = timezone.now()
            diff = booking_datetime - now
            
            if diff.total_seconds() < 6 * 3600:
                return api_response(
                    is_success=False, 
                    error_message="Cancellations are only allowed at least 6 hours before the match.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            booking.status = BookingStatusEnum.CANCELLED
            booking.save()
            return api_response(is_success=True, result="Booking cancelled", status_code=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return api_response(is_success=False, error_message="Booking not found", status_code=status.HTTP_404_NOT_FOUND)

class OwnerBookingListView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]
    swagger_tags = ['Bookings']

    def get(self, request):
        courts = FutsalCourt.objects.filter(owner=request.user)
        now = timezone.now()

        # ✅ Auto-complete past confirmed bookings for owner as well
        Booking.objects.filter(
            court__in=courts,
            status=BookingStatusEnum.CONFIRMED,
            booking_date__lt=now.date()
        ).update(status=BookingStatusEnum.COMPLETED)

        Booking.objects.filter(
            court__in=courts,
            status=BookingStatusEnum.CONFIRMED,
            booking_date=now.date(),
            time_slot__end_time__lt=now.time()
        ).update(status=BookingStatusEnum.COMPLETED)

        bookings = Booking.objects.filter(court__in=courts).order_by('-booking_date', '-id')
        serializer = BookingSerializer(bookings, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class WalkinBookingView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]
    swagger_tags = ['Bookings']

    def post(self, request):
        serializer = WalkinBookingSerializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save()
            return api_response(
                is_success=True, 
                result=BookingSerializer(booking, context={'request': request}).data, 
                status_code=status.HTTP_201_CREATED
            )
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

# ── WEEKLY BOOKINGS ─────────────────────────────────────────────────────────

class WeeklyBookingCreateView(APIView):
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Weekly Bookings']

    def post(self, request):
        serializer = WeeklyBookingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            wb = serializer.save()
            return api_response(is_success=True, result=WeeklyBookingSerializer(wb).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class WeeklyBookingListView(generics.ListAPIView):
    serializer_class = WeeklyBookingSerializer
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Weekly Bookings']

    def get_queryset(self):
        if self.request.user.role == RoleEnum.OWNER:
            return WeeklyBooking.objects.filter(court__owner=self.request.user)
        return WeeklyBooking.objects.filter(user=self.request.user)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class WeeklyBookingCancelView(APIView):
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Weekly Bookings']

    def post(self, request, booking_id):
        try:
            wb = WeeklyBooking.objects.get(id=booking_id, user=request.user)
            wb.is_active = False
            wb.status = BookingStatusEnum.CANCELLED
            wb.save()
            return api_response(is_success=True, result="Weekly booking deactivated", status_code=status.HTTP_200_OK)
        except WeeklyBooking.DoesNotExist:
            return api_response(is_success=False, error_message="Weekly booking not found", status_code=status.HTTP_404_NOT_FOUND)

# ── TOURNAMENTS ─────────────────────────────────────────────────────────────

class TournamentListView(generics.ListAPIView):
    queryset = Tournament.objects.all().order_by('-created_at')
    serializer_class = TournamentSerializer
    permission_classes = [AllowAny]
    swagger_tags = ['Tournaments']

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        now_date = timezone.localdate()
        now_dt = timezone.now()

        # ✅ Auto-update states based on dates
        # 1. Upcoming -> Ongoing
        queryset.filter(
            state=TournamentStateEnum.UPCOMING,
            start_date__lte=now_date,
            end_date__gte=now_date
        ).update(state=TournamentStateEnum.ONGOING)

        # 2. Upcoming/Ongoing -> History
        queryset.filter(
            state__in=[TournamentStateEnum.UPCOMING, TournamentStateEnum.ONGOING],
            end_date__lt=now_date
        ).update(state=TournamentStateEnum.HISTORY)

        # ✅ Auto-close registration if deadline passed
        queryset.filter(
            status=TournamentStatusEnum.OPEN,
            registration_deadline__lt=now_dt
        ).update(status=TournamentStatusEnum.CLOSED)

        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class TournamentCreateView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]
    swagger_tags = ['Tournaments']

    def post(self, request):
        serializer = TournamentCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            tournament = serializer.save()
            return api_response(is_success=True, result=TournamentSerializer(tournament, context={'request': request}).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class TournamentDetailView(generics.RetrieveAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'tournament_id'
    swagger_tags = ['Tournaments']

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        now_date = timezone.localdate()
        now_dt = timezone.now()

        # ✅ Auto-update state/status for this specific tournament
        updated = False
        if instance.state == TournamentStateEnum.UPCOMING and instance.start_date and instance.end_date and instance.start_date <= now_date <= instance.end_date:
            instance.state = TournamentStateEnum.ONGOING
            updated = True
        
        if instance.state in [TournamentStateEnum.UPCOMING, TournamentStateEnum.ONGOING] and instance.end_date and instance.end_date < now_date:
            instance.state = TournamentStateEnum.HISTORY
            updated = True

        if instance.status == TournamentStatusEnum.OPEN and instance.registration_deadline and instance.registration_deadline < now_dt:
            instance.status = TournamentStatusEnum.CLOSED
            updated = True

        if updated:
            instance.save()

        serializer = self.get_serializer(instance, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class TournamentUpdateView(generics.UpdateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentCreateSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    lookup_url_kwarg = 'tournament_id'
    swagger_tags = ['Tournaments']

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class TournamentDeleteView(generics.DestroyAPIView):
    queryset = Tournament.objects.all()
    permission_classes = [IsAuthenticated, IsOwner]
    lookup_url_kwarg = 'tournament_id'
    swagger_tags = ['Tournaments']
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return api_response(is_success=True, result="Tournament deleted successfully", status_code=status.HTTP_200_OK)

class TournamentRegistrationCancelView(APIView):
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Tournaments']

    def post(self, request, registration_id):
        try:
            from futsal.models import TournamentRegistration, BookingStatusEnum
            from django.utils import timezone
            reg = TournamentRegistration.objects.get(id=registration_id, user=request.user)
            
            if reg.status in [BookingStatusEnum.CANCELLED, BookingStatusEnum.COMPLETED]:
                return api_response(is_success=False, error_message="This registration cannot be cancelled.", status_code=status.HTTP_400_BAD_REQUEST)
                
            # Rule: Cannot cancel if registration deadline has passed
            if reg.tournament.registration_deadline and timezone.now() > reg.tournament.registration_deadline:
                return api_response(is_success=False, error_message="Cancellations are not permitted after the tournament registration deadline.", status_code=status.HTTP_400_BAD_REQUEST)
                
            reg.status = BookingStatusEnum.CANCELLED
            reg.save()
            
            # Optionally update tournament team count? The @property 'registered_teams' actually counts active registrations so it auto-updates!
            return api_response(is_success=True, result="Registration cancelled successfully.", status_code=status.HTTP_200_OK)
        except TournamentRegistration.DoesNotExist:
            return api_response(is_success=False, error_message="Registration not found.", status_code=status.HTTP_404_NOT_FOUND)

class TournamentRegisterView(APIView):
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Tournaments']

    def post(self, request):
        tournament_id = request.data.get('tournament')
        try:
            from futsal.models import TournamentRegistration, BookingStatusEnum
            existing = TournamentRegistration.objects.filter(
                tournament_id=tournament_id, 
                user=request.user,
                status=BookingStatusEnum.PENDING
            ).first()
            if existing:
                # Optionally update details
                existing.team_name = request.data.get('team_name', existing.team_name)
                existing.contact_phone = request.data.get('contact_phone', existing.contact_phone)
                existing.player_names = request.data.get('player_names', existing.player_names)
                existing.save()
                return api_response(is_success=True, result=TournamentRegistrationSerializer(existing).data, status_code=status.HTTP_200_OK)
        except Exception:
            pass

        serializer = TournamentRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            reg = serializer.save()
            return api_response(is_success=True, result=TournamentRegistrationSerializer(reg).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class UserTournamentRegistrationsView(generics.ListAPIView):
    serializer_class = TournamentRegistrationSerializer
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Tournaments']

    def get_queryset(self):
        user = self.request.user
        now = timezone.now()

        # ✅ Auto-complete past tournament registrations
        # Use end_date if available, otherwise start_date
        from django.db.models import Q
        TournamentRegistration.objects.filter(
            user=user,
            status=BookingStatusEnum.CONFIRMED
        ).filter(
            Q(tournament__end_date__lt=now.date()) | 
            Q(tournament__end_date__isnull=True, tournament__start_date__lt=now.date())
        ).update(status=BookingStatusEnum.COMPLETED)

        return TournamentRegistration.objects.filter(user=user).order_by('-id')

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class TournamentRegistrationsAdminView(generics.ListAPIView):
    serializer_class = TournamentRegistrationSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    swagger_tags = ['Tournaments']

    def get_queryset(self):
        tournament_id = self.kwargs.get('tournament_id')
        return TournamentRegistration.objects.filter(tournament_id=tournament_id)

class OwnerTournamentListView(generics.ListAPIView):
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    swagger_tags = ['Tournaments']

    def get_queryset(self):
        return Tournament.objects.filter(owner=self.request.user)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        now_date = timezone.localdate()
        now_dt = timezone.now()

        # ✅ Auto-update state/status for owner view
        queryset.filter(
            state=TournamentStateEnum.UPCOMING,
            start_date__lte=now_date,
            end_date__gte=now_date
        ).update(state=TournamentStateEnum.ONGOING)

        queryset.filter(
            state__in=[TournamentStateEnum.UPCOMING, TournamentStateEnum.ONGOING],
            end_date__lt=now_date
        ).update(state=TournamentStateEnum.HISTORY)

        queryset.filter(
            status=TournamentStatusEnum.OPEN,
            registration_deadline__lt=now_dt
        ).update(status=TournamentStatusEnum.CLOSED)

        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

# ── REVIEWS ─────────────────────────────────────────────────────────────────

class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Reviews']

    def post(self, request):
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            review = serializer.save()
            return api_response(is_success=True, result=ReviewSerializer(review).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class ReviewUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'review_id'
    swagger_tags = ['Reviews']

class CourtReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    swagger_tags = ['Reviews']

    def get_queryset(self):
        return Review.objects.filter(court_id=self.kwargs.get('court_id'))

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(is_success=True, result={"reviews": serializer.data}, status_code=status.HTTP_200_OK)

# ── KHALTI PAYMENT ──────────────────────────────────────────────────────────

class KhaltiInitiateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Payment']

    @swagger_auto_schema(request_body=KhaltiInitSerializer, tags=["Payment"])
    def post(self, request):
        print("KHALTI INITIATE REQUEST RECEIVED:", request.data)
        serializer = KhaltiInitSerializer(data=request.data)
        if not serializer.is_valid():
            print("KHALTI SERIALIZER ERRORS:", serializer.errors)
            return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        booking_id = serializer.validated_data.get('booking_id')
        registration_id = serializer.validated_data.get('registration_id')
        weekly_booking_id = serializer.validated_data.get('weekly_booking_id')
        
        target_obj = None
        amount = 0
        order_name = ""
        order_id = ""

        try:
            if booking_id:
                target_obj = Booking.objects.get(pk=booking_id, user=request.user)
                amount = target_obj.total_amount or 0
                order_name = f"Booking at {target_obj.court.name}"
                order_id = f"BK-{target_obj.id}"
                payment, _ = Payment.objects.update_or_create(
                    booking=target_obj,
                    defaults={'amount': amount, 'payment_method': 'khalti'}
                )
            elif registration_id:
                target_obj = TournamentRegistration.objects.get(pk=registration_id, user=request.user)
                amount = parse_khalti_amount(target_obj.tournament.entry_fee)
                order_name = f"Tournament: {target_obj.tournament.title}"
                order_id = f"REG-{target_obj.id}"
                payment, _ = Payment.objects.update_or_create(
                    tournament_registration=target_obj,
                    defaults={'amount': amount, 'payment_method': 'khalti'}
                )
            elif weekly_booking_id:
                target_obj = WeeklyBooking.objects.get(pk=weekly_booking_id, user=request.user)
                from datetime import datetime, date as date_type
                from decimal import Decimal
                start = datetime.combine(date_type.today(), target_obj.time_slot.start_time)
                end = datetime.combine(date_type.today(), target_obj.time_slot.end_time)
                hours = (end - start).seconds / 3600
                amount = round(Decimal(str(hours)) * target_obj.court.price_per_hour * 4, 2)
                order_name = f"Weekly Booking at {target_obj.court.name}"
                order_id = f"WB-{target_obj.id}"
                payment, _ = Payment.objects.update_or_create(
                    weekly_booking=target_obj,
                    defaults={'amount': amount, 'payment_method': 'khalti'}
                )
            else:
                return api_response(is_success=False, error_message="No target object provided.", status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"KHALTI SETUP ERROR: {str(e)}")
            return api_response(is_success=False, error_message=f"Setup error: {str(e)}", status_code=status.HTTP_400_BAD_REQUEST)

        if payment.status == PaymentStatusEnum.SUCCESS:
            return api_response(is_success=False, error_message="Payment already completed.", status_code=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            print(f"KHALTI ERROR: Amount is {amount}")
            return api_response(is_success=False, error_message="Amount must be greater than zero.", status_code=status.HTTP_400_BAD_REQUEST)

        khalti_payload = {
            "return_url": settings.KHALTI_RETURN_URL,
            "website_url": settings.KHALTI_WEBSITE_URL,
            "amount": int(amount * 100),
            "purchase_order_id": order_id,
            "purchase_order_name": order_name,
            "customer_info": {
                "name": request.user.email,
                "email": request.user.email,
                "phone": request.user.phone_number if (request.user.phone_number and len(request.user.phone_number) >= 10) else "9800000000",
            },
        }

        headers = {"Authorization": f"Key {settings.KHALTI_SECRET_KEY}", "Content-Type": "application/json"}

        try:
            print(f"KHALTI PAYLOAD: {khalti_payload}")
            response = requests.post(KHALTI_INITIATE_URL, json=khalti_payload, headers=headers)
            resp_data = response.json()
            print("KHALTI API RESPONSE:", resp_data)

            if response.status_code == 200:
                payment.pidx = resp_data.get('pidx')
                payment.save()
                return api_response(is_success=True, result={"payment_url": resp_data.get('payment_url'), "pidx": resp_data.get('pidx'), "order_id": order_id}, status_code=status.HTTP_200_OK)
            return api_response(is_success=False, error_message=resp_data, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"KHALTI REQUEST ERROR: {str(e)}")
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class KhaltiVerifyView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Payment']

    @swagger_auto_schema(request_body=KhaltiVerifySerializer, tags=["Payment"])
    def post(self, request):
        serializer = KhaltiVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        pidx = serializer.validated_data['pidx']
        booking_id = serializer.validated_data.get('booking_id')
        registration_id = serializer.validated_data.get('registration_id')
        weekly_booking_id = serializer.validated_data.get('weekly_booking_id')

        try:
            if booking_id: payment = Payment.objects.get(pidx=pidx, booking__id=booking_id)
            elif registration_id: payment = Payment.objects.get(pidx=pidx, tournament_registration__id=registration_id)
            elif weekly_booking_id: payment = Payment.objects.get(pidx=pidx, weekly_booking__id=weekly_booking_id)
            else: return api_response(is_success=False, error_message="Missing ID.", status_code=status.HTTP_400_BAD_REQUEST)
        except Payment.DoesNotExist:
            return api_response(is_success=False, error_message="Payment record not found.", status_code=status.HTTP_404_NOT_FOUND)

        headers = {"Authorization": f"Key {settings.KHALTI_SECRET_KEY}", "Content-Type": "application/json"}

        try:
            response = requests.post(KHALTI_LOOKUP_URL, json={"pidx": pidx}, headers=headers)
            resp_data = response.json()
            if response.status_code == 200 and resp_data.get('status') == 'Completed':
                payment.status = PaymentStatusEnum.SUCCESS
                payment.transaction_id = resp_data.get('transaction_id')
                payment.paid_at = timezone.now()
                payment.save()

                # Confirm the target object
                if payment.booking:
                    # ✅ Final check: Is it still available? (exclude self)
                    conflict = Booking.objects.filter(
                        court=payment.booking.court,
                        time_slot=payment.booking.time_slot,
                        booking_date=payment.booking.booking_date,
                        status__in=[BookingStatusEnum.CONFIRMED, BookingStatusEnum.COMPLETED]
                    ).exclude(pk=payment.booking.id)

                    if conflict.exists():
                        print("CONFLICT DETECTED AFTER PAYMENT")
                        payment.status = PaymentStatusEnum.FAILED
                        payment.save()
                        # Keep booking as pending or mark as cancelled-conflict
                        return api_response(is_success=False, error_message="This slot was booked by someone else while you were paying. Please contact support for a refund.", status_code=status.HTTP_409_CONFLICT)

                    payment.booking.status = BookingStatusEnum.CONFIRMED
                    payment.booking.save()
                elif payment.tournament_registration:
                    payment.tournament_registration.status = BookingStatusEnum.CONFIRMED
                    payment.tournament_registration.save()
                elif payment.weekly_booking:
                    payment.weekly_booking.status = BookingStatusEnum.CONFIRMED
                    payment.weekly_booking.save()

                return api_response(is_success=True, result="Payment verified and booking confirmed", status_code=status.HTTP_200_OK)
            return api_response(is_success=False, error_message="Verification failed.", status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"KHALTI VERIFY ERROR: {str(e)}")
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
