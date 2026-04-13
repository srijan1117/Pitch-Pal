from rest_framework import serializers
from futsal.models import (
    FutsalCourt, TimeSlot, Booking, Payment,
    BookingStatusEnum, CourtImage, WeeklyBooking, Review, PaymentStatusEnum,
    Tournament, TournamentRegistration
)
from accounts.models import RoleEnum
from django.utils import timezone
from datetime import datetime, date as date_type, timedelta
from decimal import Decimal


class TimeSlotSerializer(serializers.ModelSerializer):
    is_booked = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = ['id', 'start_time', 'end_time', 'is_available', 'price', 'is_booked']

    def get_is_booked(self, obj):
        booked_ids = self.context.get('booked_slot_ids', [])
        return obj.id in booked_ids

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})
        return data


class CourtImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = CourtImage
        fields = ['id', 'image', 'uploaded_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class FutsalCourtSerializer(serializers.ModelSerializer):
    time_slots = TimeSlotSerializer(many=True, read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    image = serializers.SerializerMethodField()
    gallery = CourtImageSerializer(many=True, read_only=True)

    class Meta:
        model = FutsalCourt
        fields = [
            'id', 'name', 'address', 'description',
            'price_per_hour', 'is_active', 'owner_email',
            'image', 'gallery', 'amenities',
            'time_slots', 'average_rating', 'total_reviews',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['owner_email', 'average_rating', 'total_reviews', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class FutsalCourtCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FutsalCourt
        fields = ['id', 'name', 'address', 'description', 'price_per_hour', 'is_active', 'image', 'amenities']

    def create(self, validated_data):
        owner = self.context['request'].user
        return FutsalCourt.objects.create(owner=owner, **validated_data)


class BookingSerializer(serializers.ModelSerializer):
    court_name = serializers.CharField(source='court.name', read_only=True)
    time_slot_detail = TimeSlotSerializer(source='time_slot', read_only=True)
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user_email', 'court', 'court_name',
            'time_slot', 'time_slot_detail', 'booking_date',
            'status', 'total_amount', 'customer_name', 'customer_phone', 'created_at'
        ]
        read_only_fields = ['status', 'total_amount', 'created_at', 'user_email']

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

    def validate(self, data):
        court = data.get('court')
        time_slot = data.get('time_slot')
        booking_date = data.get('booking_date')

        from django.utils import timezone
        today = timezone.localdate()
        if booking_date < today:
            raise serializers.ValidationError({'booking_date': 'Booking date cannot be in the past.'})

        if time_slot and court and time_slot.court != court:
            raise serializers.ValidationError({'time_slot': 'This time slot does not belong to the selected court.'})

        if not time_slot.is_available:
            raise serializers.ValidationError({'time_slot': 'This time slot is not available.'})

        # Check for confirmed/completed bookings
        existing_confirmed = Booking.objects.filter(
            court=court,
            time_slot=time_slot,
            booking_date=booking_date,
            status__in=[BookingStatusEnum.CONFIRMED, BookingStatusEnum.COMPLETED]
        )

        # Check for very recent pending bookings (15-minute lock)
        lock_time = timezone.now() - timedelta(minutes=15)
        existing_pending = Booking.objects.filter(
            court=court,
            time_slot=time_slot,
            booking_date=booking_date,
            status=BookingStatusEnum.PENDING,
            created_at__gte=lock_time
        )

        if self.instance:
            existing_confirmed = existing_confirmed.exclude(pk=self.instance.pk)
            existing_pending = existing_pending.exclude(pk=self.instance.pk)

        if existing_confirmed.exists():
            raise serializers.ValidationError('This slot is already booked for the selected date.')
            
        if existing_pending.exists():
            raise serializers.ValidationError('This slot is currently being booked by another user. Please try again in 15 minutes.')

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        time_slot = validated_data['time_slot']
        court = validated_data['court']
        # Note: we use a single day baseline. If end < start, it means it crosses midnight.
        start_dt = datetime.combine(date_type.today(), time_slot.start_time)
        end_dt = datetime.combine(date_type.today(), time_slot.end_time)
        
        duration = end_dt - start_dt
        if duration.total_seconds() < 0:
            # If negative, it likely crosses midnight (e.g., 23:00 to 01:00)
            duration += timedelta(days=1)
            
        hours = Decimal(str(duration.total_seconds() / 3600))
        total_amount = round(hours * court.price_per_hour, 2)

        # ✅ Auto-confirm logic
        auto_confirm = (
            user.role == RoleEnum.OWNER and
            court and
            court.owner == user
        )

        booking_status = (
            BookingStatusEnum.CONFIRMED if auto_confirm
            else BookingStatusEnum.PENDING
        )

        booking = Booking.objects.create(
            user=user,
            total_amount=total_amount,
            status=booking_status,
            **validated_data
        )
        return booking


class WalkinBookingSerializer(serializers.ModelSerializer):
    court_name = serializers.CharField(source='court.name', read_only=True)
    time_slot_detail = TimeSlotSerializer(source='time_slot', read_only=True)
    class Meta:
        model = Booking
        fields = ['court', 'time_slot', 'booking_date', 'customer_name', 'customer_phone', 'court_name', 'time_slot_detail']

    def validate(self, data):
        court = data.get('court')
        time_slot = data.get('time_slot')
        booking_date = data.get('booking_date')

        if not time_slot or not court or time_slot.court != court:
            raise serializers.ValidationError({'time_slot': 'Invalid slot for selected court.'})

        # Check if already booked (Confirmed/Completed)
        existing_confirmed = Booking.objects.filter(
            court=court,
            time_slot=time_slot,
            booking_date=booking_date,
            status__in=[BookingStatusEnum.CONFIRMED, BookingStatusEnum.COMPLETED]
        )
        
        if existing_confirmed.exists():
            raise serializers.ValidationError('This slot is already booked.')

        # Check for active Pending bookings (15 min lock)
        lock_time = timezone.now() - timedelta(minutes=15)
        existing_pending = Booking.objects.filter(
            court=court,
            time_slot=time_slot,
            booking_date=booking_date,
            status=BookingStatusEnum.PENDING,
            created_at__gte=lock_time
        )

        if existing_pending.exists():
            raise serializers.ValidationError('This slot is currently being booked by another user online. Please try again in 15 minutes.')

        return data

    def create(self, validated_data):
        court = validated_data['court']
        time_slot = validated_data['time_slot']

        # Calculate duration robustly (handling midnight crossing)
        start_dt = datetime.combine(date_type.today(), time_slot.start_time)
        end_dt = datetime.combine(date_type.today(), time_slot.end_time)
        
        duration = end_dt - start_dt
        if duration.total_seconds() < 0:
            duration += timedelta(days=1)
            
        hours = Decimal(str(duration.total_seconds() / 3600))
        total_amount = round(hours * court.price_per_hour, 2)

        # Walk-ins are auto-confirmed and have no 'user' (it's null)
        booking = Booking.objects.create(
            status=BookingStatusEnum.CONFIRMED,
            total_amount=total_amount,
            **validated_data
        )
        return booking


class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    court_name = serializers.CharField(source='court.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_email', 'court', 'court_name', 'booking', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['user_email', 'court_name', 'created_at', 'updated_at']

    def validate(self, data):
        request = self.context['request']
        user = request.user
        booking = data.get('booking')
        court = data.get('court')

        if booking.user != user:
            raise serializers.ValidationError({'booking': 'This booking does not belong to you.'})

        if booking.status != BookingStatusEnum.COMPLETED:
            raise serializers.ValidationError({'booking': 'You can only review after your booking is completed.'})

        if booking.court != court:
            raise serializers.ValidationError({'court': 'This booking was not made for this court.'})

        existing = Review.objects.filter(user=user, court=court)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError({'court': 'You have already reviewed this court.'})

        if hasattr(booking, 'review') and (not self.instance or self.instance.booking != booking):
            raise serializers.ValidationError({'booking': 'This booking has already been reviewed.'})

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return Review.objects.create(user=user, **validated_data)


class WeeklyBookingSerializer(serializers.ModelSerializer):
    court_name = serializers.CharField(source='court.name', read_only=True)
    time_slot_detail = TimeSlotSerializer(source='time_slot', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = WeeklyBooking
        fields = ['id', 'user_email', 'court', 'court_name', 'time_slot', 'time_slot_detail', 'start_date', 'end_date', 'status', 'is_active', 'created_at']
        read_only_fields = ['user_email', 'court_name', 'status', 'created_at']

    def validate(self, data):
        court = data.get('court')
        time_slot = data.get('time_slot')
        start_date = data.get('start_date')

        from django.utils import timezone
        today = timezone.localdate()
        if start_date < today:
            raise serializers.ValidationError({'start_date': 'Start date cannot be in the past.'})

        if time_slot and court and time_slot.court != court:
            raise serializers.ValidationError({'time_slot': 'This time slot does not belong to the selected court.'})

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return WeeklyBooking.objects.create(user=user, status=BookingStatusEnum.PENDING, **validated_data)


class KhaltiInitSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField(required=False, allow_null=True)
    registration_id = serializers.IntegerField(required=False, allow_null=True)
    weekly_booking_id = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, data):
        booking_id = data.get('booking_id')
        registration_id = data.get('registration_id')
        weekly_booking_id = data.get('weekly_booking_id')

        count = sum(1 for x in [booking_id, registration_id, weekly_booking_id] if x is not None)
        if count == 0:
            raise serializers.ValidationError('One of booking_id, registration_id, or weekly_booking_id must be provided.')
        if count > 1:
            raise serializers.ValidationError('Provide only one of: booking_id, registration_id, or weekly_booking_id.')

        return data


class KhaltiVerifySerializer(serializers.Serializer):
    pidx = serializers.CharField()
    booking_id = serializers.IntegerField(required=False, allow_null=True)
    registration_id = serializers.IntegerField(required=False, allow_null=True)
    weekly_booking_id = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, data):
        count = sum(1 for x in [data.get('booking_id'), data.get('registration_id'), data.get('weekly_booking_id')] if x is not None)
        if count == 0:
            raise serializers.ValidationError('One of booking_id, registration_id, or weekly_booking_id must be provided.')
        return data


class TournamentSerializer(serializers.ModelSerializer):
    registered_teams = serializers.IntegerField(read_only=True)
    image = serializers.SerializerMethodField()
    user_registration_status = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date',
            'registration_deadline', 'entry_fee', 'prize_pool',
            'team_limit', 'registered_teams', 'image', 'location',
            'organizer', 'state', 'status', 'created_at', 'contact_phone', 'format',
            'user_registration_status', 'date'
        ]

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request: return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_user_registration_status(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            reg = obj.registrations.filter(user=request.user).first()
            if reg:
                return reg.status
        return None


class TournamentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = [
            'title', 'description', 'start_date', 'end_date', 
            'registration_deadline', 'entry_fee', 'prize_pool', 
            'team_limit', 'location', 'image', 'organizer', 'format',
            'contact_phone', 'date'
        ]

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        registration_deadline = data.get('registration_deadline')

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({'end_date': 'End date must be after start date.'})

        if registration_deadline and start_date:
            # registration_deadline is likely a datetime, start_date is a date.
            # Convert registration_deadline to date for comparison or vice versa.
            if registration_deadline.date() > start_date:
                raise serializers.ValidationError({'registration_deadline': 'Registration deadline must be before or on the start date.'})

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return Tournament.objects.create(owner=user, **validated_data)


class TournamentRegistrationSerializer(serializers.ModelSerializer):
    tournament_title = serializers.CharField(source='tournament.title', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    tournament_detail = serializers.SerializerMethodField()

    class Meta:
        model = TournamentRegistration
        fields = ['id', 'tournament', 'tournament_title', 'user', 'user_email', 'team_name', 'contact_phone', 'status', 'registered_at', 'player_names', 'tournament_detail']
        read_only_fields = ['user', 'status', 'registered_at']

    def get_tournament_detail(self, obj):
        image_url = None
        if obj.tournament.image:
            request = self.context.get('request')
            if request:
                image_url = request.build_absolute_uri(obj.tournament.image.url)
            else:
                image_url = obj.tournament.image.url

        return {
            "title": obj.tournament.title,
            "entry_fee": obj.tournament.entry_fee,
            "image": image_url,
            "location": obj.tournament.location,
            "date": obj.tournament.date,
            "start_date": obj.tournament.start_date,
            "end_date": obj.tournament.end_date,
            "format": obj.tournament.format,
        }

    def validate(self, data):
        user = self.context['request'].user
        tournament = data.get('tournament')
        from django.utils import timezone
        if tournament.registration_deadline and timezone.now() > tournament.registration_deadline:
            raise serializers.ValidationError({'tournament': 'Registration deadline has passed.'})
        if tournament.registered_teams >= tournament.team_limit:
            raise serializers.ValidationError({'tournament': 'Tournament is full.'})
        
        # Only block if already confirmed/completed
        from futsal.models import BookingStatusEnum
        existing = TournamentRegistration.objects.filter(tournament=tournament, user=user).exclude(status=BookingStatusEnum.PENDING)
        if existing.exists():
            raise serializers.ValidationError({'tournament': 'You have already registered.'})
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return TournamentRegistration.objects.create(user=user, **validated_data)
