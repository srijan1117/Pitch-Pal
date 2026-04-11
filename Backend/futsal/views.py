import requests
from django.utils import timezone
from django.conf import settings

from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from futsal.models import FutsalCourt, TimeSlot, Booking, Payment, BookingStatusEnum, PaymentStatusEnum
from futsal.serializers import (
    FutsalCourtSerializer, FutsalCourtCreateSerializer,
    TimeSlotSerializer, BookingSerializer,
    KhaltiInitSerializer, KhaltiVerifySerializer,
    WalkinBookingSerializer
)
from futsal.permissions import IsOwner, IsOwnerOfCourt
from PitchPal.utils import api_response

from rest_framework.parsers import MultiPartParser, FormParser
from futsal.models import Review
from futsal.serializers import ReviewSerializer
from futsal.models import WeeklyBooking
from futsal.serializers import WeeklyBookingSerializer
from futsal.models import CourtImage
from futsal.models import Tournament, TournamentRegistration
from futsal.serializers import TournamentSerializer, TournamentCreateSerializer, TournamentRegistrationSerializer

# ─────────────────────────────────────────────
# COURT VIEWS
# ─────────────────────────────────────────────

class CourtListView(generics.ListAPIView):
    """Public: list all active courts."""
    serializer_class = FutsalCourtSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def get_queryset(self):
        return FutsalCourt.objects.filter(is_active=True).prefetch_related('time_slots')

    @swagger_auto_schema(
        operation_description="List all active futsal courts.",
        tags=["Courts"]
    )
    def get(self, request, *args, **kwargs):
        try:
            qs = self.get_queryset()
            serializer = FutsalCourtSerializer(qs, many=True, context={'request': request})
            return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)
        except Exception as e:
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CourtCreateView(APIView):
    """Owner only: create a new court."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_description="Create a new futsal court (owner only).",
        request_body=FutsalCourtCreateSerializer,
        tags=["Courts"]
    )
    def post(self, request):
        try:
            serializer = FutsalCourtCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                court = serializer.save()
                return api_response(
                    is_success=True,
                    result=FutsalCourtSerializer(court, context={'request': request}).data,
                    status_code=status.HTTP_201_CREATED
                )
            return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CourtDetailView(APIView):
    """Owner only: retrieve, update, delete own court."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [MultiPartParser, FormParser] 

    def get_object(self, pk, user):
        try:
            court = FutsalCourt.objects.get(pk=pk)
        except FutsalCourt.DoesNotExist:
            return None, "Court not found."
        if court.owner != user:
            return None, "You do not own this court."
        return court, None

    @swagger_auto_schema(operation_description="Get court details.", tags=["Courts"])
    def get(self, request, pk):
        court, error = self.get_object(pk, request.user)
        if error:
            return api_response(is_success=False, error_message=error, status_code=status.HTTP_404_NOT_FOUND)
        return api_response(is_success=True, result=FutsalCourtSerializer(court, context={'request': request}).data, status_code=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Update court details (owner only).",
        request_body=FutsalCourtCreateSerializer,
        tags=["Courts"]
    )
    def put(self, request, pk):
        court, error = self.get_object(pk, request.user)
        if error:
            return api_response(is_success=False, error_message=error, status_code=status.HTTP_404_NOT_FOUND)
        serializer = FutsalCourtCreateSerializer(court, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            court = serializer.save()
            return api_response(is_success=True, result=FutsalCourtSerializer(court, context={'request': request}).data, status_code=status.HTTP_200_OK)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(operation_description="Delete a court (owner only).", tags=["Courts"])
    def delete(self, request, pk):
        court, error = self.get_object(pk, request.user)
        if error:
            return api_response(is_success=False, error_message=error, status_code=status.HTTP_404_NOT_FOUND)
        court.delete()
        return api_response(is_success=True, result={"message": "Court deleted successfully."}, status_code=status.HTTP_200_OK)


class OwnerCourtListView(APIView):
    """Owner: list only their own courts."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]

    @swagger_auto_schema(operation_description="List courts owned by the logged-in owner.", tags=["Courts"])
    def get(self, request):
        courts = FutsalCourt.objects.filter(owner=request.user).prefetch_related('time_slots')
        serializer = FutsalCourtSerializer(courts, many=True, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

# ─────────────────────────────────────────────
# COURT IMAGE VIEWS
# ─────────────────────────────────────────────

class CourtImageUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_description="Upload up to 4 photos for a court.",
        manual_parameters=[
            openapi.Parameter(
                name='images',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description='Upload up to 4 images'
            )
        ],
        consumes=['multipart/form-data'],
        tags=["Courts"]
    )
    def post(self, request, court_id):
        try:
            court = FutsalCourt.objects.get(pk=court_id, owner=request.user)
        except FutsalCourt.DoesNotExist:
            return api_response(is_success=False, error_message="Court not found.", status_code=404)

        images = request.FILES.getlist('images')
        if not images:
            return api_response(is_success=False, error_message="No images provided.", status_code=400)

        existing_count = court.gallery.count()
        remaining = 4 - existing_count

        if remaining <= 0:
            return api_response(
                is_success=False,
                error_message="Maximum 4 photos allowed. Delete some before uploading new ones.",
                status_code=400
            )

        if len(images) > remaining:
            return api_response(
                is_success=False,
                error_message=f"You can only upload {remaining} more photo(s). Court already has {existing_count}/4.",
                status_code=400
            )

        created = []
        for img in images:
            obj = CourtImage.objects.create(court=court, image=img)
            created.append({"id": obj.id, "image": request.build_absolute_uri(obj.image.url)})

        return api_response(is_success=True, result=created, status_code=201)

    @swagger_auto_schema(
        operation_description="Delete a court photo.",
        manual_parameters=[
            openapi.Parameter(
                name='image_id',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_INTEGER,
                required=True,
                description='ID of image to delete'
            )
        ],
        consumes=['multipart/form-data'],
        tags=["Courts"]
    )
    def delete(self, request, court_id):
        try:
            court = FutsalCourt.objects.get(pk=court_id, owner=request.user)
        except FutsalCourt.DoesNotExist:
            return api_response(is_success=False, error_message="Court not found.", status_code=404)

    # Get image_id from query params instead of request body
        image_id = request.query_params.get('image_id')
        if not image_id:
            return api_response(is_success=False, error_message="image_id is required.", status_code=400)

        try:
            image = CourtImage.objects.get(pk=image_id, court=court)
        except CourtImage.DoesNotExist:
            return api_response(is_success=False, error_message="Image not found.", status_code=404)

        image.image.delete(save=False)
        image.delete()
        return api_response(is_success=True, result={"message": "Image deleted."}, status_code=200)
    
# ─────────────────────────────────────────────
# TIME SLOT VIEWS
# ─────────────────────────────────────────────

class TimeSlotCreateView(APIView):
    """Owner only: add a time slot to a court."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]

    @swagger_auto_schema(
        operation_description="Add a time slot to a court (owner only).",
        request_body=TimeSlotSerializer,
        tags=["TimeSlots"]
    )
    def post(self, request, court_id):
        try:
            court = FutsalCourt.objects.get(pk=court_id, owner=request.user)
        except FutsalCourt.DoesNotExist:
            return api_response(is_success=False, error_message="Court not found or not yours.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = TimeSlotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(court=court)
            return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


class TimeSlotDetailView(APIView):
    """Owner only: update or delete a time slot."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]

    def get_slot(self, slot_id, user):
        try:
            slot = TimeSlot.objects.select_related('court').get(pk=slot_id)
        except TimeSlot.DoesNotExist:
            return None, "Time slot not found."
        if slot.court.owner != user:
            return None, "You do not own this court."
        return slot, None

    @swagger_auto_schema(operation_description="Update a time slot.", request_body=TimeSlotSerializer, tags=["TimeSlots"])
    def put(self, request, slot_id):
        slot, error = self.get_slot(slot_id, request.user)
        if error:
            return api_response(is_success=False, error_message=error, status_code=status.HTTP_404_NOT_FOUND)
        serializer = TimeSlotSerializer(slot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(operation_description="Delete a time slot.", tags=["TimeSlots"])
    def delete(self, request, slot_id):
        slot, error = self.get_slot(slot_id, request.user)
        if error:
            return api_response(is_success=False, error_message=error, status_code=status.HTTP_404_NOT_FOUND)
        slot.delete()
        return api_response(is_success=True, result={"message": "Time slot deleted."}, status_code=status.HTTP_200_OK)


class CourtTimeSlotsView(APIView):
    """Public: list time slots for a court on a given date."""
    permission_classes = [AllowAny]
    authentication_classes = []

    @swagger_auto_schema(
        operation_description="List available time slots for a court.",
        manual_parameters=[
            openapi.Parameter('date', openapi.IN_QUERY, description="Date (YYYY-MM-DD)", type=openapi.TYPE_STRING)
        ],
        tags=["TimeSlots"]
    )
    def get(self, request, court_id):
        try:
            court = FutsalCourt.objects.get(pk=court_id, is_active=True)
        except FutsalCourt.DoesNotExist:
            return api_response(is_success=False, error_message="Court not found.", status_code=status.HTTP_404_NOT_FOUND)

        date_str = request.query_params.get('date')
        slots = TimeSlot.objects.filter(court=court, is_available=True)

        if date_str:
            # Mark slots that are already booked on that date
            booked_slot_ids = Booking.objects.filter(
                court=court,
                booking_date=date_str,
            ).exclude(status=BookingStatusEnum.CANCELLED).values_list('time_slot_id', flat=True)
            slots = slots.exclude(id__in=booked_slot_ids)

        serializer = TimeSlotSerializer(slots, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# BOOKING VIEWS
# ─────────────────────────────────────────────

class BookingCreateView(APIView):
    """Authenticated user: create a booking."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Create a new booking.",
        request_body=BookingSerializer,
        tags=["Bookings"]
    )
    def post(self, request):
        serializer = BookingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            booking = serializer.save()
            return api_response(is_success=True, result=BookingSerializer(booking, context={'request': request}).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


class UserBookingListView(APIView):
    """Authenticated user: list their bookings."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(operation_description="List all bookings for the logged-in user.", tags=["Bookings"])
    def get(self, request):
        bookings = Booking.objects.filter(user=request.user).select_related('court', 'time_slot').order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)


class BookingCancelView(APIView):
    """Authenticated user: cancel their booking."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(operation_description="Cancel a booking.", tags=["Bookings"])
    def patch(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return api_response(is_success=False, error_message="Booking not found.", status_code=status.HTTP_404_NOT_FOUND)

        if booking.status in [BookingStatusEnum.CANCELLED, BookingStatusEnum.COMPLETED]:
            return api_response(
                is_success=False,
                error_message=f"Cannot cancel a booking with status '{booking.status}'.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        booking.status = BookingStatusEnum.CANCELLED
        booking.save()
        return api_response(is_success=True, result={"message": "Booking cancelled successfully."}, status_code=status.HTTP_200_OK)


class OwnerBookingListView(APIView):
    """Owner: view all bookings for their courts."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]

    @swagger_auto_schema(operation_description="List all bookings for owner's courts.", tags=["Bookings"])
    def get(self, request):
        courts = FutsalCourt.objects.filter(owner=request.user)
        bookings = Booking.objects.filter(court__in=courts).select_related('court', 'time_slot', 'user').order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)


class WalkinBookingView(APIView):
    """Owner only: create a walk-in booking."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]

    @swagger_auto_schema(
        operation_description="Create a walk-in booking (owner only).",
        request_body=WalkinBookingSerializer,
        tags=["Bookings"]
    )
    def post(self, request):
        serializer = WalkinBookingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            booking = serializer.save()
            return api_response(
                is_success=True, 
                result=BookingSerializer(booking).data, 
                status_code=status.HTTP_201_CREATED
            )
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)



class ReviewCreateView(APIView):
    """Authenticated user: submit a review for a completed booking."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
 
    @swagger_auto_schema(
        operation_description="Submit a star rating and comment for a court. Only allowed after a completed booking.",
        request_body=ReviewSerializer,
        tags=["Reviews"]
    )
    def post(self, request):
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            review = serializer.save()
            return api_response(is_success=True, result=ReviewSerializer(review).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
 
 
class ReviewUpdateDeleteView(APIView):
    """Authenticated user: update or delete their own review."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
 
    def get_review(self, review_id, user):
        try:
            review = Review.objects.get(pk=review_id, user=user)
            return review, None
        except Review.DoesNotExist:
            return None, "Review not found or not yours."
 
    @swagger_auto_schema(
        operation_description="Update your review.",
        request_body=ReviewSerializer,
        tags=["Reviews"]
    )
    def put(self, request, review_id):
        review, error = self.get_review(review_id, request.user)
        if error:
            return api_response(is_success=False, error_message=error, status_code=status.HTTP_404_NOT_FOUND)
        serializer = ReviewSerializer(review, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
 
    @swagger_auto_schema(operation_description="Delete your review.", tags=["Reviews"])
    def delete(self, request, review_id):
        review, error = self.get_review(review_id, request.user)
        if error:
            return api_response(is_success=False, error_message=error, status_code=status.HTTP_404_NOT_FOUND)
        review.delete()
        return api_response(is_success=True, result={"message": "Review deleted."}, status_code=status.HTTP_200_OK)
 
 
class CourtReviewListView(APIView):
    """Public: list all reviews for a court."""
    permission_classes = [AllowAny]
    authentication_classes = []
 
    @swagger_auto_schema(operation_description="List all reviews for a court.", tags=["Reviews"])
    def get(self, request, court_id):
        try:
            court = FutsalCourt.objects.get(pk=court_id, is_active=True)
        except FutsalCourt.DoesNotExist:
            return api_response(is_success=False, error_message="Court not found.", status_code=status.HTTP_404_NOT_FOUND)
 
        reviews = Review.objects.filter(court=court).select_related('user').order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return api_response(
            is_success=True,
            result={
                "average_rating": court.average_rating,
                "total_reviews": court.total_reviews,
                "reviews": serializer.data
            },
            status_code=status.HTTP_200_OK
        )
class WeeklyBookingCreateView(APIView):
    """User: create a weekly recurring booking."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Create a weekly recurring booking.",
        request_body=WeeklyBookingSerializer,
        tags=["Bookings"]
    )
    def post(self, request):
        serializer = WeeklyBookingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            weekly = serializer.save()
            return api_response(is_success=True, result=WeeklyBookingSerializer(weekly).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


class WeeklyBookingListView(APIView):
    """User: list their weekly bookings."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(operation_description="List all weekly bookings for the logged-in user.", tags=["Bookings"])
    def get(self, request):
        bookings = WeeklyBooking.objects.filter(user=request.user, is_active=True).select_related('court', 'time_slot')
        serializer = WeeklyBookingSerializer(bookings, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)


class WeeklyBookingCancelView(APIView):
    """User: cancel a weekly booking."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(operation_description="Cancel a weekly booking.", tags=["Bookings"])
    def patch(self, request, booking_id):
        try:
            booking = WeeklyBooking.objects.get(pk=booking_id, user=request.user)
        except WeeklyBooking.DoesNotExist:
            return api_response(is_success=False, error_message="Weekly booking not found.", status_code=status.HTTP_404_NOT_FOUND)
        booking.is_active = False
        booking.save()
        return api_response(is_success=True, result={"message": "Weekly booking cancelled."}, status_code=status.HTTP_200_OK)
    

# ─────────────────────────────────────────────
# TOURNAMENT VIEWS
# ─────────────────────────────────────────────
 
class TournamentListView(APIView):
    """Public: list all tournaments."""
    permission_classes = [AllowAny]
    authentication_classes = []
 
    @swagger_auto_schema(operation_description="List all tournaments.", tags=["Tournaments"])
    def get(self, request):
        tournaments = Tournament.objects.all().order_by('-created_at')
        serializer = TournamentSerializer(tournaments, many=True, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)
 
 
class TournamentDetailView(APIView):
    """Public: get a single tournament."""
    permission_classes = [AllowAny]
    authentication_classes = []
 
    @swagger_auto_schema(operation_description="Get tournament details.", tags=["Tournaments"])
    def get(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            return api_response(is_success=False, error_message="Tournament not found.", status_code=status.HTTP_404_NOT_FOUND)
        serializer = TournamentSerializer(tournament, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)
 
 
class TournamentCreateView(APIView):
    """Admin/Superuser only: create a tournament."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
 
    @swagger_auto_schema(
        operation_description="Create a tournament (admin only).",
        request_body=TournamentCreateSerializer,
        tags=["Tournaments"]
    )
    def post(self, request):
        if request.user.role not in ['admin', 'owner','superuser']:
            return api_response(is_success=False, error_message="Only admins and owners can create tournaments.", status_code=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        # Automatically set organizer for owners
        if request.user.role == 'owner':
            data['organizer'] = request.user.email

        serializer = TournamentCreateSerializer(data=data)
        if serializer.is_valid():
            tournament = serializer.save()
            return api_response(is_success=True, result=TournamentSerializer(tournament, context={'request': request}).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
 
 
class TournamentUpdateView(APIView):
    """Admin/Superuser only: update a tournament."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
 
    @swagger_auto_schema(
        operation_description="Update a tournament (admin only).",
        request_body=TournamentCreateSerializer,
        tags=["Tournaments"]
    )
    def put(self, request, tournament_id):
        if request.user.role not in ['admin', 'superuser', 'owner']:
            return api_response(is_success=False, error_message="Only admins and owners can update tournaments.", status_code=status.HTTP_403_FORBIDDEN)
        
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            return api_response(is_success=False, error_message="Tournament not found.", status_code=status.HTTP_404_NOT_FOUND)
        
        # Ownership check for owners
        if request.user.role == 'owner' and tournament.organizer != request.user.email:
            return api_response(is_success=False, error_message="You do not have permission to edit this tournament.", status_code=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        if request.user.role == 'owner':
            data['organizer'] = request.user.email

        serializer = TournamentCreateSerializer(tournament, data=data, partial=True)
        if serializer.is_valid():
            tournament = serializer.save()
            return api_response(is_success=True, result=TournamentSerializer(tournament, context={'request': request}).data, status_code=status.HTTP_200_OK)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
 
 
class TournamentDeleteView(APIView):
    """Admin/Superuser only: delete a tournament."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
 
    @swagger_auto_schema(operation_description="Delete a tournament (admin only).", tags=["Tournaments"])
    def delete(self, request, tournament_id):
        if request.user.role not in ['admin', 'superuser', 'owner']:
            return api_response(is_success=False, error_message="Only admins and owners can delete tournaments.", status_code=status.HTTP_403_FORBIDDEN)
        
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            return api_response(is_success=False, error_message="Tournament not found.", status_code=status.HTTP_404_NOT_FOUND)
            
        # Ownership check for owners
        if request.user.role == 'owner' and tournament.organizer != request.user.email:
            return api_response(is_success=False, error_message="You do not have permission to delete this tournament.", status_code=status.HTTP_403_FORBIDDEN)

        tournament.delete()
        return api_response(is_success=True, result={"message": "Tournament deleted."}, status_code=status.HTTP_200_OK)
 
 
class TournamentRegisterView(APIView):
    """Authenticated user: register for a tournament."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
 
    @swagger_auto_schema(
        operation_description="Register a team for a tournament.",
        request_body=TournamentRegistrationSerializer,
        tags=["Tournaments"]
    )
    def post(self, request):
        serializer = TournamentRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            registration = serializer.save()
            return api_response(is_success=True, result=TournamentRegistrationSerializer(registration).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
 
 
class UserTournamentRegistrationsView(APIView):
    """Authenticated user: list their tournament registrations."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
 
    @swagger_auto_schema(operation_description="List user's tournament registrations.", tags=["Tournaments"])
    def get(self, request):
        registrations = TournamentRegistration.objects.filter(user=request.user).select_related('tournament')
        serializer = TournamentRegistrationSerializer(registrations, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)
 
 
class TournamentRegistrationsAdminView(APIView):
    """Admin: list all registrations for a tournament."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
 
    @swagger_auto_schema(operation_description="List all registrations for a tournament (admin only).", tags=["Tournaments"])
    def get(self, request, tournament_id):
        if request.user.role not in ['admin', 'superuser', 'owner']:
            return api_response(is_success=False, error_message="Only admins and owners can create tournaments.", status_code=status.HTTP_403_FORBIDDEN)
        registrations = TournamentRegistration.objects.filter(tournament_id=tournament_id).select_related('user')
        serializer = TournamentRegistrationSerializer(registrations, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

class OwnerTournamentListView(APIView):
    """Owner: list only their own tournaments."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]

    @swagger_auto_schema(operation_description="List tournaments organized by the logged-in owner.", tags=["Tournaments"])
    def get(self, request):
        tournaments = Tournament.objects.filter(organizer=request.user.email).order_by('-created_at')
        serializer = TournamentSerializer(tournaments, many=True, context={'request': request})
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)

# ─────────────────────────────────────────────
# PAYMENT VIEWS (Khalti)
# ─────────────────────────────────────────────

# USE a.khalti.com for Sandbox and pay.khalti.com for Production
KHALTI_INITIATE_URL = "https://a.khalti.com/api/v2/epayment/initiate/"
KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/"

def parse_khalti_amount(amount_str):
    """Parses 'Rs 500' or '500' to 500 (float/decimal)."""
    if not amount_str:
        return 0
    # Remove 'Rs', 'Rs.', ',', and whitespace
    clean_str = amount_str.replace('Rs', '').replace('Rs.', '').replace(',', '').strip()
    try:
        return float(clean_str)
    except (ValueError, TypeError):
        return 0


class KhaltiInitiateView(APIView):
    """Initiate Khalti payment for a booking."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Initiate Khalti payment for a booking.",
        request_body=KhaltiInitSerializer,
        tags=["Payment"]
    )
    def post(self, request):
        print("KHALTI INITIATE REQUEST RECEIVED:", request.data)
        serializer = KhaltiInitSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        booking_id = serializer.validated_data.get('booking_id')
        registration_id = serializer.validated_data.get('registration_id')
        
        target_obj = None
        amount = 0
        order_name = ""
        order_id = ""

        if booking_id:
            try:
                target_obj = Booking.objects.get(pk=booking_id, user=request.user)
                amount = target_obj.total_amount
                order_name = f"Booking at {target_obj.court.name}"
                order_id = f"BK-{target_obj.id}"
                payment, _ = Payment.objects.get_or_create(
                    booking=target_obj,
                    defaults={'amount': amount, 'payment_method': 'khalti'}
                )
            except Booking.DoesNotExist:
                return api_response(is_success=False, error_message="Booking not found.", status_code=status.HTTP_404_NOT_FOUND)
        else:
            try:
                target_obj = TournamentRegistration.objects.get(pk=registration_id, user=request.user)
                amount = parse_khalti_amount(target_obj.tournament.entry_fee)
                order_name = f"Tournament: {target_obj.tournament.title}"
                order_id = f"REG-{target_obj.id}"
                payment, _ = Payment.objects.get_or_create(
                    tournament_registration=target_obj,
                    defaults={'amount': amount, 'payment_method': 'khalti'}
                )
            except TournamentRegistration.DoesNotExist:
                return api_response(is_success=False, error_message="Registration not found.", status_code=status.HTTP_404_NOT_FOUND)

        if payment.status == PaymentStatusEnum.SUCCESS:
            return api_response(is_success=False, error_message="Payment already completed.", status_code=status.HTTP_400_BAD_REQUEST)

        khalti_payload = {
            "return_url": settings.KHALTI_RETURN_URL,
            "website_url": settings.KHALTI_WEBSITE_URL,
            "amount": int(amount * 100),  # in paisa
            "purchase_order_id": order_id,
            "purchase_order_name": order_name,
            "customer_info": {
                "name": request.user.email,
                "email": request.user.email,
                "phone": request.user.phone_number or "9800000000",
            },
        }

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(KHALTI_INITIATE_URL, json=khalti_payload, headers=headers)
            resp_data = response.json()
            print("KHALTI DEBUG RESPONSE:", resp_data)

            if response.status_code == 200:
                payment.pidx = resp_data.get('pidx')
                payment.save()
                return api_response(
                    is_success=True,
                    result={
                        "payment_url": resp_data.get('payment_url'),
                        "pidx": resp_data.get('pidx'),
                        "order_id": order_id,
                    },
                    status_code=status.HTTP_200_OK
                )
            return api_response(is_success=False, error_message=resp_data, status_code=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class KhaltiVerifyView(APIView):
    """Verify Khalti payment using pidx."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Verify Khalti payment and confirm booking.",
        request_body=KhaltiVerifySerializer,
        tags=["Payment"]
    )
    def post(self, request):
        serializer = KhaltiVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        pidx = serializer.validated_data['pidx']
        booking_id = serializer.validated_data.get('booking_id')
        registration_id = serializer.validated_data.get('registration_id')

        try:
            if booking_id:
                payment = Payment.objects.get(pidx=pidx, booking__id=booking_id)
            else:
                payment = Payment.objects.get(pidx=pidx, tournament_registration__id=registration_id)
        except Payment.DoesNotExist:
            return api_response(is_success=False, error_message="Payment record not found.", status_code=status.HTTP_404_NOT_FOUND)

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

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
                    # ✅ Final check: Is it still available? (exclude self and cancelled/pending)
                    conflict = Booking.objects.filter(
                        court=payment.booking.court,
                        time_slot=payment.booking.time_slot,
                        booking_date=payment.booking.booking_date,
                        status__in=[BookingStatusEnum.CONFIRMED, BookingStatusEnum.COMPLETED]
                    ).exclude(pk=payment.booking.id)

                    if conflict.exists():
                        payment.status = PaymentStatusEnum.FAILED # Or keep success but booking failed
                        payment.save()
                        return api_response(
                            is_success=False, 
                            error_message="Slot was taken by a faster payment or walk-in while your transaction was processing. Please contact support for a refund.",
                            status_code=status.HTTP_409_CONFLICT
                        )

                    payment.booking.status = BookingStatusEnum.CONFIRMED
                    payment.booking.save()
                    msg = "Payment verified. Booking confirmed."
                    tid = payment.booking.id
                elif payment.tournament_registration:
                    # (Tournament registration doesn't usually have a single slot conflict logic like this, 
                    # but we could check team_limit here if needed)
                    payment.tournament_registration.status = BookingStatusEnum.CONFIRMED
                    payment.tournament_registration.save()
                    msg = "Payment verified. Tournament registration confirmed."
                    tid = payment.tournament_registration.id

                return api_response(
                    is_success=True,
                    result={"message": msg, "id": tid},
                    status_code=status.HTTP_200_OK
                )
            else:
                payment.status = PaymentStatusEnum.FAILED
                payment.save()
                return api_response(is_success=False, error_message="Payment verification failed.", status_code=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


    