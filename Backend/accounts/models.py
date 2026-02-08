from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class RoleEnum(models.TextChoices):
    SUPERUSER = 'superuser', _('SUPERUSER')
    ADMIN = 'admin', _('ADMIN')
    USER = 'user', _('USER')
    OWNER = 'owner', _('OWNER')

class UserManager(BaseUserManager):
    def create_user(self, email, password, phone_number, role, address, **extra_fields):
        if not email:
            raise ValueError("An email must be set.")
        if not role:
            raise ValueError("A role must be set.")
        if not phone_number:
            raise ValueError("A phone number must be set.")

        if role == RoleEnum.ADMIN:
            extra_fields.setdefault("is_admin", True)
            extra_fields.setdefault("is_staff", True)

        if role == RoleEnum.OWNER:
            pass            
        email = self.normalize_email(email)
        user = self.model(email=email, phone_number=phone_number, role=role, address=address, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone_number, password=None, role=RoleEnum.SUPERUSER.value, address=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_admin", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("A superuser must be a staff by default.")
        if extra_fields.get("is_admin") is not True:
            raise ValueError("A superuser must be an admin by default.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("A superuser must have is_superuser=True.")

        return self.create_user(email, password, phone_number, role, address, **extra_fields)

class User(AbstractBaseUser):
    email = models.EmailField(max_length=200, unique=True)
    role = models.CharField(
        max_length=20,
        choices=RoleEnum.choices,
        default=RoleEnum.USER.value
    )
    phone_number = models.CharField(max_length=15)
    address=models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number']

    def __str__(self):
        return self.email

    def clean(self):
        if not self.phone_number.isdigit():
            raise ValidationError({'phone_number': 'Phone number must only contain digits.'})
        if len(self.phone_number) < 10:
            raise ValidationError({'phone_number': 'Phone number must have at least 10 digits.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def has_perm(self, perm, obj=None):
        if self.is_superuser:
            return True
        return False

    def has_module_perms(self, app_label):
        if self.is_superuser:
            return True
        return False

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_profile')
    address_sync = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"