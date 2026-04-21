from django.contrib import admin
from futsal.models import (
    FutsalCourt, TimeSlot, Booking, Payment, 
    WeeklyBooking, Tournament, TournamentRegistration, CourtImage
)

class CourtImageInline(admin.TabularInline):
    model = CourtImage
    extra = 1

@admin.register(FutsalCourt)
class FutsalCourtAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'address', 'price_per_hour', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    list_editable = ['is_active', 'price_per_hour']
    search_fields = ['name', 'owner__email']
    inlines = [CourtImageInline]
    ordering = ['-created_at']


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['court', 'start_time', 'end_time', 'is_available']
    list_filter = ['is_available', 'court']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'court', 'time_slot', 'booking_date', 'status', 'total_amount']
    list_filter = ['status', 'booking_date', 'court']
    list_editable = ['status']
    search_fields = ['user__email', 'court__name', 'customer_name']
    date_hierarchy = 'booking_date'
    ordering = ['-booking_date', '-id']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'amount', 'payment_method', 'status', 'paid_at']
    list_filter = ['status', 'payment_method', 'paid_at']
    list_editable = ['status']
    date_hierarchy = 'paid_at'
    ordering = ['-created_at']


@admin.register(WeeklyBooking)
class WeeklyBookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'court', 'time_slot', 'start_date', 'is_active']
    list_filter = ['is_active']


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'status', 'state', 'team_limit', 'start_date']
    list_filter = ['status', 'state', 'start_date']
    list_editable = ['status', 'state']
    search_fields = ['title', 'organizer']
    ordering = ['-start_date']

@admin.register(TournamentRegistration)
class TournamentRegistrationAdmin(admin.ModelAdmin):
    list_display = ['team_name', 'tournament', 'user', 'registered_at']