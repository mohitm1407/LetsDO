from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.contrib.auth import login
from rest_framework import status
from ..utils import *


class SignUpView(APIView):

    def post(self, request: HttpRequest):

        username = request.data.get("username")
        password = request.data.get("password")
        if User.objects.filter(username=username).exists():
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"message": "Username Already Exists"})

        try:
            user = User.objects.create(username=username, password=password)
            login(request=request, user=user)
            return Response(
                status=status.HTTP_200_OK,
                data={"message": "Account Created Successfully!", "user_id": user.pk},
            )
        except Exception as e:
            return Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                data={"message": "Account Created UnSuccessfully!"},
            )
