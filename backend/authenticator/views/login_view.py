from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpRequest
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from ..utils import *


class LoginView(APIView):

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # Return success response with target URL
            return Response(
                data={"status": "success", "message": "Login successful", "user_id": user.pk},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"status": "error", "message": "Invalid username or password"},
                status=status.HTTP_400_BAD_REQUEST,
            )
