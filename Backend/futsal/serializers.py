from rest_framework import serializers
from futsal.models import Tournament, TournamentRegistration
from futsal.models import (
    FutsalCourt, TimeSlot, Booking, Payment,
    BookingStatusEnum, CourtImage, WeeklyBooking, Review
)
from accounts.models import RoleEnum


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'start_time', 'end_time', 'is_available', 'price']

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
    user_email = serializers.EmailField(source='user.email', read_only=True, allow_null=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user_email', 'court', 'court_name',
            'time_slot', 'time_slot_detail', 'booking_date',
            'status', 'total_amount', 'customer_name', 'customer_phone', 'created_at'
        ]
        read_only_fields = ['status', 'total_amount', 'created_at', 'user_email']

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

        existing = Booking.objects.filter(
            court=court,
            time_slot=time_slot,
            booking_date=booking_date,
        ).exclude(status=BookingStatusEnum.CANCELLED)

        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():
            raise serializers.ValidationError('This slot is already booked for the selected date.')

        return data

    def create(self, validated_data):
        from datetime import datetime, date as date_type
        from decimal import Decimal

        user = self.context['request'].user
        time_slot = validated_data['time_slot']
        court = validated_data['court']

        start = datetime.combine(date_type.today(), time_slot.start_time)
        end = datetime.combine(date_type.today(), time_slot.end_time)
        hours = (end - start).seconds / 3600
        total_amount = round(Decimal(str(hours)) * court.price_per_hour, 2)

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
    class Meta:
        model = Booking
        fields = ['court', 'time_slot', 'booking_date', 'customer_name', 'customer_phone']

    def validate(self, data):
        court = data.get('court')
        time_slot = data.get('time_slot')
        booking_date = data.get('booking_date')

        if not time_slot or not court or time_slot.court != court:
            raise serializers.ValidationError({'time_slot': 'Invalid slot for selected court.'})

        # Check if already booked
        existing = Booking.objects.filter(
            court=court,
            time_slot=time_slot,
            booking_date=booking_date
        ).exclude(status=BookingStatusEnum.CANCELLED)
        
        if existing.exists():
            raise serializers.ValidationError('This slot is already booked.')

        return data

    def create(self, validated_data):
        from datetime import datetime, date as date_type
        from decimal import Decimal

        court = validated_data['court']
        time_slot = validated_data['time_slot']

        # Calculate amount
        start = datetime.combine(date_type.today(), time_slot.start_time)
        end = datetime.combine(date_type.today(), time_slot.end_time)
        hours = (end - start).seconds / 3600
        total_amount = round(Decimal(str(hours)) * court.price_per_hour, 2)

        # Walk-ins are auto-confirmed
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
        fields = ['id', 'user_email', 'court', 'court_name', 'time_slot', 'time_slot_detail', 'start_date', 'end_date', 'is_active', 'created_at']


class KhaltiInitSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()

    def validate_booking_id(self, value):
        try:
            booking = Booking.objects.get(pk=value)
        except Booking.DoesNotExist:
            raise serializers.ValidationError('Booking not found.')
        if booking.status == BookingStatusEnum.CANCELLED:
            raise serializers.ValidationError('Cannot pay for a cancelled booking.')
        return value


class KhaltiVerifySerializer(serializers.Serializer):
    pidx = serializers.CharField()
    booking_id = serializers.IntegerField()


class TournamentSerializer(serializers.ModelSerializer):
    registered_teams = serializers.IntegerField(read_only=True)
    image = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            'id', 'title', 'organizer', 'location', 'date',
            'start_date', 'end_date',
            'prize_pool', 'entry_fee', 'team_limit', 'registered_teams',
            'format', 'description', 'rules', 'image',
            'status', 'state', 'contact_phone', 'created_at'
        ]
        read_only_fields = ['registered_teams', 'created_at', 'state', 'status']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_state(self, obj):
        from django.utils import timezone
        today = timezone.localdate()
        if not obj.start_date:
            return obj.state
        if today < obj.start_date:
            return 'upcoming'
        elif obj.end_date and today > obj.end_date:
            return 'history'
        else:
            return 'ongoing'

    def get_status(self, obj):
        from django.utils import timezone
        today = timezone.localdate()
        if not obj.start_date:
            return obj.status
        if obj.end_date and today > obj.end_date:
            return 'Completed'
        elif today >= obj.start_date:
            return 'Registration Closed'
        else:
            return 'Registration Open'


class TournamentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = [
            'id', 'title', 'organizer', 'location', 'date',
            'start_date', 'end_date',
            'prize_pool', 'entry_fee', 'team_limit', 'format',
            'description', 'rules', 'image', 'status', 'state', 'contact_phone'
        ]


class TournamentRegistrationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    tournament_title = serializers.CharField(source='tournament.title', read_only=True)

    class Meta:
        model = TournamentRegistration
        fields = [
            'id', 'tournament', 'tournament_title', 'user_email',
            'team_name', 'contact_phone', 'player_names', 'registered_at'
        ]
        read_only_fields = ['user_email', 'tournament_title', 'registered_at']

    def validate(self, data):
        tournament = data.get('tournament')
        user = self.context['request'].user
        if tournament.status != 'Registration Open':
            raise serializers.ValidationError({'tournament': 'Registration is closed.'})
        if tournament.registered_teams >= tournament.team_limit:
            raise serializers.ValidationError({'tournament': 'Tournament is full.'})
        if TournamentRegistration.objects.filter(tournament=tournament, user=user).exists():
            raise serializers.ValidationError({'tournament': 'You have already registered.'})
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return TournamentRegistration.objects.create(user=user, **validated_data)