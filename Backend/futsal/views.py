from django.utils import timezone
from django.conf import settings
from django.db.models import Count, Avg, Q
from decimal import Decimal
import hmac
import hashlib
import base64

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
    WalkinBookingSerializer, ReviewSerializer,
    WeeklyBookingSerializer, TournamentSerializer,
    TournamentCreateSerializer, TournamentRegistrationSerializer
)
from futsal.permissions import IsOwner, IsOwnerOfCourt
from PitchPal.utils import api_response
from accounts.models import RoleEnum

import hmac
import hashlib
import base64

ESEWA_INITIATE_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
ESEWA_STATUS_URL = "https://rc-epay.esewa.com.np/api/epay/transaction/status/"

def generate_esewa_signature(secret_key, message):
    # This function creates a unique digital signature for eSewa using HMAC-SHA256.
    # We combine the secret key and the message, hash them, and then convert to Base64 
    # so eSewa can verify the request came from our system.
    key = secret_key.encode('utf-8')
    msg = message.encode('utf-8')
    hmac_sha256 = hmac.new(key, msg, hashlib.sha256)
    digest = hmac_sha256.digest()
    return base64.b64encode(digest).decode('utf-8')

def parse_amount(amount):
    if amount is None: return 0
    if isinstance(amount, (int, float, Decimal)): return float(amount)
    
    # Handle string cases like "Rs 500" or "500.00"
    clean_str = str(amount).replace('Rs', '').replace('Rs.', '').replace(',', '').strip()
    try: return float(clean_str)
    except: return 0



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



class CourtTimeSlotsView(APIView):
    """Public: View all slots for a specific court, marked if booked for a specific date."""
    permission_classes = [AllowAny]
    swagger_tags = ['Time Slots']

    def get(self, request, court_id):
        booking_date_str = request.query_params.get('date')
        
        slots = TimeSlot.objects.filter(court_id=court_id).order_by('start_time')
        
        # We need to find out which slots are already taken so the user can't book them again.
        if booking_date_str:
            try:
                from datetime import datetime
                booking_date = datetime.strptime(booking_date_str, '%Y-%m-%d').date()
                
                confirmed_bookings = Booking.objects.filter(
                    court_id=court_id,
                    booking_date=booking_date,
                    status__in=[BookingStatusEnum.CONFIRMED, BookingStatusEnum.COMPLETED]
                )
                
                from datetime import timedelta
                lock_time = timezone.now() - timedelta(minutes=5)
                
                pending_bookings = Booking.objects.filter(
                    court_id=court_id,
                    booking_date=booking_date,
                    status=BookingStatusEnum.PENDING,
                    created_at__gte=lock_time
                )
                
                weekly_bookings = WeeklyBooking.objects.filter(
                    court_id=court_id,
                    status=BookingStatusEnum.CONFIRMED,
                    is_active=True,
                    start_date__lte=booking_date
                ).filter(
                    Q(end_date__isnull=True) | Q(end_date__gte=booking_date)
                )

                # Filter which ones match the requested weekday
                weekday = booking_date.weekday() # 0 = Monday
                matching_weekly_slot_ids = []
                for wb in weekly_bookings:
                    if wb.start_date.weekday() == weekday:
                        matching_weekly_slot_ids.append(wb.time_slot_id)
                
                booked_slot_ids = list(confirmed_bookings.values_list('time_slot_id', flat=True))
                pending_slot_ids = list(pending_bookings.values_list('time_slot_id', flat=True))
                
                # We combine confirmed bookings, pending ones that haven't expired, and weekly recurring matches
                # to show a master list of "unavailable" slots to the frontend.
                booked_slot_ids = list(set(booked_slot_ids + pending_slot_ids + matching_weekly_slot_ids))
                
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
        
        # Auto-complete past confirmed bookings
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
            
            # Cannot cancel within 6 hours of the game
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

        # Auto-complete past confirmed bookings
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
        # This part automatically moves tournaments between 'Upcoming', 'Ongoing', and 'History'
        # states based on today's date so the owner doesn't have to do it manually.
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



class EsewaInitiateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Payment']

    def post(self, request):
        booking_id = request.data.get('booking_id')
        registration_id = request.data.get('registration_id')
        weekly_booking_id = request.data.get('weekly_booking_id')
        
        target_obj = None
        amount = 0
        transaction_uuid = ""

        try:
            if booking_id:
                target_obj = Booking.objects.get(pk=booking_id, user=request.user)
                amount = target_obj.total_amount or 0
                transaction_uuid = f"BK_{target_obj.id}_{int(timezone.now().timestamp())}"
                payment, _ = Payment.objects.update_or_create(
                    booking=target_obj,
                    defaults={'amount': amount, 'payment_method': 'esewa'}
                )
            elif registration_id:
                target_obj = TournamentRegistration.objects.get(pk=registration_id, user=request.user)
                amount = parse_amount(target_obj.tournament.entry_fee)
                transaction_uuid = f"REG_{target_obj.id}_{int(timezone.now().timestamp())}"
                payment, _ = Payment.objects.update_or_create(
                    tournament_registration=target_obj,
                    defaults={'amount': amount, 'payment_method': 'esewa'}
                )
            elif weekly_booking_id:
                target_obj = WeeklyBooking.objects.get(pk=weekly_booking_id, user=request.user)
                from datetime import datetime, date as date_type, timedelta
                start_dt = datetime.combine(date_type.today(), target_obj.time_slot.start_time)
                end_dt = datetime.combine(date_type.today(), target_obj.time_slot.end_time)
                duration = end_dt - start_dt
                if duration.total_seconds() < 0: duration += timedelta(days=1)
                hours = duration.total_seconds() / 3600
                amount = round(Decimal(str(hours)) * target_obj.court.price_per_hour * 4, 2)
                transaction_uuid = f"WB_{target_obj.id}_{int(timezone.now().timestamp())}"
                payment, _ = Payment.objects.update_or_create(
                    weekly_booking=target_obj,
                    defaults={'amount': amount, 'payment_method': 'esewa'}
                )
            else:
                return api_response(is_success=False, error_message="No target object provided.", status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_response(is_success=False, error_message=f"Setup error: {str(e)}", status_code=status.HTTP_400_BAD_REQUEST)

        # We format the amount as a string with one decimal (e.g., 500.0) as required by eSewa v2.
        # Then we create a message string to sign, ensuring it matches eSewa's expected format exactly.
        amount_val = float(amount)
        amount_str = "{:.1f}".format(amount_val)

        # Initiation signature string format: total_amount=...,transaction_uuid=...,product_code=...
        message = f"total_amount={amount_str},transaction_uuid={transaction_uuid},product_code={settings.ESEWA_PRODUCT_CODE}"
        signature = generate_esewa_signature(settings.ESEWA_SECRET_KEY, message)

        payload = {
            "amount": amount_str,
            "tax_amount": "0",
            "total_amount": amount_str,
            "transaction_uuid": transaction_uuid,
            "product_code": settings.ESEWA_PRODUCT_CODE,
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": settings.ESEWA_SUCCESS_URL,
            "failure_url": settings.ESEWA_FAILURE_URL,
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature,
        }

        return api_response(is_success=True, result=payload, status_code=status.HTTP_200_OK)


class EsewaVerifyView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    swagger_tags = ['Payment']

    def post(self, request):
        encoded_data = request.data.get('data')
        if not encoded_data:
            return api_response(is_success=False, error_message="No data provided.", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode Base64 data
            import json
            decoded_bytes = base64.b64decode(encoded_data)
            decoded_data = json.loads(decoded_bytes.decode('utf-8'))
            print("ESEWA DECODED DATA:", decoded_data)
            
            transaction_uuid = decoded_data.get('transaction_uuid')
            status_str = decoded_data.get('status')
            total_amount = decoded_data.get('total_amount')
            signature = decoded_data.get('signature')

            # Security Check: We recalculate the signature from the data eSewa sent back.
            # If our calculated signature matches the one eSewa sent, we know the data is genuine.
            # signed_field_names: transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names
            message = f"transaction_code={decoded_data.get('transaction_code')},status={status_str},total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={decoded_data.get('product_code')},signed_field_names={decoded_data.get('signed_field_names')}"
            expected_signature = generate_esewa_signature(settings.ESEWA_SECRET_KEY, message)

            if signature != expected_signature:
                print("ESEWA SIGNATURE MISMATCH")
                return api_response(is_success=False, error_message="Signature mismatch.", status_code=status.HTTP_400_BAD_REQUEST)

            if status_str != 'COMPLETE':
                return api_response(is_success=False, error_message=f"Payment status: {status_str}", status_code=status.HTTP_400_BAD_REQUEST)

            # Our transaction UUID looks like "BK_12_1713500000" (Prefix_ID_Timestamp).
            # We split it to find out if it was a regular Booking, Tournament, or Weekly payment.
            parts = transaction_uuid.split("_")
            if len(parts) < 2:
                return api_response(is_success=False, error_message="Invalid transaction UUID format.", status_code=status.HTTP_400_BAD_REQUEST)
                
            prefix = parts[0]
            target_id = parts[1]

            payment = None
            if prefix == "BK":
                payment = Payment.objects.get(booking__id=target_id)
            elif prefix == "REG":
                payment = Payment.objects.get(tournament_registration__id=target_id)
            elif prefix == "WB":
                payment = Payment.objects.get(weekly_booking__id=target_id)

            if not payment:
                return api_response(is_success=False, error_message="Payment record not found.", status_code=status.HTTP_404_NOT_FOUND)

            # All good!
            payment.status = PaymentStatusEnum.SUCCESS
            payment.transaction_id = decoded_data.get('transaction_code')
            payment.paid_at = timezone.now()
            payment.save()

            if payment.booking:
                payment.booking.status = BookingStatusEnum.CONFIRMED
                payment.booking.save()
            elif payment.tournament_registration:
                payment.tournament_registration.status = BookingStatusEnum.CONFIRMED
                payment.tournament_registration.save()
            elif payment.weekly_booking:
                payment.weekly_booking.status = BookingStatusEnum.CONFIRMED
                payment.weekly_booking.save()

            return api_response(is_success=True, result="Payment verified successfully", status_code=status.HTTP_200_OK)

        except Exception as e:
            print(f"ESEWA VERIFY ERROR: {str(e)}")
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
