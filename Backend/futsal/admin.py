from django.contrib import admin
from futsal.models import FutsalCourt, TimeSlot, Booking, Payment
from futsal.models import WeeklyBooking
from futsal.models import Tournament, TournamentRegistration


@admin.register(FutsalCourt)
class FutsalCourtAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'address', 'price_per_hour', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'owner__email']


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['court', 'start_time', 'end_time', 'is_available']
    list_filter = ['is_available', 'court']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'court', 'time_slot', 'booking_date', 'status', 'total_amount']
    list_filter = ['status', 'booking_date']
    search_fields = ['user__email', 'court__name']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'amount', 'payment_method', 'status', 'paid_at']
    list_filter = ['status', 'payment_method']


@admin.register(WeeklyBooking)
class WeeklyBookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'court', 'time_slot', 'start_date', 'is_active']
    list_filter = ['is_active']


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'status', 'state', 'team_limit']

@admin.register(TournamentRegistration)
class TournamentRegistrationAdmin(admin.ModelAdmin):
    list_display = ['team_name', 'tournament', 'user', 'registered_at']