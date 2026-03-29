from django.db import models
from django.core.exceptions import ValidationError
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

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None

    @property
    def total_reviews(self):
        return self.reviews.count()


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
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'
    COMPLETED = 'completed', 'Completed'


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

    def __str__(self):
        return f"Booking#{self.id} - {self.user.email} @ {self.court.name} on {self.booking_date}"


class PaymentStatusEnum(models.TextChoices):
    PENDING = 'pending', 'Pending'
    SUCCESS = 'success', 'Success'
    FAILED = 'failed', 'Failed'
    REFUNDED = 'refunded', 'Refunded'


class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='khalti')
    pidx = models.CharField(max_length=255, blank=True, null=True)
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


class Review(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]  # 1 to 5 stars

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    court = models.ForeignKey(FutsalCourt, on_delete=models.CASCADE, related_name='reviews')
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'court')

    def clean(self):
        if self.booking.status != BookingStatusEnum.COMPLETED:
            raise ValidationError('You can only review a court after your booking is completed.')
        if self.booking.user != self.user:
            raise ValidationError('You can only review your own bookings.')
        if self.booking.court != self.court:
            raise ValidationError('Booking does not match the court.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Review by {self.user.email} for {self.court.name} - {self.rating}star"