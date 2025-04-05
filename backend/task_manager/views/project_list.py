from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpRequest
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.mixins import LoginRequiredMixin
from ..models.project import Project

# Create your views here.


class ProjectListView(APIView):
    login_url = "/login"

    def get(self, request, user_id: int):
        try:
            project_list: list[dict] = Project.get_project_list_for_user(user_id=user_id)

            return Response(status=status.HTTP_200_OK, data={"project_list": project_list})

        except User.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
