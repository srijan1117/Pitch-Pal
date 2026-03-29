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
    KhaltiInitSerializer, KhaltiVerifySerializer
)
from futsal.permissions import IsOwner, IsOwnerOfCourt
from PitchPal.utils import api_response


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
            serializer = self.get_serializer(qs, many=True)
            return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)
        except Exception as e:
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CourtCreateView(APIView):
    """Owner only: create a new court."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]

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
                    result=FutsalCourtSerializer(court).data,
                    status_code=status.HTTP_201_CREATED
                )
            return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CourtDetailView(APIView):
    """Owner only: retrieve, update, delete own court."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]

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
        return api_response(is_success=True, result=FutsalCourtSerializer(court).data, status_code=status.HTTP_200_OK)

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
            return api_response(is_success=True, result=FutsalCourtSerializer(court).data, status_code=status.HTTP_200_OK)
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
        serializer = FutsalCourtSerializer(courts, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)


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
            return api_response(is_success=True, result=BookingSerializer(booking).data, status_code=status.HTTP_201_CREATED)
        return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


class UserBookingListView(APIView):
    """Authenticated user: list their bookings."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(operation_description="List all bookings for the logged-in user.", tags=["Bookings"])
    def get(self, request):
        bookings = Booking.objects.filter(user=request.user).select_related('court', 'time_slot').order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
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
        serializer = BookingSerializer(bookings, many=True)
        return api_response(is_success=True, result=serializer.data, status_code=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# PAYMENT VIEWS (Khalti)
# ─────────────────────────────────────────────

KHALTI_INITIATE_URL = "https://a.khalti.com/api/v2/epayment/initiate/"
KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/"


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
        serializer = KhaltiInitSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(is_success=False, error_message=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        booking_id = serializer.validated_data['booking_id']
        try:
            booking = Booking.objects.get(pk=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return api_response(is_success=False, error_message="Booking not found.", status_code=status.HTTP_404_NOT_FOUND)

        # Create or get existing pending payment
        payment, created = Payment.objects.get_or_create(
            booking=booking,
            defaults={'amount': booking.total_amount, 'payment_method': 'khalti'}
        )

        if payment.status == PaymentStatusEnum.SUCCESS:
            return api_response(is_success=False, error_message="Payment already completed.", status_code=status.HTTP_400_BAD_REQUEST)

        khalti_payload = {
            "return_url": settings.KHALTI_RETURN_URL,
            "website_url": settings.KHALTI_WEBSITE_URL,
            "amount": int(booking.total_amount * 100),  # in paisa
            "purchase_order_id": str(booking.id),
            "purchase_order_name": f"Booking at {booking.court.name}",
            "customer_info": {
                "name": booking.user.email,
                "email": booking.user.email,
                "phone": booking.user.phone_number,
            },
        }

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(KHALTI_INITIATE_URL, json=khalti_payload, headers=headers)
            resp_data = response.json()

            if response.status_code == 200:
                payment.pidx = resp_data.get('pidx')
                payment.save()
                return api_response(
                    is_success=True,
                    result={
                        "payment_url": resp_data.get('payment_url'),
                        "pidx": resp_data.get('pidx'),
                        "booking_id": booking.id,
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
        booking_id = serializer.validated_data['booking_id']

        try:
            payment = Payment.objects.get(pidx=pidx, booking__id=booking_id)
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

                # Confirm the booking
                booking = payment.booking
                booking.status = BookingStatusEnum.CONFIRMED
                booking.save()

                return api_response(
                    is_success=True,
                    result={"message": "Payment verified. Booking confirmed.", "booking_id": booking.id},
                    status_code=status.HTTP_200_OK
                )
            else:
                payment.status = PaymentStatusEnum.FAILED
                payment.save()
                return api_response(is_success=False, error_message="Payment verification failed.", status_code=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return api_response(is_success=False, error_message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)