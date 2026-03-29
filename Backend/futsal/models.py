from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class FutsalCourt(models.Model):
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='courts',
        limit_choices_to={'role': 'owner'}
    )
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.owner.email})"


class TimeSlot(models.Model):
    court = models.ForeignKey(FutsalCourt, on_delete=models.CASCADE, related_name='time_slots')
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('court', 'start_time', 'end_time')

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError({'end_time': 'End time must be after start time.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.court.name}: {self.start_time} - {self.end_time}"


class BookingStatusEnum(models.TextChoices):
    PENDING = 'pending', _('Pending')
    CONFIRMED = 'confirmed', _('Confirmed')
    CANCELLED = 'cancelled', _('Cancelled')
    COMPLETED = 'completed', _('Completed')


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    court = models.ForeignKey(FutsalCourt, on_delete=models.CASCADE, related_name='bookings')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='bookings')
    booking_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=BookingStatusEnum.choices,
        default=BookingStatusEnum.PENDING
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('court', 'time_slot', 'booking_date')

    def clean(self):
        # Prevent booking in the past
        from django.utils import timezone
        import datetime
        today = timezone.localdate()
        if self.booking_date < today:
            raise ValidationError({'booking_date': 'Booking date cannot be in the past.'})

        # Ensure time_slot belongs to the court
        if hasattr(self, 'time_slot') and hasattr(self, 'court'):
            if self.time_slot.court != self.court:
                raise ValidationError({'time_slot': 'Time slot does not belong to this court.'})

    def save(self, *args, **kwargs):
        # Auto-calculate total amount from court price and slot duration
        if not self.total_amount:
            from datetime import datetime, date
            start = datetime.combine(date.today(), self.time_slot.start_time)
            end = datetime.combine(date.today(), self.time_slot.end_time)
            hours = (end - start).seconds / 3600
            self.total_amount = hours * self.court.price_per_hour
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking#{self.id} - {self.user.email} @ {self.court.name} on {self.booking_date}"


class PaymentStatusEnum(models.TextChoices):
    PENDING = 'pending', _('Pending')
    SUCCESS = 'success', _('Success')
    FAILED = 'failed', _('Failed')
    REFUNDED = 'refunded', _('Refunded')


class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='khalti')  # khalti or esewa
    pidx = models.CharField(max_length=255, blank=True, null=True)       # Khalti transaction id
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=PaymentStatusEnum.choices,
        default=PaymentStatusEnum.PENDING
    )
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment#{self.id} for Booking#{self.booking.id} - {self.status}"