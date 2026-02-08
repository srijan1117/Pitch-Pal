from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework import generics
from rest_framework.parsers import FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from accounts.models import Profile
from accounts.serializers import UserRegistrationSerializer, UserLoginSerializer, UserPasswordUpdateSerializer, ProfileSerializer
from accounts.permissions import IsOwnerOfProfile
from PitchPal.utils import api_response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class RegisterView(APIView):
    permission_classes = [AllowAny]     

    @swagger_auto_schema(
        operation_description="Register a new user.",
        request_body=UserRegistrationSerializer,
        responses={
            201: openapi.Response(
                description="User registered successfully.",
            ),
            400: openapi.Response(
                description="Invalid data.",
            ),
            500: openapi.Response(
                description="Internal server error.",
            ),
        },
        tags=["User"],
    )
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)

        try:
            if serializer.is_valid():
                serializer.save()
                return api_response(
                    is_success=True,
                    result={"message": "User registered successfully."},
                    status_code=status.HTTP_201_CREATED,
                )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            print(str(e))
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class LoginView(APIView):
    throttle_scope = 'login'
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Login a user.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "email": openapi.Schema(
                    type=openapi.TYPE_STRING, description="The email of the user."
                ),
                "password": openapi.Schema(
                    type=openapi.TYPE_STRING, description="The password of the user."
                ),
            },
            required=["email", "password"],
        ),
        responses={
            200: openapi.Response(
                description="User logged in successfully.",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                ),
            ),
            400: openapi.Response(
                description="Invalid data",
            ),
            401: openapi.Response(
                description="Invalid credentials",
            ),
            500: openapi.Response(
                description="Internal server error",
            ),
        },
        tags=["User"],
    )
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        try:
            if serializer.is_valid():
                return api_response(
                    is_success=True,
                    result={
                        "message": "Logged in successfully.",
                        "data": serializer.data
                    },
                    status_code=status.HTTP_200_OK,
                )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class UserPasswordUpdateAPI(APIView):
    throttle_scope = 'update_password'
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @swagger_auto_schema(
        operation_description="Update the authenticated user's password. Requires old and new password.",
        request_body=UserPasswordUpdateSerializer,
        responses={
            200: openapi.Response(
                description="Password updated successfully.",
                examples={
                    "application/json": {
                        "is_success": True,
                        "result": {"message": "Password updated successfully."}
                    }
                }
            ),
            400: openapi.Response(description="Bad request – validation failed."),
            401: openapi.Response(description="Authentication credentials were not provided or are invalid."),
            403: openapi.Response(description="User is not authorized to perform this action."),
            500: openapi.Response(description="Server error.")
        },
        tags = ["User"],
    )
    def put(self, request, *args, **kwargs):
        try:
            serializer = UserPasswordUpdateSerializer(instance=request.user, data=request.data, partial=True)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            serializer.save()
            return api_response(
                    is_success=True,
                    result={
                        "message": "Password updated successfully.",
                    },
                    status_code=status.HTTP_200_OK
                )

        except Exception as e:
            return api_response(
                    is_success=False,
                    error_message=str(e),
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

class ProfileResponseAPI(generics.RetrieveAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        try:
            return self.request.user.user_profile
        except Profile.DoesNotExist:
            raise NotFound("Profile not found for this user.")

    @swagger_auto_schema(
        operation_description="Retrieve profile data of currently logged in user.",
        responses={
            200: openapi.Response("Successfully retrieved profile data.", ProfileSerializer),
            401: "Unauthorized - JWT token missing or invalid.",
            403: "Forbidden",
            404: "Emotion not found.",
            500: "Internal server error.",
        },
        tags=["User"]
    )
    def get(self, request, *args, **kwargs):
        try:
            profile = self.get_object()
            serializer = self.get_serializer(profile)
            return api_response(
                is_success=True,
                result=serializer.data,
                status_code=status.HTTP_200_OK
            )
        except NotFound as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )