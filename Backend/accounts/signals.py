from django.db.models.signals import post_save
from django.dispatch import receiver
from accounts.models import User, Profile

@receiver(post_save, sender=User)
def create_or_update_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(
            user=instance,
            address_sync=instance.address,
        )
    else:
        profile, _ = Profile.objects.get_or_create(user=instance)
        profile.address_sync = instance.address
        profile.save()

#if Profile is updated, update synced fields of User (address)
@receiver(post_save, sender=Profile)
def sync_profile_to_user(sender, instance, **kwargs):
    user = instance.user
    updated = False

    if instance.address_sync and instance.address_sync != user.address:
        user.address = instance.address_sync
        updated = True

    if updated:
        user.save()

