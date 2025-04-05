from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import datetime
from pydantic import BaseModel
from pydantic.error_wrappers import ValidationError
from typing import Optional

from ..models.project import Project
from ..models.project_task import ProjectTask, PriorityChoices, TaskState


class AddTaskSchema(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[int] = PriorityChoices.MEDIUM
    status: Optional[int] = TaskState.TODO
    is_daily_task: Optional[bool] = False
    deadline: Optional[datetime] = None


class AddTaskView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, project_id):

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        try:
            task_data = AddTaskSchema(**request.data)
        except ValidationError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": str(e)})
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": str(e)})

        task, _ = ProjectTask.add_task_to_project(project=project, task_data=task_data.model_dump())

        if _:
            return Response(status=status.HTTP_201_CREATED, data={"task": task.serialize()})
        else:
            return Response(
                status=status.HTTP_400_BAD_REQUEST, data={"error": "Task with similar title already exists"}
            )
