# Generated manually to fix missing column error

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('futsal', '0010_payment_tournament_registration_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='weeklybooking',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled'), ('completed', 'Completed')], default='pending', max_length=20),
        ),
        migrations.AddField(
            model_name='payment',
            name='weekly_booking',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='futsal.weeklybooking'),
        ),
    ]
