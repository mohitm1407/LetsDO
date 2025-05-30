from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models.project import Project
from django.contrib.auth.models import User
from pydantic import BaseModel, Field, ValidationError
from typing import Optional
from datetime import datetime
from task_manager.models.project_task import PriorityChoices, TaskState, ProjectTask


class EditTaskSchema(BaseModel):
    project_id: int = Field(..., gt=0)
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[int] = PriorityChoices.MEDIUM
    status: Optional[int] = TaskState.TODO
    is_daily_task: Optional[bool] = False
    deadline: Optional[datetime] = None


class EditTaskView(APIView):
    """
    API View to create a new project
    """

    def post(self, request, task_id: int) -> Response:
        try:
            # Validate request data using Pydantic model

            try:
                task = ProjectTask.objects.get(id=task_id)
            except ProjectTask.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": str(e)})

            try:
                task_data = EditTaskSchema.model_validate(request.data)
            except ValidationError as e:
                return Response(
                    {"error": "Invalid request data", "details": e.errors()}, status=status.HTTP_400_BAD_REQUEST
                )

            task.update_task(task_data.model_dump())

            return Response(status=status.HTTP_200_OK, data={"message": "Task updated successfully"})

        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": str(e)})
