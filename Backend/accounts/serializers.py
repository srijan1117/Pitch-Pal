from django.core.exceptions import ValidationError
from django.core.files.images import get_image_dimensions
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.db import transaction
from django.conf import settings

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User, Profile, RoleEnum


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'role', 'phone_number','address', 'date_joined']
        read_only_fields = ['date_joined']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'role', 'phone_number', 'address', 'password', 'confirm_password']

    def validate(self, data):
        password = data['password']
        confirm_password = data["confirm_password"]
        phone_number = data['phone_number']
        role = data['role']

        if not phone_number.isdigit():
            raise serializers.ValidationError(
                {"phone_number": "Phone number must only contain digits."}
            )
        if len(phone_number) < 10:
            raise serializers.ValidationError(
                {"phone_number": "Phone number must have at least 10 digits."}
            )
        existing_superuser = User.objects.filter(role=RoleEnum.SUPERUSER).exists()
        if role==RoleEnum.SUPERUSER and existing_superuser:
            raise serializers.ValidationError(
                {"existing_role": "A superuser already exists."}
            )
        try:
            validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError(
                {"password": e.messages}
            )

        if password != confirm_password:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')

        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only = True, required=True)

    def validate(self, data):
        email = data['email']
        password = data['password']

        user = authenticate(email=email, password=password)

        if user is None:
            raise serializers.ValidationError(
                {"message": "Invalid Credentials."}
            )
        if not user.is_active:
            raise serializers.ValidationError(
                {"message": "Please activate your account by contacting the admin before attempting login."}
            )

        self.user = user
        return data

    def to_representation(self, instance):
        user_data = UserSerializer(instance=self.user).data
        refresh = RefreshToken.for_user(self.user)
        user_data['access_token'] = str(refresh.access_token)
        user_data['refresh_token'] = str(refresh)
        return user_data

class UserPasswordUpdateSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_new_password = serializers.CharField(write_only=True, required=True)

    def validate_current_password(self, value):
        user = self.instance
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, data):
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        confirm_new_password = data.get("confirm_new_password")

        if new_password == current_password:
            raise serializers.ValidationError({"current_password": "New password cannot be the same as current password."})

        if new_password != confirm_new_password:
            raise serializers.ValidationError({"new_password": "New passwords do not match."})

        try:
            validate_password(new_password, self.instance)
        except ValidationError as e:
            raise serializers.ValidationError(
                {"new_password": e.messages}
            )
        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=Profile
        fields=['id', 'address_sync', 'created_at', 'updated_at']