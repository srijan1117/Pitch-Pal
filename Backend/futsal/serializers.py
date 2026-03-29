from rest_framework import serializers
from futsal.models import FutsalCourt, TimeSlot, Booking, Payment, BookingStatusEnum


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'start_time', 'end_time', 'is_available']

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})
        return data


class FutsalCourtSerializer(serializers.ModelSerializer):
    time_slots = TimeSlotSerializer(many=True, read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = FutsalCourt
        fields = [
            'id', 'name', 'address', 'description',
            'price_per_hour', 'is_active', 'owner_email',
            'time_slots', 'created_at', 'updated_at'
        ]
        read_only_fields = ['owner_email', 'created_at', 'updated_at']


class FutsalCourtCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FutsalCourt
        fields = ['id', 'name', 'address', 'description', 'price_per_hour', 'is_active']

    def create(self, validated_data):
        owner = self.context['request'].user
        return FutsalCourt.objects.create(owner=owner, **validated_data)


class BookingSerializer(serializers.ModelSerializer):
    court_name = serializers.CharField(source='court.name', read_only=True)
    time_slot_detail = TimeSlotSerializer(source='time_slot', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user_email', 'court', 'court_name',
            'time_slot', 'time_slot_detail', 'booking_date',
            'status', 'total_amount', 'created_at'
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

        booking = Booking.objects.create(
            user=user,
            total_amount=total_amount,
            **validated_data
        )
        return booking


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'amount', 'payment_method', 'pidx', 'transaction_id', 'status', 'paid_at', 'created_at']
        read_only_fields = ['status', 'pidx', 'transaction_id', 'paid_at', 'created_at']


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