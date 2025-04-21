from rest_framework.views import APIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from ..models.project_task import ProjectTask
# Create your views here.


class TaskListView(APIView):
    def get(self, request, user_id: int):
        try:
            task_list: list[dict] = ProjectTask.get_task_for_user(user_id=user_id)

            return Response(status=status.HTTP_200_OK, data={"task_list": task_list})

        except User.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
