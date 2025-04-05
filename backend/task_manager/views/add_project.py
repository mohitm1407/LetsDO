from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models.project import Project
from django.contrib.auth.models import User
from pydantic import BaseModel, Field, ValidationError
from typing import Optional


class CreateProjectSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    user_id: int = Field(..., gt=0)


class AddProjectView(APIView):
    """
    API View to create a new project
    """

    def post(self, request) -> Response:
        try:
            # Validate request data using Pydantic model
            print(request.data)
            try:
                project_data = CreateProjectSchema.model_validate(request.data)
            except ValidationError as e:
                return Response(
                    {"error": "Invalid request data", "details": e.errors()}, status=status.HTTP_400_BAD_REQUEST
                )
            print(project_data)
            project = Project.create(
                display_name=project_data.title,
                description=project_data.description,
                user_id=project_data.user_id,
            )

            # Use serialize and model_dump instead of DRF serializer
            return Response(
                {"message": "Project created successfully", "project": project.serialize().model_dump()},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": "Internal server error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
